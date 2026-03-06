# Defer

Demonstrates `@defer` on a fragment spread. The query fetches basic user info
eagerly and defers detailed profile fields into a separate fragment. A
`<Suspense>` boundary wraps the deferred content so it can show a fallback while
the deferred fragment loads.

Because the Relay compiler strips `@defer` from the query text and handles it
through the normalization AST, the fixture uses a custom network that simulates
incremental delivery: it sends the initial payload first, then delivers the
deferred fragment data in a follow-up payload on the next tick. The `bio`
resolver is async to simulate a slow field.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

Declares a custom `@defer` directive for the Grats schema. Uses a class for
`UserProfile` because `bio` is an async resolver.

```ts title="server.ts"
import type { ID } from "grats";

/** @gqlDirective on FRAGMENT_SPREAD | INLINE_FRAGMENT */
function defer(args: { label?: string | null; if?: boolean | null }) {}

/** @gqlType */
class UserProfile {
  /** @gqlField */
  id(): ID {
    return "user-1";
  }

  /** @gqlField */
  name(): string {
    return "Alice";
  }

  /** @gqlField */
  async bio(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return "Software engineer who loves GraphQL";
  }
}

/** @gqlQueryField */
export function viewer(): UserProfile {
  return new UserProfile();
}
```

## App

Uses a custom network instead of `gratsNetwork` to simulate incremental
delivery for `@defer`.

```tsx title="App.tsx"
import { Suspense } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useFragment,
} from "react-relay";
import { graphql, Network, Observable, Environment, GraphQLResponse } from "relay-runtime";
import { execute, parse } from "graphql";
import { getSchema } from "../schema";
import { AppDeferQuery } from "./__generated__/AppDeferQuery.graphql";
import { AppDefer_details$key } from "./__generated__/AppDefer_details.graphql";

// Custom network that simulates incremental delivery for @defer.
// Relay strips @defer from the query text and handles it via the
// normalization AST, so we split the response manually: emit the
// initial payload without the deferred fragment, then deliver the
// deferred data in a follow-up payload after the bio resolves. The
// label must use Relay's internal "<Query>$defer$<label>" format.
const schema = getSchema();

const deferNetwork = Network.create((request, variables) => {
  return Observable.create<GraphQLResponse>((sink) => {
    Promise.resolve(
      execute({
        schema,
        document: parse(request.text!),
        variableValues: variables,
      }),
    ).then((fullResult) => {
      const data = (fullResult as { data: Record<string, unknown> }).data;
      const viewer = data.viewer as Record<string, unknown>;

      // Initial payload: non-deferred fields only
      const { bio: _, ...viewerWithoutBio } = viewer;
      sink.next({
        data: { viewer: viewerWithoutBio },
      } as GraphQLResponse);

      // Deferred payload on next tick
      setTimeout(() => {
        sink.next({
          data: { id: viewer.id, __typename: viewer.__typename, bio: viewer.bio },
          label: "AppDeferQuery$defer$AppDefer_details",
          path: ["viewer"],
        } as GraphQLResponse);
        sink.complete();
      }, 0);
    });
  });
});

const testEnvironment = new Environment({
  network: deferNetwork,
});

function UserDetails({ userRef }: { userRef: AppDefer_details$key }) {
  const data = useFragment(
    graphql`
      fragment AppDefer_details on UserProfile {
        bio
      }
    `,
    userRef,
  );
  return <p>{data.bio}</p>;
}

function Profile() {
  const data = useLazyLoadQuery<AppDeferQuery>(
    graphql`
      query AppDeferQuery {
        viewer {
          name
          ...AppDefer_details @defer(label: "AppDefer_details")
        }
      }
    `,
    {},
  );

  return (
    <div>
      <h1>{data.viewer?.name}</h1>
      <Suspense fallback={<div>Loading details...</div>}>
        {data.viewer && <UserDetails userRef={data.viewer} />}
      </Suspense>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Profile />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait heading "Alice"
wait "Software engineer who loves GraphQL"
```
