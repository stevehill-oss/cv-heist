import type { Metadata } from "next";
import { HeistGame } from "./HeistGame";

export const metadata: Metadata = {
  title: "Steal my CV",
  description: "Three clues, one locked vault, one account. Find the weakness, crack the code, guess the password.",
};

export default function HeistPage() {
  return <HeistGame />;
}
