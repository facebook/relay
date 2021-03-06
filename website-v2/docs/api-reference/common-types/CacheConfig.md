#### Type `CacheConfig`

* An object with the following fields:
  * `force`: An optional boolean. If true, causes a query to be issued unconditionally, regardless of the state of any configured response cache.
  * `poll`: An optional number. Causes a query to live-update by polling at the specified interval, in milliseconds. (This value will be passed to `setTimeout`).
  * `liveConfigId`: An optional string. Causes a query to live-update by calling GraphQLLiveQuery; it represents a configuration of gateway when doing live query.
  * `metadata`: An object. User-supplied metadata.
  * `transactionId`: An optional string. A user-supplied value, intended for use as a unique id for a given instance of executing an operation.
