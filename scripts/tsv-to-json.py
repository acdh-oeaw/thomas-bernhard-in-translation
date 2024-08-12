#!/usr/bin/python3

import csv
import json
from pprint import pprint

from urllib.request import urlretrieve
import os.path
import re

import logging
thelogcount = 1
class ContextFilter(logging.Filter):
    def filter(self, record):
        global thelogcount
        record.count = thelogcount
        thelogcount += 1
        return True
logging.basicConfig(level=logging.WARNING, format = '%(count)-4s %(levelname)-8s %(message)s\n')
logger = logging.getLogger(__name__)
logger.addFilter(ContextFilter())

data = [row for row in csv.DictReader(open('thbnew.tsv'), delimiter='\t')][:-1]

bernhardworks = {} # map key is gnd (if exists), otherwise title

publishers = {}
translators = {}

def orig(i):
    return f"contains orig. {i}"

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

    hadBlank = False
    for i in range(1, 41):
        bwkey = workkey(pub, i)
        if bwkey:
            origt = pub[orig(i)].strip(' 12345') # in chi_kurz_007 only
            # store for 2nd pass
            pub['origworks'].append(origt)

            if hadBlank:
                logger.warning(f"{pub['Signatur']} has empty orig followed by non-empty orig {i}")

            gnd = pub[f"original_{i}_GND"] or None if i <= 10 else None

            # did we already see this work? -- use title+gnd as unique id (graphic novels with same title..)
            if bwkey in bernhardworks:
                bernhardworks[bwkey]['count'] = bernhardworks[bwkey]['count'] + 1
            else:
                # new work, write even if we don't know the gnd
                bernhardworks[bwkey] = { 'id': str(len(bernhardworks)+1), 'gnd': gnd, 'title': origt, 'year': getyear(gnd) if gnd else None, 'count': 1 }

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
                'title': t
            }
        worktranslatornames = '+'.join([ t['name'] for t in worktranslators ])
        translationkey = work['title'] + worktranslatornames

        if translationkey in translations:
            nrepublications = nrepublications + 1
            newt['id'] = translations[translationkey]['id']
            if translations[translationkey] != newt:
                logger.warning(f"{pub['Signatur']}: {worktranslatornames}'s translation of '{work['title']}' (GND: {work['gnd']}) was previously published as '{translations[translationkey]['title']}', now found translation titled '{newt['title']}'")
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
        year = int(pub['year'])
    except ValueError:
        logger.error(f"{pub['Signatur']} does not have a numeric year ('{pub['year']}')")
        year = None

    assets = [ { 'id': pub['Signatur']} ] if os.path.isfile(f'../public/covers/{pub["Signatur"]}.jpg') else None 
    if len(pub['more']):
        assets += [ { 'id': name } for name in pub['more'].split(', ') ]

    publications[pub['Signatur']] = {
            'id': pub['Signatur'],
            'erstpublikation': pub['EP?'] == 'x', # means at least one translation is published first time?
            'parents': eltern,
            'later': [],
            'more': pub['more'].split(', ') if pub['more'] else None, # TODO
            'title': pub['title'],
            'year': year,
            'language': pub['language'],
            'contains': ts,
            'publisher': publishers[pub['publisher / publication']],
            'categories': [c for c in [c for c in pub['category 1'].split(' \\ ')] + [c for c in pub['category 2'].split(' \\ ')] if len(c) and c != 'prose'],
            'isbn': pub['ISBN'] or None,
            'exemplar_suhrkamp_berlin': pub['Exemplar Suhrkamp Berlin (03/2023)'].lower() == 'x',
            'exemplar_oeaw': pub['Exemplar ÖAW'].lower() == 'x',
            'images': assets
        }

# redundantly store children ids in parent
for pub in publications.values():
    if pub['parents']:
        for par in pub['parents']:
            try:
                publications[par]['children'].append(pub['signatur'])
            except KeyError:
                continue



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

json.dump(alldata, open('../app/data.json', 'w'), indent='\t')

