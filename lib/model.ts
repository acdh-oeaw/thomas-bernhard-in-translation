// these end up in public URLs as slugs, so come up with good names!
export const otherCategories = ["drama", "poetry", "letterspeechinterview", "adaptations"] as const;
export const proseCategories = ["novels", "novellas", "autobiography", "fragments"] as const;

export type Category = (typeof otherCategories)[number] | (typeof proseCategories)[number];

/** Publication contains one or more translated works. */
export interface Publication {
	id: string;
	signatur: string;
	title: string;
	language: string;
	contains: Array<Translation>;

	// whether this publication contains at least one previously unpublished translation
	erstpublikation: boolean;

	// ids of publications which contain re-prints of some of the translations first published in this
	// publication. this field is inferred from the 'eltern' column in openrefine.
	later?: Array<string>;
	year: number;
	year_display: string;
	isbn?: string;
	publisher: Publisher;
	exemplar_suhrkamp_berlin: boolean;
	exemplar_oeaw: boolean;
	images: Array<Asset>;
	has_image: boolean; // workaround for https://github.com/typesense/typesense/issues/790
}

export interface Translation {
	id: string;
	title: string; // translated title,
	work: BernhardWork;

	// the original work title of a translation might deviate from the canonical title of the original
	// work, e.g. adding '(Auswahl)' etc).
	work_display_title?: string;
	translators: Array<Translator>;
	// erstpublikation?: string;
}

export interface BernhardWork {
	id: string;
	title: string; // german/french original
	short_title?: string; // abbreviated title, commonly used for letters
	gnd?: string;
	year?: number;
	category?: Category;
}

export interface Translator {
	id: string;
	name: string; // "Family Name, Given Name(s)"
	gnd?: string;
	wikidata?: string;
}

interface Publisher {
	id: string;
	name: string;
}

interface Asset {
	id: string; // same as filename (without extension, which is .jpg)
	metadata?: string;
}
