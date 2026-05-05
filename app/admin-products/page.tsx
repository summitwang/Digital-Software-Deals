"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProductType = "license_key" | "office365_account" | "subscription";

type Product = {
  id: string;
  title: string;
  price: string;
  productType: ProductType;
  image: string;
  description: string;
  sales: number;
  createdAt: string;
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

export default function AdminProductsPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("49.99 USDT");
  const [productType, setProductType] = useState<ProductType>("license_key");
  const [description, setDescription] = useState("");
  const [sales, setSales] = useState("0");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    const res = await fetch("/api/admin/check");
    const data = await res.json();

    setIsLogin(data.isLogin);
    setChecking(false);

    if (data.isLogin) {
      loadProducts();
      loadReviews();
    }
  }

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  async function loadReviews() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data);
  }

  async function uploadFile(file: File | null) {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.success) {
      alert("Upload failed.");
      return "";
    }

    return data.url;
  }

  async function addProduct() {
    if (!title.trim()) {
      alert("Please enter product title.");
      return;
    }

    const imageUrl = await uploadFile(file);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        price,
        productType,
        image: imageUrl,
        description,
        sales,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Product added.");
      setTitle("");
      setPrice("49.99 USDT");
      setProductType("license_key");
      setDescription("");
      setSales("0");
      setFile(null);
      await loadProducts();
    } else {
      alert("Add failed.");
    }
  }

  async function updateProduct(product: Product) {
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    const data = await res.json();

    if (data.success) {
      alert("Saved.");
      await loadProducts();
    } else {
      alert("Save failed.");
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Deleted.");
      await loadProducts();
      await loadReviews();
    } else {
      alert("Delete failed.");
    }
  }

  async function addReview(input: {
    productId: string;
    name: string;
    rating: string;
    comment: string;
    mediaFile: File | null;
  }) {
    if (!input.comment.trim()) {
      alert("Please enter review comment.");
      return;
    }

    let mediaUrl = "";
    let mediaType: "image" | "video" | "" = "";

    if (input.mediaFile) {
      mediaUrl = await uploadFile(input.mediaFile);

      if (input.mediaFile.type.startsWith("video/")) {
        mediaType = "video";
      } else {
        mediaType = "image";
      }
    }

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: input.productId,
        name: input.name,
        rating: input.rating,
        comment: input.comment,
        mediaUrl,
        mediaType,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Review added.");
      await loadReviews();
    } else {
      alert("Add review failed.");
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;

    const res = await fetch("/api/reviews", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Review deleted.");
      await loadReviews();
    } else {
      alert("Delete review failed.");
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!isLogin) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        Please login in Orders admin first.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between mb-6">
          <Link href="/orders" className="text-blue-600">
            ← Orders Admin
          </Link>

          <Link href="/products" className="text-blue-600">
            View Products
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Product Management</h1>

        <div className="bg-white rounded-2xl shadow p-6 mb-8 space-y-4">
          <h2 className="text-xl font-bold">Add Product</h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
            className="w-full p-3 border rounded-xl"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="w-full p-3 border rounded-xl"
          />

          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="license_key">Windows / Office Key</option>
            <option value="office365_account">Office 365 Account</option>
            <option value="subscription">Adobe / Autodesk Subscription</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-3 border rounded-xl"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
            className="w-full p-3 border rounded-xl min-h-24"
          />

          <input
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            placeholder="Sales count"
            className="w-full p-3 border rounded-xl"
          />

          <button
            onClick={addProduct}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Add Product
          </button>
        </div>

        <div className="space-y-6">
          {products.map((product) => (
            <ProductEditor
              key={product.id}
              product={product}
              reviews={reviews.filter((review) => review.productId === product.id)}
              onSave={updateProduct}
              onDelete={deleteProduct}
              onAddReview={addReview}
              onDeleteReview={deleteReview}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function ProductEditor({
  product,
  reviews,
  onSave,
  onDelete,
  onAddReview,
  onDeleteReview,
}: {
  product: Product;
  reviews: Review[];
  onSave: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddReview: (input: {
    productId: string;
    name: string;
    rating: string;
    comment: string;
    mediaFile: File | null;
  }) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState<Product>(product);

  const [reviewName, setReviewName] = useState("Customer");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMediaFile, setReviewMediaFile] = useState<File | null>(null);

  async function submitReview() {
    await onAddReview({
      productId: current.id,
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      mediaFile: reviewMediaFile,
    });

    setReviewName("Customer");
    setReviewRating("5");
    setReviewComment("");
    setReviewMediaFile(null);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-5">
      <div className="flex justify-between gap-4">
        <div>
          <p className="font-bold">{current.id}</p>
          <p className="text-sm text-slate-500">{current.createdAt}</p>
        </div>

        <button
          onClick={() => onDelete(current.id)}
          className="bg-red-500 text-white px-4 py-2 rounded-xl"
        >
          Delete Product
        </button>
      </div>

      {current.image && (
        <img src={current.image} className="w-40 border rounded-xl" />
      )}

      <input
        value={current.title}
        onChange={(e) => setCurrent({ ...current, title: e.target.value })}
        className="w-full p-3 border rounded-xl"
      />

      <input
        value={current.price}
        onChange={(e) => setCurrent({ ...current, price: e.target.value })}
        className="w-full p-3 border rounded-xl"
      />

      <select
        value={current.productType}
        onChange={(e) =>
          setCurrent({
            ...current,
            productType: e.target.value as ProductType,
          })
        }
        className="w-full p-3 border rounded-xl"
      >
        <option value="license_key">Windows / Office Key</option>
        <option value="office365_account">Office 365 Account</option>
        <option value="subscription">Adobe / Autodesk Subscription</option>
      </select>

      <input
        value={current.image}
        onChange={(e) => setCurrent({ ...current, image: e.target.value })}
        placeholder="Image URL"
        className="w-full p-3 border rounded-xl"
      />

      <textarea
        value={current.description}
        onChange={(e) =>
          setCurrent({ ...current, description: e.target.value })
        }
        className="w-full p-3 border rounded-xl min-h-24"
      />

      <input
        type="number"
        value={current.sales}
        onChange={(e) =>
          setCurrent({ ...current, sales: Number(e.target.value) })
        }
        className="w-full p-3 border rounded-xl"
      />

      <button
        onClick={() => onSave(current)}
        className="bg-blue-600 text-white px-5 py-3 rounded-xl"
      >
        Save Product
      </button>

      <div className="border-t pt-5 space-y-4">
        <h3 className="text-lg font-bold">Review Management</h3>

        <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
          <input
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            placeholder="Reviewer name"
            className="w-full p-3 border rounded-xl"
          />

          <select
            value={reviewRating}
            onChange={(e) => setReviewRating(e.target.value)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Review comment"
            className="w-full p-3 border rounded-xl min-h-24"
          />

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setReviewMediaFile(e.target.files?.[0] || null)}
            className="w-full p-3 border rounded-xl bg-white"
          />

          <button
            onClick={submitReview}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Add Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-sm text-slate-500">No reviews yet.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-xl p-4 bg-white">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {review.name} · {"★".repeat(review.rating)}
                    </p>
                    <p className="text-xs text-slate-500">{review.createdAt}</p>
                  </div>

                  <button
                    onClick={() => onDeleteReview(review.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-2 text-sm">{review.comment}</p>

                {review.mediaUrl && review.mediaType === "image" && (
                  <img
                    src={review.mediaUrl}
                    className="mt-3 w-40 border rounded-xl"
                  />
                )}

                {review.mediaUrl && review.mediaType === "video" && (
                  <video
                    src={review.mediaUrl}
                    controls
                    className="mt-3 w-64 border rounded-xl"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}