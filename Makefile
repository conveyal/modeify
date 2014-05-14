
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
BINJS = $(shell find bin/*)
JSON = $(shell find client -name '*.json')
SVG = $(shell find client -name '*.svg')

ENV = development
REPORTER = spec

build: components $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(ENV)

beautify:
	@./node_modules/.bin/js-beautify --quiet --replace $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

clean:
	@rm -rf build
	@rm -rf components

convert: $(SVG)
	@echo $(SVG)

%.svg:
	@echo $<

components: node_modules component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

# Install
install: node_modules

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

package.zip: $(LIBJS)
	@git archive --format=zip HEAD > package.zip
	@zip -g package.zip config.json

# Run before each release
release: build test
	@./bin/push-to-s3 $(ENV)

# Watch & reload server
serve: server.pid
server.pid: node_modules
ifndef NODE_ENV
	$(error NODE_ENV is undefined)
endif
	@nohup ./node_modules/.bin/nodemon > /var/tmp/commute-planner-server.log </dev/null & echo "$$!" > server.pid
	@echo "Server logs stored in /var/tmp/commute-planner-server.log"
start: server.pid

stop:
	@kill `cat server.pid` && rm server.pid

# Run mocha test suite
test: lint
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --require should --reporter $(REPORTER) --timeout 20s --slow 10

.PHONY: beautify convert lint release serve stop test watch
