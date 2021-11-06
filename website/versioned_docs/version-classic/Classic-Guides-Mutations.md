---
id: classic-guides-mutations
title: Mutations
original_id: classic-guides-mutations
---
Up until this point we have only interacted with the GraphQL endpoint to perform queries that fetch data. In this guide, you will learn how to use Relay to perform mutations – operations that consist of writes to the data store followed by a fetch of any changed fields.

## A complete example

Before taking a deep dive into the mutations API, let's look at a complete example. Here, we subclass `Relay.Mutation` to create a custom mutation that we can use to like a story.

```

class LikeStoryMutation extends Relay.Mutation {
  // This method should return a GraphQL operation that represents
  // the mutation to be performed. This presumes that the server
  // implements a mutation type named ‘likeStory’.
  getMutation() {
    return Relay.QL`mutation {likeStory}`;
  }
  // Use this method to prepare the variables that will be used as
  // input to the mutation. Our ‘likeStory’ mutation takes exactly
  // one variable as input – the ID of the story to like.
  getVariables() {
    return {storyID: this.props.story.id};
  }
  // Use this method to design a ‘fat query’ – one that represents every
  // field in your data model that could change as a result of this mutation.
  // Liking a story could affect the likers count, the sentence that
  // summarizes who has liked a story, and the fact that the viewer likes the
  // story or not. Relay will intersect this query with a ‘tracked query’
  // that represents the data that your application actually uses, and
  // instruct the server to include only those fields in its response.
  getFatQuery() {
    return Relay.QL`
      fragment on LikeStoryPayload {
        story {
          likers {
            count,
          },
          likeSentence,
          viewerDoesLike,
        },
      }
    `;
  }
  // These configurations advise Relay on how to handle the LikeStoryPayload
  // returned by the server. Here, we tell Relay to use the payload to
  // change the fields of a record it already has in the store. The
  // key-value pairs of ‘fieldIDs’ associate field names in the payload
  // with the ID of the record that we want updated.
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        story: this.props.story.id,
      },
    }];
  }
  // This mutation has a hard dependency on the story's ID. We specify this
  // dependency declaratively here as a GraphQL query fragment. Relay will
  // use this fragment to ensure that the story's ID is available wherever
  // this mutation is used.
  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        id,
      }
    `,
  };
}
```

Here's an example of this mutation in use by a `LikeButton` component:

```

class LikeButton extends React.Component {
  _handleLike = () => {
    // To perform a mutation, pass an instance of one to
    // `this.props.relay.commitUpdate`
    this.props.relay.commitUpdate(
      new LikeStoryMutation({story: this.props.story})
    );
  }
  render() {
    return (
      <div>
        {this.props.story.viewerDoesLike
          ? 'You like this'
          : <button onClick={this._handleLike}>Like this</button>
        }
      </div>
    );
  }
}

module.exports = Relay.createContainer(LikeButton, {
  fragments: {
    // You can compose a mutation's query fragments like you would those
    // of any other RelayContainer. This ensures that the data depended
    // upon by the mutation will be fetched and ready for use.
    story: () => Relay.QL`
      fragment on Story {
        viewerDoesLike,
        ${LikeStoryMutation.getFragment('story')},
      }
    `,
  },
});
```

In this particular example, the only field that the `LikeButton` cares about is `viewerDoesLike`. That field will form part of the tracked query that Relay will intersect with the fat query of `LikeStoryMutation` to determine what fields to request as part of the server's response payload for the mutation. Another component elsewhere in the application might be interested in the likers count, or the like sentence. Since those fields will automatically be added to Relay's tracked query, the `LikeButton` need not worry about requesting them explicitly.

## Mutation props

Any props that we pass to the constructor of a mutation will become available to its instance methods as `this.props`. Like in components used within Relay containers, props for which a corresponding fragment has been defined will be populated by Relay with query data:

```

class LikeStoryMutation extends Relay.Mutation {
  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        id,
        viewerDoesLike,
      }
    `,
  };
  getMutation() {
    // Here, viewerDoesLike is guaranteed to be available.
    // We can use it to make this mutation polymorphic.
    return this.props.story.viewerDoesLike
      ? Relay.QL`mutation {unlikeStory}`
      : Relay.QL`mutation {likeStory}`;
  }
  /* ... */
}
```

## Fragment variables

Like it can be done with [Relay containers](./classic-guides-containers), we can prepare variables for use by our mutation's fragment builders, based on the previous variables and the runtime environment.

```

class RentMovieMutation extends Relay.Mutation {
  static initialVariables = {
    format: 'hd',
    lang: 'en-CA',
  };
  static prepareVariables = (prevVariables) => {
    var overrideVariables = {};
    if (navigator.language) {
      overrideVariables.lang = navigator.language;
    }
    var formatPreference = localStorage.getItem('formatPreference');
    if (formatPreference) {
      overrideVariables.format = formatPreference;
    }
    return {...prevVariables, ...overrideVariables};
  };
  static fragments = {
    // Now we can use the variables we've prepared to fetch movies
    // appropriate for the viewer's locale and preferences
    movie: () => Relay.QL`
      fragment on Movie {
        posterImage(lang: $lang) { url },
        trailerVideo(format: $format, lang: $lang) { url },
      }
    `,
  };
}
```

## The fat query

Changing one thing in a system can have a ripple effect that causes other things to change in turn. Imagine a mutation that we can use to accept a friend request. This can have wide implications:

-   both people's friend count will increment
-   an edge representing the new friend will be added to the viewer's `friends` connection
-   an edge representing the viewer will be added to the new friend's `friends` connection
-   the viewer's friendship status with the requester will change

Design a fat query that covers every possible field that could change:

```

class AcceptFriendRequestMutation extends Relay.Mutation {
  getFatQuery() {
    // This presumes that the server-side implementation of this mutation
    // returns a payload of type `AcceptFriendRequestPayload` that exposes
    // `friendEdge`, `friendRequester`, and `viewer` fields.
    return Relay.QL`
      fragment on AcceptFriendRequestPayload {
        friendEdge,
        friendRequester {
          friends,
          friendshipStatusWithViewer,
        },
        viewer {
          friends,
        },
      }
    `;
  }
}
```

This fat query looks like any other GraphQL query, with one important distinction. We know some of these fields to be non-scalar (like `friendEdge` and `friends`) but notice that we have not named any of their children by way of a subquery. In this way, we indicate to Relay that _anything_ under those non-scalar fields may change as a result of this mutation.

<blockquote>
Note

When designing a fat query, consider <em>all</em> of the data that might change as a result of the mutation – not just the data currently in use by your application. We don't need to worry about overfetching; this query is never executed without first intersecting it with a ‘tracked query’ of the data our application actually needs. If we omit fields in the fat query, we might observe data inconsistencies in the future when we add views with new data dependencies, or add new data dependencies to existing views.

</blockquote>

## Mutator configuration

We need to give Relay instructions on how to use the response payload from each mutation to update the client-side store. We do this by configuring the mutation with one or more of the following mutation types:

### `FIELDS_CHANGE`

Any field in the payload that can be correlated by DataID with one or more records in the client-side store will be merged with the record(s) in the store.

#### Arguments

-   `fieldIDs: {[fieldName: string]: DataID | Array<DataID>}`

    A map between a `fieldName` in the response and one or more DataIDs in the store.

#### Example

```

class RenameDocumentMutation extends Relay.Mutation {
  // This mutation declares a dependency on a document's ID
  static fragments = {
    document: () => Relay.QL`fragment on Document { id }`,
  };
  // We know that only the document's name can change as a result
  // of this mutation, and specify it here in the fat query.
  getFatQuery() {
    return Relay.QL`
      fragment on RenameDocumentMutationPayload { updatedDocument { name } }
    `;
  }
  getVariables() {
    return {id: this.props.document.id, newName: this.props.newName};
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      // Correlate the `updatedDocument` field in the response
      // with the DataID of the record we would like updated.
      fieldIDs: {updatedDocument: this.props.document.id},
    }];
  }
  /* ... */
}
```

### `NODE_DELETE`

Given a parent, a connection, and one or more DataIDs in the response payload, Relay will remove the node(s) from the connection and delete the associated record(s) from the store.

#### Arguments

-   `parentName: string`

    The field name in the response that represents the parent of the connection

-   `parentID?: string`

    The DataID of the parent node that contains the connection. This argument is optional.

-   `connectionName: string`

    The field name in the response that represents the connection

-   `deletedIDFieldName: string`

    The field name in the response that contains the DataID of the deleted node

#### Example

```

class DestroyShipMutation extends Relay.Mutation {
  // This mutation declares a dependency on an enemy ship's ID
  // and the ID of the faction that ship belongs to.
  static fragments = {
    ship: () => Relay.QL`fragment on Ship { id, faction { id } }`,
  };
  // Destroying a ship will remove it from a faction's fleet, so we
  // specify the faction's ships connection as part of the fat query.
  getFatQuery() {
    return Relay.QL`
      fragment on DestroyShipMutationPayload {
        destroyedShipID,
        faction { ships },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'faction',
      parentID: this.props.ship.faction.id,
      connectionName: 'ships',
      deletedIDFieldName: 'destroyedShipID',
    }];
  }
  /* ... */
}
```

### `RANGE_ADD`

Given a parent, a connection, and the name of the newly created edge in the response payload Relay will add the node to the store and attach it to the connection according to the range behavior specified.

#### Arguments

-   `parentName: string`

    The field name in the response that represents the parent of the connection

-   `parentID?: string`

    The DataID of the parent node that contains the connection. This argument is optional.

-   `connectionName: string`

    The field name in the response that represents the connection

-   `edgeName: string`

    The field name in the response that represents the newly created edge

-   `rangeBehaviors: {[call: string]: GraphQLMutatorConstants.RANGE_OPERATIONS} | (connectionArgs: {[argName: string]: string}) => $Keys<GraphQLMutatorConstants.RANGE_OPERATIONS>`

    A map between printed, dot-separated GraphQL calls _in alphabetical order_ and the behavior we want Relay to exhibit when adding the new edge to connections under the influence of those calls or a function accepting an array of connection arguments, returning that behavior.

For example, `rangeBehaviors` could be written this way:

```

const rangeBehaviors = {
  // When the ships connection is not under the influence
  // of any call, append the ship to the end of the connection
  '': 'append',
  // Prepend the ship, wherever the connection is sorted by age
  'orderby(newest)': 'prepend',
};
```

Or this way, with the same results:

```

const rangeBehaviors = ({orderby}) => {
  if (orderby === 'newest') {
    return 'prepend';
  } else {
    return 'append';
  }
};


```

Behaviors can be one of `'append'`, `'ignore'`, `'prepend'`, `'refetch'`, or `'remove'`.

#### Example

```

class IntroduceShipMutation extends Relay.Mutation {
  // This mutation declares a dependency on the faction
  // into which this ship is to be introduced.
  static fragments = {
    faction: () => Relay.QL`fragment on Faction { id }`,
  };
  // Introducing a ship will add it to a faction's fleet, so we
  // specify the faction's ships connection as part of the fat query.
  getFatQuery() {
    return Relay.QL`
      fragment on IntroduceShipPayload {
        faction { ships },
        newShipEdge,
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'faction',
      parentID: this.props.faction.id,
      connectionName: 'ships',
      edgeName: 'newShipEdge',
      rangeBehaviors: {
        // When the ships connection is not under the influence
        // of any call, append the ship to the end of the connection
        '': 'append',
        // Prepend the ship, wherever the connection is sorted by age
        'orderby(newest)': 'prepend',
      },
    }];
  }
  /* ... */
}
```

### `RANGE_DELETE`

Given a connection, one or more DataIDs in the response payload, and a path between the parent and the connection, Relay will remove the node(s) from the connection but leave the associated record(s) in the store.

#### Arguments

-   `deletedIDFieldName: string | Array<string>`

    The field name in the response that contains the DataID of the removed node, or the path to the node removed from the connection

-   `pathToConnection: Array<string>`

    An array containing the field names between the parent and the connection, including the parent and the connection

#### Example

```

class RemoveTagMutation extends Relay.Mutation {
  // This mutation declares a dependency on the
  // todo from which this tag is being removed.
  static fragments = {
    todo: () => Relay.QL`fragment on Todo { id }`,
  };
  // Removing a tag from a todo will affect its tags connection
  // so we specify it here as part of the fat query.
  getFatQuery() {
    return Relay.QL`
      fragment on RemoveTagMutationPayload {
        todo { tags },
        removedTagIDs,
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_DELETE',
      deletedIDFieldName: 'removedTagIDs',
      pathToConnection: ['todo', 'tags'],
    }];
  }
  /* ... */
}
```

### `REQUIRED_CHILDREN`

A `REQUIRED_CHILDREN` config is used to append additional children to the mutation query. You may need to use this, for example, to fetch fields on a new object created by the mutation (and which Relay would normally not attempt to fetch because it has not previously fetched anything for that object).

Data fetched as a result of a `REQUIRED_CHILDREN` config is not written into the client store, but you can add code that processes it in the `onSuccess` callback that you pass into `commitUpdate()`:

```

this.props.relay.commitUpdate(
  new CreateCouponMutation(),
  {
    onSuccess: response => this.setState({
      couponCount: response.coupons.length,
    }),
  }
);
```

#### Arguments

-   `children: Array<RelayQuery.Node>`

#### Example

```

class CreateCouponMutation extends Relay.Mutation<Props> {
  getMutation() {
    return Relay.QL`mutation {
      create_coupon(data: $input)
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      // Note the use of `pattern: true` here to show that this
      // connection field is to be used for pattern-matching only
      // (to determine what to fetch) and that Relay shouldn't
      // require the usual connection arguments like (`first` etc)
      // to be present.
      fragment on CouponCreatePayload @relay(pattern: true) {
        coupons
      }
    `;
  }

  getConfigs() {
    return [{
      // If we haven't shown the coupons in the UI at the time the
      // mutation runs, they've never been fetched and the `coupons`
      // field in the fat query would normally be ignored.
      // `REQUIRED_CHILDREN` forces it to be retrieved anyway.
      type: RelayMutationType.REQUIRED_CHILDREN,
      children: [
        Relay.QL`
          fragment on CouponCreatePayload {
            coupons
          }
        `,
      ],
    }];
  }
}
```

## Optimistic updates

All of the mutations we've performed so far have waited on a response from the server before updating the client-side store. Relay offers us a chance to craft an optimistic response of the same shape based on what we expect the server's response to be in the event of a successful mutation.

Let's craft an optimistic response for the `LikeStoryMutation` example above:

```

class LikeStoryMutation extends Relay.Mutation {
  /* ... */
  // Here's the fat query from before
  getFatQuery() {
    return Relay.QL`
      fragment on LikeStoryPayload {
        story {
          likers {
            count,
          },
          likeSentence,
          viewerDoesLike,
        },
      }
    `;
  }
  // Let's craft an optimistic response that mimics the shape of the
  // LikeStoryPayload, as well as the values we expect to receive.
  getOptimisticResponse() {
    return {
      story: {
        id: this.props.story.id,
        likers: {
          count: this.props.story.likers.count + (this.props.story.viewerDoesLike ? -1 : 1),
        },
        viewerDoesLike: !this.props.story.viewerDoesLike,
      },
    };
  }
  // To be able to increment the likers count, and flip the viewerDoesLike
  // bit, we need to ensure that those pieces of data will be available to
  // this mutation, in addition to the ID of the story.
  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        id,
        likers { count },
        viewerDoesLike,
      }
    `,
  };
  /* ... */
}
```

You don't have to mimic the entire response payload. Here, we've punted on the like sentence, since it's difficult to localize on the client side. When the server responds, Relay will treat its payload as the source of truth, but in the meantime, the optimistic response will be applied right away, allowing the people who use our product to enjoy instant feedback after having taken an action.
