# Total Cost of Ownership (TCO) Analysis: Temporal Video Pipeline

This document provides a cost breakdown for the Temporal Video Pipeline at three operational scales. All estimates are based on current (2025/2026) AWS and Temporal Cloud consumption rates.

## Core Cost Components

1.  **Temporal Cloud**: Billed primarily on **Actions** (orchestration events) and **Storage** (Active/Retained).
2.  **AWS Compute (ECS Express Mode)**: Billed per vCPU and GB of memory used by the worker tasks (Fargate).
3.  **AWS Storage (S3)**: Billed per GB of video storage and data transfer (egress).
4.  **AWS Serverless (Lambda/API Gateway)**: Billed per request and execution time.

| Metric | Estimated Rate (Avg) |
| :--- | :--- |
| **Temporal Actions** | ~$50 per 1,000,000 Actions |
| **Fargate vCPU** | $0.04048 / vCPU-hour |
| **Fargate Memory** | $0.004445 / GB-hour |
| **S3 Standard Storage** | $0.023 / GB |
| **Data Transfer Out** | $0.09 / GB |

---

## Comparative Scales

### 1. Small Scale (Development / Pilot)
**Workload**: 100 videos / month
**Assumptions**: **100MB** baseline average video size; workflows run for < 1 min.

| Component | Usage | Est. Monthly Cost |
| :--- | :--- | :--- |
| **Temporal Cloud** | 2,500 Actions | $1.00 (Minimal) |
| **Compute (ECS)** | 1 Task (256mCPU/512MB) | $8.00 |
| **Storage (S3)** | 10GB | $0.23 |
| **Data Transfer** | 10GB Egress | $0.90 |
| **Fixed Costs** | ALB (Express Mode) | $16.00 |
| **Total** | | **~$26.13 / month** |

> [!NOTE]
> At small scales, the fixed cost of the Load Balancer (ALB) is the dominant factor. Express Mode can share ALBs across services to reduce this.

---

### 2. Medium Scale (Growth / Mid-Market)
**Workload**: 10,000 videos / month
**Assumptions**: **500MB** average video size; high availability (2+ workers).

| Component | Usage | Est. Monthly Cost |
| :--- | :--- | :--- |
| **Temporal Cloud** | 250,000 Actions | $12.50 |
| **Compute (ECS)** | 4 Tasks (Scaling) | $32.00 |
| **Storage (S3)** | 5 TB | $115.00 |
| **Data Transfer** | 2.5 TB Egress (50%) | $225.00 |
| **API/Lambda** | 20k Requests | $2.00 |
| **Total** | | **~$386.50 / month** |

---

### 3. Large Scale (Enterprise / High Volume)
**Workload**: 1,000,000 videos / month
**Assumptions**: **1GB** average video size; highly distributed workers.

| Component | Usage | Est. Monthly Cost |
| :--- | :--- | :--- |
| **Temporal Cloud** | 25,000,000 Actions | $1,250.00 |
| **Compute (ECS)** | Auto-scaling (Avg 50 Tasks) | $4,500.00 |
| **Storage (S3)** | 1000 TB (PB-scale with Lifecycle) | $23,000.00 |
| **Data Transfer** | 500 TB Egress (50%) | $45,000.00 |
| **API/Lambda** | 2M Requests | $15.00 |
| **Total** | | **~$73,765.00 / month** |

---

## Cost Optimization Opportunities

1.  **Temporal Actions**: Optimize activity heartbeats and signal frequency. Consolidate small activities.
2.  **Compute**: Use **Fargate Spot** for worker tasks to save up to 70% on compute costs.
3.  **Storage**: For Large scale, moving storage to **S3 Intelligent-Tiering** or implementing aggressive **Glacier Instant Retrieval** lifecycle policies can reduce storage costs by up to 60%.
4.  **Egress**: Implement a CDN (CloudFront) to reduce data transfer costs if videos are served frequently to end-users.
