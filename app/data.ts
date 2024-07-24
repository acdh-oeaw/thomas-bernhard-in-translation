import type {
	BernhardWork,
	Publication,
	publicationTypes,
	Translation,
	Translator,
} from "@/types/model";

import data from "./data.json";

const publications = data.publications as unknown as Record<string, Publication>;
const bernhardworks = data.bernhardworks as unknown as Array<BernhardWork>;
const translators = data.translators as unknown as Array<Translator>;
const translations = data.translations as unknown as Array<Translation>;

const languages = Array.from(
	new Set(
		Object.values(publications).map((e) => {
			return e.language;
		}),
	),
).sort();

export function getChildren(pub: Publication): Array<Publication> | undefined {
	return pub.parents
		?.flatMap((ps) => {
			return getPublication(ps.signatur);
		})
		.filter((p) => {
			return p !== undefined;
		});
}
export function getLanguages(): Array<string> {
	return languages;
}

export function getPublication(signatur: string): Publication | undefined {
	return publications[signatur];
}

export function getPublications(
	filter?: { [key in keyof Publication]?: Publication[key] },
	category?: typeof publicationTypes,
	sort?: string,
	offset = 0,
	limit = 10,
): Array<Publication> {
	let pubs = Object.values(publications);

	if (category) {
		pubs = pubs.filter((p) => {
			return p.categories.includes(category);
		});
	}
	if (filter) {
		for (const key in filter) {
			pubs = pubs.filter((p) => {
				return p[key as keyof Publication] === filter[key as keyof Publication];
			});
		}
	}

	if (sort) {
		// TODO sort by actual key if given
		pubs.sort(() => {
			return Math.random() - 0.5;
		});
	}

	return limit ? pubs.slice(offset, offset + limit) : pubs.slice(offset);
}

// get 4 publications, ideally in the same language but excluding the publication
export function getSameLanguagePublications(pub: Publication) {
	return Object.values(publications)
		.filter((p) => {
			return p.language === pub.language && p.signatur !== pub.signatur;
		})
		.sort(() => {
			return Math.random() - 0.5;
		})
		.slice(0, 3);
}

export function getTranslation(id: number): Translation | undefined {
	return translations[id - 1];
}

export function getTranslator(id: number): Translator | undefined {
	return translators[id - 1];
}

export function getTranslators(): Array<Translator> | undefined {
	return translators;
}

export function getWork(gndOrId: string): BernhardWork | undefined {
	return bernhardworks.find((w) => {
		return w.gnd === gndOrId || w.id === gndOrId;
	});
}

// get list of works but actually by way of publications of that category...
export function getWorks(category?: typeof publicationTypes): Array<BernhardWork> {
	const pubs: Array<Publication> = getPublications({}, category, undefined, 0, 0);
	const translations = pubs.flatMap((p) => {
		return p.contains;
	});
	const works = [
		...new Set(
			translations.map((t) => {
				return t.work;
			}),
		),
	];
	return works
		.map((i) => {
			return bernhardworks[(i as unknown as number) - 1];
		})
		.filter((w) => {
			return w !== undefined;
		});
}
