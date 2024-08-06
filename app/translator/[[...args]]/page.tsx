import { useTranslations } from "next-intl";

import { getTranslator, getTranslators } from "@/app/data";
import { AppLink } from "@/components/app-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { PublicationGrid } from "@/components/publication-grid";
import type { Publication, Translator } from "@/types/model";

interface TranslatorPageProps {
	params: {
		args: [string?];
	};
}

export default function TranslatorPage(props: TranslatorPageProps) {
	const t = useTranslations("TranslatorPage");
	const { translator, publications } =
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		("args" in props.params ? getTranslator(props.params.args[0]!) : {}) as {
			translator: Translator;
			publications: Array<Publication>;
		};
	return (
		<MainContent>
			<div>
				<ul>
					{Object.entries(getTranslators()).map(([language, translators]) => {
						return (
							<>
								<h3 className="font-bold">{language}</h3>
								{Object.values(translators).map((t) => {
									return (
										<li key={t.id}>
											<AppLink href={`/translator/${t.id}`}>{t.name}</AppLink>
										</li>
									);
								})}
							</>
						);
					})}
				</ul>
			</div>
			<div>
				{
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					translator ? (
						<>
							<h2 className="font-bold">{translator.name}</h2>
							{t("published_in")}:
							<PublicationGrid>
								{publications.map((p) => {
									return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
								})}
							</PublicationGrid>
						</>
					) : null
				}
			</div>
		</MainContent>
	);
}
