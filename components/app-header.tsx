import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import { Link } from "@/components/link";
import { createHref } from "@/lib/create-href";

import { AppHeaderNavMenu } from "./app-header-nav-menu";
import { LocaleSwitcher } from "./locale-switcher";

export function AppHeader(): ReactNode {
	const t = useTranslations("AppHeader");
	return (
		<header className="border-b">
			<div className="container flex items-start justify-between gap-4 py-6">
				<div className="flex flex-col">
					<Link className="font-bold lowercase" href={createHref({})}>
						{t("title")}
					</Link>
				</div>
				<AppHeaderNavMenu />
				<div className="flex items-center gap-4">
					<ColorSchemeSwitcher />
					<LocaleSwitcher />
				</div>
			</div>
		</header>
	);
}
