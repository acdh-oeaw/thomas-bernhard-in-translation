// import type metadataDe from "@/content/de/metadata/index.json";
import type metadataEn from "@/content/en/metadata/index.json";
// import type de from "@/messages/de.json";
import type en from "@/messages/en.json";

export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isValidLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export interface Translations extends Record<Locale, IntlMessages> {
	// de: typeof de & { metadata: typeof metadataDe };
	en: typeof en & { metadata: typeof metadataEn };
}
