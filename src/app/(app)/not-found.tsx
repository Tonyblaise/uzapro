import Link from "next/link";

export default function NotFound() {
  return (
    <div className="type-body rounded-md bg-surface p-8 text-center text-text-muted">
      That page does not exist. <Link href="/dashboard">Go to the dashboard</Link>
    </div>
  );
}
