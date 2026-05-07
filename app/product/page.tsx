import Link from "next/link";

type Product = {
  id: string;
  title: string;
  price: string;
  productType: string;
  image: string;
  description: string;
  sales: number;
};

type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
};

async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  return res.json();
}

async function getReviews(): Promise<Review[]> {
  const res = await fetch("http://localhost:3000/api/reviews", {
    cache: "no-store",
  });

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  const reviews = await getReviews();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between mb-8">
          <Link href="/" className="text-blue-600">
            ← Back Home
          </Link>

          <Link href="/track" className="text-blue-600">
            Track Order
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Softcat Store</h1>
        <p className="text-slate-600 mb-8">
          Choose your product and complete payment with USDT TRC20.
        </p>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8">
            No products available.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => {
              const productReviews = reviews.filter(
                (review) => review.productId === product.id
              );

              const latestReviews = productReviews.slice(0, 2);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow p-5 border"
                >
                 {product.image ? (
  <Link href={`/products/${product.id}`}>
    <img
      src={product.image}
      className="w-full h-48 object-cover rounded-xl border mb-4"
    />
  </Link>
) : (
  <Link href={`/products/${product.id}`}>
    <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
      Product Image
    </div>
  </Link>
)}

                  <Link
  href={`/products/${product.id}`}
  className="font-bold text-lg mb-2 block hover:text-blue-600"
>
  {product.title}
</Link>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {product.description}
                  </p>

                  <p className="font-bold text-blue-600 mb-2">
                    {product.price}
                  </p>

                  <div className="flex justify-between text-sm text-slate-500 mb-4">
                    <span>Sold: {product.sales}</span>
                    <span>Reviews: {productReviews.length}</span>
                  </div>

                  {productReviews.length > 0 && (
                    <div className="border-t pt-4 mb-4 space-y-3">
                      <p className="font-semibold text-sm">Customer Reviews</p>

                      {latestReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-slate-50 border rounded-xl p-3 text-sm"
                        >
                          <p className="font-semibold">
                            {review.name} · {"★".repeat(review.rating)}
                          </p>

                          <p className="mt-1 text-slate-700">
                            {review.comment}
                          </p>

                          {review.mediaUrl && review.mediaType === "image" && (
                            <img
                              src={review.mediaUrl}
                              className="mt-2 w-28 border rounded-xl"
                            />
                          )}

                          {review.mediaUrl && review.mediaType === "video" && (
                            <video
                              src={review.mediaUrl}
                              controls
                              className="mt-2 w-40 border rounded-xl"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/payment?productId=${product.id}`}
                    className="block text-center bg-black text-white py-3 rounded-xl"
                  >
                    BUY NOW
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
