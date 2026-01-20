---
id: client-3d
title: Client 3D
slug: /guides/data-driven-dependencies/client-3d/
description: Client side data driven dependencies (3D)
keywords:
- 3D
- Client 3D
- data driven dependencies
- module
- match
- MatchContainer
---
import {FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Use client 3D when all the data fields used to render your 3D components are resolved by client-side [Relay Resolvers](../../relay-resolvers/introduction/).

## Example

Here is an example of how Client 3D can be used in a React app.

<FbInternalOnly>

:::note
For an example diff implementing Client 3D in www, see D62352682.
:::

</FbInternalOnly>

### Schema
You have an interface `IClient3D` that is a return type for a field on the query in your client schema extensions file:

```graphql
type Client3DData {
  type: String!
  info: String!
}

interface IClient3D {
  id: ID!
  data: Client3DData!
}

extend type Query {
  client3D: IClient3D
}
```

### Relay Resolvers
You have 3 Relay Resolvers that return concrete objects that implement the `IClient3D` interface:

<Tabs>
  <TabItem value="1" label="Client3DBar" default>

```ts
export type Client3DModel = {
  __id: DataID,
};

/**
 * @RelayResolver Client3DBar implements IClient3D
 */
function Client3DBar(id: DataID): ?Client3DModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @RelayResolver Client3DBar.data: Client3DData
 */
function data(client3DModel: Client3DModel): Client3DData {
  return {
    type: 'BAR',
    info: 'someBarInfo',
  }
}
```

  </TabItem>
  <TabItem value="2" label="Client3DFoo">

```ts
/**
 * @RelayResolver Client3DFoo implements IClient3D
 */
function Client3DFoo(id: DataID): ?Client3DModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @RelayResolver Client3DFoo.data: Client3DData
 */
function data(client3DModel: Client3DModel): Client3DData {
  return {
    type: 'FOO',
    info: 'someFooInfo',
  }
}
```

  </TabItem>
   <TabItem value="3" label="Client3DHelloWorld">

```ts
/**
 * @RelayResolver Client3DHelloWorld implements IClient3D
 */
function Client3DHelloWorld(id: DataID): ?Client3DModel {
  if (id === INVALID_ID) {
    return null;
  }
  return {
    __id: id,
  };
}

/**
 * @RelayResolver Client3DHelloWorld.data: Client3DData
 */
function data(client3DModel: Client3DModel): Client3DData {
  return {
    type: 'HELLO_WORLD',
    info: 'someHelloWorldInfo',
  }
}
```

  </TabItem>
</Tabs>


### Component
Before making use of Client 3D, your component will look something like this:
```jsx
component Client3DRelayRenderer() {
  const CLIENT_3D_FRAGMENT = graphql`
    fragment Client3DRelayRendererClient3DFragment on IClient3D {
      data {
        type
        info
      }
    }
  `;
  const client3DData = useClientQuery(
    graphql`
      query Client3DRelayQuery {
        client3D {
          ...Client3DRelayRendererClient3DFragment
        }
      }
    `
  );

  let component;
  if (client3DData?.data?.type === 'FOO'):
    component = <Client3DFooComponent data={client3DData.data} />
  else if (client3DData?.data?.type === 'BAR'):
    component = <Client3DBarComponent data={client3DData.data} />
  else if (client3DData?.data?.type === 'HELLO_WORLD'):
    component = <Client3DHelloWorldComponent data={client3DData.data} />

  return (
    component
  );
}
```

In order to use Client 3D, you don't have to modify your Relay Resolvers or schema at all.

Just modify your component in the following ways:
1. Declare separate fragments for each concrete type implementing `IClient3D` that you're fetching. So in this example, these separate fragments are `FOO_FRAGMENT`, `BAR_FRAGMENT`, and `HELLO_WORLD_FRAGMENT`.
2. Add the `@module` directive to your fragment, and include the name of the corresponding UI component to this fragment's data as an argument.
3. Return the final component using Relay's `MatchContainer`, providing the returned query data as a prop.

Notice that in Client 3D, just as in Server 3D, you cannot use `@module` on multiple fragments on the SAME concrete type (but they can be on the same abstract type i.e. a union or an interface).

So in this example, `Client3DFooComponent_Fragment` is on the concrete type `Client3DFoo`, and `Client3DBarComponent_Fragment` is on the concrete type `Client3DBar`. If `Client3DBarComponent_Fragment` was also on `Client3DFoo`, the relay compiler would report an error. However, all three concrete types implement the same parent interface `IClient3D`, which is fine.

<FbInternalOnly>

:::tip
If you are in www, but not in Comet, you should use `RelayFBMatchContainer` instead of `MatchContainer`.
:::

</FbInternalOnly>

After Client 3D, your component code will look something like this:
```jsx
const {graphql, useFragment, useClientQuery, MatchContainer} = require('react-relay');

component Client3DRelayRenderer() {
  const FOO_FRAGMENT = graphql`
    fragment Client3DFooComponent_Fragment on Client3DFoo {
      data {
        type
        info
      }
    }
  `;
  const BAR_FRAGMENT = graphql`
    fragment Client3DBarComponent_Fragment on Client3DBar {
      data {
        type
        info
      }
    }
  `;
  const HELLO_WORLD_FRAGMENT = graphql`
    fragment Client3DHelloWorldComponent_Fragment on Client3DHelloWorld {
      data {
        type
        info
      }
    }
  `;
  const client3DData = useClientQuery(
    graphql`
      query Client3DRelayQuery {
        client3D {
          ...Client3DFooComponent_Fragment
            @module(name: "Client3DFooComponent.react")
          ...Client3DBarComponent_Fragment
            @module(name: "Client3DBarComponent.react")
          ...Client3DHelloWorldComponent_Fragment
            @module(name: "Client3DHelloWorldComponent.react")
        }
      }
    `
  );
  return (
    <MatchContainer match={client3DData.client3D} />
  );
}
```

## Limitations

While Client 3D can offer many benefits such as a more intuitive developer experience, enhanced maintanability, and faster performance, it also has some limitations that Server 3D does not.

One key difference is the number of round trips required to fetch data. Server 3D requires at most two round trips: one to the server for data and one to the CDN for JavaScript. In contrast, Client 3D evaluates resolver code as part of rendering the component, which means that the client needs to render the component to discover what JavaScript code is needed. This can lead to additional round trips, especially when dealing with nested Client 3D usage.

For example, consider a blog entry that uses Client 3D to render either a photo blog post or text blog post. The text blog post then uses Client 3D again to determine what type of text presentation format should be used. This can result in nested Client 3D usage, leading to multiple round trips.

Relay is working on solutions to this drawback at the moment, but they have not been productionized yet. Hence, when using Client 3D please make sure that you're not using it in a nested manner to avoid performance degradation.
