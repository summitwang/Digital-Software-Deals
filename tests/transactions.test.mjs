import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role;
create table products(id serial primary key,title text,stock integer,price numeric,promo_price numeric,product_type text,is_active boolean);
create table orders(id serial primary key,user_id uuid,order_no text,product text,amount numeric,quantity integer,product_type text,customer_name text,customer_email text,address text,txid text,payment_screenshot_url text,status text,stock_deducted boolean,delivery_note text,payment_provider text,payment_status text,nowpayments_payment_id text,nowpayments_invoice_id text,license_key text,error_code text,installation_id text,confirmation_id text,account_email text,account_password text,tutorial_link text);
insert into products(title,stock,price,product_type,is_active) values('Test',2,10,'key',true);`);
await db.exec(await readFile(new URL('../supabase/migrations/202611150001_order_transactions.sql',import.meta.url),'utf8'));
const manual=(no,tx,amount=10)=>db.query('select create_verified_order_v1($1::jsonb)',[JSON.stringify({order_no:no,txid:tx,product:'Test',product_ref:'1',amount,quantity:1})]);
const stock=async()=>Number((await db.query('select stock from products')).rows[0].stock);
const event=(order,status='confirmed',payment='p1',amount=10)=>db.query('select apply_payment_v1($1,$2,$3,$4,$5,$6) result',[order,payment,'inv1',status,amount,'usd']);
await test('manual order commits stock and awaits review',async()=>{await manual('m1','abc');assert.equal(await stock(),1);assert.equal((await db.query("select status from orders where order_no='m1'")).rows[0].status,'pending_verify');});
await test('duplicate TxID rolls inventory back',async()=>{await assert.rejects(manual('m2','ABC'));assert.equal(await stock(),1);});
await test('changed price rolls back',async()=>{await assert.rejects(manual('m3','new',1));assert.equal(await stock(),1);});
await db.exec("insert into orders(order_no,product,amount,quantity,status,stock_deducted,payment_provider,payment_status,nowpayments_invoice_id,delivery_note) values('n1','Test',10,1,'pending_verify',false,'nowpayments','waiting','inv1','private delivery');");
await test('payment amount mismatch leaves inventory untouched',async()=>{await assert.rejects(event('n1','confirmed','p1',1));assert.equal(await stock(),1);});
await test('payment applies exactly once across repeated and finished events',async()=>{await event('n1');assert.equal(await stock(),0);assert.equal((await event('n1')).rows[0].result.duplicate,true);await event('n1','finished');assert.equal(await stock(),0);});
await test('late notification preserves delivered status and delivery note',async()=>{await db.exec("update orders set status='key_sent' where order_no='n1'");await event('n1','waiting');const row=(await db.query("select * from orders where order_no='n1'")).rows[0];assert.equal(row.status,'key_sent');assert.equal(row.payment_status,'finished');assert.equal(row.delivery_note,'private delivery');});
await db.exec("insert into orders(order_no,product,amount,quantity,status,stock_deducted,payment_provider,payment_status,nowpayments_invoice_id) values('n2','Test',10,1,'pending_verify',false,'nowpayments','waiting','inv1');");
await test('payment cannot be reused on another order',async()=>await assert.rejects(event('n2','sending')));
await test('paid without stock becomes exception without negative stock',async()=>{assert.equal((await event('n2','confirmed','p2')).rows[0].result.exception,'paid_without_stock');assert.equal(await stock(),0);const row=(await db.query("select * from orders where order_no='n2'")).rows[0];assert.equal(row.stock_deducted,false);assert.equal(row.status,'problem');});
await test('refund followed by success never regresses refund',async()=>{await event('n1','refunded');await event('n1','sending');assert.equal((await db.query("select payment_status from orders where order_no='n1'")).rows[0].payment_status,'refunded');});
await test('anonymous role cannot execute transactional functions',async()=>{await db.exec('set role anon');await assert.rejects(event('n1'));await db.exec('reset role');});
await test('last item accepts only one of two competing submissions',async()=>{await db.exec('update products set stock=1');const results=await Promise.allSettled([manual('last1','tx-last1'),manual('last2','tx-last2')]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(await stock(),0);});
await test('stable product ID survives rename and duplicate titles',async()=>{
  await db.exec("update products set title='Renamed',stock=2 where id=1; insert into products(title,stock,price,is_active) values('Renamed',99,20,true)");
  await manual('renamed','tx-renamed');
  const row=(await db.query("select product,product_ref from orders where order_no='renamed'")).rows[0];
  assert.equal(row.product,'Renamed');assert.equal(row.product_ref,'1');
  assert.equal(Number((await db.query('select stock from products where id=2')).rows[0].stock),99);
});
await test('new orders without product ID are rejected',async()=>{
  await assert.rejects(db.query('select create_verified_order_v1($1::jsonb)',[JSON.stringify({order_no:'no-id',product:'Renamed',amount:10,quantity:1,txid:'none'})]));
});
await test('admin cannot deliver unpaid or stock-short order',async()=>{
  await assert.rejects(db.query("select update_order_delivery_v1('n2', '{\"status\":\"completed\"}')"));
});
await test('admin approval and repeated delivery do not deduct stock again',async()=>{
  const before=await stock();
  await db.query("select update_order_delivery_v1('m1', '{\"status\":\"paid\"}')");
  await db.query("select update_order_delivery_v1('m1', '{\"status\":\"key_sent\",\"license_key\":\"test-only\"}')");
  await db.query("select update_order_delivery_v1('m1', '{\"status\":\"key_sent\"}')");
  assert.equal(await stock(),before);
  assert.equal((await db.query("select license_key from orders where order_no='m1'")).rows[0].license_key,'test-only');
  await assert.rejects(db.query("select update_order_delivery_v1('m1', '{\"status\":\"paid\"}')"));
});
await db.close();
