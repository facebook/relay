#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# Compile and run the OSS compiler binary. Useful for testing and for using the
# VSCode extension on our test files. An example VSCode project settings.json file:
#
# {
#    "relay.pathToConfig": "./scripts/config.tests.js",
#    "relay.pathToRelay": "./scripts/dev-compiler.sh",
#    "relay.autoStartCompiler": true
# }


SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
GITHUB_ROOT=$(dirname "$SCRIPT_DIR")

cd "$GITHUB_ROOT"/compiler || exit
cargo run --bin relay --release -- "$@"
