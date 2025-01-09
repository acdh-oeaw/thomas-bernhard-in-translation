import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BernhardWorkLink } from "@/components/bernhard-links";
import { InlineList } from "@/components/inline-list";
import { LanguageLink } from "@/components/language-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail, PublicationCover } from "@/components/publication-cover";
import { PublisherLink } from "@/components/publisher-link";
import { TranslatorLink } from "@/components/translator-link";
import { getPublication, getSameLanguagePublications } from "@/lib/data";
import type { Publication, Translator } from "@/lib/model";

import { NameValue, PublicationDetails } from "./PublicationDetails";

interface PublicationPageProps {
	params: {
		id: string;
	};
}

// extract all unique translators, and the indices of their translations within this publication
function translatorIndices(pub: Publication): Array<[Translator, Array<number>]> {
	return pub.contains.reduce<Array<[Translator, Array<number>]>>((acc, translation, i) => {
		translation.translators.forEach((translator) => {
			const tupel = acc.find((candidate) => {
				return candidate[0].id === translator.id;
			});
			if (tupel === undefined) {
				acc.push([translator, [i]]);
			} else {
				tupel[1].push(i);
			}
		});
		return acc;
	}, []);
}

export default async function PublicationPage(props: PublicationPageProps) {
	const t = await getTranslations("PublicationPage");
	const ct = await getTranslations("BernhardCategories");
	const lt = await getTranslations("Languages");
	const pub = await getPublication(props.params.id);
	if (!pub) {
		return notFound();
	}

	// array of (Publication) promises
	const earlier = pub.parents?.map((id) => {
		return getPublication(id);
	});

	// array of (Publication) promises
	const later = pub.later?.map((id) => {
		return getPublication(id);
	});

	const translatorInfo = translatorIndices(pub);
	// don't show translator/translation indices when all translations are authored by all translators
	const showIndices = translatorInfo.some(([_t, is]) => {
		return is.length !== pub.contains.length;
	});

	return (
		<MainContent className="mx-auto w-fit max-w-fit p-4">
			<h1 className="max-w-screen-lg text-3xl font-bold">{pub.title}</h1>
			<p className="py-3 lowercase italic">
				{Array.from(
					new Set(
						pub.contains.flatMap((t) => {
							return t.work.category;
						}),
					),
				)
					.map((cat) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return ct(cat as any);
					})
					.join(" / ")}
			</p>
			<div className="m-auto justify-center gap-8 py-8 md:flex md:flex-row">
				<div className="relative mt-4 h-full grow basis-1 md:max-w-[30vw]">
					<PublicationCover className="object-left-top" publication={pub} />
				</div>
				<div className="max-w-prose grow basis-1">
					<PublicationDetails>
						<NameValue name={t("language")}>
							<LanguageLink language={pub.language} />
						</NameValue>
						<NameValue name={t("translated_by")}>
							{translatorInfo.length ? (
								<InlineList separator=" / ">
									{translatorInfo.map((t, i) => {
										return (
											<span key={i} className="text-nowrap">
												<TranslatorLink translator={t[0]} />
												{showIndices ? <sup>{i + 1}</sup> : null}
											</span>
										);
									})}
								</InlineList>
							) : (
								<span className="italic">{t("unknown")}</span>
							)}
						</NameValue>
						<NameValue name={t("publisher")}>
							<PublisherLink publisher={pub.publisher} /> {pub.publication_details}
						</NameValue>
						<NameValue name={t("year")}>{pub.year_display ?? pub.year}</NameValue>
					</PublicationDetails>
					<NameValue name={t("contains")}>
						<InlineList separator=" / ">
							{pub.contains.map((t, itranslation) => {
								return (
									<span key={itranslation}>
										{t.title}
										<sup>
											{showIndices
												? translatorInfo
														.reduce<Array<number>>((acc, [_t, is], itranslator) => {
															return is.includes(itranslation) ? [...acc, itranslator + 1] : acc;
														}, [])
														.join(",")
												: null}
										</sup>{" "}
										[
										<BernhardWorkLink
											key={t.work.id}
											display_title={t.work_display_title}
											work={t.work}
										/>
										]
									</span>
								);
							})}
						</InlineList>
					</NameValue>
				</div>
			</div>

			{earlier ? (
				<>
					<h2 className="pt-10 font-bold lowercase">{t("earlier_editions")}</h2>
					<div className="flex flex-wrap">
						{earlier.map(async (pp) => {
							const p = await pp;
							return (
								<div key={p!.id} className="size-44 p-4">
									<ClickablePublicationThumbnail publication={p!} />
								</div>
							);
						})}
					</div>
				</>
			) : null}

			{later ? (
				<>
					<h2 className="pt-10 font-bold lowercase">{t("later_editions")}</h2>
					<div className="flex flex-wrap">
						{later.map(async (pp) => {
							const p = await pp;
							return (
								<div key={p!.id} className="size-44 p-4">
									<ClickablePublicationThumbnail publication={p!} />
								</div>
							);
						})}
					</div>
				</>
			) : null}

			<section>
				<h2 className="pt-10 font-bold lowercase">
					{t("more_in")}{" "}
					{
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						lt(pub.language as any)
					}
				</h2>
				<div className="flex">
					{(await getSameLanguagePublications(pub)).map((p) => {
						return (
							<div key={p.id} className="size-44 p-4">
								<ClickablePublicationThumbnail publication={p} />
							</div>
						);
					})}
				</div>
			</section>
		</MainContent>
	);
}
