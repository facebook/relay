---
id: conversion-playbook
title: Conversion Playbook
layout: docs
category: Relay Compat
permalink: docs/conversion-playbook.html
next: conversion-scripts
---

Incrementally modernize your Relay Classic app in these steps:

## Step 0: Install Relay v1.0

Install the latest version of Relay from the [getting started guide](./relay-modern.html).

## Step 1: Incrementally convert to Relay Compat

Start converting your components and mutations to use the Relay Modern APIs from the `'react-relay/compat'` module (`createFragmentContainer`, `createRefetchContainer`, `createPaginationContainer`, `commitMutation`). It will be easier to go from the leaf components up. The [conversion scripts](https://github.com/relayjs/relay-codemod) should make this step less tedious.

## Step 2: Introduce <QueryRenderer>

Once all the components and mutations have been converted to use the Relay Modern APIs, convert to using `QueryRenderer` instead of using `Relay.Renderer` or `Relay.RootContainer`. You may supply `Store` from `'react-relay/classic'` as the `environment` for most cases.

## Step 3: Introduce Relay Modern runtime

Once a few or all of your views are using `QueryRenderer`, `Store` from `'react-relay/classic'` could be replaced with a `RelayStaticEnvironment`. Keep in mind that `RelayStaticEnvironment` and `Store` do not share any data. You might want to hold off on this step until views that have significant data overlap can be switched over at the same time. This step is what unlocks the perf wins for your app. Apps using the `RelayStaticEnvironment` get to send persisted query IDs instead of the full query strings to the server, as well as much more optimized data normalizing and processing.

## Step 4: Clean up by replacing Relay Compat with Relay Modern.

Switch the `'react-relay/compat'` references in your app to `'react-relay'`. This is more of a clean-up step that prevents your app from pulling in unnecessary `'react-relay/classic'` code.
