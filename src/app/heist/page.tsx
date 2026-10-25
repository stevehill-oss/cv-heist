import type { Metadata } from "next";
import { HeistGame } from "./HeistGame";

export const metadata: Metadata = {
  title: "Steal my CV",
  description: "Three clues. One locked vault. Find the weakness, crack the code and take the file.",
};

export default function HeistPage() {
  return <HeistGame />;
}
