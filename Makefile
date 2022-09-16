check-node-v:
ifneq ($(shell node -v),$(shell cat .nvmrc))
	@echo '\nPlease run `nvm use` in your terminal to change node version\n'
	@exit 1
endif
	@node -v

clean:
	rm -rf node_modules

deps:
	@rm -rf package-lock.json
	yarn install

tests:
	yarn test

build:
	yarn run build

release:
	git pull --tags
	git pull --rebase
	@echo "Ensure version changes follow semantic versioning - https://classic.yarnpkg.com/en/docs/dependency-versions#toc-semantic-versioning"
	yarn version
	@echo "   Now please run \nmake publish"

publish:
	git push && git push origin --tags

copy-dist-to-avni-client:
	cp -r * ../avni-client/packages/openchs-android/node_modules/openchs-models/

deploy-to-avni-client: build
	$(if $(local),$(call _deploy,$(local)/packages/openchs-android/node_modules/openchs-models))

deploy-to-avni-web: build
	$(if $(local),$(call _deploy,$(local)/node_modules/openchs-models))

deploy-to-rules-config: build
	$(if $(local),$(call _deploy,$(local)/node_modules/openchs-models))

deploy-to-rules-server: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-server))

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
