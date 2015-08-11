# babel-relay-plugin

## Installation

```sh
cd relay/scripts/babel-relay-plugin
npm install
```

## Tests

```sh
npm test
```

## Usage

```js
var plugin = getBabelRelayPlugin(parsedSchemaJSON.data);

babel.transform(source, {
  plugins: [plugin],
  ...
});
```

## License

Relay is [BSD licensed](./LICENSE). We also provide an additional [patent grant](./PATENTS).
