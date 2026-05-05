import Link from "next/link";

const products = [
  {
    id: "office-365",
    title: "Office 365 Account",
    desc: "Office apps + OneDrive cloud storage. Fast delivery after payment.",
    price: "19.99",
    tag: "Best Seller",
    sold: "2.3k sold",
  },
  {
    id: "windows-11-pro",
    title: "Windows 11 Pro Key",
    desc: "Activation key for Windows 11 Pro. Suitable for personal PC use.",
    price: "14.99",
    tag: "Hot Deal",
    sold: "1.8k sold",
  },
  {
    id: "adobe-autodesk",
    title: "Adobe / Autodesk Account",
    desc: "Subscription account service. Customer email may be required.",
    price: "29.99",
    tag: "Popular",
    sold: "980 sold",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="text-xl font-bold">Digital Software Deals</div>
        <div className="flex gap-5 text-sm">
          <Link href="/">Home</Link>
          <Link href="#products">Products</Link>
          <Link href="/track">Track Order</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-red-500 px-5 py-2 rounded-full text-sm font-bold mb-6">
              🔥 Today Deal Ends Soon
            </div>

            <h1 className="text-5xl font-extrabold mb-6">
              Digital Software Deals
            </h1>

            <p className="text-xl text-slate-200 mb-8">
              Windows, Office, Adobe and Autodesk products with fast delivery,
              order tracking and after-sales support.
            </p>

            <div className="flex gap-4">
              <a
                href="#products"
                className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-slate-200"
              >
                Shop Now
              </a>

              <Link
                href="/track"
                className="border border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-black"
              >
                Track Order
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-5">
              Why customers choose us
            </h2>
            <ul className="space-y-4 text-slate-100">
              <li>✅ Fast order processing</li>
              <li>✅ Multiple product types supported</li>
              <li>✅ Customer order tracking</li>
              <li>✅ Support after purchase</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 text-center">⚡ Fast Delivery</div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">🔒 Secure Payment</div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">⭐ Reviews</div>
        <div className="bg-white rounded-2xl shadow p-5 text-center">💬 Support</div>
      </section>

      <section id="products" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold">🔥 Best Sellers</h2>
          <Link href="#products" className="text-blue-600 font-semibold">
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border hover:shadow-2xl transition"
            >
              <div className="h-56 bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-5xl mb-4">💿</div>
                  <div className="text-xl font-bold">{product.title}</div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    {product.tag}
                  </span>
                  <span className="text-sm text-slate-500">{product.sold}</span>
                </div>

                <h3 className="text-xl font-bold mb-2">{product.title}</h3>

                <p className="text-slate-600 text-sm mb-5">
                  {product.desc}
                </p>

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm text-slate-400">Price</p>
                    <p className="text-3xl font-extrabold text-green-600">
                      ${product.price}
                    </p>
                  </div>
                  <div className="text-yellow-500 text-sm">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>

                <Link
                  href={`/payment?product=${encodeURIComponent(
                    product.title
                  )}&amount=${product.price}`}
                  className="block text-center bg-black text-white py-4 rounded-xl font-bold hover:bg-slate-800"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <a
        href="https://wa.me/"
        target="_blank"
        className="fixed right-6 bottom-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl"
      >
        💬
      </a>
    </main>
  );
}