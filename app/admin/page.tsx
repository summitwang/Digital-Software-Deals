"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.success) {
      setLoggedIn(true);
    } else {
      alert("Wrong password");
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-white/10 p-8 rounded-2xl">
          <h2 className="text-2xl mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Password"
            className="p-2 w-full text-black mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-white text-black px-4 py-2 w-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-10">后台登录成功（下一步继续做功能）</div>;
}