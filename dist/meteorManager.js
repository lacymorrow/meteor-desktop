"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _fs = _interopRequireDefault(require("fs"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _log3 = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Utility class designed for managing Meteor packages.
 *
 * @property {MeteorDesktop} $
 * @class
 */
var MeteorManager =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $ - context
   * @constructor
   */
  function MeteorManager($) {
    _classCallCheck(this, MeteorManager);

    this.log = new _log3.default('meteorManager');
    this.$ = $;
  }
  /**
   * Looks for specified packages in .meteor/packages. In other words checks if the project has
   * specified packages added.
   * @param {Array} packages
   * @returns {boolean}
   */


  _createClass(MeteorManager, [{
    key: "checkPackages",
    value: function checkPackages(packages) {
      var usedPackages = _fs.default.readFileSync(this.$.env.paths.meteorApp.packages, 'UTF-8').replace(/\r/gm, '').split('\n').filter(function (line) {
        return !line.trim().startsWith('#');
      });

      return !packages.some(function (packageToFind) {
        return !usedPackages.some(function (meteorPackage) {
          return ~meteorPackage.indexOf(packageToFind);
        });
      });
    }
    /**
     * Looks for specified packages in .meteor/packages. In other words checks if the project has
     * specified packages added.
     * @param {Array} packages
     * @returns {boolean}
     */

  }, {
    key: "checkPackagesVersion",
    value: function checkPackagesVersion(packages) {
      var usedPackages = _fs.default.readFileSync(this.$.env.paths.meteorApp.versions, 'UTF-8').replace(/\r/gm, '').split('\n');

      return !packages.some(function (packageToFind) {
        return !usedPackages.some(function (meteorPackage) {
          return meteorPackage === packageToFind;
        });
      });
    }
    /**
     * Ensures certain packages are added to meteor project and in correct version.
     * @param {Array} packages
     * @param {Array} packagesWithVersion
     * @param {string} who - name of the entity that requests presence of thos packages (can be the
     *                       integration itself or a plugin)
     * @returns {Promise.<void>}
     */

  }, {
    key: "ensurePackages",
    value: function () {
      var _ensurePackages = _asyncToGenerator(
      /*#__PURE__*/
      _runtime.default.mark(function _callee(packages, packagesWithVersion, who) {
        return _runtime.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.checkPackages(packages)) {
                  _context.next = 10;
                  break;
                }

                this.log.warn(`${who} requires some packages that are not added to project, will try to add them now`);
                _context.prev = 2;
                _context.next = 5;
                return this.addPackages(packages, packagesWithVersion);

              case 5:
                _context.next = 10;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](2);
                throw new Error(_context.t0);

              case 10:
                if (this.checkPackagesVersion(packagesWithVersion)) {
                  _context.next = 20;
                  break;
                }

                this.log.warn(`${who} required packages version is different, fixing it`);
                _context.prev = 12;
                _context.next = 15;
                return this.addPackages(packages, packagesWithVersion);

              case 15:
                _context.next = 20;
                break;

              case 17:
                _context.prev = 17;
                _context.t1 = _context["catch"](12);
                throw new Error(_context.t1);

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 7], [12, 17]]);
      }));

      return function ensurePackages(_x, _x2, _x3) {
        return _ensurePackages.apply(this, arguments);
      };
    }()
    /**
     * Removes packages from the meteor app.
     * @param {Array} packages            - array with names of the packages to remove
     */

  }, {
    key: "deletePackages",
    value: function deletePackages(packages) {
      var _log,
          _this = this;

      (_log = this.log).warn.apply(_log, ['removing packages from meteor project'].concat(_toConsumableArray(packages)));

      return new Promise(function (resolve, reject) {
        (0, _crossSpawn.default)('meteor', ['remove'].concat(packages), {
          cwd: _this.$.env.paths.meteorApp.root,
          stdio: ['pipe', 'pipe', process.stderr],
          env: Object.assign({
            METEOR_PRETTY_OUTPUT: 0,
            METEOR_NO_RELEASE_CHECK: 1
          }, process.env)
        }).on('exit', function (code) {
          if (code !== 0 || _this.checkPackages(packages)) {
            reject('removing packages failed');
          } else {
            resolve();
          }
        });
      });
    }
    /**
     * Adds packages to the meteor app.
     * @param {Array} packages            - array with names of the packages to add
     * @param {Array} packagesWithVersion - array with names and versions of the packages to add
     */

  }, {
    key: "addPackages",
    value: function addPackages(packages, packagesWithVersion) {
      var _log2,
          _this2 = this;

      (_log2 = this.log).info.apply(_log2, ['adding packages to meteor project'].concat(_toConsumableArray(packagesWithVersion)));

      return new Promise(function (resolve, reject) {
        (0, _crossSpawn.default)('meteor', ['add'].concat(packagesWithVersion.map(function (packageName) {
          return packageName.replace('@', '@=');
        })), {
          cwd: _this2.$.env.paths.meteorApp.root,
          stdio: ['pipe', 'pipe', process.stderr],
          env: Object.assign({
            METEOR_PRETTY_OUTPUT: 0,
            METEOR_NO_RELEASE_CHECK: 1
          }, process.env)
        }).on('exit', function (code) {
          if (code !== 0 || !_this2.checkPackages(packages)) {
            reject('adding packages failed');
          } else {
            resolve();
          }
        });
      });
    }
  }]);

  return MeteorManager;
}();

exports.default = MeteorManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9tZXRlb3JNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIk1ldGVvck1hbmFnZXIiLCIkIiwibG9nIiwicGFja2FnZXMiLCJ1c2VkUGFja2FnZXMiLCJyZWFkRmlsZVN5bmMiLCJlbnYiLCJwYXRocyIsIm1ldGVvckFwcCIsInJlcGxhY2UiLCJzcGxpdCIsImZpbHRlciIsImxpbmUiLCJ0cmltIiwic3RhcnRzV2l0aCIsInNvbWUiLCJtZXRlb3JQYWNrYWdlIiwiaW5kZXhPZiIsInBhY2thZ2VUb0ZpbmQiLCJ2ZXJzaW9ucyIsInBhY2thZ2VzV2l0aFZlcnNpb24iLCJ3aG8iLCJjaGVja1BhY2thZ2VzIiwid2FybiIsImFkZFBhY2thZ2VzIiwiRXJyb3IiLCJjaGVja1BhY2thZ2VzVmVyc2lvbiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY29uY2F0IiwiY3dkIiwicm9vdCIsInN0ZGlvIiwicHJvY2VzcyIsInN0ZGVyciIsIk9iamVjdCIsImFzc2lnbiIsIk1FVEVPUl9QUkVUVFlfT1VUUFVUIiwiTUVURU9SX05PX1JFTEVBU0VfQ0hFQ0siLCJvbiIsImNvZGUiLCJpbmZvIiwibWFwIiwicGFja2FnZU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0lBTXFCQSxhOzs7QUFDakI7Ozs7QUFJQSx5QkFBWUMsQ0FBWixFQUFlO0FBQUE7O0FBQ1gsU0FBS0MsR0FBTCxHQUFXLGtCQUFRLGVBQVIsQ0FBWDtBQUNBLFNBQUtELENBQUwsR0FBU0EsQ0FBVDtBQUNIO0FBRUQ7Ozs7Ozs7Ozs7a0NBTWNFLFEsRUFBVTtBQUNwQixVQUFNQyxlQUFlLFlBQ2hCQyxZQURnQixDQUNILEtBQUtKLENBQUwsQ0FBT0ssR0FBUCxDQUFXQyxLQUFYLENBQWlCQyxTQUFqQixDQUEyQkwsUUFEeEIsRUFDa0MsT0FEbEMsRUFFaEJNLE9BRmdCLENBRVIsTUFGUSxFQUVBLEVBRkEsRUFH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Q0ksUUFESixFQUVJLENBQUMsS0FBRCxFQUFRQyxNQUFSLENBQ0lWLG9CQUFvQnVCLEdBQXBCLENBQXdCO0FBQUEsaUJBQWVDLFlBQVluQyxPQUFaLENBQW9CLEdBQXBCLEVBQXlCLElBQXpCLENBQWY7QUFBQSxTQUF4QixDQURKLENBRkosRUFLSTtBQUNJc0IsZUFBSyxPQUFLOUIsQ0FBTCxDQUFPSyxHQUFQLENBQVdDLEtBQVgsQ0FBaUJDLFNBQWpCLENBQTJCd0IsSUFEcEM7QUFFSUMsaUJBQU8sQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQkMsUUFBUUMsTUFBekIsQ0FGWDtBQUdJN0IsZUFBSzhCLE9BQU9DLE1BQVAsQ0FDRDtBQUFFQyxrQ0FBc0IsQ0FBeEI7QUFBMkJDLHFDQUF5QjtBQUFwRCxXQURDLEVBQ3dETCxRQUFRNUIsR0FEaEU7QUFIVCxTQUxKLEVBWUVrQyxFQVpGLENBWUssTUFaTCxFQVlhLFVBQUNDLElBQUQsRUFBVTtBQUNuQixjQUFJQSxTQUFTLENBQVQsSUFBYyxDQUFDLE9BQUtuQixhQUFMLENBQW1CbkIsUUFBbkIsQ0FBbkIsRUFBaUQ7QUFDN0MwQixtQkFBTyx3QkFBUDtBQUNILFdBRkQsTUFFTztBQUNIRDtBQUNIO0FBQ0osU0FsQkQ7QUFtQkgsT0FwQk0sQ0FBUDtBQXFCSCIsImZpbGUiOiJtZXRlb3JNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5pbXBvcnQgcmVnZW5lcmF0b3JSdW50aW1lIGZyb20gJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHNwYXduIGZyb20gJ2Nyb3NzLXNwYXduJztcblxuaW1wb3J0IExvZyBmcm9tICcuL2xvZyc7XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyBkZXNpZ25lZCBmb3IgbWFuYWdpbmcgTWV0ZW9yIHBhY2thZ2VzLlxuICpcbiAqIEBwcm9wZXJ0eSB7TWV0ZW9yRGVza3RvcH0gJFxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ldGVvck1hbmFnZXIge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWV0ZW9yRGVza3RvcH0gJCAtIGNvbnRleHRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkKSB7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IExvZygnbWV0ZW9yTWFuYWdlcicpO1xuICAgICAgICB0aGlzLiQgPSAkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvb2tzIGZvciBzcGVjaWZpZWQgcGFja2FnZXMgaW4gLm1ldGVvci9wYWNrYWdlcy4gSW4gb3RoZXIgd29yZHMgY2hlY2tzIGlmIHRoZSBwcm9qZWN0IGhhc1xuICAgICAqIHNwZWNpZmllZCBwYWNrYWdlcyBhZGRlZC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYWNrYWdlc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGNoZWNrUGFja2FnZXMocGFja2FnZXMpIHtcbiAgICAgICAgY29uc3QgdXNlZFBhY2thZ2VzID0gZnNcbiAgICAgICAgICAgIC5yZWFkRmlsZVN5bmModGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucGFja2FnZXMsICdVVEYtOCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxyL2dtLCAnJylcbiAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgIC5maWx0ZXIobGluZSA9PiAhbGluZS50cmltKCkuc3RhcnRzV2l0aCgnIycpKTtcbiAgICAgICAgcmV0dXJuICFwYWNrYWdlcy5zb21lKFxuICAgICAgICAgICAgcGFja2FnZVRvRmluZCA9PlxuICAgICAgICAgICAgICAgICF1c2VkUGFja2FnZXMuc29tZShtZXRlb3JQYWNrYWdlID0+IH5tZXRlb3JQYWNrYWdlLmluZGV4T2YocGFja2FnZVRvRmluZCkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9va3MgZm9yIHNwZWNpZmllZCBwYWNrYWdlcyBpbiAubWV0ZW9yL3BhY2thZ2VzLiBJbiBvdGhlciB3b3JkcyBjaGVja3MgaWYgdGhlIHByb2plY3QgaGFzXG4gICAgICogc3BlY2lmaWVkIHBhY2thZ2VzIGFkZGVkLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2hlY2tQYWNrYWdlc1ZlcnNpb24ocGFja2FnZXMpIHtcbiAgICAgICAgY29uc3QgdXNlZFBhY2thZ2VzID0gZnMucmVhZEZpbGVTeW5jKHRoaXMuJC5lbnYucGF0aHMubWV0ZW9yQXBwLnZlcnNpb25zLCAnVVRGLTgnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcci9nbSwgJycpXG4gICAgICAgICAgICAuc3BsaXQoJ1xcbicpO1xuICAgICAgICByZXR1cm4gIXBhY2thZ2VzLnNvbWUoXG4gICAgICAgICAgICBwYWNrYWdlVG9GaW5kID0+ICF1c2VkUGFja2FnZXMuc29tZShtZXRlb3JQYWNrYWdlID0+IG1ldGVvclBhY2thZ2UgPT09IHBhY2thZ2VUb0ZpbmQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5zdXJlcyBjZXJ0YWluIHBhY2thZ2VzIGFyZSBhZGRlZCB0byBtZXRlb3IgcHJvamVjdCBhbmQgaW4gY29ycmVjdCB2ZXJzaW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzXG4gICAgICogQHBhcmFtIHtBcnJheX0gcGFja2FnZXNXaXRoVmVyc2lvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3aG8gLSBuYW1lIG9mIHRoZSBlbnRpdHkgdGhhdCByZXF1ZXN0cyBwcmVzZW5jZSBvZiB0aG9zIHBhY2thZ2VzIChjYW4gYmUgdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIGludGVncmF0aW9uIGl0c2VsZiBvciBhIHBsdWdpbilcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48dm9pZD59XG4gICAgICovXG4gICAgYXN5bmMgZW5zdXJlUGFja2FnZXMocGFja2FnZXMsIHBhY2thZ2VzV2l0aFZlcnNpb24sIHdobykge1xuICAgICAgICBpZiAoIXRoaXMuY2hlY2tQYWNrYWdlcyhwYWNrYWdlcykpIHtcbiAgICAgICAgICAgIHRoaXMubG9nLndhcm4oYCR7d2hvfSByZXF1aXJlcyBzb21lIHBhY2thZ2VzIHRoYXQgYXJlIG5vdCBhZGRlZCB0byBwcm9qZWN0LCB3aWxsIHRyeSB0byBhZGQgdGhlbSBub3dgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRQYWNrYWdlcyhwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5jaGVja1BhY2thZ2VzVmVyc2lvbihwYWNrYWdlc1dpdGhWZXJzaW9uKSkge1xuICAgICAgICAgICAgdGhpcy5sb2cud2FybihgJHt3aG99IHJlcXVpcmVkIHBhY2thZ2VzIHZlcnNpb24gaXMgZGlmZmVyZW50LCBmaXhpbmcgaXRgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRQYWNrYWdlcyhwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBwYWNrYWdlcyBmcm9tIHRoZSBtZXRlb3IgYXBwLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBhY2thZ2VzICAgICAgICAgICAgLSBhcnJheSB3aXRoIG5hbWVzIG9mIHRoZSBwYWNrYWdlcyB0byByZW1vdmVcbiAgICAgKi9cbiAgICBkZWxldGVQYWNrYWdlcyhwYWNrYWdlcykge1xuICAgICAgICB0aGlzLmxvZy53YXJuKCdyZW1vdmluZyBwYWNrYWdlcyBmcm9tIG1ldGVvciBwcm9qZWN0JywgLi4ucGFja2FnZXMpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc3Bhd24oXG4gICAgICAgICAgICAgICAgJ21ldGVvcicsXG4gICAgICAgICAgICAgICAgWydyZW1vdmUnXS5jb25jYXQocGFja2FnZXMpLCB7XG4gICAgICAgICAgICAgICAgICAgIGN3ZDogdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCxcbiAgICAgICAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgcHJvY2Vzcy5zdGRlcnJdLFxuICAgICAgICAgICAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgICAgICAgICB7IE1FVEVPUl9QUkVUVFlfT1VUUFVUOiAwLCBNRVRFT1JfTk9fUkVMRUFTRV9DSEVDSzogMSB9LCBwcm9jZXNzLmVudlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgIT09IDAgfHwgdGhpcy5jaGVja1BhY2thZ2VzKHBhY2thZ2VzKSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ3JlbW92aW5nIHBhY2thZ2VzIGZhaWxlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBwYWNrYWdlcyB0byB0aGUgbWV0ZW9yIGFwcC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBwYWNrYWdlcyAgICAgICAgICAgIC0gYXJyYXkgd2l0aCBuYW1lcyBvZiB0aGUgcGFja2FnZXMgdG8gYWRkXG4gICAgICogQHBhcmFtIHtBcnJheX0gcGFja2FnZXNXaXRoVmVyc2lvbiAtIGFycmF5IHdpdGggbmFtZXMgYW5kIHZlcnNpb25zIG9mIHRoZSBwYWNrYWdlcyB0byBhZGRcbiAgICAgKi9cbiAgICBhZGRQYWNrYWdlcyhwYWNrYWdlcywgcGFja2FnZXNXaXRoVmVyc2lvbikge1xuICAgICAgICB0aGlzLmxvZy5pbmZvKCdhZGRpbmcgcGFja2FnZXMgdG8gbWV0ZW9yIHByb2plY3QnLCAuLi5wYWNrYWdlc1dpdGhWZXJzaW9uKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHNwYXduKFxuICAgICAgICAgICAgICAgICdtZXRlb3InLFxuICAgICAgICAgICAgICAgIFsnYWRkJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBwYWNrYWdlc1dpdGhWZXJzaW9uLm1hcChwYWNrYWdlTmFtZSA9PiBwYWNrYWdlTmFtZS5yZXBsYWNlKCdAJywgJ0A9JykpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGN3ZDogdGhpcy4kLmVudi5wYXRocy5tZXRlb3JBcHAucm9vdCxcbiAgICAgICAgICAgICAgICAgICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgcHJvY2Vzcy5zdGRlcnJdLFxuICAgICAgICAgICAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgICAgICAgICB7IE1FVEVPUl9QUkVUVFlfT1VUUFVUOiAwLCBNRVRFT1JfTk9fUkVMRUFTRV9DSEVDSzogMSB9LCBwcm9jZXNzLmVudlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgIT09IDAgfHwgIXRoaXMuY2hlY2tQYWNrYWdlcyhwYWNrYWdlcykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdhZGRpbmcgcGFja2FnZXMgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=