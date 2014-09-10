
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
BINJS = $(shell find bin/*)
JSON = $(shell find client -name '*.json')

NODE_ENV = development
REPORTER = spec

build: components $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(NODE_ENV)

beautify:
	@./node_modules/.bin/js-beautify --config config/jsbeautify.json --quiet --replace $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

checkenv:
ifndef NODE_ENV
	$(error NODE_ENV is undefined)
endif

clean:
	@rm -rf build
	@rm -rf components

components: node_modules component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

# Install
install: node_modules

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint --config config/jshint.json $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

# Run before each release
release: checkenv build test
	@./bin/push-to-s3 $(NODE_ENV)

# Watch & reload server
serve: server.pid
server.pid: checkenv node_modules stop
	@nohup bin/server > server.log </dev/null & echo "$$!" > server.pid
	@echo "Logs stored in server.log"

stop:
	@kill `cat server.pid` || true
	@rm -f server.pid

# Run mocha test suite
test: lint
	@NODE_ENV=test node_modules/.bin/mocha --recursive --require should --reporter $(REPORTER) --timeout 20s --slow 10

test-cov: lint
	@NODE_ENV=test node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- \
		--recursive \
		--reporter dot \
		--require should \
		--slow 10 \
		--timeout 20s

.PHONY: beautify checkenv clean lint release serve start stop test test-cov
