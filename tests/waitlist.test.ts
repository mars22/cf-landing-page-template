import test from "node:test";
import assert from "node:assert/strict";
import {
	D1WaitlistStore,
	normalizeEmailAddress,
	submitWaitlistForm,
	validateWaitlistForm,
	type WaitlistSignupRow,
} from "../src/waitlist/form.ts";
import { sendWaitlistSignupNotification } from "../src/waitlist/notifications.ts";

class FakeD1Database {
	rows = new Map<string, WaitlistSignupRow>();

	prepare(query: string) {
		return new FakePreparedStatement(this, query);
	}
}

class FakePreparedStatement {
	private readonly db: FakeD1Database;
	private readonly query: string;
	private values: unknown[] = [];

	constructor(db: FakeD1Database, query: string) {
		this.db = db;
		this.query = query;
	}

	bind(...values: unknown[]) {
		this.values = values;
		return this;
	}

	async first<T>() {
		if (this.query.includes("SELECT email, submission_count FROM waitlist_signups")) {
			const email = this.values[0] as string;
			const row = this.db.rows.get(email);

			if (!row) {
				return null;
			}

			return {
				email: row.email,
				submission_count: row.submission_count,
			} as T;
		}

		throw new Error(`Unsupported first() query: ${this.query}`);
	}

	async run() {
		if (this.query.includes("INSERT INTO waitlist_signups")) {
			const row = {
				email: this.values[0] as string,
				status: this.values[1] as string,
				source: this.values[2] as string,
				submission_count: this.values[3] as number,
				first_submitted_at: this.values[4] as string,
				last_submitted_at: this.values[5] as string,
				created_at: this.values[6] as string,
				updated_at: this.values[7] as string,
			} satisfies WaitlistSignupRow;

			this.db.rows.set(row.email, row);
			return { success: true };
		}

		if (this.query.includes("UPDATE waitlist_signups")) {
			const email = this.values[0] as string;
			const row = this.db.rows.get(email);

			if (!row) {
				throw new Error("Missing row for update.");
			}

			row.submission_count += 1;
			row.last_submitted_at = this.values[1] as string;
			row.updated_at = this.values[2] as string;
			return { success: true };
		}

		throw new Error(`Unsupported run() query: ${this.query}`);
	}
}

test("normalizeEmailAddress lowercases valid emails", () => {
	assert.equal(normalizeEmailAddress(" Person@Example.com "), "person@example.com");
	assert.equal(normalizeEmailAddress("not-an-email"), null);
});

test("validateWaitlistForm accepts valid input", () => {
	const result = validateWaitlistForm({
		email: "person@example.com",
	});

	assert.equal(result.ok, true);
});

test("validateWaitlistForm returns field errors for invalid email", () => {
	const result = validateWaitlistForm({
		email: "bad",
	});

	assert.equal(result.ok, false);

	if (!result.ok) {
		assert.equal(result.errors.email, "Enter a valid email address.");
	}
});

test("submitWaitlistForm stores new signups", async () => {
	const db = new FakeD1Database();
	const store = new D1WaitlistStore(db as unknown as D1Database);

	const result = await submitWaitlistForm(
		{
			email: "person@example.com",
		},
		db as unknown as D1Database,
		{
			now: () => new Date("2026-03-22T12:00:00.000Z"),
			store,
		},
	);

	assert.deepEqual(result, { action: "created", email: "person@example.com" });
	assert.equal(db.rows.size, 1);
	assert.equal(db.rows.get("person@example.com")?.submission_count, 1);
	assert.equal(db.rows.get("person@example.com")?.source, "website");
});

test("submitWaitlistForm updates existing signups", async () => {
	const db = new FakeD1Database();
	const store = new D1WaitlistStore(db as unknown as D1Database);

	await submitWaitlistForm(
		{
			email: "person@example.com",
		},
		db as unknown as D1Database,
		{
			now: () => new Date("2026-03-22T12:00:00.000Z"),
			store,
		},
	);

	const result = await submitWaitlistForm(
		{
			email: "person@example.com",
		},
		db as unknown as D1Database,
		{
			now: () => new Date("2026-03-23T08:30:00.000Z"),
			store,
		},
	);

	assert.deepEqual(result, { action: "updated", email: "person@example.com" });
	assert.equal(db.rows.get("person@example.com")?.submission_count, 2);
	assert.equal(db.rows.get("person@example.com")?.updated_at, "2026-03-23T08:30:00.000Z");
});

test("submitWaitlistForm ignores filled honeypot values", async () => {
	const db = new FakeD1Database();
	const store = new D1WaitlistStore(db as unknown as D1Database);

	const result = await submitWaitlistForm(
		{
			email: "person@example.com",
			website: "spam.example",
		},
		db as unknown as D1Database,
		{
			store,
		},
	);

	assert.deepEqual(result, { action: "ignored", reason: "honeypot" });
	assert.equal(db.rows.size, 0);
});

test("sendWaitlistSignupNotification sends a plain text email", async () => {
	let sentMessage:
		| {
				from: string | EmailAddress;
				to: string | string[];
				subject: string;
				text?: string;
		  }
		| undefined;

	const env = {
		WAITLIST_NOTIFICATION_EMAIL: {
			async send(message: any) {
				sentMessage = message;
				return { messageId: "test-message-id" };
			},
		},
		WAITLIST_NOTIFICATION_TO: "founder@example.com",
		WAITLIST_NOTIFICATION_FROM: "hello@launchpad.test",
		WAITLIST_NOTIFICATION_SENDER_NAME: "Landing Page Template",
	};

	const result = await sendWaitlistSignupNotification(env, {
		email: "person@example.com",
		submittedAt: "2026-03-22T12:00:00.000Z",
	});

	assert.deepEqual(result, { status: "sent" });
	assert.deepEqual(sentMessage, {
		from: { name: "Landing Page Template", email: "hello@launchpad.test" },
		to: "founder@example.com",
		subject: "New landing page signup: person@example.com",
		text: [
			"A new person joined the landing page signup list.",
			"",
			"Email: person@example.com",
			"Submitted at: 2026-03-22T12:00:00.000Z",
		].join("\n"),
	});
});

test("sendWaitlistSignupNotification skips when email config is incomplete", async () => {
	const result = await sendWaitlistSignupNotification(
		{
			WAITLIST_NOTIFICATION_FROM: "hello@launchpad.test",
		},
		{
			email: "person@example.com",
			submittedAt: "2026-03-22T12:00:00.000Z",
		},
	);

	assert.deepEqual(result, { status: "skipped" });
});
