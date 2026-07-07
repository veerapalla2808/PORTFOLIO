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

export const education = {
  institution: 'University of Illinois Chicago (UIC)',
  degree: 'Master of Science',
  field: 'Management Information Systems',
  period: 'Aug 2022 – May 2024',
  location: 'Chicago, IL',
} as const;

export const domains = ['RETAIL', 'AIRLINE', 'E-COMMERCE'] as const;
