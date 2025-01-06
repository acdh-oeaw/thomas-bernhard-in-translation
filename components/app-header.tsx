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
		<header className="mx-auto grid w-full max-w-screen-xl auto-cols-auto grid-flow-col gap-4 border-b p-6">
			<div className="mr-20 mt-2 flex flex-col">
				<Link className="font-bold lowercase" href={createHref({})}>
					{t("title")}
				</Link>
			</div>
			<AppHeaderNavMenu />
			<div className="flex items-center gap-4">
				<ColorSchemeSwitcher />
				<LocaleSwitcher />
			</div>
		</header>
	);
}
