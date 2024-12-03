import { useTranslations } from "next-intl";

import { AppLink } from "./app-link";

interface LanguageLinkProps {
	language: string;
}

export function LanguageLink(props: LanguageLinkProps) {
	const t = useTranslations("Languages");
	return (
		<AppLink className="lowercase" href={`/languages?language=${props.language}`}>
			{
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				t(props.language as any)
			}
		</AppLink>
	);
}
