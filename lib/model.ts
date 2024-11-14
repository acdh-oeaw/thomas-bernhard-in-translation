// these end up in public URLs as slugs, so come up with good names!
export const otherCategories = ["drama", "poetry", "letterspeechinterview", "adaptations"] as const;
export const proseCategories = ["novels", "novellas", "autobiography", "fragments"] as const;

export type Category = (typeof otherCategories)[number] | (typeof proseCategories)[number];

// Publication contains one or more Translations
export interface Publication {
	id: number;
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
	year_display?: string;
	isbn?: string;
	publisher: string;

	// misc info that varies between publications of the same publisher
	// prime example: issue/page details when the 'publisher' is a periodical/magazine
	publication_details?: string;

	images: Array<Asset>;
	has_image: boolean; // redundant, derived from 'images' (workaround for https://github.com/typesense/typesense/issues/790)
}

export interface Translation {
	id: number;
	title: string; // translated title,
	work: BernhardWork;

	// the original work title of a translation might deviate from the canonical title of the original work, e.g. adding '(Auswahl)' etc.
	work_display_title?: string;
	translators: Array<Translator>;
}

export interface BernhardWork {
	id: number;
	title: string; // german/french original
	short_title?: string; // abbreviated title, commonly used for letters
	year?: number;
	category?: Category;
}

export interface Translator {
	id: number;
	name: string; // "Family Name, Given Name(s)"
}

interface Asset {
	id: string; // same as filename (without extension, which is .jpg)
	metadata?: string;
}
