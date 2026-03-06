# Stream

Demonstrates `@stream` on a plural field. The resolver is an async generator
that yields items one at a time, and the query uses
`@stream(initialCount: 1)` so Relay receives the first item immediately and
the rest arrive incrementally.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

Declares a custom `@stream` directive for the Grats schema. The resolver is
an async generator that yields items one at a time.

```ts title="server.ts"
import type { ID, Int } from "grats";

/** @gqlDirective on FIELD */
function stream(args: { label?: string | null; initialCount?: Int | null; if?: boolean | null }) {}

const ALL_ITEMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];

/** @gqlType */
type StreamItem = {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
};

/** @gqlQueryField */
export async function* streamItems(): AsyncIterable<StreamItem> {
  for (let i = 0; i < ALL_ITEMS.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    yield { id: `item-${i}` as ID, name: ALL_ITEMS[i] };
  }
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppStreamQuery } from "./__generated__/AppStreamQuery.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function ItemList() {
  const data = useLazyLoadQuery<AppStreamQuery>(
    graphql`
      query AppStreamQuery {
        streamItems @stream(initialCount: 1, label: "AppStream_items") {
          id
          name
        }
      }
    `,
    {},
  );

  return (
    <ul>
      {data.streamItems?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <ItemList />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Echo"
```
