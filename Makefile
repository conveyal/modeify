
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
JSON = $(shell find client -name '*.json')

build: $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(NODE_ENV)

beautify:
	@./node_modules/.bin/js-beautify \
		--config config/jsbeautify.json \
		--replace $(CLIENTJS) $(LIBJS) $(TESTJS) \
		--quiet

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint \
		--config config/jshint.json $(CLIENTJS) $(LIBJS) $(TESTJS)

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

# Watch & reload server
serve: stop
	@nohup bin/server > server.log </dev/null & echo "$$!" > server.pid
	@echo "Logs stored in server.log"

stop:
	@kill `cat server.pid` || true

.PHONY: beautify lint serve
