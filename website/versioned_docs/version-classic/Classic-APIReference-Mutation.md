---
id: classic-api-reference-relay-mutation
title: Relay.Mutation
original_id: classic-api-reference-relay-mutation
---
Relay makes use of GraphQL mutations; operations that enable us to mutate data on the client and server. To create a mutation for use in our app, we subclass `Relay.Mutation` and implement, at minimum, the four abstract methods listed below.

## Overview

_Properties_

<ul className="apiIndex">
  <li>
    <a href="#fragments-static-property">
      <pre>static fragments</pre>
      Declare this mutation's data dependencies here
    </a>
  </li>
  <li>
    <a href="#initialvariables-static-property">
      <pre>static initialVariables</pre>
      A default set of variables to make available to this mutation's fragment builders
    </a>
  </li>
  <li>
    <a href="#preparevariables-static-property">
      <pre>static prepareVariables</pre>
      A method to modify the variables based on the runtime environment, previous variables, or the meta route
    </a>
  </li>
</ul>

_Methods_

<ul className="apiIndex">
  <li>
    <a href="#constructor">
      <pre>constructor(props)</pre>
    </a>
  </li>
  <li>
    <a href="#getconfigs-abstract-method">
      <pre>abstract getConfigs()</pre>
    </a>
  </li>
  <li>
    <a href="#getfatquery-abstract-method">
      <pre>abstract getFatQuery()</pre>
    </a>
  </li>
  <li>
    <a href="#getmutation-abstract-method">
      <pre>abstract getMutation()</pre>
    </a>
  </li>
  <li>
    <a href="#getvariables-abstract-method">
      <pre>abstract getVariables()</pre>
    </a>
  </li>
  <li>
    <a href="#getfragment-static-method">
      <pre>static getFragment(fragmentName[, variableMapping])</pre>
    </a>
  </li>
  <li>
    <a href="#getcollisionkey">
      <pre>getCollisionKey()</pre>
    </a>
  </li>
  <li>
    <a href="#getfiles">
      <pre>getFiles()</pre>
    </a>
  </li>
  <li>
    <a href="#getoptimisticconfigs">
      <pre>getOptimisticConfigs()</pre>
    </a>
  </li>
  <li>
    <a href="#getoptimisticresponse">
      <pre>getOptimisticResponse()</pre>
    </a>
  </li>
</ul>

## Properties

### fragments (static property)

```

static fragments: RelayMutationFragments<$Keys<Tp>>

// Type of RelayMutationFragments
type RelayMutationFragments<Tk> = {
  [key: Tk]: FragmentBuilder;
};

// Type of FragmentBuilder
type FragmentBuilder = (variables: Variables) => RelayConcreteNode;
```

We declare our mutations' data dependencies here, just as we would with a container. This is particularly useful to ensure that a set of fields we might want to use in this mutation's optimistic response have been fetched.

#### Example

```{"{"}2-9{"}"}

class LikeStoryMutation extends Relay.Mutation {
  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        likers { count },
        viewerDoesLike,
      }
    `,
  };
  getOptimisticResponse() {
    // this.props.story.likers.count and this.props.story.viewerDoesLike
    // are guaranteed to have been fetched since we've declared
    // them to be part of this mutation's data dependencies above.
    return { /* ... */ };
  }
}
```

See also:
[Mutations &gt; Fragment variables](./classic-guides-mutations#fragment-variables) and
[Mutations &gt; Optimistic updates](./classic-guides-mutations#optimistic-updates)

### initialVariables (static property)

```

static initialVariables: {[name: string]: mixed};
```

The defaults we specify here will become available to our fragment builders:

#### Example

```

class ChangeTodoStatusMutation extends Relay.Mutation {
  static initialVariables = {orderby: 'priority'};
  static fragments = {
    todos: () => Relay.QL`
      # The variable defined above is available here as $orderby
      fragment on User { todos(orderby: $orderby) { ... } }
    `,
  };
  /* ... */
}
```

See also:
[Mutations &gt; Fragment variables](./classic-guides-mutations#fragment-variables)

### prepareVariables (static property)

```

static prepareVariables: ?(
  prevVariables: {[name: string]: mixed},
  route: RelayMetaRoute,
) => {[name: string]: mixed}

// Type of `route` argument
type RelayMetaRoute = {
  name: string;
}
```

If we provide to a mutation a method that conforms to the signature described above, it will be given the opportunity to modify the fragment builders' variables, based on the previous variables (or the `initialVariables` if no previous ones exist), the meta route, and the runtime environment. Whatever variables this method returns will become available to this mutation's fragment builders.

#### Example

```

class BuySongMutation extends Relay.Mutation {
  static initialVariables = {format: 'mp3'};
  static prepareVariables = (prevVariables) => {
    var overrideVariables = {};
    var formatPreference = localStorage.getItem('formatPreference');
    if (formatPreference) {
      overrideVariables.format = formatPreference;  // Lossless, hopefully
    }
    return {...prevVariables, overrideVariables};
  };
  /* ... */
}
```

See also:
[Mutations &gt; Fragment variables](./classic-guides-mutations#fragment-variables)

## Methods

### constructor

Create a mutation instance using the `new` keyword, optionally passing it some props. Note that `this.props` is _not_ available inside the constructor function, but are set for all the methods mentioned below (`getCollisionKey`, `getOptimisticResponse`, etc). This restriction is due to the fact that mutation props may depend on data from the RelayEnvironment, which isn't known until the mutation is applied with `applyUpdate` or `commitUpdate`.

#### Example

```

var bookFlightMutation = new BuyPlaneTicketMutation({airport: 'yvr'});
Relay.Store.commitUpdate(bookFlightMutation);
```

### getConfigs (abstract method)

```

abstract getConfigs(): Array<{[key: string]: mixed}>

```

Implement this required method to give Relay instructions on how to use the response payload from each mutation to update the client-side store.

#### Example

```

class LikeStoryMutation extends Relay.Mutation {
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        story: this.props.story.id,
      },
    }];
  }
}
```

See also: [Mutations &gt; Mutator configuration](./classic-guides-mutations#mutator-configuration)

### getFatQuery (abstract method)

```

abstract getFatQuery(): GraphQL.Fragment

```

Implement this required method to design a ‘fat query’ – one that represents every field in your data model that could change as a result of this mutation.

#### Example

```

class BuySongMutation extends Relay.Mutation {
  getFatQuery() {
    return Relay.QL`
      fragment on BuySongPayload {
        songs {
          count,
          edges,
        },
        totalRunTime,
      }
    `,
  }
}
```

See also:
[Mutations &gt; The fat query](./classic-guides-mutations#the-fat-query)

### getMutation (abstract method)

```

abstract getMutation(): GraphQL.Mutation

```

Implement this required method to return a GraphQL mutation operation that represents the mutation to be performed.

#### Example

```

class LikeStoryMutation extends Relay.Mutation {
  getMutation() {
    return this.props.story.viewerDoesLike
      ? return Relay.QL`mutation {unlikeStory}`
      : return Relay.QL`mutation {likeStory}`;
  }
}
```

### getVariables (abstract method)

```

abstract getVariables(): {[name: string]: mixed}
```

Implement this required method to prepare variables to be used as input to the mutation.

#### Example

```

class DestroyShipMutation extends Relay.Mutation {
  getVariables() {
    return {
      // Assume that the server exposes a `destroyShip` mutation
      // that accepts a `shipIDToDestroy` variable as input:
      shipIDToDestroy: this.props.ship.id,
    };
  }
}
```

<blockquote>
Warning

The term 'variables' here refers to the input to the server-side mutation, <strong>not</strong> to the variables made available to this mutation's fragment builders.

</blockquote>

### getFragment (static method)

```

static getFragment(
  fragmentName: $Keys<Tp>,
  variableMapping?: Variables
): RelayFragmentReference

// Type of the variableMapping argument
type Variables = {[name: string]: mixed};
```

Gets a fragment reference for use in a parent's query fragment.

#### Example

```{"{"}8{"}"}

class StoryComponent extends React.Component {
  /* ... */
  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        id,
        text,
        ${LikeStoryMutation.getFragment('story')},
      }
    `,
  };
}
```

You can also pass variables to the mutation's fragment builder from the outer fragment that contains it.

```{"{"}8-11{"}"}

class Movie extends React.Component {
  /* ... */
  static fragments = {
    movie: (variables) => Relay.QL`
      fragment on Movie {
        posterImage(lang: $lang) { url },
        trailerVideo(format: $format, lang: $lang) { url },
        ${RentMovieMutation.getFragment('movie', {
          format: variables.format,
          lang: variables.lang,
        })},
      }
    `,
  };
}
```

<blockquote>
Hint

In that last example, think of <code>$format</code> and <code>variables.format</code> as the same value.

</blockquote>

### getCollisionKey

```

getCollisionKey(): ?string

```

Implement this method to return a collision key. Relay will send any mutations having the same collision key to the server serially and in-order.

#### Example

```

class LikeStoryMutation extends Relay.Mutation {
  getCollisionKey() {
    // Give the same key to like mutations that affect the same story
    return `like_${this.props.story.id}`;
  }
}
```

### getFiles

```

getFiles(): ?FileMap

// Type of the FileMap object
type FileMap = {[key: string]: File};
```

Implement this method to return a map of `File` objects to upload as part of a mutation.

#### Example

```

class AttachDocumentMutation extends Relay.Mutation {
  getFiles() {
    return {
      file: this.props.file,
    };
  }
}
class FileUploader extends React.Component {
  handleSubmit() {
    var fileToAttach = this.refs.fileInput.files.item(0);
    Relay.Store.commitUpdate(
      new AttachDocumentMutation({file: fileToAttach})
    );
  }
}
```

### getOptimisticConfigs

```

getOptimisticConfigs(): Array<{[key: string]: mixed}>

```

Implement this method in cases where the mutator configuration needed to handle the optimistic response needs to be different than the one that handles the server response.

See also: [Relay.Mutation::getConfigs()](#getconfigs-abstract-method)

### getOptimisticResponse

```

getOptimisticResponse(): ?{[key: string]: mixed}
```

Implement this method to craft an optimistic response having the same shape as the server response payload. This optimistic response will be used to preemptively update the client cache before the server returns, giving the impression that the mutation completed instantaneously.

#### Example

```

class LikeStoryMutation extends Relay.Mutation {
  getOptimisticResponse() {
    return {
      story: {
        id: this.props.story.id,
        likers: {
          count: this.props.story.likers.count + 1,
        },
        viewerDoesLike: !this.props.story.viewerDoesLike,
      },
    };
  }
}
```

See also: [Mutations &gt; Optimistic updates](./classic-guides-mutations#optimistic-updates)
