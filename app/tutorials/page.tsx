import Link from "next/link";
import { tutorials } from "@/lib/tutorials";

export const metadata = {
  title: "Tutorials & Help Center | SoftDealsHub",
  description:
    "Activation guides, payment tutorials, installation help and common issue solutions for SoftDealsHub customers.",
};

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold">
            SoftDealsHub
          </Link>

          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/">Home</Link>
            <Link href="/#products">Products</Link>
            <Link href="/tutorials">Tutorials</Link>
            <Link href="/track">Track Order</Link>
            <Link href="/account">My Account</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold mb-4">
          Tutorials & Help Center
        </h1>

        <p className="text-slate-600 mb-10 max-w-2xl">
          Find activation guides, installation tutorials, payment instructions
          and common issue solutions.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {tutorials.map((item) => (
            <Link
              key={item.slug}
              href={`/tutorials/${item.slug}`}
              className="bg-white border rounded-3xl p-6 shadow hover:shadow-xl transition"
            >
              <div className="flex justify-between mb-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  {item.category}
                </span>

                <span className="text-sm text-slate-400">
                  {item.updatedAt}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold mb-3">{item.title}</h2>

              <p className="text-slate-600">{item.description}</p>

              <p className="mt-5 font-bold text-emerald-600">Read Guide →</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
