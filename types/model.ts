// these end up in public URLs as slugs, so come up with good names!
// TODO singular or plural?
// TODO where is the right place to put this definition (so it is iterable from code)?
export const publicationTypes = [
	"autobiography",
	"drama",
	"letterspeechinterview",
	"novels",
	"novella",
	"prose",
] as const;

export type Category = typeof publicationTypes;

/** Publication contains one or more translated works. */
export interface Publication {
	id: string;
	signatur: string;
	erstpublikation: boolean; // TODO: what is this? -- ist das nicht eher eine eigenschaft der translation?
	parents?: Array<Publication> | null; // TODO JSON import gives nulls instead of undefined...
	more?: Publication; // TODO foreign keys in the OpenRefine sheet, but no data on the sub-entries?
	title: string;
	year: number;
	language: string;
	contains: Array<Translation>;
	publisher: Publisher;
	categories: Array<typeof publicationTypes>;
	// "autobiography" | "drama" | "letterspeechinterview" | "novel" | "novella" | "prose"
	isbn?: string;
	exemplar_suhrkamp_berlin: boolean;
	exemplar_oeaw: boolean;
	image?: Asset;
}

export interface Translation {
	id: string;
	work: BernhardWork; // TODO: unclear how translators are mapped to works in openrefine
	translators: Array<Translator>;
	title: string; // translated
	erstpublikation: Publication; // really: id is enough!
}

export interface BernhardWork {
	id: string;
	gnd: string;
	title: string; // german/french original
	year: number;
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
	id: string;
	type: string;
	path: string;
}
