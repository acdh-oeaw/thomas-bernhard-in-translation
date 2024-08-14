import { useTranslations } from "next-intl";

// import { useEffect, useState } from "react";
import { getPublications, getWorks } from "@/app/data";
import { AppNavLink } from "@/components/app-nav-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { PublicationGrid } from "@/components/publication-grid";
import { Category } from "@/types/model";

interface WorkPageProps {
	params: {
		args: [Category?, string?];
	};
}

export default function WorkPage(props: WorkPageProps) {
	const catt = useTranslations("BernhardCategories");
	const _t = useTranslations("WorkPage");

	const category = props.params.args[0];
	// const [category, _setCategory] = useState<Category | undefined>(props.params.args[0]);
	// const [workId, setWorkId] = useState<string | undefined>(props.params.args[1]);

	// query result based on category
	// const [works, _setWorks] = useState<Array<BernhardWork>>(getWorks(category));
	const works = getWorks(category);
	const publications = getPublications({ erstpublikation: true }, category, "", 0, 0);
	// // query result based on id (and language?)
	// const [publications, setPublications] = useState<Array<Publication>>([]);

	// useEffect(() => {
	// 	setPublications(getPublications({ erstpublikation: true }));
	// }, [workId]);

	//if (false) {
	//	//publicationTypes.includes(category)) {
	//	// setWorks(getWorks(category));
	//	if (workId) {
	//		const work = getWork(workId);
	//		if (!work) {
	//			return notFound();
	//		}
	//	}
	// }

	return (
		<MainContent className="">
			<div className="flex flex-wrap justify-center gap-4">
				{Object.keys(Category).map((c) => {
					return (
						<AppNavLink key={c} href={`/works/${c}`}>
							{
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								catt(c as any)
							}
						</AppNavLink>
					);
				})}
			</div>

			<div>
				{
					// category ? catt(category as any) : null
				}
				<ul>
					{works.map((w) => {
						return (
							<li key={w.id}>
								<AppNavLink href={`/works/${w.gnd ?? w.id}`}>
									{w.title} {w.year ? `(${String(w.year)})` : null}
								</AppNavLink>
							</li>
						);
					})}
				</ul>
			</div>
			<PublicationGrid>
				{publications.map((p) => {
					return <ClickablePublicationThumbnail key={p.id} publication={p} />;
				})}
			</PublicationGrid>
		</MainContent>
	);
}
