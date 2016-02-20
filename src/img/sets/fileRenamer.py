import re,sys,subprocess,os,struct,math
from os import listdir
from os.path import isfile, join

for filename in os.listdir('.'):
	if filename.startswith(sys.argv[1]):
		os.rename(filename, filename.replace(sys.argv[1], sys.argv[2]))
		print('renaming ' + filename + ' to have ' + sys.argv[2])