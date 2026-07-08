// lib/data.ts — single source of truth, synced from the resume PDF in /public.
// (Veera_Palla_Resume_FSJ_upd5.pdf)

export const personal = {
  name: 'Veera Palla',
  nameJp: 'ヴィーラ・パッラ',
  role: 'Full-Stack Developer',
  roleJp: 'フルスタック開発者',
  email: 'veerapalla8@gmail.com',
  phone: '847-542-6690',
  linkedin: 'https://www.linkedin.com/in/veera-palla',
  location: 'United States',
  resumeUrl: '/Veera_Palla_Resume_FSJ_upd5.pdf',
  tagline:
    'Around 4 years building scalable, high-performance applications with React, TypeScript, Java 17, Spring Boot and microservices — across retail, airline and e-commerce.',
} as const;

export const summary = [
  'Full-stack developer focused on SPAs and event-driven systems: modular React front-ends on top of secure, fault-tolerant Spring Boot microservices.',
  'Front-end: React, Redux Toolkit, React Query, TypeScript, Tailwind, Material UI and micro frontends — maintainable, accessible interfaces with measurably faster page loads.',
  'Back-end: Java 17, Spring Boot, Spring Data JPA and Hibernate — RESTful and GraphQL services hardened with Feign, Resilience4j and gRPC over PostgreSQL, MySQL, Oracle and MongoDB.',
  'Cloud: AWS first (EC2, EKS, Lambda, API Gateway, S3, RDS, SQS/SNS, CloudWatch, Bedrock) with working GCP exposure, plus Docker, Kubernetes, Helm and Terraform.',
] as const;

export const stats = [
  { value: '4+', label: 'years in production', jp: '経験年数' },
  { value: '3,000', label: 'requests/sec handled at peak', jp: '秒間リクエスト' },
  { value: '80%', label: 'verified test-coverage baseline', jp: 'テスト網羅率' },
  { value: '3', label: 'domains: retail · airline · e-commerce', jp: '業界' },
] as const;

export interface SkillCategory { label: string; jp: string; skills: string[] }

export const skillCategories: SkillCategory[] = [
  {
    label: 'Frontend', jp: 'フロント',
    skills: ['React.js', 'Next.js', 'Redux Toolkit', 'Redux-Saga', 'React Query', 'React Router', 'Context API', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SCSS', 'Tailwind CSS', 'Material UI', 'Bootstrap', 'Micro Frontends', 'Storybook', 'Formik', 'Axios'],
  },
  {
    label: 'Backend', jp: 'バック',
    skills: ['Java 8/11/17', 'Spring Boot', 'Spring MVC', 'Spring Data JPA', 'Spring Security', 'Hibernate', 'REST APIs', 'GraphQL', 'gRPC', 'Feign', 'Resilience4j', 'Microservices', 'Lombok', 'MapStruct', 'Actuator'],
  },
  {
    label: 'Databases', jp: 'データ',
    skills: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'DynamoDB', 'Elasticsearch'],
  },
  {
    label: 'Caching', jp: 'キャッシュ',
    skills: ['Redis', 'HTTP caching', 'React Query cache', 'Spring Cache'],
  },
  {
    label: 'Messaging', jp: 'メッセージ',
    skills: ['Apache Kafka', 'RabbitMQ', 'AWS SQS', 'AWS SNS'],
  },
  {
    label: 'Cloud', jp: 'クラウド',
    skills: ['AWS EC2', 'EKS', 'ECS', 'Lambda', 'API Gateway', 'S3', 'RDS', 'SQS', 'SNS', 'IAM', 'CloudWatch', 'CodePipeline', 'Bedrock', 'GCP GKE', 'Cloud Run', 'Pub/Sub', 'BigQuery'],
  },
  {
    label: 'APIs & Security', jp: '安全',
    skills: ['RESTful APIs', 'GraphQL', 'WebSockets', 'OAuth 2.0', 'JWT', 'SSO', 'Swagger/OpenAPI'],
  },
  {
    label: 'Testing', jp: '試験',
    skills: ['React Testing Library', 'Jest', 'Cypress', 'MSW', 'JUnit', 'Mockito', 'REST Assured', 'SonarQube', 'Postman'],
  },
  {
    label: 'DevOps & Build', jp: '運用',
    skills: ['Docker', 'Kubernetes', 'Helm', 'Terraform', 'Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'Maven', 'Gradle', 'Nexus', 'Webpack', 'Vite'],
  },
  {
    label: 'Monitoring', jp: '監視',
    skills: ['Prometheus', 'Grafana', 'CloudWatch', 'Splunk'],
  },
  {
    label: 'AI Tools & IDEs', jp: '道具',
    skills: ['Claude Code', 'Codex', 'Cursor', 'GitHub Copilot', 'JIRA', 'Confluence', 'Git', 'IntelliJ IDEA', 'VS Code', 'Linux'],
  },
];

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  arc: string;        // manga arc title
  narration: string;  // the caption box that opens the arc's page
  sfx: string;        // the page's background sound effect
  current?: boolean;
  bullets: string[];
  tech: string[];
}

export const experiences: Experience[] = [
  {
    company: 'Walmart',
    role: 'Full-Stack Developer',
    period: 'Jul 2025 – Present',
    location: 'United States',
    arc: 'ARC III — THE CURRENT ARC',
    narration: 'PRESENT DAY. THE BIGGEST RETAILER ON THE PLANET. PEAK SEASON NEVER SLEEPS.',
    sfx: 'RUSH',
    current: true,
    bullets: [
      'Develop and maintain Java 17 / Spring Boot microservices powering core inventory and order-fulfillment platforms — resolving API scaling issues at peak windows of 3,000 requests/second.',
      'Built internal operational dashboards in React + TypeScript + Redux Toolkit; authored 15+ reusable UI components adopted by shared libraries to cut UI duplication.',
      'Integrated a fine-tuned internal LLM via AWS Bedrock into a Spring Boot service — async Bedrock Runtime client for long-running inference, parsing raw model output into structured JSON surfaced in a React interface.',
      'Configured Kafka consumers for inventory events with idempotent handling and dead-letter queues, eliminating data inconsistencies in high-volume streams.',
      'Feature lead for a sub-team of three during a major catalog-service rewrite; onboarded two junior engineers.',
      'Multi-layer caching with Redis + Spring Cache to shield PostgreSQL from redundant reads; Docker → EKS with Helm through the dev-to-prod pipeline.',
      'Rotating on-call for the fulfillment domain (CloudWatch, Grafana, Splunk); pushed coverage to a verifiable 80% baseline with JUnit, Mockito and RTL.',
      'Introduced feature flags and canary deployments — safer progressive rollouts, multiple production ships per week with fast rollback.',
    ],
    tech: ['React', 'Redux Toolkit', 'TypeScript', 'Java 17', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'GraphQL', 'OAuth 2.0', 'Docker', 'Kubernetes', 'Helm', 'AWS EKS', 'Bedrock', 'Jenkins', 'GitHub Actions', 'Grafana', 'Splunk'],
  },
  {
    company: 'Southwest Airlines',
    role: 'Software Developer II',
    period: 'Dec 2023 – May 2025',
    location: 'United States',
    arc: 'ARC II — TAKING FLIGHT',
    narration: 'DALLAS, 2023. THE LEGACY BOOKING SYSTEM CREAKS. SOMEONE HAS TO REWRITE IT MID-FLIGHT.',
    sfx: 'WHOOSH',
    bullets: [
      'Helped migrate legacy flight-booking and passenger-management workflows into modular Java 17 microservices on AWS EC2 and internal infra.',
      'Exposed microservice endpoints through AWS API Gateway with OAuth 2.0 + JWT authorization for the customer-facing web client.',
      'Rewrote legacy booking flows in React + TypeScript — async code-splitting and memoization dropped initial bundle sizes and visibly sped up interactions.',
      'Wired Resilience4j circuit breakers and Feign clients across services, preventing cascading timeouts during flight-notification backlogs.',
      'Standardized REST documentation with Swagger/OpenAPI as the bridge between backend engineering and external test squads.',
      'Decoupled email/SMS notification fan-out from flight transactions with RabbitMQ.',
      'Migrated parts of the passenger-management REST layer to GraphQL for mobile — less over-fetching, fewer round trips on hot screens.',
      'Debugged distributed latency spikes with CloudWatch traces down to inefficient Hibernate queries; on-call with Grafana + Prometheus.',
    ],
    tech: ['Java 17', 'Spring Boot', 'React', 'TypeScript', 'Feign', 'Resilience4j', 'RabbitMQ', 'Kafka', 'Redis', 'PostgreSQL', 'MongoDB', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Cypress', 'Grafana', 'Prometheus'],
  },
  {
    company: 'Flipkart',
    role: 'Software Engineer',
    period: 'Feb 2021 – Jun 2022',
    location: 'Bangalore, India',
    arc: 'ARC I — ORIGIN STORY',
    narration: 'BANGALORE, 2021. EVERY HERO STARTS IN A CHECKOUT FLOW.',
    sfx: 'CLACK',
    bullets: [
      'Built modular dashboards for the seller-facing management portal in React + Redux, turning layout designs into accessible screens.',
      'Developed Spring Boot endpoints for the core order-management domain with Hibernate over PostgreSQL.',
      'Owned the critical-issue queue — debugged race conditions in checkout transaction logic ahead of high-traffic sale events.',
      'Maintained Kafka event pipelines linking order entry, catalog validation and downstream shipping.',
      'Cut home-page asset weight ~20% with lazy loading and image optimizations for low-bandwidth networks.',
      'Kept Jenkins build scripts honest — automated test runs on every incoming commit.',
      'Partnered with UX to align the seller portal with WCAG across desktop and mobile.',
    ],
    tech: ['Java', 'Spring Boot', 'Hibernate', 'React', 'Redux', 'Redis', 'Kafka', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS EC2', 'S3', 'Jenkins', 'JUnit', 'Maven'],
  },
];

// boss battles — the resume's biggest verifiable wins, told as defeated bosses
export interface Boss {
  no: string;
  name: string;
  epithet: string;      // the boss's manga-style title
  desc: string;
  stat: string;
  statLabel: string;
  sfx: string;          // the finishing-blow sound effect
  color: 'blue' | 'red' | 'ink';
}

export const bosses: Boss[] = [
  {
    no: '01',
    name: 'PEAK TRAFFIC',
    epithet: 'THE 3,000-REQUEST STAMPEDE',
    desc: 'Inventory & order-fulfillment APIs buckling in peak windows. Scaled the services until the stampede broke against them.',
    stat: '3,000',
    statLabel: 'requests / second, held',
    sfx: 'RUMBLE',
    color: 'blue',
  },
  {
    no: '02',
    name: 'THE RAW MODEL',
    epithet: 'UNTAMED LLM OF BEDROCK',
    desc: 'A fine-tuned LLM speaking in raw text. Chained it to a Spring Boot service through the async Bedrock runtime — now it answers in structured JSON.',
    stat: 'LLM',
    statLabel: 'tamed, in production',
    sfx: 'ROAR',
    color: 'red',
  },
  {
    no: '03',
    name: 'THE RISKY RELEASE',
    epithet: 'FRIDAY-DEPLOY PHANTOM',
    desc: 'Fear of shipping. Slain with feature flags and canary deployments — progressive rollouts, instant rollback, multiple ships a week.',
    stat: '×N',
    statLabel: 'weekly prod deploys',
    sfx: 'SLASH',
    color: 'ink',
  },
  {
    no: '04',
    name: 'THE HEAVY BUNDLE',
    epithet: 'DEVOURER OF LOAD TIMES',
    desc: 'Bloated booking flows and heavy home pages. Cut down with code-splitting, memoization and lazy loading — assets dropped ~20%.',
    stat: '−20%',
    statLabel: 'asset weight',
    sfx: 'SNIP',
    color: 'blue',
  },
];

// the same work history, curated into the two sides of the seam
export interface SplitEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  headline: string;      // one-line what-this-arc-was
  current?: boolean;
  front: string[];       // the interface side
  back: string[];        // the system side
  seam: string[];        // cross-cutting: leadership, testing, docs
  tech: string[];
}

export const splitWork: SplitEntry[] = [
  {
    company: 'Walmart',
    role: 'Full-Stack Developer',
    period: 'Jul 2025 – Present',
    location: 'United States',
    headline: 'Inventory & order-fulfillment at peak-season scale.',
    current: true,
    front: [
      'Internal operational dashboards in React + TypeScript + Redux Toolkit — 15+ reusable components adopted by shared libraries.',
      'Bedrock LLM output surfaced in a team-facing React interface, raw model text parsed into structured JSON.',
      'Frontend tests with React Testing Library and Jest toward the verified 80% coverage baseline.',
    ],
    back: [
      'Java 17 / Spring Boot microservices behind inventory & order-fulfillment — API scaling resolved at 3,000 requests/second peaks.',
      'Kafka consumers with idempotent handling and dead-letter queues; Redis + Spring Cache layers shielding PostgreSQL.',
      'Docker images promoted to AWS EKS with Helm; feature flags and canary deployments for multiple weekly prod ships.',
    ],
    seam: [
      'Feature lead for a sub-team of three during a catalog-service rewrite; onboarded two junior engineers.',
      'Rotating on-call for the fulfillment domain — CloudWatch, Grafana, Splunk.',
    ],
    tech: ['React', 'TypeScript', 'Redux Toolkit', 'Java 17', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL', 'GraphQL', 'Docker', 'Kubernetes', 'Helm', 'AWS EKS', 'Bedrock', 'Grafana'],
  },
  {
    company: 'Southwest Airlines',
    role: 'Software Developer II',
    period: 'Dec 2023 – May 2025',
    location: 'United States',
    headline: 'Legacy booking, rebuilt mid-flight.',
    front: [
      'Legacy booking flows rewritten in React + TypeScript — async code-splitting and memoization dropped initial bundles, visibly faster interactions.',
      'Passenger-management endpoints migrated to GraphQL for the mobile client — less over-fetching, fewer round trips on hot screens.',
    ],
    back: [
      'Flight-booking and passenger workflows migrated into modular Java 17 microservices on AWS.',
      'AWS API Gateway with OAuth 2.0 + JWT authorization; Resilience4j circuit breakers and Feign clients ending cascade timeouts.',
      'RabbitMQ decoupled email/SMS fan-out from flight transactions; CloudWatch traces pinned latency spikes to Hibernate queries.',
    ],
    seam: [
      'Standardized Swagger/OpenAPI docs as the bridge between backend engineering and external test squads.',
      'On-call service health via Grafana + Prometheus dashboards.',
    ],
    tech: ['React', 'TypeScript', 'Java 17', 'Spring Boot', 'GraphQL', 'Feign', 'Resilience4j', 'RabbitMQ', 'Kafka', 'Redis', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'GCP', 'Cypress'],
  },
  {
    company: 'Flipkart',
    role: 'Software Engineer',
    period: 'Feb 2021 – Jun 2022',
    location: 'Bangalore, India',
    headline: 'Seller portal + order management for high-traffic sale events.',
    front: [
      'Seller-portal dashboards built in React + Redux from raw layout designs; WCAG accessibility aligned with UX across desktop and mobile.',
      'Lazy loading and image optimization cut home-page asset weight ~20% for low-bandwidth networks.',
    ],
    back: [
      'Spring Boot endpoints for the core order-management domain, Hibernate persistence over PostgreSQL.',
      'Kafka pipelines linking order entry, catalog validation and shipping; checkout race conditions debugged ahead of sale events.',
    ],
    seam: [
      'Owned the critical-issue queue; Jenkins test automation on every incoming commit.',
    ],
    tech: ['React', 'Redux', 'Java', 'Spring Boot', 'Hibernate', 'Kafka', 'Redis', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS EC2', 'Jenkins'],
  },
];

// skills, sorted by which side of the seam they live on
export const stackSides = {
  front: skillCategories.filter(c => ['Frontend'].includes(c.label)),
  back: skillCategories.filter(c => ['Backend', 'Databases', 'Messaging', 'Cloud', 'DevOps & Build', 'Monitoring'].includes(c.label)),
  seam: skillCategories.filter(c => ['APIs & Security', 'Testing', 'Caching', 'AI Tools & IDEs'].includes(c.label)),
};

export const education = {
  institution: 'University of Illinois Chicago (UIC)',
  degree: 'Master of Science',
  field: 'Management Information Systems',
  period: 'Aug 2022 – May 2024',
  location: 'Chicago, IL',
} as const;

export const domains = ['RETAIL', 'AIRLINE', 'E-COMMERCE'] as const;

// ── the human layer ─────────────────────────────────────────────────────────
// First-person voice, margin notes, and the things a template can't know.

export const now = {
  status: 'Open to full-stack roles',
  line: 'Shipping inventory and fulfillment services at Walmart. On-call this week.',
  reading: 'Designing Data-Intensive Applications (again — the Kafka chapters)',
  learning: 'Terraform, properly this time. And keeping my Java 21 notes current.',
} as const;

export const note = {
  heading: 'A note from me',
  paragraphs: [
    'I started in Bangalore in 2021, fixing race conditions in a checkout flow the night before a sale event. That taught me something I still believe: the interface is a promise, and the system is whether you keep it.',
    'Now I work on inventory and fulfillment at Walmart, where a bad deploy is measured in shelves. I like the weight of that. I like that the front-end I write is judged by whether a store associate can move faster, and the back-end I write is judged by whether it holds at 3,000 requests a second.',
    'I am equally comfortable arguing about React re-renders and about JPA fetch strategies. Most people pick a side. I never wanted to.',
  ],
  facts: [
    { k: 'Based in', v: 'United States (open to relocation)' },
    { k: 'First language of choice', v: 'Java — but TypeScript is where I think fastest' },
    { k: 'Tooling opinion', v: 'Feature flags before heroics. Always.' },
    { k: 'Debugging ritual', v: 'Read the deploy log before blaming the code' },
    { k: 'Non-negotiable', v: '80% coverage before the release pipeline runs' },
  ],
  signoff: 'Thanks for reading this far,',
} as const;

// handwritten annotations pinned to each role card
export const marginNotes: Record<string, string> = {
  Walmart: 'this one keeps me up at night — in a good way',
  'Southwest Airlines': 'rewriting a booking system while it’s flying — my favourite kind of hard',
  Flipkart: 'where I learned that race conditions don’t care about your deadline',
};

// ── the two-side router ─────────────────────────────────────────────────────
// Front-end lives in a light theme; back-end in a dark theme. The landing
// lets a visitor pick a discipline to walk through first.
export interface SideConfig {
  key: 'front' | 'back';
  theme: 'light' | 'dark';
  label: string;
  kicker: string;
  title: string;
  blurb: string;
  categories: string[];   // skillCategory labels to show on this side
  isDefault?: boolean;
}

export const sideConfig: Record<'front' | 'back', SideConfig> = {
  front: {
    key: 'front',
    theme: 'light',
    label: 'Front-End',
    kicker: 'The Interface',
    title: 'I build the half people touch.',
    blurb:
      'Interfaces that load fast, stay accessible and get out of the way — React and TypeScript, componentised so the whole team ships quicker.',
    categories: ['Frontend', 'Testing', 'APIs & Security'],
  },
  back: {
    key: 'back',
    theme: 'dark',
    label: 'Back-End',
    kicker: 'The System',
    title: 'I build the half that has to hold.',
    blurb:
      'Fault-tolerant services under real load — Java 17, Spring Boot, event streams, and the caching and deploy discipline that keeps them standing.',
    categories: ['Backend', 'Databases', 'Messaging', 'Caching', 'Cloud', 'DevOps & Build', 'Monitoring', 'APIs & Security'],
    isDefault: true,
  },
};

export const landing = {
  name: 'Veera Palla',
  role: 'Full-Stack Developer',
  line: 'I work both ends of the stack. Choose a side to walk through first.',
  frontTeaser: 'React · TypeScript · the pixels people actually touch',
  backTeaser: 'Java 17 · Spring Boot · the services that hold it up',
  hint: 'Back-end opens by default — press Enter or pick a door',
} as const;
