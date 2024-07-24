// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import { useTranslations } from "next-intl";

import { getLanguages, getPublications } from "@/app/data";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";

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
		<div className="flex">
			<div className="w-44">
				<span className="font-bold">{t("languages")}</span>
				<ul>
					{ls.map((l) => {
						return (
							<li key={l}>
								<Link href={`/language/${l}`}>{l}</Link>
							</li>
						);
					})}
				</ul>
			</div>
			<div>
				<select>
					<option>all works</option>
					<option>what&apos;s this dropdown??</option>
				</select>
				<div className="grid grid-cols-3">
					{pubs.map((p) => {
						return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
					})}
				</div>
			</div>
		</div>
	);
}
