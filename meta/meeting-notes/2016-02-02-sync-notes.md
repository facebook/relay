# Agenda

1. Status updates from team members
2. Discussion of open source
3. Planning H1 roadmap

# Status updates

- @kassens
  - Working on making the way we sync code between internal projects sane.
  - Phase 1 done: tests pass in new centralized location.
  - Currently updating sync scripts.
- @steveluscher
  - Working on flexible new Relay Connection API.
  - Deal with existing TODOs in codebase.
  - Integrating with internal project to start gathering performance metrics.
- @josephsavona
  - Proof of concept of ability to run Relay in a Web Worker.
  - Working with @yungsters on persisted queries.
- @wincent
  - Working on open source plan (the fact that this document exists is part of it!).
  - Gathering feedback and input on overhaul of the mutations API.
  - Hackathon: experiment with removing tracked queries.
- @yuzhi
  - Shipped `RelayRecordWriter` refactor.
  - Worked with internal teams on "missing node" bug and GC vs disk cache issues.
- @yungsters
  - Shipped code for sending persisted queries.
  - Needs to figure out plan for splitting persisted queries configs.
  - Starting to explore expanding the query in parallel with network operation.
- @elynde
  - Working with native GraphQL people.

# Open source

We discussed various ways to increase our transparency improve the communication with our open source users:

- Will start publishing meeting notes here on the wiki.
- We have a couple of talks which were given in venues but not recorded; intend to give these again and video them for wider distribution. 
- Will update our roadmap [#788](https://github.com/facebook/relay/issues/788).
- Will set up a repo analogous to [react-future](https://github.com/reactjs/react-future).

Plenty of other ideas, but discussion was time-boxed; will continue later this week.

# H1 roadmap

We have a [Roadmap document](https://github.com/facebook/relay/wiki/Roadmap) but it is out of date. Rather than dump the contents of our discussion here in the notes I will just update the document [#788](https://github.com/facebook/relay/issues/788).
