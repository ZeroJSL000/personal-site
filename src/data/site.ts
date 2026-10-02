export const site = {
  name: "Shanglin Jiang",
  role: "Quantitative research · data systems · applied AI",
  tagline: "I build quantitative systems, then test where their evidence breaks.",
  school: "Southern University of Science and Technology",
  major: "Data Science and Big Data Technology",
  email: "12311205@mail.sustech.edu.cn",
  github: "https://github.com/ZeroJSL000",
  /** Empty until a separate public CV PDF is prepared; Footer/About hide the link. */
  cvHref: "",
  description:
    "Shanglin Jiang is a data science undergraduate at SUSTech working across quantitative research, evidence-driven financial analysis, and applied AI systems.",
} as const;

export const nav = [
  { href: "/projects", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "Profile" },
] as const;

export const homeFeatured = [
  { id: "minute-factor", kicker: "01 / Quant research" },
  { id: "fund-research", kicker: "02 / Investment research" },
  { id: "cuedata", kicker: "03 / Applied AI" },
];
