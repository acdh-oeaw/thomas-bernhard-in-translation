// these end up in public URLs as slugs, so come up with good names!
export const otherCategories = [
	"prose",
	"drama",
	"poetry",
	"letterspeechinterview",
	"adaptations",
] as const;
export const proseCategories = ["novels", "novellas", "autobiography", "fragments"] as const;

export type Category = (typeof otherCategories)[number] | (typeof proseCategories)[number];

/** Publication contains one or more translated works. */
export interface Publication {
	id: string; // 'signatur' in openrefine
	title: string;
	language: string;
	contains: Array<Translation>;
	// categories: Array<Category>;

	// from openrefine: whether this publication contains at least one previously unpublished
	// translation
	erstpublikation: boolean;

	// ids of publications which contain re-prints of some of the translations first published in this
	// publication. this field is inferred from the 'eltern' column in openrefine.
	later?: Array<string>;
	year: number;
	isbn?: string;
	publisher: Publisher;
	exemplar_suhrkamp_berlin: boolean;
	exemplar_oeaw: boolean;
	images: Array<Asset>;
}

export interface Translation {
	id: string;
	title: string; // translated title
	work: BernhardWork;
	translators: Array<Translator>;
	// erstpublikation?: string;
}

export interface BernhardWork {
	id: string;
	title: string; // german/french original
	gnd?: string;
	year?: number; // we get the years from gnd-lookup, so no gnd => no year info
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
