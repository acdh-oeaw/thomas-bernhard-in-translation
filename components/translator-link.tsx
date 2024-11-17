import type { Translator } from "@/lib/model";

import { AppLink } from "./app-link";

interface TranslatorLinkProps {
	translator: Translator;
}

export function TranslatorLink(props: TranslatorLinkProps) {
	return (
		<AppLink href={`/search?translator=${props.translator.id.toString()}`}>
			{props.translator.name}
		</AppLink>
	);
}
