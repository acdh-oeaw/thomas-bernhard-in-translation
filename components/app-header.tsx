import type { ReactNode } from "react";

import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";
import { Link } from "@/components/link";

import { AppHeaderNavMenu } from "./app-header-nav-menu";

export function AppHeader(): ReactNode {
	return (
		<header className="border-b">
			<div className="container flex items-center justify-between gap-4 py-6">
				<div className="flex flex-col">
					<Link className="font-bold" href="/">
						thomas bernhard in translation
					</Link>
				</div>
				<AppHeaderNavMenu />
				<div className="flex items-center gap-4">
					<ColorSchemeSwitcher />
				</div>
			</div>
		</header>
	);
}
