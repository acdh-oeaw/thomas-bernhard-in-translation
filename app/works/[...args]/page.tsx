/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { useTranslations } from "next-intl";

import { AppNavLink } from "@/components/app-nav-link";
import { MainContent } from "@/components/main-content";
import { ClickablePublicationThumbnail } from "@/components/publication-cover";
import { PublicationGrid } from "@/components/publication-grid";
import { getPublications } from "@/lib/data";
import { type Category, otherCategories } from "@/lib/model";

interface WorkPageProps {
	params: {
		args: [Category?, string?];
	};
}

// eslint-disable-next-line @next/next/no-async-client-component
export default async function WorkPage(props: WorkPageProps) {
	const catt = useTranslations("BernhardCategories");
	const _t = useTranslations("WorkPage");

	const category = props.params.args[0];

	const publications = await getPublications({ q: "*", filter: { erstpublikation: true } });

	return (
		<MainContent className="">
			<div className="flex flex-wrap justify-center gap-4">
				{otherCategories.map((c) => {
					return (
						<AppNavLink key={c} href={`/works/${c}`}>
							{catt(c)}
						</AppNavLink>
					);
				})}
			</div>

			<div>
				{category}
				<ul></ul>
			</div>
			<PublicationGrid>
				{publications.map((p) => {
					return <ClickablePublicationThumbnail key={p.id} publication={p} />;
				})}
			</PublicationGrid>
		</MainContent>
	);
}
