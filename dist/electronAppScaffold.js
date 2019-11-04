"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _fs = _interopRequireDefault(require("fs"));

var _del = _interopRequireDefault(require("del"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _path = _interopRequireDefault(require("path"));

var _log = _interopRequireDefault(require("./log"));

var _skeletonDependencies = _interopRequireDefault(require("./skeletonDependencies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var join = _path.default.join;
_shelljs.default.config.fatal = true;
/**
 * Represents the .desktop dir scaffold.
 */

var ElectronAppScaffold =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   * @constructor
   */
  function ElectronAppScaffold($) {
    _classCallCheck(this, ElectronAppScaffold);

    this.log = new _log.default('electronAppScaffold');
    this.$ = $;
    this.packageJson = {
      name: 'MyMeteorApp',
      main: this.$.env.isProductionBuild() ? 'app.asar/index.js' : 'app/index.js',
      dependencies: Object.assign({}, _skeletonDependencies.default)
    };

    if (!this.$.env.isProductionBuild() || this.$.env.options.prodDebug) {
      this.packageJson.dependencies.devtron = '1.4.0';
      this.packageJson.dependencies['electron-debug'] = '1.5.0';
    }
  }
  /**
   * Just a public getter from the default package.json object.
   * @returns {Object}
   */


  _createClass(ElectronAppScaffold, [{
    key: "getDefaultPackageJson",
    value: function getDefaultPackageJson() {
      return Object.assign({}, this.packageJson);
    }
    /**
     * Clear the electron app. Removes everything except the node_modules which would be a waste
     * to delete. Later `npm prune` will keep it clear.
     */

  }, {
    key: "clear",
    value: function clear() {
      if (!this.$.utils.exists(this.$.env.paths.electronApp.root)) {
        this.log.verbose(`creating ${this.$.env.paths.electronApp.rootName}`);

        _shelljs.default.mkdir(this.$.env.paths.electronApp.root);
      }

      return (0, _del.default)([`${this.$.env.paths.electronApp.root}${_path.default.sep}*`, `!${this.$.env.paths.electronApp.nodeModules}`]);
    }
    /**
     * Just copies the Skeleton App into the electron app.
     */

  }, {
    key: "copySkeletonApp",
    value: function copySkeletonApp() {
      this.log.verbose('copying skeleton app');

      try {
        _shelljs.default.cp('-rf', join(this.$.env.paths.meteorDesktop.skeleton, '*'), this.$.env.paths.electronApp.appRoot + _path.default.sep);
      } catch (e) {
        this.log.error('error while copying skeleton app:', e);
        process.exit(1);
      }
    }
    /**
     * After clearing the electron app path, copies a fresh skeleton.
     */

  }, {
    key: "make",
    value: function () {
      var _make = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee() {
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                this.log.verbose(`clearing ${this.$.env.paths.electronApp.rootName}`);
                _context.next = 4;
                return this.clear();

              case 4:
                _context.next = 10;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context["catch"](0);
                this.log.error(`error while removing ${this.$.env.paths.electronApp.root}: `, _context.t0);
                process.exit(1);

              case 10:
                this.createAppRoot();
                this.copySkeletonApp(); // TODO: hey, wait, .gitignore is not needed - right?

                /*
                this.log.debug('creating .gitignore');
                fs.writeFileSync(this.$.env.paths.electronApp.gitIgnore, [
                    'node_modules'
                ].join('\n'));
                */

                this.log.verbose('writing package.json');

                _fs.default.writeFileSync(this.$.env.paths.electronApp.packageJson, JSON.stringify(this.packageJson, null, 2));

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 6]]);
      }));

      return function make() {
        return _make.apply(this, arguments);
      };
    }()
    /**
     * Creates the app directory in the electron app.
     */

  }, {
    key: "createAppRoot",
    value: function createAppRoot() {
      try {
        this.log.verbose(`creating ${this.$.env.paths.electronApp.appRoot}`);

        _fs.default.mkdirSync(this.$.env.paths.electronApp.appRoot);
      } catch (e) {
        if (e.code !== 'EEXIST') {
          this.log.error(`error while creating dir: ${this.$.env.paths.electronApp.appRoot}: `, e);
          process.exit(1);
        }
      }
    }
  }]);

  return ElectronAppScaffold;
}();

exports.default = ElectronAppScaffold;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbkFwcFNjYWZmb2xkLmpzIl0sIm5hbWVzIjpbImpvaW4iLCJjb25maWciLCJmYXRhbCIsIkVsZWN0cm9uQXBwU2NhZmZvbGQiLCIkIiwibG9nIiwicGFja2FnZUpzb24iLCJuYW1lIiwibWFpbiIsImVudiIsImlzUHJvZHVjdGlvbkJ1aWxkIiwiZGVwZW5kZW5jaWVzIiwiT2JqZWN0IiwiYXNzaWduIiwib3B0aW9ucyIsInByb2REZWJ1ZyIsImRldnRyb24iLCJ1dGlscyIsImV4aXN0cyIsInBhdGhzIiwiZWxlY3Ryb25BcHAiLCJyb290IiwidmVyYm9zZSIsInJvb3ROYW1lIiwibWtkaXIiLCJzZXAiLCJub2RlTW9kdWxlcyIsImNwIiwibWV0ZW9yRGVza3RvcCIsInNrZWxldG9uIiwiYXBwUm9vdCIsImUiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0IiwiY2xlYXIiLCJjcmVhdGVBcHBSb290IiwiY29weVNrZWxldG9uQXBwIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJta2RpclN5bmMiLCJjb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7OztJQUVRQSxJLGlCQUFBQSxJO0FBQ1IsaUJBQU1DLE1BQU4sQ0FBYUMsS0FBYixHQUFxQixJQUFyQjtBQUVBOzs7O0lBR3FCQyxtQjs7O0FBQ2pCOzs7O0FBSUEsK0JBQVlDLENBQVosRUFBZTtBQUFBOztBQUNYLFNBQUtDLEdBQUwsR0FBVyxpQkFBUSxxQkFBUixDQUFYO0FBQ0EsU0FBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBRUEsU0FBS0UsV0FBTCxHQUFtQjtBQUNmQyxZQUFNLGFBRFM7QUFFZkMsWUFBTyxLQUFLSixDQUFMLENBQU9LLEdBQVAsQ0FBV0MsaUJBQVgsRUFBRCxHQUNGLG1CQURFLEdBQ29CLGNBSFg7QUFJZkMsb0JBQWNDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkO0FB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Ozs7O29DQUdnQjtBQUNaLFVBQUk7QUFDQSxhQUFLRCxHQUFMLENBQVNpQixPQUFULENBQWtCLFlBQVcsS0FBS2xCLENBQUwsQ0FBT0ssR0FBUCxDQUFXVSxLQUFYLENBQWlCQyxXQUFqQixDQUE2QlUsT0FBUSxFQUFsRTs7QUFDQSxvQkFBR1csU0FBSCxDQUFhLEtBQUtyQyxDQUFMLENBQU9LLEdBQVAsQ0FBV1UsS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJVLE9BQTFDO0FBQ0gsT0FIRCxDQUdFLE9BQU9DLENBQVAsRUFBVTtBQUNSLFlBQUlBLEVBQUVXLElBQUYsS0FBVyxRQUFmLEVBQXlCO0FBQ3JCLGVBQUtyQyxHQUFMLENBQVMyQixLQUFULENBQ0ssNkJBQTRCLEtBQUs1QixDQUFMLENBQU9LLEdBQVAsQ0FBV1UsS0FBWCxDQUFpQkMsV0FBakIsQ0FBNkJVLE9BQVEsSUFEdEUsRUFDMkVDLENBRDNFO0FBR0FFLGtCQUFRQyxJQUFSLENBQWEsQ0FBYjtBQUNIO0FBQ0o7QUFDSiIsImZpbGUiOiJlbGVjdHJvbkFwcFNjYWZmb2xkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgcmVnZW5lcmF0b3JSdW50aW1lIGZyb20gJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGRlbCBmcm9tICdkZWwnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCBMb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IGRlcGVuZGVuY2llcyBmcm9tICcuL3NrZWxldG9uRGVwZW5kZW5jaWVzJztcblxuY29uc3QgeyBqb2luIH0gPSBwYXRoO1xuc2hlbGwuY29uZmlnLmZhdGFsID0gdHJ1ZTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSAuZGVza3RvcCBkaXIgc2NhZmZvbGQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsZWN0cm9uQXBwU2NhZmZvbGQge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWV0ZW9yRGVza3RvcH0gJCAtIGNvbnRleHRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnZWxlY3Ryb25BcHBTY2FmZm9sZCcpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuXG4gICAgICAgIHRoaXMucGFja2FnZUpzb24gPSB7XG4gICAgICAgICAgICBuYW1lOiAnTXlNZXRlb3JBcHAnLFxuICAgICAgICAgICAgbWFpbjogKHRoaXMuJC5lbnYuaXNQcm9kdWN0aW9uQnVpbGQoKSkgP1xuICAgICAgICAgICAgICAgICdhcHAuYXNhci9pbmRleC5qcycgOiAnYXBwL2luZGV4LmpzJyxcbiAgICAgICAgICAgIGRlcGVuZGVuY2llczogT2JqZWN0LmFzc2lnbih7fSwgZGVwZW5kZW5jaWVzKVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghdGhpcy4kLmVudi5pc1Byb2R1Y3Rpb25CdWlsZCgpIHx8IHRoaXMuJC5lbnYub3B0aW9ucy5wcm9kRGVidWcpIHtcbiAgICAgICAgICAgIHRoaXMucGFja2FnZUpzb24uZGVwZW5kZW5jaWVzLmRldnRyb24gPSAnMS40LjAnO1xuICAgICAgICAgICAgdGhpcy5wYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXNbJ2VsZWN0cm9uLWRlYnVnJ10gPSAnMS41LjAnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSnVzdCBhIHB1YmxpYyBnZXR0ZXIgZnJvbSB0aGUgZGVmYXVsdCBwYWNrYWdlLmpzb24gb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RGVmYXVsdFBhY2thZ2VKc29uKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wYWNrYWdlSnNvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGhlIGVsZWN0cm9uIGFwcC4gUmVtb3ZlcyBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgbm9kZV9tb2R1bGVzIHdoaWNoIHdvdWxkIGJlIGEgd2FzdGVcbiAgICAgKiB0byBkZWxldGUuIExhdGVyIGBucG0gcHJ1bmVgIHdpbGwga2VlcCBpdCBjbGVhci5cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLiQudXRpbHMuZXhpc3RzKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLnZlcmJvc2UoYGNyZWF0aW5nICR7dGhpcy4kLmVudi5wYXRocy5lbGVjdHJvbkFwcC5yb290TmFtZX1gKTtcbiAgICAgICAgICAgIHNoZWxsLm1rZGlyKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVsKFtcbiAgICAgICAgICAgIGAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdH0ke3BhdGguc2VwfSpgLFxuICAgICAgICAgICAgYCEke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAubm9kZU1vZHVsZXN9YFxuICAgICAgICBdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBKdXN0IGNvcGllcyB0aGUgU2tlbGV0b24gQXBwIGludG8gdGhlIGVsZWN0cm9uIGFwcC5cbiAgICAgKi9cbiAgICBjb3B5U2tlbGV0b25BcHAoKSB7XG4gICAgICAgIHRoaXMubG9nLnZlcmJvc2UoJ2NvcHlpbmcgc2tlbGV0b24gYXBwJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzaGVsbC5jcChcbiAgICAgICAgICAgICAgICAnLXJmJyxcbiAgICAgICAgICAgICAgICBqb2luKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yRGVza3RvcC5za2VsZXRvbiwgJyonKSxcbiAgICAgICAgICAgICAgICB0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QgKyBwYXRoLnNlcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2cuZXJyb3IoJ2Vycm9yIHdoaWxlIGNvcHlpbmcgc2tlbGV0b24gYXBwOicsIGUpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWZ0ZXIgY2xlYXJpbmcgdGhlIGVsZWN0cm9uIGFwcCBwYXRoLCBjb3BpZXMgYSBmcmVzaCBza2VsZXRvbi5cbiAgICAgKi9cbiAgICBhc3luYyBtYWtlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2cudmVyYm9zZShgY2xlYXJpbmcgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lfWApO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGVhcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICBgZXJyb3Igd2hpbGUgcmVtb3ZpbmcgJHt0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLnJvb3R9OiBgLCBlXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmVhdGVBcHBSb290KCk7XG5cbiAgICAgICAgdGhpcy5jb3B5U2tlbGV0b25BcHAoKTtcblxuICAgICAgICAvLyBUT0RPOiBoZXksIHdhaXQsIC5naXRpZ25vcmUgaXMgbm90IG5lZWRlZCAtIHJpZ2h0P1xuICAgICAgICAvKlxuICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnY3JlYXRpbmcgLmdpdGlnbm9yZScpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuZ2l0SWdub3JlLCBbXG4gICAgICAgICAgICAnbm9kZV9tb2R1bGVzJ1xuICAgICAgICBdLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2cudmVyYm9zZSgnd3JpdGluZyBwYWNrYWdlLmpzb24nKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgICAgIHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucGFja2FnZUpzb24sIEpTT04uc3RyaW5naWZ5KHRoaXMucGFja2FnZUpzb24sIG51bGwsIDIpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgYXBwIGRpcmVjdG9yeSBpbiB0aGUgZWxlY3Ryb24gYXBwLlxuICAgICAqL1xuICAgIGNyZWF0ZUFwcFJvb3QoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZy52ZXJib3NlKGBjcmVhdGluZyAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdH1gKTtcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyh0aGlzLiQuZW52LnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5jb2RlICE9PSAnRUVYSVNUJykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgZXJyb3Igd2hpbGUgY3JlYXRpbmcgZGlyOiAke3RoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdH06IGAsIGVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==