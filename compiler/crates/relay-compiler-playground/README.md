# Relay Compiler Playground

Compile parts of the Rust Relay compiler to Wasm and expose them as a web-based
playground.

## Build The Wasm Module

Ensure you have wasm-pack >= 0.10.0 installed. Go
[here](https://rustwasm.github.io/wasm-pack/installer/) if you don't.

To build the wasm module:

```bash
cd relay-compiler-playground
wasm-pack build --target web
```

I had to do `rustup component add rust-src` as well.

This will create the NPM module in `relay-compiler-playground/pkg`.

## Publishing

Bump the version in `cargo.toml`. This will be used for the generated
`package.json`.

Build (see above)

Finally, publish:

```bash
cd pkg
npm publish
```

## Testing

```bash
cd relay-compiler-playground
wasm-pack build --target nodejs # NOTE: We build for node in tests and web to publish
yarn
yarn test
```

## Manually Testing

Follow the steps above for "Build The Wasm Module".

```bash
cd relay-compiler-playground/pkg
yarn link

cd ~/fbsource/xplat/js/RKJSModules/Libraries/Relay/oss/__github__/website
yarn link relay-compiler-playground

# Launch the website in dev mode
yarn start
```

Navigate to `http://localhost:3000/compiler-playground`
