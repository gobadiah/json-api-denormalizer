'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _memoizee = require('memoizee');

var _memoizee2 = _interopRequireDefault(_memoizee);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var underscorize = function underscorize(value) {
  return value.replace(/-/g, '_');
};

var blacklist = ['endpoint', 'isCreating', 'isReading', 'isUpdating', 'isDeleting'];

exports.default = (0, _memoizee2.default)(function (state) {
  var result = {};
  console.log('compare computing ...');
  Object.keys(state).forEach(function (key) {
    console.log(key, blacklist.indexOf(key));
    if (blacklist.indexOf(key) != -1) {
      return;
    }
    result[key] = {};
    Object.values(state[key].data).forEach(function (value) {
      result[key][value.id] = {
        type: value.type,
        id: value.id
      };
      Object.entries(value.attributes).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            val = _ref2[1];

        result[key][value.id][underscorize(k)] = _lodash2.default.cloneDeep(val);
      });
    });
  });
  Object.keys(state).forEach(function (key) {
    if (blacklist.indexOf(key) != -1) {
      return;
    }
    Object.values(state[key].data).forEach(function (value) {
      if (!value.hasOwnProperty('relationships')) {
        return;
      }
      Object.entries(value.relationships).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            k = _ref4[0],
            val = _ref4[1];

        if (value.relationships[k].data instanceof Array) {
          result[key][value.id][k] = _lodash2.default.map(_lodash2.default.filter(value.relationships[k].data, function (q) {
            return result.hasOwnProperty(q.type) && result[q.type].hasOwnProperty(q.id);
          }), function (v) {
            return result[v.type][v.id];
          });
        } else if (value.relationships[k].data instanceof Object) {
          var data = value.relationships[k].data;
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
