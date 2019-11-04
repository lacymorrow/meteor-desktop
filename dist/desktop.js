"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_shelljs.default.config.fatal = true;
/**
 * Checks if the path is empty.
 * @param {string} searchPath
 * @returns {boolean}
 */

function isEmptySync(searchPath) {
  var stat;

  try {
    stat = _fs.default.statSync(searchPath);
  } catch (e) {
    return true;
  }

  if (stat.isDirectory()) {
    var items = _fs.default.readdirSync(searchPath);

    return !items || !items.length;
  }

  return false;
}
/**
 * Represents the .desktop directory.
 * @class
 * @property {desktopSettings} settings
 */


var Desktop =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   *
   * @constructor
   */
  function Desktop($) {
    _classCallCheck(this, Desktop);

    this.$ = $;
    this.log = new _log.default('desktop');
    this.settings = null;
    this.dependencies = null;
  }
  /**
   * Tries to read and returns settings.json contents from .desktop dir.
   *
   * @returns {desktopSettings|null}
   */


  _createClass(Desktop, [{
    key: "getSettings",
    value: function getSettings() {
      if (!this.settings) {
        try {
          this.settings = JSON.parse(_fs.default.readFileSync(this.$.env.paths.desktop.settings, 'UTF-8'));
        } catch (e) {
          this.log.error('error while trying to read \'.desktop/settings.json\': ', e);
          process.exit(1);
        }
      }

      return this.settings;
    }
    /**
     * Returns a version hash representing current .desktop contents.
     * @returns {string}
     */

  }, {
    key: "getHashVersion",
    value: function () {
      var _getHashVersion = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        var version;
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.log.info('calculating hash version from .desktop contents');
                _context.next = 3;
                return this.$.utils.readFilesAndComputeHash(this.$.env.paths.desktop.root);

              case 3:
                version = _context.sent;
                this.log.verbose(`calculated .desktop hash version is ${version.hash}`);
                return _context.abrupt("return", version.hash);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function getHashVersion() {
        return _getHashVersion.apply(this, arguments);
      };
    }()
    /**
     * Tries to read a module.json file from a module at provided path.
     *
     * @param {string} modulePath - path to the module dir
     * @returns {Object}
     */

  }, {
    key: "getModuleConfig",
    value: function getModuleConfig(modulePath) {
      var moduleConfig = {};

      try {
        moduleConfig = JSON.parse(_fs.default.readFileSync(_path.default.join(modulePath, 'module.json'), 'UTF-8'));
      } catch (e) {
        this.log.error(`error while trying to read 'module.json' from '${modulePath}' module: `, e);
        process.exit(1);
      }

      if (!('name' in moduleConfig)) {
        this.log.error(`no 'name' field defined in 'module.json' in '${modulePath}' module.`);
        process.exit(1);
      }

      return moduleConfig;
    }
    /**
     * Scans all modules for module.json and gathers this configuration altogether.
     *
     * @returns {[]}
     */

  }, {
    key: "gatherModuleConfigs",
    value: function gatherModuleConfigs() {
      var _this = this;

      var configs = [];

      if (!isEmptySync(this.$.env.paths.desktop.modules)) {
        _shelljs.default.ls('-d', _path.default.join(this.$.env.paths.desktop.modules, '*')).forEach(function (module) {
          if (_fs.default.lstatSync(module).isDirectory()) {
            var moduleConfig = _this.getModuleConfig(module);

            moduleConfig.dirName = _path.default.parse(module).name;
            configs.push(moduleConfig);
          }
        });
      }

      return configs;
    }
    /**
     * Summarizes all dependencies defined in .desktop.
     *
     * @params {Object} settings      - settings.json
     * @params {boolean} checkModules - whether to gather modules dependencies
     * @params {boolean} refresh      - recompute
     * @returns {{fromSettings: {}, plugins: {}, modules: {}}}
     */

  }, {
    key: "getDependencies",
    value: function getDependencies() {
      var _this2 = this;

      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var checkModules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var refresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!refresh && this.dependencies) {
        return this.dependencies;
      }

      var dependencies = {
        fromSettings: {},
        plugins: {},
        modules: {}
      };
      /** @type {desktopSettings} * */

      var settingsJson = settings || this.getSettings(); // Settings can have a 'dependencies' field.

      if ('dependencies' in settingsJson) {
        dependencies.fromSettings = settingsJson.dependencies;
      } // Plugins are also a npm packages.


      if ('plugins' in settingsJson) {
        dependencies.plugins = Object.keys(settingsJson.plugins).reduce(function (plugins, plugin) {
          /* eslint-disable no-param-reassign */
          if (typeof settingsJson.plugins[plugin] === 'object') {
            plugins[plugin] = settingsJson.plugins[plugin].version;
          } else {
            plugins[plugin] = settingsJson.plugins[plugin];
          }

          return plugins;
        }, {});
      } // Each module can have its own dependencies defined.


      var moduleDependencies = {};

      if (checkModules) {
        var configs = this.gatherModuleConfigs();
        configs.forEach(function (moduleConfig) {
          if (!('dependencies' in moduleConfig)) {
            moduleConfig.dependencies = {};
          }

          if (moduleConfig.name in moduleDependencies) {
            _this2.log.error(`duplicate name '${moduleConfig.name}' in 'module.json' in ` + `'${moduleConfig.dirName}' - another module already registered the same name.`);

            process.exit(1);
          }

          moduleDependencies[moduleConfig.name] = moduleConfig.dependencies;
        });
      }

      dependencies.modules = moduleDependencies;
      this.dependencies = dependencies;
      return dependencies;
    }
    /**
     * Copies the .desktop scaffold into the meteor app dir.
     * Adds entry to .meteor/.gitignore.
     */

  }, {
    key: "scaffold",
    value: function scaffold() {
      this.log.info('creating .desktop scaffold in your project');

      if (this.$.utils.exists(this.$.env.paths.desktop.root)) {
        this.log.warn('.desktop already exists - delete it if you want a new one to be ' + 'created');
        return;
      }

      _shelljs.default.cp('-r', this.$.env.paths.scaffold, this.$.env.paths.desktop.root);

      _shelljs.default.mkdir(this.$.env.paths.desktop.import);

      this.log.info('.desktop directory prepared');
    }
    /**
     * Verifies if all mandatory files are present in the .desktop.
     *
     * @returns {boolean}
     */

  }, {
    key: "check",
    value: function check() {
      this.log.verbose('checking .desktop existence');
      return !!(this.$.utils.exists(this.$.env.paths.desktop.root) && this.$.utils.exists(this.$.env.paths.desktop.settings) && this.$.utils.exists(this.$.env.paths.desktop.desktop));
    }
  }]);

  return Desktop;
}();
/**
 * @typedef {Object} desktopSettings
 * @property {string} name
 * @property {string} projectName
 * @property {boolean} devTools
 * @property {boolean} devtron
 * @property {boolean} desktopHCP
 * @property {Object} squirrel
 * @property {string} squirrel.autoUpdateFeedUrl
 * @property {Object} squirrel.autoUpdateFeedHeaders
 * @property {Object} squirrel.autoUpdateCheckOnStart
 * @property {Object} desktopHCPSettings
 * @property {boolean} desktopHCPSettings.ignoreCompatibilityVersion
 * @property {boolean} desktopHCPSettings.blockAppUpdateOnDesktopIncompatibility
 * @property {number} webAppStartupTimeout
 * @property {Array} linkPackages
 * @property {Array} exposedModules
 * @property {Object} window
 * @property {Object} windowDev
 * @property {Object} packageJsonFields
 * @property {Object} builderOptions
 * @property {Object} builderCliOptions
 * @property {Object} packagerOptions
 * @property {Object} plugins
 * @property {Object} dependencies
 * @property {boolean} uglify
 * @property {string} version
 * */


exports.default = Desktop;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9kZXNrdG9wLmpzIl0sIm5hbWVzIjpbImNvbmZpZyIsImZhdGFsIiwiaXNFbXB0eVN5bmMiLCJzZWFyY2hQYXRoIiwic3RhdCIsInN0YXRTeW5jIiwiZSIsImlzRGlyZWN0b3J5IiwiaXRlbXMiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIkRlc2t0b3AiLCIkIiwibG9nIiwic2V0dGluZ3MiLCJkZXBlbmRlbmNpZXMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlbnYiLCJwYXRocyIsImRlc2t0b3AiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiaW5mbyIsInV0aWxzIiwicmVhZEZpbGVzQW5kQ29tcHV0ZUhhc2giLCJyb290IiwidmVyc2lvbiIsInZlcmJvc2UiLCJoYXNoIiwibW9kdWxlUGF0aCIsIm1vZHVsZUNvbmZpZyIsImpvaW4iLCJjb25maWdzIiwibW9kdWxlcyIsImxzIiwiZm9yRWFjaCIsIm1vZHVsZSIsImxzdGF0U3luYyIsImdldE1vZHVsZUNvbmZpZyIsImRpck5hbWUiLCJuYW1lIiwicHVzaCIsImNoZWNrTW9kdWxlcyIsInJlZnJlc2giLCJmcm9tU2V0dGluZ3MiLCJwbHVnaW5zIiwic2V0dGluZ3NKc29uIiwiZ2V0U2V0dGluZ3MiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwicGx1Z2luIiwibW9kdWxlRGVwZW5kZW5jaWVzIiwiZ2F0aGVyTW9kdWxlQ29uZmlncyIsImV4aXN0cyIsIndhcm4iLCJjcCIsInNjYWZmb2xkIiwibWtkaXIiLCJpbXBvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FBRUEsaUJBQU1BLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjtBQUVBOzs7Ozs7QUFLQSxTQUFTQyxXQUFULENBQXFCQyxVQUFyQixFQUFpQztBQUM3QixNQUFJQyxJQUFKOztBQUNBLE1BQUk7QUFDQUEsV0FBTyxZQUFHQyxRQUFILENB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QkFBTUMsRUFBTixDQUFTLElBQVQsRUFBZSxLQUFLL0MsQ0FBTCxDQUFPTyxHQUFQLENBQVdDLEtBQVgsQ0FBaUJ3QyxRQUFoQyxFQUEwQyxLQUFLaEQsQ0FBTCxDQUFPTyxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCTyxJQUFuRTs7QUFDQSx1QkFBTWlDLEtBQU4sQ0FBWSxLQUFLakQsQ0FBTCxDQUFPTyxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCeUMsTUFBckM7O0FBQ0EsV0FBS2pELEdBQUwsQ0FBU1ksSUFBVCxDQUFjLDZCQUFkO0FBQ0g7QUFFRDs7Ozs7Ozs7NEJBS1E7QUFDSixXQUFLWixHQUFMLENBQVNpQixPQUFULENBQWlCLDZCQUFqQjtBQUNBLGFBQU8sQ0FBQyxFQUFFLEtBQUtsQixDQUFMLENBQU9jLEtBQVAsQ0FBYStCLE1BQWIsQ0FBb0IsS0FBSzdDLENBQUwsQ0FBT08sR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5Qk8sSUFBN0MsS0FDTixLQUFLaEIsQ0FBTCxDQUFPYyxLQUFQLENBQWErQixNQUFiLENBQW9CLEtBQUs3QyxDQUFMLENBQU9PLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsT0FBakIsQ0FBeUJQLFFBQTdDLENBRE0sSUFFTixLQUFLRixDQUFMLENBQU9jLEtBQVAsQ0FBYStCLE1BQWIsQ0FBb0IsS0FBSzdDLENBQUwsQ0FBT08sR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5QkEsT0FBN0MsQ0FGSSxDQUFSO0FBR0g7Ozs7O0FBR0wiLCJmaWxlIjoiZGVza3RvcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHJlZ2VuZXJhdG9yUnVudGltZSBmcm9tICdyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIHBhdGggaXMgZW1wdHkuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoUGF0aFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlTeW5jKHNlYXJjaFBhdGgpIHtcbiAgICBsZXQgc3RhdDtcbiAgICB0cnkge1xuICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMoc2VhcmNoUGF0aCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGZzLnJlYWRkaXJTeW5jKHNlYXJjaFBhdGgpO1xuICAgICAgICByZXR1cm4gIWl0ZW1zIHx8ICFpdGVtcy5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSAuZGVza3RvcCBkaXJlY3RvcnkuXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7ZGVza3RvcFNldHRpbmdzfSBzZXR0aW5nc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNrdG9wIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgLSBjb250ZXh0XG4gICAgICpcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMuJCA9ICQ7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZGVza3RvcCcpO1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIHJlYWQgYW5kIHJldHVybnMgc2V0dGluZ3MuanNvbiBjb250ZW50cyBmcm9tIC5kZXNrdG9wIGRpci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtkZXNrdG9wU2V0dGluZ3N8bnVsbH1cbiAgICAgKi9cbiAgICBnZXRTZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLnNldHRpbmdzLCAnVVRGLTgnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHRyeWluZyB0byByZWFkIFxcJy5kZXNrdG9wL3NldHRpbmdzLmpzb25cXCc6ICcsIGUpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgdmVyc2lvbiBoYXNoIHJlcHJlc2VudGluZyBjdXJyZW50IC5kZXNrdG9wIGNvbnRlbnRzLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgYXN5bmMgZ2V0SGFzaFZlcnNpb24oKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2NhbGN1bGF0aW5nIGhhc2ggdmVyc2lvbiBmcm9tIC5kZXNrdG9wIGNvbnRlbnRzJyk7XG5cbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IHRoaXMuJC51dGlscy5yZWFkRmlsZXNBbmRDb21wdXRlSGFzaCh0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3Aucm9vdCk7XG5cbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZShgY2FsY3VsYXRlZCAuZGVza3RvcCBoYXNoIHZlcnNpb24gaXMgJHt2ZXJzaW9uLmhhc2h9YCk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uLmhhc2g7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gcmVhZCBhIG1vZHVsZS5qc29uIGZpbGUgZnJvbSBhIG1vZHVsZSBhdCBwcm92aWRlZCBwYXRoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZHVsZVBhdGggLSBwYXRoIHRvIHRoZSBtb2R1bGUgZGlyXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRNb2R1bGVDb25maWcobW9kdWxlUGF0aCkge1xuICAgICAgICBsZXQgbW9kdWxlQ29uZmlnID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb2R1bGVDb25maWcgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4obW9kdWxlUGF0aCwgJ21vZHVsZS5qc29uJyksICdVVEYtOCcpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICBgZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIHJlYWQgJ21vZHVsZS5qc29uJyBmcm9tICcke21vZHVsZVBhdGh9JyBtb2R1bGU6IGAsXG4gICAgICAgICAgICAgICAgZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISgnbmFtZScgaW4gbW9kdWxlQ29uZmlnKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYG5vICduYW1lJyBmaWVsZCBkZWZpbmVkIGluICdtb2R1bGUuanNvbicgaW4gJyR7bW9kdWxlUGF0aH0nIG1vZHVsZS5gKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kdWxlQ29uZmlnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNjYW5zIGFsbCBtb2R1bGVzIGZvciBtb2R1bGUuanNvbiBhbmQgZ2F0aGVycyB0aGlzIGNvbmZpZ3VyYXRpb24gYWx0b2dldGhlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtbXX1cbiAgICAgKi9cbiAgICBnYXRoZXJNb2R1bGVDb25maWdzKCkge1xuICAgICAgICBjb25zdCBjb25maWdzID0gW107XG5cbiAgICAgICAgaWYgKCFpc0VtcHR5U3luYyh0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3AubW9kdWxlcykpIHtcbiAgICAgICAgICAgIHNoZWxsLmxzKCctZCcsIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3AubW9kdWxlcywgJyonKSkuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAobW9kdWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmcy5sc3RhdFN5bmMobW9kdWxlKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVDb25maWcgPSB0aGlzLmdldE1vZHVsZUNvbmZpZyhtb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlQ29uZmlnLmRpck5hbWUgPSBwYXRoLnBhcnNlKG1vZHVsZSkubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MucHVzaChtb2R1bGVDb25maWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdW1tYXJpemVzIGFsbCBkZXBlbmRlbmNpZXMgZGVmaW5lZCBpbiAuZGVza3RvcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbXMge09iamVjdH0gc2V0dGluZ3MgICAgICAtIHNldHRpbmdzLmpzb25cbiAgICAgKiBAcGFyYW1zIHtib29sZWFufSBjaGVja01vZHVsZXMgLSB3aGV0aGVyIHRvIGdhdGhlciBtb2R1bGVzIGRlcGVuZGVuY2llc1xuICAgICAqIEBwYXJhbXMge2Jvb2xlYW59IHJlZnJlc2ggICAgICAtIHJlY29tcHV0ZVxuICAgICAqIEByZXR1cm5zIHt7ZnJvbVNldHRpbmdzOiB7fSwgcGx1Z2luczoge30sIG1vZHVsZXM6IHt9fX1cbiAgICAgKi9cbiAgICBnZXREZXBlbmRlbmNpZXMoc2V0dGluZ3MgPSBudWxsLCBjaGVja01vZHVsZXMgPSB0cnVlLCByZWZyZXNoID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFyZWZyZXNoICYmIHRoaXMuZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSB7XG4gICAgICAgICAgICBmcm9tU2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgcGx1Z2luczoge30sXG4gICAgICAgICAgICBtb2R1bGVzOiB7fVxuICAgICAgICB9O1xuICAgICAgICAvKiogQHR5cGUge2Rlc2t0b3BTZXR0aW5nc30gKiAqL1xuICAgICAgICBjb25zdCBzZXR0aW5nc0pzb24gPSBzZXR0aW5ncyB8fCB0aGlzLmdldFNldHRpbmdzKCk7XG5cbiAgICAgICAgLy8gU2V0dGluZ3MgY2FuIGhhdmUgYSAnZGVwZW5kZW5jaWVzJyBmaWVsZC5cbiAgICAgICAgaWYgKCdkZXBlbmRlbmNpZXMnIGluIHNldHRpbmdzSnNvbikge1xuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLmZyb21TZXR0aW5ncyA9IHNldHRpbmdzSnNvbi5kZXBlbmRlbmNpZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQbHVnaW5zIGFyZSBhbHNvIGEgbnBtIHBhY2thZ2VzLlxuICAgICAgICBpZiAoJ3BsdWdpbnMnIGluIHNldHRpbmdzSnNvbikge1xuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLnBsdWdpbnMgPSBPYmplY3Qua2V5cyhzZXR0aW5nc0pzb24ucGx1Z2lucykucmVkdWNlKChwbHVnaW5zLCBwbHVnaW4pID0+IHtcbiAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3NKc29uLnBsdWdpbnNbcGx1Z2luXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luc1twbHVnaW5dID0gc2V0dGluZ3NKc29uLnBsdWdpbnNbcGx1Z2luXS52ZXJzaW9uO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IHNldHRpbmdzSnNvbi5wbHVnaW5zW3BsdWdpbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICAgICAgICAgfSwge30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRWFjaCBtb2R1bGUgY2FuIGhhdmUgaXRzIG93biBkZXBlbmRlbmNpZXMgZGVmaW5lZC5cbiAgICAgICAgY29uc3QgbW9kdWxlRGVwZW5kZW5jaWVzID0ge307XG4gICAgICAgIGlmIChjaGVja01vZHVsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLmdhdGhlck1vZHVsZUNvbmZpZ3MoKTtcblxuICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKFxuICAgICAgICAgICAgICAgIChtb2R1bGVDb25maWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoJ2RlcGVuZGVuY2llcycgaW4gbW9kdWxlQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlQ29uZmlnLmRlcGVuZGVuY2llcyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVDb25maWcubmFtZSBpbiBtb2R1bGVEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBkdXBsaWNhdGUgbmFtZSAnJHttb2R1bGVDb25maWcubmFtZX0nIGluICdtb2R1bGUuanNvbicgaW4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCcke21vZHVsZUNvbmZpZy5kaXJOYW1lfScgLSBhbm90aGVyIG1vZHVsZSBhbHJlYWR5IHJlZ2lzdGVyZWQgdGhlIHNhbWUgbmFtZS5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVEZXBlbmRlbmNpZXNbbW9kdWxlQ29uZmlnLm5hbWVdID0gbW9kdWxlQ29uZmlnLmRlcGVuZGVuY2llcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVwZW5kZW5jaWVzLm1vZHVsZXMgPSBtb2R1bGVEZXBlbmRlbmNpZXM7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzO1xuICAgICAgICByZXR1cm4gZGVwZW5kZW5jaWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGUgLmRlc2t0b3Agc2NhZmZvbGQgaW50byB0aGUgbWV0ZW9yIGFwcCBkaXIuXG4gICAgICogQWRkcyBlbnRyeSB0byAubWV0ZW9yLy5naXRpZ25vcmUuXG4gICAgICovXG4gICAgc2NhZmZvbGQoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2NyZWF0aW5nIC5kZXNrdG9wIHNjYWZmb2xkIGluIHlvdXIgcHJvamVjdCcpO1xuXG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5yb290KSkge1xuICAgICAgICAgICAgdGhpcy5sb2cud2FybignLmRlc2t0b3AgYWxyZWFkeSBleGlzdHMgLSBkZWxldGUgaXQgaWYgeW91IHdhbnQgYSBuZXcgb25lIHRvIGJlICcgK1xuICAgICAgICAgICAgICAgICdjcmVhdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzaGVsbC5jcCgnLXInLCB0aGlzLiQuZW52LnBhdGhzLnNjYWZmb2xkLCB0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3Aucm9vdCk7XG4gICAgICAgIHNoZWxsLm1rZGlyKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5pbXBvcnQpO1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCcuZGVza3RvcCBkaXJlY3RvcnkgcHJlcGFyZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWZXJpZmllcyBpZiBhbGwgbWFuZGF0b3J5IGZpbGVzIGFyZSBwcmVzZW50IGluIHRoZSAuZGVza3RvcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGNoZWNrKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjaGVja2luZyAuZGVza3RvcCBleGlzdGVuY2UnKTtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLnJvb3QpICYmXG4gICAgICAgICAgICB0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcC5zZXR0aW5ncykgJiZcbiAgICAgICAgICAgIHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLmRlc2t0b3ApKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gZGVza3RvcFNldHRpbmdzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByb2plY3ROYW1lXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRldlRvb2xzXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRldnRyb25cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gZGVza3RvcEhDUFxuICogQHByb3BlcnR5IHtPYmplY3R9IHNxdWlycmVsXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3F1aXJyZWwuYXV0b1VwZGF0ZUZlZWRVcmxcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBzcXVpcnJlbC5hdXRvVXBkYXRlRmVlZEhlYWRlcnNcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBzcXVpcnJlbC5hdXRvVXBkYXRlQ2hlY2tPblN0YXJ0XG4gKiBAcHJvcGVydHkge09iamVjdH0gZGVza3RvcEhDUFNldHRpbmdzXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGRlc2t0b3BIQ1BTZXR0aW5ncy5pZ25vcmVDb21wYXRpYmlsaXR5VmVyc2lvblxuICogQHByb3BlcnR5IHtib29sZWFufSBkZXNrdG9wSENQU2V0dGluZ3MuYmxvY2tBcHBVcGRhdGVPbkRlc2t0b3BJbmNvbXBhdGliaWxpdHlcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3ZWJBcHBTdGFydHVwVGltZW91dFxuICogQHByb3BlcnR5IHtBcnJheX0gbGlua1BhY2thZ2VzXG4gKiBAcHJvcGVydHkge0FycmF5fSBleHBvc2VkTW9kdWxlc1xuICogQHByb3BlcnR5IHtPYmplY3R9IHdpbmRvd1xuICogQHByb3BlcnR5IHtPYmplY3R9IHdpbmRvd0RldlxuICogQHByb3BlcnR5IHtPYmplY3R9IHBhY2thZ2VKc29uRmllbGRzXG4gKiBAcHJvcGVydHkge09iamVjdH0gYnVpbGRlck9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBidWlsZGVyQ2xpT3B0aW9uc1xuICogQHByb3BlcnR5IHtPYmplY3R9IHBhY2thZ2VyT3B0aW9uc1xuICogQHByb3BlcnR5IHtPYmplY3R9IHBsdWdpbnNcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkZXBlbmRlbmNpZXNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdWdsaWZ5XG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmVyc2lvblxuICogKi9cbiJdfQ==