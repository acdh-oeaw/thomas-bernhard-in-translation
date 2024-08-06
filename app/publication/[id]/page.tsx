import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { getChildren, getPublication, getSameLanguagePublications } from "@/app/data";
import { AppLink } from "@/components/app-link";
import { BernhardWorkLink } from "@/components/bernhard-links";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail, PublicationCover } from "@/components/publication-cover";
import type { Publication } from "@/types/model";

interface PublicationPageProps {
	params: {
		id: string;
	};
}

function intersperseJsx(children: Array<ReactNode>) {
	return (
		<>
			{children.map((e, i) => {
				return i === 0 ? e : <> / {e}</>;
			})}
		</>
	);
}

// return a React.Component array of links to all unique translators
function formatTranslators(pub: Publication) {
	{
		const uniqueTranslators = pub.contains.flatMap((translation) => {
			// TODO filter unique and concat
			// TODO add superscripts
			return translation.translators;
		});
		return intersperseJsx(
			uniqueTranslators.map((t) => {
				return (
					<AppLink key={t.id} href={`/translator/${t.id}`}>
						{t.name}
					</AppLink> // FIXME add commas by mapping over the JSX elements
				);
			}),
		);
	}
}

export default function PublicationPage(props: PublicationPageProps) {
	const t = useTranslations("PublicationPage");
	const pub = getPublication(props.params.id);
	if (!pub) {
		return notFound();
	}
	const later = getChildren(pub);
	return (
		<MainContent className="">
			<h1 className="font-bold">{pub.title}</h1>
			<h2 className="italic">{pub.categories.join(", ")}</h2>
			<div className="flex gap-8">
				<PublicationCover className="h-96 grow basis-1/3" publication={pub} />
				<div className="grow-[2] basis-2/3">
					<p className="italic">{pub.language}</p>
					<p>
						{t("translated_by")} {formatTranslators(pub)}
					</p>
					{/* TODO map over all works, find unique translators? */}
					<p>{pub.year}</p>
					<p className="italic">{t("contains")}</p>
					<p>
						{pub.contains
							.map((t) => {
								return t.title; // title of the translation
							})
							.join(" / ")}
					</p>
					<p>
						{intersperseJsx(
							pub.contains.map((t) => {
								return <BernhardWorkLink key={t.work.id} work={t.work} />;
							}),
						)}
					</p>
				</div>
			</div>

			{later ? (
				<>
					<p className="font-bold">{t("later_editions")}</p>
					<div className="flex">
						{later.map((p) => {
							return (
								<div key={p.signatur}>
									<ClickablePublicationThumbnail publication={p} />
								</div>
							);
						})}
					</div>
				</>
			) : null}

			<section>
				<h2 className="font-bold">
					{t("more_in")} {pub.language}
				</h2>
				<div className="flex">
					{getSameLanguagePublications(pub).map((p) => {
						return (
							<ClickablePublicationThumbnail key={p.signatur} className="size-44" publication={p} />
						);
					})}
				</div>
			</section>
		</MainContent>
	);
}
