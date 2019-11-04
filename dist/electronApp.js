"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _asar = _interopRequireDefault(require("asar"));

var _assignIn = _interopRequireDefault(require("lodash/assignIn"));

var _lodash = _interopRequireDefault(require("lodash"));

var _installLocal = require("install-local");

var _core = require("@babel/core");

var _crypto = _interopRequireDefault(require("crypto"));

var _del = _interopRequireDefault(require("del"));

var _presetEnv = _interopRequireDefault(require("@babel/preset-env"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _semver = _interopRequireDefault(require("semver"));

var _terser = _interopRequireDefault(require("terser"));

var _log = _interopRequireDefault(require("./log"));

var _electronAppScaffold = _interopRequireDefault(require("./electronAppScaffold"));

var _dependenciesManager = _interopRequireDefault(require("./dependenciesManager"));

var _binaryModulesDetector = _interopRequireDefault(require("./binaryModulesDetector"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_shelljs.default.config.fatal = true;
/**
 * Represents the .desktop dir scaffold.
 * @class
 */

var ElectronApp =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   * @constructor
   */
  function ElectronApp($) {
    _classCallCheck(this, ElectronApp);

    this.log = new _log.default('electronApp');
    this.scaffold = new _electronAppScaffold.default($);
    this.depsManager = new _dependenciesManager.default($, this.scaffold.getDefaultPackageJson().dependencies);
    this.$ = $;
    this.meteorApp = this.$.meteorApp;
    this.packageJson = null;
    this.version = null;
    this.compatibilityVersion = null;
    this.deprectatedPlugins = ['meteor-desktop-localstorage'];
  }
  /**
   * Makes an app.asar from the skeleton app.
   * @property {Array} excludeFromDel - list of paths to exclude from deleting
   * @returns {Promise}
   */


  _createClass(ElectronApp, [{
    key: "packSkeletonToAsar",
    value: function packSkeletonToAsar() {
      var _this = this;

      var excludeFromDel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.log.info('packing skeleton app and node_modules to asar archive');
      return new Promise(function (resolve) {
        var extract = _this.getModulesToExtract(); // We want to pack skeleton app and node_modules together, so we need to temporarily
        // move node_modules to app dir.


        _this.log.debug('moving node_modules to app dir');

        _fs.default.renameSync(_this.$.env.paths.electronApp.nodeModules, _path.default.join(_this.$.env.paths.electronApp.appRoot, 'node_modules'));

        var extracted = false;
        extracted = _this.extractModules(extract);

        _this.log.debug('packing');

        _asar.default.createPackage(_this.$.env.paths.electronApp.appRoot, _this.$.env.paths.electronApp.appAsar, function () {
          // Lets move the node_modules back.
          _this.log.debug('moving node_modules back from app dir');

          _shelljs.default.mv(_path.default.join(_this.$.env.paths.electronApp.appRoot, 'node_modules'), _this.$.env.paths.electronApp.nodeModules);

          if (extracted) {
            // We need to create a full node modules back. In other words we want
            // the extracted modules back.
            extract.forEach(function (module) {
              return _shelljs.default.cp('-rf', _path.default.join(_this.$.env.paths.electronApp.extractedNodeModules, module), _path.default.join(_this.$.env.paths.electronApp.nodeModules, module));
            }); // Get the .bin back.

            if (_this.$.utils.exists(_this.$.env.paths.electronApp.extractedNodeModulesBin)) {
              _shelljs.default.cp(_path.default.join(_this.$.env.paths.electronApp.extractedNodeModulesBin, '*'), _path.default.join(_this.$.env.paths.electronApp.nodeModules, '.bin'));
            }
          }

          _this.log.debug('deleting source files');

          var exclude = [_this.$.env.paths.electronApp.nodeModules].concat([_this.$.env.paths.electronApp.appAsar, _this.$.env.paths.electronApp.packageJson], excludeFromDel);

          _del.default.sync([`${_this.$.env.paths.electronApp.root}${_path.default.sep}*`].concat(exclude.map(function (pathToExclude) {
            return `!${pathToExclude}`;
          })));

          resolve();
        });
      });
    }
    /**
     * Moves specified node modules to a separate directory.
     * @param {Array} extract
     * @returns {boolean}
     */

  }, {
    key: "extractModules",
    value: function extractModules(extract) {
      var _this2 = this;

      var ext = ['.js', '.bat', '.sh', '.cmd', ''];

      if (extract.length > 0) {
        if (this.$.utils.exists(this.$.env.paths.electronApp.extractedNodeModules)) {
          _shelljs.default.rm('-rf', this.$.env.paths.electronApp.extractedNodeModules);
        }

        _fs.default.mkdirSync(this.$.env.paths.electronApp.extractedNodeModules);

        _fs.default.mkdirSync(this.$.env.paths.electronApp.extractedNodeModulesBin);

        extract.forEach(function (module) {
          _fs.default.renameSync(_path.default.join(_this2.$.env.paths.electronApp.appRoot, 'node_modules', module), _path.default.join(_this2.$.env.paths.electronApp.extractedNodeModules, module)); // Move bins.


          _this2.extractBin(module, ext);
        });
        return true;
      }

      return false;
    }
    /**
     * Extracts the bin files associated with a certain node modules.
     *
     * @param module
     * @param ext
     */

  }, {
    key: "extractBin",
    value: function extractBin(module, ext) {
      var _this3 = this;

      var packageJson;

      try {
        packageJson = JSON.parse(_fs.default.readFileSync(_path.default.join(this.$.env.paths.electronApp.extractedNodeModules, module, 'package.json'), 'utf8'));
      } catch (e) {
        packageJson = {};
      }

      var bins = 'bin' in packageJson && typeof packageJson.bin === 'object' ? Object.keys(packageJson.bin) : [];

      if (bins.length > 0) {
        bins.forEach(function (bin) {
          ext.forEach(function (extension) {
            var binFilePath = _path.default.join(_this3.$.env.paths.electronApp.appRoot, 'node_modules', '.bin', `${bin}${extension}`);

            if (_this3.$.utils.exists(binFilePath) || _this3.$.utils.symlinkExists(binFilePath)) {
              _fs.default.renameSync(binFilePath, _path.default.join(_this3.$.env.paths.electronApp.extractedNodeModulesBin, `${bin}${extension}`));
            }
          });
        });
      }
    }
    /**
     * Merges the `extract` field with automatically detected modules.
     */

  }, {
    key: "getModulesToExtract",
    value: function getModulesToExtract() {
      var binaryModulesDetector = new _binaryModulesDetector.default(this.$.env.paths.electronApp.nodeModules);
      var toBeExtracted = binaryModulesDetector.detect();

      var _$$desktop$getSetting = this.$.desktop.getSettings(),
          extract = _$$desktop$getSetting.extract;

      if (!Array.isArray(extract)) {
        extract = [];
      }

      var merge = {};
      toBeExtracted.concat(extract).forEach(function (module) {
        merge[module] = true;
      });
      extract = Object.keys(merge);

      if (extract.length > 0) {
        this.log.verbose(`resultant modules to extract list is: ${extract.join(', ')}`);
      }

      return extract;
    }
    /**
     * Calculates a md5 from all dependencies.
     */

  }, {
    key: "calculateCompatibilityVersion",
    value: function calculateCompatibilityVersion() {
      this.log.verbose('calculating compatibility version');
      var settings = this.$.desktop.getSettings();

      if ('desktopHCPCompatibilityVersion' in settings) {
        this.compatibilityVersion = `${settings.desktopHCPCompatibilityVersion}`;
        this.log.warn(`compatibility version overridden to ${this.compatibilityVersion}`);
        return;
      }

      var md5 = _crypto.default.createHash('md5');

      var dependencies = this.depsManager.getDependencies();
      var dependenciesSorted = Object.keys(dependencies).sort();
      dependencies = dependenciesSorted.map(function (dependency) {
        return `${dependency}:${dependencies[dependency]}`;
      });
      var mainCompatibilityVersion = this.$.getVersion().split('.');
      this.log.debug('meteor-desktop compatibility version is ', `${mainCompatibilityVersion[0]}`);
      dependencies.push(`meteor-desktop:${mainCompatibilityVersion[0]}`);
      var desktopCompatibilityVersion = settings.version.split('.')[0];
      this.log.debug('.desktop compatibility version is ', desktopCompatibilityVersion);
      dependencies.push(`desktop-app:${desktopCompatibilityVersion}`);

      if (process.env.METEOR_DESKTOP_DEBUG_DESKTOP_COMPATIBILITY_VERSION || process.env.METEOR_DESKTOP_DEBUG) {
        this.log.debug(`compatibility version calculated from ${JSON.stringify(dependencies)}`);
      }

      md5.update(JSON.stringify(dependencies));
      this.compatibilityVersion = md5.digest('hex');
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
                _context.prev = 0;
                _context.next = 3;
                return this.$.electron.init();

              case 3:
                _context.next = 5;
                return this.$.electronBuilder.init();

              case 5:
                _context.next = 11;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                this.log.warn('error occurred while initialising electron and electron-builder integration', _context.t0);
                process.exit(1);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
      }));

      return function init() {
        return _init.apply(this, arguments);
      };
    }()
    /**
     * Runs all necessary tasks to build the desktopified app.
     */

  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee2() {
        var run,
            nodeModulesRemoved,
            _args2 = arguments;
        return _runtime.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                run = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;
                // TODO: refactor to a task runner
                this.log.info('scaffolding');

                if (!this.$.desktop.check()) {
                  if (!this.$.env.options.scaffold) {
                    this.log.error('seems that you do not have a .desktop dir in your project or it is' + ' corrupted. Run \'npm run desktop -- init\' to get a new one.'); // Do not fail, so that npm will not print his error stuff to console.

                    process.exit(0);
                  } else {
                    this.$.desktop.scaffold();
                    this.$.meteorApp.updateGitIgnore();
                  }
                }

                _context2.next = 5;
                return this.init();

              case 5:
                try {
                  this.$.meteorApp.updateGitIgnore();
                } catch (e) {
                  this.log.warn(`error occurred while adding ${this.$.env.paths.electronApp.rootName}` + 'to .gitignore: ', e);
                }

                _context2.prev = 6;
                _context2.next = 9;
                return this.$.meteorApp.removeDeprecatedPackages();

              case 9:
                _context2.next = 15;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2["catch"](6);
                this.log.error('error while removing deprecated packages: ', _context2.t0);
                process.exit(1);

              case 15:
                _context2.prev = 15;
                _context2.next = 18;
                return this.$.meteorApp.ensureDesktopHCPPackages();

              case 18:
                _context2.next = 24;
                break;

              case 20:
                _context2.prev = 20;
                _context2.t1 = _context2["catch"](15);
                this.log.error('error while checking for required packages: ', _context2.t1);
                process.exit(1);

              case 24:
                _context2.prev = 24;
                _context2.next = 27;
                return this.scaffold.make();

              case 27:
                _context2.next = 33;
                break;

              case 29:
                _context2.prev = 29;
                _context2.t2 = _context2["catch"](24);
                this.log.error('error while scaffolding: ', _context2.t2);
                process.exit(1);

              case 33:
                _context2.prev = 33;
                _context2.next = 36;
                return this.exposeElectronModules();

              case 36:
                _context2.next = 42;
                break;

              case 38:
                _context2.prev = 38;
                _context2.t3 = _context2["catch"](33);
                this.log.error('error while exposing electron modules: ', _context2.t3);
                process.exit(1);

              case 42:
                try {
                  this.updatePackageJsonFields();
                } catch (e) {
                  this.log.error('error while updating package.json: ', e);
                }

                try {
                  this.updateDependenciesList();
                } catch (e) {
                  this.log.error('error while merging dependencies list: ', e);
                }

                try {
                  this.calculateCompatibilityVersion();
                } catch (e) {
                  this.log.error('error while calculating compatibility version: ', e);
                  process.exit(1);
                }

                _context2.prev = 45;
                _context2.next = 48;
                return this.handleTemporaryNodeModules();

              case 48:
                _context2.next = 54;
                break;

              case 50:
                _context2.prev = 50;
                _context2.t4 = _context2["catch"](45);
                this.log.error('error occurred while handling temporary node_modules: ', _context2.t4);
                process.exit(1);

              case 54:
                _context2.prev = 54;
                _context2.next = 57;
                return this.handleStateOfNodeModules();

              case 57:
                nodeModulesRemoved = _context2.sent;
                _context2.next = 64;
                break;

              case 60:
                _context2.prev = 60;
                _context2.t5 = _context2["catch"](54);
                this.log.error('error occurred while clearing node_modules: ', _context2.t5);
                process.exit(1);

              case 64:
                _context2.prev = 64;
                _context2.next = 67;
                return this.rebuildDeps(true);

              case 67:
                _context2.next = 73;
                break;

              case 69:
                _context2.prev = 69;
                _context2.t6 = _context2["catch"](64);
                this.log.error('error occurred while installing node_modules: ', _context2.t6);
                process.exit(1);

              case 73:
                if (nodeModulesRemoved) {
                  _context2.next = 83;
                  break;
                }

                _context2.prev = 74;
                _context2.next = 77;
                return this.rebuildDeps();

              case 77:
                _context2.next = 83;
                break;

              case 79:
                _context2.prev = 79;
                _context2.t7 = _context2["catch"](74);
                this.log.error('error occurred while rebuilding native node modules: ', _context2.t7);
                process.exit(1);

              case 83:
                _context2.prev = 83;
                _context2.next = 86;
                return this.linkNpmPackages();

              case 86:
                _context2.next = 92;
                break;

              case 88:
                _context2.prev = 88;
                _context2.t8 = _context2["catch"](83);
                this.log.error(`linking packages failed: ${_context2.t8}`);
                process.exit(1);

              case 92:
                _context2.prev = 92;
                _context2.next = 95;
                return this.installLocalNodeModules();

              case 95:
                _context2.next = 101;
                break;

              case 97:
                _context2.prev = 97;
                _context2.t9 = _context2["catch"](92);
                this.log.error('error occurred while installing local node modules: ', _context2.t9);
                process.exit(1);

              case 101:
                _context2.prev = 101;
                _context2.next = 104;
                return this.ensureMeteorDependencies();

              case 104:
                _context2.next = 110;
                break;

              case 106:
                _context2.prev = 106;
                _context2.t10 = _context2["catch"](101);
                this.log.error('error occurred while ensuring meteor dependencies are installed: ', _context2.t10);
                process.exit(1);

              case 110:
                if (!this.$.env.isProductionBuild()) {
                  _context2.next = 120;
                  break;
                }

                _context2.prev = 111;
                _context2.next = 114;
                return this.packSkeletonToAsar();

              case 114:
                _context2.next = 120;
                break;

              case 116:
                _context2.prev = 116;
                _context2.t11 = _context2["catch"](111);
                this.log.error('error while packing skeleton to asar: ', _context2.t11);
                process.exit(1);

              case 120:
                // TODO: find a way to avoid copying .desktop to a temp location
                try {
                  this.copyDesktopToDesktopTemp();
                } catch (e) {
                  this.log.error('error while copying .desktop to a temporary location: ', e);
                  process.exit(1);
                }

                _context2.prev = 121;
                _context2.next = 124;
                return this.updateSettingsJsonFields();

              case 124:
                _context2.next = 130;
                break;

              case 126:
                _context2.prev = 126;
                _context2.t12 = _context2["catch"](121);
                this.log.error('error while updating settings.json: ', _context2.t12);
                process.exit(1);

              case 130:
                _context2.prev = 130;
                _context2.next = 133;
                return this.excludeFilesFromArchive();

              case 133:
                _context2.next = 139;
                break;

              case 135:
                _context2.prev = 135;
                _context2.t13 = _context2["catch"](130);
                this.log.error('error while excluding files from packing to asar: ', _context2.t13);
                process.exit(1);

              case 139:
                _context2.prev = 139;
                _context2.next = 142;
                return this.transpileAndMinify();

              case 142:
                _context2.next = 147;
                break;

              case 144:
                _context2.prev = 144;
                _context2.t14 = _context2["catch"](139);
                this.log.error('error while transpiling or minifying: ', _context2.t14);

              case 147:
                _context2.prev = 147;
                _context2.next = 150;
                return this.packDesktopToAsar();

              case 150:
                _context2.next = 156;
                break;

              case 152:
                _context2.prev = 152;
                _context2.t15 = _context2["catch"](147);
                this.log.error('error occurred while packing .desktop to asar: ', _context2.t15);
                process.exit(1);

              case 156:
                _context2.prev = 156;
                _context2.next = 159;
                return this.getMeteorClientBuild();

              case 159:
                _context2.next = 164;
                break;

              case 161:
                _context2.prev = 161;
                _context2.t16 = _context2["catch"](156);
                this.log.error('error occurred during getting meteor mobile build: ', _context2.t16);

              case 164:
                if (run) {
                  this.log.info('running');
                  this.$.electron.run();
                } else {
                  this.log.info('built');
                }

              case 165:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 11], [15, 20], [24, 29], [33, 38], [45, 50], [54, 60], [64, 69], [74, 79], [83, 88], [92, 97], [101, 106], [111, 116], [121, 126], [130, 135], [139, 144], [147, 152], [156, 161]]);
      }));

      return function build() {
        return _build.apply(this, arguments);
      };
    }()
    /**
     * Copies the `exposedModules` setting from `settings.json` into `preload.js` modifying its code
     * so that the script will have it hardcoded.
     */

  }, {
    key: "exposeElectronModules",
    value: function exposeElectronModules() {
      var _$$desktop$getSetting2 = this.$.desktop.getSettings(),
          exposedModules = _$$desktop$getSetting2.exposedModules;

      if (exposedModules && Array.isArray(exposedModules) && exposedModules.length > 0) {
        var preload = _fs.default.readFileSync(this.$.env.paths.electronApp.preload, 'utf8');

        var modules = this.$.desktop.getSettings().exposedModules.reduce( // eslint-disable-next-line no-return-assign,no-param-reassign
        function (prev, module) {
          return prev += `'${module}', `, prev;
        }, '');
        preload = preload.replace('const exposedModules = [', `const exposedModules = [${modules}`);

        _fs.default.writeFileSync(this.$.env.paths.electronApp.preload, preload);
      }
    }
    /**
     * Ensures all required dependencies are added to the Meteor project.
     * @returns {Promise.<void>}
     */

  }, {
    key: "ensureMeteorDependencies",
    value: function () {
      var _ensureMeteorDependencies = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee3() {
        var _this4 = this;

        var packages, packagesWithVersion, plugins, packagesCount;
        return _runtime.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                packages = [];
                packagesWithVersion = [];
                plugins = 'plugins [';
                Object.keys(this.$.desktop.getDependencies().plugins).forEach(function (plugin) {
                  // Read package.json of the plugin.
                  var packageJson = JSON.parse(_fs.default.readFileSync(_path.default.join(_this4.$.env.paths.electronApp.nodeModules, plugin, 'package.json'), 'utf8'));

                  if ('meteorDependencies' in packageJson && typeof packageJson.meteorDependencies === 'object') {
                    var _packages;

                    plugins += `${plugin}, `;

                    (_packages = packages).unshift.apply(_packages, _toConsumableArray(Object.keys(packageJson.meteorDependencies)));

                    packagesWithVersion.unshift.apply(packagesWithVersion, _toConsumableArray(packages.map(function (packageName) {
                      if (packageJson.meteorDependencies[packageName] === '@version') {
                        return `${packageName}@${packageJson.version}`;
                      }

                      return `${packageName}@${packageJson.meteorDependencies[packageName]}`;
                    })));
                  }
                });
                packagesCount = packages.length;
                packages = packages.filter(function (value) {
                  return !_this4.deprectatedPlugins.includes(value);
                });

                if (packagesCount !== packages.length) {
                  this.log.warn('you have some deprecated meteor desktop plugins in your settings, please remove ' + `them (deprecated plugins: ${this.deprectatedPlugins.join(', ')})`);
                }

                if (!(packages.length > 0)) {
                  _context3.next = 17;
                  break;
                }

                plugins = `${plugins.substr(0, plugins.length - 2)}]`;
                _context3.prev = 9;
                _context3.next = 12;
                return this.$.meteorApp.meteorManager.ensurePackages(packages, packagesWithVersion, plugins);

              case 12:
                _context3.next = 17;
                break;

              case 14:
                _context3.prev = 14;
                _context3.t0 = _context3["catch"](9);
                throw new Error(_context3.t0);

              case 17:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[9, 14]]);
      }));

      return function ensureMeteorDependencies() {
        return _ensureMeteorDependencies.apply(this, arguments);
      };
    }()
    /**
     * Builds meteor app.
     */

  }, {
    key: "getMeteorClientBuild",
    value: function () {
      var _getMeteorClientBuild = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee4() {
        return _runtime.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.$.meteorApp.build();

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function getMeteorClientBuild() {
        return _getMeteorClientBuild.apply(this, arguments);
      };
    }()
    /**
     * Removes node_modules if needed.
     * @returns {Promise<void>}
     */

  }, {
    key: "handleStateOfNodeModules",
    value: function () {
      var _handleStateOfNodeModules = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee5() {
        return _runtime.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(this.$.env.isProductionBuild() || this.$.env.options.ia32)) {
                  _context5.next = 11;
                  break;
                }

                if (!this.$.env.isProductionBuild()) {
                  this.log.info('clearing node_modules because we need to have it clear for ia32 rebuild');
                } else {
                  this.log.info('clearing node_modules because this is a production build');
                }

                _context5.prev = 2;
                _context5.next = 5;
                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.nodeModules);

              case 5:
                _context5.next = 10;
                break;

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5["catch"](2);
                throw new Error(_context5.t0);

              case 10:
                return _context5.abrupt("return", true);

              case 11:
                return _context5.abrupt("return", false);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[2, 7]]);
      }));

      return function handleStateOfNodeModules() {
        return _handleStateOfNodeModules.apply(this, arguments);
      };
    }()
    /**
     * If there is a temporary node_modules folder and no node_modules folder, we will
     * restore it, as it might be a leftover from an interrupted flow.
     * @returns {Promise<void>}
     */

  }, {
    key: "handleTemporaryNodeModules",
    value: function () {
      var _handleTemporaryNodeModules = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee6() {
        return _runtime.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this.$.utils.exists(this.$.env.paths.electronApp.tmpNodeModules)) {
                  _context6.next = 15;
                  break;
                }

                if (this.$.utils.exists(this.$.env.paths.electronApp.nodeModules)) {
                  _context6.next = 6;
                  break;
                }

                this.log.debug('moving temp node_modules back');

                _shelljs.default.mv(this.$.env.paths.electronApp.tmpNodeModules, this.$.env.paths.electronApp.nodeModules);

                _context6.next = 15;
                break;

              case 6:
                // If there is a node_modules folder, we should clear the temporary one.
                this.log.debug('clearing temp node_modules because new one is already created');
                _context6.prev = 7;
                _context6.next = 10;
                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.tmpNodeModules);

              case 10:
                _context6.next = 15;
                break;

              case 12:
                _context6.prev = 12;
                _context6.t0 = _context6["catch"](7);
                throw new Error(_context6.t0);

              case 15:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[7, 12]]);
      }));

      return function handleTemporaryNodeModules() {
        return _handleTemporaryNodeModules.apply(this, arguments);
      };
    }()
    /**
     * Runs npm link for every package specified in settings.json->linkPackages.
     */

  }, {
    key: "linkNpmPackages",
    value: function () {
      var _linkNpmPackages = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee7() {
        var _this5 = this;

        var settings, promises;
        return _runtime.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!this.$.env.isProductionBuild()) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return");

              case 2:
                settings = this.$.desktop.getSettings();
                promises = [];

                if ('linkPackages' in this.$.desktop.getSettings()) {
                  if (Array.isArray(settings.linkPackages)) {
                    settings.linkPackages.forEach(function (packageName) {
                      return promises.push(_this5.$.meteorApp.runNpm(['link', packageName], undefined, _this5.$.env.paths.electronApp.root));
                    });
                  }
                }

                _context7.next = 7;
                return Promise.all(promises);

              case 7:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      return function linkNpmPackages() {
        return _linkNpmPackages.apply(this, arguments);
      };
    }()
    /**
     * Runs npm in the electron app to get the dependencies installed.
     * @returns {Promise}
     */

  }, {
    key: "ensureDeps",
    value: function () {
      var _ensureDeps = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee8() {
        return _runtime.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                this.log.info('installing dependencies');

                if (!this.$.utils.exists(this.$.env.paths.electronApp.nodeModules)) {
                  _context8.next = 11;
                  break;
                }

                this.log.debug('running npm prune to wipe unneeded dependencies');
                _context8.prev = 3;
                _context8.next = 6;
                return this.runNpm(['prune']);

              case 6:
                _context8.next = 11;
                break;

              case 8:
                _context8.prev = 8;
                _context8.t0 = _context8["catch"](3);
                throw new Error(_context8.t0);

              case 11:
                _context8.prev = 11;
                _context8.next = 14;
                return this.runNpm(['install'], this.$.env.stdio);

              case 14:
                _context8.next = 19;
                break;

              case 16:
                _context8.prev = 16;
                _context8.t1 = _context8["catch"](11);
                throw new Error(_context8.t1);

              case 19:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[3, 8], [11, 16]]);
      }));

      return function ensureDeps() {
        return _ensureDeps.apply(this, arguments);
      };
    }()
    /**
     * Warns if plugins version are outdated in compare to the newest scaffold.
     * @param {Object} pluginsVersions - current plugins versions from settings.json
     */

  }, {
    key: "checkPluginsVersion",
    value: function checkPluginsVersion(pluginsVersions) {
      var _this6 = this;

      var settingsJson = JSON.parse(_fs.default.readFileSync(_path.default.join(this.$.env.paths.scaffold, 'settings.json')));
      var scaffoldPluginsVersion = this.$.desktop.getDependencies(settingsJson, false).plugins;
      Object.keys(pluginsVersions).forEach(function (pluginName) {
        if (pluginName in scaffoldPluginsVersion && scaffoldPluginsVersion[pluginName] !== pluginsVersions[pluginName] && _semver.default.lt(pluginsVersions[pluginName], scaffoldPluginsVersion[pluginName])) {
          _this6.log.warn(`you are using outdated version ${pluginsVersions[pluginName]} of ` + `${pluginName}, the suggested version to use is ` + `${scaffoldPluginsVersion[pluginName]}`);
        }
      });
    }
    /**
     * Merges core dependency list with the dependencies from .desktop.
     */

  }, {
    key: "updateDependenciesList",
    value: function updateDependenciesList() {
      var _this7 = this;

      this.log.info('updating list of package.json\'s dependencies');
      var desktopDependencies = this.$.desktop.getDependencies();
      this.checkPluginsVersion(desktopDependencies.plugins);
      this.log.debug('merging settings.json[dependencies]');
      this.depsManager.mergeDependencies('settings.json[dependencies]', desktopDependencies.fromSettings);
      this.log.debug('merging settings.json[plugins]');
      this.depsManager.mergeDependencies('settings.json[plugins]', desktopDependencies.plugins);
      this.log.debug('merging dependencies from modules');
      Object.keys(desktopDependencies.modules).forEach(function (module) {
        return _this7.depsManager.mergeDependencies(`module[${module}]`, desktopDependencies.modules[module]);
      });
      this.packageJson.dependencies = this.depsManager.getRemoteDependencies();
      this.packageJson.localDependencies = this.depsManager.getLocalDependencies();
      this.log.debug('writing updated package.json');

      _fs.default.writeFileSync(this.$.env.paths.electronApp.packageJson, JSON.stringify(this.packageJson, null, 2));
    }
    /**
     * Install node modules from local paths using local-install.
     *
     * @param {string} arch
     * @returns {Promise}
     */

  }, {
    key: "installLocalNodeModules",
    value: function installLocalNodeModules() {
      var arch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.$.env.options.ia32 || process.arch === 'ia32' ? 'ia32' : 'x64';

      var localDependencies = _lodash.default.values(this.packageJson.localDependencies);

      if (localDependencies.length === 0) {
        return Promise.resolve();
      }

      this.log.info('installing local node modules');
      var lastRebuild = this.$.electronBuilder.prepareLastRebuildObject(arch);
      var env = this.$.electronBuilder.getGypEnv(lastRebuild.frameworkInfo, lastRebuild.platform, lastRebuild.arch);
      var installer = new _installLocal.LocalInstaller({
        [this.$.env.paths.electronApp.root]: localDependencies
      }, {
        npmEnv: env
      });
      (0, _installLocal.progress)(installer);
      return installer.install();
    }
    /**
     * Rebuild binary dependencies against Electron's node headers.
     * @returns {Promise}
     */

  }, {
    key: "rebuildDeps",
    value: function rebuildDeps() {
      var install = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (install) {
        this.log.info('issuing node_modules install from electron-builder');
      } else {
        this.log.info('issuing native modules rebuild from electron-builder');
      }

      var arch = this.$.env.options.ia32 || process.arch === 'ia32' ? 'ia32' : 'x64';

      if (this.$.env.options.ia32) {
        this.log.verbose('forcing rebuild for 32bit');
      } else {
        this.log.verbose(`rebuilding for ${arch}`);
      }

      return this.$.electronBuilder.installOrRebuild(arch, undefined, install);
    }
    /**
     * Update package.json fields accordingly to what is set in settings.json.
     *
     * packageJson.name = settings.projectName
     * packageJson.version = settings.version
     * packageJson.* = settings.packageJsonFields
     */

  }, {
    key: "updatePackageJsonFields",
    value: function updatePackageJsonFields() {
      this.log.verbose('updating package.json fields');
      var settings = this.$.desktop.getSettings();
      /** @type {desktopSettings} */

      var packageJson = this.scaffold.getDefaultPackageJson();
      packageJson.version = settings.version;

      if ('packageJsonFields' in settings) {
        (0, _assignIn.default)(packageJson, settings.packageJsonFields);
      }

      (0, _assignIn.default)(packageJson, {
        name: settings.projectName
      });
      this.log.debug('writing updated package.json');

      _fs.default.writeFileSync(this.$.env.paths.electronApp.packageJson, JSON.stringify(packageJson, null, 4));

      this.packageJson = packageJson;
    }
    /**
     * Updates settings.json with env (prod/dev) information and versions.
     */

  }, {
    key: "updateSettingsJsonFields",
    value: function () {
      var _updateSettingsJsonFields = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee9() {
        var settings, version;
        return _runtime.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                this.log.debug('updating settings.json fields');
                settings = this.$.desktop.getSettings(); // Save versions.

                settings.compatibilityVersion = this.compatibilityVersion; // Pass information about build type to the settings.json.

                settings.env = this.$.env.isProductionBuild() ? 'prod' : 'dev';
                _context9.next = 6;
                return this.$.desktop.getHashVersion();

              case 6:
                version = _context9.sent;
                settings.desktopVersion = `${version}_${settings.env}`;
                settings.meteorDesktopVersion = this.$.getVersion();

                if (this.$.env.options.prodDebug) {
                  settings.prodDebug = true;
                }

                _fs.default.writeFileSync(this.$.env.paths.desktopTmp.settings, JSON.stringify(settings, null, 4));

              case 11:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      return function updateSettingsJsonFields() {
        return _updateSettingsJsonFields.apply(this, arguments);
      };
    }()
    /**
     * Copies files from prepared .desktop to desktop.asar in electron app.
     */

  }, {
    key: "packDesktopToAsar",
    value: function packDesktopToAsar() {
      var _this8 = this;

      this.log.info('packing .desktop to asar');
      return new Promise(function (resolve, reject) {
        _asar.default.createPackage(_this8.$.env.paths.desktopTmp.root, _this8.$.env.paths.electronApp.desktopAsar, function () {
          _this8.log.verbose('clearing temporary .desktop');

          _this8.$.utils.rmWithRetries('-rf', _this8.$.env.paths.desktopTmp.root).then(function () {
            resolve();
          }).catch(function (e) {
            reject(e);
          });

          resolve();
        });
      });
    }
    /**
     * Makes a temporary copy of .desktop.
     */

  }, {
    key: "copyDesktopToDesktopTemp",
    value: function copyDesktopToDesktopTemp() {
      this.log.verbose('copying .desktop to temporary location');

      _shelljs.default.cp('-rf', this.$.env.paths.desktop.root, this.$.env.paths.desktopTmp.root); // Remove test files.


      _del.default.sync([_path.default.join(this.$.env.paths.desktopTmp.root, '**', '*.test.js')]);
    }
    /**
     * Runs babel and uglify over .desktop if requested.
     */

  }, {
    key: "transpileAndMinify",
    value: function () {
      var _transpileAndMinify = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee10() {
        var settings, options, uglifyingEnabled, preset, _ref, files;

        return _runtime.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this.log.info('transpiling and uglifying');
                settings = this.$.desktop.getSettings();
                options = 'uglifyOptions' in settings ? settings.uglifyOptions : {};
                uglifyingEnabled = 'uglify' in settings && !!settings.uglify;
                preset = (0, _presetEnv.default)(undefined, {
                  targets: {
                    node: '8'
                  }
                });
                _context10.next = 7;
                return this.$.utils.readDir(this.$.env.paths.desktopTmp.root);

              case 7:
                _ref = _context10.sent;
                files = _ref.data;
                files.forEach(function (file) {
                  if (file.endsWith('.js')) {
                    var _transformFileSync = (0, _core.transformFileSync)(file, {
                      presets: [preset]
                    }),
                        code = _transformFileSync.code;

                    var error;

                    if (settings.env === 'prod' && uglifyingEnabled) {
                      var _uglify$minify = _terser.default.minify(code, options);

                      code = _uglify$minify.code;
                      error = _uglify$minify.error;
                    }

                    if (error) {
                      throw new Error(error);
                    }

                    _fs.default.writeFileSync(file, code);
                  }
                });

              case 10:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      return function transpileAndMinify() {
        return _transpileAndMinify.apply(this, arguments);
      };
    }()
    /**
     * Moves all the files that should not be packed into asar into a safe location which is the
     * 'extracted' dir in the electron app.
     */

  }, {
    key: "excludeFilesFromArchive",
    value: function () {
      var _excludeFilesFromArchive = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee11() {
        var _this9 = this;

        var configs;
        return _runtime.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                this.log.info('excluding files from packing'); // Ensure empty `extracted` dir

                _context11.prev = 1;
                _context11.next = 4;
                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.extracted);

              case 4:
                _context11.next = 9;
                break;

              case 6:
                _context11.prev = 6;
                _context11.t0 = _context11["catch"](1);
                throw new Error(_context11.t0);

              case 9:
                _shelljs.default.mkdir(this.$.env.paths.electronApp.extracted);

                configs = this.$.desktop.gatherModuleConfigs(); // Move files that should not be asar'ed.

                configs.forEach(function (config) {
                  var moduleConfig = config;

                  if ('extract' in moduleConfig) {
                    if (!Array.isArray(moduleConfig.extract)) {
                      moduleConfig.extract = [moduleConfig.extract];
                    }

                    moduleConfig.extract.forEach(function (file) {
                      _this9.log.debug(`excluding ${file} from ${config.name}`);

                      var filePath = _path.default.join(_this9.$.env.paths.desktopTmp.modules, moduleConfig.dirName, file);

                      var destinationPath = _path.default.join(_this9.$.env.paths.electronApp.extracted, moduleConfig.dirName);

                      if (!_this9.$.utils.exists(destinationPath)) {
                        _shelljs.default.mkdir(destinationPath);
                      }

                      _shelljs.default.mv(filePath, destinationPath);
                    });
                  }
                });

              case 12:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this, [[1, 6]]);
      }));

      return function excludeFilesFromArchive() {
        return _excludeFilesFromArchive.apply(this, arguments);
      };
    }()
  }]);

  return ElectronApp;
}();

exports.default = ElectronApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkFwcC5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJmYXRhbCIsIkVsZWN0cm9uQXBwIiwiJCIsImxvZyIsInNjYWZmb2xkIiwiZGVwc01hbmFnZXIiLCJnZXREZWZhdWx0UGFja2FnZUpzb24iLCJkZXBlbmRlbmNpZXMiLCJtZXRlb3JBcHAiLCJwYWNrYWdlSnNvbiIsInZlcnNpb24iLCJjb21wYXRpYmlsaXR5VmVyc2lvbiIsImRlcHJlY3RhdGVkUGx1Z2lucyIsImV4Y2x1ZGVGcm9tRGVsIiwiaW5mbyIsIlByb21pc2UiLCJyZXNvbHZlIiwiZXh0cmFjdCIsImdldE1vZHVsZXNUb0V4dHJhY3QiLCJkZWJ1ZyIsInJlbmFtZVN5bmMiLCJlbnYiLCJwYXRocyIsImVsZWN0cm9uQXBwIiwibm9kZU1vZHVsZXMiLCJqb2luIiwiYXBwUm9vdCIsImV4dHJhY3RlZCIsImV4dHJhY3RNb2R1bGVzIiwiY3JlYXRlUGFja2FnZSIsImFwcEFzYXIiLCJtdiIsImZvckVhY2giLCJjcCIsImV4dHJhY3RlZE5vZGVNb2R1bGVzIiwibW9kdWxlIiwidXRpbHMiLCJleGlzdHMiLCJleHRyYWN0ZWROb2RlTW9kdWxlc0JpbiIsImV4Y2x1ZGUiLCJjb25jYXQiLCJzeW5jIiwicm9vdCIsInNlcCIsIm1hcCIsInBhdGhUb0V4Y2x1ZGUiLCJleHQiLCJsZW5ndGgiLCJybSIsIm1rZGlyU3luYyIsImV4dHJhY3RCaW4iLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwiYmlucyIsImJpbiIsIk9iamVjdCIsImtleXMiLCJleHRlbnNpb24iLCJiaW5GaWxlUGF0aCIsInN5bWxpbmtFeGlzdHMiLCJiaW5hcnlNb2R1bGVzRGV0ZWN0b3IiLCJ0b0JlRXh0cmFjdGVkIiwiZGV0ZWN0IiwiZGVza3RvcCIsImdldFNldHRpbmdzIiwiQXJyYXkiLCJpc0FycmF5IiwibWVyZ2UiLCJ2ZXJib3NlIiwic2V0dGluZ3MiLCJkZXNrdG9wSENQQ29tcGF0aWJpbGl0eVZlcnNpb24iLCJ3YXJuIiwibWQ1IiwiY3JlYXRlSGFzaCIsImdldERlcGVuZGVuY2llcyIsImRlcGVuZGVuY2llc1NvcnRlZCIsInNvcnQiLCJkZXBlbmRlbmN5IiwibWFpbkNvbXBhdGliaWxpdHlWZXJzaW9uIiwiZ2V0VmVyc2lvbiIsInNwbGl0IiwicHVzaCIsImRlc2t0b3BDb21wYXRpYmlsaXR5VmVyc2lvbiIsInByb2Nlc3MiLCJNRVRFT1JfREVTS1RPUF9ERUJVR19ERVNLVE9QX0NPTVBBVElCSUxJVFlfVkVSU0lPTiIsIk1FVEVPUl9ERVNLVE9QX0RFQlVHIiwic3RyaW5naWZ5IiwidXBkYXRlIiwiZGlnZXN0IiwiZWxlY3Ryb24iLCJpbml0IiwiZWxlY3Ryb25CdWlsZGVyIiwiZXhpdCIsInJ1biIsImNoZWNrIiwib3B0aW9ucyIsImVycm9yIiwidXBkYXRlR2l0SWdub3JlIiwicm9vdE5hbWUiLCJyZW1vdmVEZXByZWNhdGVkUGFja2FnZXMiLCJlbnN1cmVEZXNrdG9wSENQUGFja2FnZXMiLCJtYWtlIiwiZXhwb3NlRWxlY3Ryb25Nb2R1bGVzIiwidXBkYXRlUGFja2FnZUpzb25GaWVsZHMiLCJ1cGRhdGVEZXBlbmRlbmNpZXNMaXN0IiwiY2FsY3VsYXRlQ29tcGF0aWJpbGl0eVZlcnNpb24iLCJoYW5kbGVUZW1wb3JhcnlOb2RlTW9kdWxlcyIsImhhbmRsZVN0YXRlT2ZOb2RlTW9kdWxlcyIsIm5vZGVNb2R1bGVzUmVtb3ZlZCIsInJlYnVpbGREZXBzIiwibGlua05wbVBhY2thZ2VzIiwiaW5zdGFsbExvY2FsTm9kZU1vZHVsZXMiLCJlbnN1cmVNZXRlb3JEZXBlbmRlbmNpZXMiLCJpc1Byb2R1Y3Rpb25CdWlsZCIsInBhY2tTa2VsZXRvblRvQXNhciIsImNvcHlEZXNrdG9wVG9EZXNrdG9wVGVtcCIsInVwZGF0ZVNldHRpbmdzSnNvbkZpZWxkcyIsImV4Y2x1ZGVGaWxlc0Zyb21BcmNoaXZlIiwidHJhbnNwaWxlQW5kTWluaWZ5IiwicGFja0Rlc2t0b3BUb0FzYXIiLCJnZXRNZXRlb3JDbGllbnRCdWlsZCIsImV4cG9zZWRNb2R1bGVzIiwicHJlbG9hZCIsIm1vZHVsZXMiLCJyZWR1Y2UiLCJwcmV2IiwicmVwbGFjZSIsIndyaXRlRmlsZVN5bmMiLCJwYWNrYWdlcyIsInBhY2thZ2VzV2l0aFZlcnNpb24iLCJwbHVnaW5zIiwicGx1Z2luIiwibWV0ZW9yRGVwZW5kZW5jaWVzIiwidW5zaGlmdCIsInBhY2thZ2VOYW1lIiwicGFja2FnZXNDb3VudCIsImZpbHRlciIsImluY2x1ZGVzIiwidmFsdWUiLCJzdWJzdHIiLCJtZXRlb3JNYW5hZ2VyIiwiZW5zdXJlUGFja2FnZXMiLCJFcnJvciIsImJ1aWxkIiwiaWEzMiIsInJtV2l0aFJldHJpZXMiLCJ0bXBOb2RlTW9kdWxlcyIsInByb21pc2VzIiwibGlua1BhY2thZ2VzIiwicnVuTnBtIiwidW5kZWZpbmVkIiwiYWxsIiwic3RkaW8iLCJwbHVnaW5zVmVyc2lvbnMiLCJzZXR0aW5nc0pzb24iLCJzY2FmZm9sZFBsdWdpbnNWZXJzaW9uIiwicGx1Z2luTmFtZSIsImx0IiwiZGVza3RvcERlcGVuZGVuY2llcyIsImNoZWNrUGx1Z2luc1ZlcnNpb24iLCJtZXJnZURlcGVuZGVuY2llcyIsImZyb21TZXR0aW5ncyIsImdldFJlbW90ZURlcGVuZGVuY2llcyIsImxvY2FsRGVwZW5kZW5jaWVzIiwiZ2V0TG9jYWxEZXBlbmRlbmNpZXMiLCJhcmNoIiwidmFsdWVzIiwibGFzdFJlYnVpbGQiLCJwcmVwYXJlTGFzdFJlYnVpbGRPYmplY3QiLCJnZXRHeXBFbnYiLCJmcmFtZXdvcmtJbmZvIiwicGxhdGZvcm0iLCJpbnN0YWxsZXIiLCJucG1FbnYiLCJpbnN0YWxsIiwiaW5zdGFsbE9yUmVidWlsZCIsInBhY2thZ2VKc29uRmllbGRzIiwibmFtZSIsInByb2plY3ROYW1lIiwiZ2V0SGFzaFZlcnNpb24iLCJkZXNrdG9wVmVyc2lvbiIsIm1ldGVvckRlc2t0b3BWZXJzaW9uIiwicHJvZERlYnVnIiwiZGVza3RvcFRtcCIsInJlamVjdCIsImRlc2t0b3BBc2FyIiwidGhlbiIsImNhdGNoIiwidWdsaWZ5T3B0aW9ucyIsInVnbGlmeWluZ0VuYWJsZWQiLCJ1Z2xpZnkiLCJwcmVzZXQiLCJ0YXJnZXRzIiwibm9kZSIsInJlYWREaXIiLCJmaWxlcyIsImRhdGEiLCJmaWxlIiwiZW5kc1dpdGgiLCJwcmVzZXRzIiwiY29kZSIsIm1pbmlmeSIsIm1rZGlyIiwiY29uZmlncyIsImdhdGhlck1vZHVsZUNvbmZpZ3MiLCJtb2R1bGVDb25maWciLCJmaWxlUGF0aCIsImRpck5hbWUiLCJkZXN0aW5hdGlvblBhdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFFQSxpQkFBTUEsTUFBTixDQUFhQyxLQUFiLEdBQXFCLElBQXJCO0FBRUE7Ozs7O0lBSXFCQyxXOzs7QUFDakI7Ozs7QUFJQSx1QkFBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsU0FBS0MsR0FBTCxHQUFXLGlCQUFRLGFBQVIsQ0FBWDtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsaUNBQXdCRixDQUF4QixDQUFoQjtBQUNBLFNBQUtHLFdBQUwsR0FBbUIsaUNBQ2ZILENBRGUsRUFFZixLQUFLRSxRQUFMLENBQWNFLHFCQUFkLEdBQXNDQyxZQUZ2QixDQUFuQjtBQUlBLFNBQUtMLENBQUwsR0FBU0EsQ0FBVDtBQUNBLFNBQUtNLFNBQUwsR0FBaUIsS0FBS04sQ0FBTCxDQUFPTSxTQUF4QjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBZjtBQUNBLFNBQUtDLG9CQUFMLEdBQTRCLElBQTVCO0FBQ0EsU0FBS0Msa0JBQUwsR0FBMEIsQ0FBQyw2QkFBRCxDQUExQjtBQUNIO0FBRUQ7Ozs7Ozs7Ozt5Q0FLd0M7QUFBQTs7QUFBQSxVQUFyQkMsY0FBcUIs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O0FBQ0osaUJBckJEIiwiZmlsZSI6ImVsZWN0cm9uQXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgcmVnZW5lcmF0b3JSdW50aW1lIGZyb20gJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZSc7XG5pbXBvcnQgYXNhciBmcm9tICdhc2FyJztcbmltcG9ydCBhc3NpZ25JbiBmcm9tICdsb2Rhc2gvYXNzaWduSW4nO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IExvY2FsSW5zdGFsbGVyLCBwcm9ncmVzcyB9IGZyb20gJ2luc3RhbGwtbG9jYWwnO1xuaW1wb3J0IHsgdHJhbnNmb3JtRmlsZVN5bmMgfSBmcm9tICdAYmFiZWwvY29yZSc7XG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgZGVsIGZyb20gJ2RlbCc7XG5pbXBvcnQgcHJlc2V0RW52IGZyb20gJ0BiYWJlbC9wcmVzZXQtZW52JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB1Z2xpZnkgZnJvbSAndGVyc2VyJztcblxuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgRWxlY3Ryb25BcHBTY2FmZm9sZCBmcm9tICcuL2VsZWN0cm9uQXBwU2NhZmZvbGQnO1xuaW1wb3J0IERlcGVuZGVuY2llc01hbmFnZXIgZnJvbSAnLi9kZXBlbmRlbmNpZXNNYW5hZ2VyJztcbmltcG9ydCBCaW5hcnlNb2R1bGVEZXRlY3RvciBmcm9tICcuL2JpbmFyeU1vZHVsZXNEZXRlY3Rvcic7XG5cbnNoZWxsLmNvbmZpZy5mYXRhbCA9IHRydWU7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgLmRlc2t0b3AgZGlyIHNjYWZmb2xkLlxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsZWN0cm9uQXBwIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgLSBjb250ZXh0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2VsZWN0cm9uQXBwJyk7XG4gICAgICAgIHRoaXMuc2NhZmZvbGQgPSBuZXcgRWxlY3Ryb25BcHBTY2FmZm9sZCgkKTtcbiAgICAgICAgdGhpcy5kZXBzTWFuYWdlciA9IG5ldyBEZXBlbmRlbmNpZXNNYW5hZ2VyKFxuICAgICAgICAgICAgJCxcbiAgICAgICAgICAgIHRoaXMuc2NhZmZvbGQuZ2V0RGVmYXVsdFBhY2thZ2VKc29uKCkuZGVwZW5kZW5jaWVzXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuJCA9ICQ7XG4gICAgICAgIHRoaXMubWV0ZW9yQXBwID0gdGhpcy4kLm1ldGVvckFwcDtcbiAgICAgICAgdGhpcy5wYWNrYWdlSnNvbiA9IG51bGw7XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tcGF0aWJpbGl0eVZlcnNpb24gPSBudWxsO1xuICAgICAgICB0aGlzLmRlcHJlY3RhdGVkUGx1Z2lucyA9IFsnbWV0ZW9yLWRlc2t0b3AtbG9jYWxzdG9yYWdlJ107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYW4gYXBwLmFzYXIgZnJvbSB0aGUgc2tlbGV0b24gYXBwLlxuICAgICAqIEBwcm9wZXJ0eSB7QXJyYXl9IGV4Y2x1ZGVGcm9tRGVsIC0gbGlzdCBvZiBwYXRocyB0byBleGNsdWRlIGZyb20gZGVsZXRpbmdcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBwYWNrU2tlbGV0b25Ub0FzYXIoZXhjbHVkZUZyb21EZWwgPSBbXSkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdwYWNraW5nIHNrZWxldG9uIGFwcCBhbmQgbm9kZV9tb2R1bGVzIHRvIGFzYXIgYXJjaGl2ZScpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhY3QgPSB0aGlzLmdldE1vZHVsZXNUb0V4dHJhY3QoKTtcblxuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBwYWNrIHNrZWxldG9uIGFwcCBhbmQgbm9kZV9tb2R1bGVzIHRvZ2V0aGVyLCBzbyB3ZSBuZWVkIHRvIHRlbXBvcmFyaWx5XG4gICAgICAgICAgICAvLyBtb3ZlIG5vZGVfbW9kdWxlcyB0byBhcHAgZGlyLlxuICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ21vdmluZyBub2RlX21vZHVsZXMgdG8gYXBwIGRpcicpO1xuXG4gICAgICAgICAgICBmcy5yZW5hbWVTeW5jKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgcGF0aC5qb2luKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ25vZGVfbW9kdWxlcycpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgZXh0cmFjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBleHRyYWN0ZWQgPSB0aGlzLmV4dHJhY3RNb2R1bGVzKGV4dHJhY3QpO1xuXG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygncGFja2luZycpO1xuICAgICAgICAgICAgYXNhci5jcmVhdGVQYWNrYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcEFzYXIsXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZXRzIG1vdmUgdGhlIG5vZGVfbW9kdWxlcyBiYWNrLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbW92aW5nIG5vZGVfbW9kdWxlcyBiYWNrIGZyb20gYXBwIGRpcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNoZWxsLm12KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ25vZGVfbW9kdWxlcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlc1xuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRyYWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gY3JlYXRlIGEgZnVsbCBub2RlIG1vZHVsZXMgYmFjay4gSW4gb3RoZXIgd29yZHMgd2Ugd2FudFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGV4dHJhY3RlZCBtb2R1bGVzIGJhY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRyYWN0LmZvckVhY2gobW9kdWxlID0+IHNoZWxsLmNwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctcmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzLCBtb2R1bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzLCBtb2R1bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSAuYmluIGJhY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy4kLnV0aWxzLmV4aXN0cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzQmluXG4gICAgICAgICAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hlbGwuY3AoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzQmluLCAnKicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlcywgJy5iaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnZGVsZXRpbmcgc291cmNlIGZpbGVzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2x1ZGUgPSBbdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlc10uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwQXNhcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnBhY2thZ2VKc29uXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZUZyb21EZWxcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBkZWwuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIFtgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3R9JHtwYXRoLnNlcH0qYF0uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGUubWFwKHBhdGhUb0V4Y2x1ZGUgPT4gYCEke3BhdGhUb0V4Y2x1ZGV9YClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIHNwZWNpZmllZCBub2RlIG1vZHVsZXMgdG8gYSBzZXBhcmF0ZSBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHtBcnJheX0gZXh0cmFjdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGV4dHJhY3RNb2R1bGVzKGV4dHJhY3QpIHtcbiAgICAgICAgY29uc3QgZXh0ID0gWycuanMnLCAnLmJhdCcsICcuc2gnLCAnLmNtZCcsICcnXTtcblxuICAgICAgICBpZiAoZXh0cmFjdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzKSkge1xuICAgICAgICAgICAgICAgIHNoZWxsLnJtKCctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzKTtcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzQmluKTtcblxuICAgICAgICAgICAgZXh0cmFjdC5mb3JFYWNoKChtb2R1bGUpID0+IHtcbiAgICAgICAgICAgICAgICBmcy5yZW5hbWVTeW5jKFxuICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5hcHBSb290LCAnbm9kZV9tb2R1bGVzJywgbW9kdWxlKSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkTm9kZU1vZHVsZXMsIG1vZHVsZSksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBNb3ZlIGJpbnMuXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYWN0QmluKG1vZHVsZSwgZXh0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdHMgdGhlIGJpbiBmaWxlcyBhc3NvY2lhdGVkIHdpdGggYSBjZXJ0YWluIG5vZGUgbW9kdWxlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBtb2R1bGVcbiAgICAgKiBAcGFyYW0gZXh0XG4gICAgICovXG4gICAgZXh0cmFjdEJpbihtb2R1bGUsIGV4dCkge1xuICAgICAgICBsZXQgcGFja2FnZUpzb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzLCBtb2R1bGUsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICd1dGY4J1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHBhY2thZ2VKc29uID0ge307XG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGJpbnMgPSAoJ2JpbicgaW4gcGFja2FnZUpzb24gJiYgdHlwZW9mIHBhY2thZ2VKc29uLmJpbiA9PT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXMocGFja2FnZUpzb24uYmluKSA6IFtdO1xuXG4gICAgICAgIGlmIChiaW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGJpbnMuZm9yRWFjaCgoYmluKSA9PiB7XG4gICAgICAgICAgICAgICAgZXh0LmZvckVhY2goKGV4dGVuc2lvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5GaWxlUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdub2RlX21vZHVsZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy5iaW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7YmlufSR7ZXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuJC51dGlscy5leGlzdHMoYmluRmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQudXRpbHMuc3ltbGlua0V4aXN0cyhiaW5GaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5yZW5hbWVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbkZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5leHRyYWN0ZWROb2RlTW9kdWxlc0JpbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YmlufSR7ZXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlcyB0aGUgYGV4dHJhY3RgIGZpZWxkIHdpdGggYXV0b21hdGljYWxseSBkZXRlY3RlZCBtb2R1bGVzLlxuICAgICAqL1xuICAgIGdldE1vZHVsZXNUb0V4dHJhY3QoKSB7XG4gICAgICAgIGNvbnN0IGJpbmFyeU1vZHVsZXNEZXRlY3RvciA9XG4gICAgICAgICAgICBuZXcgQmluYXJ5TW9kdWxlRGV0ZWN0b3IodGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlcyk7XG4gICAgICAgIGNvbnN0IHRvQmVFeHRyYWN0ZWQgPSBiaW5hcnlNb2R1bGVzRGV0ZWN0b3IuZGV0ZWN0KCk7XG5cbiAgICAgICAgbGV0IHsgZXh0cmFjdCB9ID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcblxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXh0cmFjdCkpIHtcbiAgICAgICAgICAgIGV4dHJhY3QgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lcmdlID0ge307XG4gICAgICAgIHRvQmVFeHRyYWN0ZWQuY29uY2F0KGV4dHJhY3QpLmZvckVhY2goKG1vZHVsZSkgPT4ge1xuICAgICAgICAgICAgbWVyZ2VbbW9kdWxlXSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBleHRyYWN0ID0gT2JqZWN0LmtleXMobWVyZ2UpO1xuICAgICAgICBpZiAoZXh0cmFjdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGByZXN1bHRhbnQgbW9kdWxlcyB0byBleHRyYWN0IGxpc3QgaXM6ICR7ZXh0cmFjdC5qb2luKCcsICcpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHRyYWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgYSBtZDUgZnJvbSBhbGwgZGVwZW5kZW5jaWVzLlxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNvbXBhdGliaWxpdHlWZXJzaW9uKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjYWxjdWxhdGluZyBjb21wYXRpYmlsaXR5IHZlcnNpb24nKTtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB0aGlzLiQuZGVza3RvcC5nZXRTZXR0aW5ncygpO1xuXG4gICAgICAgIGlmICgoJ2Rlc2t0b3BIQ1BDb21wYXRpYmlsaXR5VmVyc2lvbicgaW4gc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBhdGliaWxpdHlWZXJzaW9uID0gYCR7c2V0dGluZ3MuZGVza3RvcEhDUENvbXBhdGliaWxpdHlWZXJzaW9ufWA7XG4gICAgICAgICAgICB0aGlzLmxvZy53YXJuKGBjb21wYXRpYmlsaXR5IHZlcnNpb24gb3ZlcnJpZGRlbiB0byAke3RoaXMuY29tcGF0aWJpbGl0eVZlcnNpb259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1Jyk7XG4gICAgICAgIGxldCBkZXBlbmRlbmNpZXMgPSB0aGlzLmRlcHNNYW5hZ2VyLmdldERlcGVuZGVuY2llcygpO1xuICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXNTb3J0ZWQgPSBPYmplY3Qua2V5cyhkZXBlbmRlbmNpZXMpLnNvcnQoKTtcbiAgICAgICAgZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzU29ydGVkLm1hcChkZXBlbmRlbmN5ID0+XG4gICAgICAgICAgICBgJHtkZXBlbmRlbmN5fToke2RlcGVuZGVuY2llc1tkZXBlbmRlbmN5XX1gKTtcbiAgICAgICAgY29uc3QgbWFpbkNvbXBhdGliaWxpdHlWZXJzaW9uID0gdGhpcy4kLmdldFZlcnNpb24oKS5zcGxpdCgnLicpO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbWV0ZW9yLWRlc2t0b3AgY29tcGF0aWJpbGl0eSB2ZXJzaW9uIGlzICcsXG4gICAgICAgICAgICBgJHttYWluQ29tcGF0aWJpbGl0eVZlcnNpb25bMF19YCk7XG4gICAgICAgIGRlcGVuZGVuY2llcy5wdXNoKFxuICAgICAgICAgICAgYG1ldGVvci1kZXNrdG9wOiR7bWFpbkNvbXBhdGliaWxpdHlWZXJzaW9uWzBdfWBcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkZXNrdG9wQ29tcGF0aWJpbGl0eVZlcnNpb24gPSBzZXR0aW5ncy52ZXJzaW9uLnNwbGl0KCcuJylbMF07XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCcuZGVza3RvcCBjb21wYXRpYmlsaXR5IHZlcnNpb24gaXMgJywgZGVza3RvcENvbXBhdGliaWxpdHlWZXJzaW9uKTtcbiAgICAgICAgZGVwZW5kZW5jaWVzLnB1c2goXG4gICAgICAgICAgICBgZGVza3RvcC1hcHA6JHtkZXNrdG9wQ29tcGF0aWJpbGl0eVZlcnNpb259YFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5NRVRFT1JfREVTS1RPUF9ERUJVR19ERVNLVE9QX0NPTVBBVElCSUxJVFlfVkVSU0lPTiB8fFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTUVURU9SX0RFU0tUT1BfREVCVUdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhgY29tcGF0aWJpbGl0eSB2ZXJzaW9uIGNhbGN1bGF0ZWQgZnJvbSAke0pTT04uc3RyaW5naWZ5KGRlcGVuZGVuY2llcyl9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBtZDUudXBkYXRlKEpTT04uc3RyaW5naWZ5KGRlcGVuZGVuY2llcykpO1xuXG4gICAgICAgIHRoaXMuY29tcGF0aWJpbGl0eVZlcnNpb24gPSBtZDUuZGlnZXN0KCdoZXgnKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy4kLmVsZWN0cm9uLmluaXQoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuJC5lbGVjdHJvbkJ1aWxkZXIuaW5pdCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy53YXJuKCdlcnJvciBvY2N1cnJlZCB3aGlsZSBpbml0aWFsaXNpbmcgZWxlY3Ryb24gYW5kIGVsZWN0cm9uLWJ1aWxkZXIgaW50ZWdyYXRpb24nLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgYWxsIG5lY2Vzc2FyeSB0YXNrcyB0byBidWlsZCB0aGUgZGVza3RvcGlmaWVkIGFwcC5cbiAgICAgKi9cbiAgICBhc3luYyBidWlsZChydW4gPSBmYWxzZSkge1xuICAgICAgICAvLyBUT0RPOiByZWZhY3RvciB0byBhIHRhc2sgcnVubmVyXG4gICAgICAgIHRoaXMubG9nLmluZm8oJ3NjYWZmb2xkaW5nJyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLiQuZGVza3RvcC5jaGVjaygpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuJC5lbnYub3B0aW9ucy5zY2FmZm9sZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdzZWVtcyB0aGF0IHlvdSBkbyBub3QgaGF2ZSBhIC5kZXNrdG9wIGRpciBpbiB5b3VyIHByb2plY3Qgb3IgaXQgaXMnICtcbiAgICAgICAgICAgICAgICAgICAgJyBjb3JydXB0ZWQuIFJ1biBcXCducG0gcnVuIGRlc2t0b3AgLS0gaW5pdFxcJyB0byBnZXQgYSBuZXcgb25lLicpO1xuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBmYWlsLCBzbyB0aGF0IG5wbSB3aWxsIG5vdCBwcmludCBoaXMgZXJyb3Igc3R1ZmYgdG8gY29uc29sZS5cbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJC5kZXNrdG9wLnNjYWZmb2xkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kLm1ldGVvckFwcC51cGRhdGVHaXRJZ25vcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpO1xuXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuJC5tZXRlb3JBcHAudXBkYXRlR2l0SWdub3JlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYGVycm9yIG9jY3VycmVkIHdoaWxlIGFkZGluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdE5hbWV9YCArXG4gICAgICAgICAgICAgICAgJ3RvIC5naXRpZ25vcmU6ICcsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuJC5tZXRlb3JBcHAucmVtb3ZlRGVwcmVjYXRlZFBhY2thZ2VzKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSByZW1vdmluZyBkZXByZWNhdGVkIHBhY2thZ2VzOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLiQubWV0ZW9yQXBwLmVuc3VyZURlc2t0b3BIQ1BQYWNrYWdlcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY2hlY2tpbmcgZm9yIHJlcXVpcmVkIHBhY2thZ2VzOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNjYWZmb2xkLm1ha2UoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHNjYWZmb2xkaW5nOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmV4cG9zZUVsZWN0cm9uTW9kdWxlcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgZXhwb3NpbmcgZWxlY3Ryb24gbW9kdWxlczogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYWNrYWdlSnNvbkZpZWxkcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgdXBkYXRpbmcgcGFja2FnZS5qc29uOiAnLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURlcGVuZGVuY2llc0xpc3QoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIG1lcmdpbmcgZGVwZW5kZW5jaWVzIGxpc3Q6ICcsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQ29tcGF0aWJpbGl0eVZlcnNpb24oKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIGNhbGN1bGF0aW5nIGNvbXBhdGliaWxpdHkgdmVyc2lvbjogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVUZW1wb3JhcnlOb2RlTW9kdWxlcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgaGFuZGxpbmcgdGVtcG9yYXJ5IG5vZGVfbW9kdWxlczogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbm9kZU1vZHVsZXNSZW1vdmVkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZU1vZHVsZXNSZW1vdmVkID0gYXdhaXQgdGhpcy5oYW5kbGVTdGF0ZU9mTm9kZU1vZHVsZXMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGNsZWFyaW5nIG5vZGVfbW9kdWxlczogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWJ1aWxkRGVwcyh0cnVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGluc3RhbGxpbmcgbm9kZV9tb2R1bGVzOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZU1vZHVsZXNSZW1vdmVkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVidWlsZERlcHMoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmVidWlsZGluZyBuYXRpdmUgbm9kZSBtb2R1bGVzOiAnLCBlKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5saW5rTnBtUGFja2FnZXMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYGxpbmtpbmcgcGFja2FnZXMgZmFpbGVkOiAke2V9YCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5pbnN0YWxsTG9jYWxOb2RlTW9kdWxlcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgaW5zdGFsbGluZyBsb2NhbCBub2RlIG1vZHVsZXM6ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lbnN1cmVNZXRlb3JEZXBlbmRlbmNpZXMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGVuc3VyaW5nIG1ldGVvciBkZXBlbmRlbmNpZXMgYXJlIGluc3RhbGxlZDogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0aGlzLiQuZW52LmlzUHJvZHVjdGlvbkJ1aWxkKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wYWNrU2tlbGV0b25Ub0FzYXIoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgcGFja2luZyBza2VsZXRvbiB0byBhc2FyOiAnLCBlKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgd2F5IHRvIGF2b2lkIGNvcHlpbmcgLmRlc2t0b3AgdG8gYSB0ZW1wIGxvY2F0aW9uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNvcHlEZXNrdG9wVG9EZXNrdG9wVGVtcCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgY29weWluZyAuZGVza3RvcCB0byBhIHRlbXBvcmFyeSBsb2NhdGlvbjogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVTZXR0aW5nc0pzb25GaWVsZHMoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHVwZGF0aW5nIHNldHRpbmdzLmpzb246ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhjbHVkZUZpbGVzRnJvbUFyY2hpdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIGV4Y2x1ZGluZyBmaWxlcyBmcm9tIHBhY2tpbmcgdG8gYXNhcjogJywgZSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy50cmFuc3BpbGVBbmRNaW5pZnkoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIHRyYW5zcGlsaW5nIG9yIG1pbmlmeWluZzogJywgZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wYWNrRGVza3RvcFRvQXNhcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgd2hpbGUgcGFja2luZyAuZGVza3RvcCB0byBhc2FyOiAnLCBlKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmdldE1ldGVvckNsaWVudEJ1aWxkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciBvY2N1cnJlZCBkdXJpbmcgZ2V0dGluZyBtZXRlb3IgbW9iaWxlIGJ1aWxkOiAnLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChydW4pIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ3J1bm5pbmcnKTtcbiAgICAgICAgICAgIHRoaXMuJC5lbGVjdHJvbi5ydW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2J1aWx0Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgdGhlIGBleHBvc2VkTW9kdWxlc2Agc2V0dGluZyBmcm9tIGBzZXR0aW5ncy5qc29uYCBpbnRvIGBwcmVsb2FkLmpzYCBtb2RpZnlpbmcgaXRzIGNvZGVcbiAgICAgKiBzbyB0aGF0IHRoZSBzY3JpcHQgd2lsbCBoYXZlIGl0IGhhcmRjb2RlZC5cbiAgICAgKi9cbiAgICBleHBvc2VFbGVjdHJvbk1vZHVsZXMoKSB7XG4gICAgICAgIGNvbnN0IHsgZXhwb3NlZE1vZHVsZXMgfSA9IHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCk7XG4gICAgICAgIGlmIChleHBvc2VkTW9kdWxlcyAmJiBBcnJheS5pc0FycmF5KGV4cG9zZWRNb2R1bGVzKSAmJiBleHBvc2VkTW9kdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgcHJlbG9hZCA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnByZWxvYWQsICd1dGY4Jyk7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKVxuICAgICAgICAgICAgICAgIC5leHBvc2VkTW9kdWxlc1xuICAgICAgICAgICAgICAgIC5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXR1cm4tYXNzaWduLG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgICAgICAgICAgICAgIChwcmV2LCBtb2R1bGUpID0+IChwcmV2ICs9IGAnJHttb2R1bGV9JywgYCwgcHJldiksICcnXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcHJlbG9hZCA9IHByZWxvYWQucmVwbGFjZSgnY29uc3QgZXhwb3NlZE1vZHVsZXMgPSBbJywgYGNvbnN0IGV4cG9zZWRNb2R1bGVzID0gWyR7bW9kdWxlc31gKTtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5wcmVsb2FkLCBwcmVsb2FkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuc3VyZXMgYWxsIHJlcXVpcmVkIGRlcGVuZGVuY2llcyBhcmUgYWRkZWQgdG8gdGhlIE1ldGVvciBwcm9qZWN0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjx2b2lkPn1cbiAgICAgKi9cbiAgICBhc3luYyBlbnN1cmVNZXRlb3JEZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBwYWNrYWdlcyA9IFtdO1xuICAgICAgICBjb25zdCBwYWNrYWdlc1dpdGhWZXJzaW9uID0gW107XG4gICAgICAgIGxldCBwbHVnaW5zID0gJ3BsdWdpbnMgWyc7XG5cbiAgICAgICAgT2JqZWN0LmtleXModGhpcy4kLmRlc2t0b3AuZ2V0RGVwZW5kZW5jaWVzKCkucGx1Z2lucykuZm9yRWFjaCgocGx1Z2luKSA9PiB7XG4gICAgICAgICAgICAvLyBSZWFkIHBhY2thZ2UuanNvbiBvZiB0aGUgcGx1Z2luLlxuICAgICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPVxuICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzLCBwbHVnaW4sICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3V0ZjgnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoJ21ldGVvckRlcGVuZGVuY2llcycgaW4gcGFja2FnZUpzb24gJiYgdHlwZW9mIHBhY2thZ2VKc29uLm1ldGVvckRlcGVuZGVuY2llcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zICs9IGAke3BsdWdpbn0sIGA7XG4gICAgICAgICAgICAgICAgcGFja2FnZXMudW5zaGlmdCguLi5PYmplY3Qua2V5cyhwYWNrYWdlSnNvbi5tZXRlb3JEZXBlbmRlbmNpZXMpKTtcbiAgICAgICAgICAgICAgICBwYWNrYWdlc1dpdGhWZXJzaW9uLnVuc2hpZnQoLi4ucGFja2FnZXMubWFwKChwYWNrYWdlTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFja2FnZUpzb24ubWV0ZW9yRGVwZW5kZW5jaWVzW3BhY2thZ2VOYW1lXSA9PT0gJ0B2ZXJzaW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3BhY2thZ2VOYW1lfUAke3BhY2thZ2VKc29uLnZlcnNpb259YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cGFja2FnZU5hbWV9QCR7cGFja2FnZUpzb24ubWV0ZW9yRGVwZW5kZW5jaWVzW3BhY2thZ2VOYW1lXX1gO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcGFja2FnZXNDb3VudCA9IHBhY2thZ2VzLmxlbmd0aDtcbiAgICAgICAgcGFja2FnZXMgPSBwYWNrYWdlcy5maWx0ZXIodmFsdWUgPT4gIXRoaXMuZGVwcmVjdGF0ZWRQbHVnaW5zLmluY2x1ZGVzKHZhbHVlKSk7XG4gICAgICAgIGlmIChwYWNrYWdlc0NvdW50ICE9PSBwYWNrYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLndhcm4oJ3lvdSBoYXZlIHNvbWUgZGVwcmVjYXRlZCBtZXRlb3IgZGVza3RvcCBwbHVnaW5zIGluIHlvdXIgc2V0dGluZ3MsIHBsZWFzZSByZW1vdmUgJyArXG4gICAgICAgICAgICAgICAgYHRoZW0gKGRlcHJlY2F0ZWQgcGx1Z2luczogJHt0aGlzLmRlcHJlY3RhdGVkUGx1Z2lucy5qb2luKCcsICcpfSlgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWNrYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwbHVnaW5zID0gYCR7cGx1Z2lucy5zdWJzdHIoMCwgcGx1Z2lucy5sZW5ndGggLSAyKX1dYDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy4kLm1ldGVvckFwcC5tZXRlb3JNYW5hZ2VyLmVuc3VyZVBhY2thZ2VzKFxuICAgICAgICAgICAgICAgICAgICBwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbiwgcGx1Z2luc1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIG1ldGVvciBhcHAuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0TWV0ZW9yQ2xpZW50QnVpbGQoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuJC5tZXRlb3JBcHAuYnVpbGQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIG5vZGVfbW9kdWxlcyBpZiBuZWVkZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAgICovXG4gICAgYXN5bmMgaGFuZGxlU3RhdGVPZk5vZGVNb2R1bGVzKCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5pc1Byb2R1Y3Rpb25CdWlsZCgpIHx8IHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2NsZWFyaW5nIG5vZGVfbW9kdWxlcyBiZWNhdXNlIHdlIG5lZWQgdG8gaGF2ZSBpdCBjbGVhciBmb3IgaWEzMiByZWJ1aWxkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2NsZWFyaW5nIG5vZGVfbW9kdWxlcyBiZWNhdXNlIHRoaXMgaXMgYSBwcm9kdWN0aW9uIGJ1aWxkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuJC51dGlscy5ybVdpdGhSZXRyaWVzKFxuICAgICAgICAgICAgICAgICAgICAnLXJmJywgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5ub2RlTW9kdWxlc1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRoZXJlIGlzIGEgdGVtcG9yYXJ5IG5vZGVfbW9kdWxlcyBmb2xkZXIgYW5kIG5vIG5vZGVfbW9kdWxlcyBmb2xkZXIsIHdlIHdpbGxcbiAgICAgKiByZXN0b3JlIGl0LCBhcyBpdCBtaWdodCBiZSBhIGxlZnRvdmVyIGZyb20gYW4gaW50ZXJydXB0ZWQgZmxvdy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVUZW1wb3JhcnlOb2RlTW9kdWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuJC51dGlscy5leGlzdHModGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC50bXBOb2RlTW9kdWxlcykpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdtb3ZpbmcgdGVtcCBub2RlX21vZHVsZXMgYmFjaycpO1xuICAgICAgICAgICAgICAgIHNoZWxsLm12KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm5vZGVNb2R1bGVzXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBub2RlX21vZHVsZXMgZm9sZGVyLCB3ZSBzaG91bGQgY2xlYXIgdGhlIHRlbXBvcmFyeSBvbmUuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoJ2NsZWFyaW5nIHRlbXAgbm9kZV9tb2R1bGVzIGJlY2F1c2UgbmV3IG9uZSBpcyBhbHJlYWR5IGNyZWF0ZWQnKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLiQudXRpbHMucm1XaXRoUmV0cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyBucG0gbGluayBmb3IgZXZlcnkgcGFja2FnZSBzcGVjaWZpZWQgaW4gc2V0dGluZ3MuanNvbi0+bGlua1BhY2thZ2VzLlxuICAgICAqL1xuICAgIGFzeW5jIGxpbmtOcG1QYWNrYWdlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgaWYgKCdsaW5rUGFja2FnZXMnIGluIHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCkpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNldHRpbmdzLmxpbmtQYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5saW5rUGFja2FnZXMuZm9yRWFjaChwYWNrYWdlTmFtZSA9PlxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLm1ldGVvckFwcC5ydW5OcG0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWydsaW5rJywgcGFja2FnZU5hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3RcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgbnBtIGluIHRoZSBlbGVjdHJvbiBhcHAgdG8gZ2V0IHRoZSBkZXBlbmRlbmNpZXMgaW5zdGFsbGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGFzeW5jIGVuc3VyZURlcHMoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2luc3RhbGxpbmcgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXMpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygncnVubmluZyBucG0gcHJ1bmUgdG8gd2lwZSB1bm5lZWRlZCBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5ydW5OcG0oWydwcnVuZSddKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnVuTnBtKFsnaW5zdGFsbCddLCB0aGlzLiQuZW52LnN0ZGlvKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FybnMgaWYgcGx1Z2lucyB2ZXJzaW9uIGFyZSBvdXRkYXRlZCBpbiBjb21wYXJlIHRvIHRoZSBuZXdlc3Qgc2NhZmZvbGQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbnNWZXJzaW9ucyAtIGN1cnJlbnQgcGx1Z2lucyB2ZXJzaW9ucyBmcm9tIHNldHRpbmdzLmpzb25cbiAgICAgKi9cbiAgICBjaGVja1BsdWdpbnNWZXJzaW9uKHBsdWdpbnNWZXJzaW9ucykge1xuICAgICAgICBjb25zdCBzZXR0aW5nc0pzb24gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLnNjYWZmb2xkLCAnc2V0dGluZ3MuanNvbicpKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBzY2FmZm9sZFBsdWdpbnNWZXJzaW9uID0gdGhpcy4kLmRlc2t0b3AuZ2V0RGVwZW5kZW5jaWVzKHNldHRpbmdzSnNvbiwgZmFsc2UpLnBsdWdpbnM7XG4gICAgICAgIE9iamVjdC5rZXlzKHBsdWdpbnNWZXJzaW9ucykuZm9yRWFjaCgocGx1Z2luTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBsdWdpbk5hbWUgaW4gc2NhZmZvbGRQbHVnaW5zVmVyc2lvbiAmJlxuICAgICAgICAgICAgICAgIHNjYWZmb2xkUGx1Z2luc1ZlcnNpb25bcGx1Z2luTmFtZV0gIT09IHBsdWdpbnNWZXJzaW9uc1twbHVnaW5OYW1lXSAmJlxuICAgICAgICAgICAgICAgIHNlbXZlci5sdChwbHVnaW5zVmVyc2lvbnNbcGx1Z2luTmFtZV0sIHNjYWZmb2xkUGx1Z2luc1ZlcnNpb25bcGx1Z2luTmFtZV0pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy53YXJuKGB5b3UgYXJlIHVzaW5nIG91dGRhdGVkIHZlcnNpb24gJHtwbHVnaW5zVmVyc2lvbnNbcGx1Z2luTmFtZV19IG9mIGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHtwbHVnaW5OYW1lfSwgdGhlIHN1Z2dlc3RlZCB2ZXJzaW9uIHRvIHVzZSBpcyBgICtcbiAgICAgICAgICAgICAgICAgICAgYCR7c2NhZmZvbGRQbHVnaW5zVmVyc2lvbltwbHVnaW5OYW1lXX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVyZ2VzIGNvcmUgZGVwZW5kZW5jeSBsaXN0IHdpdGggdGhlIGRlcGVuZGVuY2llcyBmcm9tIC5kZXNrdG9wLlxuICAgICAqL1xuICAgIHVwZGF0ZURlcGVuZGVuY2llc0xpc3QoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ3VwZGF0aW5nIGxpc3Qgb2YgcGFja2FnZS5qc29uXFwncyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgY29uc3QgZGVza3RvcERlcGVuZGVuY2llcyA9IHRoaXMuJC5kZXNrdG9wLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tQbHVnaW5zVmVyc2lvbihkZXNrdG9wRGVwZW5kZW5jaWVzLnBsdWdpbnMpO1xuXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCdtZXJnaW5nIHNldHRpbmdzLmpzb25bZGVwZW5kZW5jaWVzXScpO1xuICAgICAgICB0aGlzLmRlcHNNYW5hZ2VyLm1lcmdlRGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgJ3NldHRpbmdzLmpzb25bZGVwZW5kZW5jaWVzXScsXG4gICAgICAgICAgICBkZXNrdG9wRGVwZW5kZW5jaWVzLmZyb21TZXR0aW5nc1xuICAgICAgICApO1xuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbWVyZ2luZyBzZXR0aW5ncy5qc29uW3BsdWdpbnNdJyk7XG4gICAgICAgIHRoaXMuZGVwc01hbmFnZXIubWVyZ2VEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgICAnc2V0dGluZ3MuanNvbltwbHVnaW5zXScsXG4gICAgICAgICAgICBkZXNrdG9wRGVwZW5kZW5jaWVzLnBsdWdpbnNcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnbWVyZ2luZyBkZXBlbmRlbmNpZXMgZnJvbSBtb2R1bGVzJyk7XG4gICAgICAgIE9iamVjdC5rZXlzKGRlc2t0b3BEZXBlbmRlbmNpZXMubW9kdWxlcykuZm9yRWFjaChtb2R1bGUgPT5cbiAgICAgICAgICAgIHRoaXMuZGVwc01hbmFnZXIubWVyZ2VEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgICAgICAgYG1vZHVsZVske21vZHVsZX1dYCxcbiAgICAgICAgICAgICAgICBkZXNrdG9wRGVwZW5kZW5jaWVzLm1vZHVsZXNbbW9kdWxlXVxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgdGhpcy5wYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMgPSB0aGlzLmRlcHNNYW5hZ2VyLmdldFJlbW90ZURlcGVuZGVuY2llcygpO1xuICAgICAgICB0aGlzLnBhY2thZ2VKc29uLmxvY2FsRGVwZW5kZW5jaWVzID0gdGhpcy5kZXBzTWFuYWdlci5nZXRMb2NhbERlcGVuZGVuY2llcygpO1xuXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCd3cml0aW5nIHVwZGF0ZWQgcGFja2FnZS5qc29uJyk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnBhY2thZ2VKc29uLCBKU09OLnN0cmluZ2lmeSh0aGlzLnBhY2thZ2VKc29uLCBudWxsLCAyKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluc3RhbGwgbm9kZSBtb2R1bGVzIGZyb20gbG9jYWwgcGF0aHMgdXNpbmcgbG9jYWwtaW5zdGFsbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhcmNoXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgaW5zdGFsbExvY2FsTm9kZU1vZHVsZXMoYXJjaCA9IHRoaXMuJC5lbnYub3B0aW9ucy5pYTMyIHx8IHByb2Nlc3MuYXJjaCA9PT0gJ2lhMzInID8gJ2lhMzInIDogJ3g2NCcpIHtcbiAgICAgICAgY29uc3QgbG9jYWxEZXBlbmRlbmNpZXMgPSBfLnZhbHVlcyh0aGlzLnBhY2thZ2VKc29uLmxvY2FsRGVwZW5kZW5jaWVzKTtcbiAgICAgICAgaWYgKGxvY2FsRGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2luc3RhbGxpbmcgbG9jYWwgbm9kZSBtb2R1bGVzJyk7XG4gICAgICAgIGNvbnN0IGxhc3RSZWJ1aWxkID0gdGhpcy4kLmVsZWN0cm9uQnVpbGRlci5wcmVwYXJlTGFzdFJlYnVpbGRPYmplY3QoYXJjaCk7XG4gICAgICAgIGNvbnN0IGVudiA9IHRoaXMuJC5lbGVjdHJvbkJ1aWxkZXIuZ2V0R3lwRW52KGxhc3RSZWJ1aWxkLmZyYW1ld29ya0luZm8sIGxhc3RSZWJ1aWxkLnBsYXRmb3JtLCBsYXN0UmVidWlsZC5hcmNoKTtcbiAgICAgICAgY29uc3QgaW5zdGFsbGVyID0gbmV3IExvY2FsSW5zdGFsbGVyKFxuICAgICAgICAgICAgeyBbdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290XTogbG9jYWxEZXBlbmRlbmNpZXMgfSxcbiAgICAgICAgICAgIHsgbnBtRW52OiBlbnYgfVxuICAgICAgICApO1xuICAgICAgICBwcm9ncmVzcyhpbnN0YWxsZXIpO1xuICAgICAgICByZXR1cm4gaW5zdGFsbGVyLmluc3RhbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWJ1aWxkIGJpbmFyeSBkZXBlbmRlbmNpZXMgYWdhaW5zdCBFbGVjdHJvbidzIG5vZGUgaGVhZGVycy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICByZWJ1aWxkRGVwcyhpbnN0YWxsID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGluc3RhbGwpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ2lzc3Vpbmcgbm9kZV9tb2R1bGVzIGluc3RhbGwgZnJvbSBlbGVjdHJvbi1idWlsZGVyJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCdpc3N1aW5nIG5hdGl2ZSBtb2R1bGVzIHJlYnVpbGQgZnJvbSBlbGVjdHJvbi1idWlsZGVyJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmNoID0gdGhpcy4kLmVudi5vcHRpb25zLmlhMzIgfHwgcHJvY2Vzcy5hcmNoID09PSAnaWEzMicgPyAnaWEzMicgOiAneDY0JztcblxuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLmlhMzIpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2ZvcmNpbmcgcmVidWlsZCBmb3IgMzJiaXQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYHJlYnVpbGRpbmcgZm9yICR7YXJjaH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiQuZWxlY3Ryb25CdWlsZGVyLmluc3RhbGxPclJlYnVpbGQoYXJjaCwgdW5kZWZpbmVkLCBpbnN0YWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcGFja2FnZS5qc29uIGZpZWxkcyBhY2NvcmRpbmdseSB0byB3aGF0IGlzIHNldCBpbiBzZXR0aW5ncy5qc29uLlxuICAgICAqXG4gICAgICogcGFja2FnZUpzb24ubmFtZSA9IHNldHRpbmdzLnByb2plY3ROYW1lXG4gICAgICogcGFja2FnZUpzb24udmVyc2lvbiA9IHNldHRpbmdzLnZlcnNpb25cbiAgICAgKiBwYWNrYWdlSnNvbi4qID0gc2V0dGluZ3MucGFja2FnZUpzb25GaWVsZHNcbiAgICAgKi9cbiAgICB1cGRhdGVQYWNrYWdlSnNvbkZpZWxkcygpIHtcbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgndXBkYXRpbmcgcGFja2FnZS5qc29uIGZpZWxkcycpO1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCk7XG4gICAgICAgIC8qKiBAdHlwZSB7ZGVza3RvcFNldHRpbmdzfSAqL1xuICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IHRoaXMuc2NhZmZvbGQuZ2V0RGVmYXVsdFBhY2thZ2VKc29uKCk7XG5cbiAgICAgICAgcGFja2FnZUpzb24udmVyc2lvbiA9IHNldHRpbmdzLnZlcnNpb247XG4gICAgICAgIGlmICgncGFja2FnZUpzb25GaWVsZHMnIGluIHNldHRpbmdzKSB7XG4gICAgICAgICAgICBhc3NpZ25JbihwYWNrYWdlSnNvbiwgc2V0dGluZ3MucGFja2FnZUpzb25GaWVsZHMpO1xuICAgICAgICB9XG4gICAgICAgIGFzc2lnbkluKHBhY2thZ2VKc29uLCB7IG5hbWU6IHNldHRpbmdzLnByb2plY3ROYW1lIH0pO1xuXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCd3cml0aW5nIHVwZGF0ZWQgcGFja2FnZS5qc29uJyk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnBhY2thZ2VKc29uLCBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgNClcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wYWNrYWdlSnNvbiA9IHBhY2thZ2VKc29uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgc2V0dGluZ3MuanNvbiB3aXRoIGVudiAocHJvZC9kZXYpIGluZm9ybWF0aW9uIGFuZCB2ZXJzaW9ucy5cbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVTZXR0aW5nc0pzb25GaWVsZHMoKSB7XG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCd1cGRhdGluZyBzZXR0aW5ncy5qc29uIGZpZWxkcycpO1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCk7XG5cbiAgICAgICAgLy8gU2F2ZSB2ZXJzaW9ucy5cbiAgICAgICAgc2V0dGluZ3MuY29tcGF0aWJpbGl0eVZlcnNpb24gPSB0aGlzLmNvbXBhdGliaWxpdHlWZXJzaW9uO1xuXG4gICAgICAgIC8vIFBhc3MgaW5mb3JtYXRpb24gYWJvdXQgYnVpbGQgdHlwZSB0byB0aGUgc2V0dGluZ3MuanNvbi5cbiAgICAgICAgc2V0dGluZ3MuZW52ID0gKHRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkgP1xuICAgICAgICAgICAgJ3Byb2QnIDogJ2Rldic7XG5cbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IHRoaXMuJC5kZXNrdG9wLmdldEhhc2hWZXJzaW9uKCk7XG4gICAgICAgIHNldHRpbmdzLmRlc2t0b3BWZXJzaW9uID0gYCR7dmVyc2lvbn1fJHtzZXR0aW5ncy5lbnZ9YDtcblxuICAgICAgICBzZXR0aW5ncy5tZXRlb3JEZXNrdG9wVmVyc2lvbiA9IHRoaXMuJC5nZXRWZXJzaW9uKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5wcm9kRGVidWcpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLnByb2REZWJ1ZyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5kZXNrdG9wVG1wLnNldHRpbmdzLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncywgbnVsbCwgNClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZmlsZXMgZnJvbSBwcmVwYXJlZCAuZGVza3RvcCB0byBkZXNrdG9wLmFzYXIgaW4gZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIHBhY2tEZXNrdG9wVG9Bc2FyKCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdwYWNraW5nIC5kZXNrdG9wIHRvIGFzYXInKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGFzYXIuY3JlYXRlUGFja2FnZShcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3BUbXAucm9vdCxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmRlc2t0b3BBc2FyLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnY2xlYXJpbmcgdGVtcG9yYXJ5IC5kZXNrdG9wJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJC51dGlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnJtV2l0aFJldHJpZXMoJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcFRtcC5yb290KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgdGVtcG9yYXJ5IGNvcHkgb2YgLmRlc2t0b3AuXG4gICAgICovXG4gICAgY29weURlc2t0b3BUb0Rlc2t0b3BUZW1wKCkge1xuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjb3B5aW5nIC5kZXNrdG9wIHRvIHRlbXBvcmFyeSBsb2NhdGlvbicpO1xuICAgICAgICBzaGVsbC5jcCgnLXJmJywgdGhpcy4kLmVudi5wYXRocy5kZXNrdG9wLnJvb3QsIHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcFRtcC5yb290KTtcbiAgICAgICAgLy8gUmVtb3ZlIHRlc3QgZmlsZXMuXG4gICAgICAgIGRlbC5zeW5jKFtcbiAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmRlc2t0b3BUbXAucm9vdCwgJyoqJywgJyoudGVzdC5qcycpXG4gICAgICAgIF0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUnVucyBiYWJlbCBhbmQgdWdsaWZ5IG92ZXIgLmRlc2t0b3AgaWYgcmVxdWVzdGVkLlxuICAgICAqL1xuICAgIGFzeW5jIHRyYW5zcGlsZUFuZE1pbmlmeSgpIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mbygndHJhbnNwaWxpbmcgYW5kIHVnbGlmeWluZycpO1xuXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy4kLmRlc2t0b3AuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9ICd1Z2xpZnlPcHRpb25zJyBpbiBzZXR0aW5ncyA/IHNldHRpbmdzLnVnbGlmeU9wdGlvbnMgOiB7fTtcblxuICAgICAgICBjb25zdCB1Z2xpZnlpbmdFbmFibGVkID0gJ3VnbGlmeScgaW4gc2V0dGluZ3MgJiYgISFzZXR0aW5ncy51Z2xpZnk7XG5cbiAgICAgICAgY29uc3QgcHJlc2V0ID0gcHJlc2V0RW52KHVuZGVmaW5lZCwgeyB0YXJnZXRzOiB7IG5vZGU6ICc4JyB9IH0pO1xuXG4gICAgICAgIGNvbnN0IHsgZGF0YTogZmlsZXMgfSA9IGF3YWl0IHRoaXMuJC51dGlscy5yZWFkRGlyKHRoaXMuJC5lbnYucGF0aHMuZGVza3RvcFRtcC5yb290KTtcblxuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgeyBjb2RlIH0gPSB0cmFuc2Zvcm1GaWxlU3luYyhmaWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIHByZXNldHM6IFtwcmVzZXRdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5lbnYgPT09ICdwcm9kJyAmJiB1Z2xpZnlpbmdFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICh7IGNvZGUsIGVycm9yIH0gPSB1Z2xpZnkubWluaWZ5KGNvZGUsIG9wdGlvbnMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgY29kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIGFsbCB0aGUgZmlsZXMgdGhhdCBzaG91bGQgbm90IGJlIHBhY2tlZCBpbnRvIGFzYXIgaW50byBhIHNhZmUgbG9jYXRpb24gd2hpY2ggaXMgdGhlXG4gICAgICogJ2V4dHJhY3RlZCcgZGlyIGluIHRoZSBlbGVjdHJvbiBhcHAuXG4gICAgICovXG4gICAgYXN5bmMgZXhjbHVkZUZpbGVzRnJvbUFyY2hpdmUoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2V4Y2x1ZGluZyBmaWxlcyBmcm9tIHBhY2tpbmcnKTtcblxuICAgICAgICAvLyBFbnN1cmUgZW1wdHkgYGV4dHJhY3RlZGAgZGlyXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuJC51dGlscy5ybVdpdGhSZXRyaWVzKCctcmYnLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNoZWxsLm1rZGlyKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkKTtcblxuICAgICAgICBjb25zdCBjb25maWdzID0gdGhpcy4kLmRlc2t0b3AuZ2F0aGVyTW9kdWxlQ29uZmlncygpO1xuXG4gICAgICAgIC8vIE1vdmUgZmlsZXMgdGhhdCBzaG91bGQgbm90IGJlIGFzYXInZWQuXG4gICAgICAgIGNvbmZpZ3MuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVDb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICBpZiAoJ2V4dHJhY3QnIGluIG1vZHVsZUNvbmZpZykge1xuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShtb2R1bGVDb25maWcuZXh0cmFjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlQ29uZmlnLmV4dHJhY3QgPSBbbW9kdWxlQ29uZmlnLmV4dHJhY3RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2R1bGVDb25maWcuZXh0cmFjdC5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKGBleGNsdWRpbmcgJHtmaWxlfSBmcm9tICR7Y29uZmlnLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5kZXNrdG9wVG1wLm1vZHVsZXMsIG1vZHVsZUNvbmZpZy5kaXJOYW1lLCBmaWxlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkLCBtb2R1bGVDb25maWcuZGlyTmFtZVxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyhkZXN0aW5hdGlvblBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGVsbC5ta2RpcihkZXN0aW5hdGlvblBhdGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNoZWxsLm12KGZpbGVQYXRoLCBkZXN0aW5hdGlvblBhdGgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=