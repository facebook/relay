# Mixed Interface Waterfall - Nested Abstract Field

When a `@waterfall` field resolves to a server type that has a nested field
returning another mixed interface, only the server implementor's fields should
appear in that nested type's normalization. Validates `relay_resolvers_abstract_types.rs`:
before the fix, `... on Cat { name @resolver }` leaked into the `DogPerson.pet: Dog`
subtree, because incompatible inline fragments were not filtered at each fan-out level.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "schemaExtensions": ["./schema-extensions"],
  "language": "typescript",
  "featureFlags": {
    "relay_resolver_enable_interface_output_type": { "kind": "enabled" }
  }
}
```

## Server

```ts title="server.ts"
import { ID } from "grats";

const STORE = new Map<string, DogPerson>();

/** @gqlInterface Node */
interface GqlNode {
  /** @gqlField */
  id: ID;
}

/** @gqlQueryField */
export function node({ id }: { id: ID }): GqlNode | null {
  return STORE.get(id) ?? null;
}

/** @gqlQueryField */
export function _unused(): boolean {
  return false;
}

/** @gqlInterface */
interface IAnimal extends GqlNode {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
}

/** @gqlInterface */
interface IPerson extends GqlNode {
  /** @gqlField */
  id: ID;
  /** @gqlField */
  pet: IAnimal | null;
}

/** @gqlType */
class Dog implements IAnimal, GqlNode {
  __typename = "Dog" as const;
  /** @gqlField */
  id: ID;
  /** @gqlField */
  name: string;
  constructor(id: ID, name: string) {
    this.id = id;
    this.name = name;
  }
}

/** @gqlType */
class DogPerson implements IPerson, GqlNode {
  __typename = "DogPerson" as const;
  /** @gqlField */
  id: ID;
  #dog: Dog;
  constructor(id: ID, dog: Dog) {
    this.id = id;
    this.#dog = dog;
    STORE.set(id, this);
  }
  /** @gqlField */
  pet(): Dog {
    return this.#dog;
  }
}

const _person = new DogPerson("person-1", new Dog("dog-1", "Rex"));
```

## Schema Extension

```graphql title="schema-extensions/extension.graphql"
# Cat.name returns "Whiskers" — must never appear in the DogPerson branch.
type Cat implements Node & IAnimal {
  id: ID!
  name: String
}

type CatPerson implements Node & IPerson {
  id: ID!
  pet: IAnimal
}

extend type Query {
  person: IPerson
    @relay_resolver(
      fragment_name: "PersonResolverFragment"
      import_path: "./PersonResolver"
    )
}
```

## Person Resolver

```ts title="PersonResolver.ts"
import { graphql } from "relay-runtime";

export const PersonResolverFragment = graphql`
  fragment PersonResolverFragment on Query {
    _unused
  }
`;

export default function PersonResolver(): {
  __typename: "DogPerson";
  id: string;
} {
  return { __typename: "DogPerson", id: "person-1" };
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function App() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        person @waterfall {
          pet {
            name
          }
        }
      }
    `,
    {},
  );
  return <div>pet name: {data.person?.pet?.name ?? "no name"}</div>;
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
wait "pet name: Rex"
```
