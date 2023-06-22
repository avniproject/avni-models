clean:
	rm -rf node_modules

deps:
	@rm -f package-lock.json
	yarn install

tests:
	yarn test

build:
	yarn run build

release:
	git pull --tags
	git pull --rebase
	@echo "Ensure version changes follow semantic versioning - https://classic.yarnpkg.com/en/docs/dependency-versions#toc-semantic-versioning"
	@echo "\033[1mLatest openchs-models version across branches:"
	npm view openchs-models version
	@echo "\033[0m"
	yarn version
	@echo "   Now please run \nmake publish"

publish:
	git push && git push origin --tags

copy-dist-to-avni-client:
	cp -r * ../avni-client/packages/openchs-android/node_modules/openchs-models/

deploy-to-avni-client-only:
	$(call _deploy,../avni-client/packages/openchs-android/node_modules/openchs-models)

deploy-to-avni-web-only:
	$(call _deploy,../avni-webapp/node_modules/openchs-models)

deploy-to-avni-client: build deploy-to-avni-client-only
deploy-to-avni-web: build deploy-to-avni-web-only

deploy-to-avni-project: build
	$(if $(local),$(call _deploy,$(local)/node_modules/openchs-models))

deploy-as-source-to-avni-client:
	$(call _deploy_as_source,../avni-client/packages/openchs-android/node_modules/openchs-models)

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
