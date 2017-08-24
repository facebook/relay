---
id: relay-debugging
title: Debugging
layout: docs
category: Relay Modern
permalink: docs/relay-debugging.html
next: relay-compat
---

When problems arise developers would need an insight into Relay's store. Relay provides a couple of tools to inspect the store and its records programmatically and visually.

## Debugging Visually

Relay DevTools is tool designed to help developers inspect their Relay state and understand how store changes overtime. Relay DevTools ships in two ways:

- [Chrome Extension][extension] creates a Relay tab in the developer tools interface for debugging apps in Chrome
- [Electron App][app] that connects to React Native apps running Relay

![Store Explorer](../img/store-explorer.png)
![Mutations View](../img/mutations-view.png)

[extension]:https://chrome.google.com/webstore/detail/relay-devtools/oppikflppfjfdpjimpdadhelffjpciba
[app]: https://github.com/relayjs/relay-debugger/tree/master/react-native-shell

## Debugging Programmatically

These features can be used in a couple of common scenarios: logging the client state for later inspection or interactively poking around the store from your browser's debugger.

## A simple example

In this example, create an inspector object based on the same source as passed into your [Relay Environment](./relay-environment.html). Later you can use this inspector object to inspect records. Inspector is only available in the development build.

```javascript
const {
  RecordSource,
  Store,
  RecordSourceInspector,
} = require('relay-runtime');

const source = new RecordSource();
const store = new Store(source);
const inspector = new RecordSourceInspector(source);

inspector.getNodes(); // all records with an id
inspector.getRecords(); // all records with or without an id
inspector.get("<recordId>").inspect(); // record with fields
```
