.PHONY: help clean deps build validate test ci test-realm-v12 release publish
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*## .*' $(MAKEFILE_LIST) | sed 's/:.*## /: /' | column -t -s ':'

# CI Pipeline targets (mirrors .circleci/config.yml)
clean: ## Remove node_modules
	rm -rf node_modules

deps: ## Install dependencies
	@rm -f package-lock.json
	yarn install

build: ## Build TypeScript/Babel sources
	yarn run build

validate: ## Validate Realm schemas for compatibility
	yarn validate:schemas

test: ## Run all tests
	yarn test

ci: deps build validate test ## Run full CI pipeline locally
	@echo "✓ CI pipeline completed successfully"

# Development helpers
test-realm-v12: ## Run Realm v12 compatibility tests
	yarn test:realm-v12

# Release targets
release: get-current-version ## Prepare a new release (bump version)
	@echo "\033[0m"
	@yarn version
	@echo "   Now please run \nmake publish"

publish: ## Publish release to git
	git push && git push origin --tags

# Deployment targets
copy-dist-to-avni-client:
	cp -r * ../avni-client/packages/openchs-android/node_modules/openchs-models/

deploy-to-avni-client-only:
	$(call _deploy,../avni-client/packages/openchs-android/node_modules/openchs-models)

deploy-to-avni-web-only:
	$(call _deploy,../avni-webapp/node_modules/openchs-models)

deploy-to-avni-rule-server-only:
	$(call _deploy,../rule-server/node_modules/openchs-models)

deploy-to-avni-client: build validate deploy-to-avni-client-only ## Build, validate & deploy to avni-client
deploy-to-avni-web: build validate deploy-to-avni-web-only ## Build, validate & deploy to avni-webapp
deploy-to-avni-rule-server: build validate deploy-to-avni-rule-server-only ## Build, validate & deploy to rule-server

deploy-to-avni-project: build
	$(if $(local),$(call _deploy,$(local)/node_modules/openchs-models))

deploy-as-source-to-avni-client:
	$(call _deploy_as_source,../avni-client/packages/openchs-android/node_modules/openchs-models)

# Deployment helper functions
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

# Version management
get-current-version:
	git pull --tags
	git pull --rebase
	@echo "Ensure version changes follow semantic versioning - https://classic.yarnpkg.com/en/docs/dependency-versions#toc-semantic-versioning"
	@echo "\033[1mLatest openchs-models version across branches:"
	npm view openchs-models version
