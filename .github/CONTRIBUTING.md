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
4. If you haven't already, complete the CLA (see below).

For JavaScript changes:

1. Ensure the test suite passes (`yarn test` or `npm test`).
2. Auto-format the code by running `yarn run prettier` or `npm run prettier`.
3. Ensure there are no Flow errors (`flow`).

For Rust changes:

1. [Install Rust and Cargo](https://www.rust-lang.org/tools/install)
2. Ensure all rust code is formatted by running `cargo fmt` from within `./compiler`.
3. If you've added or removed any fixture tests, ensure all generated tests are up to date by running `./scripts/update-fixtures.sh` from the repository root.
4. Ensure all code typechecks by running `cargo check` from within `./compiler`.
5. Ensure all tests pass by running `cargo test` from within `./compiler`.

### Contributor License Agreement (CLA)

In order to accept your pull request, we need you to submit a CLA. You only need to do this once, so if you've done this for another Facebook open source project, you're good to go. If you are submitting a pull request for the first time, just let us know that you have completed the CLA and we can cross-check with your GitHub username.

[Complete your CLA here.](https://code.facebook.com/cla)

## Bugs & Questions

### Security bugs

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe disclosure of security bugs. With that in mind, please do not file public issues; go through the process outlined on that page.

## How to Get in Touch

If you have a question on how to use Relay, please get in touch with community members through one of the channels listed [here](https://relay.dev/help).

## Style Guide

We use [Prettier](https://prettier.io/) to format JavaScript code and [Rustfmt](https://rust-lang.github.io/rustfmt/) to format Rust code.

To fix all JavaScript formatting errors run `yarn prettier`. To fix all Rust formatting errors, run `cargo fmt` from within `compiler/` followed by `./scipts/update-fixtures.sh` from the repository root to regenerate the unformatted generated tests.

## Development process for non-FB developers

A typical solution for working on a library is to test changes in your application project through 'linking’. The
following steps should work for all Relay packages:

1. Either trigger a build manually by running `yarn build` or keep a watcher running with `yarn build:watch`.
1. Make your package of choice available to link: `cd dist/relay-compiler && yarn link`.
1. Link the package into your project: `cd my/app && yarn link relay-compiler`.
1. Because of symbolic links and how Node resolves dependencies, you will probably want to instruct Node to
   preserve the links `yarn node --preserve-symlinks-main --preserve-symlinks ./node_modules/.bin/relay-compiler […]`.

## VSCode

This repository has configuration files in the `.vscode/` directory to make development in VSCode easier. This includes enumerating recommended extensions (Flow, Rust Analyzer, Prettier, etc.) and sensible default settings (enable auto formatting etc.) to use when developing in this repository as well as some defined [Tasks](https://code.visualstudio.com/docs/debugtest/tasks) to easily trigger common actions directly via the command pallet.

## License

By contributing to Relay, you agree that your contributions will be licensed under its MIT license.
