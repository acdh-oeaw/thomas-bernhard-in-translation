import { HttpError, request } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import type { Locale } from "@/config/i18n.config";
import { createImprintUrl } from "@/config/imprint.config";

interface ImprintPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: ImprintPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("ImprintPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function ImprintPage(_props: ImprintPageProps): ReactNode {
	const locale = useLocale();

	const t = useTranslations("ImprintPage");

	return (
		<MainContent className="container prose mx-auto w-full max-w-screen-md py-8">
			{/* @ts-expect-error @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69970 */}
			<ImprintPageContent locale={locale} title={t("title")} />
		</MainContent>
	);
}

interface ImprintPageContentProps {
	locale: Locale;
	title: string;
}

async function ImprintPageContent(props: ImprintPageContentProps): Promise<Awaited<ReactNode>> {
	const { locale, title } = props;

	const html = await getImprintHtml(locale);

	return (
		<div className="prose mx-auto w-full max-w-screen-md">
			<PageTitle>{title}</PageTitle>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	);
}

async function getImprintHtml(locale: Locale): Promise<string> {
	try {
		const url = createImprintUrl(locale);
		const html = await request(url, { responseType: "text" });

		return html as string;
	} catch (error) {
		if (error instanceof HttpError && error.response.status === 404) {
			notFound();
		}

		throw error;
	}
}
