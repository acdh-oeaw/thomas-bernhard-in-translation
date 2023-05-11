import type { Locale } from "@/config/i18n.config";
import type metadata from "@/content/en/metadata/index.json";
import type messages from "@/messages/en.json";

declare global {
	type Messages = typeof messages & { metadata: typeof metadata };

	interface IntlMessages extends Messages {}
}

declare module "next-intl" {
	export function useLocale(): Locale;
}

declare module "next-intl/server" {
	export function getLocale(): Promise<Locale>;
}
