import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Raghav Kachroo",
  EMAIL: "rkachroo@ucsd.edu",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 4,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Distributed systems and infrastructure engineer building AI-powered systems.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on distributed systems, observability, and AI engineering.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/Mister-Raggs",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/raghavkachroo",
  },
  {
    NAME: "leetcode",
    HREF: "https://leetcode.com/u/ragg04/",
  },
];

export const SKILLS = [
  // Languages
  "Python",
  "Go",
  "SQL",
  // Infra & Systems
  "Distributed Systems",
  "Observability",
  "Kubernetes",
  "Docker",
  // Data & Pipelines
  "Kafka",
  "Airflow",
  "Elasticsearch",
  // AI / ML
  "LLM Pipelines",
  "Agentic Systems",
  "LLM Evaluation",
  "RAG",
  "PyTorch",
  // Web & Cloud
  "FastAPI",
  "AWS",
];
