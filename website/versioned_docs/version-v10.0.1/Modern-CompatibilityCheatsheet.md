---
id: compatibility-cheatsheet
title: Compatibility Cheatsheet
original_id: compatibility-cheatsheet
---
What works with what? Relay Compat (`'react-relay/compat'`) is the most flexible.
Compat components and mutations can be used by everything. Compat components can also have any kind of children.

However components using the Relay Modern API (`'react-relay'`) and the Relay Classic API (`'react-relay/classic'`) cannot be used with each other.

### Can RelayRootContainer use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| Yes               | Yes              | No               | Yes              | Yes             | No              |

### Can QueryRenderer using Classic Environment (`Store` in `react-relay/classic`) use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| Yes               | Yes              | No               | Yes              | Yes             | No              |

### Can QueryRenderer using Modern Environment use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| No                | Yes              | Yes              | No               | Yes             | Yes             |

### Can React Modern Component use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| No                | Yes              | Yes              | No               | Yes             | Yes             |

### Can React Compat Component use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| Yes               | Yes              | Yes              | Yes\*            | Yes             | Yes             |

\* Modern API doesn't support mutation fragments. You might have to inline the mutation fragments from your legacy mutation in the fragment of the component.

### Can React Classic Component use:

| Classic Component | Compat Component | Modern Component | Classic Mutation | Compat Mutation | Modern Mutation |
| ----------------- | ---------------- | ---------------- | ---------------- | --------------- | --------------- |
| Yes               | Yes              | No               | Yes              | Yes             | No              |
