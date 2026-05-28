import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  // ── Projects ──────────────────────────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: "p1" },
      update: {},
      create: {
        id: "p1",
        name: "ai-migration-core",
        description: "ระบบ AI Pipeline หลักสำหรับ EJB -> JPA ด้วย LangGraph",
        platform: "github",
        org: "rd-agent-imed-transform",
        status: "active",
        openIssues: 3,
        closedIssues: 14,
        stars: 0,
        branches: 7,
      },
    }),
    prisma.project.upsert({
      where: { id: "p2" },
      update: {},
      create: {
        id: "p2",
        name: "analytics",
        description: "Dashboard ติดตามผล migration, run details และ insight agent",
        platform: "github",
        org: "rd-agent-imed-transform",
        status: "active",
        openIssues: 4,
        closedIssues: 11,
        stars: 0,
        branches: 5,
      },
    }),
    prisma.project.upsert({
      where: { id: "p3" },
      update: {},
      create: {
        id: "p3",
        name: "obsidian-brain",
        description: "Second Brain สำหรับ patterns, failures, decisions และ migration board",
        platform: "gitlab",
        org: "rd-agent-imed-transform",
        status: "active",
        openIssues: 5,
        closedIssues: 7,
        stars: 0,
        branches: 4,
      },
    }),
    prisma.project.upsert({
      where: { id: "p4" },
      update: {},
      create: {
        id: "p4",
        name: "docker-infrastructure",
        description: "Infra stack: Postgres, Qdrant, Redis, Garage, OTel, Phoenix, ELK",
        platform: "gitlab",
        org: "rd-agent-imed-transform",
        status: "active",
        openIssues: 2,
        closedIssues: 12,
        stars: 0,
        branches: 3,
      },
    }),
    prisma.project.upsert({
      where: { id: "p5" },
      update: {},
      create: {
        id: "p5",
        name: "rag-and-file-server",
        description: "RAG pipeline บน Qdrant + Garage S3 สำหรับ artifacts",
        platform: "github",
        org: "rd-agent-imed-transform",
        status: "active",
        openIssues: 4,
        closedIssues: 8,
        stars: 0,
        branches: 4,
      },
    }),
  ]);
  console.log(`Seeded ${projects.length} projects`);

  // ── Milestones ────────────────────────────────────────────────────────────
  const milestoneData = [
    { id: "m1", projectId: "p1", title: "persistence:compileJava ผ่านใน poc_doctor", dueDate: "2026-05-28", progress: 100, status: "done" as const },
    { id: "m2", projectId: "p1", title: "รัน poc_doctor แบบเพิ่ม fix iterations ให้ tests_passed", dueDate: "2026-05-31", progress: 40, status: "at_risk" as const },
    { id: "m3", projectId: "p2", title: "Insight Agent panel เชื่อม FastAPI /chat จริง", dueDate: "2026-05-30", progress: 75, status: "on_track" as const },
    { id: "m4", projectId: "p5", title: "Index Obsidian notes เข้า brain-notes (Qdrant)", dueDate: "2026-06-02", progress: 35, status: "at_risk" as const },
    { id: "m5", projectId: "p5", title: "ทดสอบ download artifacts ผ่านหน้า /file-server", dueDate: "2026-06-03", progress: 30, status: "delayed" as const },
    { id: "m6", projectId: "p3", title: "ขยาย entity-playbooks ให้ครบ 8 persistence packages", dueDate: "2026-06-15", progress: 45, status: "on_track" as const },
    { id: "m7", projectId: "p4", title: "Garage S3 setup + bucket traces/langfuse เสร็จสมบูรณ์", dueDate: "2026-05-28", progress: 100, status: "done" as const },
    { id: "m8", projectId: "p1", title: "Phase 2 migrate persistence packages ที่เหลือ", dueDate: "2026-06-30", progress: 20, status: "on_track" as const },
    { id: "m9", projectId: "p1", title: "Phase 4 ลบ JNDI lookup จาก service/app layer", dueDate: "2026-07-20", progress: 10, status: "on_track" as const },
    { id: "m10", projectId: "p1", title: "Phase 5 เพิ่ม Flyway/Liquibase schema migration", dueDate: "2026-08-15", progress: 8, status: "on_track" as const },
  ];

  for (const m of milestoneData) {
    await prisma.milestone.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        projectId: m.projectId,
        title: m.title,
        dueDate: new Date(m.dueDate),
        progress: m.progress,
        status: m.status,
      },
    });
  }
  console.log(`Seeded ${milestoneData.length} milestones`);

  // ── Skill Categories & Skills & Proficiencies ─────────────────────────────
  const skillBankData = [
    {
      name: "AI Migration Core",
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
      name: "Observability & Data",
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
      name: "Modernization & Delivery",
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

  const proficiencyData: { skill: string; level: number }[] = [
    { skill: "LangGraph StateGraph orchestration", level: 9 },
    { skill: "OpenTelemetry tracing", level: 9 },
    { skill: "Spring Data JPA refactoring", level: 8 },
    { skill: "Gradle compile troubleshooting", level: 8 },
    { skill: "PostgreSQL + Prisma", level: 8 },
    { skill: "Qdrant vector search", level: 7 },
    { skill: "Garage S3 artifact pipeline", level: 8 },
    { skill: "Model policy and provider routing", level: 9 },
  ];

  // Maps skill name → DB id for later use in note links
  const skillIdMap: Record<string, string> = {};

  for (const cat of skillBankData) {
    const dbCat = await prisma.skillCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });

    for (const skillName of cat.skills) {
      const dbSkill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { categoryId: dbCat.id, name: skillName },
      });
      skillIdMap[skillName] = dbSkill.id;

      const prof = proficiencyData.find((p) => p.skill === skillName);
      if (prof) {
        const existing = await prisma.proficiency.findFirst({ where: { skillId: dbSkill.id } });
        if (!existing) {
          await prisma.proficiency.create({ data: { skillId: dbSkill.id, level: prof.level } });
        }
      }
    }
  }
  console.log(`Seeded skill categories, skills, and proficiencies`);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const notesData = [
    {
      id: "n1",
      projectId: "p1",
      template: "performance" as const,
      impact: "high" as const,
      state: "deployed" as const,
      title: "สรุปสถานะโครงการ: compile persistence ผ่านและ pipeline พร้อมใช้งาน",
      date: "2026-05-28",
      research:
        "การปรับ build ให้ options.fork=true และกำหนด forkOptions.jvmArgs แยกจาก Gradle daemon ช่วยลดปัญหา GC overhead โดยตรง และทำให้ reviewer/fix_agent เดินรอบแก้ไขได้เสถียรขึ้น.",
      summary: [
        "LangGraph pipeline 7 agents ทำงานครบพร้อม fix-loop",
        "แก้ OOM ใน compileJava ด้วย forked javac memory 2GB สำเร็จ",
        "persistence:compileJava ผ่าน BUILD SUCCESSFUL ใน poc_doctor",
      ],
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
      skills: [
        "LangGraph StateGraph orchestration",
        "Gradle compile troubleshooting",
        "Spring Data JPA refactoring",
        "Agent outcome annotations",
      ],
      linkedMilestones: ["m1", "m2", "m8"],
    },
    {
      id: "n2",
      projectId: "p2",
      template: "feature" as const,
      impact: "high" as const,
      state: "monitoring" as const,
      title: "โครงสร้างข้อมูลและการสังเกตการณ์ครบวงจรสำหรับ migration platform",
      date: "2026-05-28",
      research:
        "การทำ dual-write เข้าฐานข้อมูล PostgreSQL ควบคู่ artifact prefix ไป S3 ช่วยให้แดชบอร์ดย้อนรอย trace, file change และผลลัพธ์ราย run ได้ครบในมุมผู้บริหาร.",
      summary: [
        "OTel traces route ไป Phoenix และ ELK ได้ครบ",
        "Garage S3 พร้อม bucket traces/langfuse และอัปโหลด artifacts ได้",
        "Analytics dashboard เชื่อม Insight Agent ผ่าน FastAPI /chat แล้ว",
      ],
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
      skills: [
        "OpenTelemetry tracing",
        "Phoenix session/span annotations",
        "Garage S3 artifact pipeline",
        "Next.js analytics dashboard",
      ],
      linkedMilestones: ["m3", "m7", "m5"],
    },
  ];

  for (const note of notesData) {
    // Delete existing note and all cascaded children before re-creating
    await prisma.note.deleteMany({ where: { id: note.id } });

    await prisma.note.create({
      data: {
        id: note.id,
        projectId: note.projectId,
        template: note.template,
        impact: note.impact,
        state: note.state,
        title: note.title,
        date: new Date(note.date),
        research: note.research,
        summaryBullets: {
          create: note.summary.map((text, i) => ({ position: i, text })),
        },
        fields: {
          create: Object.entries(note.fields).map(([key, value]) => ({ key, value })),
        },
        metrics: note.metrics
          ? { create: note.metrics }
          : undefined,
        skills: {
          create: note.skills
            .filter((s) => skillIdMap[s])
            .map((s) => ({ skillId: skillIdMap[s] })),
        },
        milestones: {
          create: note.linkedMilestones.map((milestoneId) => ({ milestoneId })),
        },
      },
    });
  }
  console.log(`Seeded ${notesData.length} notes`);

  // ── Time-series & chart data ───────────────────────────────────────────────
  const velocityData = [
    { week: "W22", planned: 8, completed: 6 },
    { week: "W23", planned: 9, completed: 7 },
    { week: "W24", planned: 10, completed: 9 },
    { week: "W25", planned: 8, completed: 8 },
    { week: "W26", planned: 9, completed: 8 },
    { week: "W27", planned: 10, completed: 9 },
    { week: "W28", planned: 11, completed: 10 },
  ];
  for (const v of velocityData) {
    await prisma.velocityPoint.upsert({
      where: { week: v.week },
      update: { planned: v.planned, completed: v.completed },
      create: v,
    });
  }

  const focusData = [
    { name: "Pipeline & Agent", value: 34 },
    { name: "Infra & Observability", value: 23 },
    { name: "Analytics UI", value: 21 },
    { name: "Knowledge Base / RAG", value: 22 },
  ];
  for (const f of focusData) {
    await prisma.focusAllocationPoint.upsert({
      where: { name: f.name },
      update: { value: f.value },
      create: f,
    });
  }

  const issueData = [
    { week: "W22", avgHours: 52 },
    { week: "W23", avgHours: 44 },
    { week: "W24", avgHours: 37 },
    { week: "W25", avgHours: 31 },
    { week: "W26", avgHours: 27 },
    { week: "W27", avgHours: 24 },
    { week: "W28", avgHours: 20 },
  ];
  for (const d of issueData) {
    await prisma.issueResolutionPoint.upsert({
      where: { week: d.week },
      update: { avgHours: d.avgHours },
      create: d,
    });
  }

  const radarData = [
    { skill: "LangGraph", q1: 5, q2: 9 },
    { skill: "Spring Data JPA", q1: 4, q2: 8 },
    { skill: "Observability", q1: 5, q2: 9 },
    { skill: "Data Platform", q1: 6, q2: 8 },
    { skill: "AI Agent Design", q1: 5, q2: 9 },
    { skill: "Migration QA", q1: 4, q2: 7 },
  ];
  for (const r of radarData) {
    await prisma.skillRadarPoint.upsert({
      where: { skill: r.skill },
      update: { q1: r.q1, q2: r.q2 },
      create: r,
    });
  }

  const commitData = [
    { day: "5/1", commits: 0 },
    { day: "5/2", commits: 0 },
    { day: "5/3", commits: 0 },
    { day: "5/4", commits: 0 },
    { day: "5/5", commits: 0 },
    { day: "5/6", commits: 0 },
    { day: "5/7", commits: 2 },
    { day: "5/8", commits: 0 },
    { day: "5/9", commits: 0 },
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
  for (const c of commitData) {
    await prisma.commitActivityPoint.upsert({
      where: { day: c.day },
      update: { commits: c.commits },
      create: c,
    });
  }

  const perfTrendData = [
    { week: "W22", p99: 6100, coverage: 62 },
    { week: "W23", p99: 5600, coverage: 68 },
    { week: "W24", p99: 5200, coverage: 72 },
    { week: "W25", p99: 4600, coverage: 76 },
    { week: "W26", p99: 3900, coverage: 79 },
    { week: "W27", p99: 3300, coverage: 82 },
    { week: "W28", p99: 2900, coverage: 85 },
  ];
  for (const p of perfTrendData) {
    await prisma.performanceTrendPoint.upsert({
      where: { week: p.week },
      update: { p99: p.p99, coverage: p.coverage },
      create: p,
    });
  }

  console.log("Seeded all time-series chart data");
  console.log("Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
