"use client";
import { useTranslations } from "next-intl";
import { useRefinementList } from "react-instantsearch";

// a refinement list that is alphabetically ordered and only allows filtering for one value
export function SingleRefinementList({ attribute }: { attribute: string }) {
	const t = useTranslations("SearchPage");
	const attributePath = attribute.split(".");
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	const attributeKey = `filter_by.${attributePath[attributePath.length - 1]}`;

	const { items, refine, searchForItems } = useRefinementList({
		attribute: attribute,
		limit: 1000,
		sortBy: ["name"],
	});
	return (
		<>
			<input
				autoCapitalize="off"
				autoComplete="off"
				autoCorrect="off"
				maxLength={512}
				onChange={(event) => {
					searchForItems(event.currentTarget.value);
				}}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				placeholder={`${t("filter")} ${t(attributeKey as any)}`}
				spellCheck={false}
				type="search"
			/>
			<ul>
				{items.map((item) => {
					return (
						<li key={item.label} className="py-0.5">
							<label>
								<input
									checked={item.isRefined}
									className="sr-only"
									onChange={() => {
										// first remove ALL active refinements
										items
											.filter((i) => {
												return i.isRefined;
											})
											.forEach((i) => {
												refine(i.value);
											});
										// then add new one (if it wasn't previously selected)
										if (!item.isRefined) {
											refine(item.value);
										}
									}}
									type="checkbox"
								/>
								<span
									className={`hover:cursor-pointer ${item.isRefined ? "font-medium text-on-background/80" : "text-on-background/60"}`}
								>
									{item.label} ({item.count})
								</span>
							</label>
						</li>
					);
				})}
			</ul>
		</>
	);
}
