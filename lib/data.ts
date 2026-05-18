// ─── Resume Data ────────────────────────────────────────────────────────────
// Single source of truth — synced with VeeraVDP-ReactNode.pdf (latest resume)

export const personal = {
  name: "Veera Palla",
  title: "Sr. React.js / Node.js Developer",
  tagline:
    "11+ years building scalable, high-performance full-stack applications with React 18, Next.js 15, Node.js, and AI integrations.",
  email: "veerapalla.work28@gmail.com",
  phone: "(989) 318-3683",
  location: "Michigan, USA",
  linkedin: "https://www.linkedin.com/in/veera-palla",
  medium: "https://medium.com/@veera.palla919",
  resumeUrl: "/resume.pdf",
} as const;

export const roles = [
  "Sr. React.js / Node.js Developer",
  "Full Stack Engineer",
  "AI & Cloud Integrations Expert",
  "Next.js / TypeScript Specialist",
];

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  tech: string[];
}

export const experiences: Experience[] = [
  {
    company: "Comerica Bank",
    role: "Sr. React / Node Developer",
    period: "Jun 2024 – Present",
    location: "Auburn Hills, MI",
    tech: [
      "React 18.3.2",
      "Next.js 15",
      "Node.js 21",
      "TypeScript",
      "Python",
      "FastAPI",
      "Flutter",
      "PostgreSQL",
      "Neo4j",
      "Kafka",
      "RabbitMQ",
      "AWS",
      "GCP",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "Prometheus",
      "Grafana",
    ],
    bullets: [
      "Developed scalable web and mobile applications using React 18.3.2, Next.js 15, Node.js 21, Python, FastAPI, and Flutter.",
      "Integrated AI-powered features into MERN applications using ChatGPT APIs and Retrieval-Augmented Generation (RAG) with MongoDB.",
      "Implemented real-time event-driven architectures using WebSockets, Kafka, RabbitMQ, and AWS Kinesis.",
      "Deployed containerised microservices on Kubernetes (K8s) across AWS and GCP with Jenkins and GitHub Actions CI/CD.",
      "Set up observability stacks with Prometheus and Grafana, reducing MTTR by 40 %.",
    ],
  },
  {
    company: "UCLA Health",
    role: "Sr. React / Node Developer",
    period: "Sep 2021 – May 2024",
    location: "Los Angeles, CA",
    tech: [
      "React 17",
      "Next.js 11",
      "Node.js 16",
      "Python",
      "FastAPI",
      "Nest.js",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "Neo4j",
      "AWS",
      "BigQuery",
      "Cypress",
      "Playwright",
    ],
    bullets: [
      "Built high-performance healthcare applications using React 17 / Next.js 11, Node.js 16, Python, and FastAPI, serving thousands of daily active users.",
      "Designed HIPAA-compliant databases for EMR/FHIR-based healthcare workflows using PostgreSQL and MongoDB.",
      "Built secure, governed APIs via Azure APIM with OAuth 2.0, JWT, and SSO authentication patterns.",
      "Architected GraphQL and REST API layers using Nest.js, improving query performance by 50 %.",
      "Delivered end-to-end automated test coverage with Cypress and Playwright, catching regressions before production.",
    ],
  },
  {
    company: "Dillard's",
    role: "MERN Stack Developer",
    period: "Nov 2018 – Aug 2021",
    location: "Little Rock, AR",
    tech: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "JavaScript",
      "Spring Boot",
      "Golang",
      "Redux",
      "JWT",
      "Azure",
      "AWS Lambda",
      "CloudWatch",
      "Webpack",
      "Jest",
      "Docker",
      "Jenkins",
    ],
    bullets: [
      "Developed MERN stack e-commerce applications with TypeScript / JavaScript and Next.js for server-side rendering.",
      "Built RESTful APIs with Node.js, Spring Boot (Hibernate), and Golang to power product catalogues and order management.",
      "Architected cloud infrastructure on Azure and AWS (Lambda, CloudWatch) to handle peak holiday traffic loads.",
      "Containerised services with Docker and automated deployments with Jenkins pipelines.",
      "Implemented JWT-based auth and role-based access control across multiple customer-facing portals.",
    ],
  },
  {
    company: "KeyBank",
    role: "Full Stack Developer",
    period: "Dec 2016 – Sep 2018",
    location: "Cleveland, OH",
    tech: [
      "Node.js",
      ".NET WebAPI",
      "Angular",
      "Vue.js",
      "Nuxt.js",
      "Vue Router",
      "MongoDB",
      "PostgreSQL",
      "RabbitMQ",
      "AWS EC2",
      "AWS S3",
      "AWS Lambda",
      "GraphQL",
    ],
    bullets: [
      "Optimised RESTful APIs using Node.js and .NET WebAPI; integrated RabbitMQ for asynchronous message processing.",
      "Built front-end banking dashboards using Angular, Vue.js, Vue Router, and Nuxt.js.",
      "Containerised microservices with Docker and deployed on AWS (EC2, S3, Lambda).",
      "Implemented GraphQL APIs to reduce over-fetching for complex nested financial data queries.",
      "Collaborated with security teams to enforce OWASP Top 10 compliance across all API surfaces.",
    ],
  },
  {
    company: "Foxconn",
    role: "UI / UX Developer",
    period: "Jun 2013 – Nov 2016",
    location: "India",
    tech: [
      "AngularJS",
      "Angular",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Bootstrap",
      "jQuery",
      "D3.js",
      "Sketch",
      "Figma",
      "Vue.js",
      "AJAX",
    ],
    bullets: [
      "Developed enterprise interfaces using AngularJS, Angular 2+, JavaScript, HTML5, CSS3, and Bootstrap.",
      "Created wireframes and high-fidelity mockups in Sketch and Figma, following WCAG accessibility guidelines.",
      "Integrated D3.js data visualisations for operational dashboards tracking manufacturing KPIs.",
      "Built responsive AJAX-driven UIs that improved operator efficiency by reducing manual reporting steps.",
    ],
  },
];

export interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  highlights: string[];
}

export const projects: Project[] = [
  {
    name: "AI-Powered Banking Assistant",
    description:
      "A production-grade conversational banking assistant built at Comerica Bank, leveraging RAG (Retrieval-Augmented Generation) and ChatGPT APIs to answer customer queries over internal financial data in real time.",
    tech: [
      "React 18",
      "Next.js 15",
      "Node.js 21",
      "FastAPI",
      "Python",
      "MongoDB",
      "AWS Bedrock",
      "Kafka",
      "WebSockets",
      "Docker",
      "K8s",
    ],
    github: "https://github.com/veera9999",
    highlights: [
      "Integrated ChatGPT APIs with a RAG pipeline over MongoDB vector embeddings for context-aware financial Q&A.",
      "Implemented real-time streaming responses via WebSockets with Kafka as the message backbone.",
      "Containerised the full stack with Docker and deployed on AWS EKS with Helm charts.",
      "Monitored latency and error rates via Prometheus + Grafana, achieving p95 < 350 ms.",
    ],
  },
  {
    name: "HIPAA-Compliant EMR Platform",
    description:
      "A healthcare Electronic Medical Records (EMR) platform built for UCLA Health, supporting FHIR-based workflows, secure patient data management, and real-time clinical dashboards.",
    tech: [
      "React 17",
      "Next.js 11",
      "Node.js 16",
      "Nest.js",
      "GraphQL",
      "PostgreSQL",
      "Neo4j",
      "Azure APIM",
      "OAuth 2.0",
      "Cypress",
      "Playwright",
    ],
    github: "https://github.com/veera9999",
    highlights: [
      "Designed HIPAA-compliant data schemas for EMR/FHIR workflows using PostgreSQL and Neo4j graph database.",
      "Built a Nest.js GraphQL API layer reducing over-fetching by 50 % compared to prior REST endpoints.",
      "Secured all API surfaces with OAuth 2.0, JWT, and SSO via Azure APIM.",
      "Achieved 90 %+ E2E test coverage using Cypress and Playwright across critical patient workflows.",
    ],
  },
];

export interface SkillCategory {
  label: string;
  icon: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Front-End",
    icon: "Monitor",
    skills: [
      "React.js 18",
      "Next.js 15",
      "Angular 2+",
      "Vue.js / Nuxt.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "Redux / Zustand",
      "React Query",
      "HTML5 / CSS3",
      "TailwindCSS",
      "Material-UI",
      "Bootstrap",
    ],
  },
  {
    label: "Back-End",
    icon: "Server",
    skills: [
      "Node.js 19/21",
      "Express.js",
      "Nest.js",
      "Next.js APIs",
      "FastAPI (Python)",
      "Spring Boot",
      ".NET WebAPI",
      "Golang",
      "GraphQL",
      "REST / gRPC",
      "WebSockets",
    ],
  },
  {
    label: "AI & GenAI",
    icon: "Sparkles",
    skills: [
      "AWS Bedrock",
      "Google Vertex AI",
      "Gemini AI",
      "ChatGPT APIs",
      "RAG Pipelines",
      "TensorFlow.js",
      "LangChain",
    ],
  },
  {
    label: "Cloud & DevOps",
    icon: "Cloud",
    skills: [
      "AWS (Lambda, EC2, EKS, S3, SageMaker, Bedrock, Glue, Athena)",
      "GCP (Vertex AI, BigQuery, GKE, Pub/Sub)",
      "Azure (APIM, ACR, Eventhub, ADF, Synapse)",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub Actions",
      "Terraform",
    ],
  },
  {
    label: "Databases",
    icon: "Database",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "Neo4j",
      "DynamoDB",
      "CosmosDB",
      "Redis",
      "Apache Cassandra",
      "DrizzleORM",
      "Hibernate",
    ],
  },
  {
    label: "Testing & APIs",
    icon: "TestTube2",
    skills: [
      "Jest",
      "Cypress",
      "Playwright",
      "Mocha / Chai",
      "Selenium",
      "React Testing Library",
      "JUnit / Mockito",
      "Swagger / Postman",
      "SoapUI",
    ],
  },
  {
    label: "Messaging & Monitoring",
    icon: "Zap",
    skills: [
      "Kafka",
      "RabbitMQ",
      "AWS Kinesis",
      "Pub/Sub",
      "Prometheus",
      "Grafana",
      "Datadog",
      "Splunk",
      "Sentry",
      "CloudWatch",
    ],
  },
];

export interface Certification {
  title: string;
  issuer: string;
  badge: string;
}

export const certifications: Certification[] = [
  {
    title: "OpenJS Node.js Services Developer",
    issuer: "OpenJS Foundation",
    badge: "NODE",
  },
  {
    title: "React Developer Certified (Level 2)",
    issuer: "Credly / React Training",
    badge: "REACT",
  },
];

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  year: number;
}

export const education: Education = {
  degree: "Bachelor of Technology",
  field: "Computer Science & Engineering",
  institution: "Lovely Professional University",
  location: "Jalandhar, Punjab",
  year: 2013,
};
