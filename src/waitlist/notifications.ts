const DEFAULT_SENDER_NAME = "Landing Page Template";
const PLACEHOLDER_EMAILS = new Set(["owner@example.com", "noreply@example.com"]);

type WaitlistNotificationEnv = {
	WAITLIST_NOTIFICATION_EMAIL?: Pick<SendEmail, "send">;
	WAITLIST_NOTIFICATION_TO?: string;
	WAITLIST_NOTIFICATION_FROM?: string;
	WAITLIST_NOTIFICATION_SENDER_NAME?: string;
};

export type WaitlistSignupNotification = {
	email: string;
	submittedAt: string;
};

export async function sendWaitlistSignupNotification(
	env: WaitlistNotificationEnv,
	signup: WaitlistSignupNotification,
) {
	const binding = env.WAITLIST_NOTIFICATION_EMAIL;
	const to = normalizeConfiguredEmail(env.WAITLIST_NOTIFICATION_TO);
	const from = normalizeConfiguredEmail(env.WAITLIST_NOTIFICATION_FROM);
	const senderName = env.WAITLIST_NOTIFICATION_SENDER_NAME?.trim() || DEFAULT_SENDER_NAME;

	if (!binding || !to || !from) {
		return { status: "skipped" as const };
	}

	await binding.send({
		from: { name: senderName, email: from },
		to,
		subject: `New landing page signup: ${signup.email}`,
		text: buildPlainTextNotification(signup),
	});

	return { status: "sent" as const };
}

function normalizeConfiguredEmail(value: string | undefined) {
	const normalized = value?.trim();

	if (!normalized || PLACEHOLDER_EMAILS.has(normalized)) {
		return null;
	}

	return normalized;
}

function buildPlainTextNotification(signup: WaitlistSignupNotification) {
	return [
		"A new person joined the landing page signup list.",
		"",
		`Email: ${signup.email}`,
		`Submitted at: ${signup.submittedAt}`,
	].join("\n");
}
