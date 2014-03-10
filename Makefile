
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
SERVERJS = $(shell find server -name '*.js')
TESTJS = $(shell find test -name '*.js')
JSON = $(shell find client -name '*.json')

REPORTER = spec

build: components $(CSS) $(HTML) $(JS) $(JSON)
	@$(MAKE) lint-client
	@$(MAKE) test-client
	@./bin/build

beautify:
	@./node_modules/.bin/js-beautify --quiet --replace $(CLIENTJS) $(SERVERJS) $(TESTJS)

clean:
	@rm -rf build
	@rm -rf components

components: node_modules component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

# Copy temporary config files
postinstall:
	@cp -n .env.tmp .env || true
	@cp -n config.json.tmp config.json || true

# Install
install: node_modules

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint $(CLIENTJS) $(SERVERJS) $(TESTJS)
lint-client:
	@./node_modules/.bin/jshint $(CLIENTJS)
lint-server:
	@./node_modules/.bin/jshint $(SERVERJS)
lint-test:
	@./node_modules/.bin/jshint $(TESTJS)

# Run before each commit/release
release: components test beautify
	@./bin/build production
	@s3cmd sync --guess-mime-type --acl-public --recursive build s3://arlington.dev.conveyal.com

# Watch & reload server
serve: node_modules build
	@./node_modules/.bin/nodemon --verbose

# Run mocha test suite
test: test-client test-server
test-client: lint-client lint-test
test-server: lint-server lint-test
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --require should --reporter $(REPORTER) --timeout 5000 --slow 10

.PHONY: beautify help lint lint-client lint-server lint-test release test test-client test-server watch
