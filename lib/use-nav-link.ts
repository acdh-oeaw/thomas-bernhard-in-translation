import { useSearchParams } from "next/navigation";

import type { LinkProps } from "@/components/link";
import { env } from "@/config/env.config";
import { createFullUrl } from "@/lib/create-full-url";
import { usePathname } from "@/lib/navigation";

interface UseNavLinkParams extends Pick<LinkProps, "aria-current" | "href"> {}

interface UseNavLinkReturnValue extends Pick<LinkProps, "aria-current"> {}

export function useNavLink(params: UseNavLinkParams): UseNavLinkReturnValue {
	const { "aria-current": ariaCurrent, href } = params;

	const pathname = usePathname();
	const searchParams = useSearchParams();

	if (ariaCurrent != null) {
		return {
			"aria-current": ariaCurrent,
		};
	}

	const url = createFullUrl({ pathname: href });

	// FIXME when a link href only has new search params (e.g. href="?x=y") the url.pathname is "/",
	// even though the actual target of the nav-link is whatever the browser's current window pathname is.
	// const isCurrent = url.origin === env.NEXT_PUBLIC_APP_BASE_URL && url.pathname === pathname;

	// fixed version which works for most cases but is a bit too eager (root path is always current)
	let isCurrent = url.origin === env.NEXT_PUBLIC_APP_BASE_URL && pathname.startsWith(url.pathname);

	// it's current if the href searchParams are a subset of the current pathname + search params
	for (const [key, value] of url.searchParams) {
		if (!searchParams.has(key) || searchParams.get(key) !== value) {
			isCurrent = false;
			break;
		}
	}

	return {
		"aria-current": isCurrent ? "page" : undefined,
	};
}
