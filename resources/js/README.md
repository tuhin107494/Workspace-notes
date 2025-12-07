# ScaleNotes SaaS Platform

A high-performance, multi-tenant SaaS application for managing company workspaces and notes.

## 🚀 Key Features

*   **Multi-tenancy**: Strict isolation between workspaces using Company IDs.
*   **Draft System**: Create, edit, and save drafts without publishing to the public directory.
*   **Version History**: Automatic history tracking with restore functionality.
*   **Public Directory**: Discover insights with voting and search capabilities.
*   **AI Integration**: Generative AI for content expansion, summarization, and proofreading.

## 🗄️ Database Design

We utilize a relational model optimized for multi-tenancy. Below is the Entity Relationship Diagram (ERD).

```mermaid
erDiagram
    COMPANY ||--|{ WORKSPACE : owns
    COMPANY ||--|{ USER : employs
    WORKSPACE ||--|{ NOTE : contains
    USER ||--|{ NOTE : authors
    NOTE ||--|{ NOTE_HISTORY : has_versions
    NOTE ||--|{ NOTE_TAG : tagged_with
    TAG ||--|{ NOTE_TAG : categorizes

    COMPANY {
        string id PK
        string name
        string plan_tier
    }

    WORKSPACE {
        string id PK
        string company_id FK
        string name
        int note_count
    }

    NOTE {
        string id PK
        string workspace_id FK
        string author_id FK
        string title
        string content
        boolean is_public
        boolean is_draft
        int upvotes
        int downvotes
        datetime created_at
        datetime updated_at
    }

    NOTE_HISTORY {
        string id PK
        string note_id FK
        string content
        string changed_by FK
        datetime created_at
    }
```

## ⏱️ 7-Day History Retention Strategy

To ensure database performance and manage storage costs, we implement a strict **7-day retention policy** for note history. This process is fully automated and offloaded from the main application server to ensure zero impact on user latency.

### Execution Strategy: The Offloaded Cron Job

We do **not** check for expiration during read/write operations (e.g., when a user opens a note). Instead, we use a dedicated system-level background job.

#### 1. The Cleanup Query
This highly optimized SQL query runs against the `note_history` table. It uses the index on `created_at` to efficiently locate and bulk-delete expired records.

```sql
-- Efficient Bulk Delete
DELETE FROM note_history 
WHERE created_at < NOW() - INTERVAL '7 days';
```

#### 2. Scheduling (The "Corn" Job)
We configure a system Cron job to execute this query daily during off-peak hours (e.g., 03:00 AM UTC).

**Crontab Configuration:**
```bash
# Run daily at 3:00 AM UTC
0 3 * * * psql -U db_user -d scalenotes_db -c "DELETE FROM note_history WHERE created_at < NOW() - INTERVAL '7 days';"
```

#### 3. Kubernetes Implementation (Production)
In a Kubernetes environment, we deploy a `CronJob` resource to spin up a transient container that performs the cleanup and then terminates.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: history-cleanup
spec:
  schedule: "0 3 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: db-cleanup
            image: postgres:15-alpine
            command: ["psql", "postgres://user:pass@db-host:5432/db", "-c", "DELETE FROM note_history WHERE created_at < NOW() - INTERVAL '7 days';"]
          restartPolicy: OnFailure
```

## 🔒 Security & Best Practices

*   **Multi-Tenant Isolation**: Implemented via Row Level Security (RLS) policies in PostgreSQL.
    *   `CREATE POLICY tenant_isolation ON workspaces USING (company_id = current_setting('app.current_company_id'));`
*   **Authentication**: Session-based auth with secure cookie handling.
*   **Input Sanitization**: All user inputs (Markdown content, titles) are sanitized on the backend to prevent XSS attacks.
*   **API Security**: Private notes are strictly filtered at the Data Access Layer (DAL) before reaching the API response to ensure no data leakage occurs between companies.

## 📦 Data Seeding
The application includes a large-scale data seeder (`services/mockData.ts`) simulating 1,000 workspaces and ~500,000 notes to demonstrate UI performance under load.
