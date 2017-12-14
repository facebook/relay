---
id: version-classic-relay-store
title: Relay Store
original_id: relay-store
---

The Relay Store can be used to programatically update client-side data inside [`updater`](./mutations.html#arguments) functions. The following API methods are useful for mutating connections and fragments.

## RelayRecordStore
### getSource(): [RecordSource](https://github.com/facebook/relay/blob/d0310d69012bba615dacf614319bcf47ee2a0f3f/packages/relay-runtime/ARCHITECTURE.md)
Returns a read-only view of the store's internal RecordSource that holds all records.

### getRootField(fieldName: string): ?RecordProxy
Returns a proxy class for manipulating records from a record source, for example a query, mutation, or the store.

## RelayRecordProxy
### getDataID(): [DataID](https://github.com/facebook/relay/blob/d0310d69012bba615dacf614319bcf47ee2a0f3f/packages/relay-runtime/ARCHITECTURE.md)
Returns the globally unique identifier string for a record.

### getType(): RelayQLType
Returns the GraphQL type name for a given record.

### getValue(name: string, args?: ?Variables): mixed
Reads the value of an attribute on a record by the field name and an object representing pre-defined argument values.

### setValue(value: mixed, name: string, args?: ?Variables): RecordProxy
Updates the value of a mutable record's attribute given by the field name and an object representing pre-defined argument values.

### getLinkedRecord(name: string, args?: ?Variables): ?RecordProxy
### getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordProxy>
Retrieves record(s) associated with the given record, transversing the source by field name and an object representing pre-defined argument values.

### setLinkedRecord(record: RecordProxy, name: string, args?: ?Variables): RecordProxy
### setLinkedRecords(records: Array<?RecordProxy>, name: string, args?: ?Variables ): RecordProxy
Updates the records associated with a mutable record, transversing the source by field name and an object representing pre-defined argument values.

### getOrCreateLinkedRecord(name: string, typeName: string, args?: ?Variables ): RecordProxy
Finds or creates a single record associated with a mutable record.
This is a shortcut to `RelayRecordProxy.getLinkedRecord` with `RelayRecordProxy.setLinkedRecord` should the associated record be non-existant.
