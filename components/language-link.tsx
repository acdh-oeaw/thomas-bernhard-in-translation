import { AppLink } from "./app-link";

interface LanguageLinkProps {
	language: string;
}

export function LanguageLink(props: LanguageLinkProps) {
	return <AppLink href={`/languages?language=${props.language}`}>{props.language}</AppLink>;
}
