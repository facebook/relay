---
id: availability-of-data
title: Availability of Data
slug: /guided-tour/reusing-cached-data/availability-of-data/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

The behavior of the fetch policies described in the [previous section](../fetch-policies/) will depend on the availability of the data in the Relay store at the moment we attempt to evaluate a query.

There are two factors that determine the availability of data: the [presence of data](../presence-of-data/) and [staleness of data](../staleness-of-data/).


<DocsRating />
