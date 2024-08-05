#!/usr/bin/python3

import os

os.chdir('/mnt/acdh_resources/container/R_thb_transl_cover_22978')

for file in os.listdir():
    [sig, ext] = file.split('.')
    if ext != 'jpg':
        print(file)
        os.rename(file, f'{sig}.jpg')

