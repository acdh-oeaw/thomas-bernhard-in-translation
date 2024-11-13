import type { ReactNode } from "react";

import { InstantSearch } from "./instantsearch";
import { SingleRefinementList } from "./single-refinement-list";

interface SingleRefinementInstantSearchProps {
	queryArg: string;
	field: string;
}

export function SingleRefinementInstantSearch(
	props: SingleRefinementInstantSearchProps,
): ReactNode {
	const { queryArg, field } = props;

	return (
		// FIXME wrong queryArg
		<InstantSearch queryArgsToRefinementFields={{ queryArg: field }}>
			<SingleRefinementList attribute={field} placeholder="foo" />
		</InstantSearch>
	);
}
