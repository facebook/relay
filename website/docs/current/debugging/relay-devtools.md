---
id: relay-devtools
title: Relay DevTools
slug: /debugging/relay-devtools/
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

## Installation

<FbInternalOnly>

### Internal version (preferred)

The internal version of devtools has the latest updates and the process of installation will be much faster.

1. Before downloading the new Devtools, make sure you've deleted all older versions of the extension.
2. Join [Relay DevTools Support](https://fb.workplace.com/groups/655864995271028) group and you will automatically be added to the cpe_relay_devtools_extension gatekeeper.
3. Wait 20-30 minutes, and it should be downloaded on your Chrome browser
4. Or run `sudo soloctl -i` on your machine to get the extension immediately

### Internal Version for Edgium users

1. On `C:\Users\<User>\AppData\Local\Google\Chrome\User Data\<Work Profile>\Extensions` search for files manifest.json with Relay Developer Tools on it
2. Get the path to this folder e.g `...\Extensions\<blob>\<version>\`
3. On edge://extensions/ click load upacked (you might need to Allow extensions for other stores).

### External version

The external version of devtools is less prone to bugs but does not always contain the latest updates and you have to download the extension from the chrome store.
Follow this link and install it from the [chrome store](https://chrome.google.com/webstore/detail/relay-developer-tools/ncedobpgnmkhcmnnkcimnobpfepidadl).

</FbInternalOnly>

<OssOnly>

Follow this link and install it from the [chrome store](https://chrome.google.com/webstore/detail/relay-developer-tools/ncedobpgnmkhcmnnkcimnobpfepidadl).

</OssOnly>

---

## How to Navigate the Relay DevTools Extension

You should have a new tab called Relay in your Chrome DevTools. In this tab, you will be able to select between 2 panels: the **network panel** and the **store panel**.

### Network Panel

The network panel allows users to view individual requests in an active environment. Users can scroll through these requests, search for the requests and view the details of each request. The details of each request includes the status, the variables, and the responses for the request.

###  Store Panel

The store panel allows users to view individual records from the store data in an active environment. Users can scroll through these records, search for the records, and view the details of each request. Users can also copy the the store data in JSON format to the clipboard.The details of each record includes the ID, the typename, and all of the data in the record. If one of the fields in the data is a reference to another record, users can click on the reference, which will take them to that record.

---

## Multiple Environments

As you switch through the store and network panels, you'll notice that there is also a dropdown menu on the left side of the developer tools. This dropdown allows users to switch between environments. The requests in the network tab and the store data are grouped by environment, so users can easily shuffle between active environments.

## Give Feedback

Look in the top-right corner of the extension panel!

<DocsRating />
