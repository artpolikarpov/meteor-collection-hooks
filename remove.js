CollectionHooks.defineAdvice("remove", function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var self = this;
  var ctx = {context: self, _super: _super, args: args};
  var callback = _.last(args);
  var async = _.isFunction(callback);
  var docs, abort, prev = [];
  var collection = _.has(self, "_collection") ? self._collection : self;
  var fetchFieldsBefore = CollectionHooks.extendOptions(instance.hookOptions, {}, "before", "remove").fetchFields;
  var fetchFieldsAfter = CollectionHooks.extendOptions(instance.hookOptions, {}, "after", "remove").fetchFields;

  // args[0] : selector
  // args[1] : callback

  if (!suppressAspects) {
    try {
      if (aspects.before.length || aspects.after.length) {
        var fetchFields = aspects.before.length? fetchFieldsBefore : fetchFieldsAfter;
        docs = CollectionHooks.getDocs.call(self, collection, args[0], null, fetchFields).fetch();
      }

      // copy originals for convenience for the "after" pointcut
      if (aspects.after.length) {
        _.each(docs, function (doc) {
          prev.push(EJSON.clone(doc));
        });
      }

      // before
      _.each(aspects.before, function (o) {
        _.each(docs, function (doc) {
          var r = o.aspect.call(_.extend({transform: getTransform(doc)}, ctx), userId, doc);
          if (r === false) abort = true;
        });
      });

      if (abort) return false;
    } catch (e) {
      if (async) return callback.call(self, e);
      throw e;
    }
  }

  function after(err) {
    if (!suppressAspects) {
      _.each(aspects.after, function (o) {
        _.each(prev, function (doc) {
          o.aspect.call(_.extend({transform: getTransform(doc), err: err}, ctx), userId, doc);
        });
      });
    }
  }

  if (async) {
    args[args.length - 1] = function (err) {
      after(err);
      return callback.apply(this, arguments);
    };
    return _super.apply(self, args);
  } else {
    var result = _super.apply(self, args);
    after();
    return result;
  }
});