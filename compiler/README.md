# Rust Compiler

This directory contains the implementation of the Relay compiler in Rust.
The Relay compiler was previously written in JavaScript and was re-written
in Rust for several benefits including:

- Fast compilation that scales to massive projects like
  [the new facebook.com](https://developers.facebook.com/videos/2019/building-the-new-facebookcom-with-react-graphql-and-relay/).
- Improved developer experience by offering better error reporting and watch
  mode.
- TypeScript support built in (works for extraction, but we'd like to also
  bundle type generation).
- Pre-built binaries for all platforms (Windows, Linux, macOS) distributed via
  npm, so no Rust compilation should be needed for the typical workflow.
