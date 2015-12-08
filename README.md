Same as https://github.com/matb33/meteor-collection-hooks but without fetching leak and optional performance enhancement.

Limit the fields that will be fetched from the database by your update, upsert and remove hooks.

```
SomeCollection.hookOptions.all.update = {
  fetchFields: ['owner', 'locked']
};

SomeCollection.hookOptions.after.remove = {
  fetchFields: ['_id']
};
```
