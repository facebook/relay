#!/usr/bin/env bash
# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

GITHUB_ROOT=$(dirname $(dirname $(realpath "$0")))

cd "$GITHUB_ROOT"/compiler
cargo run --bin relay --release -- "$GITHUB_ROOT"/scripts/config.tests.json
