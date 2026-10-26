import React from 'react';
import {
  Cloud,
  Database,
  Shield,
  Cpu,
  Layers,
  Server,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
  Activity,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Cloud Computing Capstone Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cloud-Native System Architecture & AWS Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Engineered for high availability, least-privilege security, zero-trust resume privacy, and scalable container orchestration on Amazon Web Services (AWS).
        </p>
      </div>

      {/* Interactive Architecture Diagram Box */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400">AWS PRODUCTION TOPOLOGY</span>
            <h2 className="text-lg font-bold text-white mt-0.5">End-to-End Cloud Service Orchestration</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            US-EAST-1 (N. Virginia)
          </div>
        </div>

        {/* 4 Pillars Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Layer 1: Client & CDN */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Frontend Layer
            </span>
            <h3 className="font-bold text-white text-sm">AWS Amplify / CloudFront S3</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Vite + React single-page application served through 400+ globally distributed edge edge caches with SSL/TLS termination.
            </p>
          </div>

          {/* Layer 2: Compute */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Compute Layer
            </span>
            <h3 className="font-bold text-white text-sm">AWS App Runner / ECS</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              FastAPI asynchronous container auto-scaled on CPU/memory utilization, providing REST endpoints and rule-based matching.
            </p>
          </div>

          {/* Layer 3: Database */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Relational Tier
            </span>
            <h3 className="font-bold text-white text-sm">Amazon RDS PostgreSQL</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Managed Multi-AZ relational database storing users, jobs, applications, and placement metrics in private VPC subnets.
            </p>
          </div>

          {/* Layer 4: Storage & Secrets */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Object & Security
            </span>
            <h3 className="font-bold text-white text-sm">Amazon S3 + Presigned URLs</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Private bucket with SSE-AES256 encryption. Resumes accessed strictly via temporary 1-hour IAM presigned tokens.
            </p>
          </div>
        </div>

        {/* Security & Observability Sub-panel */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Least-Privilege IAM Roles</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>CloudWatch Logs & Latency Metrics</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Bcrypt Hashing + RS256/HS256 JWTs</span>
          </div>
        </div>
      </div>

      {/* Cloud Components Technical Spec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Compute Architecture: App Runner & Docker</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The backend container is packaged with an optimized Python 3.14 Dockerfile. In local development, the code runs via Uvicorn. For cloud staging or production, the container image is published to Amazon Elastic Container Registry (ECR) and served via AWS App Runner or Elastic Beanstalk with zero infrastructure configuration required.
          </p>
          <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
            <li>Automatic TLS/HTTPS certificate provisioning</li>
            <li>Zero-downtime rolling deployments</li>
            <li>Health check probes at <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">/health</code></li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Database Tier: PostgreSQL & RDS</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Relational storage uses SQLAlchemy ORM with normalized tables for Users, StudentProfiles, Companies, Jobs, Applications, Placements, and AuditLogs. The database abstraction seamlessly supports local development without external dependencies and connects to Amazon RDS PostgreSQL in production via the <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">DATABASE_URL</code> environment variable.
          </p>
          <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
            <li>Parameterized queries preventing SQL injection</li>
            <li>Enforced database foreign keys and uniqueness constraints</li>
            <li>Automated nightly snapshots in RDS</li>
          </ul>
        </div>
      </div>

      {/* Free Tier Cost Optimization Guide */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
          <CheckCircle className="w-4 h-4 text-indigo-600" />
          <span>AWS Free Tier & Student Budget Optimization</span>
        </div>
        <p className="text-xs text-indigo-900/80 leading-relaxed">
          As a capstone project for a Cloud Computing course, this entire application is architected to operate within the <strong>AWS Free Tier</strong> or minimal cost (&lt;$5/month). When local testing is complete, demo resources can be deployed and completely deleted within minutes using our documented teardown guide in <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200">docs/cloud-deployment.md</code>.
        </p>
      </div>
    </div>
  );
};
