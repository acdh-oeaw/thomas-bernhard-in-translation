import type { Hit } from "instantsearch.js";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Pagination, useHits } from "react-instantsearch";

import type { Publication } from "@/lib/model";

import { InlineList } from "../inline-list";
import { ClickablePublicationThumbnail } from "../publication-cover";
import { PublicationLink } from "../publication-link";

function TableRow({ hit }: { hit: Hit<Publication> }) {
	const lt = useTranslations("Languages");
	const translators = [
		...new Set(
			hit.contains.flatMap((tr) => {
				return tr.translators.flatMap((trs) => {
					return trs.name;
				});
			}),
		),
	];
	const workTitles = hit.contains.map((tr) => {
		return tr.work.title;
	});
	return (
		<div className="grid grid-cols-[12rem_1fr] items-center gap-2 px-4 py-6">
			<div className="size-44">
				<ClickablePublicationThumbnail publication={hit} />
			</div>
			<div className="flex flex-col">
				<div className="text-xl">
					<PublicationLink publication={hit} /> ({hit.year_display})
				</div>
				<div>
					<InlineList limit={3} separator=" / ">
						{workTitles.map((wt, i) => {
							return (
								<span key={i} className="italic">
									{wt}
								</span>
							);
						})}
					</InlineList>
				</div>
				<div>
					<InlineList limit={3} separator=" / ">
						{translators.map((tr, i) => {
							return <span key={i}>{tr}</span>;
						})}
					</InlineList>
				</div>
				<div className="lowercase">
					{
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						lt(hit.language as any)
					}
				</div>
			</div>
		</div>
	);
}

function TBPagination(): ReactNode {
	return (
		<Pagination
			classNames={{
				disabledItem: "text-[--color-on-secondary] bg-[--color-secondary]",
				item: "min-w-10 mx-0.5 text-[--color-link]",
				link: "border text-center inline-block py-1 px-2 rounded w-full",
				list: "flex",
				root: "w-fit self-center justify-self-center my-1",
				selectedItem: "text-[--color-primary] border border-[--color-focus-ring] rounded",
			}}
		/>
	);
}

export function PaginatedTable(): ReactNode {
	const { items } = useHits<Publication>();
	return (
		<div className="absolute w-full">
			<TBPagination />
			{items.map((item) => {
				return <TableRow key={item.id} hit={item} />;
			})}
			<TBPagination />
		</div>
	);
}
