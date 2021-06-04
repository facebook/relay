---
id: classic-api-reference-relay-ql
title: Relay.QL
original_id: classic-api-reference-relay-ql
---
Relay fragments, mutations, and queries must be specified using ES6 template literals tagged with `Relay.QL`. For example:

```

var fragment = Relay.QL`
  fragment on User {
    name
  }
`;
```

To execute this code, Relay needs access to the schema - which can be too large to bundle inside the application. Instead, these `Relay.QL` template expressions are transpiled into JavaScript descriptions via the `babel-plugin-relay`. This schema information allows Relay to understand things like the types of field arguments, which fields are connections or lists, and how to efficiently refetch records from the server.

## Related APIs

`Relay.QL` objects are used by the following APIs:

<ul className="apiIndex">
  <li>
    <pre>() =&gt; Relay.QL`fragment on ...`</pre>
    Specify the data dependencies of a `Relay.Container` as GraphQL fragments.
  </li>
  <li>
    <pre>(Component) =&gt; Relay.QL`query ...`</pre>
    Specify the queries of a `Relay.Route`.
  </li>
  <li>
    <pre>Relay.QL`mutation {"{"} fieldName {"}"}`</pre>
    Specify the mutation field in a `Relay.Mutation`.
  </li>
  <li>
    <pre>var fragment = Relay.QL`fragment on ...`;</pre>
    Reusable fragments to compose within the above use cases.
  </li>
</ul>

## Fragment Composition

Fragments can be composed in one of two ways:

-   Composing child component fragments in a parent fragment.
-   Composing fragments defined as local variables.

### Container.getFragment()

Composing the fragments of child components is discussed in detail in the [Containers Guide](./classic-guides-containers), but here's a quick example:

```{"{"}5{"}"}

Relay.createContainer(Foo, {
  fragments: {
    bar: () => Relay.QL`
      fragment on Bar {
        ${ChildComponent.getFragment('childFragmentName')},
      }
    `,
  }
});
```

### Inline Fragments

Fragments may also compose other fragments that are assigned to local variables:

```{"{"}3-7,14,21{"}"}

// An inline fragment - useful in small quantities, but best not to share
// between modules.
var userFragment = Relay.QL`
  fragment on User {
    name,
  }
`;
Relay.createContainer(Story, {
  fragments: {
    bar: () => Relay.QL`
      fragment on Story {
        author {
          # Fetch the same information about the story's author ...
          ${userFragment},
        },
        comments {
          edges {
            node {
              author {
                # ... and the authors of the comments.
                ${userFragment},
              },
            },
          },
        },
      }
    `,
  }
});
```

Note that it is _highly_ recommended that `Relay.Container`s define their own fragments and avoid sharing inline `var fragment = Relay.QL...` values between containers or files. If you find yourself wanting to share inline fragments, it's likely a sign that it's time to refactor and introduce a new container.

### Conditional fields

You can conditionally include or skip a field based on the value of a boolean variable.

```{"{"}4,9{"}"}

Relay.createContainer(Story, {
  initialVariables: {
    numCommentsToShow: 10,
    showComments: false,
  },
  fragments: {
    story: (variables) => Relay.QL`
      fragment on Story {
        comments(first: $numCommentsToShow) @include(if: $showComments) {
          edges {
            node {
              author { name },
              id,
              text,
            },
          },
        },
      }
    `,
  }
});
```

Wherever the inverse grammar serves you better, you can use `@skip(if: ...)` instead of `@include(if: ...)`.

### Array fields

In order to resolve a fragment into an array of objects you have to use the `@relay(plural: true)` directive.

This will inform `Relay.QL` that this particular field is an array. This will also allow you to use a plural name for the fragment (i.e. `bars` instead of `bar`).

```{"{"}4,9{"}"}

Relay.createContainer(Story, {
  fragments: {
    bars: () => Relay.QL`
      fragment on Bar @relay(plural: true) {
        id
        name
      }
    `,
  }
});
```

On the Relay Container the prop `bars` will be an array instead of an object.
