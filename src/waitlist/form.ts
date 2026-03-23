const EMAIL_MAX_LENGTH = 320;

export type WaitlistSignupRow = {
	email: string;
	status: string;
	source: string;
	submission_count: number;
	first_submitted_at: string;
	last_submitted_at: string;
	created_at: string;
	updated_at: string;
};

export type WaitlistFormInput = {
	email: string;
	website?: string;
};

export type WaitlistSubmissionResult =
	| { action: "created"; email: string }
	| { action: "updated"; email: string }
	| { action: "ignored"; reason: "honeypot" };

export type WaitlistValidationResult =
	| {
				ok: true;
				value: {
					email: string;
				};
		  }
	| {
			ok: false;
			errors: {
				email?: string;
			};
	  };

type WaitlistStore = {
	findByEmail(email: string): Promise<Pick<WaitlistSignupRow, "email" | "submission_count"> | null>;
	createSignup(row: WaitlistSignupRow): Promise<void>;
	updateSignup(input: {
		email: string;
		lastSubmittedAt: string;
		updatedAt: string;
	}): Promise<void>;
};

type SubmitWaitlistFormOptions = {
	now?: () => Date;
	store?: WaitlistStore;
};

export class D1WaitlistStore implements WaitlistStore {
	private readonly db: D1Database;

	constructor(db: D1Database) {
		this.db = db;
	}

	async findByEmail(email: string) {
		return this.db
			.prepare("SELECT email, submission_count FROM waitlist_signups WHERE email = ?1")
			.bind(email)
			.first<Pick<WaitlistSignupRow, "email" | "submission_count">>();
	}

	async createSignup(row: WaitlistSignupRow) {
		await this.db
			.prepare(
				`
					INSERT INTO waitlist_signups (
						email,
						status,
						source,
						submission_count,
						first_submitted_at,
						last_submitted_at,
						created_at,
						updated_at
					) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
				`,
			)
			.bind(
				row.email,
				row.status,
				row.source,
				row.submission_count,
				row.first_submitted_at,
				row.last_submitted_at,
				row.created_at,
				row.updated_at,
			)
			.run();
	}

	async updateSignup(input: {
		email: string;
		lastSubmittedAt: string;
		updatedAt: string;
	}) {
		await this.db
			.prepare(
				`
					UPDATE waitlist_signups
					SET
						submission_count = submission_count + 1,
						last_submitted_at = ?2,
						updated_at = ?3
					WHERE email = ?1
				`,
			)
			.bind(
				input.email,
				input.lastSubmittedAt,
				input.updatedAt,
			)
			.run();
	}
}

export async function submitWaitlistForm(
	input: WaitlistFormInput,
	db: D1Database,
	options: SubmitWaitlistFormOptions = {},
): Promise<WaitlistSubmissionResult> {
	if (input.website?.trim()) {
		return { action: "ignored", reason: "honeypot" };
	}

	const validation = validateWaitlistForm(input);

	if (!validation.ok) {
		throw new WaitlistValidationError(validation.errors);
	}

	const store = options.store ?? new D1WaitlistStore(db);
	const now = (options.now?.() ?? new Date()).toISOString();
	const existing = await store.findByEmail(validation.value.email);

	if (existing) {
		await store.updateSignup({
			email: validation.value.email,
			lastSubmittedAt: now,
			updatedAt: now,
		});

		return { action: "updated", email: validation.value.email };
	}

	await store.createSignup({
		email: validation.value.email,
		status: "pending",
		source: "website",
		submission_count: 1,
		first_submitted_at: now,
		last_submitted_at: now,
		created_at: now,
		updated_at: now,
	});

	return { action: "created", email: validation.value.email };
}

export function validateWaitlistForm(input: WaitlistFormInput): WaitlistValidationResult {
	const email = normalizeEmailAddress(input.email);
	const errors: {
		email?: string;
	} = {};

	if (!email) {
		errors.email = "Enter a valid email address.";
	}

	if (Object.keys(errors).length > 0) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		value: {
			email: email!,
		},
	};
}

export function normalizeEmailAddress(value: string | null | undefined) {
	if (!value) {
		return null;
	}

	const normalizedValue = value.trim().toLowerCase();

	if (!normalizedValue || normalizedValue.length > EMAIL_MAX_LENGTH) {
		return null;
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
		return null;
	}

	return normalizedValue;
}
export class WaitlistValidationError extends Error {
	readonly errors: {
		email?: string;
	};

	constructor(errors: { email?: string }) {
		super("Invalid waitlist submission.");
		this.name = "WaitlistValidationError";
		this.errors = errors;
	}
}
