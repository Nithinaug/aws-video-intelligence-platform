# Video Intelligence & Processing Platform

## Problem statement

Organizations and individuals generate large amounts of video content
(meetings, lectures, interviews, training sessions, webinars, tutorials) that
is hard to manage, search, and consume. Users have to watch an entire video
to find specific information, and manually create transcripts and summaries.
Processing video on a traditional application server also consumes heavy
compute and doesn't scale well when many users upload at once.

## Proposed solution

A cloud-based platform on AWS where users upload videos through a web app,
originals are stored in S3, and processing is handled asynchronously via
SQS + Lambda rather than on the app servers themselves:

- **AWS Elemental MediaConvert** — transcodes videos into optimized
  resolutions/formats
- **Amazon Transcribe** — converts speech to searchable text
- **Amazon Bedrock** — analyzes transcripts into summaries, key topics,
  chapters, and action items
- **Amazon RDS (Postgres)** — application and video metadata
- **Amazon S3** — original videos, processed videos, transcripts, artifacts
- **Amazon CloudFront** — content delivery

The web app runs on EC2 behind an Application Load Balancer, Auto Scaling
across multiple Availability Zones, inside a VPC with private subnets,
security groups, and IAM least-privilege access. CloudWatch handles
monitoring, logging, and alarms.

## Architecture

```
                           USERS
                             |
                             v
                       +-----------+
                       | Route 53  |
                       +-----+-----+
                             |
                             v
                       +-----------+
                       |CloudFront |
                       +-----+-----+
                             |
                             v
                  +---------------------+
                  | Application Load    |
                  |     Balancer        |
                  +----------+----------+
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
          +-------------+         +-------------+
          |   EC2 #1    |         |   EC2 #2    |
          | Application |         | Application |
          +------+------+         +------+------+
                 |                       |
                 +-----------+-----------+
                             |
                     Application API
                             |
             +---------------+----------------+
             |               |                |
             v               v                v
        +---------+     +---------+      +---------+
        |   RDS   |     |   S3    |      |  SQS    |
        |Postgres |     | Videos  |      |  Queue  |
        +---------+     +----+----+      +----+----+
                             |                 |
                             |                 v
                             |            +---------+
                             |            | Lambda  |
                             |            +----+----+
                             |                 |
                     +-------+-----------------+------------+
                     |                         |            |
                     v                         v            v
              +-------------+          +-------------+ +----------+
              | MediaConvert|          | Transcribe  | | Bedrock  |
              |             |          |             | |          |
              | Video       |          | Speech ->   | | AI       |
              | Processing  |          | Text        | | Analysis |
              +------+------+          +------+------+ +----+-----+
                     |                        |              |
                     +------------------------+--------------+
                                              |
                                              v
                                         +---------+
                                         |   S3    |
                                         |Processed|
                                         | Content |
                                         +----+----+
                                              |
                                              v
                                         CloudFront
                                              |
                                              v
                                         USER DASHBOARD
```

### Network architecture

```
                         VPC
                          |
          +---------------+----------------+
          |                                |
          v                                v
   Availability Zone A              Availability Zone B
          |                                |
   +------+-------+                 +------+-------+
   |              |                  |              |
Public Subnet  Private Subnet    Public Subnet  Private Subnet
   |              |                  |              |
   v              v                  v              v
  ALB           EC2 #1              ALB           EC2 #2


                    Private Database Subnets
                            |
                            v
                         RDS
```

Traffic path: `Internet -> ALB -> EC2 -> RDS`. RDS is never exposed to the
internet directly.

### Video processing workflow

```
1. User uploads video
          |
2. Video stored in S3
          |
3. Processing job created
          |
4. Message placed in SQS
          |
5. Lambda picks up job
          |
6. MediaConvert processes video
          |
7. Transcribe generates transcript
          |
8. Bedrock analyzes transcript
          |
9. Results stored in S3/RDS
          |
10. User sees results in dashboard
```

### AWS services in scope

| Category | Services |
|---|---|
| Core infrastructure | VPC, Subnets, Route Tables, Internet Gateway, NAT Gateway, Security Groups, EC2, Application Load Balancer, Auto Scaling |
| Storage & database | S3, RDS PostgreSQL |
| Serverless & event-driven | SQS, Lambda |
| Video & AI | MediaConvert, Amazon Transcribe, Amazon Bedrock |
| Delivery & networking | CloudFront, Route 53 |
| Security | IAM, Secrets Manager, AWS WAF (optional) |
| Monitoring | CloudWatch |

## How this is being built

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Go (Gin), Postgres

## Project layout

```
backend/
  cmd/server/       API server entrypoint
  internal/config/   env-based configuration
  internal/db/        Postgres connection + embedded SQL migrations
  internal/models/    shared data types
  internal/store/     SQL queries
  internal/auth/      JWT + password hashing
  internal/storage/   Storage interface (local filesystem / S3)
  internal/handlers/  HTTP handlers
  internal/router/    route wiring
frontend/
  src/api/            typed API client
  src/context/        auth context
  src/pages/           Login, Register, Dashboard, Upload, VideoDetail
  src/components/     shared UI pieces
infra/
  CDK app (not started yet — infra is being built in the Console first)
```

## Running locally

Requires Go 1.23+, Node 20+, and a local Postgres instance. (No Dockerfiles
right now — not needed while everything runs directly on the host.)

```bash
# Postgres
docker run -d --name videointell-pg -p 5432:5432 \
  -e POSTGRES_USER=videointell -e POSTGRES_PASSWORD=videointell -e POSTGRES_DB=videointell \
  postgres:16-alpine

# Backend
cd backend
cp .env.example .env
go run ./cmd/server

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, register an account, and upload a video — it's
stored on the local filesystem and playable straight back from the dashboard.
