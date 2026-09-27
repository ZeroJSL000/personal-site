import { getCollection } from "astro:content";
import { homeFeatured } from "../data/site";

export type FeaturedCard = {
  href: string;
  kicker: string;
  title: string;
  summary: string;
  question: string;
  meta: string;
  status: string;
  tags: string[];
  metrics: Array<{ value: string; label: string }>;
};

export async function getFeaturedCards(): Promise<FeaturedCard[]> {
  const projects = await getCollection("project");

  return homeFeatured.map((item) => {
    const entry = projects.find((project) => project.id === item.id);
    if (!entry) throw new Error(`Missing featured project: ${item.id}`);

    return {
      href: `/projects/${entry.id}`,
      kicker: item.kicker,
      title: entry.data.title,
      summary: entry.data.summary,
      question: entry.data.question,
      meta: `${entry.data.context} · ${entry.data.dates}`,
      status: entry.data.status,
      tags: entry.data.tags,
      metrics: entry.data.metrics.slice(0, 2).map(({ value, label }) => ({ value, label })),
    };
  });
}
