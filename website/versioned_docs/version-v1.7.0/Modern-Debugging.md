---
id: relay-debugging
title: Debugging
original_id: relay-debugging
---
When problems arise developers would need an insight into Relay's store. Relay provides a couple of tools to inspect the store and its records.

Relay DevTools is tool designed to help developers inspect their Relay state and understand how store changes overtime. Relay DevTools ships in two ways:

-   [Chrome Extension][extension] creates a Relay tab in the developer tools interface for debugging apps in Chrome
-   [Electron App][app] that connects to React Native apps running Relay

![Store Explorer](/img/docs/store-explorer.png)
![Mutations View](/img/docs/mutations-view.png)

[extension]: https://chrome.google.com/webstore/detail/relay-devtools/oppikflppfjfdpjimpdadhelffjpciba

[app]: https://www.npmjs.com/package/relay-devtools
