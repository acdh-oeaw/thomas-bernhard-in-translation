// these end up in public URLs as slugs, so come up with good names!
// TODO singular or plural for the url?
export enum Category {
	prose = "prose",
	drama = "drama & libretti",
	poetry = "poetry",
	letterspeechinterview = "letters, speeches, interviews",
	adaptations = "adaptations",
	novels = "novels",
	novellas = "novellas & short prose",
	autobiography = "autobiography",
	fragments = "fragments",
}

/** Publication contains one or more translated works. */
export interface Publication {
	// id: string; // FIXME signatur can work as string?
	signatur: string;
	erstpublikation: boolean; // TODO: what is this? -- ist das nicht eher eine eigenschaft der translation?
	parents?: Array<Publication> | null; // TODO JSON import gives nulls instead of undefined...
	children?: Array<string>; // FIXME temporary
	more?: Array<Publication>; // TODO foreign keys in the OpenRefine sheet, but no data on the sub-entries?
	title: string;
	year: number;
	language: string;
	contains: Array<Translation>;
	publisher: Publisher;
	categories: Array<Category>;
	// "autobiography" | "drama" | "letterspeechinterview" | "novel" | "novella" | "prose"
	isbn?: string;
	exemplar_suhrkamp_berlin: boolean;
	exemplar_oeaw: boolean;
	image?: Asset;
}

export interface Translation {
	id: string;
	work: BernhardWork;
	translators: Array<Translator>;
	title: string; // translated
	// erstpublikation: Publication; // really: id is enough!
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
	// TODO asset filename is uniquely identified by publication signatur anyway, so actually more important
	// to store copyright information etc?
	id: string;
	type: string;
	path: string;
}
