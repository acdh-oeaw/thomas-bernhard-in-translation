import type { Translator } from "@/lib/model";

import { AppLink } from "./app-link";

interface TranslatorLinkProps {
	translator?: Translator;
	translatorName?: string;
}

export function TranslatorLink({ translator, translatorName }: TranslatorLinkProps) {
	const name = translator ? translator.name : translatorName;
	return <AppLink href={`/search?translator=${encodeURIComponent(name!)}`}>{name!}</AppLink>;
}
