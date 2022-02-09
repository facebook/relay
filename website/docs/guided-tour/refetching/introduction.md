---
id: introduction
title: Introduction
slug: /guided-tour/refetching/
description: Relay guide to refetching
keywords:
- refetching
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

After an app has been initially rendered, there are various scenarios in which you might want to refetch and show *new* or *different* data (e.g. change the currently displayed item), or maybe refresh the currently rendered data with the latest version from the server (e.g. refreshing a count), usually as a result of an event or user interaction.

In this section we'll cover some of the most common scenarios and how to build them with Relay.

<DocsRating />
