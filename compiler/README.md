# Rust Compiler Rewrite

This directory contains an experimental rewrite of the Relay compiler in Rust.
The code is still extremely new and incomplete. The components may work
individually, but are not yet fully integrated and may have bugs.

Goals of this project include:

- Fast compilation that scales to massive projects like
  [the new facebook.com](https://developers.facebook.com/videos/2019/building-the-new-facebookcom-with-react-graphql-and-relay/).
- Improved developer experience by offering better error reporting and watch
  mode.
- TypeScript support built in (works for extraction, but we'd like to also
  bundle type generation).
- Pre-built binaries for all platforms (Windows, Linux, macOS) distributed via
  npm, so no Rust compilation should be needed for the typical workflow.
