import { cn } from "@acdh-oeaw/style-variants";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import { defaultLocale } from "@/config/i18n.config";
import { ColorSchemeScript } from "@/lib/color-scheme-script";
import * as fonts from "@/lib/fonts";

export async function generateMetadata(
	_props: Record<string, never>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations({ locale: defaultLocale, namespace: "NotFoundPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
		/**
		 * Automatically set by next.js.
		 *
		 * @see https://nextjs.org/docs/app/api-reference/functions/not-found
		 */
		// robots: {
		// 	index: false,
		// },
	};

	return metadata;
}

export default async function NotFoundPage(): Promise<ReactNode> {
	const t = await getTranslations({ locale: defaultLocale, namespace: "NotFoundPage" });

	return (
		<html
			className={cn(fonts.body.variable, fonts.heading.variable)}
			lang={defaultLocale}
			/**
			 * Suppressing hydration warning because we add `data-ui-color-scheme` before first paint.
			 */
			suppressHydrationWarning={true}
		>
			<body>
				<ColorSchemeScript />

				<MainContent className="container py-8">
					<PageTitle>{t("title")}</PageTitle>
				</MainContent>
			</body>
		</html>
	);
}
