# Contributing to Relay

Relay is one of Facebook's open source projects that is both under very active development and is also being used to ship code to everybody on [facebook.com](https://www.facebook.com). We're still working out the kinks to make contributing to this project as easy and transparent as possible, but we're not quite there yet. Hopefully this document makes the process for contributing clear and answers some questions that you may have.

## [Code of Conduct](https://code.facebook.com/codeofconduct)

The code of conduct is described in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

## Our Development Process

Some of the core team will be working directly on GitHub. These changes will be public from the beginning. Other changesets will come via a bridge with Facebook's internal source control. This is a necessity as it allows engineers at Facebook outside of the core team to move fast and contribute from an environment they are comfortable in.

### `main` is unsafe

We will do our best to keep `main` in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We will do our best to communicate these changes and always version appropriately so you can lock into a specific version if need be.

### Pull Requests

The core team will be monitoring for pull requests. When we get one, we'll run some Facebook-specific integration tests on it first. From here, we'll need to get another person to sign off on the changes and then merge the pull request. For API changes we may need to fix internal uses, which could cause some delay. We'll do our best to provide updates and feedback throughout the process.

*Before* submitting a pull request, please make sure the following is done:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`yarn test` or `npm test`).
5. Auto-format the code by running `yarn run prettier` or `npm run prettier`.
6. Ensure there are no Flow errors (`flow`).
7. If you haven't already, complete the CLA.

### Contributor License Agreement (CLA)

In order to accept your pull request, we need you to submit a CLA. You only need to do this once, so if you've done this for another Facebook open source project, you're good to go. If you are submitting a pull request for the first time, just let us know that you have completed the CLA and we can cross-check with your GitHub username.

[Complete your CLA here.](https://code.facebook.com/cla)

## Bugs & Questions

### Security bugs

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe disclosure of security bugs. With that in mind, please do not file public issues; go through the process outlined on that page.

## How to Get in Touch

If you have a question on how to use Relay, please get in touch with community members through one of the channels listed [here](https://relay.dev/help).

## Style Guide

We will eventually have a linter that will catch most styling issues that may exist in your code. Until then, looking at [Airbnb's Style Guide](https://github.com/airbnb/javascript) will guide you in the right direction.

### Code Conventions

* 2 spaces for indentation (no tabs).
* 80 character line length strongly preferred.
* Prefer `'` over `"`.
* ES2015 syntax when possible.
* `'use strict';`.
* Use [Flow types](http://flowtype.org/).
* Use semicolons;
* Trailing commas,
* Avd abbr wrds.

## Development process for non-FB developers

A typical solution for working on a library is to test changes in your application project through ‘linking’. The
following steps should work for all Relay packages:

1. Either trigger a build manually by running `yarn build` or keep a watcher running with `yarn build:watch`.
1. Make your package of choice available to link: `cd dist/relay-compiler && yarn link`.
1. Link the package into your project: `cd my/app && yarn link relay-compiler`.
1. Because of symbolic links and how Node resolves dependencies, you will probably want to instruct Node to resolve
   preserve the links `yarn node --preserve-symlinks-main --preserve-symlinks ./node_modules/.bin/relay-compiler […]`. 

## License

By contributing to Relay, you agree that your contributions will be licensed under its MIT license.
