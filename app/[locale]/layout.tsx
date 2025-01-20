import { pick } from "@acdh-oeaw/lib";
import { cn } from "@acdh-oeaw/style-variants";
import type { Metadata, ResolvingMetadata } from "next";
import { useMessages, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { LocalizedStringProvider as Translations } from "react-aria-components/i18n";
import { jsonLdScriptProps } from "react-schemaorg";

import { Providers } from "@/app/[locale]/providers";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { AppLayout } from "@/components/app-layout";
import { id } from "@/components/main-content";
import { SkipLink } from "@/components/skip-link";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { env } from "@/config/env.config";
import { type Locale, locales } from "@/config/i18n.config";
import { AnalyticsScript } from "@/lib/analytics-script";
import { ColorSchemeScript } from "@/lib/color-scheme-script";
import * as fonts from "@/lib/fonts";

interface LocaleLayoutProps {
	children: ReactNode;
	params: {
		locale: Locale;
	};
}

export const dynamicParams = false;

export function generateStaticParams(): Array<LocaleLayoutProps["params"]> {
	return locales.map((locale) => {
		return { locale };
	});
}

export async function generateMetadata(
	props: Omit<LocaleLayoutProps, "children">,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const meta = await getTranslations({ locale, namespace: "metadata" });

	const metadata: Metadata = {
		title: {
			default: meta("title"),
			template: ["%s", meta("title")].join(" | "),
		},
		description: meta("description"),
		openGraph: {
			title: meta("title"),
			description: meta("description"),
			url: "./",
			siteName: meta("title"),
			locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			creator: meta("twitter.creator"),
			site: meta("twitter.site"),
		},
		verification: {
			google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		},
	};

	return metadata;
}

export default function LocaleLayout(props: LocaleLayoutProps): ReactNode {
	const { children, params } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = useTranslations("LocaleLayout");
	const meta = useTranslations("metadata");
	const messages = useMessages() as IntlMessages;

	return (
		<html
			className={cn(fonts.body.variable, fonts.heading.variable)}
			lang={locale}
			/**
			 * Suppressing hydration warning because we add `data-ui-color-scheme` before first paint.
			 */
			suppressHydrationWarning={true}
		>
			<body>
				{/* @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld */}
				<script
					{...jsonLdScriptProps({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: meta("title"),
						description: meta("description"),
					})}
				/>

				<ColorSchemeScript />

				<AnalyticsScript baseUrl={env.NEXT_PUBLIC_MATOMO_BASE_URL} id={env.NEXT_PUBLIC_MATOMO_ID} />

				<SkipLink targetId={id}>{t("skip-to-main-content")}</SkipLink>

				{/**
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#optimizing-bundle-size
				 *
				 * TODO: only include translations for components actually used
				 *
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#advanced-optimization
				 */}
				<Translations locale={locale} />

				<Providers
					locale={locale}
					messages={pick(messages, [
						"AppHeader",
						"BernhardCategories",
						"Error",
						"InlineList",
						"InstantSearch",
						"Languages",
						"LanguagesPage",
						"PublicationCover",
						"SearchPage",
						"TranslatorsPage",
					])}
				>
					<AppLayout>
						<AppHeader />
						{children}
						<AppFooter />
					</AppLayout>
				</Providers>

				<TailwindIndicator />
			</body>
		</html>
	);
}
