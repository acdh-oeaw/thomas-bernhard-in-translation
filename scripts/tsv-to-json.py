#!/usr/bin/env python3

import argparse
import csv
import json
from pprint import pprint

from urllib.request import urlretrieve
import re

import os
import os.path

import logging

parser = argparse.ArgumentParser(
                    prog='tsv-to-json',
                    description='transforms a tsv file exported from OpenRefine to JSON (and optionally imports it to typesense)')
parser.add_argument("-output", action='store_true', help="write transformed data JSON files in data/")
parser.add_argument("-typesense", action='store_true', default=False, help="import transformed publications to Typesense (default: %(default)s)")
parser.add_argument("-env", default="../.env.local", help=".env file to be used for getting typesense server details")
parser.add_argument('-v', '--verbose', action='count', default=0, help='Increase the verbosity of the logging output: default is WARNING, use -v for INFO, -vv for DEBUG')
parser.add_argument("-input", default="thb-20240923.tsv", help="the tsv file exported from OpenRefine (default: %(default)s)")

args = parser.parse_args()

thelogcount = 1
class ContextFilter(logging.Filter):
    def filter(self, record):
        global thelogcount
        record.count = thelogcount
        thelogcount += 1
        return True
logging.basicConfig(level=max(10, 30 - 10*args.verbose), format = '%(count)-4s %(levelname)-8s %(message)s\n')
logger = logging.getLogger(__name__)
logger.addFilter(ContextFilter())

data = [row for row in csv.DictReader(open(args.input), delimiter='\t')][:-1]

bernhardworks = {} # map key is gnd (if exists), otherwise title

publishers = {}
translators = {}

def orig(i):
    return f"contains orig. {i}"

def getcategories(pub):
    return [c for c in (pub['category 1'].split(' \\ ') + pub['category 2'].split(' \\ ')) if len(c) and c != 'prose']

# herausgabejahr des originalwerks (lookup über lobid.org GND-Datenbank)
def getyear(gnd):
    fn = f'gnd/{gnd}.json'
    if not os.path.isfile(fn):
        logger.info(f'Downloading {fn}')
        urlretrieve(f'https://lobid.org/gnd/{gnd}.json', fn)
    d = json.load(open(fn))
    try:
        return int(d['dateOfPublication'][0])
    except KeyError:
        return None

# attempt to split either of the strings into n strings based on delimiters
def getn(n, ss):
    best = []
    for i, s in enumerate(ss):
        if len(s) == 0:
            continue

        els = s.split(' / ')
        if len(els) == n:
            return els
        elif len(els) > len(best):
            best = els

        els = s.split('. ')
        if len(els) == n:
            # TODO message about delimiter?
            return els
        elif len(els) > len(best):
            best = els

    # desperate times with mixed delimiters
    # els = [el for subl in best for el in subl.split('. ')]
    # if len(els) == n:
        # return els

    return best

def workkey(pub, i):
    if i <= 10:
        return pub[f'original_{i}_GND'] or pub[orig(i)]
    else:
        return pub[orig(i)]

# first pass -- extract bernhardworks, publishers and translators
for pub in data:
    # used in 2nd pass as a sanity check
    pub['origworks'] = []
    pub['Signatur'] = pub['Signatur'].strip()
    pub_categories = getcategories(pub)

    hadBlank = False
    for i in range(1, 41):
        bwkey = workkey(pub, i)
        if bwkey:
            origt = pub[orig(i)].strip(' 12345').replace('\n', ' ') # in chi_kurz_007 only
            # store for 2nd pass
            pub['origworks'].append(origt)

            if hadBlank:
                logger.warning(f"{pub['Signatur']} has empty orig followed by non-empty orig {i}")

            gnd = pub[f"original_{i}_GND"] or None if i <= 10 else None

            # did we already see this work? -- use title+gnd as unique id (graphic novels with same title..)
            if bwkey in bernhardworks:
                bernhardworks[bwkey]['count'] = bernhardworks[bwkey]['count'] + 1
                if len(pub_categories) < len(bernhardworks[bwkey]['category']) or len(bernhardworks[bwkey]['category']) == 0:
                    for c in pub_categories:
                        if not c in bernhardworks[bwkey]['category']:
                            logger.warning(f'could be {c} which it was previously not')
                    bernhardworks[bwkey]['category'] = pub_categories
                elif len(pub_categories) == 1 and len(bernhardworks[bwkey]['category']) == 1 and pub_categories != bernhardworks[bwkey]['category']:
                    # logger.error(f'{pub["Signatur"]}: unique publication category implies that all works inside it have category "{unique_work_category}", but the following work was already found in a publication with a different unique category: {bernhardworks[bwkey]}')
                    print(f'''1. *{bernhardworks[bwkey]['title']}*: ist in [{pub["Signatur"]}](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{pub["Signatur"]}) das als `{pub_categories[0]}` kategorisiert ist, in anderen Publikationen in denen es enthalten ist sind dagegen `{bernhardworks[bwkey]["category"][0]}`
    - [ ] wahrscheinlicher Fix: `{pub["Signatur"]}`'s Kategorie von `{pub_categories[0]}` auf `{bernhardworks[bwkey]["category"][0]}` ändern''')
            else:
                # new work, write even if we don't know the gnd
                bernhardworks[bwkey] = { 'id': str(len(bernhardworks)+1), 'gnd': gnd, 'title': origt, 'category': pub_categories, 'year': getyear(gnd) if gnd else None, 'count': 1, 'first seen': pub['Signatur'] }

        else:
            hadBlank = True

    pubname = pub['publisher / publication']
    publishers[pubname] = { 'id': len(publishers), 'name': pubname }

    for translatorkey in [f'translator {i}' for i in range(1, 8)]:
        if not pub[translatorkey]:
            break
        tr = pub[translatorkey].split(', ')
        # TODO which way to normalize first name/family name order?
        if len(tr) == 1:
            tr = tr[0]
        else:
            logger.info(f"{pub['Signatur']}: translator '{pub[translatorkey]}' was in 'Surname, First Name' format")
            tr = ' '.join(reversed(tr))

        if not pub[translatorkey] in translators:
            translators[pub[translatorkey]] = {
                    'id': str(len(translators)+1),
                    'name': tr,
                    'gnd': pub[f'{translatorkey} GND'] or None,
                    # 'wikidata': None
                }
for k, v in bernhardworks.items():
    if len(v['category']) == 1:
        v['category'] = v['category'][0]
    elif any(map(lambda kw: kw in v['title'], ['Brief', 'Telegramm', 'Stellungnahme'])):
        v['category'] = 'letters, speeches, interviews'
        logger.info(f'work category of "{v["title"]}" is unknown but it contains a keyword, assigning "{v["category"]}"')
    else:
        print(f"1. {v['title']} (GND {v['gnd']}, {v['count']} Veröffentlichung(en), erstmals gesehen in [`{v['first seen']}`](https://thomas-bernhard-global.acdh-ch-dev.oeaw.ac.at/publication/{v['first seen']})): Werk-Kategorie nicht eindeutig, eine von: {', '.join(map(lambda c: '`' + c + '`', v['category']))}")
        v['category'] = None

translations = {}
nrepublications = 0
publications = {}

# second pass to create publications after all the other entities have ids
for pub in data:
    # zuerst translation extrahieren (könnte bereits existieren von früherer 
    # publikation!)
    source = pub["contains transl. (wenn leer identisch mit 'title')"]
    source = source if len(source) else pub['title']
    ts = getn(len(pub['origworks']), [ source ])
    if len(ts) != len(pub['origworks']):
        logger.error(f"{pub['Signatur']}: found {len(ts)} translated title(s) for {len(pub['origworks'])} original works ({ts} <> {pub['origworks']})")
        continue

    for i, t in enumerate(ts):
        # check if translator indices have been marked on the translated title
        # TODO chi_kurz_007 has indices on the originals...
        match = re.search('(.*?[^\d])((?:\d\+)*\d)$', t)
        if match:
            t = match.group(1)
            translatorindices = list(map(int, match.group(2).split('+')))
        else:
            translatorindices = [ 1 ]
        worktranslators = [ translators[pub[f'translator {tid}']] for tid in translatorindices if pub[f'translator {tid}'] ]

        work = bernhardworks[workkey(pub, i+1)]

        newt = {
                'id': None,
                'work': work,
                # 'work': work['id'],
                'translators': worktranslators, #[ t['id'] for t in worktranslators ],
                'title': t.replace('\n', ' ')
            }
        worktranslatornames = '+'.join([ t['name'] for t in worktranslators ])
        translationkey = work['title'] + worktranslatornames

        if translationkey in translations:
            nrepublications = nrepublications + 1
            newt['id'] = translations[translationkey]['id']
            if translations[translationkey] != newt:
                logger.info(f"{pub['Signatur']}: {worktranslatornames}'s translation of '{work['title']}' (GND: {work['gnd']}) was previously published as '{translations[translationkey]['title']}', now found translation titled '{newt['title']}'")
        else:
            newt['id'] = str(len(translations)+1)
            translations[translationkey] = newt
        ts[i] = translations[translationkey]

    # ein nicht-leerer 'title 2' deutet darauf hin dass es eine Publikation 
    # innerhalb einer Serie oder periodischen ist.
    # Ausnahme: "L'Italien / Trois jours" hat zwei Titel einfach nur weil 2 
    # Übersetzungen drin sind!? alter Schwede...

    eltern = [ el.strip() for el in pub['Eltern'].split(' \\ ')] if pub['Eltern'] else None
    try:
        int(pub['year'])
    except ValueError:
        logger.warning(f"{pub['Signatur']} does not have a numeric year ('{pub['year']}')")

    assets = [ { 'id': pub['Signatur']} ] if os.path.isfile(f'../public/covers/{pub["Signatur"]}.jpg') else []
    if len(pub['more']):
        assets += [ { 'id': name } for name in pub['more'].split(', ') ]

    publications[pub['Signatur']] = {
            'id': pub['Signatur'],
            'erstpublikation': pub['EP?'] == 'x', # means at least one translation is published first time?
            'parents': eltern,
            'later': [],
            'more': pub['more'].split(', ') if pub['more'] else None, # TODO
            'title': pub['title'],
            'year': int(pub['year'][0:4]),
            'year_display': pub['year'],
            'language': pub['language'],
            'contains': ts,
            'publisher': publishers[pub['publisher / publication']],
            # 'categories': [c for c in [c for c in pub['category 1'].split(' \\ ')] + [c for c in pub['category 2'].split(' \\ ')] if len(c) and c != 'prose'],
            'isbn': pub['ISBN'] or None,
            'exemplar_suhrkamp_berlin': pub['Exemplar Suhrkamp Berlin (03/2023)'].lower() == 'x',
            'exemplar_oeaw': pub['Exemplar ÖAW'].lower() == 'x',
            'images': assets
        }

categories = ['autobiography', 'novels', 'novellas & short prose', 'adaptations', 'poetry', 'drama & libretti', 'letters, speeches, interviews']
# for p in publications.values():
    # if len(p['categories']) == 0:
        # logger.warning(f'{p["id"]} has no categories')
    # for c in p['categories']:
        # if not c in categories:
            # logger.warning(f'unknown category: {c}')


# redundantly store children ids in parent
for pub in publications.values():
    if pub['parents']:
        for par in pub['parents']:
            try:
                publications[par]['later'].append(pub['id'])
            except KeyError:
                logger.warning(f"{pub['id']} was previously published in {par} but couldn't find a record for {par}")


print(f"extracted {len(publications)} of {len(data)} publications")
print(f"- {len(bernhardworks)} original works")#, {len([gnd for gnd in bernhardworks.values() if gnd != None])} have GND")
print(f"- {len(translations)} translations ({nrepublications} of which Wiederveröffentlichungen/Reprints)")
print(f"- {len(translators)} translators")
print(f"- {len(publishers)} publishers (incl. messy duplicates wegen Typos und Zusatzangaben bei Periodicals)")

# bernhardworks = [{ 'id': None, 'gnd': gnd, 'title': title, 'year': None if gnd == None else getyear(gnd)} for title, gndcounts in bernhardworks.items() for gnd, count in gndcounts.items() ]
publishers = [{ 'id': None, 'name': name} for name in publishers.keys()]

alldata = {
    'publications': publications,
    'translations': list(translations.values()),
    'bernhardworks': list(bernhardworks.values()),
    'translators': list(translators.values())
}

if args.output:
    json.dump(publications, open('data/publications.json', 'w'), indent='\t')
    json.dump(bernhardworks, open('data/bernhardworks.json', 'w'), indent='\t')
    json.dump(translators, open('data/translators.json', 'w'), indent='\t')
    json.dump(translations, open('data/translations.json', 'w'), indent='\t')

if args.typesense:
    logging.debug(f"Loading typesense access data from {args.env}")
    from dotenv import load_dotenv
    os.chdir(os.path.dirname(__file__))
    load_dotenv(args.env)

    if not 'TYPESENSE_ADMIN_API_KEY' in os.environ:
        logger.error("Couldn't find typesense database information in environment files")
        exit(1)

    logger.info(f"connecting to {os.environ.get('NEXT_PUBLIC_TYPESENSE_HOST')}")
    import typesense

    client = typesense.Client({
      'api_key': os.environ.get('TYPESENSE_ADMIN_API_KEY'),
      'nodes': [{
        'host': os.environ.get('NEXT_PUBLIC_TYPESENSE_HOST'),
        'port': os.environ.get('NEXT_PUBLIC_TYPESENSE_PORT'),
        'protocol': os.environ.get('NEXT_PUBLIC_TYPESENSE_PROTOCOL')
      }],
      'connection_timeout_seconds': 5
    })

    collection_name = 'thomas-bernhard' # TODO read from env?

    r = client.collections[collection_name].retrieve()

    if r['num_documents'] > 0:
        logger.info(f'Clearing {r["num_documents"]} existing documents')
        r = client.collections[collection_name].documents.delete({'filter_by': 'id :!= ""'})
        logger.info(f'Cleared {r["num_deleted"]} documents from collection {collection_name}')

    r = client.collections[collection_name].documents.import_(publications.values())

    nfails = list(map(lambda d: d['success'], r)).count(False)
    if nfails == len(publications):
        if args.verbose > 0:
            print(r)
        logger.error(f"Failed to insert any of the documents. Either the documents don't comply with the schema of the collection, or maybe you are using an api key that only has read access to the collection? (run the script again with --verbose to see all {nfails} errors)")
        exit(1)
    elif nfails > 0:
        logger.error(f"{nfails} documents could not be inserted.")
        for doc in filter(lambda d: d['success'] == False, r):
            logger.error(doc)
        exit(1)

    logger.info("Success!")

