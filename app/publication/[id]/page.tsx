import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

import { getChildren, getPublication, getSameLanguagePublications, getWork } from "@/app/data";
import { ClickablePublicationThumbnail, PublicationCover } from "@/components/publication-cover";

interface PublicationPageProps {
	params: {
		id: string;
	};
}

export default function PublicationPage(props: PublicationPageProps) {
	const t = useTranslations("PublicationPage");
	const pub = getPublication(props.params.id);
	if (!pub) {
		return notFound();
	}
	const later = getChildren(pub);
	return (
		<>
			<h1 className="font-bold">{pub.title}</h1>
			<h2 className="italic">{pub.categories.join(", ")}</h2>
			<div className="flex flex-initial">
				<div className="relative w-40 flex-auto">
					<PublicationCover publication={pub} />
				</div>
				<div className="flex-auto">
					<p className="italic">{pub.language}</p>
					<p>{t("translated_by")} ...</p>
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
						{pub.contains
							.map((t) => {
								return getWork(String(t.work))?.title;
							})
							.join(" / ")}
					</p>

					{later ? (
						<>
							<p className="font-bold">{t("later_editions")}</p>
							<div className="flex">...</div>
						</>
					) : null}

					<p className="font-bold">
						{t("more_in")} {pub.language}
					</p>
					<div className="flex">
						{getSameLanguagePublications(pub).map((p) => {
							return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
						})}
					</div>
				</div>
			</div>
		</>
	);
}
