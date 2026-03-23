CREATE TABLE IF NOT EXISTS waitlist_signups (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	status TEXT NOT NULL DEFAULT 'pending',
	source TEXT NOT NULL DEFAULT 'website',
	submission_count INTEGER NOT NULL DEFAULT 1,
	first_submitted_at TEXT NOT NULL,
	last_submitted_at TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_status ON waitlist_signups(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at ON waitlist_signups(created_at DESC);
