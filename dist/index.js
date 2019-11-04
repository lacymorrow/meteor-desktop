"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _exports;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _env = _interopRequireDefault(require("./env"));

var _electron = _interopRequireDefault(require("./electron"));

var _log = _interopRequireDefault(require("./log"));

var _desktop = _interopRequireDefault(require("./desktop"));

var _electronApp = _interopRequireDefault(require("./electronApp"));

var _meteorApp = _interopRequireDefault(require("./meteorApp"));

var _electronBuilder = _interopRequireDefault(require("./electronBuilder"));

var _packager = _interopRequireDefault(require("./packager"));

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_shelljs.default.config.fatal = true;
/**
 * Main entity.
 * @class
 * @property {Env} env
 * @property {Electron} electron
 * @property {InstallerBuilder} installerBuilder
 * @property {ElectronApp} electronApp
 * @property {Desktop} desktop
 * @property {MeteorApp} meteorApp
 */

var MeteorDesktop =
/*#__PURE__*/
function () {
  /**
   * @param {string} input        - Meteor app dir
   * @param {string} output       - output dir for bundle/package/installer
   * @param {Object} options      - options from cli.js
   * @param {Object} dependencies - dependencies object
   * @constructor
   */
  function MeteorDesktop(input, output, options, dependencies) {
    _classCallCheck(this, MeteorDesktop);

    var Log = dependencies.log;
    this.log = new Log('index');
    this.version = this.getVersion();
    this.log.info('initializing');
    this.env = new _env.default(input, output, options);
    this.electron = new _electron.default(this);
    this.electronBuilder = new _electronBuilder.default(this);
    this.electronApp = new _electronApp.default(this);
    this.desktop = new _desktop.default(this);
    this.meteorApp = new _meteorApp.default(this);
    this.utils = _utils.default;
  }
  /**
   * Tries to read the version from our own package.json.
   *
   * @returns {string}
   */


  _createClass(MeteorDesktop, [{
    key: "getVersion",
    value: function getVersion() {
      if (this.version) {
        return this.version;
      }

      var version = null;

      try {
        var _JSON$parse = JSON.parse(_fs.default.readFileSync(_path.default.join(__dirname, '..', 'package.json'), 'UTF-8'));

        version = _JSON$parse.version;
      } catch (e) {
        this.log.error(`error while trying to read ${_path.default.join(__dirname, 'package.json')}`, e);
        process.exit(1);
      }

      if (process.env.PLUGIN_VERSION && (version.includes('rc') || version.includes('beta') || version.includes('alpha'))) {
        version = process.env.PLUGIN_VERSION;
      }

      return version;
    }
    /**
     * Tries to read the version from our own package.json.
     *
     * @returns {string}
     */

  }, {
    key: "getElectronVersion",
    value: function getElectronVersion() {
      var version = null;

      try {
        var _JSON$parse2 = JSON.parse(_fs.default.readFileSync(_path.default.join(this.env.paths.meteorApp.root, 'package.json'), 'UTF-8')),
            _JSON$parse2$dependen = _JSON$parse2.dependencies,
            dependencies = _JSON$parse2$dependen === void 0 ? {} : _JSON$parse2$dependen,
            _JSON$parse2$devDepen = _JSON$parse2.devDependencies,
            devDependencies = _JSON$parse2$devDepen === void 0 ? {} : _JSON$parse2$devDepen;

        if (!('electron' in dependencies) && !('electron' in devDependencies)) {
          this.log.error('electron not found in meteor project dependencies');
          process.exit(1);
        }

        version = dependencies.electron || devDependencies.electron;

        if (this.electronApp.depsManager.checks.version.regex.test(version)) {
          var _JSON$parse3 = JSON.parse(_fs.default.readFileSync(_path.default.join(this.env.paths.meteorApp.root, 'node_modules', 'electron', 'package.json'), 'UTF-8'));

          version = _JSON$parse3.version;
        }
      } catch (e) {
        this.log.error(`error while trying to read ${_path.default.join(this.env.paths.meteorApp.root, 'package.json')}`, e);
        process.exit(1);
      }

      return version;
    }
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.desktop.scaffold();
                this.meteorApp.updateGitIgnore();
                _context.next = 4;
                return this.electronApp.init();

              case 4:
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
  }, {
    key: "buildInstaller",
    value: function () {
      var _buildInstaller = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee2() {
        var throwError,
            _args2 = arguments;
        return _runtime.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throwError = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;
                this.env.options.installerBuild = true;
                _context2.next = 4;
                return this.electronApp.build();

              case 4:
                _context2.prev = 4;
                _context2.next = 7;
                return this.electronBuilder.build();

              case 7:
                _context2.next = 14;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](4);
                this.log.error('error occurred while building installer', _context2.t0);

                if (!throwError) {
                  _context2.next = 14;
                  break;
                }

                throw new Error(_context2.t0);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 9]]);
      }));

      return function buildInstaller() {
        return _buildInstaller.apply(this, arguments);
      };
    }()
  }, {
    key: "run",
    value: function () {
      var _run = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee3() {
        return _runtime.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.electronApp.build(true);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function run() {
        return _run.apply(this, arguments);
      };
    }()
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee4() {
        return _runtime.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.electronApp.build();

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function build() {
        return _build.apply(this, arguments);
      };
    }()
  }, {
    key: "justRun",
    value: function justRun() {
      this.electron.run();
    }
  }, {
    key: "runPackager",
    value: function () {
      var _runPackager = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee5() {
        var _this = this;

        return _runtime.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.packager = new _packager.default(this);
                _context5.next = 3;
                return this.packager.init();

              case 3:
                _context5.next = 5;
                return this.electronApp.build();

              case 5:
                this.packager.packageApp().catch(function (e) {
                  _this.log.error(`while trying to build a package an error occurred: ${e}`);
                });

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function runPackager() {
        return _runPackager.apply(this, arguments);
      };
    }()
  }, {
    key: "getDependency",
    value: function () {
      var _getDependency = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee6(name, version) {
        var declarationCheck,
            _JSON$parse4,
            _JSON$parse4$dependen,
            dependencies,
            _JSON$parse4$devDepen,
            devDependencies,
            dependencyPath,
            dependency,
            dependencyVersion,
            _args6 = arguments;

        return _runtime.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                declarationCheck = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : true;

                if (!declarationCheck) {
                  _context6.next = 13;
                  break;
                }

                _context6.prev = 2;
                _JSON$parse4 = JSON.parse(_fs.default.readFileSync(_path.default.join(this.env.paths.meteorApp.root, 'package.json'), 'UTF-8')), _JSON$parse4$dependen = _JSON$parse4.dependencies, dependencies = _JSON$parse4$dependen === void 0 ? {} : _JSON$parse4$dependen, _JSON$parse4$devDepen = _JSON$parse4.devDependencies, devDependencies = _JSON$parse4$devDepen === void 0 ? {} : _JSON$parse4$devDepen;

                if (!(!(name in dependencies) && !(name in devDependencies))) {
                  _context6.next = 7;
                  break;
                }

                _context6.next = 7;
                return this.meteorApp.runNpm(['i', '-D', '-E', '--only=dev', `${name}@${version}`], 'inherit');

              case 7:
                _context6.next = 13;
                break;

              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6["catch"](2);
                this.log.error(`could no read ${_path.default.join(this.env.paths.meteorApp.root, 'package.json')}`, _context6.t0);
                process.exit(1);

              case 13:
                dependencyPath = _path.default.join(this.env.paths.meteorApp.root, 'node_modules', name);
                dependency = null;
                _context6.prev = 15;
                dependency = require(dependencyPath);
                _context6.next = 36;
                break;

              case 19:
                _context6.prev = 19;
                _context6.t1 = _context6["catch"](15);

                if (!declarationCheck) {
                  _context6.next = 34;
                  break;
                }

                this.log.warn(`could not find ${name}, installing the default version for you: ${name}@${version}`);
                _context6.prev = 23;
                _context6.next = 26;
                return this.meteorApp.runNpm(['i', '-D', '-E', '--only=dev', `${name}@${version}`], 'inherit');

              case 26:
                _context6.next = 32;
                break;

              case 28:
                _context6.prev = 28;
                _context6.t2 = _context6["catch"](23);
                this.log.error(_context6.t2);
                process.exit(1);

              case 32:
                _context6.next = 36;
                break;

              case 34:
                this.log.warn(`could not find ${name}, exiting`);
                process.exit(1);

              case 36:
                _context6.prev = 36;

                if (!dependency) {
                  dependency = require(dependencyPath);
                }

                return _context6.finish(36);

              case 39:
                dependencyVersion = require(_path.default.join(dependencyPath, 'package.json')).version;

                if (dependencyVersion !== version) {
                  if (dependencyVersion.split('.')[0] !== version.split('.')[0]) {
                    this.log.warn(`you are using a ${name}@${dependencyVersion} while the recommended version is ` + `${version}, the compatibility version is different, use at your own risk, be sure to report ` + 'that when submitting issues');
                  } else {
                    this.log.warn(`you are using a ${name}@${dependencyVersion} while the recommended version is ` + `${version}, be sure to report that when submitting issues`);
                  }
                }

                return _context6.abrupt("return", {
                  dependency,
                  path: dependencyPath
                });

              case 42:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[2, 9], [15, 19, 36, 39], [23, 28]]);
      }));

      return function getDependency(_x, _x2) {
        return _getDependency.apply(this, arguments);
      };
    }()
  }]);

  return MeteorDesktop;
}();

function _exports(input, output, options) {
  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    log: _log.default
  },
      _ref$log = _ref.log,
      log = _ref$log === void 0 ? _log.default : _ref$log;

  return new MeteorDesktop(input, output, options, {
    log
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJmYXRhbCIsIk1ldGVvckRlc2t0b3AiLCJpbnB1dCIsIm91dHB1dCIsIm9wdGlvbnMiLCJkZXBlbmRlbmNpZXMiLCJMb2ciLCJsb2ciLCJ2ZXJzaW9uIiwiZ2V0VmVyc2lvbiIsImluZm8iLCJlbnYiLCJlbGVjdHJvbiIsImVsZWN0cm9uQnVpbGRlciIsImVsZWN0cm9uQXBwIiwiZGVza3RvcCIsIm1ldGVvckFwcCIsInV0aWxzIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiam9pbiIsIl9fZGlybmFtZSIsImUiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiUExVR0lOX1ZFUlNJT04iLCJpbmNsdWRlcyIsInBhdGhzIiwicm9vdCIsImRldkRlcGVuZGVuY2llcyIsImRlcHNNYW5hZ2VyIiwiY2hlY2tzIiwicmVnZXgiLCJ0ZXN0Iiwic2NhZmZvbGQiLCJ1cGRhdGVHaXRJZ25vcmUiLCJpbml0IiwidGhyb3dFcnJvciIsImluc3RhbGxlckJ1aWxkIiwiYnVpbGQiLCJFcnJvciIsInJ1biIsInBhY2thZ2VyIiwicGFja2FnZUFwcCIsImNhdGNoIiwibmFtZSIsImRlY2xhcmF0aW9uQ2hlY2siLCJydW5OcG0iLCJkZXBlbmRlbmN5UGF0aCIsImRlcGVuZGVuY3kiLCJyZXF1aXJlIiwid2FybiIsImRlcGVuZGVuY3lWZXJzaW9uIiwic3BsaXQiLCJwYXRoIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxpQkFBTUEsTUFBTixDQUFhQyxLQUFiLEdBQXFCLElBQXJCO0FBRUE7Ozs7Ozs7Ozs7O0lBVU1DLGE7OztBQUNGOzs7Ozs7O0FBT0EseUJBQVlDLEtBQVosRUFBbUJDLE1BQW5CLEVBQTJCQyxPQUEzQixF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QUFHSCxtQkFKRCxNQUlPO0FBQ0gseUJBQUtELEdBQUwsQ0FBUzhDLElBQVQsQ0FBZSxtQkFBa0JOLElBQUssSUFBR08saUJBQWtCLG9DQUE3QyxHQUNULEdBQUU5QyxPQUFRLGlEQURmO0FBRUg7QUFDSjs7a0RBQ007QUFBRTJDLDRCQUFGO0FBQWNLLHdCQUFNTjtBQUFwQixpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLFNBQVNPLFFBQVQsQ0FBaUJ2RCxLQUFqQixFQUF3QkMsTUFBeEIsRUFBZ0NDLE9BQWhDLEVBQTZFO0FBQUEsaUZBQWpCO0FBQUVHO0FBQUYsR0FBaUI7QUFBQSxzQkFBbENBLEdBQWtDO0FBQUEsTUFBbENBLEdBQWtDOztBQUN4RixTQUFPLElBQUlOLGFBQUosQ0FBa0JDLEtBQWxCLEVBQXlCQyxNQUF6QixFQUFpQ0MsT0FBakMsRUFBMEM7QUFBRUc7QUFBRixHQUExQyxDQUFQO0FBQ0giLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCByZWdlbmVyYXRvclJ1bnRpbWUgZnJvbSAncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBFbnYgZnJvbSAnLi9lbnYnO1xuaW1wb3J0IEVsZWN0cm9uIGZyb20gJy4vZWxlY3Ryb24nO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL2xvZyc7XG5pbXBvcnQgRGVza3RvcCBmcm9tICcuL2Rlc2t0b3AnO1xuaW1wb3J0IEVsZWN0cm9uQXBwIGZyb20gJy4vZWxlY3Ryb25BcHAnO1xuaW1wb3J0IE1ldGVvckFwcCBmcm9tICcuL21ldGVvckFwcCc7XG5pbXBvcnQgRWxlY3Ryb25CdWlsZGVyIGZyb20gJy4vZWxlY3Ryb25CdWlsZGVyJztcbmltcG9ydCBQYWNrYWdlciBmcm9tICcuL3BhY2thZ2VyJztcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJztcblxuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuLyoqXG4gKiBNYWluIGVudGl0eS5cbiAqIEBjbGFzc1xuICogQHByb3BlcnR5IHtFbnZ9IGVudlxuICogQHByb3BlcnR5IHtFbGVjdHJvbn0gZWxlY3Ryb25cbiAqIEBwcm9wZXJ0eSB7SW5zdGFsbGVyQnVpbGRlcn0gaW5zdGFsbGVyQnVpbGRlclxuICogQHByb3BlcnR5IHtFbGVjdHJvbkFwcH0gZWxlY3Ryb25BcHBcbiAqIEBwcm9wZXJ0eSB7RGVza3RvcH0gZGVza3RvcFxuICogQHByb3BlcnR5IHtNZXRlb3JBcHB9IG1ldGVvckFwcFxuICovXG5jbGFzcyBNZXRlb3JEZXNrdG9wIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgICAgICAgIC0gTWV0ZW9yIGFwcCBkaXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0ICAgICAgIC0gb3V0cHV0IGRpciBmb3IgYnVuZGxlL3BhY2thZ2UvaW5zdGFsbGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgICAgICAtIG9wdGlvbnMgZnJvbSBjbGkuanNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVwZW5kZW5jaWVzIC0gZGVwZW5kZW5jaWVzIG9iamVjdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGlucHV0LCBvdXRwdXQsIG9wdGlvbnMsIGRlcGVuZGVuY2llcykge1xuICAgICAgICBjb25zdCBMb2cgPSBkZXBlbmRlbmNpZXMubG9nO1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2luZGV4Jyk7XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHRoaXMuZ2V0VmVyc2lvbigpO1xuXG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2luaXRpYWxpemluZycpO1xuXG4gICAgICAgIHRoaXMuZW52ID0gbmV3IEVudihpbnB1dCwgb3V0cHV0LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lbGVjdHJvbiA9IG5ldyBFbGVjdHJvbih0aGlzKTtcbiAgICAgICAgdGhpcy5lbGVjdHJvbkJ1aWxkZXIgPSBuZXcgRWxlY3Ryb25CdWlsZGVyKHRoaXMpO1xuICAgICAgICB0aGlzLmVsZWN0cm9uQXBwID0gbmV3IEVsZWN0cm9uQXBwKHRoaXMpO1xuICAgICAgICB0aGlzLmRlc2t0b3AgPSBuZXcgRGVza3RvcCh0aGlzKTtcbiAgICAgICAgdGhpcy5tZXRlb3JBcHAgPSBuZXcgTWV0ZW9yQXBwKHRoaXMpO1xuICAgICAgICB0aGlzLnV0aWxzID0gdXRpbHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gcmVhZCB0aGUgdmVyc2lvbiBmcm9tIG91ciBvd24gcGFja2FnZS5qc29uLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICBpZiAodGhpcy52ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJzaW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZlcnNpb24gPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgKHsgdmVyc2lvbiB9ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpLCAnVVRGLTgnKVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBlcnJvciB3aGlsZSB0cnlpbmcgdG8gcmVhZCAke3BhdGguam9pbihfX2Rpcm5hbWUsICdwYWNrYWdlLmpzb24nKX1gLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuUExVR0lOX1ZFUlNJT04gJiZcbiAgICAgICAgICAgICh2ZXJzaW9uLmluY2x1ZGVzKCdyYycpIHx8IHZlcnNpb24uaW5jbHVkZXMoJ2JldGEnKSB8fCB2ZXJzaW9uLmluY2x1ZGVzKCdhbHBoYScpKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHZlcnNpb24gPSBwcm9jZXNzLmVudi5QTFVHSU5fVkVSU0lPTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byByZWFkIHRoZSB2ZXJzaW9uIGZyb20gb3VyIG93biBwYWNrYWdlLmpzb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldEVsZWN0cm9uVmVyc2lvbigpIHtcbiAgICAgICAgbGV0IHZlcnNpb24gPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBkZXBlbmRlbmNpZXMgPSB7fSwgZGV2RGVwZW5kZW5jaWVzID0ge30gfSA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCwgJ3BhY2thZ2UuanNvbicpLCAnVVRGLTgnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICghKCdlbGVjdHJvbicgaW4gZGVwZW5kZW5jaWVzKSAmJiAhKCdlbGVjdHJvbicgaW4gZGV2RGVwZW5kZW5jaWVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlbGVjdHJvbiBub3QgZm91bmQgaW4gbWV0ZW9yIHByb2plY3QgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmVyc2lvbiA9IGRlcGVuZGVuY2llcy5lbGVjdHJvbiB8fCBkZXZEZXBlbmRlbmNpZXMuZWxlY3Ryb247XG4gICAgICAgICAgICBpZiAodGhpcy5lbGVjdHJvbkFwcC5kZXBzTWFuYWdlci5jaGVja3MudmVyc2lvbi5yZWdleC50ZXN0KHZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgKHsgdmVyc2lvbiB9ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCwgJ25vZGVfbW9kdWxlcycsICdlbGVjdHJvbicsICdwYWNrYWdlLmpzb24nKSwgJ1VURi04JylcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYGVycm9yIHdoaWxlIHRyeWluZyB0byByZWFkICR7cGF0aC5qb2luKHRoaXMuZW52LnBhdGhzLm1ldGVvckFwcC5yb290LCAncGFja2FnZS5qc29uJyl9YCwgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5kZXNrdG9wLnNjYWZmb2xkKCk7XG4gICAgICAgIHRoaXMubWV0ZW9yQXBwLnVwZGF0ZUdpdElnbm9yZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLmVsZWN0cm9uQXBwLmluaXQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBidWlsZEluc3RhbGxlcih0aHJvd0Vycm9yID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5lbnYub3B0aW9ucy5pbnN0YWxsZXJCdWlsZCA9IHRydWU7XG4gICAgICAgIGF3YWl0IHRoaXMuZWxlY3Ryb25BcHAuYnVpbGQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZWxlY3Ryb25CdWlsZGVyLmJ1aWxkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCB3aGlsZSBidWlsZGluZyBpbnN0YWxsZXInLCBlKTtcbiAgICAgICAgICAgIGlmICh0aHJvd0Vycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuKCkge1xuICAgICAgICBhd2FpdCB0aGlzLmVsZWN0cm9uQXBwLmJ1aWxkKHRydWUpO1xuICAgIH1cblxuICAgIGFzeW5jIGJ1aWxkKCkge1xuICAgICAgICBhd2FpdCB0aGlzLmVsZWN0cm9uQXBwLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAganVzdFJ1bigpIHtcbiAgICAgICAgdGhpcy5lbGVjdHJvbi5ydW4oKTtcbiAgICB9XG5cbiAgICBhc3luYyBydW5QYWNrYWdlcigpIHtcbiAgICAgICAgdGhpcy5wYWNrYWdlciA9IG5ldyBQYWNrYWdlcih0aGlzKTtcbiAgICAgICAgYXdhaXQgdGhpcy5wYWNrYWdlci5pbml0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMuZWxlY3Ryb25BcHAuYnVpbGQoKTtcblxuICAgICAgICB0aGlzLnBhY2thZ2VyLnBhY2thZ2VBcHAoKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYHdoaWxlIHRyeWluZyB0byBidWlsZCBhIHBhY2thZ2UgYW4gZXJyb3Igb2NjdXJyZWQ6ICR7ZX1gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0RGVwZW5kZW5jeShuYW1lLCB2ZXJzaW9uLCBkZWNsYXJhdGlvbkNoZWNrID0gdHJ1ZSkge1xuICAgICAgICBpZiAoZGVjbGFyYXRpb25DaGVjaykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRlcGVuZGVuY2llcyA9IHt9LCBkZXZEZXBlbmRlbmNpZXMgPSB7fSB9ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCwgJ3BhY2thZ2UuanNvbicpLCAnVVRGLTgnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKCEoIG5hbWUgaW4gZGVwZW5kZW5jaWVzICkgJiYgISggbmFtZSBpbiBkZXZEZXBlbmRlbmNpZXMgKSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ldGVvckFwcC5ydW5OcG0oWydpJywgJy1EJywgJy1FJywgJy0tb25seT1kZXYnLCBgJHtuYW1lfUAke3ZlcnNpb259YF0sICdpbmhlcml0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBjb3VsZCBubyByZWFkICR7cGF0aC5qb2luKHRoaXMuZW52LnBhdGhzLm1ldGVvckFwcC5yb290LCAncGFja2FnZS5qc29uJyl9YCwgZSk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVwZW5kZW5jeVBhdGggPSBwYXRoLmpvaW4odGhpcy5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsICdub2RlX21vZHVsZXMnLCBuYW1lKTtcbiAgICAgICAgbGV0IGRlcGVuZGVuY3kgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVwZW5kZW5jeSA9IHJlcXVpcmUoZGVwZW5kZW5jeVBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZGVjbGFyYXRpb25DaGVjaykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYGNvdWxkIG5vdCBmaW5kICR7bmFtZX0sIGluc3RhbGxpbmcgdGhlIGRlZmF1bHQgdmVyc2lvbiBmb3IgeW91OiAke25hbWV9QCR7dmVyc2lvbn1gKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ldGVvckFwcC5ydW5OcG0oWydpJywgJy1EJywgJy1FJywgJy0tb25seT1kZXYnLCBgJHtuYW1lfUAke3ZlcnNpb259YF0sICdpbmhlcml0Jyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYGNvdWxkIG5vdCBmaW5kICR7bmFtZX0sIGV4aXRpbmdgKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoIWRlcGVuZGVuY3kpIHtcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5ID0gcmVxdWlyZShkZXBlbmRlbmN5UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVwZW5kZW5jeVZlcnNpb24gPSByZXF1aXJlKHBhdGguam9pbihkZXBlbmRlbmN5UGF0aCwgJ3BhY2thZ2UuanNvbicpKS52ZXJzaW9uO1xuXG4gICAgICAgIGlmIChkZXBlbmRlbmN5VmVyc2lvbiAhPT0gdmVyc2lvbikge1xuICAgICAgICAgICAgaWYgKGRlcGVuZGVuY3lWZXJzaW9uLnNwbGl0KCcuJylbMF0gIT09IHZlcnNpb24uc3BsaXQoJy4nKVswXSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYHlvdSBhcmUgdXNpbmcgYSAke25hbWV9QCR7ZGVwZW5kZW5jeVZlcnNpb259IHdoaWxlIHRoZSByZWNvbW1lbmRlZCB2ZXJzaW9uIGlzIGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHt2ZXJzaW9ufSwgdGhlIGNvbXBhdGliaWxpdHkgdmVyc2lvbiBpcyBkaWZmZXJlbnQsIHVzZSBhdCB5b3VyIG93biByaXNrLCBiZSBzdXJlIHRvIHJlcG9ydCBgICtcbiAgICAgICAgICAgICAgICAgICAgJ3RoYXQgd2hlbiBzdWJtaXR0aW5nIGlzc3VlcycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy53YXJuKGB5b3UgYXJlIHVzaW5nIGEgJHtuYW1lfUAke2RlcGVuZGVuY3lWZXJzaW9ufSB3aGlsZSB0aGUgcmVjb21tZW5kZWQgdmVyc2lvbiBpcyBgICtcbiAgICAgICAgICAgICAgICAgICAgYCR7dmVyc2lvbn0sIGJlIHN1cmUgdG8gcmVwb3J0IHRoYXQgd2hlbiBzdWJtaXR0aW5nIGlzc3Vlc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGRlcGVuZGVuY3ksIHBhdGg6IGRlcGVuZGVuY3lQYXRoIH07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHBvcnRzKGlucHV0LCBvdXRwdXQsIG9wdGlvbnMsIHsgbG9nID0gTG9nZ2VyIH0gPSB7IGxvZzogTG9nZ2VyIH0pIHtcbiAgICByZXR1cm4gbmV3IE1ldGVvckRlc2t0b3AoaW5wdXQsIG91dHB1dCwgb3B0aW9ucywgeyBsb2cgfSk7XG59XG4iXX0=