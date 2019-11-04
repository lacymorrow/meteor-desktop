"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _log = _interopRequireDefault(require("./log"));

var _defaultDependencies = _interopRequireDefault(require("./defaultDependencies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Promisfied rimraf.
 *
 * @param {string} dirPath - path to the dir to be deleted
 * @param {number} delay - delay the task by ms
 * @returns {Promise<any>}
 */
function removeDir(dirPath) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      (0, _rimraf.default)(dirPath, {
        maxBusyTries: 100
      }, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }, delay);
  });
}
/**
 * Wrapper for electron-builder.
 */


var InstallerBuilder =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   *
   * @constructor
   */
  function InstallerBuilder($) {
    _classCallCheck(this, InstallerBuilder);

    this.log = new _log.default('electronBuilder');
    this.$ = $;
    this.firstPass = true;
    this.lastRebuild = {};
    this.currentContext = null;
    this.installerDir = _path.default.join(this.$.env.options.output, this.$.env.paths.installerDir);
  }

  _createClass(InstallerBuilder, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        var appBuilder;
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.$.getDependency('electron-builder', _defaultDependencies.default['electron-builder']);

              case 2:
                this.builder = _context.sent;
                _context.next = 5;
                return this.$.getDependency('app-builder-lib', _defaultDependencies.default['electron-builder'], false);

              case 5:
                appBuilder = _context.sent;
                this.yarn = require(_path.default.join(appBuilder.path, 'out', 'util', 'yarn'));
                this.getGypEnv = this.yarn.getGypEnv;
                this.packageDependencies = require(_path.default.join(appBuilder.path, 'out', 'util', 'packageDependencies'));

              case 9:
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
     * Prepares the last rebuild object for electron-builder.
     *
     * @param {string} arch
     * @param {string} platform
     * @returns {Object}
     */

  }, {
    key: "prepareLastRebuildObject",
    value: function prepareLastRebuildObject(arch) {
      var platform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.platform;
      var productionDeps = this.packageDependencies.createLazyProductionDeps(this.$.env.paths.electronApp.root);
      this.lastRebuild = {
        frameworkInfo: {
          version: this.$.getElectronVersion(),
          useCustomDist: true
        },
        platform,
        arch,
        productionDeps
      };
      return this.lastRebuild;
    }
    /**
     * Calls npm rebuild from electron-builder.
     * @param {string} arch
     * @param {string} platform
     * @param {boolean} install
     * @returns {Promise}
     */

  }, {
    key: "installOrRebuild",
    value: function () {
      var _installOrRebuild = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee2(arch) {
        var platform,
            install,
            _args2 = arguments;
        return _runtime.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                platform = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : process.platform;
                install = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;
                this.log.debug(`calling installOrRebuild from electron-builder for arch ${arch}`);
                this.prepareLastRebuildObject(arch, platform);
                _context2.next = 6;
                return this.yarn.installOrRebuild(this.$.desktop.getSettings().builderOptions || {}, this.$.env.paths.electronApp.root, this.lastRebuild, install);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function installOrRebuild(_x) {
        return _installOrRebuild.apply(this, arguments);
      };
    }()
    /**
     * Callback invoked before build is made. Ensures that app.asar have the right rebuilt
     * node_modules.
     *
     * @param {Object} context
     * @returns {Promise}
     */

  }, {
    key: "beforeBuild",
    value: function beforeBuild(context) {
      var _this = this;

      this.currentContext = Object.assign({}, context);
      return new Promise(function (resolve, reject) {
        var platformMatches = process.platform === context.platform.nodeName;
        var rebuild = platformMatches && context.arch !== _this.lastRebuild.arch;

        if (!platformMatches) {
          _this.log.warn('skipping dependencies rebuild because platform is different, if you have native ' + 'node modules as your app dependencies you should od the build on the target platform only');
        }

        if (!rebuild) {
          _this.moveNodeModulesOut().catch(function (e) {
            return reject(e);
          }).then(function () {
            return setTimeout(function () {
              return resolve(false);
            }, 2000);
          }); // Timeout helps on Windows to clear the file locks.

        } else {
          // Lets rebuild the node_modules for different arch.
          _this.installOrRebuild(context.arch, context.platform.nodeName).catch(function (e) {
            return reject(e);
          }).then(function () {
            return _this.$.electronApp.installLocalNodeModules(context.arch);
          }).catch(function (e) {
            return reject(e);
          }).then(function () {
            _this.$.electronApp.scaffold.createAppRoot();

            _this.$.electronApp.scaffold.copySkeletonApp();

            return _this.$.electronApp.packSkeletonToAsar([_this.$.env.paths.electronApp.meteorAsar, _this.$.env.paths.electronApp.desktopAsar, _this.$.env.paths.electronApp.extracted]);
          }).catch(function (e) {
            return reject(e);
          }).then(function () {
            return _this.moveNodeModulesOut();
          }).catch(function (e) {
            return reject(e);
          }).then(function () {
            return resolve(false);
          });
        }
      });
    }
    /**
     * Callback to be invoked after packing. Restores node_modules to the .desktop-build.
     * @returns {Promise}
     */

  }, {
    key: "afterPack",
    value: function afterPack(context) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _shelljs.default.config.fatal = true;

        if (_this2.$.utils.exists(_this2.$.env.paths.electronApp.extractedNodeModules)) {
          _this2.log.debug('injecting extracted modules');

          _shelljs.default.cp('-Rf', _this2.$.env.paths.electronApp.extractedNodeModules, _path.default.join(_this2.getPackagedAppPath(context), 'node_modules'));
        }

        _this2.log.debug('moving node_modules back'); // Move node_modules back.


        try {
          _shelljs.default.mv(_this2.$.env.paths.electronApp.tmpNodeModules, _this2.$.env.paths.electronApp.nodeModules);
        } catch (e) {
          reject(e);
          return;
        } finally {
          _shelljs.default.config.reset();
        }

        if (_this2.firstPass) {
          _this2.firstPass = false;
        }

        _this2.log.debug('node_modules moved back');

        _this2.wait().catch(function (e) {
          return reject(e);
        }).then(function () {
          return resolve();
        });
      });
    }
    /**
     * This command kills orphaned MSBuild.exe processes.
     * Sometime after native node_modules compilation they are still writing some logs,
     * prevent node_modules from being deleted.
     */

  }, {
    key: "killMSBuild",
    value: function killMSBuild() {
      var _this3 = this;

      if (this.currentContext.platform.nodeName !== 'win32') {
        return;
      }

      try {
        var out = _crossSpawn.default.sync('wmic', ['process', 'where', 'caption="MSBuild.exe"', 'get', 'processid']).stdout.toString('utf-8').split('\n');

        var regex = new RegExp(/(\d+)/, 'gm'); // No we will check for those with the matching params.

        out.forEach(function (line) {
          var match = regex.exec(line) || false;

          if (match) {
            _this3.log.debug(`killing MSBuild.exe at pid: ${match[1]}`);

            _crossSpawn.default.sync('taskkill', ['/pid', match[1], '/f', '/t']);
          }

          regex.lastIndex = 0;
        });
      } catch (e) {
        this.log.debug('kill MSBuild failed');
      }
    }
    /**
     * Returns the path to packaged app.
     * @returns {string}
     */

  }, {
    key: "getPackagedAppPath",
    value: function getPackagedAppPath() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.currentContext.platform.nodeName === 'darwin') {
        return _path.default.join(this.installerDir, `${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources', 'app');
      }

      var platformDir = `${this.currentContext.platform.nodeName === 'win32' ? 'win' : 'linux'}-${this.currentContext.arch === 'ia32' ? 'ia32-' : ''}unpacked`;
      return _path.default.join(this.installerDir, platformDir, 'resources', 'app');
    }
    /**
     * On Windows it waits for the app.asar in the packed app to be free (no file locks).
     * @returns {*}
     */

  }, {
    key: "wait",
    value: function wait() {
      if (this.currentContext.platform.nodeName !== 'win32') {
        return Promise.resolve();
      }

      var appAsarPath = _path.default.join(this.getPackagedAppPath(), 'app.asar');

      var retries = 0;
      var self = this;
      return new Promise(function (resolve, reject) {
        function check() {
          _fs.default.open(appAsarPath, 'r+', function (err, fd) {
            retries += 1;

            if (err) {
              if (err.code !== 'ENOENT') {
                self.log.debug(`waiting for app.asar to be readable, ${'code' in err ? `currently reading it returns ${err.code}` : ''}`);

                if (retries < 6) {
                  setTimeout(function () {
                    return check();
                  }, 4000);
                } else {
                  reject(`file is locked: ${appAsarPath}`);
                }
              } else {
                resolve();
              }
            } else {
              _fs.default.closeSync(fd);

              resolve();
            }
          });
        }

        check();
      });
    }
    /**
     * Prepares the target object passed to the electron-builder.
     *
     * @returns {Map<Platform, Map<Arch, Array<string>>>}
     */

  }, {
    key: "prepareTargets",
    value: function prepareTargets() {
      var arch = this.$.env.options.ia32 ? 'ia32' : 'x64';
      arch = this.$.env.options.allArchs ? 'all' : arch;
      var targets = [];

      if (this.$.env.options.win) {
        targets.push(this.builder.dependency.Platform.WINDOWS);
      }

      if (this.$.env.options.linux) {
        targets.push(this.builder.dependency.Platform.LINUX);
      }

      if (this.$.env.options.mac) {
        targets.push(this.builder.dependency.Platform.MAC);
      }

      if (targets.length === 0) {
        if (this.$.env.os.isWindows) {
          targets.push(this.builder.dependency.Platform.WINDOWS);
        } else if (this.$.env.os.isLinux) {
          targets.push(this.builder.dependency.Platform.LINUX);
        } else {
          targets.push(this.builder.dependency.Platform.MAC);
        }
      }

      return this.builder.dependency.createTargets(targets, null, arch);
    }
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee3() {
        var settings, builderOptions;
        return _runtime.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                settings = this.$.desktop.getSettings();

                if (!('builderOptions' in settings)) {
                  this.log.error('no builderOptions in settings.json, aborting');
                  process.exit(1);
                }

                builderOptions = Object.assign({}, settings.builderOptions);
                builderOptions.asar = false;
                builderOptions.npmRebuild = true;
                builderOptions.beforeBuild = this.beforeBuild.bind(this);
                builderOptions.afterPack = this.afterPack.bind(this);
                builderOptions.electronVersion = this.$.getElectronVersion();
                builderOptions.directories = {
                  app: this.$.env.paths.electronApp.root,
                  output: _path.default.join(this.$.env.options.output, this.$.env.paths.installerDir)
                };
                _context3.prev = 9;
                this.log.debug('calling build from electron-builder');
                _context3.next = 13;
                return this.builder.dependency.build(Object.assign({
                  targets: this.prepareTargets(),
                  config: builderOptions
                }, settings.builderCliOptions));

              case 13:
                if (this.$.utils.exists(this.$.env.paths.electronApp.extractedNodeModules)) {
                  _shelljs.default.rm('-rf', this.$.env.paths.electronApp.extractedNodeModules);
                }

                _context3.next = 19;
                break;

              case 16:
                _context3.prev = 16;
                _context3.t0 = _context3["catch"](9);
                this.log.error('error while building installer: ', _context3.t0);

              case 19:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[9, 16]]);
      }));

      return function build() {
        return _build.apply(this, arguments);
      };
    }()
    /**
     * Moves node_modules out of the app because while the app will be packaged
     * we do not want it to be there.
     * @returns {Promise<any>}
     */

  }, {
    key: "moveNodeModulesOut",
    value: function moveNodeModulesOut() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.log.debug('moving node_modules out, because we have them already in' + ' app.asar');

        _this4.killMSBuild();

        removeDir(_this4.$.env.paths.electronApp.tmpNodeModules).catch(function (e) {
          return reject(e);
        }).then(function () {
          _shelljs.default.config.fatal = true;
          _shelljs.default.config.verbose = true;

          try {
            _shelljs.default.mv(_this4.$.env.paths.electronApp.nodeModules, _this4.$.env.paths.electronApp.tmpNodeModules);

            _shelljs.default.config.reset();

            return _this4.wait();
          } catch (e) {
            _shelljs.default.config.reset();

            return Promise.reject(e);
          }
        }).catch(function (e) {
          return reject(e);
        }).then(function () {
          return removeDir(_this4.$.env.paths.electronApp.nodeModules, 1000);
        }).catch(function (e) {
          return reject(e);
        }).then(function () {
          return _this4.wait();
        }).catch(reject).then(resolve);
      });
    }
  }]);

  return InstallerBuilder;
}();

exports.default = InstallerBuilder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkJ1aWxkZXIuanMiXSwibmFtZXMiOlsicmVtb3ZlRGlyIiwiZGlyUGF0aCIsImRlbGF5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXRUaW1lb3V0IiwibWF4QnVzeVRyaWVzIiwiZXJyIiwiSW5zdGFsbGVyQnVpbGRlciIsIiQiLCJsb2ciLCJmaXJzdFBhc3MiLCJsYXN0UmVidWlsZCIsImN1cnJlbnRDb250ZXh0IiwiaW5zdGFsbGVyRGlyIiwiam9pbiIsImVudiIsIm9wdGlvbnMiLCJvdXRwdXQiLCJwYXRocyIsImdldERlcGVuZGVuY3kiLCJidWlsZGVyIiwiYXBwQnVpbGRlciIsInlhcm4iLCJyZXF1aXJlIiwicGF0aCIsImdldEd5cEVudiIsInBhY2thZ2VEZXBlbmRlbmNpZXMiLCJhcmNoIiwicGxhdGZvcm0iLCJwcm9jZXNzIiwicHJvZHVjdGlvbkRlcHMiLCJjcmVhdGVMYXp5UHJvZHVjdGlvbkRlcHMiLCJlbGVjdHJvbkFwcCIsInJvb3QiLCJmcmFtZXdvcmtJbmZvIiwidmVyc2lvbiIsImdldEVsZWN0cm9uVmVyc2lvbiIsInVzZUN1c3RvbURpc3QiLCJpbnN0YWxsIiwiZGVidWciLCJwcmVwYXJlTGFzdFJlYnVpbGRPYmplY3QiLCJpbnN0YWxsT3JSZWJ1aWxkIiwiZGVza3RvcCIsImdldFNldHRpbmdzIiwiYnVpbGRlck9wdGlvbnMiLCJjb250ZXh0IiwiT2JqZWN0IiwiYXNzaWduIiwicGxhdGZvcm1NYXRjaGVzIiwibm9kZU5hbWUiLCJyZWJ1aWxkIiwid2FybiIsIm1vdmVOb2RlTW9kdWxlc091dCIsImNhdGNoIiwiZSIsInRoZW4iLCJpbnN0YWxsTG9jYWxOb2RlTW9kdWxlcyIsInNjYWZmb2xkIiwiY3JlYXRlQXBwUm9vdCIsImNvcHlTa2VsZXRvbkFwcCIsInBhY2tTa2VsZXRvblRvQXNhciIsIm1ldGVvckFzYXIiLCJkZXNrdG9wQXNhciIsImV4dHJhY3RlZCIsImNvbmZpZyIsImZhdGFsIiwidXRpbHMiLCJleGlzdHMiLCJleHRyYWN0ZWROb2RlTW9kdWxlcyIsImNwIiwiZ2V0UGFja2FnZWRBcHBQYXRoIiwibXYiLCJ0bXBOb2RlTW9kdWxlcyIsIm5vZGVNb2R1bGVzIiwicmVzZXQiLCJ3YWl0Iiwib3V0Iiwic3luYyIsInN0ZG91dCIsInRvU3RyaW5nIiwic3BsaXQiLCJyZWdleCIsIlJlZ0V4cCIsImZvckVhY2giLCJsaW5lIiwibWF0Y2giLCJleGVjIiwibGFzdEluZGV4IiwicGFja2FnZXIiLCJhcHBJbmZvIiwicHJvZHVjdEZpbGVuYW1lIiwicGxhdGZvcm1EaXIiLCJhcHBBc2FyUGF0aCIsInJldHJpZXMiLCJzZWxmIiwiY2hlY2siLCJvcGVuIiwiZmQiLCJjb2RlIiwiY2xvc2VTeW5jIiwiaWEzMiIsImFsbEFyY2hzIiwidGFyZ2V0cyIsIndpbiIsInB1c2giLCJkZXBlbmRlbmN5IiwiUGxhdGZvcm0iLCJXSU5ET1dTIiwibGludXgiLCJMSU5VWCIsIm1hYyIsIk1BQyIsImxlbmd0aCIsIm9zIiwiaXNXaW5kb3dzIiwiaXNMaW51eCIsImNyZWF0ZVRhcmdldHMiLCJzZXR0aW5ncyIsImVycm9yIiwiZXhpdCIsImFzYXIiLCJucG1SZWJ1aWxkIiwiYmVmb3JlQnVpbGQiLCJiaW5kIiwiYWZ0ZXJQYWNrIiwiZWxlY3Ryb25WZXJzaW9uIiwiZGlyZWN0b3JpZXMiLCJhcHAiLCJidWlsZCIsInByZXBhcmVUYXJnZXRzIiwiYnVpbGRlckNsaU9wdGlvbnMiLCJybSIsImtpbGxNU0J1aWxkIiwidmVyYm9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7OztBQU9BLFNBQVNBLFNBQVQsQ0FBbUJDLE9BQW5CLEVBQXVDO0FBQUEsTUFBWEMsS0FBVyx1RUFBSCxDQUFHO0FBQ25DLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNw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QlVyRCxPQXRCVjtBQXVCSCxPQTNCTSxDQUFQO0FBNEJIIiwiZmlsZSI6ImVsZWN0cm9uQnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuaW1wb3J0IHJlZ2VuZXJhdG9yUnVudGltZSBmcm9tICdyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IHNwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcbmltcG9ydCBMb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IGRlZmF1bHREZXBlbmRlbmNpZXMgZnJvbSAnLi9kZWZhdWx0RGVwZW5kZW5jaWVzJztcblxuLyoqXG4gKiBQcm9taXNmaWVkIHJpbXJhZi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyUGF0aCAtIHBhdGggdG8gdGhlIGRpciB0byBiZSBkZWxldGVkXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsYXkgLSBkZWxheSB0aGUgdGFzayBieSBtc1xuICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRGlyKGRpclBhdGgsIGRlbGF5ID0gMCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcmltcmFmKGRpclBhdGgsIHtcbiAgICAgICAgICAgICAgICBtYXhCdXN5VHJpZXM6IDEwMFxuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogV3JhcHBlciBmb3IgZWxlY3Ryb24tYnVpbGRlci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5zdGFsbGVyQnVpbGRlciB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNZXRlb3JEZXNrdG9wfSAkIC0gY29udGV4dFxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2VsZWN0cm9uQnVpbGRlcicpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgICAgICB0aGlzLmZpcnN0UGFzcyA9IHRydWU7XG4gICAgICAgIHRoaXMubGFzdFJlYnVpbGQgPSB7fTtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29udGV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW5zdGFsbGVyRGlyID0gcGF0aC5qb2luKHRoaXMuJC5lbnYub3B0aW9ucy5vdXRwdXQsIHRoaXMuJC5lbnYucGF0aHMuaW5zdGFsbGVyRGlyKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0KCkge1xuICAgICAgICB0aGlzLmJ1aWxkZXIgPSBhd2FpdCB0aGlzLiQuZ2V0RGVwZW5kZW5jeSgnZWxlY3Ryb24tYnVpbGRlcicsIGRlZmF1bHREZXBlbmRlbmNpZXNbJ2VsZWN0cm9uLWJ1aWxkZXInXSk7XG4gICAgICAgIGNvbnN0IGFwcEJ1aWxkZXIgPSBhd2FpdCB0aGlzLiQuZ2V0RGVwZW5kZW5jeSgnYXBwLWJ1aWxkZXItbGliJywgZGVmYXVsdERlcGVuZGVuY2llc1snZWxlY3Ryb24tYnVpbGRlciddLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy55YXJuID0gcmVxdWlyZShwYXRoLmpvaW4oYXBwQnVpbGRlci5wYXRoLCAnb3V0JywgJ3V0aWwnLCAneWFybicpKTtcbiAgICAgICAgdGhpcy5nZXRHeXBFbnYgPSB0aGlzLnlhcm4uZ2V0R3lwRW52O1xuICAgICAgICB0aGlzLnBhY2thZ2VEZXBlbmRlbmNpZXMgPSByZXF1aXJlKHBhdGguam9pbihhcHBCdWlsZGVyLnBhdGgsICdvdXQnLCAndXRpbCcsICdwYWNrYWdlRGVwZW5kZW5jaWVzJykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZXBhcmVzIHRoZSBsYXN0IHJlYnVpbGQgb2JqZWN0IGZvciBlbGVjdHJvbi1idWlsZGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFyY2hcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGxhdGZvcm1cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHByZXBhcmVMYXN0UmVidWlsZE9iamVjdChhcmNoLCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm0pIHtcbiAgICAgICAgY29uc3QgcHJvZHVjdGlvbkRlcHMgPSB0aGlzLnBhY2thZ2VEZXBlbmRlbmNpZXMuY3JlYXRlTGF6eVByb2R1Y3Rpb25EZXBzKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCk7XG4gICAgICAgIHRoaXMubGFzdFJlYnVpbGQgPSB7XG4gICAgICAgICAgICBmcmFtZXdvcmtJbmZvOiB7IHZlcnNpb246IHRoaXMuJC5nZXRFbGVjdHJvblZlcnNpb24oKSwgdXNlQ3VzdG9tRGlzdDogdHJ1ZSB9LFxuICAgICAgICAgICAgcGxhdGZvcm0sXG4gICAgICAgICAgICBhcmNoLFxuICAgICAgICAgICAgcHJvZHVjdGlvbkRlcHNcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdFJlYnVpbGQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbHMgbnBtIHJlYnVpbGQgZnJvbSBlbGVjdHJvbi1idWlsZGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmNoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYXRmb3JtXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpbnN0YWxsXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYXN5bmMgaW5zdGFsbE9yUmVidWlsZChhcmNoLCBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm0sIGluc3RhbGwgPSBmYWxzZSkge1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhgY2FsbGluZyBpbnN0YWxsT3JSZWJ1aWxkIGZyb20gZWxlY3Ryb24tYnVpbGRlciBmb3IgYXJjaCAke2FyY2h9YCk7XG4gICAgICAgIHRoaXMucHJlcGFyZUxhc3RSZWJ1aWxkT2JqZWN0KGFyY2gsIHBsYXRmb3JtKTtcbiAgICAgICAgYXdhaXQgdGhpcy55YXJuLmluc3RhbGxPclJlYnVpbGQodGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKS5idWlsZGVyT3B0aW9ucyB8fCB7fSxcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgdGhpcy5sYXN0UmVidWlsZCwgaW5zdGFsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgaW52b2tlZCBiZWZvcmUgYnVpbGQgaXMgbWFkZS4gRW5zdXJlcyB0aGF0IGFwcC5hc2FyIGhhdmUgdGhlIHJpZ2h0IHJlYnVpbHRcbiAgICAgKiBub2RlX21vZHVsZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGJlZm9yZUJ1aWxkKGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q29udGV4dCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm1NYXRjaGVzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gY29udGV4dC5wbGF0Zm9ybS5ub2RlTmFtZTtcbiAgICAgICAgICAgIGNvbnN0IHJlYnVpbGQgPSBwbGF0Zm9ybU1hdGNoZXMgJiYgY29udGV4dC5hcmNoICE9PSB0aGlzLmxhc3RSZWJ1aWxkLmFyY2g7XG4gICAgICAgICAgICBpZiAoIXBsYXRmb3JtTWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLndhcm4oJ3NraXBwaW5nIGRlcGVuZGVuY2llcyByZWJ1aWxkIGJlY2F1c2UgcGxhdGZvcm0gaXMgZGlmZmVyZW50LCBpZiB5b3UgaGF2ZSBuYXRpdmUgJyArXG4gICAgICAgICAgICAgICAgICAgICdub2RlIG1vZHVsZXMgYXMgeW91ciBhcHAgZGVwZW5kZW5jaWVzIHlvdSBzaG91bGQgb2QgdGhlIGJ1aWxkIG9uIHRoZSB0YXJnZXQgcGxhdGZvcm0gb25seScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJlYnVpbGQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVOb2RlTW9kdWxlc091dCgpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKGZhbHNlKSwgMjAwMCkpO1xuICAgICAgICAgICAgICAgIC8vIFRpbWVvdXQgaGVscHMgb24gV2luZG93cyB0byBjbGVhciB0aGUgZmlsZSBsb2Nrcy5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTGV0cyByZWJ1aWxkIHRoZSBub2RlX21vZHVsZXMgZm9yIGRpZmZlcmVudCBhcmNoLlxuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFsbE9yUmVidWlsZChjb250ZXh0LmFyY2gsIGNvbnRleHQucGxhdGZvcm0ubm9kZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy4kLmVsZWN0cm9uQXBwLmluc3RhbGxMb2NhbE5vZGVNb2R1bGVzKGNvbnRleHQuYXJjaCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVsZWN0cm9uQXBwLnNjYWZmb2xkLmNyZWF0ZUFwcFJvb3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbGVjdHJvbkFwcC5zY2FmZm9sZC5jb3B5U2tlbGV0b25BcHAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiQuZWxlY3Ryb25BcHAucGFja1NrZWxldG9uVG9Bc2FyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5tZXRlb3JBc2FyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmRlc2t0b3BBc2FyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5tb3ZlTm9kZU1vZHVsZXNPdXQoKSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4gcmVqZWN0KGUpKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiByZXNvbHZlKGZhbHNlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHRvIGJlIGludm9rZWQgYWZ0ZXIgcGFja2luZy4gUmVzdG9yZXMgbm9kZV9tb2R1bGVzIHRvIHRoZSAuZGVza3RvcC1idWlsZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBhZnRlclBhY2soY29udGV4dCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5leHRyYWN0ZWROb2RlTW9kdWxlcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnaW5qZWN0aW5nIGV4dHJhY3RlZCBtb2R1bGVzJyk7XG4gICAgICAgICAgICAgICAgc2hlbGwuY3AoXG4gICAgICAgICAgICAgICAgICAgICctUmYnLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzLFxuICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy5nZXRQYWNrYWdlZEFwcFBhdGgoY29udGV4dCksICdub2RlX21vZHVsZXMnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdtb3Zpbmcgbm9kZV9tb2R1bGVzIGJhY2snKTtcbiAgICAgICAgICAgIC8vIE1vdmUgbm9kZV9tb2R1bGVzIGJhY2suXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2hlbGwubXYoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAudG1wTm9kZU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHNoZWxsLmNvbmZpZy5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5maXJzdFBhc3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ25vZGVfbW9kdWxlcyBtb3ZlZCBiYWNrJyk7XG5cbiAgICAgICAgICAgIHRoaXMud2FpdCgpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4gcmVqZWN0KGUpKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgY29tbWFuZCBraWxscyBvcnBoYW5lZCBNU0J1aWxkLmV4ZSBwcm9jZXNzZXMuXG4gICAgICogU29tZXRpbWUgYWZ0ZXIgbmF0aXZlIG5vZGVfbW9kdWxlcyBjb21waWxhdGlvbiB0aGV5IGFyZSBzdGlsbCB3cml0aW5nIHNvbWUgbG9ncyxcbiAgICAgKiBwcmV2ZW50IG5vZGVfbW9kdWxlcyBmcm9tIGJlaW5nIGRlbGV0ZWQuXG4gICAgICovXG4gICAga2lsbE1TQnVpbGQoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRDb250ZXh0LnBsYXRmb3JtLm5vZGVOYW1lICE9PSAnd2luMzInKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG91dCA9IHNwYXduXG4gICAgICAgICAgICAgICAgLnN5bmMoXG4gICAgICAgICAgICAgICAgICAgICd3bWljJyxcbiAgICAgICAgICAgICAgICAgICAgWydwcm9jZXNzJywgJ3doZXJlJywgJ2NhcHRpb249XCJNU0J1aWxkLmV4ZVwiJywgJ2dldCcsICdwcm9jZXNzaWQnXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuc3Rkb3V0LnRvU3RyaW5nKCd1dGYtOCcpXG4gICAgICAgICAgICAgICAgLnNwbGl0KCdcXG4nKTtcblxuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKC8oXFxkKykvLCAnZ20nKTtcbiAgICAgICAgICAgIC8vIE5vIHdlIHdpbGwgY2hlY2sgZm9yIHRob3NlIHdpdGggdGhlIG1hdGNoaW5nIHBhcmFtcy5cbiAgICAgICAgICAgIG91dC5mb3JFYWNoKChsaW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSByZWdleC5leGVjKGxpbmUpIHx8IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1Zyhga2lsbGluZyBNU0J1aWxkLmV4ZSBhdCBwaWQ6ICR7bWF0Y2hbMV19YCk7XG4gICAgICAgICAgICAgICAgICAgIHNwYXduLnN5bmMoJ3Rhc2traWxsJywgWycvcGlkJywgbWF0Y2hbMV0sICcvZicsICcvdCddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1Zygna2lsbCBNU0J1aWxkIGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGF0aCB0byBwYWNrYWdlZCBhcHAuXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRQYWNrYWdlZEFwcFBhdGgoY29udGV4dCA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRDb250ZXh0LnBsYXRmb3JtLm5vZGVOYW1lID09PSAnZGFyd2luJykge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbGxlckRpcixcbiAgICAgICAgICAgICAgICBgJHtjb250ZXh0LnBhY2thZ2VyLmFwcEluZm8ucHJvZHVjdEZpbGVuYW1lfS5hcHBgLFxuICAgICAgICAgICAgICAgICdDb250ZW50cycsICdSZXNvdXJjZXMnLCAnYXBwJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwbGF0Zm9ybURpciA9XG4gICAgICAgICAgICBgJHt0aGlzLmN1cnJlbnRDb250ZXh0LnBsYXRmb3JtLm5vZGVOYW1lID09PSAnd2luMzInID8gJ3dpbicgOiAnbGludXgnfS0ke3RoaXMuY3VycmVudENvbnRleHQuYXJjaCA9PT0gJ2lhMzInID8gJ2lhMzItJyA6ICcnfXVucGFja2VkYDtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihcbiAgICAgICAgICAgIHRoaXMuaW5zdGFsbGVyRGlyLFxuICAgICAgICAgICAgcGxhdGZvcm1EaXIsXG4gICAgICAgICAgICAncmVzb3VyY2VzJywgJ2FwcCdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPbiBXaW5kb3dzIGl0IHdhaXRzIGZvciB0aGUgYXBwLmFzYXIgaW4gdGhlIHBhY2tlZCBhcHAgdG8gYmUgZnJlZSAobm8gZmlsZSBsb2NrcykuXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgd2FpdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudENvbnRleHQucGxhdGZvcm0ubm9kZU5hbWUgIT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhcHBBc2FyUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgIHRoaXMuZ2V0UGFja2FnZWRBcHBQYXRoKCksXG4gICAgICAgICAgICAnYXBwLmFzYXInXG4gICAgICAgICk7XG4gICAgICAgIGxldCByZXRyaWVzID0gMDtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICAgICAgICAgICAgICBmcy5vcGVuKGFwcEFzYXJQYXRoLCAncisnLCAoZXJyLCBmZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXRyaWVzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxvZy5kZWJ1Zyhgd2FpdGluZyBmb3IgYXBwLmFzYXIgdG8gYmUgcmVhZGFibGUsICR7J2NvZGUnIGluIGVyciA/IGBjdXJyZW50bHkgcmVhZGluZyBpdCByZXR1cm5zICR7ZXJyLmNvZGV9YCA6ICcnfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXRyaWVzIDwgNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNoZWNrKCksIDQwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChgZmlsZSBpcyBsb2NrZWQ6ICR7YXBwQXNhclBhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGVjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVwYXJlcyB0aGUgdGFyZ2V0IG9iamVjdCBwYXNzZWQgdG8gdGhlIGVsZWN0cm9uLWJ1aWxkZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TWFwPFBsYXRmb3JtLCBNYXA8QXJjaCwgQXJyYXk8c3RyaW5nPj4+fVxuICAgICAqL1xuICAgIHByZXBhcmVUYXJnZXRzKCkge1xuICAgICAgICBsZXQgYXJjaCA9IHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyID8gJ2lhMzInIDogJ3g2NCc7XG4gICAgICAgIGFyY2ggPSB0aGlzLiQuZW52Lm9wdGlvbnMuYWxsQXJjaHMgPyAnYWxsJyA6IGFyY2g7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLiQuZW52Lm9wdGlvbnMud2luKSB7XG4gICAgICAgICAgICB0YXJnZXRzLnB1c2godGhpcy5idWlsZGVyLmRlcGVuZGVuY3kuUGxhdGZvcm0uV0lORE9XUyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5saW51eCkge1xuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LlBsYXRmb3JtLkxJTlVYKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLm1hYykge1xuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LlBsYXRmb3JtLk1BQyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiQuZW52Lm9zLmlzV2luZG93cykge1xuICAgICAgICAgICAgICAgIHRhcmdldHMucHVzaCh0aGlzLmJ1aWxkZXIuZGVwZW5kZW5jeS5QbGF0Zm9ybS5XSU5ET1dTKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy4kLmVudi5vcy5pc0xpbnV4KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LlBsYXRmb3JtLkxJTlVYKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LlBsYXRmb3JtLk1BQyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LmNyZWF0ZVRhcmdldHModGFyZ2V0cywgbnVsbCwgYXJjaCk7XG4gICAgfVxuXG4gICAgYXN5bmMgYnVpbGQoKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgaWYgKCEoJ2J1aWxkZXJPcHRpb25zJyBpbiBzZXR0aW5ncykpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICdubyBidWlsZGVyT3B0aW9ucyBpbiBzZXR0aW5ncy5qc29uLCBhYm9ydGluZydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBidWlsZGVyT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzLmJ1aWxkZXJPcHRpb25zKTtcblxuICAgICAgICBidWlsZGVyT3B0aW9ucy5hc2FyID0gZmFsc2U7XG4gICAgICAgIGJ1aWxkZXJPcHRpb25zLm5wbVJlYnVpbGQgPSB0cnVlO1xuXG4gICAgICAgIGJ1aWxkZXJPcHRpb25zLmJlZm9yZUJ1aWxkID0gdGhpcy5iZWZvcmVCdWlsZC5iaW5kKHRoaXMpO1xuICAgICAgICBidWlsZGVyT3B0aW9ucy5hZnRlclBhY2sgPSB0aGlzLmFmdGVyUGFjay5iaW5kKHRoaXMpO1xuICAgICAgICBidWlsZGVyT3B0aW9ucy5lbGVjdHJvblZlcnNpb24gPSB0aGlzLiQuZ2V0RWxlY3Ryb25WZXJzaW9uKCk7XG5cbiAgICAgICAgYnVpbGRlck9wdGlvbnMuZGlyZWN0b3JpZXMgPSB7XG4gICAgICAgICAgICBhcHA6IHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCxcbiAgICAgICAgICAgIG91dHB1dDogcGF0aC5qb2luKHRoaXMuJC5lbnYub3B0aW9ucy5vdXRwdXQsIHRoaXMuJC5lbnYucGF0aHMuaW5zdGFsbGVyRGlyKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnY2FsbGluZyBidWlsZCBmcm9tIGVsZWN0cm9uLWJ1aWxkZXInKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYnVpbGRlci5kZXBlbmRlbmN5LmJ1aWxkKE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IHRoaXMucHJlcGFyZVRhcmdldHMoKSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGJ1aWxkZXJPcHRpb25zXG4gICAgICAgICAgICB9LCBzZXR0aW5ncy5idWlsZGVyQ2xpT3B0aW9ucykpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzKSkge1xuICAgICAgICAgICAgICAgIHNoZWxsLnJtKCctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIGJ1aWxkaW5nIGluc3RhbGxlcjogJywgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBub2RlX21vZHVsZXMgb3V0IG9mIHRoZSBhcHAgYmVjYXVzZSB3aGlsZSB0aGUgYXBwIHdpbGwgYmUgcGFja2FnZWRcbiAgICAgKiB3ZSBkbyBub3Qgd2FudCBpdCB0byBiZSB0aGVyZS5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIG1vdmVOb2RlTW9kdWxlc091dCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdtb3Zpbmcgbm9kZV9tb2R1bGVzIG91dCwgYmVjYXVzZSB3ZSBoYXZlIHRoZW0gYWxyZWFkeSBpbicgK1xuICAgICAgICAgICAgICAgICcgYXBwLmFzYXInKTtcbiAgICAgICAgICAgIHRoaXMua2lsbE1TQnVpbGQoKTtcbiAgICAgICAgICAgIHJlbW92ZURpcih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHJlamVjdChlKSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNoZWxsLmNvbmZpZy5mYXRhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNoZWxsLmNvbmZpZy52ZXJib3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsLm12KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoZWxsLmNvbmZpZy5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FpdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVsbC5jb25maWcucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4gcmVqZWN0KGUpKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHJlbW92ZURpcih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzLCAxMDAwKSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZSA9PiByZWplY3QoZSkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy53YWl0KCkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19