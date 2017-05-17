---
id: refetch-container
title: RefetchContainer
layout: docs
category: Relay Modern
permalink: docs/refetch-container.html
next: pagination-container
---

A `RefetchContainer` first renders like a regular [`FragmentContainer`](./fragment-container.html), but has the option to execute a new query with different variables and render the response of that query instead when the request comes back.

`this.props.relay` exports the following API to execute the refetch query:

```javascript
type Variables = {[name: string]: any};
type RefetchOptions = {
  force?: boolean, // Refetch even if already fetched this query and variables.
};
type Disposable = {
  dispose(): void,
};

/**
 * Execute the refetch query
 */
refetch: (
  refetchVariables: Variables | (fragmentVariables: Variables) => Variables,
  renderVariables: ?Variables,
  callback: ?(error: ?Error) => void,
  options?: RefetchOptions,
) => Disposable,
```

* `refetchVariables` is either a bag of variables or a function that takes in the previous fragment variables and returns new variables.
* `renderVariables` is an optional param that tells Relay which variables to use at when the component is re-rendered after fetching. Without this, the `refetchVariables` will be used. You might use this for more advanced usage, for example, to implement pagination, where you would fetch an additional page with variables like `{first: 5, after: '...'}`, but you would then render the full collection with `{first: 10}`.
* It returns a `Disposable` on which you could call `dispose()` to cancel the refetch.


## Example

```javascript
const {
  createRefetchContainer,
  graphql,
} = require('react-relay');

class FeedStories extends React.Component {
  render() {
    return (
      <div>
        {this.props.feed.stories.edges.map(
          edge => <Story story={edge.node} key={edge.node.id} />
        )}
        <button
          onPress={this._loadMore}
          title="Load More"
        />
      </div>
    );
  }

  _loadMore() {
    // Increments the number of stories being rendered by 10.
    const refetchVariables = fragmentVariables => ({
      count: fragmentVariables.count + 10,
    });
    this.props.relay.refetch(refetchVariables, null);
  }
}

module.exports = createRefetchContainer(
  FeedStories,
  {
    feed: graphql.experimental`
      fragment FeedStories_feed on Feed 
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
      ) {
        stories(first: $count) {
          edges {
            node {
              id
              ...Story_story
            }
          }
        }
      }
    `
  },
  graphql`
    query FeedStoriesRefetchQuery($count: Int) {
      feed {
        ...FeedStories_feed @arguments(count: $count)
      }
    }
  `,
);
```
