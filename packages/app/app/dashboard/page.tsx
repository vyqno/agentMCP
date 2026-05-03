import Link from 'next/link';
import { Card } from '../../components/ui/Card';

export default function DashboardPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-apple-blue">Owner console</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-apple-text">Dashboard is coming next</h1>
        <p className="mt-4 text-lg text-apple-sub">
          Earnings, sentinel status, and owner controls will replace this placeholder in the dashboard phase.
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
