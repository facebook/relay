#!/usr/bin/env bash

GITHUB_ROOT=$(dirname $(dirname $(realpath "$0")))

cd "$GITHUB_ROOT"/compiler
cargo run --bin relay --release -- "$GITHUB_ROOT"/scripts/config.tests.json
