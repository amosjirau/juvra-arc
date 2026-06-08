import { PostJobForm } from "@/components/post-job-form";

export default function PostJobPage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-4xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_20%_10%,rgba(52,211,153,0.15),transparent_22rem),radial-gradient(circle_at_85%_0%,rgba(168,85,247,0.12),transparent_22rem)]" />
      <div className="mb-8">
        <h1 className="font-display heading-gradient text-3xl font-semibold">Post a job</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a job and lock native Arc USDC into escrow in one transaction.
        </p>
      </div>
      <PostJobForm />
    </main>
  );
}
