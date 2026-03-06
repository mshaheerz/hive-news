import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Jaurnalist
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          AI-powered news platform. Real-time reporting by artificial journalists.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/feed"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Read News
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg glass-card text-[var(--text-primary)] font-semibold hover:glow-purple transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
