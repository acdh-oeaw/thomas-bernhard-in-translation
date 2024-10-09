import type { ReactNode } from "react";

import type { Publication } from "@/lib/model";

import { ClickablePublicationThumbnail } from "./publication-cover";

interface PublicationGridProps {
	publications: Array<Publication>;
}

export function PublicationGrid(props: PublicationGridProps): ReactNode {
	return (
		<ul className="m-2 grid h-fit grid-cols-1 justify-items-center md:grid-cols-4">
			{props.publications.map((pub) => {
				return (
					<li key={pub.id} className="block size-44 p-2">
						<ClickablePublicationThumbnail publication={pub} />
					</li>
				);
			})}
		</ul>
	);
}
