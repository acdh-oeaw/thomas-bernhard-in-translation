#!/usr/bin/env python3
# type: ignore

import argparse
from collections import Counter
import csv
import json
import logging
import os
import os.path
import re
from urllib.request import urlretrieve

parser = argparse.ArgumentParser(
    prog="tsv-to-json",
    description="transforms a tsv file exported from OpenRefine to JSON",
)
parser.add_argument(
    "-v",
    "--verbose",
    action="count",
    default=0,
    help="Increase the verbosity of the logging output: default is WARNING, use -v for INFO, -vv for DEBUG",
)
parser.add_argument(
    "-input",
    default="thb-20241028.tsv",
    help="the tsv file exported from OpenRefine (default: %(default)s)",
)

args = parser.parse_args()

thelogcount = 1


class ContextFilter(logging.Filter):
    def filter(self, record):
        global thelogcount
        record.count = thelogcount
        thelogcount += 1
        return True


logging.basicConfig(
    level=max(10, 30 - 10 * args.verbose),
    format="%(count)-4s %(levelname)-8s %(message)s\n",
)
logger = logging.getLogger(__name__)
logger.addFilter(ContextFilter())


# sort a dict based on year and assign chronological ids
def sort_and_add_ids(dct):
    dct = {k: v for k, v in sorted(dct.items(), key=lambda kv: kv[1]["year"] or 9999)}
    for i, (_, v) in enumerate(dct.items()):
        v["id"] = str(i + 1)
    return dct


data = [row for row in csv.DictReader(open(args.input), delimiter="\t")][:-1]

bernhardworks = {}  # map key is gnd (if exists), otherwise title

translators = {}


def orig(i):
    return f"contains orig. {i}"


def getcategories(pub):
    return [
        c
        for c in (pub["category 1"].split(" \\ ") + pub["category 2"].split(" \\ "))
        if len(c) and c != "prose"
    ]


# herausgabejahr des originalwerks (lookup über lobid.org GND-Datenbank)
def getyear(gnd):
    fn = f"gnd/{gnd}.json"
    if not os.path.isfile(fn):
        logger.info(f"Downloading {fn}")
        urlretrieve(f"https://lobid.org/gnd/{gnd}.json", fn)
    d = json.load(open(fn))
    try:
        return int(d["dateOfPublication"][0])
    except KeyError:
        return None


# attempt to split either of the strings into n strings based on delimiters
def getn(n, ss):
    best = []
    for s in ss:
        if len(s) == 0:
            continue

        els = s.split(" / ")
        if len(els) == n:
            return els
        elif len(els) > len(best):
            best = els

        els = s.split(". ")
        if len(els) == n:
            logger.info(f"delimiter in {s} is . instead of /")
            return els
        elif len(els) > len(best):
            best = els

    return best


def origtitle(pub, i):
    return pub[orig(i)].replace("\n", " ")


# use gnd as key if it's available, otherwise fall back to title..
def workkey(pub, i):
    prel = pub[f"original_{i}_GND"] if f"original_{i}_GND" in pub else None
    return prel or origtitle(pub, i)


# first pass -- extract bernhardworks and translators
for pub in data:
    # used in 2nd pass as a sanity check
    pub["origworks"] = []
    pub["Signatur"] = pub["Signatur"].strip()
    pub_categories = getcategories(pub)

    hadBlank = False
    for i in range(1, 41):
        bwkey = workkey(pub, i)
        if bwkey:
            origt = origtitle(pub, i)
            # store for 2nd pass
            pub["origworks"].append(origt)

            if hadBlank:
                logger.warning(
                    f"{pub['Signatur']} has empty orig followed by non-empty orig {i}"
                )

            gnd = (
                pub[f"original_{i}_GND"] or None if f"original_{i}_GND" in pub else None
            )

            if bwkey in bernhardworks:
                bernhardworks[bwkey]["titles"].append(origt)
                if (
                    len(pub_categories) < len(bernhardworks[bwkey]["category"])
                    or len(bernhardworks[bwkey]["category"]) == 0
                ):
                    for c in pub_categories:
                        if c not in bernhardworks[bwkey]["category"]:
                            pass
                            # logger.warning(f'could be {c} which it was previously not')
                    bernhardworks[bwkey]["category"] = pub_categories
                elif (
                    len(pub_categories) == 1
                    and len(bernhardworks[bwkey]["category"]) == 1
                    and pub_categories != bernhardworks[bwkey]["category"]
                ):
                    pass
                    # logger.error(f'{pub["Signatur"]}: unique publication category implies that all works inside it have category "{unique_work_category}", but the following work was already found in a publication with a different unique category: {bernhardworks[bwkey]}')
                    # print(f'''1. *{bernhardworks[bwkey]['title']}*: ist in [{pub["Signatur"]}](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{pub["Signatur"]}) das als `{pub_categories[0]}` kategorisiert ist, in anderen Publikationen (z.B. [{bernhardworks[bwkey]['first seen']}](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{bernhardworks[bwkey]['first seen']})) dagegen als `{bernhardworks[bwkey]["category"][0]}`
            # - [ ] wahrscheinlicher Fix: `{pub["Signatur"]}`'s Kategorie von `{pub_categories[0]}` auf `{bernhardworks[bwkey]["category"][0]}` ändern''')
            # allow the contradictory entry to show up on da web?
            # bernhardworks[bwkey]['category'] = pub_categories
            else:
                # new work, write even if we don't know the gnd
                bernhardworks[bwkey] = {
                    "gnd": gnd,
                    "titles": [origt],
                    "category": pub_categories,
                    "year": getyear(gnd) if gnd else None,
                    "first seen": pub["Signatur"],
                }

        else:
            hadBlank = True

    for i in range(1, 8):
        translatorkey = f"translator {i}"
        if not pub[translatorkey]:
            break

        # explicitly store number of translators for second pass
        pub["ntranslators"] = i

        # normalize to "family name, given name(s)" format
        tr = pub[translatorkey]
        if ", " in tr:
            logger.debug(
                f"{pub['Signatur']}: translator '{tr}' already in 'Family Name, Given Name(s)' format, all good"
            )
        else:
            tr = tr.split(" ")
            # FIXME this yields wrong results for Korean names
            tr = f"{tr[-1]}, {' '.join(tr[:-1])}"
            logger.info(
                f"{pub['Signatur']}: translator '{pub[translatorkey]}' was in 'Given Name(s) Family Name' format, flipping around to yield '{tr}'"
            )

        if pub[translatorkey] not in translators:
            translators[pub[translatorkey]] = {
                "name": tr,
                "gnd": pub[f"{translatorkey} GND"] or None,
                # 'wikidata': None
            }

bernhardworks = sort_and_add_ids(bernhardworks)

# infer unique categories
for k, v in bernhardworks.items():
    v["title"] = Counter(v["titles"]).most_common(1)[0][0]
    v["short_title"] = v["title"]
    if "(" in v["title"]:
        # cut off before '()'
        v["short_title"] = v["title"].split(" (")[0]
    if v["title"] == v["short_title"]:
        v["short_title"] = None
    if len(v["category"]) == 1:
        v["category"] = v["category"][0]
    elif any(
        map(
            lambda kw: kw in v["title"],
            ["Brief", "Gespräch", "Telegramm", "Stellungnahme"],
        )
    ):
        v["category"] = "letters, speeches, interviews"
        logger.info(
            f'work category of "{v["title"]}" is unknown but it contains a keyword, assigning "{v["category"]}"'
        )
    else:
        # print(f"""1. *{v['title']}* (GND {v['gnd']}, {len(v['titles'])} Veröffentlichung(en), erstmals gesehen in [{v['first seen']}](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{v['first seen']})): Werk-Kategorie nicht eindeutig:
        # - [ ] eine von: {', '.join(map(lambda c: '`' + c + '`', v['category']))}""")
        v["category"] = None
    del v["titles"]
    del v["first seen"]

bernhardworks["???"] = {
    "title": "???",
    "gnd": None,
    "category": [],
    "year": "XXXX",
}

translations = {}
nrepublications = 0
publications = {}

# second pass to create publications after all the other entities have ids
for pub in data:
    # zuerst translation extrahieren (könnte bereits existieren von früherer
    # publikation!)
    source = pub["contains transl. (wenn leer identisch mit 'title')"]
    source = source if len(source) else pub["title"]
    ts = getn(len(pub["origworks"]), [source])
    if len(ts) != len(pub["origworks"]):
        # print(f"1. [{pub['Signatur']}](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{pub['Signatur']}) has {len(ts)} translated titles for {len(pub['origworks'])} original works:")
        logger.error(
            f"{pub['Signatur']}: found {len(ts)} translated title(s) for {len(pub['origworks'])} original works ({ts} <> {pub['origworks']})"
        )
        if len(ts) == 1:
            pub["origworks"] = [" / ".join(pub["origworks"])]
        elif len(pub["origworks"]) == 1:
            ts = [" / ".join(ts)]
        else:
            while len(ts) < len(pub["origworks"]):
                ts.append("???")
            while len(ts) > len(pub["origworks"]):
                pub["origworks"].append("???")
        # for t1, t2 in zip(pub['origworks'], ts):
        #     print(f'    - [ ] `{t1}` <> `{t2}`')

    for i, t in enumerate(ts):
        # check if translator indices have been marked on the translated title
        match = re.search(r"(.*?[^\d])((?:\d\+)*\d)$", t)
        if match:
            t = match.group(1)
            translatorindices = list(map(int, match.group(2).split("+")))
        else:
            # no translator indices marked, so *all* of the publication's translators apply
            translatorindices = (
                list(range(1, pub["ntranslators"] + 1)) if "ntranslators" in pub else []
            )
        worktranslators = [
            translators[pub[f"translator {tid}"]]
            for tid in translatorindices
            if pub[f"translator {tid}"]
        ]

        bwkey = workkey(pub, i + 1) or "???"
        work = bernhardworks[bwkey]

        newt = {
            "work": work,
            # 'work': work['id'],
            "translators": worktranslators,  # [ t['id'] for t in worktranslators ],
            "title": t.replace("\n", " "),
        }
        if pub[orig(i + 1)] != work["title"]:
            logger.info(
                f'{pub["Signatur"]} #{i+1}: adding custom work display title ("{pub[orig(i+1)]}") which differs from canonical title ("{work["title"]}")'
            )
            newt["work_display_title"] = pub[orig(i + 1)]

        worktranslatornames = "+".join([t["name"] for t in worktranslators])
        translationkey = work["title"] + worktranslatornames

        if translationkey in translations:
            nrepublications = nrepublications + 1
            newt["id"] = translations[translationkey]["id"]
            if translations[translationkey] != newt:
                logger.info(
                    f"{pub['Signatur']}: {worktranslatornames}'s translation of '{work['title']}' (GND: {work['gnd']}) was previously published as '{translations[translationkey]['title']}', now found translation titled '{newt['title']}'"
                )
        else:
            newt["id"] = str(len(translations) + 1)
            translations[translationkey] = newt
        ts[i] = translations[translationkey]

    eltern = (
        [el.strip() for el in pub["Eltern"].split(" \\ ")] if pub["Eltern"] else None
    )
    # TODO incorporate info from column "rev. translation, originally published as"

    try:
        int(pub["year"])
    except ValueError:
        logger.warning(
            f"{pub['Signatur']} does not have a numeric year ('{pub['year']}')"
        )

    assets = (
        [{"id": pub["Signatur"]}]
        if os.path.isfile(f'../public/covers/{pub["Signatur"]}.jpg')
        else []
    )
    if len(pub["more"]):
        assets += [{"id": name} for name in pub["more"].split(", ")]

    publisher = pub["publisher / publication"]
    publication_details = None
    # split publisher into leading string + first occurrence of a digit (or 'S. {digit}')
    mt = re.match(r"^(.+?),? ((?:S\. ?)?\d.*)$", pub["publisher / publication"])
    if mt is not None:
        publisher = mt.group(1)
        publication_details = mt.group(2)

    publications[pub["Signatur"]] = {
        "signatur": pub["Signatur"],
        "erstpublikation": pub["EP?"]
        == "x",  # means at least one translation is published first time?
        "parents": eltern,
        "later": [],
        "more": pub["more"].split(", ") if pub["more"] else None,  # TODO
        "title": pub["title"],
        "year": int(pub["year"][0:4]),
        "year_display": pub["year"],
        "language": pub["language"],
        "contains": ts,
        "publisher": publisher,
        "publication_details": publication_details,
        # 'categories': [c for c in [c for c in pub['category 1'].split(' \\ ')] + [c for c in pub['category 2'].split(' \\ ')] if len(c) and c != 'prose'],
        "isbn": pub["ISBN"] or None,
        "exemplar_suhrkamp_berlin": pub["Exemplar Suhrkamp Berlin (03/2023)"].lower()
        == "x",  # TODO handle "X (mit Vorbehalt)"
        "exemplar_oeaw": pub["Exemplar ÖAW"].lower() == "x",
        "images": assets,
        "has_image": assets != [],
    }

categories = [
    "autobiography",
    "novels",
    "novellas & short prose",
    "adaptations",
    "poetry",
    "drama & libretti",
    "letters, speeches, interviews",
]
for w in bernhardworks.values():
    if w["category"] and w["category"] not in categories:
        logger.warning(f"{w['title']}: unknown category {w['category']}")


# redundantly store children ids in parent
for pub in publications.values():
    if pub["parents"]:
        for par in pub["parents"]:
            try:
                publications[par]["later"].append(pub["signatur"])
            except KeyError:
                logger.warning(
                    f"{pub['signatur']} was previously published in {par} but couldn't find a record for {par}"
                )


def dump_dict(dct, name):
    vs = list(dct.values())
    for v in vs:
        if "id" in v:
            del v["id"]
    print(f"writing {len(vs)} {name} to data/{name}.json")
    json.dump(vs, open(f"data/{name}.json", "w"), indent="\t")


# TODO replace nested objects with relation ids before dumping

publications = sort_and_add_ids(publications)
dump_dict(publications, "publications")
dump_dict(translations, "translations")
dump_dict(bernhardworks, "bernhardworks")
dump_dict(translators, "translators")
