#!/usr/bin/env python3

import argparse
from datetime import datetime
import json
import logging
import os

from acdh_baserow_pyutils import BaseRowClient
from dotenv import load_dotenv

parser = argparse.ArgumentParser(
    prog="baserow", description="import / export data from / to baserow"
)
parser.add_argument(
    "-from-baserow", action="store_true", help="make a backup/dump of baserow data"
)
parser.add_argument(
    "-to-baserow", action="store_true", help="import transformed data to Baserow"
)
parser.add_argument(
    "-typesense",
    action="store_true",
    help="import transformed publications to Typesense (default: %(default)s)",
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

args = parser.parse_args()

load_dotenv(args.env)

logging.basicConfig(
    level=max(10, 30 - 10 * args.verbose),
    format="%(count)-4s %(levelname)-8s %(message)s\n",
)

if "BASEROW_USER" not in os.environ:
    logging.fatal("Couldn't find baserow database information in environment files")
    exit(1)

BASEROW_USER = os.environ.get("BASEROW_USER")
BASEROW_PW = os.environ.get("BASEROW_PW")
BASEROW_TOKEN = os.environ.get("BASEROW_TOKEN")
BASEROW_BASE_URL = os.environ.get("BASEROW_BASE_URL")
DATABASE_ID = "631"
# initialize the client
br_client = BaseRowClient(
    BASEROW_USER, BASEROW_PW, BASEROW_TOKEN, BASEROW_BASE_URL, DATABASE_ID
)

if args.from_baserow or args.to_baserow:
    timestamp = datetime.today().strftime("%Y%m%d-%H%M%S")
    folder = f"baserow-dump-{timestamp}"
    os.mkdir(folder)
    # writes all tables from Database as json.files into a folder
    br_client.dump_tables_as_json(DATABASE_ID, folder_name=folder, indent="\t")

table_ids = {}
for table in br_client.list_tables(DATABASE_ID):
    table_ids[table["name"]] = table["id"]

if args.to_baserow:

    def patch_table(name):
        logging.info(f"loading data/{name}.json")
        data = json.load(open(f"data/{name}.json"))
        logging.info(f'updating baserow table "{name}"')
        for i, d in enumerate(data):
            r = br_client.patch_row(table_ids[name], str(i + 1), d)
            if "error" in r:
                logging.error(r["detail"])

    patch_table("Übersetzer")
    patch_table("BernhardWerk")
    patch_table("Übersetzung")
    patch_table("Publikation")

if args.typesense:
    logging.debug(f"Loading typesense access data from {args.env}")
    from dotenv import load_dotenv

    os.chdir(os.path.dirname(__file__))
    load_dotenv(args.env)

    if "TYPESENSE_ADMIN_API_KEY" not in os.environ:
        logging.fatal(
            "Couldn't find typesense database information in environment files"
        )
        exit(1)

    logging.info(f"connecting to {os.environ.get('NEXT_PUBLIC_TYPESENSE_HOST')}")
    import typesense

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

    collection_name = os.environ.get("TYPESENSE_COLLECTION_NAME")

    r = client.collections[collection_name].retrieve()

    if r["num_documents"] > 0:
        logging.info(f'Clearing {r["num_documents"]} existing documents')
        r = client.collections[collection_name].documents.delete(
            {"filter_by": 'id :!= ""'}
        )
        logging.info(
            f'Cleared {r["num_deleted"]} documents from collection {collection_name}'
        )

    r = client.collections[collection_name].documents.import_(publications.values())

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
