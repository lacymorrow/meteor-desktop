"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _assignIn = _interopRequireDefault(require("lodash/assignIn"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var join = _path.default.join;
/**
 * @class
 * @property {packagePaths} paths
 */

var Env =
/*#__PURE__*/
function () {
  function Env(input, output, options) {
    _classCallCheck(this, Env);

    this.options = options;

    if (this.isProductionBuild()) {
      process.env.NODE_ENV = 'production';
    }

    this.sys = {
      platform: process.platform,
      arch: process.arch
    }; // Operational System.

    this.os = {
      isWindows: process.platform === 'win32',
      isLinux: process.platform === 'linux',
      isOsx: process.platform === 'darwin'
    };
    this.stdio = 'inherit';
    this.os.name = this.sys.platform === 'darwin' ? 'osx' : this.sys.platform;
    this.os.home = process.env[this.os.isWindows ? 'USERPROFILE' : 'HOME'];
    this.os.tmp = _os.default.tmpdir();
    /** @type {packagePaths} */

    this.paths = {};
    /** @type {meteorDesktopPaths} */

    this.paths.meteorDesktop = {
      root: _path.default.resolve(__dirname, '..')
    };
    this.paths.meteorDesktop.skeleton = join(this.paths.meteorDesktop.root, 'skeleton');
    /** @type {meteorAppPaths} */

    this.paths.meteorApp = {
      root: input
    };
    /** @type {desktopPaths} */

    this.paths.desktop = {
      rootName: '.desktop',
      root: join(this.paths.meteorApp.root, '.desktop')
    };
    (0, _assignIn.default)(this.paths.desktop, {
      modules: join(this.paths.desktop.root, 'modules'),
      import: join(this.paths.desktop.root, 'import'),
      assets: join(this.paths.desktop.root, 'assets'),
      settings: join(this.paths.desktop.root, 'settings.json'),
      desktop: join(this.paths.desktop.root, 'desktop.js')
    });
    this.paths.desktop.splashScreen = join(this.paths.desktop.assets, 'splashScreen.png');
    this.paths.desktop.loadingGif = join(this.paths.desktop.assets, 'loading.gif');
    this.paths.desktop.meteorIco = join(this.paths.desktop.assets, 'meteor.ico');
    /** @type {electronAppPaths} */

    this.paths.electronApp = {
      rootName: 'desktop-build'
    };
    this.paths.electronApp.root = join(this.paths.meteorApp.root, '.meteor', this.paths.electronApp.rootName);
    this.paths.electronApp.tmpNodeModules = join(this.paths.meteorApp.root, '.meteor', '.desktop_node_modules');
    this.paths.cache = join(this.paths.meteorApp.root, '.meteor', 'local', 'desktop-cache');
    this.paths.electronApp.extractedNodeModules = join(this.paths.meteorApp.root, '.meteor', '.desktop_extracted_node_modules');
    this.paths.electronApp.extractedNodeModulesBin = join(this.paths.electronApp.extractedNodeModules, '.bin');
    this.paths.electronApp.appRoot = join(this.paths.electronApp.root, 'app');
    (0, _assignIn.default)(this.paths.electronApp, {
      app: join(this.paths.electronApp.appRoot, 'app.js'),
      cordova: join(this.paths.electronApp.appRoot, 'cordova.js'),
      index: join(this.paths.electronApp.appRoot, 'index.js'),
      preload: join(this.paths.electronApp.appRoot, 'preload.js'),
      modules: join(this.paths.electronApp.appRoot, 'modules'),
      desktopAsar: join(this.paths.electronApp.root, 'desktop.asar'),
      extracted: join(this.paths.electronApp.root, 'extracted'),
      appAsar: join(this.paths.electronApp.root, 'app.asar'),
      import: join(this.paths.electronApp.root, 'import'),
      assets: join(this.paths.electronApp.root, 'assets'),
      packageJson: join(this.paths.electronApp.root, 'package.json'),
      settings: join(this.paths.electronApp.root, 'settings.json'),
      desktop: join(this.paths.electronApp.root, 'desktop.js'),
      desktopTmp: join(this.paths.electronApp.root, '__desktop'),
      nodeModules: join(this.paths.electronApp.root, 'node_modules'),
      meteorAsar: join(this.paths.electronApp.root, 'meteor.asar'),
      meteorApp: join(this.paths.electronApp.root, 'meteor'),
      meteorAppIndex: join(this.paths.electronApp.root, 'meteor', 'index.html'),
      meteorAppProgramJson: join(this.paths.electronApp.root, 'meteor', 'program.json'),
      skeleton: join(this.paths.electronApp.root, 'skeleton')
    });
    (0, _assignIn.default)(this.paths.meteorApp, {
      platforms: join(this.paths.meteorApp.root, '.meteor', 'platforms'),
      packages: join(this.paths.meteorApp.root, '.meteor', 'packages'),
      versions: join(this.paths.meteorApp.root, '.meteor', 'versions'),
      release: join(this.paths.meteorApp.root, '.meteor', 'release'),
      packageJson: join(this.paths.meteorApp.root, 'package.json'),
      gitIgnore: join(this.paths.meteorApp.root, '.meteor', '.gitignore'),
      cordovaBuild: join(this.paths.meteorApp.root, '.meteor', 'local', 'cordova-build', 'www', 'application'),
      webCordova: join(this.paths.meteorApp.root, '.meteor', 'local', 'build', 'programs', 'web.cordova')
    });
    (0, _assignIn.default)(this.paths.meteorApp, {
      cordovaBuildIndex: join(this.paths.meteorApp.cordovaBuild, 'index.html'),
      cordovaBuildProgramJson: join(this.paths.meteorApp.cordovaBuild, 'program.json')
    });
    (0, _assignIn.default)(this.paths.meteorApp, {
      webCordovaProgramJson: join(this.paths.meteorApp.webCordova, 'program.json')
    });
    /** @type {desktopTmpPaths} */

    this.paths.desktopTmp = {
      root: join(this.paths.electronApp.root, '__desktop')
    };
    (0, _assignIn.default)(this.paths.desktopTmp, {
      modules: join(this.paths.desktopTmp.root, 'modules'),
      settings: join(this.paths.desktopTmp.root, 'settings.json')
    });
    this.paths.packageDir = '.desktop-package';
    this.paths.installerDir = '.desktop-installer'; // Scaffold

    this.paths.scaffold = join(__dirname, '..', 'scaffold');
  }
  /**
   * @returns {boolean|*}
   * @public
   */


  _createClass(Env, [{
    key: "isProductionBuild",
    value: function isProductionBuild() {
      return !!('production' in this.options && this.options.production);
    }
  }]);

  return Env;
}();

exports.default = Env;
module.exports = Env;
/**
 * @typedef {Object} desktopPaths
 * @property {string} rootName
 * @property {string} root
 * @property {string} modules
 * @property {string} import
 * @property {string} assets
 * @property {string} settings
 * @property {string} desktop
 * @property {string} splashScreen
 * @property {string} loadingGif
 * @property {string} meteorIco
 */

/**
 * @typedef {Object} meteorAppPaths
 * @property {string} root
 * @property {string} platforms
 * @property {string} release
 * @property {string} packages
 * @property {string} versions
 * @property {string} gitIgnore
 * @property {string} packageJson
 * @property {string} cordovaBuild
 * @property {string} cordovaBuildIndex
 * @property {string} cordovaBuildProgramJson
 * @property {string} webCordova
 * @property {string} webCordovaIndex
 * @property {string} webCordovaProgramJson
 */

/**
 * @typedef {Object} electronAppPaths
 * @property {string} rootName
 * @property {string} root
 * @property {Object} appRoot
 * @property {string} appRoot.cordova
 * @property {string} appRoot.index
 * @property {string} appRoot.app
 * @property {string} appRoot.modules
 * @property {string} desktopAsar
 * @property {string} extracted
 * @property {string} appAsar
 * @property {string} preload
 * @property {string} import
 * @property {string} assets
 * @property {string} gitIgnore
 * @property {string} packageJson
 * @property {string} settings
 * @property {string} desktop
 * @property {string} desktopTmp
 * @property {string} nodeModules
 * @property {string} meteorAsar
 * @property {string} meteorApp
 * @property {string} meteorAppIndex
 * @property {string} meteorAppProgramJson
 * @property {string} skeleton
 * @property {string} tmpNodeModules
 * @property {string} extractedNodeModules
 * @property {string} extractedNodeModulesBin
 */

/**
 * @typedef {Object} desktopTmpPaths
 * @property {string} root
 * @property {string} modules
 * @property {string} settings
 */

/**
 * @typedef {Object} meteorDesktopPaths
 * @property {string} root
 * @property {string} skeleton
 */

/**
 * @typedef {Object} packagePaths
 * @property {meteorAppPaths} meteorApp
 * @property {desktopPaths} desktop
 * @property {electronAppPaths} electronApp
 * @property {desktopTmpPaths} desktopTmp
 * @property {meteorDesktopPaths} meteorDesktop
 * @property {string} packageDir
 * @property {string} scaffold
 */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbnYuanMiXSwibmFtZXMiOlsiam9pbiIsIkVudiIsImlucHV0Iiwib3V0cHV0Iiwib3B0aW9ucyIsImlzUHJvZHVjdGlvbkJ1aWxkIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwic3lzIiwicGxhdGZvcm0iLCJhcmNoIiwib3MiLCJpc1dpbmRvd3MiLCJpc0xpbnV4IiwiaXNPc3giLCJzdGRpbyIsIm5hbWUiLCJob21lIiwidG1wIiwidG1wZGlyIiwicGF0aHMiLCJtZXRlb3JEZXNrdG9wIiwicm9vdCIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJza2VsZXRvbiIsIm1ldGVvckFwcCIsImRlc2t0b3AiLCJyb290TmFtZSIsIm1vZHVsZXMiLCJpbXBvcnQiLCJhc3NldHMiLCJzZXR0aW5ncyIsInNwbGFzaFNjcmVlbiIsImxvYWRpbmdHaWYiLCJtZXRlb3JJY28iLCJlbGVjdHJvbkFwcCIsInRtcE5vZGVNb2R1bGVzIiwiY2FjaGUiLCJleHRyYWN0ZWROb2RlTW9kdWxlcyIsImV4dHJhY3RlZE5vZGVNb2R1bGVzQmluIiwiYXBwUm9vdCIsImFwcCIsImNvcmRvdmEiLCJpbmRleCIsInByZWxvYWQiLCJkZXNrdG9wQXNhciIsImV4dHJhY3RlZCIsImFwcEFzYXIiLCJwYWNrYWdlSnNvbiIsImRlc2t0b3BUbXAiLCJub2RlTW9kdWxlcyIsIm1ldGVvckFzYXIiLCJtZXRlb3JBcHBJbmRleCIsIm1ldGVvckFwcFByb2dyYW1Kc29uIiwicGxhdGZvcm1zIiwicGFja2FnZXMiLCJ2ZXJzaW9ucyIsInJlbGVhc2UiLCJnaXRJZ25vcmUiLCJjb3Jkb3ZhQnVpbGQiLCJ3ZWJDb3Jkb3ZhIiwiY29yZG92YUJ1aWxkSW5kZXgiLCJjb3Jkb3ZhQnVpbGRQcm9ncmFtSnNvbiIsIndlYkNvcmRvdmFQcm9ncmFtSnNvbiIsInBhY2thZ2VEaXIiLCJpbnN0YWxsZXJEaXIiLCJzY2FmZm9sZCIsInByb2R1Y3Rpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1h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VUFBWCxHQUF3QjtBQUNwQjVCLFlBQU12QixLQUFLLEtBQUtxQixLQUFMLENBQVdnQixXQUFYLENBQXVCZCxJQUE1QixFQUFrQyxXQUFsQztBQURjLEtBQXhCO0FBSUEsMkJBQVMsS0FBS0YsS0FBTCxDQUFXOEIsVUFBcEIsRUFBZ0M7QUFDNUJyQixlQUFTOUIsS0FBSyxLQUFLcUIsS0FBTCxDQUFXOEIsVUFBWCxDQUFzQjVCLElBQTNCLEVBQWlDLFNBQWpDLENBRG1CO0FBRTVCVSxnQkFBVWpDLEtBQUssS0FBS3FCLEtBQUwsQ0FBVzhCLFVBQVgsQ0FBc0I1QixJQUEzQixFQUFpQyxlQUFqQztBQUZrQixLQUFoQztBQUtBLFNBQUtGLEtBQUwsQ0FBVzZDLFVBQVgsR0FBd0Isa0JBQXhCO0FBQ0EsU0FBSzdDLEtBQUwsQ0FBVzhDLFlBQVgsR0FBMEIsb0JBQTFCLENBNUpnQyxDQThKaEM7O0FBQ0EsU0FBSzlDLEtBQUwsQ0FBVytDLFFBQVgsR0FBc0JwRSxLQUFLeUIsU0FBTCxFQUFnQixJQUFoQixFQUFzQixVQUF0QixDQUF0QjtBQUNIO0FBRUQ7Ozs7Ozs7O3dDQUlvQjtBQUNoQixhQUFPLENBQUMsRUFBRSxnQkFBZ0IsS0FBS3JCLE9BQXJCLElBQWdDLEtBQUtBLE9BQUwsQ0FBYWlFLFVBQS9DLENBQVI7QUFDSDs7Ozs7OztBQUdMQyxPQUFPQyxPQUFQLEdBQWlCdEUsR0FBakI7QUFFQTs7Ozs7Ozs7Ozs7Ozs7QUFjQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQkE7Ozs7Ozs7QUFPQTs7Ozs7O0FBTUEiLCJmaWxlIjoiZW52LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IGFzc2lnbkluIGZyb20gJ2xvZGFzaC9hc3NpZ25Jbic7XG5cbmNvbnN0IHsgam9pbiB9ID0gcGF0aDtcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBwcm9wZXJ0eSB7cGFja2FnZVBhdGhzfSBwYXRoc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnYge1xuICAgIGNvbnN0cnVjdG9yKGlucHV0LCBvdXRwdXQsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICBpZiAodGhpcy5pc1Byb2R1Y3Rpb25CdWlsZCgpKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9ICdwcm9kdWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3lzID0ge1xuICAgICAgICAgICAgcGxhdGZvcm06IHByb2Nlc3MucGxhdGZvcm0sXG4gICAgICAgICAgICBhcmNoOiBwcm9jZXNzLmFyY2hcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBPcGVyYXRpb25hbCBTeXN0ZW0uXG4gICAgICAgIHRoaXMub3MgPSB7XG4gICAgICAgICAgICBpc1dpbmRvd3M6IChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSxcbiAgICAgICAgICAgIGlzTGludXg6IChwcm9jZXNzLnBsYXRmb3JtID09PSAnbGludXgnKSxcbiAgICAgICAgICAgIGlzT3N4OiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpXG5cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zdGRpbyA9ICdpbmhlcml0JztcblxuICAgICAgICB0aGlzLm9zLm5hbWUgPSAodGhpcy5zeXMucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gJ29zeCcgOiB0aGlzLnN5cy5wbGF0Zm9ybSk7XG4gICAgICAgIHRoaXMub3MuaG9tZSA9IHByb2Nlc3MuZW52Wyh0aGlzLm9zLmlzV2luZG93cyA/ICdVU0VSUFJPRklMRScgOiAnSE9NRScpXTtcbiAgICAgICAgdGhpcy5vcy50bXAgPSBvcy50bXBkaXIoKTtcblxuICAgICAgICAvKiogQHR5cGUge3BhY2thZ2VQYXRoc30gKi9cbiAgICAgICAgdGhpcy5wYXRocyA9IHt9O1xuXG4gICAgICAgIC8qKiBAdHlwZSB7bWV0ZW9yRGVza3RvcFBhdGhzfSAqL1xuICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckRlc2t0b3AgPSB7XG4gICAgICAgICAgICByb290OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGF0aHMubWV0ZW9yRGVza3RvcC5za2VsZXRvbiA9IGpvaW4odGhpcy5wYXRocy5tZXRlb3JEZXNrdG9wLnJvb3QsICdza2VsZXRvbicpO1xuXG4gICAgICAgIC8qKiBAdHlwZSB7bWV0ZW9yQXBwUGF0aHN9ICovXG4gICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwID0ge1xuICAgICAgICAgICAgcm9vdDogaW5wdXRcbiAgICAgICAgfTtcblxuICAgICAgICAvKiogQHR5cGUge2Rlc2t0b3BQYXRoc30gKi9cbiAgICAgICAgdGhpcy5wYXRocy5kZXNrdG9wID0ge1xuICAgICAgICAgICAgcm9vdE5hbWU6ICcuZGVza3RvcCcsXG4gICAgICAgICAgICByb290OiBqb2luKHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsICcuZGVza3RvcCcpXG4gICAgICAgIH07XG5cbiAgICAgICAgYXNzaWduSW4odGhpcy5wYXRocy5kZXNrdG9wLCB7XG4gICAgICAgICAgICBtb2R1bGVzOiBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5yb290LCAnbW9kdWxlcycpLFxuICAgICAgICAgICAgaW1wb3J0OiBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5yb290LCAnaW1wb3J0JyksXG4gICAgICAgICAgICBhc3NldHM6IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLnJvb3QsICdhc3NldHMnKSxcbiAgICAgICAgICAgIHNldHRpbmdzOiBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5yb290LCAnc2V0dGluZ3MuanNvbicpLFxuICAgICAgICAgICAgZGVza3RvcDogam9pbih0aGlzLnBhdGhzLmRlc2t0b3Aucm9vdCwgJ2Rlc2t0b3AuanMnKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnBhdGhzLmRlc2t0b3Auc3BsYXNoU2NyZWVuID0gam9pbih0aGlzLnBhdGhzLmRlc2t0b3AuYXNzZXRzLCAnc3BsYXNoU2NyZWVuLnBuZycpO1xuICAgICAgICB0aGlzLnBhdGhzLmRlc2t0b3AubG9hZGluZ0dpZiA9IGpvaW4odGhpcy5wYXRocy5kZXNrdG9wLmFzc2V0cywgJ2xvYWRpbmcuZ2lmJyk7XG4gICAgICAgIHRoaXMucGF0aHMuZGVza3RvcC5tZXRlb3JJY28gPSBqb2luKHRoaXMucGF0aHMuZGVza3RvcC5hc3NldHMsICdtZXRlb3IuaWNvJyk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtlbGVjdHJvbkFwcFBhdGhzfSAqL1xuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwID0ge1xuICAgICAgICAgICAgcm9vdE5hbWU6ICdkZXNrdG9wLWJ1aWxkJyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290ID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3ROYW1lKTtcblxuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnRtcE5vZGVNb2R1bGVzID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAnLmRlc2t0b3Bfbm9kZV9tb2R1bGVzJyk7XG5cbiAgICAgICAgdGhpcy5wYXRocy5jYWNoZSA9XG4gICAgICAgICAgICBqb2luKHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsICcubWV0ZW9yJywgJ2xvY2FsJywgJ2Rlc2t0b3AtY2FjaGUnKTtcblxuICAgICAgICB0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAnLmRlc2t0b3BfZXh0cmFjdGVkX25vZGVfbW9kdWxlcycpO1xuXG4gICAgICAgIHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuZXh0cmFjdGVkTm9kZU1vZHVsZXNCaW4gPVxuICAgICAgICAgICAgam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmV4dHJhY3RlZE5vZGVNb2R1bGVzLCAnLmJpbicpO1xuXG5cbiAgICAgICAgdGhpcy5wYXRocy5lbGVjdHJvbkFwcC5hcHBSb290ID1cbiAgICAgICAgICAgIGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnYXBwJyk7XG5cbiAgICAgICAgYXNzaWduSW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcCwge1xuICAgICAgICAgICAgYXBwOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ2FwcC5qcycpLFxuICAgICAgICAgICAgY29yZG92YTogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QsICdjb3Jkb3ZhLmpzJyksXG4gICAgICAgICAgICBpbmRleDogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QsICdpbmRleC5qcycpLFxuICAgICAgICAgICAgcHJlbG9hZDogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLmFwcFJvb3QsICdwcmVsb2FkLmpzJyksXG4gICAgICAgICAgICBtb2R1bGVzOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAuYXBwUm9vdCwgJ21vZHVsZXMnKSxcbiAgICAgICAgICAgIGRlc2t0b3BBc2FyOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2Rlc2t0b3AuYXNhcicpLFxuICAgICAgICAgICAgZXh0cmFjdGVkOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2V4dHJhY3RlZCcpLFxuICAgICAgICAgICAgYXBwQXNhcjogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdhcHAuYXNhcicpLFxuICAgICAgICAgICAgaW1wb3J0OiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2ltcG9ydCcpLFxuICAgICAgICAgICAgYXNzZXRzOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2Fzc2V0cycpLFxuICAgICAgICAgICAgcGFja2FnZUpzb246IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAncGFja2FnZS5qc29uJyksXG4gICAgICAgICAgICBzZXR0aW5nczogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdzZXR0aW5ncy5qc29uJyksXG4gICAgICAgICAgICBkZXNrdG9wOiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ2Rlc2t0b3AuanMnKSxcbiAgICAgICAgICAgIGRlc2t0b3BUbXA6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnX19kZXNrdG9wJyksXG4gICAgICAgICAgICBub2RlTW9kdWxlczogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdub2RlX21vZHVsZXMnKSxcbiAgICAgICAgICAgIG1ldGVvckFzYXI6IGpvaW4odGhpcy5wYXRocy5lbGVjdHJvbkFwcC5yb290LCAnbWV0ZW9yLmFzYXInKSxcbiAgICAgICAgICAgIG1ldGVvckFwcDogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdtZXRlb3InKSxcbiAgICAgICAgICAgIG1ldGVvckFwcEluZGV4OiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ21ldGVvcicsICdpbmRleC5odG1sJyksXG4gICAgICAgICAgICBtZXRlb3JBcHBQcm9ncmFtSnNvbjogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdtZXRlb3InLCAncHJvZ3JhbS5qc29uJyksXG4gICAgICAgICAgICBza2VsZXRvbjogam9pbih0aGlzLnBhdGhzLmVsZWN0cm9uQXBwLnJvb3QsICdza2VsZXRvbicpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFzc2lnbkluKHRoaXMucGF0aHMubWV0ZW9yQXBwLCB7XG4gICAgICAgICAgICBwbGF0Zm9ybXM6IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAncGxhdGZvcm1zJyksXG4gICAgICAgICAgICBwYWNrYWdlczogam9pbih0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LCAnLm1ldGVvcicsICdwYWNrYWdlcycpLFxuICAgICAgICAgICAgdmVyc2lvbnM6IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAndmVyc2lvbnMnKSxcbiAgICAgICAgICAgIHJlbGVhc2U6IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJy5tZXRlb3InLCAncmVsZWFzZScpLFxuICAgICAgICAgICAgcGFja2FnZUpzb246IGpvaW4odGhpcy5wYXRocy5tZXRlb3JBcHAucm9vdCwgJ3BhY2thZ2UuanNvbicpLFxuICAgICAgICAgICAgZ2l0SWdub3JlOiBqb2luKHRoaXMucGF0aHMubWV0ZW9yQXBwLnJvb3QsICcubWV0ZW9yJywgJy5naXRpZ25vcmUnKSxcbiAgICAgICAgICAgIGNvcmRvdmFCdWlsZDogam9pbihcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LFxuICAgICAgICAgICAgICAgICcubWV0ZW9yJyxcbiAgICAgICAgICAgICAgICAnbG9jYWwnLFxuICAgICAgICAgICAgICAgICdjb3Jkb3ZhLWJ1aWxkJyxcbiAgICAgICAgICAgICAgICAnd3d3JyxcbiAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24nXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgd2ViQ29yZG92YTogam9pbihcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckFwcC5yb290LFxuICAgICAgICAgICAgICAgICcubWV0ZW9yJyxcbiAgICAgICAgICAgICAgICAnbG9jYWwnLFxuICAgICAgICAgICAgICAgICdidWlsZCcsXG4gICAgICAgICAgICAgICAgJ3Byb2dyYW1zJyxcbiAgICAgICAgICAgICAgICAnd2ViLmNvcmRvdmEnXG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFzc2lnbkluKHRoaXMucGF0aHMubWV0ZW9yQXBwLCB7XG4gICAgICAgICAgICBjb3Jkb3ZhQnVpbGRJbmRleDogam9pbihcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckFwcC5jb3Jkb3ZhQnVpbGQsICdpbmRleC5odG1sJ1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNvcmRvdmFCdWlsZFByb2dyYW1Kc29uOiBqb2luKFxuICAgICAgICAgICAgICAgIHRoaXMucGF0aHMubWV0ZW9yQXBwLmNvcmRvdmFCdWlsZCwgJ3Byb2dyYW0uanNvbidcbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXNzaWduSW4odGhpcy5wYXRocy5tZXRlb3JBcHAsIHtcbiAgICAgICAgICAgIHdlYkNvcmRvdmFQcm9ncmFtSnNvbjogam9pbihcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGhzLm1ldGVvckFwcC53ZWJDb3Jkb3ZhLCAncHJvZ3JhbS5qc29uJ1xuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8qKiBAdHlwZSB7ZGVza3RvcFRtcFBhdGhzfSAqL1xuICAgICAgICB0aGlzLnBhdGhzLmRlc2t0b3BUbXAgPSB7XG4gICAgICAgICAgICByb290OiBqb2luKHRoaXMucGF0aHMuZWxlY3Ryb25BcHAucm9vdCwgJ19fZGVza3RvcCcpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGFzc2lnbkluKHRoaXMucGF0aHMuZGVza3RvcFRtcCwge1xuICAgICAgICAgICAgbW9kdWxlczogam9pbih0aGlzLnBhdGhzLmRlc2t0b3BUbXAucm9vdCwgJ21vZHVsZXMnKSxcbiAgICAgICAgICAgIHNldHRpbmdzOiBqb2luKHRoaXMucGF0aHMuZGVza3RvcFRtcC5yb290LCAnc2V0dGluZ3MuanNvbicpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGF0aHMucGFja2FnZURpciA9ICcuZGVza3RvcC1wYWNrYWdlJztcbiAgICAgICAgdGhpcy5wYXRocy5pbnN0YWxsZXJEaXIgPSAnLmRlc2t0b3AtaW5zdGFsbGVyJztcblxuICAgICAgICAvLyBTY2FmZm9sZFxuICAgICAgICB0aGlzLnBhdGhzLnNjYWZmb2xkID0gam9pbihfX2Rpcm5hbWUsICcuLicsICdzY2FmZm9sZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufCp9XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGlzUHJvZHVjdGlvbkJ1aWxkKCkge1xuICAgICAgICByZXR1cm4gISEoJ3Byb2R1Y3Rpb24nIGluIHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMucHJvZHVjdGlvbik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBkZXNrdG9wUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290TmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJvb3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaW1wb3J0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXNzZXRzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2V0dGluZ3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBkZXNrdG9wXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3BsYXNoU2NyZWVuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbG9hZGluZ0dpZlxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckljb1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gbWV0ZW9yQXBwUGF0aHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290XG4gKiBAcHJvcGVydHkge3N0cmluZ30gcGxhdGZvcm1zXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcmVsZWFzZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHBhY2thZ2VzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdmVyc2lvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBnaXRJZ25vcmVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwYWNrYWdlSnNvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNvcmRvdmFCdWlsZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNvcmRvdmFCdWlsZEluZGV4XG4gKiBAcHJvcGVydHkge3N0cmluZ30gY29yZG92YUJ1aWxkUHJvZ3JhbUpzb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB3ZWJDb3Jkb3ZhXG4gKiBAcHJvcGVydHkge3N0cmluZ30gd2ViQ29yZG92YUluZGV4XG4gKiBAcHJvcGVydHkge3N0cmluZ30gd2ViQ29yZG92YVByb2dyYW1Kc29uXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBlbGVjdHJvbkFwcFBhdGhzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcm9vdE5hbWVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByb290XG4gKiBAcHJvcGVydHkge09iamVjdH0gYXBwUm9vdFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGFwcFJvb3QuY29yZG92YVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGFwcFJvb3QuaW5kZXhcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBhcHBSb290LmFwcFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGFwcFJvb3QubW9kdWxlc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGRlc2t0b3BBc2FyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXh0cmFjdGVkXG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBwQXNhclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByZWxvYWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpbXBvcnRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBhc3NldHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBnaXRJZ25vcmVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwYWNrYWdlSnNvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNldHRpbmdzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZGVza3RvcFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGRlc2t0b3BUbXBcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBub2RlTW9kdWxlc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckFzYXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtZXRlb3JBcHBcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtZXRlb3JBcHBJbmRleFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG1ldGVvckFwcFByb2dyYW1Kc29uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2tlbGV0b25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0bXBOb2RlTW9kdWxlc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGV4dHJhY3RlZE5vZGVNb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXh0cmFjdGVkTm9kZU1vZHVsZXNCaW5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IGRlc2t0b3BUbXBQYXRoc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IHJvb3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtb2R1bGVzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2V0dGluZ3NcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IG1ldGVvckRlc2t0b3BQYXRoc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IHJvb3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBza2VsZXRvblxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gcGFja2FnZVBhdGhzXG4gKiBAcHJvcGVydHkge21ldGVvckFwcFBhdGhzfSBtZXRlb3JBcHBcbiAqIEBwcm9wZXJ0eSB7ZGVza3RvcFBhdGhzfSBkZXNrdG9wXG4gKiBAcHJvcGVydHkge2VsZWN0cm9uQXBwUGF0aHN9IGVsZWN0cm9uQXBwXG4gKiBAcHJvcGVydHkge2Rlc2t0b3BUbXBQYXRoc30gZGVza3RvcFRtcFxuICogQHByb3BlcnR5IHttZXRlb3JEZXNrdG9wUGF0aHN9IG1ldGVvckRlc2t0b3BcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwYWNrYWdlRGlyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc2NhZmZvbGRcbiAqL1xuIl19