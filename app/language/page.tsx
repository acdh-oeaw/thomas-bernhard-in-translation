import { useTranslations } from "next-intl";

import { getLanguages, getPublications } from "@/app/data";
import { AppNavLink } from "@/components/app-nav-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { PublicationGrid } from "@/components/publication-grid";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";

interface LanguagesPageProps {
	language?: string;
}
export default function LanguagesPage(props: LanguagesPageProps) {
	const t = useTranslations("LanguagesPage");

	const ls = getLanguages();
	const filter = props.language ? { language: props.language } : undefined;

	const pubs = getPublications(filter);
	// TODO throw error if empty

	return (
		<MainContent>
			<div className="w-44">
				<span className="font-bold">{t("languages")}</span>
				<ul>
					{ls.map((l) => {
						return (
							<li key={l}>
								<AppNavLink href={`/language/${l}`}>{l}</AppNavLink>
							</li>
						);
					})}
				</ul>
			</div>
			<div>
				<div>
					<Select className=" w-44">
						<SelectTrigger>all works</SelectTrigger>
						<SelectContent></SelectContent>
					</Select>
				</div>
				<PublicationGrid>
					{pubs.map((p) => {
						return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
					})}
				</PublicationGrid>
			</div>
		</MainContent>
	);
}
