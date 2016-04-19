## master

* `Relay.Environment#injectNetworkLayer` (and, by extension
  `Relay#injectNetworkLayer`) will now warn if injecting would overwrite a
  previously injected layer.
* Added experimental low-level `RelayGraphQLMutation` API (still being
  finalized and not yet documented, so use at your own risk).

## 0.8.0 (April 11, 2016)

* Added a React Native / Relay TodoMVC example app.
* You can now render multiple Relay apps at once, each with their own store.
  The following APIs are early versions and are as of yet undocumented so please
  use them with caution.
  * Added `Relay.Environment`. `Relay.Store` is now simply a global instance of
    `RelayEnvironment`. To create your own isolated store and network subsystem,
    create a `new RelayEnvironment()` and make use of it wherever `environment`
    is required.
  * Use `Relay.Environment#injectNetworkLayer` to inject a custom network layer
    for use within the context of a particular `Relay.Environment` instance.
  * Added `Relay.ReadyStateRenderer`. This component takes in an instance of
    `Relay.Environment`, a `queryConfig` that conforms to the
    `RelayQueryConfigInterface`, and a Relay `container`. It renders
    synchronously based on the supplied `readyState`. This primitive enables you
    to create alternatives to `Relay.Renderer` that fetch and handle data in a
    custom way (eg. for server rendered applications).
  * Added `Relay.Renderer` &ndash; a replacement for `Relay.RootContainer` that
    composes a `Relay.ReadyStateRenderer` and performs data fetching.
    `Relay.RootContainer` is now a wrapper around `Relay.Renderer` that
    substitutes `Relay.Store` for `environment`.
* Renamed the Flow type `RelayRendererRenderCallback` to `RelayRenderCallback`.
* Renamed the Flow type `RelayQueryConfigSpec` to `RelayQueryConfigInterface`.
* `RelayContainer.setVariables` will no longer check if the variables are
  changed before re-running the variables. To prevent extra work, check the
  current variables before calling `setVariables`.
* You can now roll back mutations in the `COMMIT_QUEUED` state using
  `RelayMutationTransaction#rollback`.
* When specifying a `NODE_DELETE` or `RANGE_DELETE` mutation config, you can
  omit `parentID` if your parent, in fact, does not have an ID.
* In cases where you query for a field, but that field is unset in the response,
  Relay will now write `null` into the store for that field. This allows you to
  return smaller payloads over the wire by simply omitting a key in the JSON
  response, rather than to write an explicit `fieldName: null`.
* If the `relay` prop does not change between renders, we now recycle the same
  object. This should enable you to make an efficient `this.props.relay ===
  nextProps.relay` comparison in `shouldComponentUpdate`.
* You can now craft a connection query having invalid combinations of connection
  arguments (first/last/after/before) so long as the values of those arguments
  are variables and not concrete values (eg. `friends(first: $first, last:
  $last)` will no longer cause the Relay Babel plugin to throw).
* Added runtime validation to mutation configs to help developers to debug their
  `Relay.Mutation`.
* Added `RelayNetworkDebug`. Invoke
  `require('RelayNetworkDebug').init(Relay.DefaultNetworkLayer)` to enjoy simple
  to read logs of your network requests and responses on the console. Substitute
  your own network layer if you use one.
* Added two new `rangeBehaviors`:
  * `IGNORE` means the range should not be refetched at all.
  * `REFETCH` will refetch the entire connection.
* Connection diff optimization: Enables a mode where Relay skips diffing
  information about edges that have already been fetched. This can be enabled by
  adding `@relay(variables: ['variableNames'])` to a connection fragment.

## 0.7.3 (March 4, 2016)

* The instance of Babel that the babel-relay-plugin receives will now be used
  when making assertions about version numbers.

## 0.7.2 (March 4, 2016)

* Identifying arguments on root fields can now be of any type - boolean, number,
  string, or array/object of the the same.
* Fixes a bug when we read connections or fragments without allocating a record
  until we encounter a child field that is not null. We now ensure that we
  allocate the record for connections and fragments (if it exists) regardless.
* Made babelAdapter compatible with Babel 6.6
* `npm run build` now works on Windows
* Tests now pass when using Node 5 / NPM 3
* Passing an empty array as a prop corresponding to a plural fragment no longer
  warns about mock data. The empty array is now passed through to the component
  as-is.
* Removed `uri` from `RelayQueryConfigSpec`. The `uri` property was part of
  `RelayRoute`, but never `RelayQueryConfig`. This revision simply cleans up the
  Flow shape in `RelayContainer`.
* RelayRenderer now runs queries after mount to make sure `RelayRenderer` does
  not run queries during synchronous server-side rendering.

## 0.7.1 (February 18, 2016)

* Having fixed a bug, now you can *actually* interpolate an array of fragments
  into a `Relay.QL` query. eg. `${containers.map(c => c.getFragment('foo'))}`

## 0.7.0 (February 12, 2016)

* Eliminated a race condition that would cause `RelayGarbageCollector` to fatal
  when, in the middle of a `readRelayDiskCache` traversal, a container attempts
  to subscribe to a record not yet registered with the garbage collector.
* The garbage collector now strictly increments references to all subscribed
  nodes, and strictly decrements references to all previously subscribed nodes,
  eliminating a class of race condition by ensuring an exact 1:1 correspondence
  of increment/decrement calls for a given node.
* Replaced `GraphQLStoreDataHandler` with `RelayRecord`, and added the
  `RelayRecord#isRecord` method.
* Introduced `RelayQueryIndexPath` which tracks fragment indexes to the nearest
  parent field during query traversal. This replaces the existing logic used to
  generate field serialization keys.
* Added `RelayContext`, a step toward making all Relay state contextual.
* Improved query printing performance via short circuiting and inlining.
* Moved record writing functions out of `RelayRecordStore` and into a new
  `RelayRecordWriter` class.
* The Babel plugin now prints `canHaveSubselections` metadata on object-like
  fields that can contain child fields, making it possible to determine if a
  given field in a query is a true leaf node, or an object-type field having no
  subselections. This replaces `RelayQueryNode#isScalar` with
  `RelayQueryNode#canHaveSubselections`.
* `RANGE_DELETE` mutation configs now allow you to specify an array path to a
  deleted node, rather than just a `deletedIDFieldName`.
* Renamed `Records` to `RecordMap`.
* Record reads from cache managers are now abortable. If the network request
  finishes before the cache read, for instance, the cache read can be cancelled.
* Added USERS.md; a catalog of products and developers that use Relay.
* You can now interpolate an array of fragments into a `Relay.QL` query. eg.
  `${containers.map(c => c.getFragment('foo'))}`
* Fixed a bug where invalid queries could be printed due to different variables
  having the same value; duplicates are now avoided.

## 0.6.1 (January 8, 2016)

* Renamed `RelayStore#update` to `RelayStore#commitUpdate`. `RelayStore#commit`
  will be removed in v0.8.0. For an automated codemod that you can use to
  update your Relay app, visit https://github.com/relayjs/relay-codemod
* Replaced `RelayTestUtils.unmockRelay();` with
  `require('configureForRelayOSS');` in tests.
* Fragment names in printed queries are now less verbose.
* Fixed a bug that caused queries to be printed incorrectly.
* Eliminated concrete fragment hashes.
* Connections now handle repeated edges more gracefully.
* Created a new `RelayTaskQueue` class. Used it to back `RelayTaskScheduler`.
* Reduced memory by only storing paths to container root nodes.
* Renamed `RelayTaskScheduler#await` to `RelayTaskScheduler#enqueue`.
* Fixed a series of memory leaks with a new GC implementation.
* Tests now run with Jasmine 2.

## 0.6.0 (December 4, 2015)

* Bump the `babel-relay-plugin` version to v0.6.0 (now Babel 6 compatible).
* The keys in `rangeBehaviors` are now compared against the *sorted* filter
  arguments of a field. For the field `foo(first: 10, b:true, a:false)` the
  matching range behavior key will be `'a(false).b(true)'`.
* Relay will now throw an invariant if range behavior keys are unsorted.
* Fragments are now supported in mutation fat queries.
* Added `Relay.Store#applyUpdate` method to create a transaction optimistically
  without committing it. Returns a transaction object that you can use to
  `commit()` or `rollback()`.
* Added `RelayStoreData#clearCacheManager` method.
* Renamed `RelayQuery#getHash` to `RelayQuery#getConcreteFragmentHash`
* Removed `RelayQueryPath#toJSON` and `RelayQueryPath#fromJSON`

## 0.5.0 (November 11, 2015)

* Bump the `babel-relay-plugin` version to v0.4.1.
  * Added validation of arguments for connections with `edges` or `pageInfo`.
    * Connections without arguments in fat queries can add the new fragment
      directive `@relay(pattern: true)`.
  * Fixed validation of fields within inline fragments in connections.
  * Print queries using a plain-object representation (instead of `GraphQL`
    objects).
* `RelayQueryField#getStorageKey` will now produce the same key regardless of
  the order of a field's arguments.
* Range behavior keys in mutation configs are now guaranteed to be sorted.
* Added the `Relay.createQuery()` function which returns a
  `RelayQuery.Root` (that can be used with `Relay.Store` methods).
* Optimistic response keys now use GraphQL OSS syntax. (Usage of old, call-like
  syntax is now deprecated and will warn.)
* Fix a bug where optimistic queries could cause the error "Could not find a
  type name for record ...".

## 0.4.0 (October 13, 2015)

* Bump the `babel-relay-plugin` version to v0.3.0.
  * Fixed the metadata for fields on abstract types.
  * Directives are now validated against the schema.
  * Mutations field arguments are now validated.
  * Non-root `node(id: ...)` fields are now invalid.
  * Added support for `RelayQL` template tag.
  * Improvements to validation and error messages.
* The `__typename` of abstract types are now fetched and stored locally.
* Fixed `hasOptimisticUpdate` returning true after mutation succeeds (#86).
* Fixed printing mutations with generated `id` fields (#414).
* Fixed updating views when removing the last element in a plural field (#401).
* Fixed sending mutations via classes without invalid GraphQL characters (#448).
* Added a `__DEV__`-only warning when data is passed down via the wrong prop.

## 0.3.2 (September 18, 2015)

* Bump the `babel-relay-plugin` version to v0.2.5.
  * Queries now preserve directives.
  * Output is now generated by babel.
* Fix refragmenting diff queries (#305).
* Directives are now printed.

## 0.3.1 (September 11, 2015)

* Rebuild to replace faulty NPM package (no code changes).

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
