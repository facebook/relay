# babel-plugin-relay

## Installation

```sh
cd relay/scripts/babel-plugin-relay
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
