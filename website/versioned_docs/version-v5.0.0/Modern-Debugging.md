---
id: relay-debugging
title: Debugging
original_id: relay-debugging
---
If you're new to Relay, we provide some basic debugging strategies that should serve to help you clarify key concepts as you build your app. Alternatively, Relay provides a couple of tools to inspect the store and its records.

## Strategies

**Given:** You've properly setup your schema on the backend and React on the frontend. You've read through the documents but can't seem to identify what's wrong with your code. You've even done a number of searches but can't find the answer you're looking for.

**A few questions to ask yourself:**

-   _Is my [compilation](Introduction-InstallationAndSetup.md#set-up-relay-compiler) up-to-date?_
-   _Is my query valid?_ You can test this on your GraphiQL endpoint.

**If so:**

1.  Put your entire query at the top-level (your `QueryRenderer`) and comment out all fragment containers. Pass the data through your component hierarchy down to the components that were using fragments.
2.  If your app isn't rendering properly, use `console.log(props);` for every component to see the props you are actually passing.
3.  Once your app is rendering, uncomment the deepest fragment container and add that fragment back to your top-level query. Everything should still render. If not, use `console.log(props);` again.
4.  Continue uncommenting fragments and confirming that your app renders until your top-level query is as desired.
5.  If this still fails, come back to your code later and try debugging with a fresh mind. Additionally, you can [post an issue](https://github.com/facebook/relay/issues/new) and someone should get back to you hopefully within a few days.

## Tools

Relay DevTools is tool designed to help developers inspect their Relay state and understand how store changes overtime. Relay DevTools ships in two ways:

-   [Chrome Extension][extension] creates a Relay tab in the developer tools interface for debugging apps in Chrome

![Store Explorer](/img/docs/store-explorer-updated.png)
![Mutations View](/img/docs/mutations-view-updated.png)

[extension]: https://chrome.google.com/webstore/detail/relay-developer-tools/ncedobpgnmkhcmnnkcimnobpfepidadl

[app]: https://www.npmjs.com/package/relay-devtools
