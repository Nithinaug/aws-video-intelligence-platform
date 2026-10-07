# Video Intelligence & Processing Platform

## Problem statement

Organizations and individuals generate large amounts of video content
(meetings, lectures, interviews, training sessions, webinars, tutorials) that
is hard to manage, search, and consume. Users have to watch an entire video
to find specific information, and manually create transcripts and summaries.
Processing video on a traditional application server also consumes heavy
compute and doesn't scale well when many users upload at once.

## Proposed solution

A cloud-based platform on AWS where users upload videos through a web app
straight to S3, and processing runs asynchronously in an event-driven
pipeline that is defined entirely as AWS configuration, not application code:

- **Amazon S3** — original videos, processed videos, transcripts, artifacts
- **S3 event notifications + Amazon SQS** — every upload becomes a durable,
  buffered processing job
- **Amazon EventBridge Pipes + AWS Step Functions** — pull jobs off the queue
  and orchestrate each processing step with retries, using Step Functions'
  native service integrations
- **AWS Elemental MediaConvert** — transcodes videos into optimized
  resolutions/formats
- **Amazon Transcribe** — converts speech to searchable text
- **Amazon Bedrock** — analyzes transcripts into summaries, key topics,
  chapters, and action items
- **Amazon RDS (Postgres)** — application and video metadata
- **Amazon CloudFront** — content delivery

The web app runs as Docker containers on Amazon ECS using the **EC2 launch
type**: an Auto Scaling group of EC2 instances forms the ECS cluster, and ECS
schedules the application's containers (pulled from Amazon ECR) onto those
instances. This sits behind an Application Load Balancer, across multiple
Availability Zones, inside a VPC with private subnets, security groups, and
IAM least-privilege access. CloudWatch handles monitoring, logging, and
alarms.

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
          | ECS cluster |         | ECS cluster |
          | instance    |         | instance    |
          | -> runs ECS |         | -> runs ECS |
          |    Task     |         |    Task     |
          +------+------+         +------+------+
                 |                       |
                 +-----------+-----------+
                             |
                     Application API
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
            +---------+    presigned  +---------+
            |   RDS   |    URLs       |   S3    | <--- browser uploads
            |Postgres |               | Videos  |      directly
            +---------+               +----+----+
                                           |
                                           | S3 event notification
                                           v
                                      +---------+
                                      |  SQS    |
                                      |  Queue  |
                                      +----+----+
                                           |
                                           | EventBridge Pipe
                                           v
                                   +----------------+
                                   | Step Functions |
                                   | state machine  |
                                   +-------+--------+
                                           |
                     +---------------------+---------------+
                     |                     |               |
                     v                     v               v
              +-------------+      +-------------+   +----------+
              | MediaConvert|      | Transcribe  |   | Bedrock  |
              |             |      |             |   |          |
              | Video       |      | Speech ->   |   | AI       |
              | Processing  |      | Text        |   | Analysis |
              +------+------+      +------+------+   +----+-----+
                     |                    |               |
                     +--------------------+---------------+
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

Each EC2 instance runs the ECS agent and joins the ECS cluster; ECS then
places the application's container (image pulled from Amazon ECR) onto
whichever instance has capacity. Not shown above to keep the diagram focused
on the request/processing path, but Docker + ECR sit "underneath" the EC2
boxes:

```
   AWS
    |
    +------------------+------------------+
    |                                     |
Infrastructure                       Containers
    |                                     |
   VPC                                  Docker
    |                                     |
   ALB                                   ECR
    |                                     |
   EC2  <----------------------------------
    |
   RDS
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
  ALB          EC2 #1               ALB          EC2 #2
          (ECS cluster                       (ECS cluster
           instance)                          instance)

                    Private Database Subnets
                            |
                            v
                         RDS
```

Traffic path: `Internet -> ALB -> EC2 (ECS task) -> RDS`. The EC2 instances
that make up the ECS cluster sit in private subnets with no public IPs; RDS
is never exposed to the internet directly either. Outbound access from the
instances (e.g. to pull images from ECR, call other AWS services) goes
through a NAT Gateway in the public subnet.

### Video processing workflow

```
1. User requests an upload; API returns a presigned S3 URL
          |
2. Browser uploads the video directly to S3
          |
3. S3 event notification puts a message on SQS
          |
4. EventBridge Pipe starts a Step Functions execution
          |
5. MediaConvert transcodes the video
          |
6. Transcribe generates the transcript
          |
7. Bedrock analyzes the transcript
          |
8. Results are written to S3
          |
9. User sees results in the dashboard (served via presigned URLs)
```

The application's only AWS SDK usage is generating presigned S3 URLs. The
whole processing pipeline is AWS configuration, managed with Terraform.

### AWS services in scope

| Category | Services |
|---|---|
| Core infrastructure | VPC, Subnets, Route Tables, Internet Gateway, NAT Gateway, Security Groups, EC2, ECS (EC2 launch type), ECR, Application Load Balancer, Auto Scaling |
| Storage & database | S3, RDS PostgreSQL |
| Event-driven orchestration | S3 Event Notifications, SQS, EventBridge Pipes, Step Functions |
| Video & AI | MediaConvert, Amazon Transcribe, Amazon Bedrock |
| Delivery & networking | CloudFront, Route 53 |
| Security | IAM, Secrets Manager, AWS WAF (optional) |
| Monitoring | CloudWatch |

## Infrastructure as code

AWS resources are managed with **Terraform** so the whole stack can be
deployed and torn down on demand (`terraform apply` / `terraform destroy`),
which keeps hourly-billed resources like the NAT Gateway, ALB, EC2 and RDS
from running when they aren't needed.

| Terraform | Console (one-time) | Script |
|---|---|---|
| S3 buckets (CORS, lifecycle, encryption, event notifications), SQS, EventBridge Pipes, Step Functions, IAM roles and policies, ECR, VPC, ECS, ALB, RDS, CloudWatch log groups and alarms | Terraform state bucket, AWS Budget alert, Bedrock model access | `docker build` + push to ECR |

## Status

- [x] Go API with JWT auth, Postgres, React frontend
- [x] Direct-to-S3 uploads and playback via presigned URLs
- [ ] Terraform for the existing S3 bucket
- [ ] S3 event notifications → SQS
- [ ] EventBridge Pipe → Step Functions → MediaConvert, Transcribe, Bedrock
- [ ] Results in the dashboard
- [ ] ECS, ALB, RDS, CloudFront, Route 53 deployment

## How this is being built

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Go (Gin), Postgres
- **Infrastructure**: AWS Console to learn each service, then Terraform

## Project layout

```
backend/
  cmd/server/         API server entrypoint
  internal/config/    env-based configuration
  internal/db/        Postgres connection + embedded SQL migrations
  internal/models/    shared data types
  internal/store/     SQL queries
  internal/auth/      JWT + password hashing
  internal/storage/   S3 presigned URLs, or local filesystem for offline dev
  internal/handlers/  HTTP handlers
  internal/router/    route wiring
frontend/
  src/api/            typed API client
  src/context/        auth context
  src/pages/          Login, Register, Dashboard, Upload, VideoDetail
  src/components/     shared UI pieces
infra/
  Terraform (in progress)
```

## Running locally

Requires Go 1.23+, Node 20+, and a local Postgres instance. (No Dockerfiles
right now — not needed while everything runs directly on the host.)

```bash
# Postgres
docker run -d --name videointell-pg -p 5432:5432 \
  -e POSTGRES_USER=videointell -e POSTGRES_PASSWORD=videointell -e POSTGRES_DB=videointell \
  postgres:16-alpine

# Backend (local storage)
cd backend
go run ./cmd/server

# Backend (S3 storage)
cd backend
STORAGE_BACKEND=s3 S3_BUCKET=<your-bucket> go run ./cmd/server

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, register an account, and upload a video. With
local storage it's saved under `backend/data/`; with S3 it goes straight from
the browser to the bucket via a presigned URL.

## Environment variables

### Backend

Read from the process environment (`.env` files are not loaded automatically).
Every variable has a local-dev default, so nothing is required for local storage.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | API listen port |
| `DATABASE_URL` | `postgres://videointell:videointell@localhost:5432/videointell?sslmode=disable` | Postgres connection string |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing secret; must be set to a strong value outside local dev |
| `LOCAL_DATA_DIR` | `./data` | Upload directory when `STORAGE_BACKEND=local` |
| `STORAGE_BACKEND` | `local` | `local` or `s3` |
| `S3_BUCKET` | _(empty)_ | Bucket name; required when `STORAGE_BACKEND=s3` |

AWS credentials and region are never configured here. With `STORAGE_BACKEND=s3`
the AWS SDK resolves them through its default provider chain: `aws configure` /
`AWS_PROFILE` / `AWS_REGION` locally, and the IAM role (ECS task role or EC2
instance role) in production.

### Frontend

Put these in `frontend/.env` (git-ignored; Vite loads it automatically).

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |
