import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const metric = z.object({
  value: z.string(),
  label: z.string(),
  detail: z.string().optional(),
});

const processStep = z.object({
  number: z.string(),
  title: z.string(),
  body: z.string(),
});

const project = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    category: z.enum(["Quant research", "Investment research", "Applied AI", "Data systems"]),
    status: z.string(),
    role: z.string(),
    context: z.string(),
    dates: z.string(),
    summary: z.string(),
    featured: z.boolean().default(false),
    caseFormat: z.enum(["case", "study", "brief"]),
    order: z.number(),
    tags: z.array(z.string()),
    visual: z.enum([
      "factor-pipeline",
      "fund-audit",
      "analysis-agent",
      "regime-test",
      "graph-risk",
      "sft-audit",
      "analytics-audit",
      "domain-shift",
      "mapreduce",
      "exit-curve",
    ]).optional(),
    question: z.string(),
    challenge: z.string(),
    contributions: z.array(z.string()),
    process: z.array(processStep),
    metrics: z.array(metric),
    outcome: z.string(),
    limitation: z.string(),
    reflection: z.string(),
    repoUrl: z.url().optional(),
    relatedExperience: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/experience" }),
  schema: z.object({
    org: z.string(),
    role: z.string(),
    dates: z.string(),
    location: z.string(),
    lens: z.string(),
    summary: z.string(),
    contributions: z.array(z.string()),
    evidence: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number(),
    tags: z.array(z.string()),
    relatedProjects: z.array(z.string()).default([]),
  }),
});

export const collections = { project, experience };
