## master

* The 'main' entrypoint can now be used in non-ES6 projects (now built w/ Babel)
* Instance methods of `Relay.DefaultNetworkLayer` are bound to the instance,
  facilitating reuse.
* Renamed `GraphQL_EXPERIMENTAL` to `GraphQL` (internal change).
* Update copyright headers.
* Remove invariant in `RelayQueryField.getCallType()` when argument is unknown.
* `GraphQLRange` returns diff calls with numeric values instead of strings.

## 0.1.0 (August 11, 2015)

* Initial public release.

