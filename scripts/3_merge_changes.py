#!/usr/bin/env python3
# type: ignore
import argparse
import json
import logging
import os
import sys

from dotenv import load_dotenv
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
    default=0,
    help="Increase the verbosity of the logging output: default is WARNING, use -v for INFO, -vv for DEBUG",
)

output = parser.add_mutually_exclusive_group(required=True)

output.add_argument(
    "--typesense", "-t", action="store_true", help="write the merged data to typesense"
)

output.add_argument(
    "--json",
    "-j",
    action="store_true",
    help="write the merged data to json files in the data-final/ directory",
)

args = parser.parse_args()

logging.basicConfig(
    level=max(10, 30 - 10 * args.verbose),
    # format="%(levelname)-8s %(message)s",
)


def fatal(msg):
    logging.fatal(msg)
    exit(1)


logging.info("accumulating relational data into a typesense-ready nested structure")


def load_json(dirname, filename):
    return json.load(open(f"{dirname}/{filename}.json"))


def load_baserow_export(dirname, filename, back_reference_columns=[], unary_columns=[]):
    d = list(load_json(dirname, filename).values())
    for dt in d:
        del dt["order"]
        for col in back_reference_columns:
            del dt[col]

        for f in dt:
            if isinstance(dt[f], dict):
                if "order" in dt[f]:
                    # resolve cross-table relation
                    dt[f] = dt[f]["id"]
                else:
                    # string value
                    dt[f] = dt[f]["value"]
            elif isinstance(dt[f], list):
                if f in unary_columns:
                    dt[f] = dt[f][0]["id"]
                else:
                    dt[f] = [x["id"] for x in dt[f]]
    return d


def load_json_id(dirname, filename):
    d = load_json(dirname, filename)
    for i, dt in enumerate(d):
        dt["id"] = i + 1
    return d


# get the (manually edited) baserow export -- this is our source of truth, with the exception of
# ordered 1:n relationships -- translations within publications, translators within a
# translation, for which the correct order needs to be recovered from the original baserow import
publications = load_baserow_export("from_baserow", "Publikation")
translations = load_baserow_export(
    "from_baserow", "Übersetzung", ["Publikation"], ["work"]
)
works = load_baserow_export("from_baserow", "BernhardWerk", ["Übersetzung"])
translators = load_baserow_export("from_baserow", "Übersetzer", ["Übersetzung"])

# get the data as it was originally imported into baserow
orig_publications = load_json_id("to_baserow", "Publikation")
orig_translations = load_json_id("to_baserow", "Übersetzung")
orig_works = load_json_id("to_baserow", "BernhardWerk")
orig_translators = load_json_id("to_baserow", "Übersetzer")


def process_baserow_export(new_data, orig_data, misc):
    """Replaces the {id, value, label} dict with just the id, and recovers the correct order of 1:n
    relationships according to the original baserow import"""
    # to recover types
    prototype = orig_data[0]
    for d in new_data:
        try:
            orig = next(x for x in orig_data if x["id"] == d["id"])
            for f in d:  # fields
                try:
                    # check types and force original numbers
                    if orig[f] != None and type(d[f]) is not type(orig[f]):
                        d[f] = int(d[f])
                    elif d[f] != orig[f]:
                        if f == "contains" or f == "translators" or f == "parents":
                            # TODO check
                            logging.debug(
                                f"applying original order of field {f}: {orig[f]} (after baserow mangling: {d[f]}"
                            )
                            d[f] = orig[f]
                        else:
                            logging.warning(
                                f"manual change to field {f} of {d['id']}: '{orig[f]}' > '{d[f]}'"
                            )
                except KeyError:
                    if d[f]:
                        logging.info(f"adding new field {f} with value '{d[f]}'")
        except StopIteration:
            logging.info(f"adding new entry: {d}")
            # for f in d: TODO enforce int
        # for n in list(changed)[-new:]:
        #     if "language" in n:
        #         n["language"] = n["language"]["value"]
        #     if "parents" in n and len(n["parents"]):
        #         # only 1 value
        #         n["parents"] = [n["parents"][0]["id"]]
        #     if "contains" in n:
        #         n["contains"] = [e["id"] for e in n["contains"]]
        #     if "translators" in n:
        #         n["translators"] = [e["id"] for e in n["translators"]]
        #     orig.append(n)
        #     # TODO remove embedded values (like 'language' ...)
    return orig


# for publication: title, year, year_display, publisher, publication_details, exemplar_...
process_baserow_export(
    publications,
    orig_publications,
    [
        "title",
        "short_title",
        "year",
        "year_display",
        "publisher",
        "publication_details",
    ],
)
process_baserow_export(translations, orig_translations, ["title", "work_display_title"])
process_baserow_export(
    works, orig_works, ["title", "short_title", "year", "category", "gnd"]
)
process_baserow_export(translators, orig_translators, ["name", "gnd"])


def del_empty_strings(o, field_names):
    for f in field_names:
        if not o[f]:
            del o[f]


def null_empty_strings(o, field_names):
    for f in field_names:
        if not o[f]:
            o[f] = None


categories = {
    "adaptations": "adaptations",
    "autobiography": "autobiography",
    "drama & libretti": "drama",
    "fragments": "fragments",
    "letters, speeches, interviews & other writings": "other",
    "novellas & short prose": "novellas",
    "novels": "novels",
    "prose": "prose",
    "poetry": "poetry",
}

for w in works:
    w["category"] = categories[w["category"]] if w["category"] else "fragments"

    if not w["short_title"]:
        w["short_title"] = w["title"] if args.typesense else None
    null_empty_strings(w, ["gnd"])


for t in translations:
    if "MISSING" in t["title"]:
        t["title"] = ""
    null_empty_strings(t, ["work_display_title"])

    if args.typesense:
        # create nested structures
        t["work"] = works[t["work"] - 1]
        t["translators"] = [translators[t_id - 1] for t_id in t["translators"]]
        # work around https://typesense.org/docs/guide/tips-for-searching-common-types-of-data.html#searching-for-null-or-empty-values
        # for the /translators page
        t["has_translators"] = len(t["translators"]) != 0

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

for pub in publications:
    pub["language"] = languages[pub["language"]]

    if "short_title" not in pub:
        pub["short_title"] = pub["title"] if args.typesense else None

    if args.typesense:
        # create nested structures
        pub["contains"] = [
            translations[t_id - 1]
            for t_id in pub["contains"]
            if "MISSING" not in translations[t_id - 1]["work"]["title"]
        ]
        pub["has_image"] = len(pub["images"]) > 0
        if not pub["year_display"]:
            pub["year_display"] = str(pub["year"])

    pub["images"] = (
        [{"id": img} for img in pub["images"].split(" ")] if len(pub["images"]) else []
    )

    for pid in pub["parents"]:
        prevpub = next(x for x in publications if x["id"] == pid)
        if "later" in prevpub:
            prevpub["later"].append(pub["id"])
        else:
            prevpub["later"] = [pub["id"]]

    # part of typesense schema but "optional"
    null_empty_strings(pub, ["short_title", "publisher", "year_display"])
    # not part of typesense schema, can be omitted altogether
    del_empty_strings(
        pub,
        [
            "isbn",
            "original_publication",
            "parents",
            "publication_details",
            "zusatzinfos",
        ],
    )

for t in translators:
    null_empty_strings(t, ["gnd"])

if args.json:
    logging.info("removing orphans before json writeout")
    for t in translations:
        if all([t["id"] not in p["contains"] for p in publications]):
            logging.info(f"deleting orphaned translation #{t['id']} ({t['title']})")
    for w in works:
        if all([t["id"] != t["work"] for t in translations]):
            logging.info(f"deleting orphaned work #{t['id']}")
    for i, tr in enumerate(translators):
        if all([tr["id"] not in t["translators"] for t in translations]):
            logging.info(f"deleting orphaned translator #{tr['id']} ({tr['name']})")
            del translators[i]

    logging.info("writing json to data-final/")

    def dump_relational(name, data):
        with open(f"data-final/{name}.json", "w") as file:
            file.write(
                json.dumps(data, indent="\t", ensure_ascii=False, sort_keys=True)
            )

    dump_relational("publications", publications)
    dump_relational("translations", translations)
    dump_relational("works", works)
    dump_relational("translators", translators)
    sys.exit(0)


logging.info(f"loading typesense access data from {args.env}")
os.chdir(os.path.dirname(__file__))
load_dotenv(args.env)

for t in translations:
    del_empty_strings(t, ["work_display_title"])

# for typesense
for pub in publications:
    pub["id"] = str(pub["id"])

    # trim data a little
    del pub["isbn"]
    del pub["exemplar_suhrkamp_berlin"]
    del pub["exemplar_oeaw"]
    del pub["original_publication"]
    del pub["zusatzinfos"]


logging.info("inserting nested documents into typesense")

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
    logging.info(f"Clearing {r['num_documents']} existing documents")
    r = client.collections[collection_name].documents.delete({"filter_by": 'id :!= ""'})
    logging.info(
        f"Cleared {r['num_deleted']} documents from collection {collection_name}"
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
