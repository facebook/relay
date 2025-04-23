#!/usr/bin/env bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -e

if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  exit 0
else
  echo "Detected changes in the working directory:"
  git --no-pager diff HEAD
  exit 1
fi
