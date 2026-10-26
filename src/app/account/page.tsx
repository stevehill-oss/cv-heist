import type { Metadata } from "next";
import { AccountPortal } from "./AccountPortal";

export const metadata: Metadata = {
  title: "Account sign-in",
  description: "A locked account. The password hint is a riddle.",
};

export default function AccountPage() {
  return <AccountPortal />;
}
