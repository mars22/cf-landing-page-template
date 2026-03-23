export const siteConfig = {
	name: "Template Landing",
	tagline: "Astro + Cloudflare landing page starter",
	siteUrl: "https://example.com",
	defaultTitle: "Template Landing | Launch a polished landing page fast",
	defaultDescription:
		"A reusable Astro + Cloudflare starter for launching a landing page with baseline SEO, a D1-backed signup form, and clean placeholder content.",
	contactEmail: "hello@example.com",
	companyName: "Example Studio LLC",
	privacyContactLabel: "privacy@example.com",
	faviconPath: "/favicon.svg",
	socialImagePath: "/og-placeholder.svg",
	primaryCtaLabel: "Join the list",
	secondaryCtaLabel: "See the sections",
	footerNote: "Replace this placeholder copy with your positioning, proof, and launch details.",
	navLinks: [
		{ label: "Why it works", id: "why-it-works" },
		{ label: "What you get", id: "what-you-get" },
		{ label: "FAQ", id: "faq" },
	],
};

export const landingPageContent = {
	hero: {
		eyebrow: "Reusable starter",
		title: "Launch a credible landing page before the rest of the product is ready.",
		description:
			"This Astro + Cloudflare template gives you a sharp homepage, a working signup flow, and the baseline SEO scaffolding most prelaunch projects need on day one.",
		highlights: ["Astro on Workers", "D1 signup storage", "Editable placeholder copy", "SEO baseline included"],
	},
	problemCards: [
		{
			title: "Most starters carry too much baggage",
			description:
				"Blog routes, demo posts, and framework leftovers slow down the first real edit and blur what you are actually shipping.",
		},
		{
			title: "Blank pages waste launch momentum",
			description:
				"Teams often know the product direction but still lose time rebuilding the same sections, form flow, and metadata from scratch.",
		},
		{
			title: "Infrastructure gets deferred until too late",
			description:
				"Email capture, Cloudflare deploy setup, and search metadata are usually treated as cleanup work instead of part of the starter.",
		},
	],
	featureCards: [
		{
			title: "One page, fully intentional",
			description:
				"A focused landing page with hero, value framing, features, social proof placeholders, FAQ, and conversion CTA.",
		},
		{
			title: "Cloudflare-ready deployment",
			description:
				"Configured for Astro on Workers with static assets, a server route for form submissions, and a template-safe Wrangler config.",
		},
		{
			title: "D1-backed email capture",
			description:
				"Collect email signups with honeypot protection, duplicate handling, and optional notification email support.",
		},
		{
			title: "Editable SEO foundation",
			description:
				"Canonical tags, Open Graph, sitemap support, robots defaults, and placeholder structured data are ready to customize.",
		},
	],
	processSteps: [
		{
			label: "01",
			title: "Edit one config file first",
			description:
				"Replace the placeholder brand, messaging, contact details, and CTA labels from a single source of truth.",
		},
		{
			label: "02",
			title: "Customize the sections that matter",
			description:
				"Swap in your proof points, screenshots, pricing hints, and launch timeline without cleaning up unrelated starter clutter.",
		},
		{
			label: "03",
			title: "Deploy when the page is ready",
			description:
				"Provision D1, optionally configure email notifications, and publish to Workers without re-architecting the template.",
		},
	],
	socialProofCards: [
		{
			title: "Add logos or customer names here",
			description:
				"Use this strip for press mentions, pilot customers, partner marks, or a credibility statement tied to your niche.",
		},
		{
			title: "Add a strong testimonial here",
			description:
				"Keep it short, specific, and outcome-focused. This template leaves the slot in place so you can add proof later.",
		},
		{
			title: "Add a metric here",
			description:
				"Examples: waitlist signups, teams onboarded, pilot users interviewed, revenue influenced, or time saved.",
		},
	],
	faqItems: [
		{
			question: "What is included in the template?",
			answer:
				"You get one landing page, one privacy page, a D1-backed signup API route, baseline SEO scaffolding, and Cloudflare deployment configuration.",
		},
		{
			question: "Does the signup form require email notifications?",
			answer:
				"No. The form stores submissions in D1 by default. Notification emails are optional and safely skipped when bindings are not configured.",
		},
		{
			question: "Can I expand this into a larger site later?",
			answer:
				"Yes. The starter is intentionally narrow for v1, but it leaves room to add pricing, docs, a blog, or product pages after the initial launch.",
		},
		{
			question: "How should I adapt the copy?",
			answer:
				"Replace the placeholder claims with your positioning, audience language, proof, and clear next step. The structure is reusable; the messaging should be specific.",
		},
	],
	footerLinks: [
		{ label: "Privacy", href: "/privacy-policy/" },
		{ label: "Contact", href: `mailto:${siteConfig.contactEmail}` },
	],
};

export function getDefaultRobots() {
	return import.meta.env.PUBLIC_NOINDEX === "true"
		? "noindex, nofollow"
		: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
}

export function getPublicSiteUrl() {
	const value = import.meta.env.PUBLIC_SITE_URL?.trim();
	return value || siteConfig.siteUrl;
}

export function buildSiteSchemas(pageTitle: string, pageDescription: string, pathname: string) {
	const siteUrl = getPublicSiteUrl();
	const pageUrl = new URL(pathname, siteUrl).toString();

	return [
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			name: siteConfig.companyName,
			url: siteUrl,
			email: siteConfig.contactEmail,
			logo: new URL(siteConfig.socialImagePath, siteUrl).toString(),
			description: pageDescription,
		},
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: siteConfig.name,
			url: siteUrl,
			description: siteConfig.defaultDescription,
			inLanguage: "en",
		},
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: pageTitle,
			url: pageUrl,
			description: pageDescription,
			isPartOf: {
				"@type": "WebSite",
				name: siteConfig.name,
				url: siteUrl,
			},
		},
	];
}
