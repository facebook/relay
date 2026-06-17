# Data-Driven Dependencies (@module)

Demonstrates the minimal setup for Relay's data-driven dependencies (3D).
A query field returns a union type, and each concrete type uses `@module` to
associate a fragment with a dynamically loaded React component. At runtime,
`MatchContainer` renders whichever component the server selected.

The compiler generates `componentModuleProvider` and `operationModuleProvider`
dynamic imports in the normalization AST, so the schema does not need
`JSDependency` or `js()` fields — the module references are resolved entirely
on the client.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

No special schema support is needed — just a union type with concrete members.

```ts title="server.ts"
/** @gqlUnion */
type NameRenderer = PlainTextRenderer | MarkdownRenderer;

/** @gqlType */
type PlainTextRenderer = {
  __typename: "PlainTextRenderer";
  /** @gqlField */
  plaintext: string;
};

/** @gqlType */
type MarkdownRenderer = {
  __typename: "MarkdownRenderer";
  /** @gqlField */
  markdown: string;
};

/** @gqlType */
type Viewer = {
  /** @gqlField */
  nameRenderer: NameRenderer;
};

/** @gqlQueryField */
export function viewer(): Viewer {
  return {
    nameRenderer: {
      __typename: "MarkdownRenderer",
      markdown: "**Hello, world!**",
    },
  };
}
```

## Markdown Renderer Component

Each `@module` branch gets its own file with a fragment and a React component.
The `@module(name: ...)` value becomes the `import()` path in the generated
normalization AST, resolved relative to `__generated__/`.

```tsx title="MarkdownRendererView.tsx"
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

export default function MarkdownRendererView(props: any) {
  const data = useFragment(
    graphql`
      fragment MarkdownRendererView_name on MarkdownRenderer {
        markdown
      }
    `,
    props.name,
  );
  return <div>Markdown: {data.markdown}</div>;
}
```

## Plain Text Renderer Component

```tsx title="PlainTextRendererView.tsx"
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

export default function PlainTextRendererView(props: any) {
  const data = useFragment(
    graphql`
      fragment PlainTextRendererView_name on PlainTextRenderer {
        plaintext
      }
    `,
    props.name,
  );
  return <div>Plain: {data.plaintext}</div>;
}
```

## App

The `@module(name: ...)` value is set to a relative path that resolves from
the source file to the component. The compiler embeds this as an `import()`
call in the normalization AST (resolved relative to `__generated__/`).

No boilerplate is needed:
- The `Environment` provides a default `OperationLoader` that handles the
  compiler's `() => import(...)` references.
- `MatchContainer` uses the environment's `OperationLoader` to resolve
  components via Suspense when no explicit `loader` prop is provided.

```tsx title="App.tsx"
import React, { Suspense } from "react";
import {
  MatchContainer,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";

const testEnvironment = new Environment({ network: gratsNetwork });

function App() {
  const data = useLazyLoadQuery<any>(
    graphql`
      query AppQuery {
        viewer {
          nameRenderer {
            ...MarkdownRendererView_name
              @module(name: "./MarkdownRendererView")
            ...PlainTextRendererView_name
              @module(name: "./PlainTextRendererView")
          }
        }
      }
    `,
    {},
  );

  return <MatchContainer match={data.viewer?.nameRenderer} />;
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
wait "Markdown:"
```
