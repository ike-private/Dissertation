# Python file to collect data

import os.path
from os import path

def checkFile():
    files = os.listdir('/')
    for f in files:
        if f.endswith('.mp4'):
          # do stuff on the file
        break
else: