BIN = ./node_modules/.bin/
NODE ?= node
SRC = $(shell find node -name "*.js")
BUILD = $(subst node,build,$(SRC))

build: $(BUILD)

build/%.js: node/%.js
	@mkdir -p build
	@$(BIN)regenerator --include-runtime $< > $@

clean:
	@rm -rf build

test:
	@$(NODE) $(BIN)mocha \
		--harmony-generators \
		--reporter spec \
		--timeout 30s \
		--bail

.PHONY: test clean