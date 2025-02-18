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
		<div className="absolute grid w-full grid-rows-[1fr_auto]">
			<PublicationGrid publications={items} />
			{isLastPage ? (
				<hr className="mx-auto my-12 w-1/4 border-[--color-primary]" />
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
