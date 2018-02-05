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
  console.log('compare computing ...');
  Object.keys(state).forEach((key) => {
    console.log(key, blacklist.indexOf(key));
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
  return result;
});
