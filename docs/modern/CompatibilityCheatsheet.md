# Compatibility Cheatsheet
*What works with what?*

'react-relay/compat' is the most flexible. Compatibility components and mutations can be used by everything. Compatibility components can also have any kind of children.

|Item in this column can be a parent of/call into...|Legacy Component|Compat Component| Modern Component| Legacy Mutation| Compat Mutation| Modern Mutation
|----|----|----|----|----|----|----
|RelayRootContainer|**Yes**|**Yes**|*No*|**Yes**| **Yes**|*No*|
|QueryRenderer using Legacy Environment (`Store` in `react-relay/classic`)|**Yes**|**Yes**|*No*|**Yes**|**Yes**|*No*|
|QueryRenderer using Modern Environment (instance of `RelayStaticEnvironment`)|*No*|**Yes**|**Yes**|*No*|**Yes**|**Yes**
|Legacy Component|**Yes**|**Yes**|*No*|**Yes**|**Yes**|*No*|
|Compat Component|**Yes**|**Yes**|**Yes**|**Yes\***|**Yes**|**Yes**|
|Modern Component|*No*|**Yes**|**Yes**|*No*|**Yes**|**Yes**


\*Modern API doesn't support mutation fragments. You might have to inline the mutation fragments from your legacy mutation in the fragment of the component.
