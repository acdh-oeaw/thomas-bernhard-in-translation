#!/usr/bin/env python3
# type: ignore
from acdh_baserow_pyutils import BaseRowClient
import os
from dotenv import load_dotenv

load_dotenv("../.env.local")

BASEROW_BASE_URL = os.environ.get("BASEROW_BASE_URL")
BASEROW_USER = os.environ.get("BASEROW_USER")
BASEROW_PW = os.environ.get("BASEROW_PW")
BASEROW_TOKEN = os.environ.get("BASEROW_TOKEN")
BASEROW_DATABASE_ID = os.environ.get("BASEROW_DATABASE_ID")
# initialize the client
br_client = BaseRowClient(
    BASEROW_USER, BASEROW_PW, BASEROW_TOKEN, BASEROW_BASE_URL, BASEROW_DATABASE_ID
)

folder_name = "from_baserow"
# os.mkdir(folder_name)
br_client.dump_tables_as_json(BASEROW_DATABASE_ID, folder_name=folder_name, indent="\t")
