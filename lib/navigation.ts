import { createSharedPathnamesNavigation } from "next-intl/navigation";
import type { ComponentPropsWithRef, FC } from "react";

import { locales } from "@/config/i18n.config";

const {
	Link,
	redirect: _redirect,
	usePathname,
	useRouter,
	// eslint-disable-next-line @typescript-eslint/no-deprecated
} = createSharedPathnamesNavigation({
	locales,
});

/** FIXME: @see https://github.com/amannn/next-intl/issues/823 */
const redirect: typeof _redirect = _redirect;

export { redirect, usePathname, useRouter };

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof Link>, "href"> & {
	href?: string | undefined;
};

export const LocaleLink = Link as FC<LocaleLinkProps>;
