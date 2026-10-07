# Mixed Interface - Server Type and Strong Resolver Type Share a Client Interface

The client interface `IAdAccount` is implemented by the server type `AdAccount`
(via `extend type`) and by the strong Relay Resolver type `ClientAdAccount`. The
interface declares `id: ID @semanticNonNull` so that both can implement it:
`AdAccount.id` is `ID @semanticNonNull`, while Relay generates
`ClientAdAccount.id: ID!`.

The fragment on `IAdAccount` never selects `id`. Relay injects `id` when it
normalizes the abstract selection, and that injected field is compared across
the concrete implementors, `ID!` against `ID`.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "schemaExtensions": ["./schema-extensions"],
  "language": "typescript",
  "featureFlags": {
    "relay_resolver_enable_interface_output_type": { "kind": "enabled" },
    "relay_resolver_model_semantic_non_null_id": {
      "kind": "limited",
      "allowlist": ["ClientAdAccount"]
    }
  }
}
```

## Server

```ts title="server.ts"
import { ID, Int } from "grats";

/** @gqlDirective on FIELD_DEFINITION */
function semanticNonNull(_args: { levels?: Array<Int | null> | null }) {}

/** @gqlType */
type AdAccount = {
  /**
   * @gqlField
   * @gqlAnnotate semanticNonNull
   */
  id: ID | null;
  /** @gqlField */
  currency: string;
};

/** @gqlQueryField */
export function ad_account(): AdAccount {
  return { id: "act_1", currency: "USD" };
}
```

## Schema Extension

```graphql title="schema-extensions/extension.graphql"
interface IAdAccount {
  id: ID @semanticNonNull
  currency: String
}

extend type AdAccount implements IAdAccount
```

## Client Ad Account Resolvers

```ts title="ClientAdAccountResolvers.ts"
/**
 * @relayType ClientAdAccount implements IAdAccount
 */
export function ClientAdAccount(id: string): { id: string } {
  return { id };
}

/**
 * @relayField ClientAdAccount.currency: String
 */
export function currency(_model: { id: string }): string {
  return "EUR";
}
```

## App

```tsx title="App.tsx"
import { Suspense } from "react";
import {
  RelayEnvironmentProvider,
  useFragment,
  useLazyLoadQuery,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { App_adAccount$key } from "./__generated__/App_adAccount.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Currency({ adAccount }: { adAccount: App_adAccount$key }) {
  const data = useFragment(
    graphql`
      fragment App_adAccount on IAdAccount {
        currency
      }
    `,
    adAccount,
  );
  return <div>currency: {data.currency}</div>;
}

function App() {
  // The spread on the abstract `IAdAccount` is where Relay injects `id`.
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        ad_account {
          ...App_adAccount
        }
      }
    `,
    {},
  );
  if (data.ad_account == null) {
    return null;
  }
  return <Currency adAccount={data.ad_account} />;
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
wait "currency: USD"
```
