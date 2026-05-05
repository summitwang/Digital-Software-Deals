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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const products = await getProducts();
  const reviews = await getReviews();

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/products" className="text-blue-600">
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const productReviews = reviews.filter(
    (review) => review.productId === product.id
  );

  const averageRating =
    productReviews.length > 0
      ? (
          productReviews.reduce((sum, review) => sum + review.rating, 0) /
          productReviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between mb-8">
          <Link href="/products" className="text-blue-600">
            ← Back to Products
          </Link>

          <Link href="/track" className="text-blue-600">
            Track Order
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 grid md:grid-cols-2 gap-8">
          <div>
            {product.image ? (
              <img
                src={product.image}
                className="w-full rounded-2xl border"
                alt={product.title}
              />
            ) : (
              <div className="w-full h-96 bg-slate-100 rounded-2xl flex items-center justify-center">
                Product Image
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-sm">
              <div className="bg-slate-50 border rounded-xl p-3">
                Instant Delivery
              </div>
              <div className="bg-slate-50 border rounded-xl p-3">
                Secure Payment
              </div>
              <div className="bg-slate-50 border rounded-xl p-3">
                Support Included
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                HOT
              </span>
              <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                Best Seller
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-3">{product.title}</h1>

            <div className="flex gap-4 text-sm text-slate-600 mb-4">
              <span>⭐ {averageRating}</span>
              <span>{productReviews.length} Reviews</span>
              <span>{product.sales} Sold</span>
            </div>

            <p className="text-3xl font-bold text-blue-600 mb-6">
              {product.price}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm leading-6">
              <p className="font-semibold mb-2">Why buy from us?</p>
              <p>✓ Fast order processing</p>
              <p>✓ Manual payment verification</p>
              <p>✓ Order tracking available</p>
              <p>✓ Support available after purchase</p>
            </div>

            <p className="text-slate-700 leading-7 mb-8 whitespace-pre-line">
              {product.description}
            </p>

            <Link
              href={`/payment?productId=${product.id}`}
              className="block text-center bg-black text-white px-8 py-4 rounded-xl font-bold text-lg mb-4"
            >
              BUY NOW
            </Link>

            <Link
              href="/track"
              className="block text-center border border-slate-300 px-8 py-3 rounded-xl"
            >
              Track Existing Order
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>

            <div className="text-right">
              <p className="text-xl font-bold">⭐ {averageRating}</p>
              <p className="text-sm text-slate-500">
                {productReviews.length} reviews
              </p>
            </div>
          </div>

          {productReviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet.</p>
          ) : (
            <div className="space-y-5">
              {productReviews.map((review) => (
                <div key={review.id} className="border rounded-2xl p-5">
                  <div className="flex justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold">
                        {review.name} · {"★".repeat(review.rating)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {review.createdAt}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-3">{review.comment}</p>

                  {review.mediaUrl && review.mediaType === "image" && (
                    <img
                      src={review.mediaUrl}
                      className="w-60 border rounded-xl"
                      alt="Review image"
                    />
                  )}

                  {review.mediaUrl && review.mediaType === "video" && (
                    <video
                      src={review.mediaUrl}
                      controls
                      className="w-80 border rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}