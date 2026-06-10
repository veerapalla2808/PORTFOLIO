// ─── Resume Data ────────────────────────────────────────────────────────────
// Single source of truth — synced with VeeraVDP-ReactNode.pdf (updated resume)

export const personal = {
  name: "Veera Palla",
  title: "Sr. React.js / Node.js Developer",
  tagline:
    "11+ years building scalable, high-performance applications with React 18.3.2, Next.js 15, Node.js 19/21, TypeScript, Python, and GenAI/LLM integrations.",
  email: "veerapalla.work28@gmail.com",
  phone: "(989) 318-3683",
  location: "Michigan, USA",
  linkedin: "https://www.linkedin.com/in/veera-p-6097071b8/",
  medium: "https://medium.com/@veera.palla919",
  resumeUrl: "/resume.pdf",
  availability: "Available",
} as const;

export const roles = [
  "Sr. React.js / Node.js Developer",
  "Full Stack Engineer",
  "GenAI & LLM Integrations",
  "Cloud-Native Microservices",
];

// Headline stats derived from the resume
export const stats = [
  { value: "11+", label: "Years in the machine" },
  { value: "5", label: "Systems served" },
  { value: "3", label: "Clouds mastered" },
  { value: "2", label: "Certifications" },
] as const;

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
      "React 18.3.2", "TypeScript", "Next.js 15", "Node.js 21", "Nest.js",
      "Express.js", "Python", "FastAPI", "Spring Boot", "Flutter", "Electron.js",
      "PostgreSQL", "Neo4j", "Kafka", "RabbitMQ", "AWS", "GCP", "Docker",
      "Kubernetes", "Helm", "Jenkins", "GitHub Actions", "Prometheus", "Grafana",
    ],
    bullets: [
      "Developed scalable, high-performance web, desktop, and mobile applications using React.js 18.3.2, TypeScript, Next.js 15, Node.js 21, Nest.js, Express.js, Restify, Hapi, Sails, Python, FastAPI, Spring Boot/MVC, Hibernate, .NET WebAPI, Flutter, and Electron.js — delivering CRUD-based SPAs, transaction systems, and micro-frontend architectures with optimized latency and lazy loading.",
      "Built responsive, accessible, user-centric interfaces with TailwindCSS, Material-UI, Bootstrap, Foundation, Atomic Design, Figma, Balsamiq, and Storybook — implementing WCAG 2.1, Optimistic UI, and Core Web Vitals (LCP, CLS, INP) best practices across browsers and devices.",
      "Managed advanced state and asynchronous workflows using Redux Toolkit, RTK Query, Context API, Fetch API, and Axios — integrating RESTful, GraphQL, Twitter API, and CMS platforms with Swagger UI, Postman, and JOI schema validation.",
      "Designed enterprise-grade database and messaging architectures using PostgreSQL, MySQL, MongoDB/Mongoose, Neo4j, Prisma, DrizzleORM, SOLR, VectorDB, Redis/BullMQ, RabbitMQ, Kafka, and SQS — enabling DDD, event-driven workflows, retry logic, caching, and real-time WebSocket communication.",
      "Integrated advanced GenAI and LLM capabilities using RAG, ChatGPT, Claude, Cursor, Vertex AI, Gemini AI, AWS Bedrock, and SageMaker — shipping conversational AI, intelligent search, and AI-assisted enterprise workflows across MERN and cloud-native applications.",
      "Developed secure APIs and microservices with OAuth 2.0, JWT, OpenID Connect, and AWS IAM — implementing RBAC and enterprise security standards while supporting Nx monorepos, semantic versioning, Zero-Install workspace protocols, and NPM/Yarn 4.",
      "Leveraged cloud-native DevOps, IaC, and CI/CD using Docker, Kubernetes, GKE, multi-stage builds, Jenkins, GitHub Actions, AWS (Lambda, DynamoDB, Kinesis, CloudWatch, Athena, Glue, Bedrock, SageMaker), GCP (Pub/Sub, BigQuery, Stackdriver), and Grafana for scalable deployment and observability.",
      "Conducted BDD/TDD unit, integration, regression, and E2E testing with Jest, React Testing Library, Playwright, Cypress, Enzyme, Karma, Sinon, Supertest, and Istanbul within Agile/Scrum delivery.",
    ],
  },
  {
    company: "UCLA Health",
    role: "Sr. React / Node Developer",
    period: "Sep 2021 – May 2024",
    location: "Los Angeles, CA",
    tech: [
      "React 18", "Next.js 14", "Node.js 16", "Nest.js", "TypeScript", "Python",
      "Flask API", "Flutter", "Spring Boot", "GraphQL", "MongoDB", "PostgreSQL",
      "Neo4j", "VectorDB", "Kafka", "AWS", "Azure", "Docker", "Kubernetes",
      "Helm", "Cypress", "Playwright",
    ],
    bullets: [
      "Developed scalable, high-performance web and mobile applications using React.js 18, Next.js 14, Node.js 16, Nest.js, TypeScript, Python, Flask API, Flutter, Spring Boot/MVC, Hibernate, and .NET WebAPI — supporting SPA, SSR, micro-frontends, CMS-driven applications, and transactional systems with optimized rendering strategies.",
      "Built responsive and accessible UI/UX systems using TailwindCSS, Material UI, Bootstrap, CSS Architecture (BEM/Atomic Design), Figma, and Balsamiq — ensuring WCAG-compliant, mobile-first, cross-platform experiences.",
      "Managed complex state and data workflows with Redux, RTK Query, and Zustand — implementing CRUD operations and integrating REST, GraphQL, Twitter API, WebSocket, and microservice-based APIs documented via Swagger UI and Postman.",
      "Designed scalable data systems using PostgreSQL, MySQL, MongoDB (Mongoose), Neo4j, VectorDB, and Drizzle ORM — supporting high-volume transactional systems, graph-based modeling, real-time analytics pipelines, and GenAI-driven workflows.",
      "Built real-time, event-driven architectures using Kafka, RabbitMQ, WebSocket, AWS Kinesis, and Azure Event Hub — enabling low-latency streaming and distributed messaging for time-sensitive healthcare applications.",
      "Developed secure backend and enterprise APIs with Node.js, Nest.js, Express.js, Flask API, Spring Boot, and .NET Web API — implementing OAuth 2.0, JWT, RBAC, SSO, and HIPAA-compliant authentication with API gateway (APIM) integration.",
      "Implemented cloud-native DevOps, CI/CD, and IaC using Docker, Kubernetes, Helm, Azure DevOps, AWS (IAM, CloudWatch, Lambda, DynamoDB, S3, Athena, Glue, SageMaker, Bedrock), Azure (ACR, ADF, CDN, Blob Storage, CosmosDB), and Linux/Unix shell scripting.",
      "Performed end-to-end testing and Agile delivery using Jest, Mocha, Chai, Cypress, Playwright, and BDD/TDD — improving architecture, latency, and scalability with Nx monorepos and micro-frontend patterns.",
    ],
  },
  {
    company: "Dillard's",
    role: "MERN Stack Developer",
    period: "Nov 2018 – Aug 2021",
    location: "Little Rock, AR",
    tech: [
      "MongoDB", "Express.js", "React.js", "Node.js", "TypeScript", "Next.js",
      "React Native", "Redux", "Spring Boot", "Golang", "Python", "Flask API",
      "GraphQL", "Kafka", "RabbitMQ", "Azure", "AWS", "Docker", "Jenkins",
    ],
    bullets: [
      "Developed scalable, responsive web applications on the MERN stack (MongoDB, Express.js, React.js, Node.js) with TypeScript, JavaScript, and Next.js for server-side rendering, SEO optimization, and performance.",
      "Built and maintained RESTful APIs using Node.js, Express.js, Spring Boot (Hibernate), Golang, Python, and Flask API — implementing GraphQL for efficient, optimized data fetching.",
      "Designed reusable UI components with React.js, Redux, and React Hooks — improving UX across web and React Native (iOS & Android) applications.",
      "Implemented event-driven architecture using Kafka and RabbitMQ, enabling asynchronous processing and high-throughput system communication.",
      "Integrated third-party APIs including Twitter API, enhancing application functionality and external data integration.",
      "Architected and deployed cloud infrastructure on Microsoft Azure (App Services, AKS, Blob Storage, AD, Key Vault, Data Lake, CDN) and AWS (Lambda, CloudWatch, IAM) with proper access control and identity management.",
      "Developed backend microservices in Node.js, Spring Boot, Golang, and Python — JWT/OAuth authentication, Webpack/Vite optimization with lazy loading and code splitting, databases (MongoDB, PostgreSQL, Neo4j), and CI/CD with Jenkins, Docker, Jest, Mocha, Enzyme, and Selenium.",
    ],
  },
  {
    company: "KeyBank",
    role: "Full Stack Developer",
    period: "Dec 2016 – Sep 2018",
    location: "Cleveland, OH",
    tech: [
      "Node.js", ".NET WebAPI", "Angular", "Vue.js", "Vue Router", "Nuxt.js",
      "Express.js", "MongoDB", "PostgreSQL", "Mongoose", "RabbitMQ", "GraphQL",
      "AWS EC2", "AWS S3", "AWS Lambda", "CloudFront", "Docker", "Jenkins",
    ],
    bullets: [
      "Developed and optimized RESTful APIs using Node.js and .NET WebAPI — implementing CRUD operations and integrating RabbitMQ for asynchronous messaging between microservices.",
      "Built dynamic, responsive front-end applications using Angular, Vue.js, Vue Router, and Nuxt.js — smooth navigation, real-time updates, and SEO-friendly server-side rendering.",
      "Managed MongoDB and PostgreSQL databases — designing schemas, optimizing queries, and ensuring large-scale data handling for banking applications.",
      "Automated front-end builds and workflows with Grunt and Gulp; validated APIs with Postman to improve endpoint reliability.",
      "Implemented secure authentication and authorization using JWT and OAuth, protecting sensitive customer and transaction data.",
      "Containerized microservices with Docker, deployed on AWS (S3, EC2, Lambda, CloudFront), and set up Jenkins CI/CD pipelines for scalable, rapid releases.",
      "Ensured code quality through unit and integration testing (Mocha, Chai, Jest, Karma, Enzyme) within Agile sprint workflows.",
    ],
  },
  {
    company: "Foxconn",
    role: "UI / UX Developer",
    period: "Jun 2013 – Nov 2016",
    location: "India",
    tech: [
      "AngularJS", "Angular", "JavaScript", "HTML", "CSS3", "Bootstrap",
      "jQuery", "AJAX", "D3.js", "Sketch", "Figma", "Vue.js", "WCAG",
    ],
    bullets: [
      "Designed and developed responsive web and mobile interfaces using AngularJS, Angular, JavaScript, HTML, CSS3, Bootstrap, jQuery, and AJAX — seamless experiences across devices.",
      "Created wireframes, mockups, and prototypes with Sketch and Figma to validate user flows, collaborating closely with product managers, UX researchers, and engineers.",
      "Developed dynamic, reusable Angular components and services with Angular Router navigation — optimizing performance via lazy loading, OnPush change detection, caching, and AOT compilation.",
      "Integrated RESTful APIs and D3.js visualizations for efficient data handling and clear presentation of complex datasets.",
      "Ensured accessibility and usability per WCAG standards, with cross-browser and cross-device testing for consistent performance.",
      "Participated in Agile processes (standups, sprint planning, retrospectives) using Node.js, Git, Jira, VS Code, and Postman.",
    ],
  },
];

export interface Project {
  name: string;
  description: string;
  tech: string[];
  live?: string;
  highlights: string[];
}

export const projects: Project[] = [
  {
    name: "AI-Powered Banking Assistant",
    description:
      "A production-grade conversational banking assistant built at Comerica Bank — RAG over internal financial data with ChatGPT, Claude, AWS Bedrock, and SageMaker, answering customer queries in real time.",
    tech: [
      "React 18.3.2", "Next.js 15", "Node.js 21", "FastAPI", "Python",
      "MongoDB", "VectorDB", "AWS Bedrock", "SageMaker", "Kafka",
      "WebSockets", "Docker", "K8s",
    ],
    highlights: [
      "Built a RAG pipeline over vector embeddings (MongoDB/VectorDB) wiring ChatGPT, Claude, and Bedrock models for context-aware financial Q&A.",
      "Implemented real-time streaming responses via WebSockets with Kafka as the message backbone.",
      "Containerized the full stack with Docker and deployed on AWS EKS with Helm charts.",
      "Monitored latency and error rates via Prometheus + Grafana, achieving p95 < 350 ms.",
    ],
  },
  {
    name: "HIPAA-Compliant EMR Platform",
    description:
      "A healthcare Electronic Medical Records platform built for UCLA Health — FHIR-based workflows, secure patient data management, and real-time clinical dashboards.",
    tech: [
      "React 18", "Next.js 14", "Node.js 16", "Nest.js", "GraphQL",
      "PostgreSQL", "Neo4j", "VectorDB", "Azure APIM", "OAuth 2.0",
      "Cypress", "Playwright",
    ],
    highlights: [
      "Designed HIPAA-compliant data schemas for EMR/FHIR workflows using PostgreSQL and Neo4j graph modeling.",
      "Built a Nest.js GraphQL API layer reducing over-fetching by 50% versus prior REST endpoints.",
      "Secured all API surfaces with OAuth 2.0, JWT, RBAC, and SSO via Azure APIM.",
      "Achieved 90%+ E2E test coverage with Cypress and Playwright across critical patient workflows.",
    ],
  },
];

// ─── Skills — mirrors the TECHNICAL SKILLS table on the resume, plus the
// GenAI/LLM and messaging emphases from the professional summary. ────────────

export interface SkillCategory {
  label: string;
  icon: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Full-Stack",
    icon: "Layers",
    skills: [
      "React.js 18.3.2", "Vue.js", "Next.js 15/11", "Angular 2+", "AngularJS",
      "HTML5", "CSS3", "JavaScript (ES6+/ES7)", "TypeScript", "React Native",
      "Redux / Redux Toolkit", "React Query", "Zustand", "NgRx",
      "Material-UI (MUI)", "Ant Design", "Chakra UI", "Bootstrap",
      "Node.js 19/21", "Express.js", "Next.js APIs", "Nest.js", "FastAPI",
      "Python", "Spring Boot", ".NET WebAPI", "Golang",
    ],
  },
  {
    label: "GenAI & LLMs",
    icon: "Sparkles",
    skills: [
      "RAG Pipelines", "ChatGPT", "Claude", "AWS Bedrock", "SageMaker",
      "Vertex AI", "Gemini AI", "TensorFlow.js", "VectorDB", "GitHub Copilot",
    ],
  },
  {
    label: "Databases",
    icon: "Database",
    skills: [
      "MongoDB", "PostgreSQL", "Neo4j", "DynamoDB", "CosmosDB",
      "Apache Cassandra", "Redis", "Memcached", "DrizzleORM", "Hibernate",
    ],
  },
  {
    label: "Cloud Services",
    icon: "Cloud",
    skills: [
      "AWS (Lambda, EC2, EKS, Bedrock, Glue, Athena, SageMaker)",
      "GCP (Vertex AI, Gemini AI, Pub/Sub, BigQuery, GKE, Stackdriver)",
      "Azure (APIM, ACR, Event Hub, Azure DevOps, ADF, Synapse)",
    ],
  },
  {
    label: "APIs",
    icon: "Plug",
    skills: [
      "RESTful APIs", "GraphQL", "gRPC", "WebSockets", "OAuth 2.0", "JWT",
      "SSO", "Swagger UI",
    ],
  },
  {
    label: "Messaging & Streaming",
    icon: "Zap",
    skills: [
      "Kafka", "RabbitMQ", "AWS Kinesis", "GCP Pub/Sub", "Azure Event Hub",
      "SQS", "Redis / BullMQ",
    ],
  },
  {
    label: "Testing",
    icon: "TestTube2",
    skills: [
      "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Enzyme",
      "React Testing Library", "Playwright", "Postman", "SoapUI", "JUnit",
      "Jasmine", "Mockito",
    ],
  },
  {
    label: "UI/UX Tools",
    icon: "PenTool",
    skills: [
      "Figma", "Adobe XD", "Sketch", "Storybook", "Atomic Design", "BEM",
      "WCAG Compliance",
    ],
  },
  {
    label: "Build Tools",
    icon: "Wrench",
    skills: ["Webpack", "Babel", "Vite", "NPM", "Yarn", "PNPM", "Grunt", "Gulp"],
  },
  {
    label: "Monitoring & Debugging",
    icon: "Activity",
    skills: [
      "Prometheus", "Grafana", "CloudWatch", "Stackdriver", "LogRocket",
      "Splunk", "Sentry", "Datadog",
    ],
  },
  {
    label: "Agile Tools",
    icon: "Kanban",
    skills: ["JIRA", "Confluence", "Trello"],
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

export interface BlogPost {
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  url: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Beyond the Queue: Why Apache Kafka is the Beating Heart of Modern Architecture",
    date: "May 3, 2026",
    readTime: "7 min read",
    tags: ["Apache Kafka", "Architecture"],
    url: "https://medium.com/@veera.palla919/beyond-the-queue-why-apache-kafka-is-the-beating-heart-of-modern-architecture-a6f113f9ea4e",
  },
  {
    title: "DEVOPS and CI/CD Pipelines in a software development projects",
    date: "Sep 25, 2024",
    readTime: "4 min read",
    tags: ["DevOps", "CI/CD"],
    url: "https://medium.com/@veera.palla919/devops-and-ci-cd-pipelines-in-a-software-development-projects-b7e0bc995d77",
  },
  {
    title: "Software Testing",
    date: "Sep 25, 2024",
    readTime: "3 min read",
    tags: ["Testing", "Quality"],
    url: "https://medium.com/@veera.palla919/software-testing-559ee94af028",
  },
];
