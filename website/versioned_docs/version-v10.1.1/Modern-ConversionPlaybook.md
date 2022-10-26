---
id: conversion-playbook
title: Conversion Playbook
original_id: conversion-playbook
---
Incrementally modernize your Relay Classic app in these steps:

## Step 0: Install and configure your environment

Follow the steps outlined in the [Migration Setup](./Modern-MigrationSetup.md) guide.

## Step 1: Incrementally convert to Relay Compat

Start converting your components and mutations to use the Relay Modern APIs from the `'react-relay/compat'` module (`createFragmentContainer`, `createRefetchContainer`, `createPaginationContainer`, `commitMutation`). It will be easier to go from the leaf components up. The [conversion scripts](https://github.com/relayjs/relay-codemod) should make this step less tedious.

If a fragment uses variables that are determined at runtime, [see below](#note-determining-variable-values-at-runtime).

## Step 2: Introduce `<QueryRenderer>`

Once all the components and mutations have been converted to use the Relay Modern APIs, convert to using `QueryRenderer` instead of using `Relay.Renderer` or `Relay.RootContainer`. You may supply `Store` from `'react-relay/classic'` as the `environment` for most cases.

## Step 3: Introduce Relay Modern runtime

Once a few or all of your views are using `QueryRenderer`, `Store` from `'react-relay/classic'` could be replaced with a `RelayModernEnvironment`. Keep in mind that `RelayModernEnvironment` and `Store` do not share any data. You might want to hold off on this step until views that have significant data overlap can be switched over at the same time. This step is what unlocks the perf wins for your app. Apps using the `RelayModernEnvironment` get to send persisted query IDs instead of the full query strings to the server, as well as much more optimized data normalizing and processing.

## Step 4: Clean up by replacing Relay Compat with Relay Modern.

Switch the `'react-relay/compat'` references in your app to `'react-relay'`. This is more of a clean-up step that prevents your app from pulling in unnecessary `'react-relay/classic'` code.

## Note: Determining variable values at runtime

There is currently only one supported way to set the initial value of a variable dynamically: using global variables defined on the query that includes the fragment (or via `variables` on the `QueryRenderer`).

For example, if `currentDate` is set in `QueryRenderer` `variables`, then $currentDate may be referenced in any fragment included in the `QueryRenderer` `query`.

If you're using `createRefetchContainer` then your `refetch` method may also update these variables to render with new values.
