"use client";

import {
	ArrowDownAZ,
	CalendarArrowDown,
	CalendarArrowUp,
	LayoutGrid,
	LayoutList,
	Search,
	X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button, Input, Label, SearchField, Switch } from "react-aria-components";
import { useHits, useSearchBox } from "react-instantsearch";

import type { Publication } from "@/lib/model";

import { InfiniteScroll } from "./infinitescroll";
import { PaginatedTable } from "./paginated-table";
import { InstantSearchSortBy } from "./sortby";
import { InstantSearchStats } from "./stats";

interface ResultsProps {
	className?: string;
	children?: ReactNode;
}

const sortOptions = {
	"year:asc": CalendarArrowDown,
	"year:desc": CalendarArrowUp,
	"title:asc": ArrowDownAZ,
};

export function Results(props: ResultsProps): ReactNode {
	const t = useTranslations("InstantSearch");

	// TODO encode current state in URL
	const [view, setView] = useState<"covers" | "detail">("covers");

	// scroll to top on query/language/page change
	const top = useRef<HTMLDivElement>(null);
	const { results } = useHits<Publication>();
	useEffect(() => {
		if (view === "covers" && results?.page) {
			// don't scroll up if the new results are just an expansion of the infinitescroll
			return;
		}
		top.current?.scrollIntoView();
	}, [results, view]);

	const { query, refine } = useSearchBox();

	return (
		<div className="grid h-full grid-rows-[auto_1fr]">
			<div className="flex flex-wrap place-content-between items-center justify-end gap-6 py-3 pl-1 pr-6">
				<SearchField
					// vertically align clear button
					className="flex items-center"
					onChange={(v) => {
						refine(v);
					}}
					value={query}
				>
					<Search size={20} />
					<Label className="sr-only">{t("query_label")}</Label>
					<Input
						className="mx-2 rounded-sm border-2 p-1 pl-2"
						placeholder={t("query_placeholder")}
					/>
					<Button
						onPress={() => {
							refine("");
						}}
					>
						<span className="sr-only">{t("clear_query")}</span>
						<X className="not-sr-only" size={20} />
					</Button>
				</SearchField>
				<span className="ml-5 grow">
					<InstantSearchStats />
				</span>
				<InstantSearchSortBy sortOptions={sortOptions} />
				{props.children}
				<Switch
					className="react-aria-Switch"
					isSelected={view === "detail"}
					onChange={(isSelected) => {
						setView(isSelected ? "detail" : "covers");
					}}
				>
					<LayoutGrid size={18} />
					<div className="indicator" />
					<LayoutList size={18} />
					<span className="sr-only">{t("view.table")}</span>
				</Switch>
			</div>
			<div className="relative overflow-y-auto">
				<div ref={top} className="not-sr-only"></div>
				{view === "covers" ? <InfiniteScroll /> : <PaginatedTable />}
			</div>
		</div>
	);
}
