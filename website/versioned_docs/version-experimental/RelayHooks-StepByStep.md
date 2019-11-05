---
id: version-experimental-step-by-step
title: A Step By Step Guide
original_id: step-by-step
---

[Relay](https://relay.dev/) is a framework for managing and declaratively fetching GraphQL data. Specifically, it provides a set of APIs to fetch and declare data dependencies for React components, in colocation with component definitions themselves. In this guide we'll introduce the key concepts for using Relay in a React app one at a time, step by step. 

## Step 1: Create React App

First, we'll need a working React app. We'll use [Create React App](https://create-react-app.dev) ("CRA"), which makes it easy to get a fully configured React app up and running, and which supports adding Relay. To get started, create a new 

```bash
# NPM
npx create-react-app your-app-name

# Yarn
yarn create react-app your-app-name
```

At this point we should be able to change to the app's directory and run it:

```bash
# NPM
cd your-app-name
npm start

# Yarn
cd your-app-name
yarn start
```

For troubleshooting and more setup options, see the [Create React App documentation](https://create-react-app.dev/docs/getting-started).

## Step 2: Fetch GraphQL (without Relay)

If you're exploring using GraphQL with Relay, we highly recommend starting with a basic approach and using as few libraries as possible. GraphQL servers can generally be accessed using plain-old HTTP requests, so we can use the [`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to request some data from our server. For this guide we'll use GitHub's GraphQL API as the server, but if you already have a GraphQL server feel free to use that instead.

### 2.1: GitHub GraphQL Authentication

To start we'll need an authentication token for the GitHub API (if you're using your own GraphQL endpoint, you can skip this pieces);

* Open https://github.com/settings/tokens.
* Ensure that at least the `repo` scope is selected.
* Generate a token
* Create a file `./your-app-name/.env.local` and add the following contents, replacing '<TOKEN>' with your authentication token:

```
# your-app-name/.env.local
REACT_APP_GITHUB_AUTH_TOKEN=<TOKEN>
```

### 2.2: A fetchGraphQL Helper

Next let's update the home screen of our app to show the name of our favorite repository. We'll start with a very traditional approach to fetching data, where we fetch after the component mounts - later, we'll see some limitations of this approach and a better alternative that works with React Concurrent Mode and Suspense. First we'll create a helper function to load data from the server. Again, this example will use the GitHub API, but feel free to replace it with the appropriate URL and authentication mechanism for your own GraphQL server:

```javascript
// src/fetchGraphQL.js
export default async function fetchGraphQL(text, variables) {
  const REACT_APP_GITHUB_AUTH_TOKEN = process.env.REACT_APP_GITHUB_AUTH_TOKEN;

  // Fetch data from GitHub's GraphQL API:
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${REACT_APP_GITHUB_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: text,
      variables,
    }),
  });

  // Get the response as JSON
  return await response.json();
}
```

### 2.3: Fetching GraphQL From React

Now we can use our `fetchGraphQL` function to fetch some data in our app. Open `src/App.js` and edit it as follows:

```javascript
// src/App.js
import React from 'react';
import './App.css';
import fetchGraphQL from './fetchGraphQL';

const { useState, useEffect } = React;

function App() {
  // We'll load the name of a repository, initially setting it to null
  const [name, setName] = useState(null);

  // When the component mounts we'll fetch a repository name
  useEffect(() => {
    fetchGraphQL(`
      query RepositoryNameQuery {
        # feel free to change owner/name here
        repository(owner: "facebook" name: "relay") {
          name
        }
      }
    `).then(response => {
      const data = response.data;
      setName(data.repository.name);
    }).catch(error => {
      console.error(error);
    });
  }, [fetchGraphQL]);

  // Render "Loading" until the query completes
  return (
    <div className="App">
      <header className="App-header">
        <p>
          {name != null ? `Repository: ${name}` : "Loading"}
        </p>
      </header>
    </div>
  );
}

export default App;
```

## Step 3: Setup Relay

At this point we can fetch data with GraphQL and render it with React. This is a reasonable solution that can be sufficient for many - especially smaller apps. However, this approach doesn't necessarily scale. As our app grows in size and complexity, or the number of people working on the app grows, a simple approach like this can become limiting.

### 3.1 Adding Relay To Our Project

```bash
# NPM Users
npm install --save relay-runtime react-relay@experimental
npm install --save-dev relay-compiler

# Yarn Users
yarn add relay-runtime react-relay@experimental
yarn add --dev rela-compiler
```

*Note*: You may get a notice asking you to choose which version of `relay-runtime` to use - if so, specify version 7.0.0.

### 3.2 Configure Relay Compiler

### 3.3 Setup Relay Scripts
