# Deferred Fragment Suspends Its Own Boundary

While a `@defer`red patch is outstanding, the fragment's own `Suspense`
boundary shows its fallback while the rest of the component has rendered.

The resolver blocks until a click, so the pending state is not a race — a bare
`async` resolver settles a microtask later and only the resolved state would be
observable.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

`releaseBio` is a plain export, not a mutation: server and client share a module
realm, so the client can drive server timing without a second round trip.

```ts title="server.ts"
let release: () => void;

const bioReady = new Promise<void>((resolve) => {
  release = resolve;
});

/** Lets the deferred `bio` resolver finish. Not part of the schema. */
export function releaseBio(): void {
  release();
}

/** @gqlType */
class User {
  /** @gqlField */
  name: string = "Jordan";

  /** @gqlField */
  async bio(): Promise<string> {
    await bioReady;
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
import { releaseBio } from "./server";
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
      <button onClick={() => releaseBio()}>Reveal bio</button>
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
wait "Loading bio..."
click button "Reveal bio"
wait "Bio: Relay maintainer"
```
