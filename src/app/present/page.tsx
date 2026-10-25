import type { Metadata } from "next";
import { Presenter } from "./Presenter";

export const metadata: Metadata = { title: "QR codes" };

export default function PresentPage() {
  return (
    <div className="px-4 pt-8 sm:pt-12">
      <p className="eyebrow mb-6 text-center">Hold up your phone. Let them scan.</p>
      <Presenter />
    </div>
  );
}
