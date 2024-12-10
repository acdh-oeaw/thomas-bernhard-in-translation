import type { ReactNode } from "react";

import type { Publication } from "@/lib/model";

import { ClickablePublicationThumbnail } from "./publication-cover";

interface PublicationGridProps {
	publications: Array<Publication>;
}

export function PublicationGrid(props: PublicationGridProps): ReactNode {
	return (
		<ol className="m-4 grid grid-cols-1 justify-items-center md:grid-cols-4">
			{props.publications.map((pub) => {
				return (
					<li key={pub.id} className="m-4 block size-44">
						<ClickablePublicationThumbnail publication={pub} />
					</li>
				);
			})}
		</ol>
	);
}
