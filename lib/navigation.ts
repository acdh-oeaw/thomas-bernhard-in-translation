// eslint-disable-next-line no-restricted-imports
import NextLink from "next/link";
import type { ComponentPropsWithRef, FC } from "react";

// eslint-disable-next-line no-restricted-imports
export { redirect, usePathname, useRouter } from "next/navigation";

export type LocaleLinkProps = Omit<ComponentPropsWithRef<typeof NextLink>, "href"> & {
	href?: string | undefined;
};

export const LocaleLink = NextLink as FC<LocaleLinkProps>;
