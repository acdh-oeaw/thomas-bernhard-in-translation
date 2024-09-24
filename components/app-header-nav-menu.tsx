"use client";
import { useTranslations } from "next-intl";
import { type ReactNode, useId, useState } from "react";

import { AppNavLink } from "@/components/app-nav-link";
import type { LinkProps } from "@/components/link";
import { createHref } from "@/lib/create-href";
import { otherCategories, proseCategories } from "@/lib/model";
import { usePathname } from "@/lib/navigation";

import { DisclosureButton } from "./disclosure-button";

export function AppHeaderNavMenu(): ReactNode {
	const t = useTranslations("AppHeader");
	const catt = useTranslations("BernhardCategories");

	const links = {
		home: { href: createHref({ pathname: "/" }), label: t("links.home") },
		languages: {
			href: createHref({ pathname: "/languages" }),
			label: t("links.languages"),
		},
		translators: {
			href: createHref({ pathname: "/translators" }),
			label: t("links.translators"),
		},
		search: {
			href: createHref({ pathname: "/search" }),
			label: t("links.search"),
		},
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

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

	return (
		<nav aria-label={t("navigation-primary")}>
			<ul className="flex h-10 items-center gap-4 text-sm" role="list">
				{Object.entries(links).map(([id, link]) => {
					return (
						<li key={id}>
							<AppNavLink
								href={link.href}
								onClick={() => {
									setWorksMenuOpen(false);
								}}
							>
								{link.label}
							</AppNavLink>
						</li>
					);
				})}
				<li>
					<DisclosureButton
						controls={worksMenu}
						label={t("links.works")}
						setState={setWorksMenuOpen}
						state={worksMenuOpen}
					/>
				</li>
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
							<AppNavLink key={c} href={`/works/${c}`}>
								{catt(c)}
							</AppNavLink>
						);
					})}
				</ul>
			) : null}
		</nav>
	);
}
