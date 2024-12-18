import { Environment, Network, RecordSource, Store } from 'relay-runtime';

/**
 * Relay requires developers to configure a "fetch" function that tells Relay how to load
 * the results of GraphQL queries from your server (or other data source). See more at
 * https://relay.dev/docs/en/quick-start-guide#relay-environment.
 */
async function fetchRelay(params, variables) {
  // Fetch data from our example GraphQL server defined parallel to this client.
  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: params.text, variables }),
  });
  if(!response.ok) {
    throw new Error(`Relay request for ${params.name} failed with HTTP status ${response.status}`);
  }
  return response.json();
}

// Export a singleton instance of Relay Environment configured with our network layer:
export default new Environment({
  network: Network.create(fetchRelay),
  store: new Store(new RecordSource(), {
    // This property tells Relay to not immediately clear its cache when the user
    // navigates around the app. Relay will hold onto the specified number of
    // query results, allowing the user to return to recently visited pages
    // and reusing cached data if its available/fresh.
    gcReleaseBufferSize: 10,
  }),
});