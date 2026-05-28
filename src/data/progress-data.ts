export type MilestoneStatus = "on-track" | "at-risk" | "delayed" | "done";

export const projects = [
  {
    id: "p1",
    name: "ai-migration-core",
    description: "ระบบ AI Pipeline หลักสำหรับ EJB -> JPA ด้วย LangGraph",
    platform: "github" as const,
    org: "rd-agent-imed-transform",
    status: "active",
    openIssues: 3,
    closedIssues: 14,
    stars: 0,
    branches: 7,
  },
  {
    id: "p2",
    name: "analytics",
    description: "Dashboard ติดตามผล migration, run details และ insight agent",
    platform: "github" as const,
    org: "rd-agent-imed-transform",
    status: "active",
    openIssues: 4,
    closedIssues: 11,
    stars: 0,
    branches: 5,
  },
  {
    id: "p3",
    name: "obsidian-brain",
    description: "Second Brain สำหรับ patterns, failures, decisions และ migration board",
    platform: "gitlab" as const,
    org: "rd-agent-imed-transform",
    status: "active",
    openIssues: 5,
    closedIssues: 7,
    stars: 0,
    branches: 4,
  },
  {
    id: "p4",
    name: "docker-infrastructure",
    description: "Infra stack: Postgres, Qdrant, Redis, Garage, OTel, Phoenix, ELK",
    platform: "gitlab" as const,
    org: "rd-agent-imed-transform",
    status: "active",
    openIssues: 2,
    closedIssues: 12,
    stars: 0,
    branches: 3,
  },
  {
    id: "p5",
    name: "rag-and-file-server",
    description: "RAG pipeline บน Qdrant + Garage S3 สำหรับ artifacts",
    platform: "github" as const,
    org: "rd-agent-imed-transform",
    status: "active",
    openIssues: 4,
    closedIssues: 8,
    stars: 0,
    branches: 4,
  },
];

export const milestones: {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  progress: number;
  status: MilestoneStatus;
}[] = [
  {
    id: "m1",
    projectId: "p1",
    title: "persistence:compileJava ผ่านใน poc_doctor",
    dueDate: "2026-05-28",
    progress: 100,
    status: "done",
  },
  {
    id: "m2",
    projectId: "p1",
    title: "รัน poc_doctor แบบเพิ่ม fix iterations ให้ tests_passed",
    dueDate: "2026-05-31",
    progress: 40,
    status: "at-risk",
  },
  {
    id: "m3",
    projectId: "p2",
    title: "Insight Agent panel เชื่อม FastAPI /chat จริง",
    dueDate: "2026-05-30",
    progress: 75,
    status: "on-track",
  },
  {
    id: "m4",
    projectId: "p5",
    title: "Index Obsidian notes เข้า brain-notes (Qdrant)",
    dueDate: "2026-06-02",
    progress: 35,
    status: "at-risk",
  },
  {
    id: "m5",
    projectId: "p5",
    title: "ทดสอบ download artifacts ผ่านหน้า /file-server",
    dueDate: "2026-06-03",
    progress: 30,
    status: "delayed",
  },
  {
    id: "m6",
    projectId: "p3",
    title: "ขยาย entity-playbooks ให้ครบ 8 persistence packages",
    dueDate: "2026-06-15",
    progress: 45,
    status: "on-track",
  },
  {
    id: "m7",
    projectId: "p4",
    title: "Garage S3 setup + bucket traces/langfuse เสร็จสมบูรณ์",
    dueDate: "2026-05-28",
    progress: 100,
    status: "done",
  },
  {
    id: "m8",
    projectId: "p1",
    title: "Phase 2 migrate persistence packages ที่เหลือ",
    dueDate: "2026-06-30",
    progress: 20,
    status: "on-track",
  },
  {
    id: "m9",
    projectId: "p1",
    title: "Phase 4 ลบ JNDI lookup จาก service/app layer",
    dueDate: "2026-07-20",
    progress: 10,
    status: "on-track",
  },
  {
    id: "m10",
    projectId: "p1",
    title: "Phase 5 เพิ่ม Flyway/Liquibase schema migration",
    dueDate: "2026-08-15",
    progress: 8,
    status: "on-track",
  },
];

export const velocityData = [
  { week: "W22", planned: 8, completed: 6 },
  { week: "W23", planned: 9, completed: 7 },
  { week: "W24", planned: 10, completed: 9 },
  { week: "W25", planned: 8, completed: 8 },
  { week: "W26", planned: 9, completed: 8 },
  { week: "W27", planned: 10, completed: 9 },
  { week: "W28", planned: 11, completed: 10 },
];

export const focusAllocation = [
  { name: "Pipeline & Agent", value: 34 },
  { name: "Infra & Observability", value: 23 },
  { name: "Analytics UI", value: 21 },
  { name: "Knowledge Base / RAG", value: 22 },
];

export const issueResolution = [
  { week: "W22", avgHours: 52 },
  { week: "W23", avgHours: 44 },
  { week: "W24", avgHours: 37 },
  { week: "W25", avgHours: 31 },
  { week: "W26", avgHours: 27 },
  { week: "W27", avgHours: 24 },
  { week: "W28", avgHours: 20 },
];

export const skillRadar = [
  { skill: "LangGraph", q1: 5, q2: 9 },
  { skill: "Spring Data JPA", q1: 4, q2: 8 },
  { skill: "Observability", q1: 5, q2: 9 },
  { skill: "Data Platform", q1: 6, q2: 8 },
  { skill: "AI Agent Design", q1: 5, q2: 9 },
  { skill: "Migration QA", q1: 4, q2: 7 },
];

// Real git commit activity: last 28 days (May 1–28 2026), across all repositories.
// Source: rd-agent-imed-transform (main) + r-d-insight-hub (dashboard).
export const commitActivity = [
  { day: "5/1",  commits: 0 },
  { day: "5/2",  commits: 0 },
  { day: "5/3",  commits: 0 },
  { day: "5/4",  commits: 0 },
  { day: "5/5",  commits: 0 },
  { day: "5/6",  commits: 0 },
  { day: "5/7",  commits: 2 },
  { day: "5/8",  commits: 0 },
  { day: "5/9",  commits: 0 },
  { day: "5/10", commits: 0 },
  { day: "5/11", commits: 0 },
  { day: "5/12", commits: 0 },
  { day: "5/13", commits: 0 },
  { day: "5/14", commits: 0 },
  { day: "5/15", commits: 0 },
  { day: "5/16", commits: 0 },
  { day: "5/17", commits: 0 },
  { day: "5/18", commits: 0 },
  { day: "5/19", commits: 5 },
  { day: "5/20", commits: 1 },
  { day: "5/21", commits: 11 },
  { day: "5/22", commits: 5 },
  { day: "5/23", commits: 0 },
  { day: "5/24", commits: 0 },
  { day: "5/25", commits: 8 },
  { day: "5/26", commits: 17 },
  { day: "5/27", commits: 11 },
  { day: "5/28", commits: 2 },
];

export const skillBank: { category: string; skills: string[] }[] = [
  {
    category: "AI Migration Core",
    skills: [
      "LangGraph StateGraph orchestration",
      "LangChain tool integration",
      "MigrationState schema design",
      "Fix-loop strategy",
      "Model policy and provider routing",
      "Agent outcome annotations",
    ],
  },
  {
    category: "Observability & Data",
    skills: [
      "OpenTelemetry tracing",
      "Phoenix session/span annotations",
      "Elasticsearch + Kibana APM",
      "PostgreSQL + Prisma",
      "Redis checkpointing",
      "Qdrant vector search",
    ],
  },
  {
    category: "Modernization & Delivery",
    skills: [
      "EJB 2.x CMP analysis",
      "Spring Data JPA refactoring",
      "Gradle compile troubleshooting",
      "SonarQube quality review",
      "Garage S3 artifact pipeline",
      "Next.js analytics dashboard",
    ],
  },
];

export const proficiencies: { skill: string; category: string; level: number }[] = [
  { skill: "LangGraph orchestration", category: "AI", level: 9 },
  { skill: "OTel + Phoenix", category: "Observability", level: 9 },
  { skill: "Spring Data JPA mapping", category: "Modernization", level: 8 },
  { skill: "Gradle diagnostics", category: "Build", level: 8 },
  { skill: "Prisma analytics model", category: "Data", level: 8 },
  { skill: "Qdrant RAG indexing", category: "RAG", level: 7 },
  { skill: "Garage S3 integration", category: "Infra", level: 8 },
  { skill: "Multi-provider LLM routing", category: "AI", level: 9 },
];

export const notes = [
  {
    id: "n1",
    template: "performance" as const,
    impact: "high" as const,
    state: "deployed" as const,
    title: "สรุปสถานะโครงการ: compile persistence ผ่านและ pipeline พร้อมใช้งาน",
    date: "2026-05-28",
    summary: [
      "LangGraph pipeline 7 agents ทำงานครบพร้อม fix-loop",
      "แก้ OOM ใน compileJava ด้วย forked javac memory 2GB สำเร็จ",
      "persistence:compileJava ผ่าน BUILD SUCCESSFUL ใน poc_doctor",
    ],
    research:
      "การปรับ build ให้ options.fork=true และกำหนด forkOptions.jvmArgs แยกจาก Gradle daemon ช่วยลดปัญหา GC overhead โดยตรง และทำให้ reviewer/fix_agent เดินรอบแก้ไขได้เสถียรขึ้น.",
    skills: [
      "LangGraph StateGraph orchestration",
      "Gradle compile troubleshooting",
      "Spring Data JPA refactoring",
      "Agent outcome annotations",
    ],
    linkedMilestones: ["m1", "m2", "m8"],
    fields: {
      problem:
        "งาน compile ของโมดูล persistence ล้มเหลวจาก OutOfMemoryError (GC overhead limit exceeded) ระหว่างประมวลผลไฟล์ Java จำนวนมาก.",
      baseline:
        "ก่อนแก้ไข: compile ไม่ผ่านและ fix-loop ติดค้าง, tests_passed ยังไม่ครบใน run สำคัญ.",
      approach:
        "ปรับ gradle build ให้ใช้ forked javac พร้อม jvmArgs ที่เหมาะกับปริมาณไฟล์ และแก้โค้ดที่ AI สร้าง getter/setter ที่ไม่มีอยู่จริงใน VO.",
      verification:
        "รัน poc_dental และ poc_doctor แล้วได้ผล compile_passed=True และ BUILD SUCCESSFUL ใน :persistence:compileJava.",
      rollout:
        "ใช้ baseline เดียวกันกับ persistence packages ถัดไปใน Phase 2 และเพิ่มรอบทดสอบเพื่อปิด tests_passed.",
    },
    metrics: { baselineMs: 5200, postMs: 2900, coveragePct: 85 },
  },
  {
    id: "n2",
    template: "feature" as const,
    impact: "high" as const,
    state: "monitoring" as const,
    title: "โครงสร้างข้อมูลและการสังเกตการณ์ครบวงจรสำหรับ migration platform",
    date: "2026-05-28",
    summary: [
      "OTel traces route ไป Phoenix และ ELK ได้ครบ",
      "Garage S3 พร้อม bucket traces/langfuse และอัปโหลด artifacts ได้",
      "Analytics dashboard เชื่อม Insight Agent ผ่าน FastAPI /chat แล้ว",
    ],
    research:
      "การทำ dual-write เข้าฐานข้อมูล PostgreSQL ควบคู่ artifact prefix ไป S3 ช่วยให้แดชบอร์ดย้อนรอย trace, file change และผลลัพธ์ราย run ได้ครบในมุมผู้บริหาร.",
    skills: [
      "OpenTelemetry tracing",
      "Phoenix session/span annotations",
      "Garage S3 artifact pipeline",
      "Next.js analytics dashboard",
    ],
    linkedMilestones: ["m3", "m7", "m5"],
    fields: {
      architecture:
        "LangGraph app ส่ง OTLP HTTP ไป otel-collector แล้ว fan-out ไป Phoenix และ APM/ELK พร้อม metadata ระดับ session และ span.",
      contracts:
        "เพิ่ม FastAPI endpoint POST /chat และให้ analytics route ทำหน้าที่ proxy พร้อม timeout/error handling.",
      dataLayer:
        "เก็บข้อมูล run ผ่าน PostgreSQL (Session/AgentRun/LlmCall/FileChange) และแนบ artifacts ผ่าน key รูปแบบ {prefix}/runs/{run_id}/{filename}.",
      risks:
        "ความเสี่ยงหลักอยู่ที่ Qdrant indexing และการทดสอบ download artifacts บางกรณียังไม่ครบ จึงกำหนด milestone เฝ้าระวังไว้.",
    },
    metrics: { baselineMs: 4100, postMs: 2600, coveragePct: 80 },
  },
] as Note[];

export type NoteTemplate = "feature" | "performance" | "incident";
export type NoteImpact = "critical" | "high" | "medium" | "low";
export type NoteState = "draft" | "in-review" | "deployed" | "monitoring" | "rolled-back";

export type Note = {
  id: string;
  projectId?: string;
  template: NoteTemplate;
  impact: NoteImpact;
  state: NoteState;
  title: string;
  date: string;
  summary: string[];
  research: string;
  skills: string[];
  linkedMilestones: string[];
  fields: Record<string, string>;
  metrics?: { baselineMs?: number; postMs?: number; coveragePct?: number };
};

export const templateSpecs: Record<
  NoteTemplate,
  {
    label: string;
    blurb: string;
    sections: { key: string; label: string; placeholder: string; rows?: number }[];
  }
> = {
  feature: {
    label: "Feature / Architecture Change",
    blurb: "องค์ประกอบสถาปัตยกรรม, API contract, data layer และความเสี่ยง",
    sections: [
      {
        key: "architecture",
        label: "Architecture & Patterns",
        placeholder: "ระบุโครงสร้างที่เปลี่ยน, node flow, หรือ pattern ที่ใช้",
        rows: 3,
      },
      {
        key: "contracts",
        label: "API Contracts",
        placeholder: "ระบุ endpoint, payload, timeout และเงื่อนไข error",
        rows: 3,
      },
      {
        key: "dataLayer",
        label: "Data Layer Changes",
        placeholder: "ระบุ schema/table/model/index หรือ artifact key format",
        rows: 3,
      },
      {
        key: "risks",
        label: "Risks & Mitigations",
        placeholder: "ความเสี่ยงสำคัญ, ผลกระทบ, แผนลดความเสี่ยง",
        rows: 2,
      },
    ],
  },
  performance: {
    label: "Performance Optimization & Refactoring",
    blurb: "สรุปปัญหา baseline วิธีแก้ และผลยืนยันที่วัดได้",
    sections: [
      {
        key: "problem",
        label: "Problem Statement",
        placeholder: "อธิบายปัญหาเชิงเทคนิคที่ส่งผลต่อผลลัพธ์งาน",
        rows: 2,
      },
      {
        key: "baseline",
        label: "Baseline Metrics",
        placeholder: "ตัวชี้วัดก่อนแก้ เช่น เวลา, ความเสถียร, coverage",
        rows: 2,
      },
      {
        key: "approach",
        label: "Optimization Approach",
        placeholder: "แนวทางแก้เชิงวิศวกรรมที่ลงมือทำจริง",
        rows: 3,
      },
      {
        key: "verification",
        label: "Verification Results",
        placeholder: "ผลการรันจริงและหลักฐานที่ยืนยันได้",
        rows: 2,
      },
      {
        key: "rollout",
        label: "Rollout Plan",
        placeholder: "แผนนำไปใช้ต่อในโมดูลหรือเฟสถัดไป",
        rows: 2,
      },
    ],
  },
  incident: {
    label: "Incident Resolution & Hotfix",
    blurb: "RCA, วิธีแก้เร่งด่วน, การชดเชยข้อมูล และการป้องกันซ้ำ",
    sections: [
      {
        key: "rootCause",
        label: "Root Cause Analysis",
        placeholder: "อธิบายสาเหตุรากเชิงระบบอย่างตรงจุด",
        rows: 3,
      },
      {
        key: "resolution",
        label: "Immediate Resolution",
        placeholder: "สิ่งที่แก้ทันทีและผลต่อระบบ",
        rows: 2,
      },
      {
        key: "compensation",
        label: "Data Compensation",
        placeholder: "การกู้/ชดเชยข้อมูลและวิธียืนยันความถูกต้อง",
        rows: 2,
      },
      {
        key: "prevention",
        label: "Long-Term Prevention",
        placeholder: "guardrail, tests หรือ alert ที่เพิ่มเพื่อกันซ้ำ",
        rows: 3,
      },
    ],
  },
};

export const performanceTrend = [
  { week: "W22", p99: 6100, coverage: 62 },
  { week: "W23", p99: 5600, coverage: 68 },
  { week: "W24", p99: 5200, coverage: 72 },
  { week: "W25", p99: 4600, coverage: 76 },
  { week: "W26", p99: 3900, coverage: 79 },
  { week: "W27", p99: 3300, coverage: 82 },
  { week: "W28", p99: 2900, coverage: 85 },
];
