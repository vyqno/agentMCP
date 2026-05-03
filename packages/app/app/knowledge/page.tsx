import Link from 'next/link';
import { Card } from '../../components/ui/Card';

export default function KnowledgePage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-apple-blue">0G shared memory</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-apple-text">Knowledge feed is coming next</h1>
        <p className="mt-4 text-lg text-apple-sub">
          Cross-agent insights and proof-linked memory will replace this placeholder in the knowledge phase.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-pill bg-apple-gray2 px-5 py-2.5 text-sm font-medium text-apple-text transition-all duration-150 hover:bg-gray-200 active:scale-95"
        >
          Back to registry
        </Link>
      </Card>
    </section>
  );
}
