import React, { useState } from 'react';

const SystemDesign: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition z-50 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {/* <span className="text-sm font-medium">System Architecture</span> */}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          {/* <h2 className="text-2xl font-bold text-slate-900">System Architecture & Database Design</h2> */}
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          
          <section>
            <h3 className="text-lg font-bold text-indigo-600 mb-2">1. Database Schema (PostgreSQL)</h3>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`-- Core Tenant & Hierarchy
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'FREE'
);

CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workspaces_company ON workspaces(company_id);

-- Notes System
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    workspace_id INT REFERENCES workspaces(id),
    author_id INT REFERENCES users(id),
    title VARCHAR(512),
    content TEXT, -- Stored as Markdown
    is_public BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT TRUE,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Optimization: Index for public directory & search
CREATE INDEX idx_notes_public ON notes(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_notes_workspace ON notes(workspace_id);
CREATE INDEX idx_notes_text ON notes USING GIN(to_tsvector('english', title));

-- Tagging (Many-to-Many)
CREATE TABLE tags ( id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE );
CREATE TABLE note_tags (
    note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (note_id, tag_id)
);

-- History / Versioning
CREATE TABLE note_history (
    id BIGSERIAL PRIMARY KEY,
    note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Snapshot of content
    changed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_note ON note_history(note_id);
CREATE INDEX idx_history_date ON note_history(created_at); -- For Retention Policy
`}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-indigo-600 mb-2">2. History Retention Policy (7 Days)</h3>
            <p className="text-slate-600 mb-4">
              To handle millions of notes without bloating the database with old history versions, we offload cleanup to a scheduled background job.
              This ensures user interactions (saving/loading) are never slowed down by maintenance tasks.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-bold text-yellow-800">Implementation Strategy:</h4>
              <p className="text-sm text-yellow-800 mt-1">
                We use a cron job (via Kubernetes CronJob or pg_cron) running daily at 03:00 UTC during low-traffic hours.
              </p>
              <code className="block mt-2 font-mono text-sm text-slate-800 bg-white p-2 rounded border border-yellow-200">
                DELETE FROM note_history <br/>
                WHERE created_at &lt; NOW() - INTERVAL '7 days';
              </code>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-indigo-600 mb-2">3. Scalability & Performance</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li><strong>Read-Heavy Optimization:</strong> Public directory uses a Read Replica DB to avoid impacting workspace write performance.</li>
              <li><strong>Caching:</strong> Redis caches the "Most Popular" notes lists (TTL 5 mins).</li>
              <li><strong>Search:</strong> Full-text search is offloaded to Elasticsearch for advanced querying, falling back to Postgres GIN indexes for basic workspace search.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SystemDesign;
