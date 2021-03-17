---
id: classic-guides-ready-state
title: Ready State
original_id: classic-guides-ready-state
---
Whenever Relay is fulfilling data requirements, it can be useful to know when certain events occur. For example, we might want to record how long it takes for data to be available, or we might want to log errors to the server. These events are available on most Relay APIs via the `onReadyStateChange` callback.

## `onReadyStateChange`

When Relay fulfills data, the `onReadyStateChange` callback is called one or more times with an object that describes the current "ready state". This object has the following properties:

-   `ready: boolean`

    This is true when the subset of data required for rendering is ready.

-   `done: boolean`

    This is true when _all_ data requirements are ready for rendering.

-   `error: ?Error`

    This is an instance of `Error` if there is a failure. Otherwise, this is
    `null`.

-   `events: Array<ReadyStateEvent>`

    This is an array of events received so far (see `ReadyStateEvent` below).

-   `stale: boolean`

    When "force fetching", this is true if `ready` is true as a result of data being available on the client before the server request has completed.

-   `aborted: boolean`

    Whether the request was aborted.

## `ReadyStateEvent`

-   `ABORT`
-   `CACHE_RESTORED_REQUIRED`
-   `CACHE_RESTORE_FAILED`
-   `CACHE_RESTORE_START`
-   `NETWORK_QUERY_ERROR`
-   `NETWORK_QUERY_RECEIVED_ALL`
-   `NETWORK_QUERY_RECEIVED_REQUIRED`
-   `NETWORK_QUERY_START`
-   `STORE_FOUND_ALL`
-   `STORE_FOUND_REQUIRED`

## Examples

### Fetching Data from the Server

If insufficient data on the client leads Relay to send a server request for more data, we can expect the following behavior:

1.  Once with `ready` set to false.
2.  Once with `ready` and `done` set to true.

### Resolving Data from the Client

If sufficient data is available on the client such that Relay does not need to send a server request, we can expect the following behavior:

1.  Once with `ready` and `done` set to true.

### Server Error

If a server request results in a failure to load data, we can expect the following behavior:

1.  Once with `ready` set to false.
2.  Once with `error` set to an `Error` object.

Note that `ready` and `done` will continue to be false.

### Force Fetching with Data from the Client

If a "force fetch" occurs and there is insufficient data on the client, the same behavior as **Fetching Data from the Server** can be expected. However, if a "force fetch" occurs and there _is_ sufficient data on the client to render, we can expect the following behavior:

1.  Once with `ready`, `done`, and `stale` set to true.
2.  Once with `ready` and `done` set to true, but `stale` set to false.
