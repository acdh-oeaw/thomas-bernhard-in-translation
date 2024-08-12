import { type BernhardWork, Category, type Publication, type Translator } from "@/types/model";

import data from "./data.json";

const publications = data.publications as unknown as Record<string, Publication>;
const bernhardworks = data.bernhardworks as unknown as Array<BernhardWork>;
const translators = data.translators as unknown as Array<Translator>;

const languages = Object.values(publications).reduce<Record<string, Record<string, Translator>>>(
	(acc, cur) => {
		const ts = cur.contains.flatMap((p) => {
			return p.translators;
		});
		if (!(cur.language in acc)) {
			acc[cur.language] = {};
		}
		ts.forEach((t) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			acc[cur.language]![t.name] = t;
		});
		return acc;
	},
	{},
);

export function getLaterEditions(pub: Publication): Array<Publication> | undefined {
	return pub.later?.map((p) => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return getPublication(p)!;
	});
}
export function getLanguages(): Array<string> {
	return Object.keys(languages);
}

// returns full shape (works, translators and children all resolved)
export function getPublication(signatur: string): Publication | undefined {
	return publications[signatur];
}

// returns a shallow representation of publications (foreign key indices unresolved)
export function getPublications(
	filter?: { [key in keyof Publication]?: Publication[key] },
	category?: Category,
	sort?: string,
	offset = 0,
	limit = 10,
): Array<Publication> {
	let pubs = Object.values(publications);

	if (category) {
		pubs = pubs.filter((p) => {
			return p.categories.includes(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				Object.values(Category)[Object.keys(Category).indexOf(category)]!,
			);
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

// get 4 publications, ideally in the same language but excluding the publication itself *and* its
// children (because they will already be listed separately anyway)
export function getSameLanguagePublications(pub: Publication) {
	const banned = [pub.id, ...(pub.later ?? [])];
	return Object.values(publications)
		.filter((p) => {
			// TODO maybe only/preferable only show erstpublikationen?
			return p.language === pub.language && !banned.includes(p.id);
		})
		.sort(() => {
			return Math.random() - 0.5;
		})
		.slice(0, 4);
}

// get the translator and all publications that have at least one translation by them in
export function getTranslator(id: string): {
	translator: Translator;
	publications: Array<Publication>;
} {
	const tr = translators.find((t) => {
		return t.id === id;
	});
	const pubs = Object.values(publications).filter((p) => {
		return p.contains.some((t) => {
			return t.translators.some((tr) => {
				return tr.id === id;
			});
		});
	});

	return {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		translator: tr!,
		publications: pubs,
	};
}

export function getTranslators(): Record<string, Record<string, Translator>> {
	return languages;
}

export function getWork(gndOrId: string): BernhardWork | undefined {
	return bernhardworks.find((w) => {
		return w.gnd === gndOrId || w.id === gndOrId;
	});
}

// get list of works but actually by way of publications of that category...
export function getWorks(category?: Category): Array<BernhardWork> {
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
