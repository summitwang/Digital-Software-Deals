"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  tag?: string;
  product_type?: string;
  sold_count?: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>🔥 Best Sellers</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginTop: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
            }}
          >
            <h3>{p.title}</h3>
            <p>{p.description}</p>

            <p style={{ color: "green", fontWeight: "bold" }}>
              ${p.price}
            </p>

            <Link
              href={`/payment?product=${encodeURIComponent(
                p.title
              )}&amount=${encodeURIComponent(String(p.price))}`}
              style={{
                display: "inline-block",
                background: "black",
                color: "white",
                padding: "10px 15px",
                borderRadius: 5,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Buy Now
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
