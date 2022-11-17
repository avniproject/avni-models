set_node_version:
	. ${NVM_DIR}/nvm.sh && nvm use

clean:
	rm -rf node_modules

deps: set_node_version
	@rm -f package-lock.json
	yarn install

tests: set_node_version
	yarn test

build: set_node_version
	yarn run build

release: set_node_version
	git pull --tags
	git pull --rebase
	@echo "Ensure version changes follow semantic versioning - https://classic.yarnpkg.com/en/docs/dependency-versions#toc-semantic-versioning"
	yarn version
	@echo "   Now please run \nmake publish"

publish:
	git push && git push origin --tags

copy-dist-to-avni-client:
	cp -r * ../avni-client/packages/openchs-android/node_modules/openchs-models/

deploy-to-avni-client-only:
	$(if $(local),$(call _deploy,$(local)/packages/openchs-android/node_modules/openchs-models))

deploy-to-avni-client: build deploy-to-avni-client-only

deploy-to-avni-project: build
	$(if $(local),$(call _deploy,$(local)/node_modules/openchs-models))

deploy-as-source-to-avni-client:
	$(if $(local),$(call _deploy_as_source,$(local)/packages/openchs-android/node_modules/openchs-models))

define _deploy_as_source
	rm -rf $1/*
	mkdir $1/dist
	cp -r src/* $1/dist/
	cp package.json $1/
endef

define _deploy
	rm -rf $1/*
	mkdir $1/dist
	cp -r dist/* $1/dist/
	cp package.json $1/
endef
