import type { Hit } from "instantsearch.js";
import type { ReactNode } from "react";
import { Hits } from "react-instantsearch";

import type { Publication } from "@/lib/model";

import { PublicationLink } from "./publication-link";

function TableRow({ hit }: { hit: Hit<Publication> }) {
	return (
		<>
			<PublicationLink publication={hit} /> ({hit.year_display})
		</>
	);
}

export function PaginatedTable(): ReactNode {
	return <Hits hitComponent={TableRow} />;
}
