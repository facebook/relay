---
id: conversion-playbook
title: Conversion Playbook
layout: docs
category: Converting to Modern
permalink: docs/conversion-playbook.html
next: conversion-scripts
---

> Steps to incrementally modernize your app.

## Step 1
Start converting your components and mutations to use the Relay Modern APIs from the `react-relay/compat` module (`createFragmentContainer`, `createRefetchContainer`, `createPaginationContainer`, `commitMutation`). It will be easier to go from the leaf components up. The [conversion scripts](https://github.com/relayjs/relay-codemod) should make this step less tedious.

## Step 2
Once all the components and mutations have been converted to use the Relay Modern APIs, convert to using `QueryRenderer` instead of using `Relay.Renderer` or `Relay.RootContainer`. You may supply `Store` from `react-relay/classic` as the `environment` for most cases.

## Step 3
Once a few or all of your views are using `QueryRenderer`, `Store` from `react-relay/classic` could be replaced with a `RelayStaticEnvironment`. Keep in mind that `RelayStaticEnvironment` and `Store` do not share any data. You might want to hold off on this step until views that have significant data overlap can be switched over at the same time. This step is what unlocks the perf wins for your app. Apps using the `RelayStaticEnvironment` get to send persisted query IDs instead of the full query strings to the server, as well as much more optimized data normalizing and processing.

## Step 4 (clean-up)
Switch the `react-relay/compat` references in your app to `react-relay`. This is more of a clean-up step that prevents your app from pulling in unnecessary `react-relay/classic` code.
