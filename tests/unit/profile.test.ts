import { describe, expect, it } from "vitest";
import { absoluteUrl, buildVCard, cvLabels, publicItems, releaseBlockers, type CandidateProfile } from "@/lib/profile";
import { candidate, site } from "@/content/candidate";

const ready: CandidateProfile = {
  ...candidate,
  name: "Alex Example",
  summary: "Summary.",
  linkedinUrl: "https://www.linkedin.com/in/alex-example/",
  skills: [{ name: "Threat modelling", status: "verified", source: "LinkedIn" }],
};

describe("profile content model", () => {
  it("current config is blocked from release until real details exist", () => {
    const blockers = releaseBlockers(candidate, site);
    expect(blockers).toContain("Candidate name is not set.");
    expect(blockers).toContain("LinkedIn URL is not set.");
  });

  it("a complete config passes", () => {
    expect(releaseBlockers(ready, { siteUrl: "https://example.github.io/cv-heist" })).toEqual([]);
  });

  it("rejects non-profile LinkedIn links and bad site URLs", () => {
    const b = releaseBlockers({ ...ready, linkedinUrl: "https://linkedin.com/company/x" }, { siteUrl: "http://x.com/" });
    expect(b.some((m) => m.includes("LinkedIn URL does not look"))).toBe(true);
    expect(b.some((m) => m.includes("https://"))).toBe(true);
  });

  it("placeholders never reach public lists", () => {
    const items = [
      { name: "Real", status: "verified" as const },
      { name: "Fake", status: "placeholder" as const },
    ];
    expect(publicItems(items).map((i) => i.name)).toEqual(["Real"]);
  });

  it("labels switch with CV status, routes do not", () => {
    expect(cvLabels(candidate).view).toBe("View Profile Preview");
    expect(cvLabels({ ...candidate, cvStatus: "complete" }).download).toBe("Download CV");
    expect(absoluteUrl({ siteUrl: "https://a.b" }, "/profile")).toBe("https://a.b/profile/");
    expect(absoluteUrl({ siteUrl: null }, "/profile")).toBeNull();
  });

  it("vCard needs a name and escapes properly", () => {
    expect(buildVCard(candidate, null)).toBeNull();
    const card = buildVCard({ ...ready, name: "Alex de la Example" }, "https://a.b/profile/")!;
    expect(card).toContain("BEGIN:VCARD");
    expect(card).toContain("N:Example;Alex de la;;;");
    expect(card).toContain("URL;TYPE=LinkedIn:https://www.linkedin.com/in/alex-example/");
    expect(card.split("\r\n").at(-1)).toBe("END:VCARD");
  });
});
