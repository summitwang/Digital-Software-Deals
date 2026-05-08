"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Please check your email to confirm.");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white border rounded-3xl p-8 shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6">Create Account</h1>

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
          onClick={register}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-sm text-slate-600 mt-5">
          Already have an account?{" "}
          <Link href="/account/login" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
