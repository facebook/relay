#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# Regenerate Rust tests from fixture files.

set -e

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
GITHUB_ROOT=$(dirname "$SCRIPT_DIR")

cd "$GITHUB_ROOT"/compiler || exit
cargo run --bin fixture_tests_bin --release --  $(cat "$GITHUB_ROOT"/compiler/fixture_dirs.txt)
