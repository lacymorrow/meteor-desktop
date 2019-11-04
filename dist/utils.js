"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exists = exists;
exports.rmWithRetries = rmWithRetries;
exports.readDir = readDir;
exports.getFileList = getFileList;
exports.readAndGetFileHash = readAndGetFileHash;
exports.computeHashForHashesSet = computeHashForHashesSet;
exports.readAndHashFiles = readAndHashFiles;
exports.readFilesAndComputeHash = readFilesAndComputeHash;
exports.symlinkExists = symlinkExists;
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _crypto = _interopRequireDefault(require("crypto"));

var _shelljs = _interopRequireDefault(require("shelljs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable consistent-return */

/**
 * Exists
 * @param {string} pathToCheck
 * @returns {boolean}
 */
function exists(pathToCheck) {
  try {
    _fs.default.accessSync(pathToCheck);

    return true;
  } catch (e) {
    return false;
  }
}
/**
 * Simple wrapper for shelljs.rm with additional retries in case of failure.
 * It is useful when something is concurrently reading the dir you want to remove.
 */


function rmWithRetries() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var retries = 0;
  return new Promise(function (resolve, reject) {
    function rm() {
      for (var _len2 = arguments.length, rmArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        rmArgs[_key2] = arguments[_key2];
      }

      try {
        _shelljs.default.config.fatal = true;

        _shelljs.default.rm.apply(_shelljs.default, rmArgs);

        _shelljs.default.config.reset();

        resolve();
      } catch (e) {
        retries += 1;

        if (retries < 5) {
          setTimeout(function () {
            rm.apply(void 0, rmArgs);
          }, 100);
        } else {
          _shelljs.default.config.reset();

          reject(e);
        }
      }
    }

    rm.apply(void 0, args);
  });
}

function readDir(dir, callback) {
  if (!callback) {
    return new Promise(function (resolve, reject) {
      readDir(dir, function (err, data, stats) {
        if (err) {
          reject(err);
        } else {
          resolve({
            data,
            stats
          });
        }
      });
    });
  }

  var list = [];
  var allStats = {};

  _fs.default.readdir(dir, function (err, files) {
    if (err) {
      return callback(err);
    }

    var pending = files.length;

    if (!pending) {
      return callback(null, list, allStats);
    }

    files.forEach(function (file) {
      var filePath = _path.default.join(dir, file);

      _fs.default.stat(filePath, function (_err, stats) {
        if (_err) {
          return callback(_err);
        }

        if (stats.isDirectory()) {
          readDir(filePath, function (__err, res, _allStats) {
            if (__err) {
              return callback(__err);
            }

            list = list.concat(res);
            allStats = Object.assign(allStats, _allStats);
            pending -= 1;

            if (!pending) {
              return callback(null, list, allStats);
            }
          });
        } else {
          list.push(filePath);
          allStats[filePath] = {
            size: stats.size,
            dates: [stats.birthtime.getTime(), stats.ctime.getTime(), stats.mtime.getTime()]
          };
          pending -= 1;

          if (!pending) {
            return callback(null, list, allStats);
          }
        }
      });
    });
  });
}
/**
 * Returns a file list from a directory.
 * @param {string} dir - dir path
 * @param {boolean} sort - whether to apply sort
 * @returns {Promise<Array>}
 */


function getFileList(dir) {
  var sort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return new Promise(function (resolve, reject) {
    readDir(dir, function (error, files) {
      if (error) {
        reject(error);
        return;
      } // eslint-disable-next-line no-param-reassign


      var resultantFilesList;

      if (sort) {
        var stripLength = dir.substr(0, 2) === './' ? dir.length - 1 : dir.length + 1;
        var pathsUnified = files.map(function (pth) {
          return pth.substr(stripLength).replace(/[\\/]/gm, '-');
        });
        var temporaryIndex = {};
        files.forEach(function (file, i) {
          temporaryIndex[pathsUnified[i]] = file;
        });
        pathsUnified = pathsUnified.sort();
        var filesSorted = [];
        pathsUnified.forEach(function (key) {
          filesSorted.push(temporaryIndex[key]);
        });
        resultantFilesList = filesSorted;
      } else {
        resultantFilesList = files;
      }

      resolve(resultantFilesList);
    });
  });
}
/**
 * Returns file's hash.
 * @param {string} file - file path
 * @param {boolean} returnFileContents - include file contents in the resultant object
 * @returns {Promise<Object>}
 */


function readAndGetFileHash(file) {
  var returnFileContents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return new Promise(function (resolve, reject) {
    _fs.default.readFile(file, function (err, data) {
      if (err) {
        reject(err);
        return;
      }

      var hash = _crypto.default.createHash('sha1');

      hash.update(data);
      var returnObject = {
        hash: hash.digest('hex')
      };

      if (returnFileContents) {
        returnObject.contents = data.toString('utf8');
      }

      resolve(returnObject);
    });
  });
}
/**
 * Calculates a hash from objects values in specified order.
 * @param {Array} orderOfKeys
 * @param {Object} hashSet
 * @param {Function} keyFilter
 * @returns {string}
 */


function computeHashForHashesSet(orderOfKeys, hashSet) {
  var keyFilter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (key) {
    return key;
  };

  var hash = _crypto.default.createHash('sha1');

  var hashesJoined = orderOfKeys.reduce( // eslint-disable-next-line no-param-reassign,no-return-assign
  function (tmpHash, key) {
    return tmpHash += hashSet[keyFilter(key)], tmpHash;
  }, '');
  hash.update(hashesJoined);
  return hash.digest('hex');
}
/**
 * Reads files from disk and computes hashes for them.
 * @param {Array} files - array with file paths
 * @returns {Promise<Object>}
 */


function readAndHashFiles(files, fileFilter) {
  var fileHashes = {};
  var fileContents = {};
  var promises = [];

  function readSingleFile(file) {
    return new Promise(function (resolve, reject) {
      readAndGetFileHash(file, file.endsWith('.js') && !file.endsWith('.test.js')).then(function (result) {
        var fileName = file;

        if (fileFilter) {
          fileName = fileFilter(fileName);
        }

        fileHashes[fileName] = result.hash;

        if (result.contents) {
          fileContents[fileName] = result.contents;
        }

        resolve();
      }).catch(reject);
    });
  }

  files.forEach(function (file) {
    promises.push(readSingleFile(file));
  });
  return new Promise(function (resolve, reject) {
    Promise.all(promises).then(function () {
      resolve({
        files,
        fileContents,
        fileHashes
      });
    }).catch(reject);
  });
}
/**
 * Reads files from .desktop and computes a version hash.
 *
 * @param {string} dir - path
 * @param {Function} fileFilter
 * @returns {Promise<Object>}
 */


function readFilesAndComputeHash(dir, fileFilter) {
  return new Promise(function (resolve, reject) {
    getFileList(dir, true).catch(reject).then(function (files) {
      return readAndHashFiles(files, fileFilter);
    }).catch(reject).then(function (result) {
      // eslint-disable-next-line no-param-reassign
      result.hash = computeHashForHashesSet(result.files, result.fileHashes, fileFilter);
      resolve(result);
    });
  });
}
/**
 * Symlink exists
 * @param {string} pathToCheck
 * @returns {boolean}
 */


function symlinkExists(pathToCheck) {
  try {
    _fs.default.readlinkSync(pathToCheck);

    return true;
  } catch (e) {
    return false;
  }
}

var _default = {
  getFileList,
  rmWithRetries,
  exists,
  readDir,
  readAndGetFileHash,
  computeHashForHashesSet,
  readAndHashFiles,
  readFilesAndComputeHash,
  symlinkExists
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6WyJleGlzdHMiLCJwYXRoVG9DaGVjayIsImFjY2Vzc1N5bmMiLCJlIiwicm1XaXRoUmV0cmllcyIsImFyZ3MiLCJyZXRyaWVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJybSIsInJtQXJncyIsImNvbmZpZyIsImZhdGFsIiwicmVzZXQiLCJzZXRUaW1lb3V0IiwicmVhZERpciIsImRpciIsImNhbGxiYWNrIiwiZXJyIiwiZGF0YSIsInN0YXRzIiwibGlzdCIsImFsbFN0YXRzIiwicmVhZGRpciIsImZpbGVzIiwicGVuZGluZyIsImxlbmd0aCIsImZvckVhY2giLCJmaWxlIiwiZmlsZVBhdGgiLCJqb2luIiwic3RhdCIsIl9lcnIiLCJpc0RpcmVjdG9yeSIsIl9fZXJyIiwicmVzIiwiX2FsbFN0YXRzIiwiY29uY2F0IiwiT2JqZWN0IiwiYXNzaWduIiwicHVzaCIsInNpemUiLCJkYXRlcyIsImJpcnRodGltZSIsImdldFRpbWUiLCJjdGltZSIsIm10aW1lIiwiZ2V0RmlsZUxpc3QiLCJzb3J0IiwiZXJyb3IiLCJyZXN1bHRhbnRGaWxlc0xpc3QiLCJzdHJpcExlbmd0aCIsInN1YnN0ciIsInBhdGhzVW5pZmllZCIsIm1hcCIsInB0aCIsInJlcGxhY2UiLCJ0ZW1wb3JhcnlJbmRleCIsImkiLCJmaWxlc1NvcnRlZCIsImtleSIsInJlYWRBbmRHZXRGaWxlSGFzaCIsInJldHVybkZpbGVDb250ZW50cyIsInJlYWRGaWxlIiwiaGFzaCIsImNyZWF0ZUhhc2giLCJ1cGRhdGUiLCJyZXR1cm5PYmplY3QiLCJkaWdlc3QiLCJjb250ZW50cyIsInRvU3RyaW5nIiwiY29tcHV0ZUhhc2hGb3JIYXNoZXNTZXQiLCJvcmRlck9mS2V5cyIsImhhc2hTZXQiLCJrZXlGaWx0ZXIiLCJoYXNoZXNKb2luZWQiLCJyZWR1Y2UiLCJ0bXBIYXNoIiwicmVhZEFuZEhhc2hGaWxlcyIsImZpbGVGaWx0ZXIiLCJmaWxlSGFzaGVzIiwiZmlsZUNvbnRlbnRzIiwicHJvbWlzZXMiLCJyZWFkU2luZ2xlRmlsZSIsImVuZHNXaXRoIiwidGhlbiIsInJlc3VsdCIsImZpbGVOYW1lIiwiY2F0Y2giLCJhbGwiLCJyZWFkRmlsZXNBbmRDb21wdXRlSGFzaCIsInN5bWxpbmtFeGlzdHMiLCJyZWFkbGlua1N5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUpBOztBQU1BOzs7OztBQUtPLFNBQVNBLE1BQVQsQ0FBZ0JDLFdBQWhCLEVBQTZCO0FBQ2hDLE1BQUk7QUFDQSxnQkFBR0MsVUFBSCxDQUFjRCxXQUFkOztBQUNBLFdBQU8sSUFBUDtBQUNILEdBSEQsQ0FHRSxPQUFPRSxDQUFQLEVBQVU7QUFDUixXQUFPLEtBQVA7QUFDSDtBQUNKO0FBRUQ7Ozs7OztBQUlPLFNBQVNDLGFBQVQsR0FBZ0M7QUFBQSxvQ0FBTkMsSUFBTTtBQUFOQSxRQUFNO0FBQUE7O0FBQ25DLE1BQUlDLFVBQVUsQ0FBZDtBQUNBLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNwQyxhQUFTQyxFQUFULEdBQXVCO0FBQUEseUNBQVJDLE1BQVE7QUFBUkEsY0FBUTtBQUFBOztBQUNuQixVQUFJO0FBQ0EseUJBQU1DLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjs7QUFDQSx5QkFBTUgsRUFBTix5QkFBWUMsTUFBWjs7QUFDQSx5QkFBTUMsTUFBTixDQUFhRSxLQUFiOztBQUNBTjtBQUNILE9BTEQsQ0FLRSxPQUFPTCxDQUFQLEVBQVU7QUFDUkcsbUJBQVcsQ0FBWDs7QUFDQSxZQUFJQSxVQUFVLENBQWQsRUFBaUI7QUFDYlMscUJBQVcsWUFBTTtBQUNiTCw2QkFBTUMsTUFBTjtBQUNILFdBRkQsRUFFRyxHQUZIO0FBR0gsU0FKRCxNQUlPO0FBQ0gsMkJBQU1DLE1BQU4sQ0FBYUUsS0FBYjs7QUFDQUwsaUJBQU9OLENBQVA7QUFDSDtBQUNKO0FBQ0o7O0FBQ0RPLHFCQUFNTCxJQUFOO0FBQ0gsR0FwQk0sQ0FBUDtBQXFCSDs7QUFFTSxTQUFTVyxPQUFULENBQWlCQyxHQUFqQixFQUFzQkMsUUFBdEIsRUFBZ0M7QUFDbkMsTUFBSSxDQUFDQSxRQUFMLEVBQWU7QUFDWCxXQUFPLElBQUlYLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDcENPLGNBQVFDLEdBQVIsRUFBYSxVQUFDRSxHQUFELEVBQU1DLElBQU4sRUFBWUMsS0FBWixFQUFzQjtBQUMvQixZQUFJRixHQUFKLEVBQVM7QUFDTFYsaUJBQU9VLEdBQVA7QUFDSCxTQUZELE1BRU87QUFDSFgsa0JBQVE7QUFBRVksZ0JBQUY7QUFBUUM7QUFBUixXQUFSO0FBQ0g7QUFDSixPQU5EO0FBT0gsS0FSTSxDQUFQO0FBU0g7O0FBQ0QsTUFBSUMsT0FBTyxFQUFYO0FBQ0EsTUFBSUMsV0FBVyxFQUFmOztBQUVBLGNBQUdDLE9BQUgsQ0FBV1AsR0FBWCxFQUFnQixVQUFDRSxHQUFELEVBQU1NLEtBQU4sRUFBZ0I7QUFDNUIsUUFBSU4sR0FBSixFQUFTO0FBQ0wsYUFBT0QsU0FBU0MsR0FBVCxDQUFQO0FBQ0g7O0FBQ0QsUUFBSU8sVUFBVUQsTUFBTUUsTUFBcEI7O0FBQ0EsUUFBSSxDQUFDRCxPQUFMLEVBQWM7QUFDVixhQUFPUixTQUFTLElBQVQsRUFBZUksSUFBZixFQUFxQkMsUUFBckIsQ0FBUDtBQUNIOztBQUNERSxVQUFNRyxPQUFOLENBQWMsVUFBQ0MsSUFBRCxFQUFVO0FBQ3BCLFVBQU1DLFdBQVcsY0FBS0MsSUFBTCxDQUFVZCxHQUFWLEVBQWVZLElBQWYsQ0FBakI7O0FBQ0Esa0JBQUdHLElBQUgsQ0FBUUYsUUFBUixFQUFrQixVQUFDRyxJQUFELEVBQU9aLEtBQVAsRUFBaUI7QUFDL0IsWUFBSVksSUFBSixFQUFVO0FBQ04saUJBQU9mLFNBQVNlLElBQVQsQ0FBUDtBQUNIOztBQUNELFlBQUlaLE1BQU1hLFdBQU4sRUFBSixFQUF5QjtBQUNyQmxCLGtCQUFRYyxRQUFSLEVBQWtCLFVBQUNLLEtBQUQsRUFBUUMsR0FBUixFQUFhQyxTQUFiLEVBQTJCO0FBQ3pDLGdCQUFJRixLQUFKLEVBQVc7QUFDUCxxQkFBT2pCLFNBQVNpQixLQUFULENBQVA7QUFDSDs7QUFDRGIsbUJBQU9BLEtBQUtnQixNQUFMLENBQVlGLEdBQVosQ0FBUDtBQUNBYix1QkFBV2dCLE9BQU9DLE1BQVAsQ0FBY2pCLFFBQWQsRUFBd0JjLFNBQXhCLENBQVg7QUFDQVgsdUJBQVcsQ0FBWDs7QUFDQSxnQkFBSSxDQUFDQSxPQUFMLEVBQWM7QUFDVixxQkFBT1IsU0FBUyxJQUFULEVBQWVJLElBQWYsRUFBcUJDLFFBQXJCLENBQVA7QUFDSDtBQUNKLFdBVkQ7QUFXSCxTQVpELE1BWU87QUFDSEQsZUFBS21CLElBQUwsQ0FBVVgsUUFBVjtBQUNBUCxtQkFBU08sUUFBVCxJQUFxQjtBQUNqQlksa0JBQU1yQixNQUFNcUIsSUFESztBQUVqQkMsbUJBQU8sQ0FDSHRCLE1BQU11QixTQUFOLENBQWdCQyxPQUFoQixFQURHLEVBRUh4QixNQUFNeUIsS0FBTixDQUFZRCxPQUFaLEVBRkcsRUFHSHhCLE1BQU0wQixLQUFOLENBQVlGLE9BQVosRUFIRztBQUZVLFdBQXJCO0FBUUFuQixxQkFBVyxDQUFYOztBQUNBLGNBQUksQ0FBQ0EsT0FBTCxFQUFjO0FBQ1YsbUJBQU9SLFNBQVMsSUFBVCxFQUFlSSxJQUFmLEVBQXFCQyxRQUFyQixDQUFQO0FBQ0g7QUFDSjtBQUNKLE9BL0JEO0FBZ0NILEtBbENEO0FBbUNILEdBM0NEO0FBNENIO0FBRUQ7Ozs7Ozs7O0FBTU8sU0FBU3lCLFdBQVQsQ0FBcUIvQixHQUFyQixFQUF3QztBQUFBLE1BQWRnQyxJQUFjLHVFQUFQLEtBQU87QUFDM0MsU0FBTyxJQUFJMUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNwQ08sWUFBUUMsR0FBUixFQUFhLFVBQUNpQyxLQUFELEVBQVF6QixLQUFSLEVBQWtCO0FBQzNCLFVBQUl5QixLQUFKLEVBQVc7QUFDUHpDLGVBQU95QyxLQUFQO0FBQ0E7QUFDSCxPQUowQixDQUszQjs7O0FBQ0EsVUFBSUMsa0JBQUo7O0FBRUEsVUFBSUYsSUFBSixFQUFVO0FBQ04sWUFBTUcsY0FBZW5DLElBQUlvQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsTUFBcUIsSUFBdEIsR0FBOEJwQyxJQUFJVSxNQUFKLEdBQWEsQ0FBM0MsR0FBK0NWLElBQUlVLE1BQUosR0FBYSxDQUFoRjtBQUNBLFlBQUkyQixlQUFlN0IsTUFBTThCLEdBQU4sQ0FBVztBQUFBLGlCQUFPQyxJQUFJSCxNQUFKLENBQVdELFdBQVgsRUFBd0JLLE9BQXhCLENBQWdDLFNBQWhDLEVBQTJDLEdBQTNDLENBQVA7QUFBQSxTQUFYLENBQW5CO0FBQ0EsWUFBTUMsaUJBQWlCLEVBQXZCO0FBQ0FqQyxjQUFNRyxPQUFOLENBQWMsVUFBQ0MsSUFBRCxFQUFPOEIsQ0FBUCxFQUFhO0FBQ3ZCRCx5QkFBZUosYUFBYUssQ0FBYixDQUFmLElBQWtDOUIsSUFBbEM7QUFDSCxTQUZEO0FBR0F5Qix1QkFBZUEsYUFBYUwsSUFBYixFQUFmO0FBQ0EsWUFBTVcsY0FBYyxFQUFwQjtBQUNBTixxQkFBYTFCLE9BQWIsQ0FBcUIsVUFBQ2lDLEdBQUQsRUFBUztBQUMxQkQsc0JBQVluQixJQUFaLENBQWlCaUIsZUFBZUcsR0FBZixDQUFqQjtBQUNILFNBRkQ7QUFHQVYsNkJBQXFCUyxXQUFyQjtBQUNILE9BYkQsTUFhTztBQUNIVCw2QkFBcUIxQixLQUFyQjtBQUNIOztBQUNEakIsY0FBUTJDLGtCQUFSO0FBQ0gsS0F6QkQ7QUEwQkgsR0EzQk0sQ0FBUDtBQTRCSDtBQUVEOzs7Ozs7OztBQU1PLFNBQVNXLGtCQUFULENBQTRCakMsSUFBNUIsRUFBOEQ7QUFBQSxNQUE1QmtDLGtCQUE0Qix1RUFBUCxLQUFPO0FBQ2pFLFNBQU8sSUFBSXhELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDcEMsZ0JBQUd1RCxRQUFILENBQVluQyxJQUFaLEVBQWtCLFVBQUNWLEdBQUQsRUFBTUMsSUFBTixFQUFlO0FBQzdCLFVBQUlELEdBQUosRUFBUztBQUNMVixlQUFPVSxHQUFQO0FBQ0E7QUFDSDs7QUFDRCxVQUFNOEMsT0FBTyxnQkFBT0MsVUFBUCxDQUFrQixNQUFsQixDQUFiOztBQUNBRCxXQUFLRSxNQUFMLENBQVkvQyxJQUFaO0FBQ0EsVUFBTWdELGVBQWU7QUFBRUgsY0FBTUEsS0FBS0ksTUFBTCxDQUFZLEtBQVo7QUFBUixPQUFyQjs7QUFDQSxVQUFJTixrQkFBSixFQUF3QjtBQUNwQksscUJBQWFFLFFBQWIsR0FBd0JsRCxLQUFLbUQsUUFBTCxDQUFjLE1BQWQsQ0FBeEI7QUFDSDs7QUFDRC9ELGNBQVE0RCxZQUFSO0FBQ0gsS0FaRDtBQWFILEdBZE0sQ0FBUDtBQWVIO0FBRUQ7Ozs7Ozs7OztBQU9PLFNBQVNJLHVCQUFULENBQWlDQyxXQUFqQyxFQUE4Q0MsT0FBOUMsRUFBK0U7QUFBQSxNQUF4QkMsU0FBd0IsdUVBQVo7QUFBQSxXQUFPZCxHQUFQO0FBQUEsR0FBWTs7QUFDbEYsTUFBTUksT0FBTyxnQkFBT0MsVUFBUCxDQUFrQixNQUFsQixDQUFiOztBQUNBLE1BQU1VLGVBQWVILFlBQVlJLE1BQVosRUFDakI7QUFDQSxZQUFDQyxPQUFELEVBQVVqQixHQUFWO0FBQUEsV0FBbUJpQixXQUFXSixRQUFRQyxVQUFVZCxHQUFWLENBQVIsQ0FBWCxFQUFvQ2lCLE9BQXZEO0FBQUEsR0FGaUIsRUFFZ0QsRUFGaEQsQ0FBckI7QUFJQWIsT0FBS0UsTUFBTCxDQUFZUyxZQUFaO0FBQ0EsU0FBT1gsS0FBS0ksTUFBTCxDQUFZLEtBQVosQ0FBUDtBQUNIO0FBR0Q7Ozs7Ozs7QUFLTyxTQUFTVSxnQkFBVCxDQUEwQnRELEtBQTFCLEVBQWlDdUQsVUFBakMsRUFBNkM7QUFDaEQsTUFBTUMsYUFBYSxFQUFuQjtBQUNBLE1BQU1DLGVBQWUsRUFBckI7QUFDQSxNQUFNQyxXQUFXLEVBQWpCOztBQUVBLFdBQVNDLGNBQVQsQ0FBd0J2RCxJQUF4QixFQUE4QjtBQUMxQixXQUFPLElBQUl0QixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3BDcUQseUJBQW1CakMsSUFBbkIsRUFBeUJBLEtBQUt3RCxRQUFMLENBQWMsS0FBZCxLQUF3QixDQUFDeEQsS0FBS3dELFFBQUwsQ0FBYyxVQUFkLENBQWxELEVBQ0tDLElBREwsQ0FDVSxVQUFDQyxNQUFELEVBQVk7QUFDZCxZQUFJQyxXQUFXM0QsSUFBZjs7QUFDQSxZQUFJbUQsVUFBSixFQUFnQjtBQUNaUSxxQkFBV1IsV0FBV1EsUUFBWCxDQUFYO0FBQ0g7O0FBQ0RQLG1CQUFXTyxRQUFYLElBQXVCRCxPQUFPdEIsSUFBOUI7O0FBQ0EsWUFBSXNCLE9BQU9qQixRQUFYLEVBQXFCO0FBQ2pCWSx1QkFBYU0sUUFBYixJQUF5QkQsT0FBT2pCLFFBQWhDO0FBQ0g7O0FBQ0Q5RDtBQUNILE9BWEwsRUFZS2lGLEtBWkwsQ0FZV2hGLE1BWlg7QUFhSCxLQWRNLENBQVA7QUFlSDs7QUFFRGdCLFFBQU1HLE9BQU4sQ0FBYyxVQUFDQyxJQUFELEVBQVU7QUFDcEJzRCxhQUFTMUMsSUFBVCxDQUFjMkMsZUFBZXZELElBQWYsQ0FBZDtBQUNILEdBRkQ7QUFJQSxTQUFPLElBQUl0QixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3BDRixZQUFRbUYsR0FBUixDQUFZUCxRQUFaLEVBQ0tHLElBREwsQ0FDVSxZQUFNO0FBQ1I5RSxjQUFRO0FBQUVpQixhQUFGO0FBQVN5RCxvQkFBVDtBQUF1QkQ7QUFBdkIsT0FBUjtBQUNILEtBSEwsRUFJS1EsS0FKTCxDQUlXaEYsTUFKWDtBQUtILEdBTk0sQ0FBUDtBQU9IO0FBRUQ7Ozs7Ozs7OztBQU9PLFNBQVNrRix1QkFBVCxDQUFpQzFFLEdBQWpDLEVBQXNDK0QsVUFBdEMsRUFBa0Q7QUFDckQsU0FBTyxJQUFJekUsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNwQ3VDLGdCQUFZL0IsR0FBWixFQUFpQixJQUFqQixFQUNLd0UsS0FETCxDQUNXaEYsTUFEWCxFQUVLNkUsSUFGTCxDQUVVO0FBQUEsYUFBU1AsaUJBQWlCdEQsS0FBakIsRUFBd0J1RCxVQUF4QixDQUFUO0FBQUEsS0FGVixFQUdLUyxLQUhMLENBR1doRixNQUhYLEVBSUs2RSxJQUpMLENBSVUsVUFBQ0MsTUFBRCxFQUFZO0FBQ2Q7QUFDQUEsYUFBT3RCLElBQVAsR0FBY08sd0JBQXdCZSxPQUFPOUQsS0FBL0IsRUFBc0M4RCxPQUFPTixVQUE3QyxFQUF5REQsVUFBekQsQ0FBZDtBQUNBeEUsY0FBUStFLE1BQVI7QUFDSCxLQVJMO0FBU0gsR0FWTSxDQUFQO0FBV0g7QUFFRDs7Ozs7OztBQUtPLFNBQVNLLGFBQVQsQ0FBdUIzRixXQUF2QixFQUFvQztBQUN2QyxNQUFJO0FBQ0EsZ0JBQUc0RixZQUFILENBQWdCNUYsV0FBaEI7O0FBQ0EsV0FBTyxJQUFQO0FBQ0gsR0FIRCxDQUdFLE9BQU9FLENBQVAsRUFBVTtBQUNSLFdBQU8sS0FBUDtBQUNIO0FBQ0o7O2VBR2M7QUFDWDZDLGFBRFc7QUFFWDVDLGVBRlc7QUFHWEosUUFIVztBQUlYZ0IsU0FKVztBQUtYOEMsb0JBTFc7QUFNWFUseUJBTlc7QUFPWE8sa0JBUFc7QUFRWFkseUJBUlc7QUFTWEM7QUFUVyxDIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC1yZXR1cm4gKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcblxuLyoqXG4gKiBFeGlzdHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoVG9DaGVja1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGlzdHMocGF0aFRvQ2hlY2spIHtcbiAgICB0cnkge1xuICAgICAgICBmcy5hY2Nlc3NTeW5jKHBhdGhUb0NoZWNrKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFNpbXBsZSB3cmFwcGVyIGZvciBzaGVsbGpzLnJtIHdpdGggYWRkaXRpb25hbCByZXRyaWVzIGluIGNhc2Ugb2YgZmFpbHVyZS5cbiAqIEl0IGlzIHVzZWZ1bCB3aGVuIHNvbWV0aGluZyBpcyBjb25jdXJyZW50bHkgcmVhZGluZyB0aGUgZGlyIHlvdSB3YW50IHRvIHJlbW92ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJtV2l0aFJldHJpZXMoLi4uYXJncykge1xuICAgIGxldCByZXRyaWVzID0gMDtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiBybSguLi5ybUFyZ3MpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzaGVsbC5ybSguLi5ybUFyZ3MpO1xuICAgICAgICAgICAgICAgIHNoZWxsLmNvbmZpZy5yZXNldCgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXRyaWVzICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJpZXMgPCA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oLi4ucm1BcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaGVsbC5jb25maWcucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBybSguLi5hcmdzKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREaXIoZGlyLCBjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlYWREaXIoZGlyLCAoZXJyLCBkYXRhLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGRhdGEsIHN0YXRzIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IGxpc3QgPSBbXTtcbiAgICBsZXQgYWxsU3RhdHMgPSB7fTtcblxuICAgIGZzLnJlYWRkaXIoZGlyLCAoZXJyLCBmaWxlcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGVuZGluZyA9IGZpbGVzLmxlbmd0aDtcbiAgICAgICAgaWYgKCFwZW5kaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgbGlzdCwgYWxsU3RhdHMpO1xuICAgICAgICB9XG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgICAgICBmcy5zdGF0KGZpbGVQYXRoLCAoX2Vyciwgc3RhdHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoX2Vycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soX2Vycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWREaXIoZmlsZVBhdGgsIChfX2VyciwgcmVzLCBfYWxsU3RhdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfX2Vycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhfX2Vycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ID0gbGlzdC5jb25jYXQocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN0YXRzID0gT2JqZWN0LmFzc2lnbihhbGxTdGF0cywgX2FsbFN0YXRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBsaXN0LCBhbGxTdGF0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGFsbFN0YXRzW2ZpbGVQYXRoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLmJpcnRodGltZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHMuY3RpbWUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLm10aW1lLmdldFRpbWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGxpc3QsIGFsbFN0YXRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZmlsZSBsaXN0IGZyb20gYSBkaXJlY3RvcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyIC0gZGlyIHBhdGhcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc29ydCAtIHdoZXRoZXIgdG8gYXBwbHkgc29ydFxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZUxpc3QoZGlyLCBzb3J0ID0gZmFsc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZWFkRGlyKGRpciwgKGVycm9yLCBmaWxlcykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgICAgICAgIGxldCByZXN1bHRhbnRGaWxlc0xpc3Q7XG5cbiAgICAgICAgICAgIGlmIChzb3J0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyaXBMZW5ndGggPSAoZGlyLnN1YnN0cigwLCAyKSA9PT0gJy4vJykgPyBkaXIubGVuZ3RoIC0gMSA6IGRpci5sZW5ndGggKyAxO1xuICAgICAgICAgICAgICAgIGxldCBwYXRoc1VuaWZpZWQgPSBmaWxlcy5tYXAoKHB0aCA9PiBwdGguc3Vic3RyKHN0cmlwTGVuZ3RoKS5yZXBsYWNlKC9bXFxcXC9dL2dtLCAnLScpKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcG9yYXJ5SW5kZXggPSB7fTtcbiAgICAgICAgICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBvcmFyeUluZGV4W3BhdGhzVW5pZmllZFtpXV0gPSBmaWxlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBhdGhzVW5pZmllZCA9IHBhdGhzVW5pZmllZC5zb3J0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZXNTb3J0ZWQgPSBbXTtcbiAgICAgICAgICAgICAgICBwYXRoc1VuaWZpZWQuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzU29ydGVkLnB1c2godGVtcG9yYXJ5SW5kZXhba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0YW50RmlsZXNMaXN0ID0gZmlsZXNTb3J0ZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdGFudEZpbGVzTGlzdCA9IGZpbGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRhbnRGaWxlc0xpc3QpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGZpbGUncyBoYXNoLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgLSBmaWxlIHBhdGhcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmV0dXJuRmlsZUNvbnRlbnRzIC0gaW5jbHVkZSBmaWxlIGNvbnRlbnRzIGluIHRoZSByZXN1bHRhbnQgb2JqZWN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEFuZEdldEZpbGVIYXNoKGZpbGUsIHJldHVybkZpbGVDb250ZW50cyA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZnMucmVhZEZpbGUoZmlsZSwgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMScpO1xuICAgICAgICAgICAgaGFzaC51cGRhdGUoZGF0YSk7XG4gICAgICAgICAgICBjb25zdCByZXR1cm5PYmplY3QgPSB7IGhhc2g6IGhhc2guZGlnZXN0KCdoZXgnKSB9O1xuICAgICAgICAgICAgaWYgKHJldHVybkZpbGVDb250ZW50cykge1xuICAgICAgICAgICAgICAgIHJldHVybk9iamVjdC5jb250ZW50cyA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUocmV0dXJuT2JqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIGhhc2ggZnJvbSBvYmplY3RzIHZhbHVlcyBpbiBzcGVjaWZpZWQgb3JkZXIuXG4gKiBAcGFyYW0ge0FycmF5fSBvcmRlck9mS2V5c1xuICogQHBhcmFtIHtPYmplY3R9IGhhc2hTZXRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleUZpbHRlclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVIYXNoRm9ySGFzaGVzU2V0KG9yZGVyT2ZLZXlzLCBoYXNoU2V0LCBrZXlGaWx0ZXIgPSBrZXkgPT4ga2V5KSB7XG4gICAgY29uc3QgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGExJyk7XG4gICAgY29uc3QgaGFzaGVzSm9pbmVkID0gb3JkZXJPZktleXMucmVkdWNlKFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ24sbm8tcmV0dXJuLWFzc2lnblxuICAgICAgICAodG1wSGFzaCwga2V5KSA9PiAodG1wSGFzaCArPSBoYXNoU2V0W2tleUZpbHRlcihrZXkpXSwgdG1wSGFzaCksICcnXG4gICAgKTtcbiAgICBoYXNoLnVwZGF0ZShoYXNoZXNKb2luZWQpO1xuICAgIHJldHVybiBoYXNoLmRpZ2VzdCgnaGV4Jyk7XG59XG5cblxuLyoqXG4gKiBSZWFkcyBmaWxlcyBmcm9tIGRpc2sgYW5kIGNvbXB1dGVzIGhhc2hlcyBmb3IgdGhlbS5cbiAqIEBwYXJhbSB7QXJyYXl9IGZpbGVzIC0gYXJyYXkgd2l0aCBmaWxlIHBhdGhzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEFuZEhhc2hGaWxlcyhmaWxlcywgZmlsZUZpbHRlcikge1xuICAgIGNvbnN0IGZpbGVIYXNoZXMgPSB7fTtcbiAgICBjb25zdCBmaWxlQ29udGVudHMgPSB7fTtcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gcmVhZFNpbmdsZUZpbGUoZmlsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVhZEFuZEdldEZpbGVIYXNoKGZpbGUsIGZpbGUuZW5kc1dpdGgoJy5qcycpICYmICFmaWxlLmVuZHNXaXRoKCcudGVzdC5qcycpKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gZmlsZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZUZpbHRlcihmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmlsZUhhc2hlc1tmaWxlTmFtZV0gPSByZXN1bHQuaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5jb250ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUNvbnRlbnRzW2ZpbGVOYW1lXSA9IHJlc3VsdC5jb250ZW50cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJlYWRTaW5nbGVGaWxlKGZpbGUpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBmaWxlcywgZmlsZUNvbnRlbnRzLCBmaWxlSGFzaGVzIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJlYWRzIGZpbGVzIGZyb20gLmRlc2t0b3AgYW5kIGNvbXB1dGVzIGEgdmVyc2lvbiBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgLSBwYXRoXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmaWxlRmlsdGVyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVzQW5kQ29tcHV0ZUhhc2goZGlyLCBmaWxlRmlsdGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZ2V0RmlsZUxpc3QoZGlyLCB0cnVlKVxuICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgICAgIC50aGVuKGZpbGVzID0+IHJlYWRBbmRIYXNoRmlsZXMoZmlsZXMsIGZpbGVGaWx0ZXIpKVxuICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgICAgICAgICAgICByZXN1bHQuaGFzaCA9IGNvbXB1dGVIYXNoRm9ySGFzaGVzU2V0KHJlc3VsdC5maWxlcywgcmVzdWx0LmZpbGVIYXNoZXMsIGZpbGVGaWx0ZXIpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFN5bWxpbmsgZXhpc3RzXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFRvQ2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3ltbGlua0V4aXN0cyhwYXRoVG9DaGVjaykge1xuICAgIHRyeSB7XG4gICAgICAgIGZzLnJlYWRsaW5rU3luYyhwYXRoVG9DaGVjayk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZ2V0RmlsZUxpc3QsXG4gICAgcm1XaXRoUmV0cmllcyxcbiAgICBleGlzdHMsXG4gICAgcmVhZERpcixcbiAgICByZWFkQW5kR2V0RmlsZUhhc2gsXG4gICAgY29tcHV0ZUhhc2hGb3JIYXNoZXNTZXQsXG4gICAgcmVhZEFuZEhhc2hGaWxlcyxcbiAgICByZWFkRmlsZXNBbmRDb21wdXRlSGFzaCxcbiAgICBzeW1saW5rRXhpc3RzXG59O1xuIl19