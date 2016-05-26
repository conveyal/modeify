
CSS = $(shell find client -name '*.css')
HTML = $(shell find client -name '*.html')

BINJS = bin/add-route-resource bin/build-client bin/config-val bin/create-admin bin/geocode bin/list-route-resources bin/load-route-resources bin/reload-opsworks-layer bin/server bin/update-emails bin/update-status
CLIENTJS = $(shell find client -name '*.js')
LIBJS = $(shell find lib -name '*.js')
TESTJS = $(shell find test -name '*.js')
ALLJS = $(BINJS) $(CLIENTJS) $(LIBJS) $(TESTJS)

JSON = $(shell find client -name '*.json')

RB = $(shell find cookbooks -name '*.rb')

BUCKET = $(shell bin/config-val $(NODE_ENV) s3_bucket)

assets/cookbooks.tar.gz: $(RB)
	@tar cvzf assets/cookbooks.tar.gz cookbooks

# Reinstall if package.json has changed
node_modules: package.json
	@npm installs

sync: assets/cookbooks.tar.gz build-client
	@echo Syncing $(NODE_ENV) to $(BUCKET)
	@aws s3 sync assets $(BUCKET) \
		--acl public-read

.PHONY: build-client install lint serve sync
