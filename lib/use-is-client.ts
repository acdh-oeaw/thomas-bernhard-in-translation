import { noop } from "@acdh-oeaw/lib";
import { useSyncExternalStore } from "react";

function subscribe() {
	return noop;
}

export function useIsClient() {
	const isClientOnly = useSyncExternalStore(
		subscribe,
		() => {
			return true;
		},
		() => {
			return false;
		},
	);

	return isClientOnly;
}
