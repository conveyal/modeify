
test: node_modules
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--timeout 10000

node_modules:
	@npm install

.PHONY: test
