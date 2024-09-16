import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BernhardWorkLink } from "@/components/bernhard-links";
import { InlineList } from "@/components/inline-list";
import { LanguageLink } from "@/components/language-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail, PublicationCover } from "@/components/publication-cover";
import { TranslatorLink } from "@/components/translator-link";
import { getPublication, getSameLanguagePublications } from "@/lib/data";
import type { Publication, Translator } from "@/lib/model";

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
	const pub = await getPublication(props.params.id);
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!pub) {
		return notFound();
	}

	const later =
		// TODO database should just return null instead of empty arrays wherever possible
		pub.later?.length === 0
			? undefined
			: pub.later?.map((id) => {
					return getPublication(id);
				});

	const translatorInfo = translatorIndices(pub);
	// don't show translator/translation indices when all translations are authored by all translators
	const showIndices = translatorInfo.some(([_t, is]) => {
		return is.length !== pub.contains.length;
	});

	return (
		<MainContent className="">
			<h1 className="font-bold">{pub.title}</h1>
			<h2 className="italic">{pub.categories.join(", ")}</h2>
			<div className="flex gap-8">
				<PublicationCover className="h-96 grow basis-1/3" publication={pub} />
				<div className="grow-[2] basis-2/3">
					<p className="italic">
						<LanguageLink language={pub.language} />
					</p>
					<p>
						{t("translated_by")}{" "}
						<InlineList>
							{translatorInfo.map((t, i) => {
								return (
									<>
										<TranslatorLink translator={t[0]} />
										{showIndices ? <sup>{i + 1}</sup> : null}
									</>
								);
							})}
						</InlineList>
					</p>
					<p>{pub.year}</p>
					<p className="italic">{t("contains")}</p>
					<p>
						<InlineList separator=" / ">
							{pub.contains.map((t, itranslation) => {
								return (
									<>
										{t.title}
										<sup>
											{showIndices
												? translatorInfo
														.reduce<Array<number>>((acc, [_t, is], itranslator) => {
															return is.includes(itranslation) ? [...acc, itranslator + 1] : acc;
														}, [])
														.join(",")
												: null}
										</sup>
									</>
								);
							})}
						</InlineList>
					</p>
					<p>
						<InlineList separator=" / ">
							{pub.contains.map((t) => {
								return <BernhardWorkLink key={t.work.id} work={t.work} />;
							})}
						</InlineList>
					</p>
				</div>
			</div>

			{later ? (
				<>
					<p className="font-bold">{t("later_editions")}</p>
					<div className="flex">
						{later.map(async (pp) => {
							const p = await pp;
							return (
								<div key={p.id}>
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
					{(await getSameLanguagePublications(pub)).map((p) => {
						return <ClickablePublicationThumbnail key={p.id} className="size-44" publication={p} />;
					})}
				</div>
			</section>
		</MainContent>
	);
}
