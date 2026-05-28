-- CreateEnum
CREATE TYPE "ProjectPlatform" AS ENUM ('github', 'gitlab');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('on_track', 'at_risk', 'delayed', 'done');

-- CreateEnum
CREATE TYPE "NoteTemplate" AS ENUM ('feature', 'performance', 'incident');

-- CreateEnum
CREATE TYPE "NoteImpact" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "NoteState" AS ENUM ('draft', 'in_review', 'deployed', 'monitoring', 'rolled_back');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('queued', 'running', 'success', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('running', 'success', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "LlmCallStatus" AS ENUM ('success', 'failed', 'timeout');

-- CreateEnum
CREATE TYPE "FileChangeOperation" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platform" "ProjectPlatform" NOT NULL,
    "org" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "closedIssues" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "branches" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "MilestoneStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proficiency" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "template" "NoteTemplate" NOT NULL,
    "impact" "NoteImpact" NOT NULL,
    "state" "NoteState" NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "research" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteSummaryBullet" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "NoteSummaryBullet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteField" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "NoteField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteMetric" (
    "noteId" TEXT NOT NULL,
    "baselineMs" INTEGER,
    "postMs" INTEGER,
    "coveragePct" INTEGER,

    CONSTRAINT "NoteMetric_pkey" PRIMARY KEY ("noteId")
);

-- CreateTable
CREATE TABLE "NoteSkill" (
    "noteId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "NoteSkill_pkey" PRIMARY KEY ("noteId","skillId")
);

-- CreateTable
CREATE TABLE "NoteMilestone" (
    "noteId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,

    CONSTRAINT "NoteMilestone_pkey" PRIMARY KEY ("noteId","milestoneId")
);

-- CreateTable
CREATE TABLE "VelocityPoint" (
    "id" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "planned" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VelocityPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusAllocationPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusAllocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueResolutionPoint" (
    "id" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "avgHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueResolutionPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRadarPoint" (
    "id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "q1" INTEGER NOT NULL,
    "q2" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillRadarPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitActivityPoint" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "commits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommitActivityPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceTrendPoint" (
    "id" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "p99" INTEGER NOT NULL,
    "coverage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceTrendPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CeoReportSnapshot" (
    "id" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "language" TEXT,
    "surveyedAt" TIMESTAMP(3),
    "surveyedBy" TEXT,
    "purpose" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CeoReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'queued',
    "sourceDir" TEXT,
    "targetDir" TEXT,
    "modulePath" TEXT,
    "targetPattern" TEXT,
    "compilePassed" BOOLEAN,
    "testsPassed" BOOLEAN,
    "fixIterations" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "totalCostUsd" DECIMAL(12,6),
    "artifactPrefix" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Handoff" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fromAgent" TEXT NOT NULL,
    "toAgent" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Handoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAudit" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "fixIteration" INTEGER NOT NULL DEFAULT 0,
    "status" "AgentRunStatus" NOT NULL,
    "durationMs" INTEGER,
    "model" TEXT,
    "provider" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "totalTokens" INTEGER,
    "costUsd" DECIMAL(12,6),
    "langfuseUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmCall" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "agentRunId" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "status" "LlmCallStatus" NOT NULL DEFAULT 'success',
    "systemPrompt" TEXT,
    "userPrompt" TEXT,
    "response" TEXT,
    "errorMessage" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "totalTokens" INTEGER,
    "costUsd" DECIMAL(12,6),
    "latencyMs" INTEGER,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileChange" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "agentRunId" TEXT,
    "filePath" TEXT NOT NULL,
    "operation" "FileChangeOperation" NOT NULL,
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesDeleted" INTEGER NOT NULL DEFAULT 0,
    "diff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionMetadata" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

-- CreateIndex
CREATE INDEX "Proficiency_skillId_idx" ON "Proficiency"("skillId");

-- CreateIndex
CREATE INDEX "Note_date_idx" ON "Note"("date");

-- CreateIndex
CREATE INDEX "Note_template_idx" ON "Note"("template");

-- CreateIndex
CREATE INDEX "Note_impact_idx" ON "Note"("impact");

-- CreateIndex
CREATE INDEX "Note_state_idx" ON "Note"("state");

-- CreateIndex
CREATE INDEX "NoteSummaryBullet_noteId_idx" ON "NoteSummaryBullet"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteSummaryBullet_noteId_position_key" ON "NoteSummaryBullet"("noteId", "position");

-- CreateIndex
CREATE INDEX "NoteField_noteId_idx" ON "NoteField"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteField_noteId_key_key" ON "NoteField"("noteId", "key");

-- CreateIndex
CREATE INDEX "NoteSkill_skillId_idx" ON "NoteSkill"("skillId");

-- CreateIndex
CREATE INDEX "NoteMilestone_milestoneId_idx" ON "NoteMilestone"("milestoneId");

-- CreateIndex
CREATE UNIQUE INDEX "VelocityPoint_week_key" ON "VelocityPoint"("week");

-- CreateIndex
CREATE UNIQUE INDEX "FocusAllocationPoint_name_key" ON "FocusAllocationPoint"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IssueResolutionPoint_week_key" ON "IssueResolutionPoint"("week");

-- CreateIndex
CREATE UNIQUE INDEX "SkillRadarPoint_skill_key" ON "SkillRadarPoint"("skill");

-- CreateIndex
CREATE UNIQUE INDEX "CommitActivityPoint_day_key" ON "CommitActivityPoint"("day");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceTrendPoint_week_key" ON "PerformanceTrendPoint"("week");

-- CreateIndex
CREATE UNIQUE INDEX "Session_runId_key" ON "Session"("runId");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "Handoff_sessionId_idx" ON "Handoff"("sessionId");

-- CreateIndex
CREATE INDEX "History_sessionId_idx" ON "History"("sessionId");

-- CreateIndex
CREATE INDEX "History_eventType_idx" ON "History"("eventType");

-- CreateIndex
CREATE INDEX "LogAudit_sessionId_idx" ON "LogAudit"("sessionId");

-- CreateIndex
CREATE INDEX "LogAudit_level_idx" ON "LogAudit"("level");

-- CreateIndex
CREATE INDEX "AgentRun_sessionId_idx" ON "AgentRun"("sessionId");

-- CreateIndex
CREATE INDEX "AgentRun_agentName_idx" ON "AgentRun"("agentName");

-- CreateIndex
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");

-- CreateIndex
CREATE INDEX "LlmCall_sessionId_idx" ON "LlmCall"("sessionId");

-- CreateIndex
CREATE INDEX "LlmCall_agentRunId_idx" ON "LlmCall"("agentRunId");

-- CreateIndex
CREATE INDEX "LlmCall_status_idx" ON "LlmCall"("status");

-- CreateIndex
CREATE INDEX "LlmCall_calledAt_idx" ON "LlmCall"("calledAt");

-- CreateIndex
CREATE INDEX "FileChange_sessionId_idx" ON "FileChange"("sessionId");

-- CreateIndex
CREATE INDEX "FileChange_agentRunId_idx" ON "FileChange"("agentRunId");

-- CreateIndex
CREATE INDEX "Artifact_sessionId_idx" ON "Artifact"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_sessionId_key_key" ON "Artifact"("sessionId", "key");

-- CreateIndex
CREATE INDEX "SessionMetadata_sessionId_idx" ON "SessionMetadata"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionMetadata_sessionId_key_key" ON "SessionMetadata"("sessionId", "key");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proficiency" ADD CONSTRAINT "Proficiency_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSummaryBullet" ADD CONSTRAINT "NoteSummaryBullet_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteField" ADD CONSTRAINT "NoteField_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMetric" ADD CONSTRAINT "NoteMetric_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSkill" ADD CONSTRAINT "NoteSkill_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSkill" ADD CONSTRAINT "NoteSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMilestone" ADD CONSTRAINT "NoteMilestone_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteMilestone" ADD CONSTRAINT "NoteMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Handoff" ADD CONSTRAINT "Handoff_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAudit" ADD CONSTRAINT "LogAudit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LlmCall" ADD CONSTRAINT "LlmCall_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LlmCall" ADD CONSTRAINT "LlmCall_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileChange" ADD CONSTRAINT "FileChange_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileChange" ADD CONSTRAINT "FileChange_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMetadata" ADD CONSTRAINT "SessionMetadata_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
