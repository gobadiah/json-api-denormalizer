import _ from 'lodash';
import memoize from 'memoizee';

const underscorize = value => value.replace(/-/g, '_');

const blacklist = [
  'endpoint',
  'isCreating',
  'isReading',
  'isUpdating',
  'isDeleting',
];

export default memoize(state => {
  const result = {};
  Object.keys(state).forEach((key) => {
    if (blacklist.indexOf(key) != -1) {
      return;
    }
    result[key] = {};
    Object.values(state[key].data).forEach((value) => {
      result[key][value.id] = {
        type: value.type,
        id: value.id,
      };
      Object.entries(value.attributes).forEach(([k, val]) => {
        result[key][value.id][underscorize(k)] = _.cloneDeep(val);
      });
    });
  });
  Object.keys(state).forEach((key) => {
    if (blacklist.indexOf(key) != -1) {
      return;
    }
    Object.values(state[key].data).forEach((value) => {
      if (!value.hasOwnProperty('relationships')) {
        return;
      }
      Object.entries(value.relationships).forEach(([k, val]) => {
        if (value.relationships[k].data instanceof Array) {
          result[key][value.id][k] = _.map(
            _.filter(
              value.relationships[k].data,
              q => result.hasOwnProperty(q.type) && result[q.type].hasOwnProperty(q.id),
            ),
            v => result[v.type][v.id],
          );
        } else if (value.relationships[k].data instanceof Object) {
          const data = value.relationships[k].data
          if (result.hasOwnProperty(data.type) && result[data.type].hasOwnProperty(data.id)) {
            result[key][value.id][underscorize(k)] = result[data.type][data.id];
          } else {
            result[key][value.id][underscorize(k)] = undefined;
          }
        }
      });
    });
  });
  result.toJSON = () => removeCircularReferences(result);
  return result;
});

export const removeCircularReferences = memoize((obj, cache = []) => {
  cache.push(obj);
  if (Array.isArray(obj)) {
    const result = [];
    Object.values(obj).forEach((value) => {
      if (typeof value === 'object') {
        if (cache.indexOf(value) !== -1) {
          return;
        }
        const newCache = _.clone(cache);
        result.push(removeCircularReferences(value, newCache));
        return;
      }
      result.push(value);
    });
    return result;
  } else if (typeof obj === 'object' && obj != null) {
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object') {
        if (cache.indexOf(value) !== -1) {
          return;
        }
        const newCache = _.clone(cache);
        result[key] = removeCircularReferences(value, newCache);
        return;
      }
      result[key] = value;
    });
    return result;
  }
  return obj;
});
