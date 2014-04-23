install:
	npm install
	mkdir -p uploads

start:
	node index.js

check:
	touch uploads/check.txt

marathon: install check start

tar:
	mkdir -p dist
	tar cvzf dist/sssjs.tar.gz --exclude node_modules --exclude uploads --exclude dist *
