# Deferred Fragment Spread

A `@defer`red fragment spread arrives in a second payload and renders once that
patch is normalized.

Guards against a quiet failure: if `@defer` stops reaching the server, `bio`
comes back inline but the artifact still expects a patch, so it renders empty
rather than erroring.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

`bio` is async, so it is not ready when the initial payload is sent. The harness
declares `@defer` on the schema.

```ts title="server.ts"
/** @gqlType */
class User {
  /** @gqlField */
  name: string = "Jordan";

  /** @gqlField */
  async bio(): Promise<string> {
    return "Relay maintainer";
  }
}

/** @gqlQueryField */
export function user(): User {
  return new User();
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useFragment,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppBioFragment$key } from "./__generated__/AppBioFragment.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Bio({ user }: { user: AppBioFragment$key }) {
  const data = useFragment(
    graphql`
      fragment AppBioFragment on User {
        bio
      }
    `,
    user,
  );
  return <div>Bio: {data.bio}</div>;
}

function App() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        user {
          name
          ...AppBioFragment @defer
        }
      }
    `,
    {},
  );
  const user = data.user;
  if (user == null) {
    return <div>No user</div>;
  }
  return (
    <div>
      <div>Name: {user.name}</div>
      <Suspense fallback={<div>Loading bio...</div>}>
        <Bio user={user} />
      </Suspense>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Name: Jordan"
wait "Bio: Relay maintainer"
```
