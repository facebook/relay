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
import React, { Component } from 'react';
import PropType from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import Stories from './Stories';

class FeedStories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: this.props.offset,
      limit: this.props.limit,
      total: this.props.viewer.stories.totalCount
    };
  }

  _previousPage = () => {
    if (this.state.offset > 0) {
      this.setState({ offset: this.state.offset - this.state.limit }, () => {
        this._loadMore();
      });
    }
  }

  _nextPage = () => {
    if (this.state.offset < (this.state.total - this.state.limit)) {
      this.setState({ offset: this.state.offset + this.state.limit }, () => {
        this._loadMore();
      })
    }
  }

  _loadMore = () => {
    const refetchVariables = {
      offset: this.state.offset,
      limit: this.state.limit 
    };
    this.props.relay.refetch(refetchVariables);
  }

  render() {
    return (
      <div>
        {this.props.viewer.stories.edges.map(edge => 
          <Stories
            key={edge.node.__id}
            data={edge.node} 
          />
        )}
        <button onClick={() => this._previousPage()}>Previous</button>
        <button onClick={() => this._nextPage()}>Next</button>
      </div>
    );
  }
}

FeedStories.defaultProps = {
  offset: 0,
  limit: 10
};

FeedStories.propTypes = { 
  offset: PropType.number,
  limit: PropType.number
};

export default createRefetchContainer(
  FeedStories,
  {
    viewer: graphql.experimental`
      fragment FeedStories_viewer on Viewer @argumentDefinitions( 
        offset: { type: "Int", defaultValue: 0 }
        limit: { type: "Int", defaultValue: 10 }
      ) {
        stories(
          offset: $offset
          limit: $limit
        ) {
          totalCount
          edges {
            node {
              id
              ...Story_story
            }
          }
        }
      }
  `,
  },
  graphql.experimental`
    query FeedStoriesQuery($offset: Int, $limit: Int) {
      viewer {
        ...FeedStories_viewer @arguments(offset: $offset, limit: $limit)
      }
    }
  `,
);
```
