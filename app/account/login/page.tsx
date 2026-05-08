"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/account");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white border rounded-3xl p-8 shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6">Customer Login</h1>

        <input
          className="w-full border p-4 rounded-xl mb-4"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-4 rounded-xl mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-slate-600 mt-5">
          No account yet?{" "}
          <Link href="/account/register" className="text-blue-600 font-bold">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
