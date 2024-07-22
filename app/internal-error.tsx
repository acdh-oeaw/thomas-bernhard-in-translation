"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";

interface InternalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/** `React.lazy` requires default export. */
// eslint-disable-next-line import-x/no-default-export
export default function InternalError(props: InternalErrorProps): ReactNode {
	const { error, reset } = props;

	const t = useTranslations("Error");

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("something-went-wrong")}</PageTitle>
			<button
				onClick={() => {
					reset();
				}}
				type="button"
			>
				{t("try-again")}
			</button>
		</MainContent>
	);
}
