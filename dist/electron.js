"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _crossSpawn = _interopRequireDefault(require("cross-spawn"));

var _log = _interopRequireDefault(require("./log"));

var _defaultDependencies = _interopRequireDefault(require("./defaultDependencies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Simple Electron runner. Runs the project with the bin provided by the 'electron' package.
 * @class
 */
var Electron =
/*#__PURE__*/
function () {
  function Electron($) {
    _classCallCheck(this, Electron);

    this.log = new _log.default('electron');
    this.$ = $;
  }

  _createClass(Electron, [{
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
                return this.$.getDependency('electron', _defaultDependencies.default.electron);

              case 2:
                this.electron = _context.sent;

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
  }, {
    key: "run",
    value: function run() {
      // Until: https://github.com/electron-userland/electron-prebuilt/pull/118
      var _process = process,
          env = _process.env;
      env.ELECTRON_ENV = 'development';
      var cmd = [];

      if (this.$.env.options.debug) {
        cmd.push('--debug=5858');
      }

      cmd.push('.');
      var child = (0, _crossSpawn.default)(this.electron.dependency, cmd, {
        cwd: this.$.env.paths.electronApp.root,
        env
      }); // TODO: check if we can configure piping in spawn options

      child.stdout.on('data', function (chunk) {
        process.stdout.write(chunk);
      });
      child.stderr.on('data', function (chunk) {
        process.stderr.write(chunk);
      });
    }
  }]);

  return Electron;
}();

exports.default = Electron;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9lbGVjdHJvbi5qcyJdLCJuYW1lcyI6WyJFbGVjdHJvbiIsIiQiLCJsb2ciLCJnZXREZXBlbmRlbmN5IiwiZWxlY3Ryb24iLCJwcm9jZXNzIiwiZW52IiwiRUxFQ1RST05fRU5WIiwiY21kIiwib3B0aW9ucyIsImRlYnVnIiwicHVzaCIsImNoaWxkIiwiZGVwZW5kZW5jeSIsImN3ZCIsInBhdGhzIiwiZWxlY3Ryb25BcHAiLCJyb290Iiwic3Rkb3V0Iiwib24iLCJjaHVuayIsIndyaXRlIiwic3RkZXJyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBOzs7O0lBSXFCQSxROzs7QUFDakIsb0JBQVlDLENBQVosRUFBZTtBQUFBOztBQUNYLFNBQUtDLEdBQUwsR0FBVyxpQkFBUSxVQUFSLENBQVg7QUFDQSxTQUFLRCxDQUFMLEdBQVNBLENBQVQ7QUFDSDs7Ozs7Ozs7Ozs7Ozt1QkFHeUIsS0FBS0EsQ0FBTCxDQUFPRSxhQUFQLENBQXFCLFVBQXJCLEVBQWlDLDZCQUFvQkMsUUFBckQsQzs7O0FBQXRCLHFCQUFLQSxROzs7Ozs7Ozs7Ozs7Ozs7OzBCQUdIO0FBQ0Y7QUFERSxxQkFFY0MsT0FGZDtBQUFBLFVBRU1DLEdBRk4sWUFFTUEsR0FGTjtBQUdGQSxVQUFJQyxZQUFKLEdBQW1CLGFBQW5CO0FBRUEsVUFBTUMsTUFBTSxFQUFaOztBQUVBLFVBQUksS0FBS1AsQ0FBTCxDQUFPSyxHQUFQLENBQVdHLE9BQVgsQ0FBbUJDLEtBQXZCLEVBQThCO0FBQzFCRixZQUFJRyxJQUFKLENBQVMsY0FBVDtBQUNIOztBQUVESCxVQUFJRyxJQUFKLENBQVMsR0FBVDtBQUVBLFVBQU1DLFFBQVEseUJBQU0sS0FBS1IsUUFBTCxDQUFjUyxVQUFwQixFQUFnQ0wsR0FBaEMsRUFBcUM7QUFDL0NNLGFBQUssS0FBS2IsQ0FBTCxDQUFPSyxHQUFQLENBQVdTLEtBQVgsQ0FBaUJDLFdBQWpCLENBQTZCQyxJQURhO0FBRS9DWDtBQUYrQyxPQUFyQyxDQUFkLENBYkUsQ0FrQkY7O0FBQ0FNLFlBQU1NLE1BQU4sQ0FBYUMsRUFBYixDQUFnQixNQUFoQixFQUF3QixVQUFDQyxLQUFELEVBQVc7QUFDL0JmLGdCQUFRYSxNQUFSLENBQWVHLEtBQWYsQ0FBcUJELEtBQXJCO0FBQ0gsT0FGRDtBQUdBUixZQUFNVSxNQUFOLENBQWFILEVBQWIsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBQ0MsS0FBRCxFQUFXO0FBQy9CZixnQkFBUWlCLE1BQVIsQ0FBZUQsS0FBZixDQUFxQkQsS0FBckI7QUFDSCxPQUZEO0FBR0giLCJmaWxlIjoiZWxlY3Ryb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVnZW5lcmF0b3JSdW50aW1lIGZyb20gJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZSc7XG5pbXBvcnQgc3Bhd24gZnJvbSAnY3Jvc3Mtc3Bhd24nO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBkZWZhdWx0RGVwZW5kZW5jaWVzIGZyb20gJy4vZGVmYXVsdERlcGVuZGVuY2llcyc7XG5cbi8qKlxuICogU2ltcGxlIEVsZWN0cm9uIHJ1bm5lci4gUnVucyB0aGUgcHJvamVjdCB3aXRoIHRoZSBiaW4gcHJvdmlkZWQgYnkgdGhlICdlbGVjdHJvbicgcGFja2FnZS5cbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVjdHJvbiB7XG4gICAgY29uc3RydWN0b3IoJCkge1xuICAgICAgICB0aGlzLmxvZyA9IG5ldyBMb2coJ2VsZWN0cm9uJyk7XG4gICAgICAgIHRoaXMuJCA9ICQ7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5lbGVjdHJvbiA9IGF3YWl0IHRoaXMuJC5nZXREZXBlbmRlbmN5KCdlbGVjdHJvbicsIGRlZmF1bHREZXBlbmRlbmNpZXMuZWxlY3Ryb24pO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgLy8gVW50aWw6IGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi11c2VybGFuZC9lbGVjdHJvbi1wcmVidWlsdC9wdWxsLzExOFxuICAgICAgICBjb25zdCB7IGVudiB9ID0gcHJvY2VzcztcbiAgICAgICAgZW52LkVMRUNUUk9OX0VOViA9ICdkZXZlbG9wbWVudCc7XG5cbiAgICAgICAgY29uc3QgY21kID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuJC5lbnYub3B0aW9ucy5kZWJ1Zykge1xuICAgICAgICAgICAgY21kLnB1c2goJy0tZGVidWc9NTg1OCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY21kLnB1c2goJy4nKTtcblxuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKHRoaXMuZWxlY3Ryb24uZGVwZW5kZW5jeSwgY21kLCB7XG4gICAgICAgICAgICBjd2Q6IHRoaXMuJC5lbnYucGF0aHMuZWxlY3Ryb25BcHAucm9vdCxcbiAgICAgICAgICAgIGVudlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiB3ZSBjYW4gY29uZmlndXJlIHBpcGluZyBpbiBzcGF3biBvcHRpb25zXG4gICAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoY2h1bmspO1xuICAgICAgICB9KTtcbiAgICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShjaHVuayk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==