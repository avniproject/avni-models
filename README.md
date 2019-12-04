# openchs-models

OpenCHS data model to be used by front end clients

CI [![CircleCI](https://circleci.com/gh/avni/avni-models.svg?style=svg)](https://circleci.com/gh/avni/avni-models)

## Dev flow



### Publish
 - Bump up version in package.json and commit/push
 - Create a tag for the version and push the tag. CI will automatically publish the package for you. 
 ```
  git tag v0.0.7
  git push origin --tags
 ```
 - Use the published package in your repositories
