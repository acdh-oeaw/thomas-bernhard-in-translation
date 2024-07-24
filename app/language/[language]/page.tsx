import LanguagesPage from "../page";

interface LanguagePageProps {
	params: {
		language?: string;
	};
}
export default function LanguagePage(props: LanguagePageProps) {
	return <LanguagesPage language={props.params.language} />;
}
