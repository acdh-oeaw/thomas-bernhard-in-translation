"use client";
import { useTranslations } from "next-intl";
import { type MouseEventHandler, type ReactNode, useId, useState } from "react";

import { AppNavLink } from "@/components/app-nav-link";
import { createHref } from "@/lib/create-href";
import { otherCategories, proseCategories } from "@/lib/model";
import { usePathname } from "@/lib/navigation";

import { DisclosureButton } from "./disclosure-button";

interface AppHeaderNavMenuLinkProps {
	href: string;
	label: string;
	onClick: MouseEventHandler<HTMLAnchorElement>;
}

function AppHeaderNavMenuLink({ href, label, onClick }: AppHeaderNavMenuLinkProps) {
	return (
		<AppNavLink className="lowercase" href={href} onClick={onClick}>
			{label}
		</AppNavLink>
	);
}

export function AppHeaderNavMenu(): ReactNode {
	const t = useTranslations("AppHeader");
	const catt = useTranslations("BernhardCategories");

	const worksMenu = useId();
	const proseMenu = useId();

	// disclosures might start off open if we first land on a work page
	const pathname = usePathname();
	const [proseMenuOpen, setProseMenuOpen] = useState(
		proseCategories.some((c) => {
			return pathname.startsWith(`/works/${c}`);
		}),
	);
	const [worksMenuOpen, setWorksMenuOpen] = useState(
		proseMenuOpen ||
			otherCategories.some((c) => {
				return pathname.startsWith(`/works/${c}`);
			}),
	);

	const closeMenus = () => {
		setWorksMenuOpen(false);
		setProseMenuOpen(false);
	};

	const topLevelItems = {
		home: (
			<AppHeaderNavMenuLink
				href={createHref({ pathname: "/" })}
				label={t("links.home")}
				onClick={closeMenus}
			/>
		),
		works: (
			<DisclosureButton
				controls={worksMenu}
				label={t("links.works")}
				setState={setWorksMenuOpen}
				state={worksMenuOpen}
			/>
		),
		languages: (
			<AppHeaderNavMenuLink
				href={createHref({ pathname: "/languages" })}
				label={t("links.languages")}
				onClick={closeMenus}
			/>
		),
		translators: (
			<AppHeaderNavMenuLink
				href={createHref({ pathname: "/translators" })}
				label={t("links.translators")}
				onClick={closeMenus}
			/>
		),
		search: (
			<AppHeaderNavMenuLink
				href={createHref({ pathname: "/publications" })}
				label={t("links.search")}
				onClick={closeMenus}
			/>
		),
	};

	return (
		<nav aria-label={t("navigation-primary")}>
			<ul className="flex h-10 items-center gap-4 text-sm" role="list">
				{Object.entries(topLevelItems).map(([id, item]) => {
					return <li key={id}>{item}</li>;
				})}
			</ul>
			{worksMenuOpen ? (
				<ul className="flex h-10 items-center gap-4 text-sm" id={worksMenu} role="list">
					<li>
						<DisclosureButton
							controls={proseMenu}
							label={catt("prose")}
							setState={setProseMenuOpen}
							state={proseMenuOpen}
						/>
					</li>
					{otherCategories.map((c) => {
						return (
							<AppNavLink
								key={c}
								className="lowercase"
								href={`/works/${c}`}
								onClick={() => {
									setProseMenuOpen(false);
								}}
							>
								{catt(c)}
							</AppNavLink>
						);
					})}
				</ul>
			) : null}
			{worksMenuOpen && proseMenuOpen ? (
				<ul className="flex h-10 items-center gap-4 text-sm" id={proseMenu} role="list">
					{proseCategories.map((c) => {
						return (
							<AppNavLink key={c} className="lowercase" href={`/works/${c}`}>
								{catt(c)}
							</AppNavLink>
						);
					})}
				</ul>
			) : null}
		</nav>
	);
}
