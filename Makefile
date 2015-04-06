
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
JSON = $(shell find client -name '*.json')

RB = $(shell find cookbooks -name '*.rb')

build: $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(NODE_ENV)

beautify:
	@./node_modules/.bin/js-beautify \
		--config config/jsbeautify.json \
		--replace $(CLIENTJS) $(LIBJS) $(TESTJS) \
		--quiet

assets/cookbooks.tar.gz: $(RB)
	@tar cvzf assets/cookbooks.tar.gz cookbooks

assets/server.tar.gz: $(LIBJS)
	@git archive --output=assets/server.tar HEAD
	@tar -rvf assets/server.tar deployment/config.yaml # Add the config to the archvie before gzipping
	@gzip -c assets/server.tar > assets/server.tar.gz
	@rm assets/server.tar # cleanup

install:
	@bin/install

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
	@[ -f server.pid ] && kill `cat server.pid`

.PHONY: beautify build install lint serve
