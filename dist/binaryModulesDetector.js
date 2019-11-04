"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _isbinaryfile = _interopRequireDefault(require("isbinaryfile"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_shelljs.default.config.fatal = true;
/**
 * Experimental module for detecting modules containing binary files.
 * Based on the same functionality from electron-builder.
 *
 * @property {MeteorDesktop} $
 * @class
 */

var BinaryModulesDetector =
/*#__PURE__*/
function () {
  /**
   * @constructor
   */
  function BinaryModulesDetector(nodeModulesPath) {
    _classCallCheck(this, BinaryModulesDetector);

    this.log = new _log.default('binaryModulesDetector');
    this.nodeModulesPath = nodeModulesPath;
  } // TODO: make asynchronous


  _createClass(BinaryModulesDetector, [{
    key: "detect",
    value: function detect() {
      var _this = this;

      this.log.verbose('detecting node modules with binary files');

      var files = _shelljs.default.ls('-RAl', this.nodeModulesPath);

      var extract = [];
      files.forEach(function (file) {
        var pathSplit = file.name.split(_path.default.posix.sep);
        var dir = pathSplit[0];
        var filename = pathSplit.pop();

        if (extract.indexOf(dir) === -1 && !BinaryModulesDetector.shouldBeIgnored(dir, filename)) {
          if (file.isFile()) {
            var shouldUnpack = false;

            if (file.name.endsWith('.dll') || file.name.endsWith('.exe') || file.name.endsWith('.dylib')) {
              shouldUnpack = true;
            } else if (_path.default.extname(file.name) === '') {
              shouldUnpack = _isbinaryfile.default.sync(_path.default.join(_this.nodeModulesPath, file.name));
            }

            if (shouldUnpack) {
              _this.log.debug(`binary file: ${file.name}`);

              extract.push(dir);
            }
          }
        }
      });

      if (extract.length > 0) {
        this.log.verbose(`detected modules to be extracted: ${extract.join(', ')}`);
      }

      return extract;
    }
  }], [{
    key: "shouldBeIgnored",
    value: function shouldBeIgnored(dir, filename) {
      return dir === '.bin' || filename === '.DS_Store' || filename === 'LICENSE' || filename === 'README';
    }
  }]);

  return BinaryModulesDetector;
}();

exports.default = BinaryModulesDetector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9iaW5hcnlNb2R1bGVzRGV0ZWN0b3IuanMiXSwibmFtZXMiOlsiY29uZmlnIiwiZmF0YWwiLCJCaW5hcnlNb2R1bGVzRGV0ZWN0b3IiLCJub2RlTW9kdWxlc1BhdGgiLCJsb2ciLCJ2ZXJib3NlIiwiZmlsZXMiLCJscyIsImV4dHJhY3QiLCJmb3JFYWNoIiwiZmlsZSIsInBhdGhTcGxpdCIsIm5hbWUiLCJzcGxpdCIsInBvc2l4Iiwic2VwIiwiZGlyIiwiZmlsZW5hbWUiLCJwb3AiLCJpbmRleE9mIiwic2hvdWxkQmVJZ25vcmVkIiwiaXNGaWxlIiwic2hvdWxkVW5wYWNrIiwiZW5kc1dpdGgiLCJleHRuYW1lIiwic3luYyIsImpvaW4iLCJkZWJ1ZyIsInB1c2giLCJsZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQUVBLGlCQUFNQSxNQUFOLENBQWFDLEtBQWIsR0FBcUIsSUFBckI7QUFDQTs7Ozs7Ozs7SUFPcUJDLHFCOzs7QUFDakI7OztBQUdBLGlDQUFZQyxlQUFaLEVBQTZCO0FBQUE7O0FBQ3pCLFNBQUtDLEdBQUwsR0FBVyxpQkFBUSx1QkFBUixDQUFYO0FBQ0EsU0FBS0QsZUFBTCxHQUF1QkEsZUFBdkI7QUFDSCxHLENBRUQ7Ozs7OzZCQUNTO0FBQUE7O0FBQ0wsV0FBS0MsR0FBTCxDQUFTQyxPQUFULENBQWlCLDBDQUFqQjs7QUFDQSxVQUFNQyxRQUFRLGlCQUFNQyxFQUFOLENBQVMsTUFBVCxFQUFpQixLQUFLSixlQUF0QixDQUFkOztBQUVBLFVBQU1LLFVBQVUsRUFBaEI7QUFFQUYsWUFBTUcsT0FBTixDQUFjLFVBQUNDLElBQUQsRUFBVTtBQUNwQixZQUFNQyxZQUFZRCxLQUFLRSxJQUFMLENBQVVDLEtBQVYsQ0FBZ0IsY0FBS0MsS0FBTCxDQUFXQyxHQUEzQixDQUFsQjtBQUNBLFlBQU1DLE1BQU1MLFVBQVUsQ0FBVixDQUFaO0FBQ0EsWUFBTU0sV0FBV04sVUFBVU8sR0FBVixFQUFqQjs7QUFFQSxZQUFJVixRQUFRVyxPQUFSLENBQWdCSCxHQUFoQixNQUF5QixDQUFDLENBQTFCLElBQ0EsQ0FBQ2Qsc0JBQXNCa0IsZUFBdEIsQ0FBc0NKLEdBQXRDLEVBQTJDQyxRQUEzQyxDQURMLEVBRUU7QUFDRSxjQUFJUCxLQUFLVyxNQUFMLEVBQUosRUFBbUI7QUFDZixnQkFBSUMsZUFBZSxLQUFuQjs7QUFDQSxnQkFBSVosS0FBS0UsSUFBTCxDQUFVVyxRQUFWLENBQW1CLE1BQW5CLEtBQThCYixLQUFLRSxJQUFMLENBQVVXLFFBQVYsQ0FBbUIsTUFBbkIsQ0FBOUIsSUFBNERiLEtBQUtFLElBQUwsQ0FBVVcsUUFBVixDQUFtQixRQUFuQixDQUFoRSxFQUE4RjtBQUMxRkQsNkJBQWUsSUFBZjtBQUNILGFBRkQsTUFFTyxJQUFJLGNBQUtFLE9BQUwsQ0FBYWQsS0FBS0UsSUFBbEIsTUFBNEIsRUFBaEMsRUFBb0M7QUFDdkNVLDZCQUNJLHNCQUFhRyxJQUFiLENBQWtCLGNBQUtDLElBQUwsQ0FBVSxNQUFLdkIsZUFBZixFQUFnQ08sS0FBS0UsSUFBckMsQ0FBbEIsQ0FESjtBQUVIOztBQUNELGdCQUFJVSxZQUFKLEVBQWtCO0FBQ2Qsb0JBQUtsQixHQUFMLENBQVN1QixLQUFULENBQWdCLGdCQUFlakIsS0FBS0UsSUFBSyxFQUF6Qzs7QUFDQUosc0JBQVFvQixJQUFSLENBQWFaLEdBQWI7QUFDSDtBQUNKO0FBQ0o7QUFDSixPQXRCRDs7QUF1QkEsVUFBSVIsUUFBUXFCLE1BQVIsR0FBaUIsQ0FBckIsRUFBd0I7QUFDcEIsYUFBS3pCLEdBQUwsQ0FBU0MsT0FBVCxDQUFrQixxQ0FBb0NHLFFBQVFrQixJQUFSLENBQWEsSUFBYixDQUFtQixFQUF6RTtBQUNIOztBQUNELGFBQU9sQixPQUFQO0FBQ0g7OztvQ0FFc0JRLEcsRUFBS0MsUSxFQUFVO0FBQ2xDLGFBQU9ELFFBQVEsTUFBUixJQUFrQkMsYUFBYSxXQUEvQixJQUE4Q0EsYUFBYSxTQUEzRCxJQUF3RUEsYUFBYSxRQUE1RjtBQUNIIiwiZmlsZSI6ImJpbmFyeU1vZHVsZXNEZXRlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGlzQmluYXJ5RmlsZSBmcm9tICdpc2JpbmFyeWZpbGUnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcbi8qKlxuICogRXhwZXJpbWVudGFsIG1vZHVsZSBmb3IgZGV0ZWN0aW5nIG1vZHVsZXMgY29udGFpbmluZyBiaW5hcnkgZmlsZXMuXG4gKiBCYXNlZCBvbiB0aGUgc2FtZSBmdW5jdGlvbmFsaXR5IGZyb20gZWxlY3Ryb24tYnVpbGRlci5cbiAqXG4gKiBAcHJvcGVydHkge01ldGVvckRlc2t0b3B9ICRcbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCaW5hcnlNb2R1bGVzRGV0ZWN0b3Ige1xuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5vZGVNb2R1bGVzUGF0aCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2JpbmFyeU1vZHVsZXNEZXRlY3RvcicpO1xuICAgICAgICB0aGlzLm5vZGVNb2R1bGVzUGF0aCA9IG5vZGVNb2R1bGVzUGF0aDtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBtYWtlIGFzeW5jaHJvbm91c1xuICAgIGRldGVjdCgpIHtcbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnZGV0ZWN0aW5nIG5vZGUgbW9kdWxlcyB3aXRoIGJpbmFyeSBmaWxlcycpO1xuICAgICAgICBjb25zdCBmaWxlcyA9IHNoZWxsLmxzKCctUkFsJywgdGhpcy5ub2RlTW9kdWxlc1BhdGgpO1xuXG4gICAgICAgIGNvbnN0IGV4dHJhY3QgPSBbXTtcblxuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXRoU3BsaXQgPSBmaWxlLm5hbWUuc3BsaXQocGF0aC5wb3NpeC5zZXApO1xuICAgICAgICAgICAgY29uc3QgZGlyID0gcGF0aFNwbGl0WzBdO1xuICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoU3BsaXQucG9wKCk7XG5cbiAgICAgICAgICAgIGlmIChleHRyYWN0LmluZGV4T2YoZGlyKSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICAhQmluYXJ5TW9kdWxlc0RldGVjdG9yLnNob3VsZEJlSWdub3JlZChkaXIsIGZpbGVuYW1lKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGUuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNob3VsZFVucGFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5uYW1lLmVuZHNXaXRoKCcuZGxsJykgfHwgZmlsZS5uYW1lLmVuZHNXaXRoKCcuZXhlJykgfHwgZmlsZS5uYW1lLmVuZHNXaXRoKCcuZHlsaWInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkVW5wYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZS5uYW1lKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFVucGFjayA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNCaW5hcnlGaWxlLnN5bmMocGF0aC5qb2luKHRoaXMubm9kZU1vZHVsZXNQYXRoLCBmaWxlLm5hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkVW5wYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhgYmluYXJ5IGZpbGU6ICR7ZmlsZS5uYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdC5wdXNoKGRpcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZXh0cmFjdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBkZXRlY3RlZCBtb2R1bGVzIHRvIGJlIGV4dHJhY3RlZDogJHtleHRyYWN0LmpvaW4oJywgJyl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4dHJhY3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIHNob3VsZEJlSWdub3JlZChkaXIsIGZpbGVuYW1lKSB7XG4gICAgICAgIHJldHVybiBkaXIgPT09ICcuYmluJyB8fCBmaWxlbmFtZSA9PT0gJy5EU19TdG9yZScgfHwgZmlsZW5hbWUgPT09ICdMSUNFTlNFJyB8fCBmaWxlbmFtZSA9PT0gJ1JFQURNRSc7XG4gICAgfVxufVxuIl19