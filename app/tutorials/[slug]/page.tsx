import Link from "next/link";
import { getTutorialBySlug, tutorials } from "@/lib/tutorials";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return tutorials.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);

  if (!tutorial) {
    return {
      title: "Tutorial Not Found | SoftDealsHub",
    };
  }

  return {
    title: `${tutorial.title} | SoftDealsHub`,
    description: tutorial.description,
  };
}

export default async function TutorialDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);

  if (!tutorial) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold">
            SoftDealsHub
          </Link>

          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/">Home</Link>
            <Link href="/tutorials">Tutorials</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tutorials" className="text-blue-600 font-bold">
          ← Back to Tutorials
        </Link>

        <div className="mt-6 bg-white border rounded-3xl p-8 shadow">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {tutorial.category}
          </span>

          <h1 className="text-4xl font-extrabold mt-5 mb-4">
            {tutorial.title}
          </h1>

          <p className="text-slate-600 mb-6">{tutorial.description}</p>

          <p className="text-sm text-slate-400 mb-8">
            Updated: {tutorial.updatedAt}
          </p>

          <div className="space-y-5">
            {tutorial.content.map((step, index) => (
              <div key={index} className="border rounded-2xl p-5 bg-slate-50">
                <p className="font-extrabold text-emerald-600 mb-2">
                  Step {index + 1}
                </p>
                <p className="text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h2 className="text-xl font-extrabold mb-2">Need help?</h2>
            <p className="text-slate-600 mb-4">
              If you still have problems, please contact SoftDealsHub support
              with your order ID.
            </p>

            <Link
              href="/track"
              className="inline-block bg-emerald-500 text-black px-5 py-3 rounded-xl font-extrabold"
            >
              Track My Order
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
