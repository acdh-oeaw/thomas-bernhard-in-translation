import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { AppNavLink } from "@/components/app-nav-link";
import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import type { LinkProps } from "@/components/link";
import { createHref } from "@/lib/create-href";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");

	const links = {
		home: { href: createHref({ pathname: "/" }), label: t("links.home") },
	} satisfies Record<string, { href: LinkProps["href"]; label: string }>;

	return (
		<header className="border-b">
			<div className="container flex items-center justify-between gap-4 py-6">
				<nav aria-label={t("navigation-primary")}>
					<ul className="flex items-center gap-4 text-sm" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<AppNavLink href={link.href}>{link.label}</AppNavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="flex items-center gap-4">
					<ColorSchemeSwitcher />
				</div>
			</div>
		</header>
	);
}
