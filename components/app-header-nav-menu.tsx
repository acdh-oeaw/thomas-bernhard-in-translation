"use client";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";

import { AppNavLink } from "@/components/app-nav-link";
import { createHref } from "@/lib/create-href";
import { otherCategories, proseCategories } from "@/lib/model";
import { usePathname } from "@/lib/navigation";

import { DisclosureButton } from "./disclosure-button";

interface NavLinkItem {
	type: "link";
	href: string;
	label: string;
	onClick?: () => void;
}

interface NavDisclosureItem {
	type: "disclosure";
	controls: string;
	label: string;
	state: boolean;
	setState: (open: boolean) => void;
}

type NavItem = NavLinkItem | NavDisclosureItem;

function renderNavItem(item: NavItem): ReactNode {
	if (item.type === "link") {
		return (
			<AppNavLink className="lowercase" href={item.href} onClick={item.onClick}>
				{item.label}
			</AppNavLink>
		);
	}
	return (
		<DisclosureButton
			controls={item.controls}
			label={item.label}
			setState={item.setState}
			state={item.state}
		/>
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

	const topLevelItems: Record<string, NavItem> = {
		home: {
			type: "link",
			href: createHref({ pathname: "/" }),
			label: t("links.home"),
			onClick: closeMenus,
		},
		works: {
			type: "disclosure",
			controls: worksMenu,
			label: t("links.works"),
			state: worksMenuOpen,
			setState: setWorksMenuOpen,
		},
		languages: {
			type: "link",
			href: createHref({ pathname: "/languages" }),
			label: t("links.languages"),
			onClick: closeMenus,
		},
		translators: {
			type: "link",
			href: createHref({ pathname: "/translators" }),
			label: t("links.translators"),
			onClick: closeMenus,
		},
		about: {
			type: "link",
			href: createHref({ pathname: "/about" }),
			label: t("links.about"),
			onClick: closeMenus,
		},
		search: {
			type: "link",
			href: createHref({ pathname: "/search" }),
			label: t("links.search"),
			onClick: closeMenus,
		},
	};

	const worksMenuItems: Record<string, NavItem> = {
		prose: {
			type: "disclosure",
			controls: proseMenu,
			label: catt("prose"),
			state: proseMenuOpen,
			setState: setProseMenuOpen,
		},
		...Object.fromEntries<NavItem>(
			otherCategories.map((c): [string, NavItem] => {
				return [
					c,
					{
						type: "link",
						href: `/works/${c}`,
						label: catt(c),
						onClick: () => {
							setProseMenuOpen(false);
						},
					},
				];
			}),
		),
	};

	const proseMenuItems: Record<string, NavItem> = Object.fromEntries<NavItem>(
		proseCategories.map((c): [string, NavItem] => {
			return [c, { type: "link", href: `/works/${c}`, label: catt(c) }];
		}),
	);

	return (
		<nav aria-label={t("navigation-primary")} className="hidden flex-col justify-center lg:flex">
			<ul className="flex min-h-9 items-center gap-6 text-sm" role="list">
				{Object.entries(topLevelItems).map(([id, item]) => {
					return <li key={id}>{renderNavItem(item)}</li>;
				})}
			</ul>
			{worksMenuOpen ? (
				<ul
					className="mt-4 flex min-h-9 items-center gap-6 text-center text-sm leading-4"
					id={worksMenu}
					role="list"
				>
					{Object.entries(worksMenuItems).map(([id, item]) => {
						return <li key={id}>{renderNavItem(item)}</li>;
					})}
				</ul>
			) : null}
			{worksMenuOpen && proseMenuOpen ? (
				<ul
					className="mt-4 flex min-h-9 items-center gap-6 text-center text-sm leading-4"
					id={proseMenu}
					role="list"
				>
					{Object.entries(proseMenuItems).map(([id, item]) => {
						return <li key={id}>{renderNavItem(item)}</li>;
					})}
				</ul>
			) : null}
		</nav>
	);
}
