# Contributing to Relay

Relay is one of Facebook's open source projects that is both under very active development and is also being used to ship code to everybody on [facebook.com](https://www.facebook.com). We're still working out the kinks to make contributing to this project as easy and transparent as possible, but we're not quite there yet. Hopefully this document makes the process for contributing clear and answers some questions that you may have.

## [Code of Conduct](https://code.facebook.com/codeofconduct)

Facebook has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://code.facebook.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

## Our Development Process

Some of the core team will be working directly on GitHub. These changes will be public from the beginning. Other changesets will come via a bridge with Facebook's internal source control. This is a necessity as it allows engineers at Facebook outside of the core team to move fast and contribute from an environment they are comfortable in.

### `master` is unsafe

We will do our best to keep `master` in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We will do our best to communicate these changes and always version appropriately so you can lock into a specific version if need be.

### Pull Requests

The core team will be monitoring for pull requests. When we get one, we'll run some Facebook-specific integration tests on it first. From here, we'll need to get another person to sign off on the changes and then merge the pull request. For API changes we may need to fix internal uses, which could cause some delay. We'll do our best to provide updates and feedback throughout the process.

*Before* submitting a pull request, please make sure the following is done…

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`npm test`).
5. Ensure there are no Flow errors (`flow relay/src`).
6. If you haven't already, complete the CLA.

### Contributor License Agreement (CLA)

In order to accept your pull request, we need you to submit a CLA. You only need to do this once, so if you've done this for another Facebook open source project, you're good to go. If you are submitting a pull request for the first time, just let us know that you have completed the CLA and we can cross-check with your GitHub username.

[Complete your CLA here.](https://code.facebook.com/cla)

## Bugs & Questions

### Questions regarding how to use Relay and/or GraphQL

We want to keep signal strong in the GitHub issue tracker – to make sure that it remains the best place to track issues that affect the development of Relay.

If you have a question on how to use Relay, please [post it to Stack Overflow](https://stackoverflow.com/questions/ask?tags=relayjs) with the tag [#relayjs](http://stackoverflow.com/questions/tagged/relayjs).

### Reporting issues with Relay

We will be using GitHub Issues for our public bugs. We will keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new issue, make sure an issue for your problem doesn't already exist.

The best way to get your bug fixed is to provide a reduced test case. Please provide a public repository with a runnable example, or use the in-browser [Relay Playground](https://facebook.github.io/relay/prototyping/playground.html) to develop a minimal schema and application that reproduces the issue.

### Security bugs

Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe disclosure of security bugs. With that in mind, please do not file public issues; go through the process outlined on that page.

## How to Get in Touch

* Discord - [#relay](https://discordapp.com/channels/102860784329052160/102861057189490688) on [Reactiflux](http://www.reactiflux.com/)
* Stack Overflow - [#relayjs](https://stackoverflow.com/questions/tagged/relayjs)

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

## License

By contributing to Relay, you agree that your contributions will be licensed under its BSD license.
