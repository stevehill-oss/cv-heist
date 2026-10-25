import Link from "next/link";
import { ROUTES } from "@/lib/profile";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-24 text-center">
      <p className="eyebrow">Status 404</p>
      <h1 className="mt-4 text-4xl font-semibold">Nothing to steal here.</h1>
      <p className="mt-3 text-ink-2">That page does not exist. Try one of the two ways in.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.profile} className="btn btn-secondary">Professional Profile</Link>
        <Link href={ROUTES.heist} className="btn btn-primary">Start the heist</Link>
      </div>
    </div>
  );
}
