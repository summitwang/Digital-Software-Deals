"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  tag: string;
  product_type?: string;
  sold_count: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        }
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🔥 Best Sellers</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
        marginTop: 20
      }}>
        {products.map(p => (
          <div key={p.id} style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 15
          }}>
            <img
              src={p.image_url || "https://via.placeholder.com/200"}
              style={{ width: "100%", borderRadius: 10 }}
            />

            <h3>{p.title}</h3>
            <p>{p.description}</p>

            <p style={{ color: "green", fontWeight: "bold" }}>
              ${p.price}
            </p>

            <button
              style={{
                background: "black",
                color: "white",
                padding: "10px 15px",
                borderRadius: 5
              }}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}