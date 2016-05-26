RB = $(shell find cookbooks -name '*.rb')

assets/cookbooks.tar.gz: $(RB)
	@tar cvzf assets/cookbooks.tar.gz cookbooks

# Reinstall if package.json has changed
node_modules: package.json
	@npm installs
