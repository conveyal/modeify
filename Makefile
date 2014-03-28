
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
JSON = $(shell find client -name '*.json')

ENV = development
REPORTER = spec

build: components $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(ENV)

beautify:
	@./node_modules/.bin/js-beautify --quiet --replace $(CLIENTJS) $(LIBJS) $(TESTJS)

clean:
	@rm -rf build
	@rm -rf components

components: node_modules component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

# Install
install: node_modules

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint $(CLIENTJS) $(LIBJS) $(TESTJS)

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

package.zip: $(LIBJS)
	@git archive --format=zip HEAD > package.zip
	@zip -g package.zip config.json

# Run before each release
release: build test package.zip
	@./bin/push-to-s3 $(ENV)

# Watch & reload server
serve: server.pid
server.pid: node_modules
	@nohup ./node_modules/.bin/nodemon > /var/tmp/commute-planner-server.log </dev/null & echo "$$!" > server.pid
	@echo "Server logs stored in /var/tmp/commute-planner-server.log"

stop: server.pid
	@kill `cat server.pid` && rm server.pid

# Run mocha test suite
test: lint
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --require should --reporter $(REPORTER) --timeout 5000 --slow 10

.PHONY: beautify help lint lint-client lint-lib lint-test release serve stop test test-client test-lib watch
