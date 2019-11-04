"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _assignIn = _interopRequireDefault(require("lodash/assignIn"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _log = _interopRequireDefault(require("./log"));

var _defaultDependencies = _interopRequireDefault(require("./defaultDependencies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var join = _path.default.join;
/**
 * Wrapper around electron-packager.
 * @class
 */

var ElectronPackager =
/*#__PURE__*/
function () {
  function ElectronPackager($) {
    _classCallCheck(this, ElectronPackager);

    this.log = new _log.default('electron-packager');
    this.$ = $;
  }

  _createClass(ElectronPackager, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.$.getDependency('electron-packager', _defaultDependencies.default['electron-packager']).dependency;

              case 2:
                this.packager = _context.sent;

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function init() {
        return _init.apply(this, arguments);
      };
    }()
    /**
     * Runs the packager with provided arguments.
     *
     * @param {Object} args
     * @returns {Promise}
     */

  }, {
    key: "runPackager",
    value: function runPackager(args) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.packager(args, function (err) {
          if (err) {
            reject(err);
          } else {
            _this.log.info(`wrote packaged app to ${_this.$.env.paths.packageDir}`);

            resolve();
          }
        });
      });
    }
  }, {
    key: "packageApp",
    value: function () {
      var _packageApp = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee2() {
        var _this2 = this;

        var _JSON$parse, version, settings, name, arch, args, packagerOptions, extracted;

        return _runtime.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _JSON$parse = JSON.parse(_fs.default.readFileSync(join(this.$.env.paths.meteorApp.root, 'node_modules', 'electron', 'package.json'), 'UTF-8')), version = _JSON$parse.version;
                settings = this.$.desktop.getSettings();
                name = settings.name;

                if (!name) {
                  this.log.error('`name` field in settings.json not set');
                  process.exit(1);
                }

                arch = this.$.env.options.ia32 ? 'ia32' : 'x64';
                this.log.info(`packaging '${name}' for platform '${this.$.env.sys.platform}-${arch}'` + ` using electron v${version}`);
                _context2.prev = 6;
                _context2.next = 9;
                return this.$.utils.rmWithRetries('-rf', _path.default.join(this.$.env.options.output, this.$.env.paths.packageDir));

              case 9:
                _context2.next = 14;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2["catch"](6);
                throw new Error(_context2.t0);

              case 14:
                args = {
                  name,
                  arch,
                  prune: false,
                  electronVersion: version,
                  platform: this.$.env.sys.platform,
                  dir: this.$.env.paths.electronApp.root,
                  out: _path.default.join(this.$.env.options.output, this.$.env.paths.packageDir)
                };

                if ('packagerOptions' in settings) {
                  packagerOptions = settings.packagerOptions;
                  ['windows', 'linux', 'osx'].forEach(function (system) {
                    if (_this2.$.env.os[`is${system[0].toUpperCase()}${system.substring(1)}`] && `_${system}` in packagerOptions) {
                      (0, _assignIn.default)(packagerOptions, packagerOptions[`_${system}`]);
                    }
                  });
                  Object.keys(packagerOptions).forEach(function (field) {
                    if (packagerOptions[field] === '@version') {
                      packagerOptions[field] = settings.version;
                    }
                  });
                  (0, _assignIn.default)(args, packagerOptions);
                } // Move node_modules away. We do not want to delete it, just temporarily remove it from
                // our way.


                _fs.default.renameSync(this.$.env.paths.electronApp.nodeModules, this.$.env.paths.electronApp.tmpNodeModules);

                extracted = false;

                if (this.$.utils.exists(this.$.env.paths.electronApp.extractedNodeModules)) {
                  _fs.default.renameSync(this.$.env.paths.electronApp.extractedNodeModules, this.$.env.paths.electronApp.nodeModules);

                  extracted = true;
                }

                _context2.prev = 19;
                _context2.next = 22;
                return this.runPackager(args);

              case 22:
                _context2.prev = 22;

                if (extracted) {
                  _shelljs.default.rm('-rf', this.$.env.paths.electronApp.extractedNodeModules);

                  _shelljs.default.rm('-rf', this.$.env.paths.electronApp.nodeModules);
                } // Move node_modules back.


                _fs.default.renameSync(this.$.env.paths.electronApp.tmpNodeModules, this.$.env.paths.electronApp.nodeModules);

                return _context2.finish(22);

              case 26:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 11], [19,, 22, 26]]);
      }));

      return function packageApp() {
        return _packageApp.apply(this, arguments);
      };
    }()
  }]);

  return ElectronPackager;
}();

exports.default = ElectronPackager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9wYWNrYWdlci5qcyJdLCJuYW1lcyI6WyJqb2luIiwiRWxlY3Ryb25QYWNrYWdlciIsIiQiLCJsb2ciLCJnZXREZXBlbmRlbmN5IiwiZGVwZW5kZW5jeSIsInBhY2thZ2VyIiwiYXJncyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXJyIiwiaW5mbyIsImVudiIsInBhdGhzIiwicGFja2FnZURpciIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsIm1ldGVvckFwcCIsInJvb3QiLCJ2ZXJzaW9uIiwic2V0dGluZ3MiLCJkZXNrdG9wIiwiZ2V0U2V0dGluZ3MiLCJuYW1lIiwiZXJyb3IiLCJwcm9jZXNzIiwiZXhpdCIsImFyY2giLCJvcHRpb25zIiwiaWEzMiIsInN5cyIsInBsYXRmb3JtIiwidXRpbHMiLCJybVdpdGhSZXRyaWVzIiwib3V0cHV0IiwiRXJyb3IiLCJwcnVuZSIsImVsZWN0cm9uVmVyc2lvbiIsImRpciIsImVsZWN0cm9uQXBwIiwib3V0IiwicGFja2FnZXJPcHRpb25zIiwiZm9yRWFjaCIsInN5c3RlbSIsIm9zIiwidG9VcHBlckNhc2UiLCJzdWJzdHJpbmciLCJPYmplY3QiLCJrZXlzIiwiZmllbGQiLCJyZW5hbWVTeW5jIiwibm9kZU1vZHVsZXMiLCJ0bXBOb2RlTW9kdWxlcyIsImV4dHJhY3RlZCIsImV4aXN0cyIsImV4dHJhY3RlZE5vZGVNb2R1bGVzIiwicnVuUGFja2FnZXIiLCJybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFUUEsSSxpQkFBQUEsSTtBQUVSOzs7OztJQUlxQkMsZ0I7OztBQUNqQiw0QkFBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsU0FBS0MsR0FBTCxHQUFXLGlCQUFRLG1CQUFSLENBQVg7QUFDQSxTQUFLRCxDQUFMLEdBQVNBLENBQVQ7QUFDSDs7Ozs7Ozs7Ozs7Ozt1QkFHeUIsS0FBS0Es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ZTtBQUNYLG1DQUFNSSxFQUFOLENBQVMsS0FBVCxFQUFnQixLQUFLekQsQ0FBTCxDQUFPVyxHQUFQLENBQVdDLEtBQVgsQ0FBaUIyQixXQUFqQixDQUE2QmdCLG9CQUE3Qzs7QUFDQSxtQ0FBTUUsRUFBTixDQUFTLEtBQVQsRUFBZ0IsS0FBS3pELENBQUwsQ0FBT1csR0FBUCxDQUFXQyxLQUFYLENBQWlCMkIsV0FBakIsQ0FBNkJZLFdBQTdDO0FBQ0gsaUIsQ0FDRDs7O0FBQ0EsNEJBQUdELFVBQUgsQ0FDSSxLQUFLbEQsQ0FBTCxDQUFPVyxHQUFQLENBQVdDLEtBQVgsQ0FBaUIyQixXQUFqQixDQUE2QmEsY0FEakMsRUFFSSxLQUFLcEQsQ0FBTCxDQUFPVyxHQUFQLENBQVdDLEtBQVgsQ0FBaUIyQixXQUFqQixDQUE2QlksV0FGakMiLCJmaWxlIjoicGFja2FnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCByZWdlbmVyYXRvclJ1bnRpbWUgZnJvbSAncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJztcbmltcG9ydCBhc3NpZ25JbiBmcm9tICdsb2Rhc2gvYXNzaWduSW4nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBkZWZhdWx0RGVwZW5kZW5jaWVzIGZyb20gJy4vZGVmYXVsdERlcGVuZGVuY2llcyc7XG5cbmNvbnN0IHsgam9pbiB9ID0gcGF0aDtcblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBlbGVjdHJvbi1wYWNrYWdlci5cbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVjdHJvblBhY2thZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZWxlY3Ryb24tcGFja2FnZXInKTtcbiAgICAgICAgdGhpcy4kID0gJDtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0KCkge1xuICAgICAgICB0aGlzLnBhY2thZ2VyID0gYXdhaXQgdGhpcy4kLmdldERlcGVuZGVuY3koJ2VsZWN0cm9uLXBhY2thZ2VyJywgZGVmYXVsdERlcGVuZGVuY2llc1snZWxlY3Ryb24tcGFja2FnZXInXSkuZGVwZW5kZW5jeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHRoZSBwYWNrYWdlciB3aXRoIHByb3ZpZGVkIGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgcnVuUGFja2FnZXIoYXJncykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYWNrYWdlcihhcmdzLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKGB3cm90ZSBwYWNrYWdlZCBhcHAgdG8gJHt0aGlzLiQuZW52LnBhdGhzLnBhY2thZ2VEaXJ9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcGFja2FnZUFwcCgpIHtcbiAgICAgICAgY29uc3QgeyB2ZXJzaW9uIH0gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgIGpvaW4oXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCxcbiAgICAgICAgICAgICAgICAnbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgICAgICAgICAnZWxlY3Ryb24nLFxuICAgICAgICAgICAgICAgICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICApLCAnVVRGLTgnXG4gICAgICAgICkpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgeyBuYW1lIH0gPSBzZXR0aW5ncztcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignYG5hbWVgIGZpZWxkIGluIHNldHRpbmdzLmpzb24gbm90IHNldCcpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXJjaCA9IHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyID8gJ2lhMzInIDogJ3g2NCc7XG5cbiAgICAgICAgdGhpcy5sb2cuaW5mbyhcbiAgICAgICAgICAgIGBwYWNrYWdpbmcgJyR7bmFtZX0nIGZvciBwbGF0Zm9ybSAnJHt0aGlzLiQuZW52LnN5cy5wbGF0Zm9ybX0tJHthcmNofSdgICtcbiAgICAgICAgICAgIGAgdXNpbmcgZWxlY3Ryb24gdiR7dmVyc2lvbn1gXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuJC51dGlscy5ybVdpdGhSZXRyaWVzKFxuICAgICAgICAgICAgICAgICctcmYnLCBwYXRoLmpvaW4odGhpcy4kLmVudi5vcHRpb25zLm91dHB1dCwgdGhpcy4kLmVudi5wYXRocy5wYWNrYWdlRGlyKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBhcmNoLFxuICAgICAgICAgICAgcHJ1bmU6IGZhbHNlLFxuICAgICAgICAgICAgZWxlY3Ryb25WZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgcGxhdGZvcm06IHRoaXMuJC5lbnYuc3lzLnBsYXRmb3JtLFxuICAgICAgICAgICAgZGlyOiB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsXG4gICAgICAgICAgICBvdXQ6IHBhdGguam9pbih0aGlzLiQuZW52Lm9wdGlvbnMub3V0cHV0LCB0aGlzLiQuZW52LnBhdGhzLnBhY2thZ2VEaXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCdwYWNrYWdlck9wdGlvbnMnIGluIHNldHRpbmdzKSB7XG4gICAgICAgICAgICBjb25zdCB7IHBhY2thZ2VyT3B0aW9ucyB9ID0gc2V0dGluZ3M7XG5cbiAgICAgICAgICAgIFsnd2luZG93cycsICdsaW51eCcsICdvc3gnXS5mb3JFYWNoKChzeXN0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYub3NbYGlzJHtzeXN0ZW1bMF0udG9VcHBlckNhc2UoKX0ke3N5c3RlbS5zdWJzdHJpbmcoMSl9YF0gJiZcbiAgICAgICAgICAgICAgICAgICAgKGBfJHtzeXN0ZW19YCkgaW4gcGFja2FnZXJPcHRpb25zXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2lnbkluKHBhY2thZ2VyT3B0aW9ucywgcGFja2FnZXJPcHRpb25zW2BfJHtzeXN0ZW19YF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWNrYWdlck9wdGlvbnMpLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhY2thZ2VyT3B0aW9uc1tmaWVsZF0gPT09ICdAdmVyc2lvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFja2FnZXJPcHRpb25zW2ZpZWxkXSA9IHNldHRpbmdzLnZlcnNpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFzc2lnbkluKGFyZ3MsIHBhY2thZ2VyT3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3ZlIG5vZGVfbW9kdWxlcyBhd2F5LiBXZSBkbyBub3Qgd2FudCB0byBkZWxldGUgaXQsIGp1c3QgdGVtcG9yYXJpbHkgcmVtb3ZlIGl0IGZyb21cbiAgICAgICAgLy8gb3VyIHdheS5cbiAgICAgICAgZnMucmVuYW1lU3luYyhcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMsXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGV4dHJhY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkTm9kZU1vZHVsZXMpKSB7XG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkTm9kZU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGV4dHJhY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5ydW5QYWNrYWdlcihhcmdzKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChleHRyYWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBzaGVsbC5ybSgnLXJmJywgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5leHRyYWN0ZWROb2RlTW9kdWxlcyk7XG4gICAgICAgICAgICAgICAgc2hlbGwucm0oJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTW92ZSBub2RlX21vZHVsZXMgYmFjay5cbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMoXG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlcyxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19