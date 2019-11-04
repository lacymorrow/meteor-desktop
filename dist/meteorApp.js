"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _fs = _interopRequireDefault(require("fs"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _semver = _interopRequireDefault(require("semver"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _path = _interopRequireDefault(require("path"));

var _singleLineLog = _interopRequireDefault(require("single-line-log"));

var _asar = _interopRequireDefault(require("asar"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _isDesktopInjector = _interopRequireDefault(require("../skeleton/modules/autoupdate/isDesktopInjector"));

var _log = _interopRequireDefault(require("./log"));

var _meteorManager = _interopRequireDefault(require("./meteorManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var join = _path.default.join;
var sll = _singleLineLog.default.stdout; // TODO: refactor all strategy ifs to one place

/**
 * Represents the Meteor app.
 * @property {MeteorDesktop} $
 * @class
 */

var MeteorApp =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   * @constructor
   */
  function MeteorApp($) {
    _classCallCheck(this, MeteorApp);

    this.log = new _log.default('meteorApp');
    this.$ = $;
    this.meteorManager = new _meteorManager.default($);
    this.mobilePlatform = null;
    this.oldManifest = null;
    this.injector = new _isDesktopInjector.default();
    this.matcher = new RegExp('__meteor_runtime_config__ = JSON.parse\\(decodeURIComponent\\("([^"]*)"\\)\\)');
    this.replacer = new RegExp('(__meteor_runtime_config__ = JSON.parse\\(decodeURIComponent\\()"([^"]*)"(\\)\\))');
    this.meteorVersion = null;
    this.indexHTMLstrategy = null;
    this.indexHTMLStrategies = {
      INDEX_FROM_CORDOVA_BUILD: 1,
      INDEX_FROM_RUNNING_SERVER: 2
    };
    this.deprectatedPackages = ['omega:meteor-desktop-localstorage'];
  }
  /**
   * Remove any deprecated packages from meteor project.
   * @returns {Promise<void>}
   */


  _createClass(MeteorApp, [{
    key: "removeDeprecatedPackages",
    value: function () {
      var _removeDeprecatedPackages = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!this.meteorManager.checkPackages(this.deprectatedPackages)) {
                  _context.next = 5;
                  break;
                }

                this.log.info('deprecated meteor plugins found, removing them');
                _context.next = 5;
                return this.meteorManager.deletePackages(this.deprectatedPackages);

              case 5:
                _context.next = 10;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                throw new Error(_context.t0);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
      }));

      return function removeDeprecatedPackages() {
        return _removeDeprecatedPackages.apply(this, arguments);
      };
    }()
    /**
     * Ensures that required packages are added to the Meteor app.
     */

  }, {
    key: "ensureDesktopHCPPackages",
    value: function () {
      var _ensureDesktopHCPPackages = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee2() {
        var _this = this;

        var desktopHCPPackages, packagesWithVersion;
        return _runtime.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                desktopHCPPackages = ['omega:meteor-desktop-watcher', 'omega:meteor-desktop-bundler'];

                if (!this.$.desktop.getSettings().desktopHCP) {
                  _context2.next = 14;
                  break;
                }

                this.log.verbose('desktopHCP is enabled, checking for required packages');
                packagesWithVersion = desktopHCPPackages.map(function (packageName) {
                  return `${packageName}@${_this.$.getVersion()}`;
                });
                _context2.prev = 4;
                _context2.next = 7;
                return this.meteorManager.ensurePackages(desktopHCPPackages, packagesWithVersion, 'desktopHCP');

              case 7:
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](4);
                throw new Error(_context2.t0);

              case 12:
                _context2.next = 24;
                break;

              case 14:
                this.log.verbose('desktopHCP is not enabled, removing required packages');
                _context2.prev = 15;

                if (!this.meteorManager.checkPackages(desktopHCPPackages)) {
                  _context2.next = 19;
                  break;
                }

                _context2.next = 19;
                return this.meteorManager.deletePackages(desktopHCPPackages);

              case 19:
                _context2.next = 24;
                break;

              case 21:
                _context2.prev = 21;
                _context2.t1 = _context2["catch"](15);
                throw new Error(_context2.t1);

              case 24:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 9], [15, 21]]);
      }));

      return function ensureDesktopHCPPackages() {
        return _ensureDesktopHCPPackages.apply(this, arguments);
      };
    }()
    /**
     * Adds entry to .meteor/.gitignore if necessary.
     */

  }, {
    key: "updateGitIgnore",
    value: function updateGitIgnore() {
      this.log.verbose('updating .meteor/.gitignore'); // Lets read the .meteor/.gitignore and filter out blank lines.

      var gitIgnore = _fs.default.readFileSync(this.$.env.paths.meteorApp.gitIgnore, 'UTF-8').split('\n').filter(function (ignoredPath) {
        return ignoredPath.trim() !== '';
      });

      if (!~gitIgnore.indexOf(this.$.env.paths.electronApp.rootName)) {
        this.log.verbose(`adding ${this.$.env.paths.electronApp.rootName} to .meteor/.gitignore`);
        gitIgnore.push(this.$.env.paths.electronApp.rootName);

        _fs.default.writeFileSync(this.$.env.paths.meteorApp.gitIgnore, gitIgnore.join('\n'), 'UTF-8');
      }
    }
    /**
     * Reads the Meteor release version used in the app.
     * @returns {string}
     */

  }, {
    key: "getMeteorRelease",
    value: function getMeteorRelease() {
      var release = _fs.default.readFileSync(this.$.env.paths.meteorApp.release, 'UTF-8').replace(/\r/gm, '').split('\n')[0];

      var _release$split = release.split('@');

      var _release$split2 = _slicedToArray(_release$split, 2);

      release = _release$split2[1];

      // We do not care if it is beta.
      if (~release.indexOf('-')) {
        var _release$split3 = release.split('-');

        var _release$split4 = _slicedToArray(_release$split3, 1);

        release = _release$split4[0];
      }

      return release;
    }
    /**
     * Cast Meteor release to semver version.
     * @returns {string}
     */

  }, {
    key: "castMeteorReleaseToSemver",
    value: function castMeteorReleaseToSemver() {
      return `${this.getMeteorRelease()}.0.0`.match(/(^\d+\.\d+\.\d+)/gmi)[0];
    }
    /**
     * Validate meteor version against a versionRange.
     * @param {string} versionRange - semver version range
     */

  }, {
    key: "checkMeteorVersion",
    value: function checkMeteorVersion(versionRange) {
      var release = this.castMeteorReleaseToSemver();

      if (!_semver.default.satisfies(release, versionRange)) {
        if (this.$.env.options.skipMobileBuild) {
          this.log.error(`wrong meteor version (${release}) in project - only ` + `${versionRange} is supported`);
        } else {
          this.log.error(`wrong meteor version (${release}) in project - only ` + `${versionRange} is supported for automatic meteor builds (you can always ` + 'try with `--skip-mobile-build` if you are using meteor >= 1.2.1');
        }

        process.exit(1);
      }
    }
    /**
     * Decides which strategy to use while trying to get client build out of Meteor project.
     * @returns {number}
     */

  }, {
    key: "chooseStrategy",
    value: function chooseStrategy() {
      if (this.$.env.options.forceCordovaBuild) {
        return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
      }

      var release = this.castMeteorReleaseToSemver();

      if (_semver.default.satisfies(release, '> 1.3.4')) {
        return this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER;
      }

      if (_semver.default.satisfies(release, '1.3.4')) {
        var explodedVersion = this.getMeteorRelease().split('.');

        if (explodedVersion.length >= 4) {
          if (explodedVersion[3] > 1) {
            return this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER;
          }

          return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
        }
      }

      return this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD;
    }
    /**
     * Checks required preconditions.
     * - Meteor version
     * - is mobile platform added
     */

  }, {
    key: "checkPreconditions",
    value: function () {
      var _checkPreconditions = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee3() {
        var platforms;
        return _runtime.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.$.env.options.skipMobileBuild) {
                  this.checkMeteorVersion('>= 1.2.1');
                } else {
                  this.checkMeteorVersion('>= 1.3.3');
                  this.indexHTMLstrategy = this.chooseStrategy();

                  if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
                    this.log.debug('meteor version is < 1.3.4.2 so the index.html from cordova-build will' + ' be used');
                  } else {
                    this.log.debug('meteor version is >= 1.3.4.2 so the index.html will be downloaded ' + 'from __cordova/index.html');
                  }
                }

                if (this.$.env.options.skipMobileBuild) {
                  _context3.next = 15;
                  break;
                }

                platforms = _fs.default.readFileSync(this.$.env.paths.meteorApp.platforms, 'UTF-8');

                if (!(!~platforms.indexOf('android') && !~platforms.indexOf('ios'))) {
                  _context3.next = 15;
                  break;
                }

                if (!this.$.env.options.android) {
                  this.mobilePlatform = 'ios';
                } else {
                  this.mobilePlatform = 'android';
                }

                this.log.warn(`no mobile target detected - will add '${this.mobilePlatform}' ` + 'just to get a mobile build');
                _context3.prev = 6;
                _context3.next = 9;
                return this.addMobilePlatform(this.mobilePlatform);

              case 9:
                _context3.next = 15;
                break;

              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3["catch"](6);
                this.log.error('failed to add a mobile platform - please try to do it manually');
                process.exit(1);

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[6, 11]]);
      }));

      return function checkPreconditions() {
        return _checkPreconditions.apply(this, arguments);
      };
    }()
    /**
     * Tries to add a mobile platform to meteor project.
     * @param {string} platform - platform to add
     * @returns {Promise}
     */

  }, {
    key: "addMobilePlatform",
    value: function addMobilePlatform(platform) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.log.verbose(`adding mobile platform: ${platform}`);

        (0, _crossSpawn.default)('meteor', ['add-platform', platform], {
          cwd: _this2.$.env.paths.meteorApp.root,
          stdio: _this2.$.env.stdio
        }).on('exit', function () {
          var platforms = _fs.default.readFileSync(_this2.$.env.paths.meteorApp.platforms, 'UTF-8');

          if (!~platforms.indexOf('android') && !~platforms.indexOf('ios')) {
            reject();
          } else {
            resolve();
          }
        });
      });
    }
    /**
     * Tries to remove a mobile platform from meteor project.
     * @param {string} platform - platform to remove
     * @returns {Promise}
     */

  }, {
    key: "removeMobilePlatform",
    value: function removeMobilePlatform(platform) {
      var _this3 = this;

      if (this.$.env.options.skipRemoveMobilePlatform) {
        return Promise.resolve();
      }

      return new Promise(function (resolve, reject) {
        _this3.log.verbose(`removing mobile platform: ${platform}`);

        (0, _crossSpawn.default)('meteor', ['remove-platform', platform], {
          cwd: _this3.$.env.paths.meteorApp.root,
          stdio: _this3.$.env.stdio,
          env: Object.assign({
            METEOR_PRETTY_OUTPUT: 0
          }, process.env)
        }).on('exit', function () {
          var platforms = _fs.default.readFileSync(_this3.$.env.paths.meteorApp.platforms, 'UTF-8');

          if (~platforms.indexOf(platform)) {
            reject();
          } else {
            resolve();
          }
        });
      });
    }
    /**
     * Just checks for index.html and program.json existence.
     * @returns {boolean}
     */

  }, {
    key: "isCordovaBuildReady",
    value: function isCordovaBuildReady() {
      if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
        return this.$.utils.exists(this.$.env.paths.meteorApp.cordovaBuildIndex) && this.$.utils.exists(this.$.env.paths.meteorApp.cordovaBuildProgramJson) && (!this.oldManifest || this.oldManifest && this.oldManifest !== _fs.default.readFileSync(this.$.env.paths.meteorApp.cordovaBuildProgramJson, 'UTF-8'));
      }

      return this.$.utils.exists(this.$.env.paths.meteorApp.webCordovaProgramJson) && (!this.oldManifest || this.oldManifest && this.oldManifest !== _fs.default.readFileSync(this.$.env.paths.meteorApp.webCordovaProgramJson, 'UTF-8'));
    }
    /**
     * Fetches index.html from running project.
     * @returns {Promise.<*>}
     */

  }, {
    key: "acquireIndex",
    value: function () {
      var _acquireIndex = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee4() {
        var port, res, text;
        return _runtime.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                port = this.$.env.options.port ? this.$.env.options.port : 3080;
                this.log.info('acquiring index.html');
                _context4.next = 4;
                return (0, _nodeFetch.default)(`http://127.0.0.1:${port}/__cordova/index.html`);

              case 4:
                res = _context4.sent;
                _context4.next = 7;
                return res.text();

              case 7:
                text = _context4.sent;

                if (!~text.indexOf('src="/cordova.js"')) {
                  _context4.next = 10;
                  break;
                }

                return _context4.abrupt("return", text);

              case 10:
                return _context4.abrupt("return", false);

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function acquireIndex() {
        return _acquireIndex.apply(this, arguments);
      };
    }()
    /**
     * Fetches mainfest.json from running project.
     * @returns {Promise.<void>}
     */

  }, {
    key: "acquireManifest",
    value: function () {
      var _acquireManifest = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee5() {
        var port, res, text;
        return _runtime.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                port = this.$.env.options.port ? this.$.env.options.port : 3080;
                this.log.info('acquiring manifest.json');
                _context5.next = 4;
                return (0, _nodeFetch.default)(`http://127.0.0.1:${port}/__cordova/manifest.json?meteor_dont_serve_index=true`);

              case 4:
                res = _context5.sent;
                _context5.next = 7;
                return res.text();

              case 7:
                text = _context5.sent;
                return _context5.abrupt("return", JSON.parse(text));

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function acquireManifest() {
        return _acquireManifest.apply(this, arguments);
      };
    }()
    /**
     * Tries to get a mobile build from meteor app.
     * In case of failure leaves a meteor.log.
     * A lot of stuff is happening here - but the main aim is to get a mobile build from
     * .meteor/local/cordova-build/www/application and exit as soon as possible.
     *
     * @returns {Promise}
     */

  }, {
    key: "buildMobileTarget",
    value: function buildMobileTarget() {
      var _this4 = this;

      var programJson = this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD ? this.$.env.paths.meteorApp.cordovaBuildProgramJson : this.$.env.paths.meteorApp.webCordovaProgramJson;

      if (this.$.utils.exists(programJson)) {
        this.oldManifest = _fs.default.readFileSync(programJson, 'UTF-8');
      }

      return new Promise(function (resolve, reject) {
        var self = _this4;
        var log = '';
        var desiredExit = false;
        var buildTimeout = null;
        var errorTimeout = null;
        var messageTimeout = null;
        var killTimeout = null;
        var cordovaCheckInterval = null;
        var portProblem = false;

        function windowsKill(pid) {
          self.log.debug(`killing pid: ${pid}`);

          _crossSpawn.default.sync('taskkill', ['/pid', pid, '/f', '/t']); // We will look for other process which might have been created outside the
          // process tree.
          // Lets list all node.exe processes.


          var out = _crossSpawn.default.sync('wmic', ['process', 'where', 'caption="node.exe"', 'get', 'commandline,processid']).stdout.toString('utf-8').split('\n');

          var args = self.prepareArguments(); // Lets mount regex.

          var regexV1 = new RegExp(`${args.join('\\s+')}\\s+(\\d+)`, 'gm');
          var regexV2 = new RegExp(`"${args.join('"\\s+"')}"\\s+(\\d+)`, 'gm'); // No we will check for those with the matching params.

          out.forEach(function (line) {
            var match = regexV1.exec(line) || regexV2.exec(line) || false;

            if (match) {
              self.log.debug(`killing pid: ${match[1]}`);

              _crossSpawn.default.sync('taskkill', ['/pid', match[1], '/f', '/t']);
            }

            regexV1.lastIndex = 0;
            regexV2.lastIndex = 0;
          });
        }

        function writeLog() {
          _fs.default.writeFileSync('meteor.log', log, 'UTF-8');
        }

        function clearTimeoutsAndIntervals() {
          clearInterval(cordovaCheckInterval);
          clearTimeout(buildTimeout);
          clearTimeout(errorTimeout);
          clearTimeout(messageTimeout);
          clearTimeout(killTimeout);
        }

        var args = _this4.prepareArguments();

        _this4.log.info(`running "meteor ${args.join(' ')}"... this might take a while`);

        var env = {
          METEOR_PRETTY_OUTPUT: 0,
          METEOR_NO_RELEASE_CHECK: 1
        };

        if (_this4.$.env.options.prodDebug) {
          env.METEOR_DESKOP_PROD_DEBUG = true;
        } // Lets spawn meteor.


        var child = (0, _crossSpawn.default)('meteor', args, {
          env: Object.assign(env, process.env),
          cwd: _this4.$.env.paths.meteorApp.root
        }, {
          shell: true
        }); // Kills the currently running meteor command.

        function kill() {
          sll('');
          child.kill('SIGKILL');

          if (self.$.env.os.isWindows) {
            windowsKill(child.pid);
          }
        }

        function exit() {
          killTimeout = setTimeout(function () {
            clearTimeoutsAndIntervals();
            desiredExit = true;
            kill();
            resolve();
          }, 500);
        }

        function copyBuild() {
          self.copyBuild().then(function () {
            exit();
          }).catch(function () {
            clearTimeoutsAndIntervals();
            kill();
            writeLog();
            reject('copy');
          });
        }

        cordovaCheckInterval = setInterval(function () {
          // Check if we already have cordova-build ready.
          if (_this4.isCordovaBuildReady()) {
            // If so, then exit immediately.
            if (_this4.indexHTMLstrategy === _this4.indexHTMLStrategies.INDEX_FROM_CORDOVA_BUILD) {
              copyBuild();
            }
          }
        }, 1000);
        child.stderr.on('data', function (chunk) {
          var line = chunk.toString('UTF-8');
          log += `${line}\n`;

          if (errorTimeout) {
            clearTimeout(errorTimeout);
          } // Do not exit if this is the warning for using --production.
          // Output exceeds -> https://github.com/meteor/meteor/issues/8592


          if (!~line.indexOf('Browserslist') && !~line.indexOf('--production') && !~line.indexOf('Output exceeds ') && !~line.indexOf('Node#moveTo') && Array.isArray(self.$.env.options.ignoreStderr) && self.$.env.options.ignoreStderr.every(function (str) {
            return !~line.indexOf(str);
          })) {
            self.log.warn('STDERR:', line); // We will exit 1s after last error in stderr.

            errorTimeout = setTimeout(function () {
              clearTimeoutsAndIntervals();
              kill();
              writeLog();
              reject('error');
            }, 1000);
          }
        });
        child.stdout.on('data', function (chunk) {
          var line = chunk.toString('UTF-8');

          if (!desiredExit && line.trim().replace(/[\n\r\t\v\f]+/gm, '') !== '') {
            var linesToDisplay = line.trim().split('\n\r'); // Only display last line from the chunk.

            var sanitizedLine = linesToDisplay.pop().replace(/[\n\r\t\v\f]+/gm, '');
            sll(sanitizedLine);
          }

          log += `${line}\n`;

          if (~line.indexOf('after_platform_add')) {
            sll('');

            _this4.log.info('done... 10%');
          }

          if (~line.indexOf('Local package version')) {
            if (messageTimeout) {
              clearTimeout(messageTimeout);
            }

            messageTimeout = setTimeout(function () {
              sll('');

              _this4.log.info('building in progress...');
            }, 1500);
          }

          if (~line.indexOf('Preparing Cordova project')) {
            sll('');

            _this4.log.info('done... 60%');
          }

          if (~line.indexOf('Can\'t listen on port')) {
            portProblem = true;
          }

          if (~line.indexOf('Your application has errors')) {
            if (errorTimeout) {
              clearTimeout(errorTimeout);
            }

            errorTimeout = setTimeout(function () {
              clearTimeoutsAndIntervals();
              kill();
              writeLog();
              reject('errorInApp');
            }, 1000);
          }

          if (~line.indexOf('App running at')) {
            copyBuild();
          }
        }); // When Meteor exits

        child.on('exit', function () {
          sll('');
          clearTimeoutsAndIntervals();

          if (!desiredExit) {
            writeLog();

            if (portProblem) {
              reject('port');
            } else {
              reject('exit');
            }
          }
        });
        buildTimeout = setTimeout(function () {
          kill();
          writeLog();
          reject('timeout');
        }, _this4.$.env.options.buildTimeout ? _this4.$.env.options.buildTimeout * 1000 : 600000);
      });
    }
    /**
     * Replaces the DDP url that was used originally when Meteor was building the client.
     * @param {string} indexHtml - path to index.html from the client
     */

  }, {
    key: "updateDdpUrl",
    value: function updateDdpUrl(indexHtml) {
      var content;
      var runtimeConfig;

      try {
        content = _fs.default.readFileSync(indexHtml, 'UTF-8');
      } catch (e) {
        this.log.error(`error loading index.html file: ${e.message}`);
        process.exit(1);
      }

      if (!this.matcher.test(content)) {
        this.log.error('could not find runtime config in index file');
        process.exit(1);
      }

      try {
        var matches = content.match(this.matcher);
        runtimeConfig = JSON.parse(decodeURIComponent(matches[1]));
      } catch (e) {
        this.log.error('could not find runtime config in index file');
        process.exit(1);
      }

      if (this.$.env.options.ddpUrl.substr(-1, 1) !== '/') {
        this.$.env.options.ddpUrl += '/';
      }

      runtimeConfig.ROOT_URL = this.$.env.options.ddpUrl;
      runtimeConfig.DDP_DEFAULT_CONNECTION_URL = this.$.env.options.ddpUrl;
      content = content.replace(this.replacer, `$1"${encodeURIComponent(JSON.stringify(runtimeConfig))}"$3`);

      try {
        _fs.default.writeFileSync(indexHtml, content);
      } catch (e) {
        this.log.error(`error writing index.html file: ${e.message}`);
        process.exit(1);
      }

      this.log.info('successfully updated ddp string in the runtime config of a mobile build' + ` to ${this.$.env.options.ddpUrl}`);
    }
    /**
     * Prepares the arguments passed to `meteor` command.
     * @returns {string[]}
     */

  }, {
    key: "prepareArguments",
    value: function prepareArguments() {
      var args = ['run', '--verbose', `--mobile-server=${this.$.env.options.ddpUrl}`];

      if (this.$.env.isProductionBuild()) {
        args.push('--production');
      }

      args.push('-p');

      if (this.$.env.options.port) {
        args.push(this.$.env.options.port);
      } else {
        args.push('3080');
      }

      if (this.$.env.options.meteorSettings) {
        args.push('--settings', this.$.env.options.meteorSettings);
      }

      return args;
    }
    /**
     * Validates the mobile build and copies it into electron app.
     */

  }, {
    key: "copyBuild",
    value: function () {
      var _copyBuild = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee6() {
        var prefix, copyPathPostfix, indexHtml, cordovaBuild, cordovaBuildIndex, cordovaBuildProgramJson, programJson;
        return _runtime.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.log.debug('clearing build dir');
                _context6.prev = 1;
                _context6.next = 4;
                return this.$.utils.rmWithRetries('-rf', this.$.env.paths.electronApp.meteorApp);

              case 4:
                _context6.next = 9;
                break;

              case 6:
                _context6.prev = 6;
                _context6.t0 = _context6["catch"](1);
                throw new Error(_context6.t0);

              case 9:
                prefix = 'cordovaBuild';
                copyPathPostfix = '';

                if (!(this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                  _context6.next = 27;
                  break;
                }

                prefix = 'webCordova';
                copyPathPostfix = `${_path.default.sep}*`;
                _context6.prev = 14;

                _fs.default.mkdirSync(this.$.env.paths.electronApp.meteorApp);

                _context6.next = 18;
                return this.acquireIndex();

              case 18:
                indexHtml = _context6.sent;

                _fs.default.writeFileSync(this.$.env.paths.electronApp.meteorAppIndex, indexHtml);

                this.log.info('successfully downloaded index.html from running meteor app');
                _context6.next = 27;
                break;

              case 23:
                _context6.prev = 23;
                _context6.t1 = _context6["catch"](14);
                this.log.error('error while trying to download index.html for web.cordova, ' + 'be sure that you are running a mobile target or with' + ' --mobile-server: ', _context6.t1);
                throw _context6.t1;

              case 27:
                cordovaBuild = this.$.env.paths.meteorApp[prefix];
                cordovaBuildIndex = this.$.env.paths.meteorApp.cordovaBuildIndex;
                cordovaBuildProgramJson = this.$.env.paths.meteorApp[`${prefix}ProgramJson`];

                if (this.$.utils.exists(cordovaBuild)) {
                  _context6.next = 34;
                  break;
                }

                this.log.error(`no mobile build found at ${cordovaBuild}`);
                this.log.error('are you sure you did run meteor with --mobile-server?');
                throw new Error('required file not present');

              case 34:
                if (this.$.utils.exists(cordovaBuildProgramJson)) {
                  _context6.next = 38;
                  break;
                }

                this.log.error('no program.json found in mobile build found at ' + `${cordovaBuild}`);
                this.log.error('are you sure you did run meteor with --mobile-server?');
                throw new Error('required file not present');

              case 38:
                if (!(this.indexHTMLstrategy !== this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                  _context6.next = 43;
                  break;
                }

                if (this.$.utils.exists(cordovaBuildIndex)) {
                  _context6.next = 43;
                  break;
                }

                this.log.error('no index.html found in cordova build found at ' + `${cordovaBuild}`);
                this.log.error('are you sure you did run meteor with --mobile-server?');
                throw new Error('required file not present');

              case 43:
                this.log.verbose('copying mobile build');

                _shelljs.default.cp('-R', `${cordovaBuild}${copyPathPostfix}`, this.$.env.paths.electronApp.meteorApp); // Because of various permission problems here we try to clear te path by clearing
                // all possible restrictions.


                _shelljs.default.chmod('-R', '777', this.$.env.paths.electronApp.meteorApp);

                if (this.$.env.os.isWindows) {
                  _shelljs.default.exec(`attrib -r ${this.$.env.paths.electronApp.meteorApp}${_path.default.sep}*.* /s`);
                }

                if (!(this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER)) {
                  _context6.next = 60;
                  break;
                }

                _context6.prev = 48;
                _context6.next = 51;
                return this.acquireManifest();

              case 51:
                programJson = _context6.sent;

                _fs.default.writeFileSync(this.$.env.paths.electronApp.meteorAppProgramJson, JSON.stringify(programJson, null, 4));

                this.log.info('successfully downloaded manifest.json from running meteor app');
                _context6.next = 60;
                break;

              case 56:
                _context6.prev = 56;
                _context6.t2 = _context6["catch"](48);
                this.log.error('error while trying to download manifest.json for web.cordova,' + ' be sure that you are running a mobile target or with' + ' --mobile-server: ', _context6.t2);
                throw _context6.t2;

              case 60:
                this.log.info('mobile build copied to electron app');
                this.log.debug('copy cordova.js to meteor build');

                _shelljs.default.cp(join(__dirname, '..', 'skeleton', 'cordova.js'), this.$.env.paths.electronApp.meteorApp);

              case 63:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[1, 6], [14, 23], [48, 56]]);
      }));

      return function copyBuild() {
        return _copyBuild.apply(this, arguments);
      };
    }()
    /**
     * Injects Meteor.isDesktop
     */

  }, {
    key: "injectIsDesktop",
    value: function injectIsDesktop() {
      var _this5 = this;

      this.log.info('injecting isDesktop');
      var manifestJsonPath = this.$.env.paths.meteorApp.cordovaBuildProgramJson;

      if (this.indexHTMLstrategy === this.indexHTMLStrategies.INDEX_FROM_RUNNING_SERVER) {
        manifestJsonPath = this.$.env.paths.meteorApp.webCordovaProgramJson;
      }

      try {
        var _JSON$parse = JSON.parse(_fs.default.readFileSync(manifestJsonPath, 'UTF-8')),
            manifest = _JSON$parse.manifest;

        var injected = false;
        var injectedStartupDidComplete = false;
        var result = null; // We will search in every .js file in the manifest.
        // We could probably detect whether this is a dev or production build and only search in
        // the correct files, but for now this should be fine.

        manifest.forEach(function (file) {
          var fileContents; // Hacky way of setting isDesktop.

          if (file.type === 'js') {
            fileContents = _fs.default.readFileSync(join(_this5.$.env.paths.electronApp.meteorApp, file.path), 'UTF-8');
            result = _this5.injector.processFileContents(fileContents);
            var _result = result;
            fileContents = _result.fileContents;
            injectedStartupDidComplete = result.injectedStartupDidComplete ? true : injectedStartupDidComplete;
            injected = result.injected ? true : injected;

            _fs.default.writeFileSync(join(_this5.$.env.paths.electronApp.meteorApp, file.path), fileContents);
          }
        });

        if (!injected) {
          this.log.error('error injecting isDesktop global var.');
          process.exit(1);
        }

        if (!injectedStartupDidComplete) {
          this.log.error('error injecting isDesktop for startupDidComplete');
          process.exit(1);
        }
      } catch (e) {
        this.log.error('error occurred while injecting isDesktop: ', e);
        process.exit(1);
      }

      this.log.info('injected successfully');
    }
    /**
     * Builds, modifies and copies the meteor app to electron app.
     */

  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee7() {
        return _runtime.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.log.info('checking for any mobile platform');
                _context7.prev = 1;
                _context7.next = 4;
                return this.checkPreconditions();

              case 4:
                _context7.next = 10;
                break;

              case 6:
                _context7.prev = 6;
                _context7.t0 = _context7["catch"](1);
                this.log.error('error occurred during checking preconditions: ', _context7.t0);
                process.exit(1);

              case 10:
                this.log.info('building meteor app');

                if (this.$.env.options.skipMobileBuild) {
                  _context7.next = 41;
                  break;
                }

                _context7.prev = 12;
                _context7.next = 15;
                return this.buildMobileTarget();

              case 15:
                _context7.next = 39;
                break;

              case 17:
                _context7.prev = 17;
                _context7.t1 = _context7["catch"](12);
                _context7.t2 = _context7.t1;
                _context7.next = _context7.t2 === 'timeout' ? 22 : _context7.t2 === 'error' ? 24 : _context7.t2 === 'errorInApp' ? 26 : _context7.t2 === 'port' ? 28 : _context7.t2 === 'exit' ? 30 : _context7.t2 === 'copy' ? 32 : 34;
                break;

              case 22:
                this.log.error('timeout while building, log has been written to meteor.log');
                return _context7.abrupt("break", 35);

              case 24:
                this.log.error('build was terminated by meteor-desktop as some errors were reported to stderr, you ' + 'should see it above, also check meteor.log for more info, to ignore it use the ' + '--ignore-stderr "<string>"');
                return _context7.abrupt("break", 35);

              case 26:
                this.log.error('your meteor app has errors - look into meteor.log for more' + ' info');
                return _context7.abrupt("break", 35);

              case 28:
                this.log.error('your port 3080 is currently used (you probably have this or other ' + 'meteor project running?), use `-t` or `--meteor-port` to use ' + 'different port while building');
                return _context7.abrupt("break", 35);

              case 30:
                this.log.error('meteor cmd exited unexpectedly, log has been written to meteor.log');
                return _context7.abrupt("break", 35);

              case 32:
                this.log.error('error encountered when copying the build');
                return _context7.abrupt("break", 35);

              case 34:
                this.log.error('error occurred during building mobile target', _context7.t1);

              case 35:
                if (!this.mobilePlatform) {
                  _context7.next = 38;
                  break;
                }

                _context7.next = 38;
                return this.removeMobilePlatform(this.mobilePlatform);

              case 38:
                process.exit(1);

              case 39:
                _context7.next = 50;
                break;

              case 41:
                this.indexHTMLstrategy = this.chooseStrategy();
                _context7.prev = 42;
                _context7.next = 45;
                return this.copyBuild();

              case 45:
                _context7.next = 50;
                break;

              case 47:
                _context7.prev = 47;
                _context7.t3 = _context7["catch"](42);
                process.exit(1);

              case 50:
                this.injectIsDesktop();
                this.changeDdpUrl();
                _context7.prev = 52;
                _context7.next = 55;
                return this.packToAsar();

              case 55:
                _context7.next = 61;
                break;

              case 57:
                _context7.prev = 57;
                _context7.t4 = _context7["catch"](52);
                this.log.error('error while packing meteor app to asar');
                process.exit(1);

              case 61:
                this.log.info('meteor build finished');

                if (!this.mobilePlatform) {
                  _context7.next = 65;
                  break;
                }

                _context7.next = 65;
                return this.removeMobilePlatform(this.mobilePlatform);

              case 65:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[1, 6], [12, 17], [42, 47], [52, 57]]);
      }));

      return function build() {
        return _build.apply(this, arguments);
      };
    }()
  }, {
    key: "changeDdpUrl",
    value: function changeDdpUrl() {
      if (this.$.env.options.ddpUrl !== null) {
        try {
          this.updateDdpUrl(this.$.env.paths.electronApp.meteorAppIndex);
        } catch (e) {
          this.log.error(`error while trying to change the ddp url: ${e.message}`);
        }
      }
    }
  }, {
    key: "packToAsar",
    value: function packToAsar() {
      var _this6 = this;

      this.log.info('packing meteor app to asar archive');
      return new Promise(function (resolve, reject) {
        return _asar.default.createPackage(_this6.$.env.paths.electronApp.meteorApp, _path.default.join(_this6.$.env.paths.electronApp.root, 'meteor.asar'), function () {
          // On Windows some files might still be blocked. Giving a tick for them to be
          // ready for deletion.
          setImmediate(function () {
            _this6.log.verbose('clearing meteor app after packing');

            _this6.$.utils.rmWithRetries('-rf', _this6.$.env.paths.electronApp.meteorApp).then(function () {
              resolve();
            }).catch(function (e) {
              reject(e);
            });
          });
        });
      });
    }
    /**
     * Wrapper for spawning npm.
     * @param {Array}  commands - commands for spawn
     * @param {string} stdio
     * @param {string} cwd
     * @return {Promise}
     */

  }, {
    key: "runNpm",
    value: function runNpm(commands) {
      var _this7 = this;

      var stdio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ignore';
      var cwd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.$.env.paths.meteorApp.root;
      return new Promise(function (resolve, reject) {
        _this7.log.verbose(`executing meteor npm ${commands.join(' ')}`);

        (0, _crossSpawn.default)('meteor', ['npm'].concat(_toConsumableArray(commands)), {
          cwd,
          stdio
        }).on('exit', function (code) {
          return code === 0 ? resolve() : reject(new Error(`npm exit code was ${code}`));
        });
      });
    }
  }]);

  return MeteorApp;
}();

exports.default = MeteorApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9tZXRlb3JBcHAuanMiXSwibmFtZXMiOlsiam9pbiIsInNsbCIsInN0ZG91dCIsIk1ldGVvckFwcCIsIiQiLCJsb2ciLCJtZXRlb3JNYW5hZ2VyIiwibW9iaWxlUGxhdGZvcm0iLCJvbGRNYW5pZmVzdCIsImluamVjdG9yIiwibWF0Y2hlciIsIlJlZ0V4cCIsInJlcGxhY2VyIiwibWV0ZW9yVmVyc2lvbiIsImluZGV4SFRNTHN0cmF0ZWd5IiwiaW5kZXhIVE1MU3RyYXRlZ2llcyIsIklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCIsIklOREVYX0ZST01fUlVOTklOR19TRVJWRVIiLCJkZXByZWN0YXRlZFBhY2thZ2VzIiwiY2hlY2tQYWNrYWdlcyIsImluZm8iLCJkZWxldGVQYWNrYWdlcyIsIkVycm9yIiwiZGVza3RvcEhDUFBhY2thZ2VzIiwiZGVza3RvcCIsImdldFNldHRpbmdzIiwiZGVza3RvcEhDUCIsInZlcmJvc2UiLCJwYWNrYWdlc1dpdGhWZXJzaW9uIiwibWFwIiwicGFja2FnZU5hbWUiLCJnZXRWZXJzaW9uIiwiZW5zdXJlUGFja2FnZXMiLCJnaXRJZ25vcmUiLCJyZWFkRmlsZVN5bmMiLCJlbnYiLCJwYXRocyIsIm1ldGVvckFwcCIsInNwbGl0IiwiZmlsdGVyIiwiaWdub3JlZFBhdGgiLCJ0cmltIiwiaW5kZXhPZiIsImVsZWN0cm9uQXBwIiwicm9vdE5hbWUiLCJwdXNoIiwid3JpdGVGaWxlU3luYyIsInJlbGVhc2UiLCJyZXBsYWNlIiwiZ2V0TWV0ZW9yUmVsZWFzZSIsIm1hdGNoIiwidmVyc2lvblJhbmdlIiwiY2FzdE1ldGVvclJlbGVhc2VUb1NlbXZlciIsInNhdGlzZmllcyIsIm9wdGlvbnMiLCJza2lwTW9iaWxlQnVpbGQiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiZm9yY2VDb3Jkb3ZhQnVpbGQiLCJleHBsb2RlZFZlcnNpb24iLCJsZW5ndGgiLCJjaGVja01ldGVvclZlcnNpb24iLCJjaG9vc2VTdHJhdGVneSIsImRlYnVnIiwicGxhdGZvcm1zIiwiYW5kcm9pZCIsIndhcm4iLCJhZGRNb2JpbGVQbGF0Zm9ybSIsInBsYXRmb3JtIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjd2QiLCJyb290Iiwic3RkaW8iLCJvbiIsInNraXBSZW1vdmVNb2JpbGVQbGF0Zm9ybSIsIk9iamVjdCIsImFzc2lnbiIsIk1FVEVPUl9QUkVUVFlfT1VUUFVUIiwidXRpbHMiLCJleGlzdHMiLCJjb3Jkb3ZhQnVpbGRJbmRleCIsImNvcmRvdmFCdWlsZFByb2dyYW1Kc29uIiwid2ViQ29yZG92YVByb2dyYW1Kc29uIiwicG9ydCIsInJlcyIsInRleHQiLCJKU09OIiwicGFyc2UiLCJwcm9ncmFtSnNvbiIsInNlbGYiLCJkZXNpcmVkRXhpdCIsImJ1aWxkVGltZW91dCIsImVycm9yVGltZW91dCIsIm1lc3NhZ2VUaW1lb3V0Iiwia2lsbFRpbWVvdXQiLCJjb3Jkb3ZhQ2hlY2tJbnRlcnZhbCIsInBvcnRQcm9ibGVtIiwid2luZG93c0tpbGwiLCJwaWQiLCJzeW5jIiwib3V0IiwidG9TdHJpbmciLCJhcmdzIiwicHJlcGFyZUFyZ3VtZW50cyIsInJlZ2V4VjEiLCJyZWdleFYyIiwiZm9yRWFjaCIsImxpbmUiLCJleGVjIiwibGFzdEluZGV4Iiwid3JpdGVMb2ciLCJjbGVhclRpbWVvdXRzQW5kSW50ZXJ2YWxzIiwiY2xlYXJJbnRlcnZhbCIsImNsZWFyVGltZW91dCIsIk1FVEVPUl9OT19SRUxFQVNFX0NIRUNLIiwicHJvZERlYnVnIiwiTUVURU9SX0RFU0tPUF9QUk9EX0RFQlVHIiwiY2hpbGQiLCJzaGVsbCIsImtpbGwiLCJvcyIsImlzV2luZG93cyIsInNldFRpbWVvdXQiLCJjb3B5QnVpbGQiLCJ0aGVuIiwiY2F0Y2giLCJzZXRJbnRlcnZhbCIsImlzQ29yZG92YUJ1aWxkUmVhZHkiLCJzdGRlcnIiLCJjaHVuayIsIkFycmF5IiwiaXNBcnJheSIsImlnbm9yZVN0ZGVyciIsImV2ZXJ5Iiwic3RyIiwibGluZXNUb0Rpc3BsYXkiLCJzYW5pdGl6ZWRMaW5lIiwicG9wIiwiaW5kZXhIdG1sIiwiY29udGVudCIsInJ1bnRpbWVDb25maWciLCJlIiwibWVzc2FnZSIsInRlc3QiLCJtYXRjaGVzIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZGRwVXJsIiwic3Vic3RyIiwiUk9PVF9VUkwiLCJERFBfREVGQVVMVF9DT05ORUNUSU9OX1VSTCIsImVuY29kZVVSSUNvbXBvbmVudCIsInN0cmluZ2lmeSIsImlzUHJvZHVjdGlvbkJ1aWxkIiwibWV0ZW9yU2V0dGluZ3MiLCJybVdpdGhSZXRyaWVzIiwicHJlZml4IiwiY29weVBhdGhQb3N0Zml4Iiwic2VwIiwibWtkaXJTeW5jIiwiYWNxdWlyZUluZGV4IiwibWV0ZW9yQXBwSW5kZXgiLCJjb3Jkb3ZhQnVpbGQiLCJjcCIsImNobW9kIiwiYWNxdWlyZU1hbmlmZXN0IiwibWV0ZW9yQXBwUHJvZ3JhbUpzb24iLCJfX2Rpcm5hbWUiLCJtYW5pZmVzdEpzb25QYXRoIiwibWFuaWZlc3QiLCJpbmplY3RlZCIsImluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlIiwicmVzdWx0IiwiZmlsZSIsImZpbGVDb250ZW50cyIsInR5cGUiLCJwYXRoIiwicHJvY2Vzc0ZpbGVDb250ZW50cyIsImNoZWNrUHJlY29uZGl0aW9ucyIsImJ1aWxkTW9iaWxlVGFyZ2V0IiwicmVtb3ZlTW9iaWxlUGxhdGZvcm0iLCJpbmplY3RJc0Rlc2t0b3AiLCJjaGFuZ2VEZHBVcmwiLCJwYWNrVG9Bc2FyIiwidXBkYXRlRGRwVXJsIiwiY3JlYXRlUGFja2FnZSIsInNldEltbWVkaWF0ZSIsImNvbW1hbmRzIiwiY29kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFUUEsSSxpQkFBQUEsSTtBQUNSLElBQU1DLE1BQU0sdUJBQWNDLE1BQTFCLEMsQ0FFQTs7QUFFQTs7Ozs7O0lBS3FCQyxTOzs7QUFDakI7Ozs7QUFJQSxxQkFBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsU0FBS0MsR0FBTCxHQUFXLGlCQUFRLFdBQVIsQ0FBWDtBQUNBLFNBQUtELENBQUwsR0FBU0EsQ0FBVDtBQUNBLFNBQUtFLGFBQUwsR0FBcUIsMkJBQWtCRixDQUFsQixDQUFyQjtBQUNBLFNBQUtHLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixnQ0FBaEI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsSUFBSUMsTUFBSixDQUNYLCtFQURXLENBQWY7QUFHQSxTQUFLQyxRQUFMLEdBQWdCLElBQUlELE1BQUosQ0FDWixtRkFEWSxDQUFoQjtBQUdBLFNBQUtFLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxTQUFLQyxpQkFBTCxHQUF5QixJQUF6QjtBQUVBLFNBQUtDLG1CQUFMLEdBQTJCO0FBQ3ZCQyxnQ0FBMEIsQ0FESDtBQUV2QkMsaUNBQTJCO0FBRkosS0FBM0I7QUFLQSxTQUFLQyxtQkFBTCxHQUEyQixDQUFDLG1DQUFELENBQTNCO0FBQ0g7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQU1ZLEtBQUtaLGFBQUwsQ0FBbUJhLGFBQW5CLENBQWlDLEtBQUtELG1CQUF0QyxDOzs7OztBQUNBLHFCQUFLYixHQUFMLENBQVNlLElBQVQsQ0FBYyxnREFBZDs7dUJBQ00sS0FBS2QsYUFBTCxDQUFtQmUsY0FBbkIsQ0FBa0MsS0FBS0gsbUJBQXZDLEM7Ozs7Ozs7OztzQkFHSixJQUFJSSxLQUFKLGE7Ozs7Ozs7Ozs7Ozs7O0FBSWQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSVVDLGtDLEdBQXFCLENBQUMsOEJBQUQsRUFBaUMsOEJBQWpDLEM7O3FCQUN2QixLQUFLbkIsQ0FBTCxDQUFPb0IsT0FBUCxDQUFlQyxXQUFmLEdBQTZCQyxVOzs7OztBQUM3QixxQkFBS3JCLEdBQUwsQ0FBU3NCLE9BQVQsQ0FBaUIsdURBQWpCO0FBRU1DLG1DLEdBQXNCTCxtQkFBbUJNLEdBQW5CLENBQXVCO0FBQUEseUJBQWdCLEdBQUVDLFdBQVksSUFBRyxNQUFLMUIsQ0FBTCxDQUFPMkIsVUFBUCxFQUFvQixFQUFyRDtBQUFBLGlCQUF2QixDOzs7dUJBR2xCLEtBQUt6QixhQUFMLENBQW1CMEIsY0FBbkIsQ0FBa0NULGtCQUFsQyxFQUFzREssbUJBQXRELEVBQTJFLFlBQTNFLEM7Ozs7Ozs7OztzQkFFQSxJQUFJTixLQUFKLGM7Ozs7Ozs7QUFHVixxQkFBS2pCLEdBQUwsQ0FBU3NCLE9BQVQsQ0FBaUIsdURBQWpCOzs7cUJBR1EsS0FBS3JCLGFBQUwsQ0FBbUJhLGFBQW5CLENBQWlDSSxrQkFBakMsQzs7Ozs7O3VCQUNNLEtBQUtqQixhQUFMLENBQW1CZSxjQUFuQixDQUFrQ0Usa0JBQWxDLEM7Ozs7Ozs7OztzQkFHSixJQUFJRCxLQUFKLGM7Ozs7Ozs7Ozs7Ozs7O0FBS2xCOzs7Ozs7c0NBR2tCO0FBQ2QsV0FBS2pCLEdBQUwsQ0FBU3NCLE9BQVQsQ0FBaUIsNkJBQWpCLEVBRGMsQ0FFZDs7QUFDQSxVQUFNTSxZQUFZLFlBQUdDLFlBQUgsQ0FBZ0IsS0FBSzlCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkJKLFNBQTNDLEVBQXNELE9BQXRELEVBQ2JLLEtBRGEsQ0FDUCxJQURPLEVBQ0RDLE1BREMsQ0FDTTtBQUFBLGVBQWVDLFlBQVlDLElBQVosT0FBdUIsRUFBdEM7QUFBQSxPQUROLENBQWxCOztBQUdBLFVBQUksQ0FBQyxDQUFDUixVQUFVUyxPQUFWLENBQWtCLEtBQUt0QyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJPLFdBQWpCLENBQTZCQyxRQUEvQyxDQUFOLEVBQWdFO0FBQzVELGFBQUt2QyxHQUFMLENBQVNzQixPQUFULENBQWtCLFVBQVMsS0FBS3ZCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJDLFFBQVMsd0JBQWpFO0FBQ0FYLGtCQUFVWSxJQUFWLENBQWUsS0FBS3pDLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJDLFFBQTVDOztBQUVBLG9CQUFHRSxhQUFILENBQWlCLEtBQUsxQyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCSixTQUE1QyxFQUF1REEsVUFBVWpDLElBQVYsQ0FBZSxJQUFmLENBQXZELEVBQTZFLE9BQTdFO0FBQ0g7QUFDSjtBQUVEOzs7Ozs7O3VDQUltQjtBQUNmLFVBQUkrQyxVQUFVLFlBQUdiLFlBQUgsQ0FBZ0IsS0FBSzlCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkJVLE9BQTNDLEVBQW9ELE9BQXBELEVBQ1RDLE9BRFMsQ0FDRCxNQURDLEVBQ08sRUFEUCxFQUVUVixLQUZTLENBRUgsSUFGRyxFQUVHLENBRkgsQ0FBZDs7QUFEZSwyQkFJQVMsUUFBUVQsS0FBUixDQUFjLEdBQWQsQ0FKQTs7QUFBQTs7QUFJWFMsYUFKVzs7QUFLZjtBQUNBLFVBQUksQ0FBQ0EsUUFBUUwsT0FBUixDQUFnQixHQUFoQixDQUFMLEVBQTJCO0FBQUEsOEJBQ1ZLLFFBQVFULEtBQVIsQ0FBYyxHQUFkLENBRFU7O0FBQUE7O0FBQ3JCUyxlQURxQjtBQUUxQjs7QUFDRCxhQUFPQSxPQUFQO0FBQ0g7QUFFRDs7Ozs7OztnREFJNEI7QUFDeEIsYUFBUSxHQUFFLEtBQUtFLGdCQUFMLEVBQXdCLE1BQTNCLENBQWlDQyxLQUFqQyxDQUF1QyxxQkFBdkMsRUFBOEQsQ0FBOUQsQ0FBUDtBQUNIO0FBRUQ7Ozs7Ozs7dUNBSW1CQyxZLEVBQWM7QUFDN0IsVUFBTUosVUFBVSxLQUFLSyx5QkFBTCxFQUFoQjs7QUFDQSxVQUFJLENBQUMsZ0JBQU9DLFNBQVAsQ0FBaUJOLE9BQWpCLEVBQTBCSSxZQUExQixDQUFMLEVBQThDO0FBQzFDLFlBQUksS0FBSy9DLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJDLGVBQXZCLEVBQXdDO0FBQ3BDLGVBQUtsRCxHQUFMLENBQVNtRCxLQUFULENBQWdCLHlCQUF3QlQsT0FBUSxzQkFBakMsR0FDVixHQUFFSSxZQUFhLGVBRHBCO0FBRUgsU0FIRCxNQUdPO0FBQ0gsZUFBSzlDLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZ0IseUJBQXdCVCxPQUFRLHNCQUFqQyxHQUNWLEdBQUVJLFlBQWEsNERBREwsR0FFWCxpRUFGSjtBQUdIOztBQUNETSxnQkFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDtBQUNKO0FBRUQ7Ozs7Ozs7cUNBSWlCO0FBQ2IsVUFBSSxLQUFLdEQsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQkssaUJBQXZCLEVBQTBDO0FBQ3RDLGVBQU8sS0FBSzVDLG1CQUFMLENBQXlCQyx3QkFBaEM7QUFDSDs7QUFFRCxVQUFNK0IsVUFBVSxLQUFLSyx5QkFBTCxFQUFoQjs7QUFDQSxVQUFJLGdCQUFPQyxTQUFQLENBQWlCTixPQUFqQixFQUEwQixTQUExQixDQUFKLEVBQTBDO0FBQ3RDLGVBQU8sS0FBS2hDLG1CQUFMLENBQXlCRSx5QkFBaEM7QUFDSDs7QUFDRCxVQUFJLGdCQUFPb0MsU0FBUCxDQUFpQk4sT0FBakIsRUFBMEIsT0FBMUIsQ0FBSixFQUF3QztBQUNwQyxZQUFNYSxrQkFBa0IsS0FBS1gsZ0JBQUwsR0FBd0JYLEtBQXhCLENBQThCLEdBQTlCLENBQXhCOztBQUNBLFlBQUlzQixnQkFBZ0JDLE1BQWhCLElBQTBCLENBQTlCLEVBQWlDO0FBQzdCLGNBQUlELGdCQUFnQixDQUFoQixJQUFxQixDQUF6QixFQUE0QjtBQUN4QixtQkFBTyxLQUFLN0MsbUJBQUwsQ0FBeUJFLHlCQUFoQztBQUNIOztBQUNELGlCQUFPLEtBQUtGLG1CQUFMLENBQXlCQyx3QkFBaEM7QUFDSDtBQUNKOztBQUNELGFBQU8sS0FBS0QsbUJBQUwsQ0FBeUJDLHdCQUFoQztBQUNIO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTUksb0JBQUksS0FBS1osQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQkMsZUFBdkIsRUFBd0M7QUFDcEMsdUJBQUtPLGtCQUFMLENBQXdCLFVBQXhCO0FBQ0gsaUJBRkQsTUFFTztBQUNILHVCQUFLQSxrQkFBTCxDQUF3QixVQUF4QjtBQUNBLHVCQUFLaEQsaUJBQUwsR0FBeUIsS0FBS2lELGNBQUwsRUFBekI7O0FBQ0Esc0JBQUksS0FBS2pELGlCQUFMLEtBQTJCLEtBQUtDLG1CQUFMLENBQXlCQyx3QkFBeEQsRUFBa0Y7QUFDOUUseUJBQUtYLEdBQUwsQ0FBUzJELEtBQVQsQ0FDSSwwRUFDQSxVQUZKO0FBSUgsbUJBTEQsTUFLTztBQUNILHlCQUFLM0QsR0FBTCxDQUFTMkQsS0FBVCxDQUNJLHVFQUNBLDJCQUZKO0FBSUg7QUFDSjs7b0JBRUksS0FBSzVELENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJDLGU7Ozs7O0FBQ2RVLHlCLEdBQVksWUFBRy9CLFlBQUgsQ0FBZ0IsS0FBSzlCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkI0QixTQUEzQyxFQUFzRCxPQUF0RCxDOztzQkFDZCxDQUFDLENBQUNBLFVBQVV2QixPQUFWLENBQWtCLFNBQWxCLENBQUYsSUFBa0MsQ0FBQyxDQUFDdUIsVUFBVXZCLE9BQVYsQ0FBa0IsS0FBbEIsQzs7Ozs7QUFDcEMsb0JBQUksQ0FBQyxLQUFLdEMsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQlksT0FBeEIsRUFBaUM7QUFDN0IsdUJBQUszRCxjQUFMLEdBQXNCLEtBQXRCO0FBQ0gsaUJBRkQsTUFFTztBQUNILHVCQUFLQSxjQUFMLEdBQXNCLFNBQXRCO0FBQ0g7O0FBQ0QscUJBQUtGLEdBQUwsQ0FBUzhELElBQVQsQ0FBZSx5Q0FBd0MsS0FBSzVELGNBQWUsSUFBN0QsR0FDViw0QkFESjs7O3VCQUdVLEtBQUs2RCxpQkFBTCxDQUF1QixLQUFLN0QsY0FBNUIsQzs7Ozs7Ozs7O0FBRU4scUJBQUtGLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSxnRUFBZjtBQUNBQyx3QkFBUUMsSUFBUixDQUFhLENBQWI7Ozs7Ozs7Ozs7Ozs7O0FBTWhCOzs7Ozs7OztzQ0FLa0JXLFEsRUFBVTtBQUFBOztBQUN4QixhQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDcEMsZUFBS25FLEdBQUwsQ0FBU3NCLE9BQVQsQ0FBa0IsMkJBQTBCMEMsUUFBUyxFQUFyRDs7QUFDQSxpQ0FBTSxRQUFOLEVBQWdCLENBQUMsY0FBRCxFQUFpQkEsUUFBakIsQ0FBaEIsRUFBNEM7QUFDeENJLGVBQUssT0FBS3JFLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkJxQyxJQURRO0FBRXhDQyxpQkFBTyxPQUFLdkUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXd0M7QUFGc0IsU0FBNUMsRUFHR0MsRUFISCxDQUdNLE1BSE4sRUFHYyxZQUFNO0FBQ2hCLGNBQU1YLFlBQVksWUFBRy9CLFlBQUgsQ0FBZ0IsT0FBSzlCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkI0QixTQUEzQyxFQUFzRCxPQUF0RCxDQUFsQjs7QUFDQSxjQUFJLENBQUMsQ0FBQ0EsVUFBVXZCLE9BQVYsQ0FBa0IsU0FBbEIsQ0FBRixJQUFrQyxDQUFDLENBQUN1QixVQUFVdkIsT0FBVixDQUFrQixLQUFsQixDQUF4QyxFQUFrRTtBQUM5RDhCO0FBQ0gsV0FGRCxNQUVPO0FBQ0hEO0FBQ0g7QUFDSixTQVZEO0FBV0gsT0FiTSxDQUFQO0FBY0g7QUFFRDs7Ozs7Ozs7eUNBS3FCRixRLEVBQVU7QUFBQTs7QUFDM0IsVUFBSSxLQUFLakUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQnVCLHdCQUF2QixFQUFpRDtBQUM3QyxlQUFPUCxRQUFRQyxPQUFSLEVBQVA7QUFDSDs7QUFDRCxhQUFPLElBQUlELE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDcEMsZUFBS25FLEdBQUwsQ0FBU3NCLE9BQVQsQ0FBa0IsNkJBQTRCMEMsUUFBUyxFQUF2RDs7QUFDQSxpQ0FBTSxRQUFOLEVBQWdCLENBQUMsaUJBQUQsRUFBb0JBLFFBQXBCLENBQWhCLEVBQStDO0FBQzNDSSxlQUFLLE9BQUtyRSxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCcUMsSUFEVztBQUUzQ0MsaUJBQU8sT0FBS3ZFLENBQUwsQ0FBTytCLEdBQVAsQ0FBV3dDLEtBRnlCO0FBRzNDeEMsZUFBSzJDLE9BQU9DLE1BQVAsQ0FBYztBQUFFQyxrQ0FBc0I7QUFBeEIsV0FBZCxFQUEyQ3ZCLFFBQVF0QixHQUFuRDtBQUhzQyxTQUEvQyxFQUlHeUMsRUFKSCxDQUlNLE1BSk4sRUFJYyxZQUFNO0FBQ2hCLGNBQU1YLFlBQVksWUFBRy9CLFlBQUgsQ0FBZ0IsT0FBSzlCLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsU0FBakIsQ0FBMkI0QixTQUEzQyxFQUFzRCxPQUF0RCxDQUFsQjs7QUFDQSxjQUFJLENBQUNBLFVBQVV2QixPQUFWLENBQWtCMkIsUUFBbEIsQ0FBTCxFQUFrQztBQUM5Qkc7QUFDSCxXQUZELE1BRU87QUFDSEQ7QUFDSDtBQUNKLFNBWEQ7QUFZSCxPQWRNLENBQVA7QUFlSDtBQUVEOzs7Ozs7OzBDQUlzQjtBQUNsQixVQUFJLEtBQUt6RCxpQkFBTCxLQUEyQixLQUFLQyxtQkFBTCxDQUF5QkMsd0JBQXhELEVBQWtGO0FBQzlFLGVBQU8sS0FBS1osQ0FBTCxDQUFPNkUsS0FBUCxDQUFhQyxNQUFiLENBQW9CLEtBQUs5RSxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCOEMsaUJBQS9DLEtBQ0gsS0FBSy9FLENBQUwsQ0FBTzZFLEtBQVAsQ0FBYUMsTUFBYixDQUFvQixLQUFLOUUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQitDLHVCQUEvQyxDQURHLEtBR0MsQ0FBQyxLQUFLNUUsV0FBTixJQUNDLEtBQUtBLFdBQUwsSUFDRyxLQUFLQSxXQUFMLEtBQXFCLFlBQUcwQixZQUFILENBQ2pCLEtBQUs5QixDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCK0MsdUJBRFYsRUFDbUMsT0FEbkMsQ0FMMUIsQ0FBUDtBQVVIOztBQUNELGFBQU8sS0FBS2hGLENBQUwsQ0FBTzZFLEtBQVAsQ0FBYUMsTUFBYixDQUFvQixLQUFLOUUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQmdELHFCQUEvQyxNQUVDLENBQUMsS0FBSzdFLFdBQU4sSUFDQyxLQUFLQSxXQUFMLElBQ0csS0FBS0EsV0FBTCxLQUFxQixZQUFHMEIsWUFBSCxDQUNqQixLQUFLOUIsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQmdELHFCQURWLEVBQ2lDLE9BRGpDLENBSjFCLENBQVA7QUFTSDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0FBS1VDLG9CLEdBQVEsS0FBS2xGLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJnQyxJQUFwQixHQUE0QixLQUFLbEYsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQmdDLElBQS9DLEdBQXNELEk7QUFDbkUscUJBQUtqRixHQUFMLENBQVNlLElBQVQsQ0FBYyxzQkFBZDs7dUJBQ2tCLHdCQUFPLG9CQUFtQmtFLElBQUssdUJBQS9CLEM7OztBQUFaQyxtQjs7dUJBQ2FBLElBQUlDLElBQUosRTs7O0FBQWJBLG9COztxQkFFRixDQUFDQSxLQUFLOUMsT0FBTCxDQUFhLG1CQUFiLEM7Ozs7O2tEQUNNOEMsSTs7O2tEQUVKLEs7Ozs7Ozs7Ozs7Ozs7O0FBR1g7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLVUYsb0IsR0FBUSxLQUFLbEYsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQmdDLElBQXBCLEdBQTRCLEtBQUtsRixDQUFMLENBQU8rQixHQUFQLENBQVdtQixPQUFYLENBQW1CZ0MsSUFBL0MsR0FBc0QsSTtBQUNuRSxxQkFBS2pGLEdBQUwsQ0FBU2UsSUFBVCxDQUFjLHlCQUFkOzt1QkFDa0Isd0JBQ2Isb0JBQW1Ca0UsSUFBSyx1REFEWCxDOzs7QUFBWkMsbUI7O3VCQUdhQSxJQUFJQyxJQUFKLEU7OztBQUFiQSxvQjtrREFDQ0MsS0FBS0MsS0FBTCxDQUFXRixJQUFYLEM7Ozs7Ozs7Ozs7Ozs7O0FBR1g7Ozs7Ozs7Ozs7O3dDQVFvQjtBQUFBOztBQUNoQixVQUFNRyxjQUNELEtBQUs3RSxpQkFBTCxLQUEyQixLQUFLQyxtQkFBTCxDQUF5QkMsd0JBQXJELEdBQ0ksS0FBS1osQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQitDLHVCQUQvQixHQUVJLEtBQUtoRixDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCZ0QscUJBSG5DOztBQUtBLFVBQUksS0FBS2pGLENBQUwsQ0FBTzZFLEtBQVAsQ0FBYUMsTUFBYixDQUFvQlMsV0FBcEIsQ0FBSixFQUFzQztBQUNsQyxhQUFLbkYsV0FBTCxHQUFtQixZQUFHMEIsWUFBSCxDQUFnQnlELFdBQWhCLEVBQTZCLE9BQTdCLENBQW5CO0FBQ0g7O0FBRUQsYUFBTyxJQUFJckIsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNwQyxZQUFNb0IsT0FBTyxNQUFiO0FBQ0EsWUFBSXZGLE1BQU0sRUFBVjtBQUNBLFlBQUl3RixjQUFjLEtBQWxCO0FBQ0EsWUFBSUMsZUFBZSxJQUFuQjtBQUNBLFlBQUlDLGVBQWUsSUFBbkI7QUFDQSxZQUFJQyxpQkFBaUIsSUFBckI7QUFDQSxZQUFJQyxjQUFjLElBQWxCO0FBQ0EsWUFBSUMsdUJBQXVCLElBQTNCO0FBQ0EsWUFBSUMsY0FBYyxLQUFsQjs7QUFFQSxpQkFBU0MsV0FBVCxDQUFxQkMsR0FBckIsRUFBMEI7QUFDdEJULGVBQUt2RixHQUFMLENBQVMyRCxLQUFULENBQWdCLGdCQUFlcUMsR0FBSSxFQUFuQzs7QUFDQSw4QkFBTUMsSUFBTixDQUFXLFVBQVgsRUFBdUIsQ0FBQyxNQUFELEVBQVNELEdBQVQsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQXZCLEVBRnNCLENBSXRCO0FBQ0E7QUFDQTs7O0FBRUEsY0FBTUUsTUFBTSxvQkFDUEQsSUFETyxDQUVKLE1BRkksRUFHSixDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLG9CQUFyQixFQUEyQyxLQUEzQyxFQUFrRCx1QkFBbEQsQ0FISSxFQUtQcEcsTUFMTyxDQUtBc0csUUFMQSxDQUtTLE9BTFQsRUFNUGxFLEtBTk8sQ0FNRCxJQU5DLENBQVo7O0FBT0EsY0FBTW1FLE9BQU9iLEtBQUtjLGdCQUFMLEVBQWIsQ0Fmc0IsQ0FnQnRCOztBQUNBLGNBQU1DLFVBQVUsSUFBSWhHLE1BQUosQ0FBWSxHQUFFOEYsS0FBS3pHLElBQUwsQ0FBVSxNQUFWLENBQWtCLFlBQWhDLEVBQTZDLElBQTdDLENBQWhCO0FBQ0EsY0FBTTRHLFVBQVUsSUFBSWpHLE1BQUosQ0FBWSxJQUFHOEYsS0FBS3pHLElBQUwsQ0FBVSxRQUFWLENBQW9CLGFBQW5DLEVBQWlELElBQWpELENBQWhCLENBbEJzQixDQW1CdEI7O0FBQ0F1RyxjQUFJTSxPQUFKLENBQVksVUFBQ0MsSUFBRCxFQUFVO0FBQ2xCLGdCQUFNNUQsUUFBUXlELFFBQVFJLElBQVIsQ0FBYUQsSUFBYixLQUFzQkYsUUFBUUcsSUFBUixDQUFhRCxJQUFiLENBQXRCLElBQTRDLEtBQTFEOztBQUNBLGdCQUFJNUQsS0FBSixFQUFXO0FBQ1AwQyxtQkFBS3ZGLEdBQUwsQ0FBUzJELEtBQVQsQ0FBZ0IsZ0JBQWVkLE1BQU0sQ0FBTixDQUFTLEVBQXhDOztBQUNBLGtDQUFNb0QsSUFBTixDQUFXLFVBQVgsRUFBdUIsQ0FBQyxNQUFELEVBQVNwRCxNQUFNLENBQU4sQ0FBVCxFQUFtQixJQUFuQixFQUF5QixJQUF6QixDQUF2QjtBQUNIOztBQUNEeUQsb0JBQVFLLFNBQVIsR0FBb0IsQ0FBcEI7QUFDQUosb0JBQVFJLFNBQVIsR0FBb0IsQ0FBcEI7QUFDSCxXQVJEO0FBU0g7O0FBRUQsaUJBQVNDLFFBQVQsR0FBb0I7QUFDaEIsc0JBQUduRSxhQUFILENBQWlCLFlBQWpCLEVBQStCekMsR0FBL0IsRUFBb0MsT0FBcEM7QUFDSDs7QUFFRCxpQkFBUzZHLHlCQUFULEdBQXFDO0FBQ2pDQyx3QkFBY2pCLG9CQUFkO0FBQ0FrQix1QkFBYXRCLFlBQWI7QUFDQXNCLHVCQUFhckIsWUFBYjtBQUNBcUIsdUJBQWFwQixjQUFiO0FBQ0FvQix1QkFBYW5CLFdBQWI7QUFDSDs7QUFFRCxZQUFNUSxPQUFPLE9BQUtDLGdCQUFMLEVBQWI7O0FBRUEsZUFBS3JHLEdBQUwsQ0FBU2UsSUFBVCxDQUFlLG1CQUFrQnFGLEtBQUt6RyxJQUFMLENBQVUsR0FBVixDQUFlLDhCQUFoRDs7QUFFQSxZQUFNbUMsTUFBTTtBQUFFNkMsZ0NBQXNCLENBQXhCO0FBQTJCcUMsbUNBQXlCO0FBQXBELFNBQVo7O0FBQ0EsWUFBSSxPQUFLakgsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQmdFLFNBQXZCLEVBQWtDO0FBQzlCbkYsY0FBSW9GLHdCQUFKLEdBQStCLElBQS9CO0FBQ0gsU0E3RG1DLENBK0RwQzs7O0FBQ0EsWUFBTUMsUUFBUSx5QkFDVixRQURVLEVBRVZmLElBRlUsRUFHVjtBQUNJdEUsZUFBSzJDLE9BQU9DLE1BQVAsQ0FBYzVDLEdBQWQsRUFBbUJzQixRQUFRdEIsR0FBM0IsQ0FEVDtBQUVJc0MsZUFBSyxPQUFLckUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQnFDO0FBRnBDLFNBSFUsRUFPVjtBQUFFK0MsaUJBQU87QUFBVCxTQVBVLENBQWQsQ0FoRW9DLENBMEVwQzs7QUFDQSxpQkFBU0MsSUFBVCxHQUFnQjtBQUNaekgsY0FBSSxFQUFKO0FBQ0F1SCxnQkFBTUUsSUFBTixDQUFXLFNBQVg7O0FBQ0EsY0FBSTlCLEtBQUt4RixDQUFMLENBQU8rQixHQUFQLENBQVd3RixFQUFYLENBQWNDLFNBQWxCLEVBQTZCO0FBQ3pCeEIsd0JBQVlvQixNQUFNbkIsR0FBbEI7QUFDSDtBQUNKOztBQUVELGlCQUFTM0MsSUFBVCxHQUFnQjtBQUNadUMsd0JBQWM0QixXQUFXLFlBQU07QUFDM0JYO0FBQ0FyQiwwQkFBYyxJQUFkO0FBQ0E2QjtBQUNBbkQ7QUFDSCxXQUxhLEVBS1gsR0FMVyxDQUFkO0FBTUg7O0FBRUQsaUJBQVN1RCxTQUFULEdBQXFCO0FBQ2pCbEMsZUFBS2tDLFNBQUwsR0FBaUJDLElBQWpCLENBQXNCLFlBQU07QUFDeEJyRTtBQUNILFdBRkQsRUFFR3NFLEtBRkgsQ0FFUyxZQUFNO0FBQ1hkO0FBQ0FRO0FBQ0FUO0FBQ0F6QyxtQkFBTyxNQUFQO0FBQ0gsV0FQRDtBQVFIOztBQUVEMEIsK0JBQXVCK0IsWUFBWSxZQUFNO0FBQ3JDO0FBQ0EsY0FBSSxPQUFLQyxtQkFBTCxFQUFKLEVBQWdDO0FBQzVCO0FBQ0EsZ0JBQUksT0FBS3BILGlCQUFMLEtBQ0EsT0FBS0MsbUJBQUwsQ0FBeUJDLHdCQUQ3QixFQUN1RDtBQUNuRDhHO0FBQ0g7QUFDSjtBQUNKLFNBVHNCLEVBU3BCLElBVG9CLENBQXZCO0FBV0FOLGNBQU1XLE1BQU4sQ0FBYXZELEVBQWIsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBQ3dELEtBQUQsRUFBVztBQUMvQixjQUFNdEIsT0FBT3NCLE1BQU01QixRQUFOLENBQWUsT0FBZixDQUFiO0FBQ0FuRyxpQkFBUSxHQUFFeUcsSUFBSyxJQUFmOztBQUNBLGNBQUlmLFlBQUosRUFBa0I7QUFDZHFCLHlCQUFhckIsWUFBYjtBQUNILFdBTDhCLENBTS9CO0FBQ0E7OztBQUNBLGNBQ0ksQ0FBQyxDQUFDZSxLQUFLcEUsT0FBTCxDQUFhLGNBQWIsQ0FBRixJQUNBLENBQUMsQ0FBQ29FLEtBQUtwRSxPQUFMLENBQWEsaUJBQWIsQ0FERixJQUVBLENBQUMsQ0FBQ29FLEtBQUtwRSxPQUFMLENBQWEsYUFBYixDQUZGLElBSUkyRixNQUFNQyxPQUFOLENBQWMxQyxLQUFLeEYsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQmlGLFlBQWpDLEtBQ0EzQyxLQUFLeEYsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQmlGLFlBQW5CLENBQWdDQyxLQUFoQyxDQUFzQztBQUFBLG1CQUFPLENBQUMsQ0FBQzFCLEtBQUtwRSxPQUFMLENBQWErRixHQUFiLENBQVQ7QUFBQSxXQUF0QyxDQU5SLEVBUUU7QUFDRTdDLGlCQUFLdkYsR0FBTCxDQUFTOEQsSUFBVCxDQUFjLFNBQWQsRUFBeUIyQyxJQUF6QixFQURGLENBRUU7O0FBQ0FmLDJCQUFlOEIsV0FBVyxZQUFNO0FBQzVCWDtBQUNBUTtBQUNBVDtBQUNBekMscUJBQU8sT0FBUDtBQUNILGFBTGMsRUFLWixJQUxZLENBQWY7QUFNSDtBQUNKLFNBMUJEO0FBNEJBZ0QsY0FBTXRILE1BQU4sQ0FBYTBFLEVBQWIsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBQ3dELEtBQUQsRUFBVztBQUMvQixjQUFNdEIsT0FBT3NCLE1BQU01QixRQUFOLENBQWUsT0FBZixDQUFiOztBQUNBLGNBQUksQ0FBQ1gsV0FBRCxJQUFnQmlCLEtBQUtyRSxJQUFMLEdBQVlPLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLEVBQXZDLE1BQStDLEVBQW5FLEVBQXVFO0FBQ25FLGdCQUFNMEYsaUJBQWlCNUIsS0FBS3JFLElBQUwsR0FDbEJILEtBRGtCLENBQ1osTUFEWSxDQUF2QixDQURtRSxDQUduRTs7QUFDQSxnQkFBTXFHLGdCQUFnQkQsZUFBZUUsR0FBZixHQUFxQjVGLE9BQXJCLENBQTZCLGlCQUE3QixFQUFnRCxFQUFoRCxDQUF0QjtBQUNBL0MsZ0JBQUkwSSxhQUFKO0FBQ0g7O0FBQ0R0SSxpQkFBUSxHQUFFeUcsSUFBSyxJQUFmOztBQUNBLGNBQUksQ0FBQ0EsS0FBS3BFLE9BQUwsQ0FBYSxvQkFBYixDQUFMLEVBQXlDO0FBQ3JDekMsZ0JBQUksRUFBSjs7QUFDQSxtQkFBS0ksR0FBTCxDQUFTZSxJQUFULENBQWMsYUFBZDtBQUNIOztBQUVELGNBQUksQ0FBQzBGLEtBQUtwRSxPQUFMLENBQWEsdUJBQWIsQ0FBTCxFQUE0QztBQUN4QyxnQkFBSXNELGNBQUosRUFBb0I7QUFDaEJvQiwyQkFBYXBCLGNBQWI7QUFDSDs7QUFDREEsNkJBQWlCNkIsV0FBVyxZQUFNO0FBQzlCNUgsa0JBQUksRUFBSjs7QUFDQSxxQkFBS0ksR0FBTCxDQUFTZSxJQUFULENBQWMseUJBQWQ7QUFDSCxhQUhnQixFQUdkLElBSGMsQ0FBakI7QUFJSDs7QUFFRCxjQUFJLENBQUMwRixLQUFLcEUsT0FBTCxDQUFhLDJCQUFiLENBQUwsRUFBZ0Q7QUFDNUN6QyxnQkFBSSxFQUFKOztBQUNBLG1CQUFLSSxHQUFMLENBQVNlLElBQVQsQ0FBYyxhQUFkO0FBQ0g7O0FBRUQsY0FBSSxDQUFDMEYsS0FBS3BFLE9BQUwsQ0FBYSx1QkFBYixDQUFMLEVBQTRDO0FBQ3hDeUQsMEJBQWMsSUFBZDtBQUNIOztBQUVELGNBQUksQ0FBQ1csS0FBS3BFLE9BQUwsQ0FBYSw2QkFBYixDQUFMLEVBQWtEO0FBQzlDLGdCQUFJcUQsWUFBSixFQUFrQjtBQUNkcUIsMkJBQWFyQixZQUFiO0FBQ0g7O0FBQ0RBLDJCQUFlOEIsV0FBVyxZQUFNO0FBQzVCWDtBQUNBUTtBQUNBVDtBQUNBekMscUJBQU8sWUFBUDtBQUNILGFBTGMsRUFLWixJQUxZLENBQWY7QUFNSDs7QUFFRCxjQUFJLENBQUNzQyxLQUFLcEUsT0FBTCxDQUFhLGdCQUFiLENBQUwsRUFBcUM7QUFDakNvRjtBQUNIO0FBQ0osU0FqREQsRUE5SW9DLENBaU1wQzs7QUFDQU4sY0FBTTVDLEVBQU4sQ0FBUyxNQUFULEVBQWlCLFlBQU07QUFDbkIzRSxjQUFJLEVBQUo7QUFDQWlIOztBQUNBLGNBQUksQ0FBQ3JCLFdBQUwsRUFBa0I7QUFDZG9COztBQUNBLGdCQUFJZCxXQUFKLEVBQWlCO0FBQ2IzQixxQkFBTyxNQUFQO0FBQ0gsYUFGRCxNQUVPO0FBQ0hBLHFCQUFPLE1BQVA7QUFDSDtBQUNKO0FBQ0osU0FYRDtBQWFBc0IsdUJBQWUrQixXQUFXLFlBQU07QUFDNUJIO0FBQ0FUO0FBQ0F6QyxpQkFBTyxTQUFQO0FBQ0gsU0FKYyxFQUlaLE9BQUtwRSxDQUFMLENBQU8rQixHQUFQLENBQVdtQixPQUFYLENBQW1Cd0MsWUFBbkIsR0FBa0MsT0FBSzFGLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJ3QyxZQUFuQixHQUFrQyxJQUFwRSxHQUEyRSxNQUovRCxDQUFmO0FBS0gsT0FwTk0sQ0FBUDtBQXFOSDtBQUVEOzs7Ozs7O2lDQUlhK0MsUyxFQUFXO0FBQ3BCLFVBQUlDLE9BQUo7QUFDQSxVQUFJQyxhQUFKOztBQUVBLFVBQUk7QUFDQUQsa0JBQVUsWUFBRzVHLFlBQUgsQ0FBZ0IyRyxTQUFoQixFQUEyQixPQUEzQixDQUFWO0FBQ0gsT0FGRCxDQUVFLE9BQU9HLENBQVAsRUFBVTtBQUNSLGFBQUszSSxHQUFMLENBQVNtRCxLQUFULENBQWdCLGtDQUFpQ3dGLEVBQUVDLE9BQVEsRUFBM0Q7QUFDQXhGLGdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIOztBQUNELFVBQUksQ0FBQyxLQUFLaEQsT0FBTCxDQUFhd0ksSUFBYixDQUFrQkosT0FBbEIsQ0FBTCxFQUFpQztBQUM3QixhQUFLekksR0FBTCxDQUFTbUQsS0FBVCxDQUFlLDZDQUFmO0FBQ0FDLGdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIOztBQUVELFVBQUk7QUFDQSxZQUFNeUYsVUFBVUwsUUFBUTVGLEtBQVIsQ0FBYyxLQUFLeEMsT0FBbkIsQ0FBaEI7QUFDQXFJLHdCQUFnQnRELEtBQUtDLEtBQUwsQ0FBVzBELG1CQUFtQkQsUUFBUSxDQUFSLENBQW5CLENBQVgsQ0FBaEI7QUFDSCxPQUhELENBR0UsT0FBT0gsQ0FBUCxFQUFVO0FBQ1IsYUFBSzNJLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSw2Q0FBZjtBQUNBQyxnQkFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDs7QUFFRCxVQUFJLEtBQUt0RCxDQUFMLENBQU8rQixHQUFQLENBQVdtQixPQUFYLENBQW1CK0YsTUFBbkIsQ0FBMEJDLE1BQTFCLENBQWlDLENBQUMsQ0FBbEMsRUFBcUMsQ0FBckMsTUFBNEMsR0FBaEQsRUFBcUQ7QUFDakQsYUFBS2xKLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUIrRixNQUFuQixJQUE2QixHQUE3QjtBQUNIOztBQUVETixvQkFBY1EsUUFBZCxHQUF5QixLQUFLbkosQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQitGLE1BQTVDO0FBQ0FOLG9CQUFjUywwQkFBZCxHQUEyQyxLQUFLcEosQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQitGLE1BQTlEO0FBRUFQLGdCQUFVQSxRQUFROUYsT0FBUixDQUNOLEtBQUtwQyxRQURDLEVBQ1UsTUFBSzZJLG1CQUFtQmhFLEtBQUtpRSxTQUFMLENBQWVYLGFBQWYsQ0FBbkIsQ0FBa0QsS0FEakUsQ0FBVjs7QUFJQSxVQUFJO0FBQ0Esb0JBQUdqRyxhQUFILENBQWlCK0YsU0FBakIsRUFBNEJDLE9BQTVCO0FBQ0gsT0FGRCxDQUVFLE9BQU9FLENBQVAsRUFBVTtBQUNSLGFBQUszSSxHQUFMLENBQVNtRCxLQUFULENBQWdCLGtDQUFpQ3dGLEVBQUVDLE9BQVEsRUFBM0Q7QUFDQXhGLGdCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIOztBQUNELFdBQUtyRCxHQUFMLENBQVNlLElBQVQsQ0FBYyw0RUFDVCxPQUFNLEtBQUtoQixDQUFMLENBQU8rQixHQUFQLENBQVdtQixPQUFYLENBQW1CK0YsTUFBTyxFQURyQztBQUVIO0FBRUQ7Ozs7Ozs7dUNBSW1CO0FBQ2YsVUFBTTVDLE9BQU8sQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFzQixtQkFBa0IsS0FBS3JHLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUIrRixNQUFPLEVBQWxFLENBQWI7O0FBQ0EsVUFBSSxLQUFLakosQ0FBTCxDQUFPK0IsR0FBUCxDQUFXd0gsaUJBQVgsRUFBSixFQUFvQztBQUNoQ2xELGFBQUs1RCxJQUFMLENBQVUsY0FBVjtBQUNIOztBQUNENEQsV0FBSzVELElBQUwsQ0FBVSxJQUFWOztBQUNBLFVBQUksS0FBS3pDLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJnQyxJQUF2QixFQUE2QjtBQUN6Qm1CLGFBQUs1RCxJQUFMLENBQVUsS0FBS3pDLENBQUwsQ0FBTytCLEdBQVAsQ0FBV21CLE9BQVgsQ0FBbUJnQyxJQUE3QjtBQUNILE9BRkQsTUFFTztBQUNIbUIsYUFBSzVELElBQUwsQ0FBVSxNQUFWO0FBQ0g7O0FBQ0QsVUFBSSxLQUFLekMsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQnNHLGNBQXZCLEVBQXVDO0FBQ25DbkQsYUFBSzVELElBQUwsQ0FBVSxZQUFWLEVBQXdCLEtBQUt6QyxDQUFMLENBQU8rQixHQUFQLENBQVdtQixPQUFYLENBQW1Cc0csY0FBM0M7QUFDSDs7QUFDRCxhQUFPbkQsSUFBUDtBQUNIO0FBRUQ7Ozs7Ozs7Ozs7Ozs7OztBQUlJLHFCQUFLcEcsR0FBTCxDQUFTMkQsS0FBVCxDQUFlLG9CQUFmOzs7dUJBRVUsS0FBSzVELENBQUwsQ0FBTzZFLEtBQVAsQ0FBYTRFLGFBQWIsQ0FBMkIsS0FBM0IsRUFBa0MsS0FBS3pKLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJOLFNBQS9ELEM7Ozs7Ozs7OztzQkFFQSxJQUFJZixLQUFKLGM7OztBQUdOd0ksc0IsR0FBUyxjO0FBQ1RDLCtCLEdBQWtCLEU7O3NCQUVsQixLQUFLakosaUJBQUwsS0FBMkIsS0FBS0MsbUJBQUwsQ0FBeUJFLHlCOzs7OztBQUNwRDZJLHlCQUFTLFlBQVQ7QUFDQUMsa0NBQW1CLEdBQUUsY0FBS0MsR0FBSSxHQUE5Qjs7O0FBR0ksNEJBQUdDLFNBQUgsQ0FBYSxLQUFLN0osQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2Qk4sU0FBMUM7Ozt1QkFDa0IsS0FBSzZILFlBQUwsRTs7O0FBQWxCckIseUI7O0FBQ0EsNEJBQUcvRixhQUFILENBQWlCLEtBQUsxQyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJPLFdBQWpCLENBQTZCd0gsY0FBOUMsRUFBOER0QixTQUE5RDs7QUFDQSxxQkFBS3hJLEdBQUwsQ0FBU2UsSUFBVCxDQUFjLDREQUFkOzs7Ozs7O0FBRUEscUJBQUtmLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSxnRUFDWCxzREFEVyxHQUVYLG9CQUZKOzs7O0FBT0Y0Ryw0QixHQUFlLEtBQUtoSyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCeUgsTUFBM0IsQztBQUNiM0UsaUMsR0FBc0IsS0FBSy9FLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQkMsUyxDQUF2QzhDLGlCO0FBQ0ZDLHVDLEdBQTBCLEtBQUtoRixDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTRCLEdBQUV5SCxNQUFPLGFBQXJDLEM7O29CQUUzQixLQUFLMUosQ0FBTCxDQUFPNkUsS0FBUCxDQUFhQyxNQUFiLENBQW9Ca0YsWUFBcEIsQzs7Ozs7QUFDRCxxQkFBSy9KLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZ0IsNEJBQTJCNEcsWUFBYSxFQUF4RDtBQUNBLHFCQUFLL0osR0FBTCxDQUFTbUQsS0FBVCxDQUFlLHVEQUFmO3NCQUNNLElBQUlsQyxLQUFKLENBQVUsMkJBQVYsQzs7O29CQUdMLEtBQUtsQixDQUFMLENBQU82RSxLQUFQLENBQWFDLE1BQWIsQ0FBb0JFLHVCQUFwQixDOzs7OztBQUNELHFCQUFLL0UsR0FBTCxDQUFTbUQsS0FBVCxDQUFlLG9EQUNWLEdBQUU0RyxZQUFhLEVBRHBCO0FBRUEscUJBQUsvSixHQUFMLENBQVNtRCxLQUFULENBQWUsdURBQWY7c0JBQ00sSUFBSWxDLEtBQUosQ0FBVSwyQkFBVixDOzs7c0JBR04sS0FBS1IsaUJBQUwsS0FBMkIsS0FBS0MsbUJBQUwsQ0FBeUJFLHlCOzs7OztvQkFDL0MsS0FBS2IsQ0FBTCxDQUFPNkUsS0FBUCxDQUFhQyxNQUFiLENBQW9CQyxpQkFBcEIsQzs7Ozs7QUFDRCxxQkFBSzlFLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSxtREFDVixHQUFFNEcsWUFBYSxFQURwQjtBQUVBLHFCQUFLL0osR0FBTCxDQUFTbUQsS0FBVCxDQUFlLHVEQUFmO3NCQUNNLElBQUlsQyxLQUFKLENBQVUsMkJBQVYsQzs7O0FBSWQscUJBQUtqQixHQUFMLENBQVNzQixPQUFULENBQWlCLHNCQUFqQjs7QUFDQSxpQ0FBTTBJLEVBQU4sQ0FDSSxJQURKLEVBQ1csR0FBRUQsWUFBYSxHQUFFTCxlQUFnQixFQUQ1QyxFQUMrQyxLQUFLM0osQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2Qk4sU0FENUUsRSxDQUlBO0FBQ0E7OztBQUNBLGlDQUFNaUksS0FBTixDQUNJLElBREosRUFDVSxLQURWLEVBQ2lCLEtBQUtsSyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJPLFdBQWpCLENBQTZCTixTQUQ5Qzs7QUFHQSxvQkFBSSxLQUFLakMsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXd0YsRUFBWCxDQUFjQyxTQUFsQixFQUE2QjtBQUN6QixtQ0FBTWIsSUFBTixDQUFZLGFBQVksS0FBSzNHLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJOLFNBQVUsR0FBRSxjQUFLMkgsR0FBSSxRQUExRTtBQUNIOztzQkFFRyxLQUFLbEosaUJBQUwsS0FBMkIsS0FBS0MsbUJBQUwsQ0FBeUJFLHlCOzs7Ozs7O3VCQUc1QixLQUFLc0osZUFBTCxFOzs7QUFBcEI1RSwyQjs7QUFDQSw0QkFBRzdDLGFBQUgsQ0FDSSxLQUFLMUMsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2QjZILG9CQURqQyxFQUVJL0UsS0FBS2lFLFNBQUwsQ0FBZS9ELFdBQWYsRUFBNEIsSUFBNUIsRUFBa0MsQ0FBbEMsQ0FGSjs7QUFJQSxxQkFBS3RGLEdBQUwsQ0FBU2UsSUFBVCxDQUFjLCtEQUFkOzs7Ozs7O0FBRUEscUJBQUtmLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSxrRUFDWCx1REFEVyxHQUVYLG9CQUZKOzs7O0FBT1IscUJBQUtuRCxHQUFMLENBQVNlLElBQVQsQ0FBYyxxQ0FBZDtBQUVBLHFCQUFLZixHQUFMLENBQVMyRCxLQUFULENBQWUsaUNBQWY7O0FBQ0EsaUNBQU1xRyxFQUFOLENBQ0lySyxLQUFLeUssU0FBTCxFQUFnQixJQUFoQixFQUFzQixVQUF0QixFQUFrQyxZQUFsQyxDQURKLEVBRUksS0FBS3JLLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJOLFNBRmpDOzs7Ozs7Ozs7Ozs7OztBQU1KOzs7Ozs7c0NBR2tCO0FBQUE7O0FBQ2QsV0FBS2hDLEdBQUwsQ0FBU2UsSUFBVCxDQUFjLHFCQUFkO0FBRUEsVUFBSXNKLG1CQUFtQixLQUFLdEssQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQitDLHVCQUFsRDs7QUFDQSxVQUFJLEtBQUt0RSxpQkFBTCxLQUEyQixLQUFLQyxtQkFBTCxDQUF5QkUseUJBQXhELEVBQW1GO0FBQy9FeUosMkJBQW1CLEtBQUt0SyxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCZ0QscUJBQTlDO0FBQ0g7O0FBRUQsVUFBSTtBQUFBLDBCQUNxQkksS0FBS0MsS0FBTCxDQUNqQixZQUFHeEQsWUFBSCxDQUFnQndJLGdCQUFoQixFQUFrQyxPQUFsQyxDQURpQixDQURyQjtBQUFBLFlBQ1FDLFFBRFIsZUFDUUEsUUFEUjs7QUFJQSxZQUFJQyxXQUFXLEtBQWY7QUFDQSxZQUFJQyw2QkFBNkIsS0FBakM7QUFDQSxZQUFJQyxTQUFTLElBQWIsQ0FOQSxDQVFBO0FBQ0E7QUFDQTs7QUFDQUgsaUJBQVM5RCxPQUFULENBQWlCLFVBQUNrRSxJQUFELEVBQVU7QUFDdkIsY0FBSUMsWUFBSixDQUR1QixDQUV2Qjs7QUFDQSxjQUFJRCxLQUFLRSxJQUFMLEtBQWMsSUFBbEIsRUFBd0I7QUFDcEJELDJCQUFlLFlBQUc5SSxZQUFILENBQ1hsQyxLQUFLLE9BQUtJLENBQUwsQ0FBTytCLEdBQVAsQ0FBV0MsS0FBWCxDQUFpQk8sV0FBakIsQ0FBNkJOLFNBQWxDLEVBQTZDMEksS0FBS0csSUFBbEQsQ0FEVyxFQUVYLE9BRlcsQ0FBZjtBQUlBSixxQkFBUyxPQUFLckssUUFBTCxDQUFjMEssbUJBQWQsQ0FBa0NILFlBQWxDLENBQVQ7QUFMb0IsMEJBT0FGLE1BUEE7QUFPakJFLHdCQVBpQixXQU9qQkEsWUFQaUI7QUFRcEJILHlDQUNJQyxPQUFPRCwwQkFBUCxHQUFvQyxJQUFwQyxHQUEyQ0EsMEJBRC9DO0FBRUFELHVCQUFXRSxPQUFPRixRQUFQLEdBQWtCLElBQWxCLEdBQXlCQSxRQUFwQzs7QUFFQSx3QkFBRzlILGFBQUgsQ0FDSTlDLEtBQUssT0FBS0ksQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2Qk4sU0FBbEMsRUFBNkMwSSxLQUFLRyxJQUFsRCxDQURKLEVBQzZERixZQUQ3RDtBQUdIO0FBQ0osU0FuQkQ7O0FBcUJBLFlBQUksQ0FBQ0osUUFBTCxFQUFlO0FBQ1gsZUFBS3ZLLEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSx1Q0FBZjtBQUNBQyxrQkFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDs7QUFDRCxZQUFJLENBQUNtSCwwQkFBTCxFQUFpQztBQUM3QixlQUFLeEssR0FBTCxDQUFTbUQsS0FBVCxDQUFlLGtEQUFmO0FBQ0FDLGtCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIO0FBQ0osT0F4Q0QsQ0F3Q0UsT0FBT3NGLENBQVAsRUFBVTtBQUNSLGFBQUszSSxHQUFMLENBQVNtRCxLQUFULENBQWUsNENBQWYsRUFBNkR3RixDQUE3RDtBQUNBdkYsZ0JBQVFDLElBQVIsQ0FBYSxDQUFiO0FBQ0g7O0FBQ0QsV0FBS3JELEdBQUwsQ0FBU2UsSUFBVCxDQUFjLHVCQUFkO0FBQ0g7QUFFRDs7Ozs7Ozs7Ozs7Ozs7QUFJSSxxQkFBS2YsR0FBTCxDQUFTZSxJQUFULENBQWMsa0NBQWQ7Ozt1QkFFVSxLQUFLZ0ssa0JBQUwsRTs7Ozs7Ozs7O0FBRU4scUJBQUsvSyxHQUFMLENBQVNtRCxLQUFULENBQWUsZ0RBQWY7QUFDQUMsd0JBQVFDLElBQVIsQ0FBYSxDQUFiOzs7QUFHSixxQkFBS3JELEdBQUwsQ0FBU2UsSUFBVCxDQUFjLHFCQUFkOztvQkFFSyxLQUFLaEIsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQkMsZTs7Ozs7Ozt1QkFFVixLQUFLOEgsaUJBQUwsRTs7Ozs7Ozs7OztrREFHRyxTLHlCQUtBLE8seUJBT0EsWSx5QkFNQSxNLHlCQU9BLE0seUJBS0EsTTs7OztBQTdCRCxxQkFBS2hMLEdBQUwsQ0FBU21ELEtBQVQsQ0FDSSw0REFESjs7OztBQUtBLHFCQUFLbkQsR0FBTCxDQUFTbUQsS0FBVCxDQUNJLHdGQUNBLGlGQURBLEdBRUEsNEJBSEo7Ozs7QUFPQSxxQkFBS25ELEdBQUwsQ0FBU21ELEtBQVQsQ0FDSSwrREFDQSxPQUZKOzs7O0FBTUEscUJBQUtuRCxHQUFMLENBQVNtRCxLQUFULENBQ0ksdUVBQ0EsK0RBREEsR0FFQSwrQkFISjs7OztBQU9BLHFCQUFLbkQsR0FBTCxDQUFTbUQsS0FBVCxDQUNJLG9FQURKOzs7O0FBS0EscUJBQUtuRCxHQUFMLENBQVNtRCxLQUFULENBQ0ksMENBREo7Ozs7QUFLQSxxQkFBS25ELEdBQUwsQ0FBU21ELEtBQVQsQ0FBZSw4Q0FBZjs7O3FCQUVKLEtBQUtqRCxjOzs7Ozs7dUJBQ0MsS0FBSytLLG9CQUFMLENBQTBCLEtBQUsvSyxjQUEvQixDOzs7QUFFVmtELHdCQUFRQyxJQUFSLENBQWEsQ0FBYjs7Ozs7OztBQUdKLHFCQUFLNUMsaUJBQUwsR0FBeUIsS0FBS2lELGNBQUwsRUFBekI7Ozt1QkFFVSxLQUFLK0QsU0FBTCxFOzs7Ozs7Ozs7QUFFTnJFLHdCQUFRQyxJQUFSLENBQWEsQ0FBYjs7O0FBSVIscUJBQUs2SCxlQUFMO0FBRUEscUJBQUtDLFlBQUw7Ozt1QkFHVSxLQUFLQyxVQUFMLEU7Ozs7Ozs7OztBQUVOLHFCQUFLcEwsR0FBTCxDQUFTbUQsS0FBVCxDQUFlLHdDQUFmO0FBQ0FDLHdCQUFRQyxJQUFSLENBQWEsQ0FBYjs7O0FBR0oscUJBQUtyRCxHQUFMLENBQVNlLElBQVQsQ0FBYyx1QkFBZDs7cUJBRUksS0FBS2IsYzs7Ozs7O3VCQUNDLEtBQUsrSyxvQkFBTCxDQUEwQixLQUFLL0ssY0FBL0IsQzs7Ozs7Ozs7Ozs7Ozs7OzttQ0FJQztBQUNYLFVBQUksS0FBS0gsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXbUIsT0FBWCxDQUFtQitGLE1BQW5CLEtBQThCLElBQWxDLEVBQXdDO0FBQ3BDLFlBQUk7QUFDQSxlQUFLcUMsWUFBTCxDQUFrQixLQUFLdEwsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2QndILGNBQS9DO0FBQ0gsU0FGRCxDQUVFLE9BQU9uQixDQUFQLEVBQVU7QUFDUixlQUFLM0ksR0FBTCxDQUFTbUQsS0FBVCxDQUFnQiw2Q0FBNEN3RixFQUFFQyxPQUFRLEVBQXRFO0FBQ0g7QUFDSjtBQUNKOzs7aUNBRVk7QUFBQTs7QUFDVCxXQUFLNUksR0FBTCxDQUFTZSxJQUFULENBQWMsb0NBQWQ7QUFDQSxhQUFPLElBQUlrRCxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWO0FBQUEsZUFDZixjQUFLbUgsYUFBTCxDQUNJLE9BQUt2TCxDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJPLFdBQWpCLENBQTZCTixTQURqQyxFQUVJLGNBQUtyQyxJQUFMLENBQVUsT0FBS0ksQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCTyxXQUFqQixDQUE2QitCLElBQXZDLEVBQTZDLGFBQTdDLENBRkosRUFHSSxZQUFNO0FBQ0Y7QUFDQTtBQUNBa0gsdUJBQWEsWUFBTTtBQUNmLG1CQUFLdkwsR0FBTCxDQUFTc0IsT0FBVCxDQUFpQixtQ0FBakI7O0FBQ0EsbUJBQUt2QixDQUFMLENBQU82RSxLQUFQLENBQ0s0RSxhQURMLENBQ21CLEtBRG5CLEVBQzBCLE9BQUt6SixDQUFMLENBQU8rQixHQUFQLENBQVdDLEtBQVgsQ0FBaUJPLFdBQWpCLENBQTZCTixTQUR2RCxFQUVLMEYsSUFGTCxDQUVVLFlBQU07QUFDUnhEO0FBQ0gsYUFKTCxFQUtLeUQsS0FMTCxDQUtXLFVBQUNnQixDQUFELEVBQU87QUFDVnhFLHFCQUFPd0UsQ0FBUDtBQUNILGFBUEw7QUFRSCxXQVZEO0FBV0gsU0FqQkwsQ0FEZTtBQUFBLE9BQVosQ0FBUDtBQW9CSDtBQUVEOzs7Ozs7Ozs7OzJCQU9PNkMsUSxFQUFtRTtBQUFBOztBQUFBLFVBQXpEbEgsS0FBeUQsdUVBQWpELFFBQWlEO0FBQUEsVUFBdkNGLEdBQXVDLHVFQUFqQyxLQUFLckUsQ0FBTCxDQUFPK0IsR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQnFDLElBQU07QUFDdEUsYUFBTyxJQUFJSixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3BDLGVBQUtuRSxHQUFMLENBQVNzQixPQUFULENBQWtCLHdCQUF1QmtLLFNBQVM3TCxJQUFULENBQWMsR0FBZCxDQUFtQixFQUE1RDs7QUFFQSxpQ0FBTSxRQUFOLEdBQWlCLEtBQWpCLDRCQUEyQjZMLFFBQTNCLElBQXNDO0FBQ2xDcEgsYUFEa0M7QUFFbENFO0FBRmtDLFNBQXRDLEVBR0dDLEVBSEgsQ0FHTSxNQUhOLEVBR2M7QUFBQSxpQkFDVGtILFNBQVMsQ0FBVixHQUFldkgsU0FBZixHQUEyQkMsT0FBTyxJQUFJbEQsS0FBSixDQUFXLHFCQUFvQndLLElBQUssRUFBcEMsQ0FBUCxDQURqQjtBQUFBLFNBSGQ7QUFNSCxPQVRNLENBQVA7QUFVSCIsImZpbGUiOiJtZXRlb3JBcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCByZWdlbmVyYXRvclJ1bnRpbWUgZnJvbSAncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgc3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc2luZ2xlTGluZUxvZyBmcm9tICdzaW5nbGUtbGluZS1sb2cnO1xuaW1wb3J0IGFzYXIgZnJvbSAnYXNhcic7XG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5cbmltcG9ydCBJc0Rlc2t0b3BJbmplY3RvciBmcm9tICcuLi9za2VsZXRvbi9tb2R1bGVzL2F1dG91cGRhdGUvaXNEZXNrdG9wSW5qZWN0b3InO1xuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgTWV0ZW9yTWFuYWdlciBmcm9tICcuL21ldGVvck1hbmFnZXInO1xuXG5jb25zdCB7IGpvaW4gfSA9IHBhdGg7XG5jb25zdCBzbGwgPSBzaW5nbGVMaW5lTG9nLnN0ZG91dDtcblxuLy8gVE9ETzogcmVmYWN0b3IgYWxsIHN0cmF0ZWd5IGlmcyB0byBvbmUgcGxhY2VcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBNZXRlb3IgYXBwLlxuICogQHByb3BlcnR5IHtNZXRlb3JEZXNrdG9wfSAkXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWV0ZW9yQXBwIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgLSBjb250ZXh0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ21ldGVvckFwcCcpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgICAgICB0aGlzLm1ldGVvck1hbmFnZXIgPSBuZXcgTWV0ZW9yTWFuYWdlcigkKTtcbiAgICAgICAgdGhpcy5tb2JpbGVQbGF0Zm9ybSA9IG51bGw7XG4gICAgICAgIHRoaXMub2xkTWFuaWZlc3QgPSBudWxsO1xuICAgICAgICB0aGlzLmluamVjdG9yID0gbmV3IElzRGVza3RvcEluamVjdG9yKCk7XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAnX19tZXRlb3JfcnVudGltZV9jb25maWdfXyA9IEpTT04ucGFyc2VcXFxcKGRlY29kZVVSSUNvbXBvbmVudFxcXFwoXCIoW15cIl0qKVwiXFxcXClcXFxcKSdcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZXBsYWNlciA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAnKF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18gPSBKU09OLnBhcnNlXFxcXChkZWNvZGVVUklDb21wb25lbnRcXFxcKClcIihbXlwiXSopXCIoXFxcXClcXFxcKSknXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubWV0ZW9yVmVyc2lvbiA9IG51bGw7XG4gICAgICAgIHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcyA9IHtcbiAgICAgICAgICAgIElOREVYX0ZST01fQ09SRE9WQV9CVUlMRDogMSxcbiAgICAgICAgICAgIElOREVYX0ZST01fUlVOTklOR19TRVJWRVI6IDJcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlcHJlY3RhdGVkUGFja2FnZXMgPSBbJ29tZWdhOm1ldGVvci1kZXNrdG9wLWxvY2Fsc3RvcmFnZSddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbnkgZGVwcmVjYXRlZCBwYWNrYWdlcyBmcm9tIG1ldGVvciBwcm9qZWN0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgICAqL1xuICAgIGFzeW5jIHJlbW92ZURlcHJlY2F0ZWRQYWNrYWdlcygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1ldGVvck1hbmFnZXIuY2hlY2tQYWNrYWdlcyh0aGlzLmRlcHJlY3RhdGVkUGFja2FnZXMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnZGVwcmVjYXRlZCBtZXRlb3IgcGx1Z2lucyBmb3VuZCwgcmVtb3ZpbmcgdGhlbScpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWV0ZW9yTWFuYWdlci5kZWxldGVQYWNrYWdlcyh0aGlzLmRlcHJlY3RhdGVkUGFja2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmVzIHRoYXQgcmVxdWlyZWQgcGFja2FnZXMgYXJlIGFkZGVkIHRvIHRoZSBNZXRlb3IgYXBwLlxuICAgICAqL1xuICAgIGFzeW5jIGVuc3VyZURlc2t0b3BIQ1BQYWNrYWdlcygpIHtcbiAgICAgICAgY29uc3QgZGVza3RvcEhDUFBhY2thZ2VzID0gWydvbWVnYTptZXRlb3ItZGVza3RvcC13YXRjaGVyJywgJ29tZWdhOm1ldGVvci1kZXNrdG9wLWJ1bmRsZXInXTtcbiAgICAgICAgaWYgKHRoaXMuJC5kZXNrdG9wLmdldFNldHRpbmdzKCkuZGVza3RvcEhDUCkge1xuICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnZGVza3RvcEhDUCBpcyBlbmFibGVkLCBjaGVja2luZyBmb3IgcmVxdWlyZWQgcGFja2FnZXMnKTtcblxuICAgICAgICAgICAgY29uc3QgcGFja2FnZXNXaXRoVmVyc2lvbiA9IGRlc2t0b3BIQ1BQYWNrYWdlcy5tYXAocGFja2FnZU5hbWUgPT4gYCR7cGFja2FnZU5hbWV9QCR7dGhpcy4kLmdldFZlcnNpb24oKX1gKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ldGVvck1hbmFnZXIuZW5zdXJlUGFja2FnZXMoZGVza3RvcEhDUFBhY2thZ2VzLCBwYWNrYWdlc1dpdGhWZXJzaW9uLCAnZGVza3RvcEhDUCcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2Rlc2t0b3BIQ1AgaXMgbm90IGVuYWJsZWQsIHJlbW92aW5nIHJlcXVpcmVkIHBhY2thZ2VzJyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWV0ZW9yTWFuYWdlci5jaGVja1BhY2thZ2VzKGRlc2t0b3BIQ1BQYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tZXRlb3JNYW5hZ2VyLmRlbGV0ZVBhY2thZ2VzKGRlc2t0b3BIQ1BQYWNrYWdlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgZW50cnkgdG8gLm1ldGVvci8uZ2l0aWdub3JlIGlmIG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICB1cGRhdGVHaXRJZ25vcmUoKSB7XG4gICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ3VwZGF0aW5nIC5tZXRlb3IvLmdpdGlnbm9yZScpO1xuICAgICAgICAvLyBMZXRzIHJlYWQgdGhlIC5tZXRlb3IvLmdpdGlnbm9yZSBhbmQgZmlsdGVyIG91dCBibGFuayBsaW5lcy5cbiAgICAgICAgY29uc3QgZ2l0SWdub3JlID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLmdpdElnbm9yZSwgJ1VURi04JylcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJykuZmlsdGVyKGlnbm9yZWRQYXRoID0+IGlnbm9yZWRQYXRoLnRyaW0oKSAhPT0gJycpO1xuXG4gICAgICAgIGlmICghfmdpdElnbm9yZS5pbmRleE9mKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdE5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBhZGRpbmcgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lfSB0byAubWV0ZW9yLy5naXRpZ25vcmVgKTtcbiAgICAgICAgICAgIGdpdElnbm9yZS5wdXNoKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdE5hbWUpO1xuXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLmdpdElnbm9yZSwgZ2l0SWdub3JlLmpvaW4oJ1xcbicpLCAnVVRGLTgnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBNZXRlb3IgcmVsZWFzZSB2ZXJzaW9uIHVzZWQgaW4gdGhlIGFwcC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldE1ldGVvclJlbGVhc2UoKSB7XG4gICAgICAgIGxldCByZWxlYXNlID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJlbGVhc2UsICdVVEYtOCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxyL2dtLCAnJylcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJylbMF07XG4gICAgICAgIChbLCByZWxlYXNlXSA9IHJlbGVhc2Uuc3BsaXQoJ0AnKSk7XG4gICAgICAgIC8vIFdlIGRvIG5vdCBjYXJlIGlmIGl0IGlzIGJldGEuXG4gICAgICAgIGlmICh+cmVsZWFzZS5pbmRleE9mKCctJykpIHtcbiAgICAgICAgICAgIChbcmVsZWFzZV0gPSByZWxlYXNlLnNwbGl0KCctJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWxlYXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhc3QgTWV0ZW9yIHJlbGVhc2UgdG8gc2VtdmVyIHZlcnNpb24uXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBjYXN0TWV0ZW9yUmVsZWFzZVRvU2VtdmVyKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRNZXRlb3JSZWxlYXNlKCl9LjAuMGAubWF0Y2goLyheXFxkK1xcLlxcZCtcXC5cXGQrKS9nbWkpWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIG1ldGVvciB2ZXJzaW9uIGFnYWluc3QgYSB2ZXJzaW9uUmFuZ2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25SYW5nZSAtIHNlbXZlciB2ZXJzaW9uIHJhbmdlXG4gICAgICovXG4gICAgY2hlY2tNZXRlb3JWZXJzaW9uKHZlcnNpb25SYW5nZSkge1xuICAgICAgICBjb25zdCByZWxlYXNlID0gdGhpcy5jYXN0TWV0ZW9yUmVsZWFzZVRvU2VtdmVyKCk7XG4gICAgICAgIGlmICghc2VtdmVyLnNhdGlzZmllcyhyZWxlYXNlLCB2ZXJzaW9uUmFuZ2UpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLnNraXBNb2JpbGVCdWlsZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGB3cm9uZyBtZXRlb3IgdmVyc2lvbiAoJHtyZWxlYXNlfSkgaW4gcHJvamVjdCAtIG9ubHkgYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3ZlcnNpb25SYW5nZX0gaXMgc3VwcG9ydGVkYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGB3cm9uZyBtZXRlb3IgdmVyc2lvbiAoJHtyZWxlYXNlfSkgaW4gcHJvamVjdCAtIG9ubHkgYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3ZlcnNpb25SYW5nZX0gaXMgc3VwcG9ydGVkIGZvciBhdXRvbWF0aWMgbWV0ZW9yIGJ1aWxkcyAoeW91IGNhbiBhbHdheXMgYCArXG4gICAgICAgICAgICAgICAgICAgICd0cnkgd2l0aCBgLS1za2lwLW1vYmlsZS1idWlsZGAgaWYgeW91IGFyZSB1c2luZyBtZXRlb3IgPj0gMS4yLjEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY2lkZXMgd2hpY2ggc3RyYXRlZ3kgdG8gdXNlIHdoaWxlIHRyeWluZyB0byBnZXQgY2xpZW50IGJ1aWxkIG91dCBvZiBNZXRlb3IgcHJvamVjdC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIGNob29zZVN0cmF0ZWd5KCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLmZvcmNlQ29yZG92YUJ1aWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlbGVhc2UgPSB0aGlzLmNhc3RNZXRlb3JSZWxlYXNlVG9TZW12ZXIoKTtcbiAgICAgICAgaWYgKHNlbXZlci5zYXRpc2ZpZXMocmVsZWFzZSwgJz4gMS4zLjQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX1JVTk5JTkdfU0VSVkVSO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZW12ZXIuc2F0aXNmaWVzKHJlbGVhc2UsICcxLjMuNCcpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBsb2RlZFZlcnNpb24gPSB0aGlzLmdldE1ldGVvclJlbGVhc2UoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKGV4cGxvZGVkVmVyc2lvbi5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgIGlmIChleHBsb2RlZFZlcnNpb25bM10gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9SVU5OSU5HX1NFUlZFUjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHJlcXVpcmVkIHByZWNvbmRpdGlvbnMuXG4gICAgICogLSBNZXRlb3IgdmVyc2lvblxuICAgICAqIC0gaXMgbW9iaWxlIHBsYXRmb3JtIGFkZGVkXG4gICAgICovXG4gICAgYXN5bmMgY2hlY2tQcmVjb25kaXRpb25zKCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLnNraXBNb2JpbGVCdWlsZCkge1xuICAgICAgICAgICAgdGhpcy5jaGVja01ldGVvclZlcnNpb24oJz49IDEuMi4xJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrTWV0ZW9yVmVyc2lvbignPj0gMS4zLjMnKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPSB0aGlzLmNob29zZVN0cmF0ZWd5KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSA9PT0gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICAnbWV0ZW9yIHZlcnNpb24gaXMgPCAxLjMuNC4yIHNvIHRoZSBpbmRleC5odG1sIGZyb20gY29yZG92YS1idWlsZCB3aWxsJyArXG4gICAgICAgICAgICAgICAgICAgICcgYmUgdXNlZCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgJ21ldGVvciB2ZXJzaW9uIGlzID49IDEuMy40LjIgc28gdGhlIGluZGV4Lmh0bWwgd2lsbCBiZSBkb3dubG9hZGVkICcgK1xuICAgICAgICAgICAgICAgICAgICAnZnJvbSBfX2NvcmRvdmEvaW5kZXguaHRtbCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLiQuZW52Lm9wdGlvbnMuc2tpcE1vYmlsZUJ1aWxkKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybXMgPSBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucGxhdGZvcm1zLCAnVVRGLTgnKTtcbiAgICAgICAgICAgIGlmICghfnBsYXRmb3Jtcy5pbmRleE9mKCdhbmRyb2lkJykgJiYgIX5wbGF0Zm9ybXMuaW5kZXhPZignaW9zJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuJC5lbnYub3B0aW9ucy5hbmRyb2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9iaWxlUGxhdGZvcm0gPSAnaW9zJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vYmlsZVBsYXRmb3JtID0gJ2FuZHJvaWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvZy53YXJuKGBubyBtb2JpbGUgdGFyZ2V0IGRldGVjdGVkIC0gd2lsbCBhZGQgJyR7dGhpcy5tb2JpbGVQbGF0Zm9ybX0nIGAgK1xuICAgICAgICAgICAgICAgICAgICAnanVzdCB0byBnZXQgYSBtb2JpbGUgYnVpbGQnKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZE1vYmlsZVBsYXRmb3JtKHRoaXMubW9iaWxlUGxhdGZvcm0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2ZhaWxlZCB0byBhZGQgYSBtb2JpbGUgcGxhdGZvcm0gLSBwbGVhc2UgdHJ5IHRvIGRvIGl0IG1hbnVhbGx5Jyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byBhZGQgYSBtb2JpbGUgcGxhdGZvcm0gdG8gbWV0ZW9yIHByb2plY3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYXRmb3JtIC0gcGxhdGZvcm0gdG8gYWRkXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgYWRkTW9iaWxlUGxhdGZvcm0ocGxhdGZvcm0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGFkZGluZyBtb2JpbGUgcGxhdGZvcm06ICR7cGxhdGZvcm19YCk7XG4gICAgICAgICAgICBzcGF3bignbWV0ZW9yJywgWydhZGQtcGxhdGZvcm0nLCBwbGF0Zm9ybV0sIHtcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgc3RkaW86IHRoaXMuJC5lbnYuc3RkaW9cbiAgICAgICAgICAgIH0pLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtcyA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5wbGF0Zm9ybXMsICdVVEYtOCcpO1xuICAgICAgICAgICAgICAgIGlmICghfnBsYXRmb3Jtcy5pbmRleE9mKCdhbmRyb2lkJykgJiYgIX5wbGF0Zm9ybXMuaW5kZXhPZignaW9zJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB0byByZW1vdmUgYSBtb2JpbGUgcGxhdGZvcm0gZnJvbSBtZXRlb3IgcHJvamVjdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGxhdGZvcm0gLSBwbGF0Zm9ybSB0byByZW1vdmVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICByZW1vdmVNb2JpbGVQbGF0Zm9ybShwbGF0Zm9ybSkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLnNraXBSZW1vdmVNb2JpbGVQbGF0Zm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGByZW1vdmluZyBtb2JpbGUgcGxhdGZvcm06ICR7cGxhdGZvcm19YCk7XG4gICAgICAgICAgICBzcGF3bignbWV0ZW9yJywgWydyZW1vdmUtcGxhdGZvcm0nLCBwbGF0Zm9ybV0sIHtcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnJvb3QsXG4gICAgICAgICAgICAgICAgc3RkaW86IHRoaXMuJC5lbnYuc3RkaW8sXG4gICAgICAgICAgICAgICAgZW52OiBPYmplY3QuYXNzaWduKHsgTUVURU9SX1BSRVRUWV9PVVRQVVQ6IDAgfSwgcHJvY2Vzcy5lbnYpXG4gICAgICAgICAgICB9KS5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF0Zm9ybXMgPSBmcy5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucGxhdGZvcm1zLCAnVVRGLTgnKTtcbiAgICAgICAgICAgICAgICBpZiAofnBsYXRmb3Jtcy5pbmRleE9mKHBsYXRmb3JtKSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1c3QgY2hlY2tzIGZvciBpbmRleC5odG1sIGFuZCBwcm9ncmFtLmpzb24gZXhpc3RlbmNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzQ29yZG92YUJ1aWxkUmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmluZGV4SFRNTHN0cmF0ZWd5ID09PSB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9DT1JET1ZBX0JVSUxEKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRJbmRleCkgJiZcbiAgICAgICAgICAgICAgICB0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLmNvcmRvdmFCdWlsZFByb2dyYW1Kc29uKSAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMub2xkTWFuaWZlc3QgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMub2xkTWFuaWZlc3QgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkTWFuaWZlc3QgIT09IGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiwgJ1VURi04J1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy4kLnV0aWxzLmV4aXN0cyh0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC53ZWJDb3Jkb3ZhUHJvZ3JhbUpzb24pICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgIXRoaXMub2xkTWFuaWZlc3QgfHxcbiAgICAgICAgICAgICAgICAodGhpcy5vbGRNYW5pZmVzdCAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZE1hbmlmZXN0ICE9PSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC53ZWJDb3Jkb3ZhUHJvZ3JhbUpzb24sICdVVEYtOCdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyBpbmRleC5odG1sIGZyb20gcnVubmluZyBwcm9qZWN0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjwqPn1cbiAgICAgKi9cbiAgICBhc3luYyBhY3F1aXJlSW5kZXgoKSB7XG4gICAgICAgIGNvbnN0IHBvcnQgPSAodGhpcy4kLmVudi5vcHRpb25zLnBvcnQpID8gdGhpcy4kLmVudi5vcHRpb25zLnBvcnQgOiAzMDgwO1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdhY3F1aXJpbmcgaW5kZXguaHRtbCcpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgaHR0cDovLzEyNy4wLjAuMToke3BvcnR9L19fY29yZG92YS9pbmRleC5odG1sYCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgICAgICAvLyBTaW1wbGUgdGVzdCBpZiB3ZSByZWFsbHkgZG93bmxvYWQgaW5kZXguaHRtbCBmb3Igd2ViLmNvcmRvdmEuXG4gICAgICAgIGlmICh+dGV4dC5pbmRleE9mKCdzcmM9XCIvY29yZG92YS5qc1wiJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIG1haW5mZXN0Lmpzb24gZnJvbSBydW5uaW5nIHByb2plY3QuXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPHZvaWQ+fVxuICAgICAqL1xuICAgIGFzeW5jIGFjcXVpcmVNYW5pZmVzdCgpIHtcbiAgICAgICAgY29uc3QgcG9ydCA9ICh0aGlzLiQuZW52Lm9wdGlvbnMucG9ydCkgPyB0aGlzLiQuZW52Lm9wdGlvbnMucG9ydCA6IDMwODA7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2FjcXVpcmluZyBtYW5pZmVzdC5qc29uJyk7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFxuICAgICAgICAgICAgYGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fS9fX2NvcmRvdmEvbWFuaWZlc3QuanNvbj9tZXRlb3JfZG9udF9zZXJ2ZV9pbmRleD10cnVlYFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzLnRleHQoKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZXMgdG8gZ2V0IGEgbW9iaWxlIGJ1aWxkIGZyb20gbWV0ZW9yIGFwcC5cbiAgICAgKiBJbiBjYXNlIG9mIGZhaWx1cmUgbGVhdmVzIGEgbWV0ZW9yLmxvZy5cbiAgICAgKiBBIGxvdCBvZiBzdHVmZiBpcyBoYXBwZW5pbmcgaGVyZSAtIGJ1dCB0aGUgbWFpbiBhaW0gaXMgdG8gZ2V0IGEgbW9iaWxlIGJ1aWxkIGZyb21cbiAgICAgKiAubWV0ZW9yL2xvY2FsL2NvcmRvdmEtYnVpbGQvd3d3L2FwcGxpY2F0aW9uIGFuZCBleGl0IGFzIHNvb24gYXMgcG9zc2libGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBidWlsZE1vYmlsZVRhcmdldCgpIHtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUpzb24gPVxuICAgICAgICAgICAgKHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPT09IHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX0NPUkRPVkFfQlVJTEQpID9cbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiA6XG4gICAgICAgICAgICAgICAgdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAud2ViQ29yZG92YVByb2dyYW1Kc29uO1xuXG4gICAgICAgIGlmICh0aGlzLiQudXRpbHMuZXhpc3RzKHByb2dyYW1Kc29uKSkge1xuICAgICAgICAgICAgdGhpcy5vbGRNYW5pZmVzdCA9IGZzLnJlYWRGaWxlU3luYyhwcm9ncmFtSnNvbiwgJ1VURi04Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgbG9nID0gJyc7XG4gICAgICAgICAgICBsZXQgZGVzaXJlZEV4aXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBidWlsZFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGVycm9yVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZVRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGtpbGxUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBjb3Jkb3ZhQ2hlY2tJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcG9ydFByb2JsZW0gPSBmYWxzZTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gd2luZG93c0tpbGwocGlkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2cuZGVidWcoYGtpbGxpbmcgcGlkOiAke3BpZH1gKTtcbiAgICAgICAgICAgICAgICBzcGF3bi5zeW5jKCd0YXNra2lsbCcsIFsnL3BpZCcsIHBpZCwgJy9mJywgJy90J10pO1xuXG4gICAgICAgICAgICAgICAgLy8gV2Ugd2lsbCBsb29rIGZvciBvdGhlciBwcm9jZXNzIHdoaWNoIG1pZ2h0IGhhdmUgYmVlbiBjcmVhdGVkIG91dHNpZGUgdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJvY2VzcyB0cmVlLlxuICAgICAgICAgICAgICAgIC8vIExldHMgbGlzdCBhbGwgbm9kZS5leGUgcHJvY2Vzc2VzLlxuXG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0ID0gc3Bhd25cbiAgICAgICAgICAgICAgICAgICAgLnN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAnd21pYycsXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ3Byb2Nlc3MnLCAnd2hlcmUnLCAnY2FwdGlvbj1cIm5vZGUuZXhlXCInLCAnZ2V0JywgJ2NvbW1hbmRsaW5lLHByb2Nlc3NpZCddXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLnN0ZG91dC50b1N0cmluZygndXRmLTgnKVxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZWxmLnByZXBhcmVBcmd1bWVudHMoKTtcbiAgICAgICAgICAgICAgICAvLyBMZXRzIG1vdW50IHJlZ2V4LlxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4VjEgPSBuZXcgUmVnRXhwKGAke2FyZ3Muam9pbignXFxcXHMrJyl9XFxcXHMrKFxcXFxkKylgLCAnZ20nKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleFYyID0gbmV3IFJlZ0V4cChgXCIke2FyZ3Muam9pbignXCJcXFxccytcIicpfVwiXFxcXHMrKFxcXFxkKylgLCAnZ20nKTtcbiAgICAgICAgICAgICAgICAvLyBObyB3ZSB3aWxsIGNoZWNrIGZvciB0aG9zZSB3aXRoIHRoZSBtYXRjaGluZyBwYXJhbXMuXG4gICAgICAgICAgICAgICAgb3V0LmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSByZWdleFYxLmV4ZWMobGluZSkgfHwgcmVnZXhWMi5leGVjKGxpbmUpIHx8IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubG9nLmRlYnVnKGBraWxsaW5nIHBpZDogJHttYXRjaFsxXX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduLnN5bmMoJ3Rhc2traWxsJywgWycvcGlkJywgbWF0Y2hbMV0sICcvZicsICcvdCddKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWdleFYxLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2V4VjIubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gd3JpdGVMb2coKSB7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYygnbWV0ZW9yLmxvZycsIGxvZywgJ1VURi04Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyVGltZW91dHNBbmRJbnRlcnZhbHMoKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjb3Jkb3ZhQ2hlY2tJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGJ1aWxkVGltZW91dCk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGVycm9yVGltZW91dCk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KG1lc3NhZ2VUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoa2lsbFRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5wcmVwYXJlQXJndW1lbnRzKCk7XG5cbiAgICAgICAgICAgIHRoaXMubG9nLmluZm8oYHJ1bm5pbmcgXCJtZXRlb3IgJHthcmdzLmpvaW4oJyAnKX1cIi4uLiB0aGlzIG1pZ2h0IHRha2UgYSB3aGlsZWApO1xuXG4gICAgICAgICAgICBjb25zdCBlbnYgPSB7IE1FVEVPUl9QUkVUVFlfT1VUUFVUOiAwLCBNRVRFT1JfTk9fUkVMRUFTRV9DSEVDSzogMSB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5wcm9kRGVidWcpIHtcbiAgICAgICAgICAgICAgICBlbnYuTUVURU9SX0RFU0tPUF9QUk9EX0RFQlVHID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGV0cyBzcGF3biBtZXRlb3IuXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKFxuICAgICAgICAgICAgICAgICdtZXRlb3InLFxuICAgICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oZW52LCBwcm9jZXNzLmVudiksXG4gICAgICAgICAgICAgICAgICAgIGN3ZDogdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeyBzaGVsbDogdHJ1ZSB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBLaWxscyB0aGUgY3VycmVudGx5IHJ1bm5pbmcgbWV0ZW9yIGNvbW1hbmQuXG4gICAgICAgICAgICBmdW5jdGlvbiBraWxsKCkge1xuICAgICAgICAgICAgICAgIHNsbCgnJyk7XG4gICAgICAgICAgICAgICAgY2hpbGQua2lsbCgnU0lHS0lMTCcpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLiQuZW52Lm9zLmlzV2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3dzS2lsbChjaGlsZC5waWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZXhpdCgpIHtcbiAgICAgICAgICAgICAgICBraWxsVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXRzQW5kSW50ZXJ2YWxzKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlc2lyZWRFeGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAga2lsbCgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY29weUJ1aWxkKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY29weUJ1aWxkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV4aXQoKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dHNBbmRJbnRlcnZhbHMoKTtcbiAgICAgICAgICAgICAgICAgICAga2lsbCgpO1xuICAgICAgICAgICAgICAgICAgICB3cml0ZUxvZygpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ2NvcHknKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29yZG92YUNoZWNrSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBoYXZlIGNvcmRvdmEtYnVpbGQgcmVhZHkuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNDb3Jkb3ZhQnVpbGRSZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHNvLCB0aGVuIGV4aXQgaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGV4SFRNTHN0cmF0ZWd5ID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fQ09SRE9WQV9CVUlMRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weUJ1aWxkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGNodW5rLnRvU3RyaW5nKCdVVEYtOCcpO1xuICAgICAgICAgICAgICAgIGxvZyArPSBgJHtsaW5lfVxcbmA7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZXJyb3JUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRG8gbm90IGV4aXQgaWYgdGhpcyBpcyB0aGUgd2FybmluZyBmb3IgdXNpbmcgLS1wcm9kdWN0aW9uLlxuICAgICAgICAgICAgICAgIC8vIE91dHB1dCBleGNlZWRzIC0+IGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy84NTkyXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAhfmxpbmUuaW5kZXhPZignLS1wcm9kdWN0aW9uJykgJiZcbiAgICAgICAgICAgICAgICAgICAgIX5saW5lLmluZGV4T2YoJ091dHB1dCBleGNlZWRzICcpICYmXG4gICAgICAgICAgICAgICAgICAgICF+bGluZS5pbmRleE9mKCdOb2RlI21vdmVUbycpICYmXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmlzQXJyYXkoc2VsZi4kLmVudi5vcHRpb25zLmlnbm9yZVN0ZGVycikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuJC5lbnYub3B0aW9ucy5pZ25vcmVTdGRlcnIuZXZlcnkoc3RyID0+ICF+bGluZS5pbmRleE9mKHN0cikpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2cud2FybignU1RERVJSOicsIGxpbmUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSB3aWxsIGV4aXQgMXMgYWZ0ZXIgbGFzdCBlcnJvciBpbiBzdGRlcnIuXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0c0FuZEludGVydmFscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAga2lsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGVMb2coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBjaHVuay50b1N0cmluZygnVVRGLTgnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRlc2lyZWRFeGl0ICYmIGxpbmUudHJpbSgpLnJlcGxhY2UoL1tcXG5cXHJcXHRcXHZcXGZdKy9nbSwgJycpICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5lc1RvRGlzcGxheSA9IGxpbmUudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcblxccicpO1xuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IGRpc3BsYXkgbGFzdCBsaW5lIGZyb20gdGhlIGNodW5rLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWRMaW5lID0gbGluZXNUb0Rpc3BsYXkucG9wKCkucmVwbGFjZSgvW1xcblxcclxcdFxcdlxcZl0rL2dtLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIHNsbChzYW5pdGl6ZWRMaW5lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nICs9IGAke2xpbmV9XFxuYDtcbiAgICAgICAgICAgICAgICBpZiAofmxpbmUuaW5kZXhPZignYWZ0ZXJfcGxhdGZvcm1fYWRkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xsKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnZG9uZS4uLiAxMCUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAofmxpbmUuaW5kZXhPZignTG9jYWwgcGFja2FnZSB2ZXJzaW9uJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQobWVzc2FnZVRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbGwoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnYnVpbGRpbmcgaW4gcHJvZ3Jlc3MuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTUwMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKH5saW5lLmluZGV4T2YoJ1ByZXBhcmluZyBDb3Jkb3ZhIHByb2plY3QnKSkge1xuICAgICAgICAgICAgICAgICAgICBzbGwoJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCdkb25lLi4uIDYwJScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh+bGluZS5pbmRleE9mKCdDYW5cXCd0IGxpc3RlbiBvbiBwb3J0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9ydFByb2JsZW0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh+bGluZS5pbmRleE9mKCdZb3VyIGFwcGxpY2F0aW9uIGhhcyBlcnJvcnMnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZXJyb3JUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlcnJvclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dHNBbmRJbnRlcnZhbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlTG9nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ2Vycm9ySW5BcHAnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKH5saW5lLmluZGV4T2YoJ0FwcCBydW5uaW5nIGF0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29weUJ1aWxkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFdoZW4gTWV0ZW9yIGV4aXRzXG4gICAgICAgICAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzbGwoJycpO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dHNBbmRJbnRlcnZhbHMoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRlc2lyZWRFeGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlTG9nKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3J0UHJvYmxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdwb3J0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ2V4aXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBidWlsZFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBraWxsKCk7XG4gICAgICAgICAgICAgICAgd3JpdGVMb2coKTtcbiAgICAgICAgICAgICAgICByZWplY3QoJ3RpbWVvdXQnKTtcbiAgICAgICAgICAgIH0sIHRoaXMuJC5lbnYub3B0aW9ucy5idWlsZFRpbWVvdXQgPyB0aGlzLiQuZW52Lm9wdGlvbnMuYnVpbGRUaW1lb3V0ICogMTAwMCA6IDYwMDAwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2VzIHRoZSBERFAgdXJsIHRoYXQgd2FzIHVzZWQgb3JpZ2luYWxseSB3aGVuIE1ldGVvciB3YXMgYnVpbGRpbmcgdGhlIGNsaWVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5kZXhIdG1sIC0gcGF0aCB0byBpbmRleC5odG1sIGZyb20gdGhlIGNsaWVudFxuICAgICAqL1xuICAgIHVwZGF0ZURkcFVybChpbmRleEh0bWwpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGxldCBydW50aW1lQ29uZmlnO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGluZGV4SHRtbCwgJ1VURi04Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKGBlcnJvciBsb2FkaW5nIGluZGV4Lmh0bWwgZmlsZTogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXIudGVzdChjb250ZW50KSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2NvdWxkIG5vdCBmaW5kIHJ1bnRpbWUgY29uZmlnIGluIGluZGV4IGZpbGUnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gY29udGVudC5tYXRjaCh0aGlzLm1hdGNoZXIpO1xuICAgICAgICAgICAgcnVudGltZUNvbmZpZyA9IEpTT04ucGFyc2UoZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoZXNbMV0pKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2NvdWxkIG5vdCBmaW5kIHJ1bnRpbWUgY29uZmlnIGluIGluZGV4IGZpbGUnKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLiQuZW52Lm9wdGlvbnMuZGRwVXJsLnN1YnN0cigtMSwgMSkgIT09ICcvJykge1xuICAgICAgICAgICAgdGhpcy4kLmVudi5vcHRpb25zLmRkcFVybCArPSAnLyc7XG4gICAgICAgIH1cblxuICAgICAgICBydW50aW1lQ29uZmlnLlJPT1RfVVJMID0gdGhpcy4kLmVudi5vcHRpb25zLmRkcFVybDtcbiAgICAgICAgcnVudGltZUNvbmZpZy5ERFBfREVGQVVMVF9DT05ORUNUSU9OX1VSTCA9IHRoaXMuJC5lbnYub3B0aW9ucy5kZHBVcmw7XG5cbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZXIsIGAkMVwiJHtlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkocnVudGltZUNvbmZpZykpfVwiJDNgXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaW5kZXhIdG1sLCBjb250ZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoYGVycm9yIHdyaXRpbmcgaW5kZXguaHRtbCBmaWxlOiAke2UubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdzdWNjZXNzZnVsbHkgdXBkYXRlZCBkZHAgc3RyaW5nIGluIHRoZSBydW50aW1lIGNvbmZpZyBvZiBhIG1vYmlsZSBidWlsZCcgK1xuICAgICAgICAgICAgYCB0byAke3RoaXMuJC5lbnYub3B0aW9ucy5kZHBVcmx9YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gYG1ldGVvcmAgY29tbWFuZC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAgICovXG4gICAgcHJlcGFyZUFyZ3VtZW50cygpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IFsncnVuJywgJy0tdmVyYm9zZScsIGAtLW1vYmlsZS1zZXJ2ZXI9JHt0aGlzLiQuZW52Lm9wdGlvbnMuZGRwVXJsfWBdO1xuICAgICAgICBpZiAodGhpcy4kLmVudi5pc1Byb2R1Y3Rpb25CdWlsZCgpKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goJy0tcHJvZHVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3MucHVzaCgnLXAnKTtcbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5wb3J0KSB7XG4gICAgICAgICAgICBhcmdzLnB1c2godGhpcy4kLmVudi5vcHRpb25zLnBvcnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJncy5wdXNoKCczMDgwJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5tZXRlb3JTZXR0aW5ncykge1xuICAgICAgICAgICAgYXJncy5wdXNoKCctLXNldHRpbmdzJywgdGhpcy4kLmVudi5vcHRpb25zLm1ldGVvclNldHRpbmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIG1vYmlsZSBidWlsZCBhbmQgY29waWVzIGl0IGludG8gZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIGFzeW5jIGNvcHlCdWlsZCgpIHtcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ2NsZWFyaW5nIGJ1aWxkIGRpcicpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy4kLnV0aWxzLnJtV2l0aFJldHJpZXMoJy1yZicsIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByZWZpeCA9ICdjb3Jkb3ZhQnVpbGQnO1xuICAgICAgICBsZXQgY29weVBhdGhQb3N0Zml4ID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPT09IHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX1JVTk5JTkdfU0VSVkVSKSB7XG4gICAgICAgICAgICBwcmVmaXggPSAnd2ViQ29yZG92YSc7XG4gICAgICAgICAgICBjb3B5UGF0aFBvc3RmaXggPSBgJHtwYXRoLnNlcH0qYDtcbiAgICAgICAgICAgIGxldCBpbmRleEh0bWw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcCk7XG4gICAgICAgICAgICAgICAgaW5kZXhIdG1sID0gYXdhaXQgdGhpcy5hY3F1aXJlSW5kZXgoKTtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwSW5kZXgsIGluZGV4SHRtbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuaW5mbygnc3VjY2Vzc2Z1bGx5IGRvd25sb2FkZWQgaW5kZXguaHRtbCBmcm9tIHJ1bm5pbmcgbWV0ZW9yIGFwcCcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdlcnJvciB3aGlsZSB0cnlpbmcgdG8gZG93bmxvYWQgaW5kZXguaHRtbCBmb3Igd2ViLmNvcmRvdmEsICcgK1xuICAgICAgICAgICAgICAgICAgICAnYmUgc3VyZSB0aGF0IHlvdSBhcmUgcnVubmluZyBhIG1vYmlsZSB0YXJnZXQgb3Igd2l0aCcgK1xuICAgICAgICAgICAgICAgICAgICAnIC0tbW9iaWxlLXNlcnZlcjogJywgZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvcmRvdmFCdWlsZCA9IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwW3ByZWZpeF07XG4gICAgICAgIGNvbnN0IHsgY29yZG92YUJ1aWxkSW5kZXggfSA9IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwO1xuICAgICAgICBjb25zdCBjb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiA9IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwW2Ake3ByZWZpeH1Qcm9ncmFtSnNvbmBdO1xuXG4gICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyhjb3Jkb3ZhQnVpbGQpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihgbm8gbW9iaWxlIGJ1aWxkIGZvdW5kIGF0ICR7Y29yZG92YUJ1aWxkfWApO1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2FyZSB5b3Ugc3VyZSB5b3UgZGlkIHJ1biBtZXRlb3Igd2l0aCAtLW1vYmlsZS1zZXJ2ZXI/Jyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcXVpcmVkIGZpbGUgbm90IHByZXNlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyhjb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbikpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdubyBwcm9ncmFtLmpzb24gZm91bmQgaW4gbW9iaWxlIGJ1aWxkIGZvdW5kIGF0ICcgK1xuICAgICAgICAgICAgICAgIGAke2NvcmRvdmFCdWlsZH1gKTtcbiAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKCdhcmUgeW91IHN1cmUgeW91IGRpZCBydW4gbWV0ZW9yIHdpdGggLS1tb2JpbGUtc2VydmVyPycpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1aXJlZCBmaWxlIG5vdCBwcmVzZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pbmRleEhUTUxzdHJhdGVneSAhPT0gdGhpcy5pbmRleEhUTUxTdHJhdGVnaWVzLklOREVYX0ZST01fUlVOTklOR19TRVJWRVIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy4kLnV0aWxzLmV4aXN0cyhjb3Jkb3ZhQnVpbGRJbmRleCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignbm8gaW5kZXguaHRtbCBmb3VuZCBpbiBjb3Jkb3ZhIGJ1aWxkIGZvdW5kIGF0ICcgK1xuICAgICAgICAgICAgICAgICAgICBgJHtjb3Jkb3ZhQnVpbGR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2FyZSB5b3Ugc3VyZSB5b3UgZGlkIHJ1biBtZXRlb3Igd2l0aCAtLW1vYmlsZS1zZXJ2ZXI/Jyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1aXJlZCBmaWxlIG5vdCBwcmVzZW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy52ZXJib3NlKCdjb3B5aW5nIG1vYmlsZSBidWlsZCcpO1xuICAgICAgICBzaGVsbC5jcChcbiAgICAgICAgICAgICctUicsIGAke2NvcmRvdmFCdWlsZH0ke2NvcHlQYXRoUG9zdGZpeH1gLCB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEJlY2F1c2Ugb2YgdmFyaW91cyBwZXJtaXNzaW9uIHByb2JsZW1zIGhlcmUgd2UgdHJ5IHRvIGNsZWFyIHRlIHBhdGggYnkgY2xlYXJpbmdcbiAgICAgICAgLy8gYWxsIHBvc3NpYmxlIHJlc3RyaWN0aW9ucy5cbiAgICAgICAgc2hlbGwuY2htb2QoXG4gICAgICAgICAgICAnLVInLCAnNzc3JywgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5tZXRlb3JBcHBcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3MuaXNXaW5kb3dzKSB7XG4gICAgICAgICAgICBzaGVsbC5leGVjKGBhdHRyaWIgLXIgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcH0ke3BhdGguc2VwfSouKiAvc2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5kZXhIVE1Mc3RyYXRlZ3kgPT09IHRoaXMuaW5kZXhIVE1MU3RyYXRlZ2llcy5JTkRFWF9GUk9NX1JVTk5JTkdfU0VSVkVSKSB7XG4gICAgICAgICAgICBsZXQgcHJvZ3JhbUpzb247XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHByb2dyYW1Kc29uID0gYXdhaXQgdGhpcy5hY3F1aXJlTWFuaWZlc3QoKTtcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcFByb2dyYW1Kc29uLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwcm9ncmFtSnNvbiwgbnVsbCwgNClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmluZm8oJ3N1Y2Nlc3NmdWxseSBkb3dubG9hZGVkIG1hbmlmZXN0Lmpzb24gZnJvbSBydW5uaW5nIG1ldGVvciBhcHAnKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIGRvd25sb2FkIG1hbmlmZXN0Lmpzb24gZm9yIHdlYi5jb3Jkb3ZhLCcgK1xuICAgICAgICAgICAgICAgICAgICAnIGJlIHN1cmUgdGhhdCB5b3UgYXJlIHJ1bm5pbmcgYSBtb2JpbGUgdGFyZ2V0IG9yIHdpdGgnICtcbiAgICAgICAgICAgICAgICAgICAgJyAtLW1vYmlsZS1zZXJ2ZXI6ICcsIGUpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZy5pbmZvKCdtb2JpbGUgYnVpbGQgY29waWVkIHRvIGVsZWN0cm9uIGFwcCcpO1xuXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKCdjb3B5IGNvcmRvdmEuanMgdG8gbWV0ZW9yIGJ1aWxkJyk7XG4gICAgICAgIHNoZWxsLmNwKFxuICAgICAgICAgICAgam9pbihfX2Rpcm5hbWUsICcuLicsICdza2VsZXRvbicsICdjb3Jkb3ZhLmpzJyksXG4gICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluamVjdHMgTWV0ZW9yLmlzRGVza3RvcFxuICAgICAqL1xuICAgIGluamVjdElzRGVza3RvcCgpIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mbygnaW5qZWN0aW5nIGlzRGVza3RvcCcpO1xuXG4gICAgICAgIGxldCBtYW5pZmVzdEpzb25QYXRoID0gdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAuY29yZG92YUJ1aWxkUHJvZ3JhbUpzb247XG4gICAgICAgIGlmICh0aGlzLmluZGV4SFRNTHN0cmF0ZWd5ID09PSB0aGlzLmluZGV4SFRNTFN0cmF0ZWdpZXMuSU5ERVhfRlJPTV9SVU5OSU5HX1NFUlZFUikge1xuICAgICAgICAgICAgbWFuaWZlc3RKc29uUGF0aCA9IHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLndlYkNvcmRvdmFQcm9ncmFtSnNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IG1hbmlmZXN0IH0gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhtYW5pZmVzdEpzb25QYXRoLCAnVVRGLTgnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGxldCBpbmplY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IGluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gV2Ugd2lsbCBzZWFyY2ggaW4gZXZlcnkgLmpzIGZpbGUgaW4gdGhlIG1hbmlmZXN0LlxuICAgICAgICAgICAgLy8gV2UgY291bGQgcHJvYmFibHkgZGV0ZWN0IHdoZXRoZXIgdGhpcyBpcyBhIGRldiBvciBwcm9kdWN0aW9uIGJ1aWxkIGFuZCBvbmx5IHNlYXJjaCBpblxuICAgICAgICAgICAgLy8gdGhlIGNvcnJlY3QgZmlsZXMsIGJ1dCBmb3Igbm93IHRoaXMgc2hvdWxkIGJlIGZpbmUuXG4gICAgICAgICAgICBtYW5pZmVzdC5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVDb250ZW50cztcbiAgICAgICAgICAgICAgICAvLyBIYWNreSB3YXkgb2Ygc2V0dGluZyBpc0Rlc2t0b3AuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUudHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgICAgICAgICAgICBmaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2luKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwLCBmaWxlLnBhdGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1VURi04J1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLmluamVjdG9yLnByb2Nlc3NGaWxlQ29udGVudHMoZmlsZUNvbnRlbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAoeyBmaWxlQ29udGVudHMgfSA9IHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5pbmplY3RlZFN0YXJ0dXBEaWRDb21wbGV0ZSA/IHRydWUgOiBpbmplY3RlZFN0YXJ0dXBEaWRDb21wbGV0ZTtcbiAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWQgPSByZXN1bHQuaW5qZWN0ZWQgPyB0cnVlIDogaW5qZWN0ZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGpvaW4odGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5tZXRlb3JBcHAsIGZpbGUucGF0aCksIGZpbGVDb250ZW50c1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIWluamVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIGluamVjdGluZyBpc0Rlc2t0b3AgZ2xvYmFsIHZhci4nKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWluamVjdGVkU3RhcnR1cERpZENvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIGluamVjdGluZyBpc0Rlc2t0b3AgZm9yIHN0YXJ0dXBEaWRDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIHdoaWxlIGluamVjdGluZyBpc0Rlc2t0b3A6ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2luamVjdGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkcywgbW9kaWZpZXMgYW5kIGNvcGllcyB0aGUgbWV0ZW9yIGFwcCB0byBlbGVjdHJvbiBhcHAuXG4gICAgICovXG4gICAgYXN5bmMgYnVpbGQoKSB7XG4gICAgICAgIHRoaXMubG9nLmluZm8oJ2NoZWNraW5nIGZvciBhbnkgbW9iaWxlIHBsYXRmb3JtJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNoZWNrUHJlY29uZGl0aW9ucygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igb2NjdXJyZWQgZHVyaW5nIGNoZWNraW5nIHByZWNvbmRpdGlvbnM6ICcsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2cuaW5mbygnYnVpbGRpbmcgbWV0ZW9yIGFwcCcpO1xuXG4gICAgICAgIGlmICghdGhpcy4kLmVudi5vcHRpb25zLnNraXBNb2JpbGVCdWlsZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkTW9iaWxlVGFyZ2V0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd0aW1lb3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aW1lb3V0IHdoaWxlIGJ1aWxkaW5nLCBsb2cgaGFzIGJlZW4gd3JpdHRlbiB0byBtZXRlb3IubG9nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYnVpbGQgd2FzIHRlcm1pbmF0ZWQgYnkgbWV0ZW9yLWRlc2t0b3AgYXMgc29tZSBlcnJvcnMgd2VyZSByZXBvcnRlZCB0byBzdGRlcnIsIHlvdSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2hvdWxkIHNlZSBpdCBhYm92ZSwgYWxzbyBjaGVjayBtZXRlb3IubG9nIGZvciBtb3JlIGluZm8sIHRvIGlnbm9yZSBpdCB1c2UgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctLWlnbm9yZS1zdGRlcnIgXCI8c3RyaW5nPlwiJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdlcnJvckluQXBwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5b3VyIG1ldGVvciBhcHAgaGFzIGVycm9ycyAtIGxvb2sgaW50byBtZXRlb3IubG9nIGZvciBtb3JlJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBpbmZvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdwb3J0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5b3VyIHBvcnQgMzA4MCBpcyBjdXJyZW50bHkgdXNlZCAoeW91IHByb2JhYmx5IGhhdmUgdGhpcyBvciBvdGhlciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWV0ZW9yIHByb2plY3QgcnVubmluZz8pLCB1c2UgYC10YCBvciBgLS1tZXRlb3ItcG9ydGAgdG8gdXNlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaWZmZXJlbnQgcG9ydCB3aGlsZSBidWlsZGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXhpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWV0ZW9yIGNtZCBleGl0ZWQgdW5leHBlY3RlZGx5LCBsb2cgaGFzIGJlZW4gd3JpdHRlbiB0byBtZXRlb3IubG9nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjb3B5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlcnJvciBlbmNvdW50ZXJlZCB3aGVuIGNvcHlpbmcgdGhlIGJ1aWxkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIG9jY3VycmVkIGR1cmluZyBidWlsZGluZyBtb2JpbGUgdGFyZ2V0JywgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW9iaWxlUGxhdGZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW1vdmVNb2JpbGVQbGF0Zm9ybSh0aGlzLm1vYmlsZVBsYXRmb3JtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbmRleEhUTUxzdHJhdGVneSA9IHRoaXMuY2hvb3NlU3RyYXRlZ3koKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jb3B5QnVpbGQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluamVjdElzRGVza3RvcCgpO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlRGRwVXJsKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGFja1RvQXNhcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcignZXJyb3Igd2hpbGUgcGFja2luZyBtZXRlb3IgYXBwIHRvIGFzYXInKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nLmluZm8oJ21ldGVvciBidWlsZCBmaW5pc2hlZCcpO1xuXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZVBsYXRmb3JtKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlbW92ZU1vYmlsZVBsYXRmb3JtKHRoaXMubW9iaWxlUGxhdGZvcm0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlRGRwVXJsKCkge1xuICAgICAgICBpZiAodGhpcy4kLmVudi5vcHRpb25zLmRkcFVybCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZURkcFVybCh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLm1ldGVvckFwcEluZGV4KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihgZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIGNoYW5nZSB0aGUgZGRwIHVybDogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYWNrVG9Bc2FyKCkge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdwYWNraW5nIG1ldGVvciBhcHAgdG8gYXNhciBhcmNoaXZlJyk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgICAgYXNhci5jcmVhdGVQYWNrYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubWV0ZW9yQXBwLFxuICAgICAgICAgICAgICAgIHBhdGguam9pbih0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdtZXRlb3IuYXNhcicpLFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gV2luZG93cyBzb21lIGZpbGVzIG1pZ2h0IHN0aWxsIGJlIGJsb2NrZWQuIEdpdmluZyBhIHRpY2sgZm9yIHRoZW0gdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVhZHkgZm9yIGRlbGV0aW9uLlxuICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnY2xlYXJpbmcgbWV0ZW9yIGFwcCBhZnRlciBwYWNraW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiQudXRpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucm1XaXRoUmV0cmllcygnLXJmJywgdGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5tZXRlb3JBcHApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGVyIGZvciBzcGF3bmluZyBucG0uXG4gICAgICogQHBhcmFtIHtBcnJheX0gIGNvbW1hbmRzIC0gY29tbWFuZHMgZm9yIHNwYXduXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ZGlvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGN3ZFxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICovXG4gICAgcnVuTnBtKGNvbW1hbmRzLCBzdGRpbyA9ICdpZ25vcmUnLCBjd2QgPSB0aGlzLiQuZW52LnBhdGhzLm1ldGVvckFwcC5yb290KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBleGVjdXRpbmcgbWV0ZW9yIG5wbSAke2NvbW1hbmRzLmpvaW4oJyAnKX1gKTtcblxuICAgICAgICAgICAgc3Bhd24oJ21ldGVvcicsIFsnbnBtJywgLi4uY29tbWFuZHNdLCB7XG4gICAgICAgICAgICAgICAgY3dkLFxuICAgICAgICAgICAgICAgIHN0ZGlvXG4gICAgICAgICAgICB9KS5vbignZXhpdCcsIGNvZGUgPT4gKFxuICAgICAgICAgICAgICAgIChjb2RlID09PSAwKSA/IHJlc29sdmUoKSA6IHJlamVjdChuZXcgRXJyb3IoYG5wbSBleGl0IGNvZGUgd2FzICR7Y29kZX1gKSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cbiJdfQ==
