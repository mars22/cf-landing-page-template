import type { APIRoute } from "astro";
import { submitWaitlistForm, WaitlistValidationError } from "../../waitlist/form";
import { sendWaitlistSignupNotification } from "../../waitlist/notifications";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const formData = await request.formData();
	const runtimeEnv = locals.runtime.env;
	const db = runtimeEnv.WAITLIST_DB;

	if (!db) {
		return json(
			{
				ok: false,
				message: "Waitlist storage is not configured.",
			},
			500,
		);
	}

	try {
		const result = await submitWaitlistForm(
			{
				email: String(formData.get("email") ?? ""),
				website: String(formData.get("website") ?? ""),
			},
			db,
		);

		if (result.action === "created") {
			try {
				await sendWaitlistSignupNotification(runtimeEnv, {
					email: result.email,
					submittedAt: new Date().toISOString(),
				});
			} catch (error) {
				console.error("Waitlist notification email failed.", error);
			}
		}

		if (result.action === "ignored") {
			return json({
				ok: true,
				message: "Thanks. Your request has been received.",
			});
		}

		return json({
			ok: true,
			message:
				result.action === "created"
					? "You’re on the list. We’ll reach out when there’s news to share."
					: "You were already on the list. We refreshed your signup timestamp.",
		});
	} catch (error) {
		if (error instanceof WaitlistValidationError) {
			return json(
				{
					ok: false,
					message: "Please fix the highlighted fields.",
					errors: error.errors,
				},
				400,
			);
		}

		console.error(error);

		return json(
			{
				ok: false,
				message: "Something went wrong. Please try again in a moment.",
			},
			500,
		);
	}
};

function json(payload: unknown, status = 200) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}
