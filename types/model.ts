// these end up in public URLs as slugs, so come up with good names!
export enum Category {
	novels = "novels",
	novellas = "novellas & short prose",
	autobiography = "autobiography",
	fragments = "fragments",

	drama = "drama & libretti",
	poetry = "poetry",
	letterspeechinterview = "letters, speeches, interviews",
	adaptations = "adaptations",
}

export type Prose =
	| Category.autobiography
	| Category.fragments
	| Category.novellas
	| Category.novels;

/** Publication contains one or more translated works. */
export interface Publication {
	id: string; // 'signatur' in openrefine
	title: string;
	language: string;
	contains: Array<Translation>;
	categories: Array<Category>;

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
	images?: Array<Asset>;
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
}

export interface Translator {
	id: string;
	name: string; // TODO First Last or Last, First?
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
