"use client";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getPublications, getWork, getWorks } from "@/app/data";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import {
	type BernhardWork,
	type Category,
	type Publication,
	publicationTypes,
} from "@/types/model";

interface WorkPageProps {
	params: {
		args: [Category, string?];
	};
}

export default function WorkPage(props: WorkPageProps) {
	const catt = useTranslations("BernhardCategories");
	const _t = useTranslations("WorkPage");

	const [category, _setCategory] = useState<Category>(props.params.args[0]);
	const [workId, setWorkId] = useState<string>(props.params.args[1]);

	// query result based on category
	const [works, _setWorks] = useState<Array<BernhardWork>>(getWorks(category));
	// query result based on id (and language?)
	const [publications, setPublications] = useState<Array<Publication>>([]);

	useEffect(() => {
		setPublications(getPublications({ erstpublikation: true }));
	}, [workId]);

	if ((publicationTypes as unknown as Array<string>).includes(category)) {
		// setWorks(getWorks(category));
		if (workId) {
			const work = getWork(workId);
			if (!work) {
				return notFound();
			}
		}
	}

	// list all categories first -- we'll need this later anyway
	// const t = Publication.categories
	// {([c in Publication.categories].map(e => e)}
	return (
		<>
			<div className="flex gap-4 font-bold">
				{publicationTypes.map((c) => {
					return (
						<Link key={c} href={`/works/${c}`}>
							{c}
						</Link>
					);
				})}
			</div>

			<div className="flex">
				<div>
					{catt(category)}
					<ul>
						{works.map((w) => {
							return (
								<li key={w.id}>
									<button
										onClick={() => {
											setWorkId(w.gnd || w.id);
										}}
										type="button"
									>
										{w.title} {w.year ? `(${String(w.year)})` : null}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
				<div>
					{publications.map((p) => {
						return <ClickablePublicationThumbnail key={p.signatur} publication={p} />;
					})}
				</div>
			</div>
		</>
	);
}
