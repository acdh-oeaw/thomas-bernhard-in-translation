import type { Hit } from "instantsearch.js";
import type { ReactNode } from "react";
import { Hits } from "react-instantsearch";

import type { Publication } from "@/lib/model";

import { ClickablePublicationThumbnail } from "./publication-cover";
import { PublicationLink } from "./publication-link";

function TableRow({ hit }: { hit: Hit<Publication> }) {
	return (
		<div className="flex flex-row items-center">
			<div className="mr-4 h-36 w-20">
				<ClickablePublicationThumbnail publication={hit} />
			</div>
			<div className="flex flex-col">
				<div className="text-xl">
					<PublicationLink publication={hit} /> ({hit.year_display})
				</div>
				<div>{hit.language}</div>
				<div>
					{
						hit.contains
							.flatMap((tr) => {
								return tr.translators.flatMap((trs) => {
									return trs.name;
								});
							})
							.slice(0, 3)
							.join(" / ")
						// TODO add '...' when more than 3
					}
				</div>
			</div>
		</div>
	);
}

export function PaginatedTable(): ReactNode {
	return <Hits hitComponent={TableRow} />;
}
