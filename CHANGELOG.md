## master

* Upgraded jest to 0.5 and switched Relay to use iojs v2+ only.
* All fragments in a Relay.Container must now have a query with a matching
  name in any Relay.Route that uses it and vice versa.

## 0.1.1 (August 14, 2015)

* The 'main' entrypoint can now be used in non-ES6 projects (now built w/ Babel)
* Instance methods of `Relay.DefaultNetworkLayer` are bound to the instance,
  facilitating reuse.
* Renamed `GraphQL_EXPERIMENTAL` to `GraphQL` (internal change).
* Update copyright headers.
* Remove invariant in `RelayQueryField.getCallType()` when argument is unknown.
* `GraphQLRange` returns diff calls with numeric values instead of strings.
* Example apps now include an ES6 polyfill
* Moved React to peer dependencies; projects should depend on React directly
* Variables in the default network layer are no longer double-JSON encoded
* The default network layer now passed cookies along to the server

## 0.1.0 (August 11, 2015)

* Initial public release.
