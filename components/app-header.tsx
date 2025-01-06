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
		<header className="mx-auto grid w-full max-w-screen-xl auto-cols-auto grid-flow-col gap-6 border-b p-6">
			<div className="flex flex-col justify-center">
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
