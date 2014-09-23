
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
BINJS = $(shell find bin/*)
JSON = $(shell find client -name '*.json')

NODE_ENV = development

build: components $(CSS) $(HTML) $(CLIENTJS) $(JSON)
	@./bin/build-client $(NODE_ENV)

beautify:
	@./node_modules/.bin/js-beautify --config config/jsbeautify.json --quiet --replace $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

checkenv:
ifndef NODE_ENV
	$(error NODE_ENV is undefined)
endif
	@export NODE_ENV=$(NODE_ENV)

clean:
	@rm -rf build
	@rm -rf components

components: node_modules component.json $(JSON)
	@./node_modules/.bin/component install --dev --verbose

# Deploy to OpsWorks
deploy: checkenv test
	@aws opsworks create-deployment \
		--app-id `./bin/config-val opsworks.app_id` \
		--command "{\"Name\":\"deploy\"}"

# Install
install: node_modules

# Lint JavaScript with JSHint
lint:
	@./node_modules/.bin/jshint --config config/jshint.json $(CLIENTJS) $(LIBJS) $(BINJS) $(TESTJS)

# Reinstall if package.json has changed
node_modules: package.json
	@npm install

# Run before each release
release: checkenv test
	@./bin/build-client $(NODE_ENV)
	@aws s3 sync build `./bin/config-val s3_bucket` \
		--acl public-read \
		--delete

# Watch & reload server
serve: server.pid
server.pid: checkenv node_modules stop
	@nohup bin/server > server.log </dev/null & echo "$$!" > server.pid
	@echo "Logs stored in server.log"

stop:
	@kill `cat server.pid` || true
	@rm -f server.pid

.PHONY: beautify checkenv clean deploy lint release serve start stop
