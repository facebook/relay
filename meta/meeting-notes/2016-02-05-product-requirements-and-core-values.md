# Agenda

This was a brainstorming session amongst the core team with the goal of cataloging pain points and outstanding feature requests for product developers using Relay. We also discussed the high-level value proposition of Relay.

# Product Requirements

This list covers pain points, work-in-progress features, and new features.

* Performance
  * fast startup & time to interaction (TTI)
  * managing resource consumption (including cache eviction/GC)
  * maintaining app responsiveness
* Control over Consistency / Staleness
  * when to force fetch?
  * controlling staleness → leads to force fetching
  * force fetching → can lead to missing fields on records & missing records in lists
* Mutations
  * consistency with non-Relay portions of an application
  * range/other configs are confusing, easy to mess up w/o good feedback
  * performance proportional to what is visible, not entire history of what has been fetched
  * know when optimistic updates are missing data relative to the fat query and warn developer to update
* Scalability
  * isolating different sections of an app w.r.t. to perf/consistency
  * different scheduling policies (sync/async)
  * different caching/staleness policies
* Understanding variables
  * how to access route params in containers?
  * prepareVariables - undocumented, executed unpredictably, makes persisting queries difficult
  * confusion over the need to pass variables in the query and in props (note: it's to differentiate the same child being embedded twice in the same parent but with different props).
* Non-Facebook GraphQL
  * more pagination options (e.g. windowed pagination or non-cursor based)
  * remove Facebook GraphQL-isms such as node, viewer, etc.
* Developer experience
  * derive flow types from fragments
  * solution for null-checks everywhere
* New Features
  * observing data outside of containers
  * manually updating the store (ex: appending to a list w/o a mutation)
  * local schema & mutations and/or redux integration
  * server rendering in OSS
  * work offline in OSS
  * subscriptions in OSS
  * GraphQL-less Relay (or, optionally, Relay w/o a GraphQL server)
  * preloading data for a predicted subsequent view

# Value Proposition

We discussed the high-level value proposition of Relay and what we think are the most and least important aspects to maintain going forward.

## Core Values
* Fast by default; performance is a feature.
* Control of consistency and updates.
* No manual data-fetching.
* Co-location of data dependencies and view logic.
* Aligns with the React mentality: component composition and local reasoning.
* Global efficiency (wins for one app benefit all).

## Non-Goals
* Absolute consistency. This has never been an explicit guarantee, and providing controlled means to relax consistency could open up new possibilities in the design space.
* Declarative connections (i.e. `first(n)` and Relay diffs for you). We've found this can be useful for deeply nested views and may be less useful for top-level list views.
* Fat/tracked queries: implementation detail.
* Diff queries: implementation detail.
* Disk cache outside of native apps (though likely desired in OSS).
