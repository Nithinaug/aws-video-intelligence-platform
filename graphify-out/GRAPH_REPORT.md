# Graph Report - .  (2026-09-06)

## Corpus Check
- Corpus is ~4,941 words - fits in a single context window. You may not need a graph.

## Summary
- 205 nodes · 262 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 97,411 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend API Client & Routing|Frontend API Client & Routing]]
- [[_COMMUNITY_Auth Middleware & Router|Auth Middleware & Router]]
- [[_COMMUNITY_Frontend App TS Config|Frontend App TS Config]]
- [[_COMMUNITY_Target AWS Architecture|Target AWS Architecture]]
- [[_COMMUNITY_Server Bootstrap & Local Storage|Server Bootstrap & Local Storage]]
- [[_COMMUNITY_Frontend Node TS Config|Frontend Node TS Config]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Postgres Data Store|Postgres Data Store]]
- [[_COMMUNITY_Project Docs & Build Approach|Project Docs & Build Approach]]
- [[_COMMUNITY_Frontend Dev Tooling|Frontend Dev Tooling]]
- [[_COMMUNITY_Video HTTP Handlers|Video HTTP Handlers]]
- [[_COMMUNITY_Shared Backend Models|Shared Backend Models]]
- [[_COMMUNITY_Root TS Config|Root TS Config]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]
- [[_COMMUNITY_Backend Go Module|Backend Go Module]]
- [[_COMMUNITY_Route 53 (Planned DNS)|Route 53 (Planned DNS)]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `Store` - 12 edges
4. `VideoHandler` - 10 edges
5. `Cloud-based async processing solution` - 10 edges
6. `LocalStorage` - 7 edges
7. `useAuth()` - 7 edges
8. `Video Processing Workflow (10-step pipeline)` - 7 edges
9. `Video Intelligence & Processing Platform` - 6 edges
10. `main()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `frontend/index.html (Vite entry HTML)` --conceptually_related_to--> `Frontend stack: React + TypeScript + Vite + Tailwind`  [INFERRED]
  frontend/index.html → README.md
- `Running locally instructions (Postgres/Go/Vite)` --references--> `frontend/index.html (Vite entry HTML)`  [INFERRED]
  README.md → frontend/index.html
- `main()` --calls--> `Load()`  [INFERRED]
  backend/cmd/server/main.go → backend/internal/config/config.go
- `main()` --calls--> `Connect()`  [INFERRED]
  backend/cmd/server/main.go → backend/internal/db/db.go
- `main()` --calls--> `RunMigrations()`  [INFERRED]
  backend/cmd/server/main.go → backend/internal/db/db.go

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Async video processing pipeline via SQS/Lambda fanning out to AWS AI services** — readme_sqs, readme_lambda, readme_mediaconvert, readme_transcribe, readme_bedrock [EXTRACTED 1.00]
- **ECS-on-EC2 hosting pattern with ALB, ASG, ECR, VPC** — readme_ecs_ec2_launch_type, readme_ec2_auto_scaling_group, readme_ecr, readme_alb, readme_vpc [EXTRACTED 1.00]

## Communities (17 total, 4 thin omitted)

### Community 0 - "Frontend API Client & Routing"
Cohesion: 0.11
Nodes (24): api, completeUpload(), createVideo(), getVideoDetail(), listVideos(), login(), register(), uploadToPresignedUrl() (+16 more)

### Community 1 - "Auth Middleware & Router"
Cohesion: 0.14
Nodes (15): Claims, CheckPassword(), GenerateToken(), HashPassword(), ParseToken(), Context, AuthMiddleware(), CORSMiddleware() (+7 more)

### Community 2 - "Frontend App TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "Target AWS Architecture"
Cohesion: 0.14
Nodes (20): Application Load Balancer, Amazon Bedrock, Amazon CloudFront, CloudWatch monitoring/logging/alarms, EC2 Auto Scaling Group, Amazon ECR, ECS (EC2 launch type), IAM least-privilege access (+12 more)

### Community 4 - "Server Bootstrap & Local Storage"
Cohesion: 0.15
Nodes (9): main(), getEnv(), Load(), Connect(), DB, RunMigrations(), NewLocalStorage(), Config (+1 more)

### Community 5 - "Frontend Node TS Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 6 - "Frontend Dependencies"
Cohesion: 0.12
Nodes (15): dependencies, axios, react, react-dom, react-router-dom, @tailwindcss/vite, name, private (+7 more)

### Community 7 - "Postgres Data Store"
Cohesion: 0.23
Nodes (5): DB, New(), Store, User, Video

### Community 8 - "Project Docs & Build Approach"
Cohesion: 0.18
Nodes (12): frontend/index.html (Vite entry HTML), frontend/src/main.tsx (app entry module), backend/ project layout, Backend stack: Go (Gin) + Postgres, frontend/ project layout, Frontend stack: React + TypeScript + Vite + Tailwind, Incremental vertical-slice build order, infra/ CDK app (not started) (+4 more)

### Community 9 - "Frontend Dev Tooling"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+3 more)

### Community 10 - "Video HTTP Handlers"
Cohesion: 0.31
Nodes (3): Context, createVideoRequest, VideoHandler

### Community 11 - "Shared Backend Models"
Cohesion: 0.60
Nodes (4): User, Video, VideoDetail, Time

## Knowledge Gaps
- **76 isolated node(s):** `videointell/backend`, `authRequest`, `createVideoRequest`, `name`, `private` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `VideoHandler` connect `Video HTTP Handlers` to `Auth Middleware & Router`, `Server Bootstrap & Local Storage`, `Postgres Data Store`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Store` connect `Postgres Data Store` to `Auth Middleware & Router`, `Video HTTP Handlers`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `LocalStorage` connect `Server Bootstrap & Local Storage` to `Video HTTP Handlers`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `videointell/backend`, `authRequest`, `createVideoRequest` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend API Client & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.10634920634920635 - nodes in this community are weakly interconnected._
- **Should `Auth Middleware & Router` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `Frontend App TS Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._