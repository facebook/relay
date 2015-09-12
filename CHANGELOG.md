## master

## 0.3.0 (September 11, 2015)

* Fix query variable printing for non-null and list types (#203).
* Bumped React dependency to v0.14.0-rc.
* Switched to using `ReactDOM` rather than `React` for performing batched
  updates (via `unstable_batchedUpdates`).
* Updated the babel-relay-plugin to v0.2.3:
  * Added support for compiling queries containing introspection fields such as
    `__schema`, `__typename` and such.
  * Use of `field(before: ..., first: ...)` or `field(after: ..., last: ...)` is
    now an error.
* Various improvements to documentation, warnings and error messages.

## 0.2.1 (September 1, 2015)

* Support simplified route query definitions (previous API still supported).

## 0.2.0 (August 28, 2015)

* Upgraded jest to 0.5 and switched Relay to use iojs v2+ only.
* Changed `Relay.DefaultNetworkLayer` constructor to take an `init` object
  instead of `fetchTimeout` and `retryDelays`.
* Scalars other than strings are now allowed as cursors, so long as they
  serialize to strings.
* Added `npm run update-schema` to update the test schema.

## 0.1.1 (August 14, 2015)

* The 'main' entrypoint can now be used in non-ES6 projects (now built w/
  Babel).
* Instance methods of `Relay.DefaultNetworkLayer` are bound to the instance,
  facilitating reuse.
* Renamed `GraphQL_EXPERIMENTAL` to `GraphQL` (internal change).
* Update copyright headers.
* Remove invariant in `RelayQueryField.getCallType()` when argument is unknown.
* `GraphQLRange` returns diff calls with numeric values instead of strings.
* Example apps now include an ES6 polyfill.
* Moved React to peer dependencies; projects should depend on React directly.
* Variables in the default network layer are no longer double-JSON encoded.
* The default network layer now passed cookies along to the server.

## 0.1.0 (August 11, 2015)

* Initial public release.
