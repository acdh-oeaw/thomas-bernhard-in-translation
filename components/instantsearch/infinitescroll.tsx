import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import { useInfiniteHits } from "react-instantsearch";

import type { Publication } from "@/lib/model";

import { PublicationGrid } from "../publication-grid";
import { Button } from "../ui/button";

export function InfiniteScroll(): ReactNode {
	const t = useTranslations("InstantSearch");
	const { items, isLastPage, showMore } = useInfiniteHits<Publication>();
	const sentinelRef = useRef(null);
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (sentinelRef.current !== null) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isLastPage) {
						showMore();
						// showMore && showMore();
					}
				});
			});

			observer.observe(sentinelRef.current);

			return () => {
				observer.disconnect();
			};
		}
		return () => {
			return null;
		};
	}, [isLastPage, showMore]);

	return (
		<div className="absolute grid size-full grid-rows-[1fr_auto] overflow-y-auto">
			<PublicationGrid publications={items} />
			{isLastPage ? (
				<hr className="m-auto mt-8 w-1/3" />
			) : (
				<div ref={sentinelRef} className="text-center">
					<Button
						onPress={() => {
							showMore();
						}}
					>
						{t("show_more")}
					</Button>
				</div>
			)}
		</div>
	);
}
