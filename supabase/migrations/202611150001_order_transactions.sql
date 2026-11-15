-- 先在隔离环境核对现有表结构及重复订单/TxID，再执行。整个迁移失败时回滚。
begin;
create unique index if not exists orders_order_no_unique_v1 on public.orders(order_no);
create unique index if not exists orders_txid_unique_v1 on public.orders(lower(txid)) where txid is not null and txid <> '';
create table if not exists public.payment_events_v1 (
  payment_id text not null, status text not null, order_no text not null,
  received_at timestamptz not null default now(), primary key(payment_id,status)
);
alter table public.payment_events_v1 enable row level security;
revoke all on public.payment_events_v1 from public, anon, authenticated;

-- 行锁串行化同一订单；条件扣减串行化同一商品，所有写入在同一事务提交。
create or replace function public.apply_payment_v1(p_order text, p_payment text, p_invoice text, p_status text, p_amount numeric, p_currency text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare o public.orders%rowtype; p public.products%rowtype; n integer; prior_rank integer; next_rank integer;
begin
  perform pg_advisory_xact_lock(hashtext(coalesce(p_payment,'')));
  if exists(select 1 from public.payment_events_v1 where payment_id=p_payment and order_no<>p_order) then raise exception 'Payment reused'; end if;
  select * into strict o from public.orders where order_no=p_order for update;
  if o.payment_provider is distinct from 'nowpayments' or p_payment is null or p_payment='' or
    p_invoice is distinct from o.nowpayments_invoice_id::text or p_amount is distinct from o.amount or lower(p_currency) is distinct from 'usd' then
    raise exception 'Payment does not match order';
  end if;
  if coalesce(o.nowpayments_payment_id::text,'') <> '' and o.nowpayments_payment_id::text <> p_payment then raise exception 'Payment identity conflict'; end if;
  if p_status is null or p_status not in ('waiting','confirming','confirmed','sending','partially_paid','finished','failed','expired','refunded') then raise exception 'Unsupported payment status'; end if;
  insert into public.payment_events_v1(payment_id,status,order_no) values(p_payment,p_status,p_order) on conflict do nothing;
  get diagnostics n = row_count;
  if n=0 then
    if exists(select 1 from public.payment_events_v1 where payment_id=p_payment and status=p_status and order_no<>p_order) then raise exception 'Payment reused'; end if;
    return jsonb_build_object('duplicate',true);
  end if;
  -- 退款保持终态；支付成功后忽略旧通知，不覆盖人工交付状态及交付内容。
  prior_rank := case o.payment_status when 'finished' then 4 when 'sending' then 3 when 'confirmed' then 2 when 'confirming' then 1 else 0 end;
  next_rank := case p_status when 'finished' then 4 when 'sending' then 3 when 'confirmed' then 2 when 'confirming' then 1 else 0 end;
  if o.payment_status='refunded' or (prior_rank>next_rank and p_status<>'refunded') then return jsonb_build_object('ignored',true); end if;
  if p_status in ('confirmed','finished') and not coalesce(o.stock_deducted,false) then
    if o.quantity is null or o.quantity<1 or o.quantity<>trunc(o.quantity) then raise exception 'Invalid order quantity'; end if;
    select * into strict p from public.products where title=o.product and is_active=true;
    update public.products set stock=stock-o.quantity where id=p.id and stock>=o.quantity;
    get diagnostics n = row_count;
    if n<>1 then
      -- 已付款缺货：记录异常，不能把库存夹到 0 后假装已交付。
      update public.orders set payment_status=p_status, nowpayments_payment_id=p_payment, status=case when status in ('pending_verify','paid','problem') then 'problem' else status end where order_no=p_order;
      return jsonb_build_object('exception','paid_without_stock');
    end if;
    update public.orders set stock_deducted=true where order_no=p_order;
  end if;
  update public.orders set payment_status=p_status,nowpayments_payment_id=p_payment,
    status=case
      when p_status in ('confirmed','finished') and status='pending_verify' then 'paid'
      when p_status in ('failed','expired','refunded') and status in ('pending_verify','paid') then 'problem'
      else status end
    where order_no=p_order;
  return jsonb_build_object('success',true);
end $$;

create or replace function public.create_verified_order_v1(p_order jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare x public.orders%rowtype; p public.products%rowtype; result public.orders%rowtype; unit_price numeric; n integer;
begin
  x := jsonb_populate_record(null::public.orders,p_order);
  if x.quantity is null or x.quantity<1 or x.quantity>1000 or x.quantity<>trunc(x.quantity) or coalesce(x.txid,'')='' then raise exception 'Invalid order'; end if;
  select * into strict p from public.products where title=x.product and is_active=true for update;
  unit_price := coalesce(nullif(p.promo_price,0),p.price);
  if unit_price<=0 or x.amount is distinct from unit_price*x.quantity then raise exception 'Price changed'; end if;
  update public.products set stock=stock-x.quantity where id=p.id and stock>=x.quantity;
  get diagnostics n = row_count;
  if n<>1 then raise exception 'Not enough stock'; end if;
  insert into public.orders(user_id,order_no,product,amount,quantity,product_type,customer_name,customer_email,address,txid,payment_screenshot_url,status,stock_deducted,delivery_note)
    values(x.user_id,x.order_no,p.title,x.amount,x.quantity,p.product_type,x.customer_name,x.customer_email,x.address,lower(x.txid),x.payment_screenshot_url,'pending_verify',true,'Payment evidence received. Awaiting manual review.') returning * into result;
  return to_jsonb(result);
end $$;
revoke all on function public.apply_payment_v1(text,text,text,text,numeric,text) from public,anon,authenticated;
revoke all on function public.create_verified_order_v1(jsonb) from public,anon,authenticated;
grant execute on function public.apply_payment_v1(text,text,text,text,numeric,text) to service_role;
grant execute on function public.create_verified_order_v1(jsonb) to service_role;
commit;
