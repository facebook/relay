# Pagination

Demonstrates cursor-based pagination with Relay's `@connection` and
`@refetchable` directives. A list of items is served behind a connection
field with `first`/`after` arguments. The component initially loads 2 items
and offers a "Load More" button powered by `usePaginationFragment`. Clicking
it fetches the next page and Relay merges the new edges into the connection.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

Defines the full connection type hierarchy (`Item`, `ItemEdge`, `PageInfo`,
`ItemConnection`) and a paginated `items` query field.

```ts title="server.ts"
import type { ID, Int } from "grats";

const ALL_ITEMS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

/** @gqlType */
type Item = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
};

/** @gqlType */
type ItemEdge = {
  /** @gqlField */
  node: Item;
  /** @gqlField */
  cursor: string;
};

/** @gqlType */
type PageInfo = {
  /** @gqlField */
  hasNextPage: boolean;
  /** @gqlField */
  hasPreviousPage: boolean;
  /** @gqlField */
  startCursor: string | null;
  /** @gqlField */
  endCursor: string | null;
};

/** @gqlType */
type ItemConnection = {
  /** @gqlField */
  edges: ItemEdge[];
  /** @gqlField */
  pageInfo: PageInfo;
};

/** @gqlQueryField */
export function items(args: {
  first?: Int | null;
  after?: string | null;
}): ItemConnection {
  const first = args.first ?? ALL_ITEMS.length;
  const afterIndex = args.after != null ? parseInt(args.after, 10) : -1;
  const startIndex = afterIndex + 1;
  const endIndex = Math.min(startIndex + first, ALL_ITEMS.length);
  const edges: ItemEdge[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    edges.push({
      node: { id: `item-${i}` as ID, name: ALL_ITEMS[i] },
      cursor: String(i),
    });
  }
  return {
    edges,
    pageInfo: {
      hasNextPage: endIndex < ALL_ITEMS.length,
      hasPreviousPage: startIndex > 0,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
  };
}
```

## App

```tsx title="App.tsx"
import { Suspense, useCallback } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  usePaginationFragment,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppPaginationQuery } from "./__generated__/AppPaginationQuery.graphql";
import { App_itemList$key } from "./__generated__/App_itemList.graphql";
import { AppPaginationRefetchQuery } from "./__generated__/AppPaginationRefetchQuery.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function ItemList({ queryRef }: { queryRef: App_itemList$key }) {
  const { data, loadNext, hasNext } = usePaginationFragment<
    AppPaginationRefetchQuery,
    App_itemList$key
  >(
    graphql`
      fragment App_itemList on Query
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
        cursor: { type: "String" }
      )
      @refetchable(queryName: "AppPaginationRefetchQuery") {
        items(first: $count, after: $cursor) @connection(key: "App_items") {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    queryRef,
  );

  const handleLoadMore = useCallback(() => {
    loadNext(2);
  }, [loadNext]);

  return (
    <div>
      <ul>
        {data.items?.edges?.map((edge, i) => (
          <li key={i}>{edge?.node?.name}</li>
        ))}
      </ul>
      {hasNext && <button onClick={handleLoadMore}>Load More</button>}
    </div>
  );
}

function ItemListContainer() {
  const data = useLazyLoadQuery<AppPaginationQuery>(
    graphql`
      query AppPaginationQuery {
        ...App_itemList
      }
    `,
    {},
  );
  return <ItemList queryRef={data} />;
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <ItemListContainer />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait button "Load More"
click button "Load More"
```
