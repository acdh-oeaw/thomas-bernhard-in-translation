#!/usr/bin/env python3
# type: ignore
import logging
from dotenv import load_dotenv
import json
import argparse
import os
import typesense
from typesense.exceptions import ObjectNotFound

parser = argparse.ArgumentParser(
    prog="baserow", description="import / export data from / to baserow"
)

parser.add_argument(
    "-env",
    default="../.env.local",
    help=".env file to be used for getting typesense server details",
)
parser.add_argument(
    "-v",
    "--verbose",
    action="count",
    default=3,
    help="Increase the verbosity of the logging output: default is WARNING, use -v for INFO, -vv for DEBUG",
)

args = parser.parse_args()

logging.basicConfig(
    level=max(10, 30 - 10 * args.verbose),
    # format="%(levelname)-8s %(message)s",
)


logging.debug(f"Loading typesense access data from {args.env}")
os.chdir(os.path.dirname(__file__))
load_dotenv(args.env)


def fatal(msg):
    logging.fatal(msg)
    exit(1)


logging.info(
    "step 1: accumulate relational data into a typesense-ready nested structure"
)


def load_json(dirname, filename):
    return json.load(open(f"{dirname}/{filename}.json"))


# get the data as it was originally exported to baserow
publications = load_json("to_baserow", "Publikation")
translations = load_json("to_baserow", "Übersetzung")
works = load_json("to_baserow", "BernhardWerk")
translators = load_json("to_baserow", "Übersetzer")

# get the manual edits
publication_changes = load_json("from_baserow", "Publikation").values()
translation_changes = load_json("from_baserow", "Übersetzung").values()
work_changes = load_json("from_baserow", "BernhardWerk").values()
translator_changes = load_json("from_baserow", "Übersetzer").values()


def merge_changes(orig, changed, field_names):
    for e1, e2 in zip(orig, changed):
        for f in field_names:
            try:
                if isinstance(e2[f], dict):
                    e2[f] = e2[f]["value"]
                elif isinstance(e1[f], int):
                    e2[f] = int(e2[f])

                if e1[f] != e2[f]:  # TODO check types and force original numbers
                    logging.info(
                        f"integrating manual change to field {f}: '{e1[f]}' > '{e2[f]}'"
                    )
                    e1[f] = e2[f]
            except KeyError:
                if e2[f]:
                    logging.info(f"adding new field {f} with value '{e2[f]}'")
                    e1[f] = e2[f]


# for publication: title, year, year_display, publisher, publication_details, exemplar_...
merge_changes(
    publications,
    publication_changes,
    [
        "title",
        "short_title",
        "year",
        "year_display",
        "publisher",
        "publication_details",
    ],
)
merge_changes(translations, translation_changes, ["title", "work_display_title"])
merge_changes(works, work_changes, ["title", "short_title", "year", "category", "gnd"])
merge_changes(translators, translator_changes, ["name", "gnd"])

# create nested structures


def del_empty_strings(o, field_names):
    for f in field_names:
        if not o[f]:
            del o[f]


for i, t in enumerate(translators):
    # add 1-indexed translator ids to allow links to translator pages
    t["id"] = i + 1


categories = {
    "adaptations": "adaptations",
    "autobiography": "autobiography",
    "drama & libretti": "drama",
    "fragments": "fragments",
    "letters, speeches, interviews": "letterspeechinterview",
    "novellas & short prose": "novellas",
    "novels": "novels",
    "prose": "prose",
    "poetry": "poetry",
}

for i, w in enumerate(works):
    # add 1-indexed bernhard work ids to allow links to work ids
    w["id"] = i + 1
    if not w["short_title"]:
        w["short_title"] = w["title"]

    w["category"] = categories[w["category"]] if w["category"] else "fragments"

    # helper field for the faceted listing by work
    w["yeartitle"] = f'{w["category"]}${w["year"]}${w["short_title"]}'

for t in translations:
    t["work"] = works[t["work"] - 1]
    t["translators"] = [translators[t_id - 1] for t_id in t["translators"]]
    # work around https://typesense.org/docs/guide/tips-for-searching-common-types-of-data.html#searching-for-null-or-empty-values
    # for the /translators page
    t["has_translators"] = len(t["translators"]) != 0
    del_empty_strings(t, ["work_display_title"])

languages = {
    "albanian": "sq",
    "arabic": "ar",
    "azerbaijani": "az",
    "basque": "eu",
    "bulgarian": "bg",
    "catalan": "ca",
    "chinese (simpl.)": "zh_hans",
    "croatian": "hr",
    "czech": "cs",
    "danish": "da",
    "dutch": "nl",
    "english": "en",
    "estonian": "et",
    "farsi": "fa",
    "finnish": "fi",
    "french": "fr",
    "galician": "gl",
    "georgian": "ka",
    "greek": "el",
    "hebrew": "he",
    "hungarian": "hu",
    "icelandic": "is",
    "italian": "it",
    "japanese": "ja",
    "korean": "ko",
    "lithuanian": "lt",
    "macedonian": "mk",
    "norwegian": "no",
    "polish": "pl",
    "portuguese": "pt_pt",
    "portuguese (brazil)": "pt_br",
    "romanian": "ro",
    "russian": "ru",
    "serbian": "sr",
    "slovak": "sk",
    "slovenian": "sl",
    "spanish": "es",
    "swedish": "sv",
    "turkish": "tr",
    "ukrainian": "uk",
    "urdu": "ur",
    "vietnamese": "vi",
}

for i, pub in enumerate(publications):
    pub["id"] = str(i + 1)
    if not w["short_title"]:
        w["short_title"] = w["title"]

    pub["contains"] = [translations[t_id - 1] for t_id in pub["contains"]]
    pub["language"] = languages[pub["language"]]

    pub["images"] = (
        [{"id": img} for img in pub["images"].split(" ")] if len(pub["images"]) else []
    )
    pub["has_image"] = len(pub["images"]) > 0
    if not pub["year_display"]:
        pub["year_display"] = str(pub["year"])

    for pid in pub["parents"]:
        if "later" in publications[pid - 1]:
            publications[pid - 1]["later"].append(i + 1)
        else:
            publications[pid - 1]["later"] = [i + 1]

    del_empty_strings(pub, ["isbn", "parents", "publication_details"])

    # trim data a little
    del pub["exemplar_suhrkamp_berlin"]
    del pub["exemplar_oeaw"]
    del pub["original_publication"]
    del pub["zusatzinfos"]

logging.info("step 2: insert nested documents into typesense")

if "TYPESENSE_ADMIN_API_KEY" not in os.environ:
    fatal("Couldn't find typesense database information in environment files")

logging.info(f"connecting to {os.environ.get('NEXT_PUBLIC_TYPESENSE_HOST')}")

client = typesense.Client(
    {
        "api_key": os.environ.get("TYPESENSE_ADMIN_API_KEY"),
        "nodes": [
            {
                "host": os.environ.get("NEXT_PUBLIC_TYPESENSE_HOST"),
                "port": os.environ.get("NEXT_PUBLIC_TYPESENSE_PORT"),
                "protocol": os.environ.get("NEXT_PUBLIC_TYPESENSE_PROTOCOL"),
            }
        ],
        "connection_timeout_seconds": 5,
    }
)

collection_name = os.environ.get("NEXT_PUBLIC_TYPESENSE_COLLECTION_NAME")

try:
    r = client.collections[collection_name].retrieve()
except ObjectNotFound:
    logging.info(f"collection '{collection_name}' does not exist yet, creating")
    schema = json.load(open("typesense-schema.json"))
    schema["name"] = collection_name
    create = client.collections.create(schema)
    r = client.collections[collection_name].retrieve()


if r["num_documents"] > 0:
    logging.info(f'Clearing {r["num_documents"]} existing documents')
    r = client.collections[collection_name].documents.delete({"filter_by": 'id :!= ""'})
    logging.info(
        f'Cleared {r["num_deleted"]} documents from collection {collection_name}'
    )

logging.info(f"importing {len(publications)} documents")
r = client.collections[collection_name].documents.import_(publications)

nfails = list(map(lambda d: d["success"], r)).count(False)
if nfails == len(publications):
    if args.verbose > 0:
        print(r)
    logging.error(
        f"Failed to insert any of the documents. Either the documents don't comply with the schema of the collection, or maybe you are using an api key that only has read access to the collection? (run the script again with --verbose to see all {nfails} errors)"
    )
    exit(1)
elif nfails > 0:
    logging.error(f"{nfails} documents could not be inserted.")
    for doc in filter(lambda d: not d["success"], r):
        logging.error(doc)
    exit(1)

logging.info("Success!")
