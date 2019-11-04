"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable no-console */

/*
 0.OFF
 1.INFO
 2.WARN
 3.ERROR
 4.TRACE
 5.DEBUG
 6.ALL
 */
var Log =
/*#__PURE__*/
function () {
  function Log(prefix) {
    _classCallCheck(this, Log);

    this.prefix = prefix;
  }

  _createClass(Log, [{
    key: "log",
    value: function log(type, args) {
      console.log.apply(null, [`${type}  ${this.prefix}: `].concat(Log.slice(args)));
    }
  }, {
    key: "info",
    value: function info() {
      if (/INFO|ALL/i.test(Log.level())) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this.log('INFO', args);
      }
    }
  }, {
    key: "warn",
    value: function warn() {
      if (/WARN|ALL/i.test(Log.level())) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        this.log('WARN', args);
      }
    }
  }, {
    key: "error",
    value: function error() {
      if (/ERROR|ALL/i.test(Log.level())) {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        this.log('ERROR', args);
      }
    }
  }, {
    key: "debug",
    value: function debug() {
      if (/DEBUG|ALL/i.test(Log.level())) {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        this.log('DEBUG', args);
      }
    }
  }, {
    key: "verbose",
    value: function verbose() {
      if (/VERBOSE|ALL/i.test(Log.level())) {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        this.log('VERBOSE', args);
      }
    }
  }, {
    key: "trace",
    value: function trace() {
      if (/TRACE|ALL/i.test(Log.level())) {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        this.log('TRACE', args);
      }
    }
  }], [{
    key: "level",
    value: function level() {
      return process.env.MD_LOG_LEVEL || 'ALL';
    }
  }, {
    key: "slice",
    value: function slice(args) {
      return Array.prototype.slice.call(args, 0);
    }
  }]);

  return Log;
}();

exports.default = Log;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9sb2cuanMiXSwibmFtZXMiOlsiTG9nIiwicHJlZml4IiwidHlwZSIsImFyZ3MiLCJjb25zb2xlIiwibG9nIiwiYXBwbHkiLCJjb25jYXQiLCJzbGljZSIsInRlc3QiLCJsZXZlbCIsInByb2Nlc3MiLCJlbnYiLCJNRF9MT0dfTEVWRUwiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7Ozs7O0lBVXFCQSxHOzs7QUFDakIsZUFBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNoQixTQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDSDs7Ozt3QkFVR0MsSSxFQUFNQyxJLEVBQU07QUFDWkMsY0FBUUMsR0FBUixDQUFZQyxLQUFaLENBQWtCLElBQWxCLEVBQXdCLENBQUUsR0FBRUosSUFBSyxLQUFJLEtBQUtELE1BQU8sSUFBekIsRUFBOEJNLE1BQTlCLENBQXFDUCxJQUFJUSxLQUFKLENBQVVMLElBQVYsQ0FBckMsQ0FBeEI7QUFDSDs7OzJCQUVhO0FBQ1YsVUFBSSxZQUFZTSxJQUFaLENBQWlCVCxJQUFJVSxLQUFKLEVBQWpCLENBQUosRUFBbUM7QUFBQSwwQ0FEL0JQLElBQytCO0FBRC9CQSxjQUMrQjtBQUFBOztBQUMvQixhQUFLRSxHQUFMLENBQVMsTUFBVCxFQUFpQkYsSUFBakI7QUFDSDtBQUNKOzs7MkJBRWE7QUFDVixVQUFJLFlBQVlNLElBQVosQ0FBaUJULElBQUlVLEtBQUosRUFBakIsQ0FBSixFQUFtQztBQUFBLDJDQUQvQlAsSUFDK0I7QUFEL0JBLGNBQytCO0FBQUE7O0FBQy9CLGFBQUtFLEdBQUwsQ0FBUyxNQUFULEVBQWlCRixJQUFqQjtBQUNIO0FBQ0o7Ozs0QkFFYztBQUNYLFVBQUksYUFBYU0sSUFBYixDQUFrQlQsSUFBSVUsS0FBSixFQUFsQixDQUFKLEVBQW9DO0FBQUEsMkNBRC9CUCxJQUMrQjtBQUQvQkEsY0FDK0I7QUFBQTs7QUFDaEMsYUFBS0UsR0FBTCxDQUFTLE9BQVQsRUFBa0JGLElBQWxCO0FBQ0g7QUFDSjs7OzRCQUVjO0FBQ1gsVUFBSSxhQUFhTSxJQUFiLENBQWtCVCxJQUFJVSxLQUFKLEVBQWxCLENBQUosRUFBb0M7QUFBQSwyQ0FEL0JQLElBQytCO0FBRC9CQSxjQUMrQjtBQUFBOztBQUNoQyxhQUFLRSxHQUFMLENBQVMsT0FBVCxFQUFrQkYsSUFBbEI7QUFDSDtBQUNKOzs7OEJBRWdCO0FBQ2IsVUFBSSxlQUFlTSxJQUFmLENBQW9CVCxJQUFJVSxLQUFKLEVBQXBCLENBQUosRUFBc0M7QUFBQSwyQ0FEL0JQLElBQytCO0FBRC9CQSxjQUMrQjtBQUFBOztBQUNsQyxhQUFLRSxHQUFMLENBQVMsU0FBVCxFQUFvQkYsSUFBcEI7QUFDSDtBQUNKOzs7NEJBRWM7QUFDWCxVQUFJLGFBQWFNLElBQWIsQ0FBa0JULElBQUlVLEtBQUosRUFBbEIsQ0FBSixFQUFvQztBQUFBLDJDQUQvQlAsSUFDK0I7QUFEL0JBLGNBQytCO0FBQUE7O0FBQ2hDLGFBQUtFLEdBQUwsQ0FBUyxPQUFULEVBQWtCRixJQUFsQjtBQUNIO0FBQ0o7Ozs0QkE5Q2M7QUFDWCxhQUFPUSxRQUFRQyxHQUFSLENBQVlDLFlBQVosSUFBNEIsS0FBbkM7QUFDSDs7OzBCQUVZVixJLEVBQU07QUFDZixhQUFPVyxNQUFNQyxTQUFOLENBQWdCUCxLQUFoQixDQUFzQlEsSUFBdEIsQ0FBMkJiLElBQTNCLEVBQWlDLENBQWpDLENBQVA7QUFDSCIsImZpbGUiOiJsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4vKlxuIDAuT0ZGXG4gMS5JTkZPXG4gMi5XQVJOXG4gMy5FUlJPUlxuIDQuVFJBQ0VcbiA1LkRFQlVHXG4gNi5BTExcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2cge1xuICAgIGNvbnN0cnVjdG9yKHByZWZpeCkge1xuICAgICAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB9XG5cbiAgICBzdGF0aWMgbGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5NRF9MT0dfTEVWRUwgfHwgJ0FMTCc7XG4gICAgfVxuXG4gICAgc3RhdGljIHNsaWNlKGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MsIDApO1xuICAgIH1cblxuICAgIGxvZyh0eXBlLCBhcmdzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KG51bGwsIFtgJHt0eXBlfSAgJHt0aGlzLnByZWZpeH06IGBdLmNvbmNhdChMb2cuc2xpY2UoYXJncykpKTtcbiAgICB9XG5cbiAgICBpbmZvKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKC9JTkZPfEFMTC9pLnRlc3QoTG9nLmxldmVsKCkpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZygnSU5GTycsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgd2FybiguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvV0FSTnxBTEwvaS50ZXN0KExvZy5sZXZlbCgpKSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ1dBUk4nLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVycm9yKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKC9FUlJPUnxBTEwvaS50ZXN0KExvZy5sZXZlbCgpKSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ0VSUk9SJywgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvREVCVUd8QUxML2kudGVzdChMb2cubGV2ZWwoKSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKCdERUJVRycsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmVyYm9zZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICgvVkVSQk9TRXxBTEwvaS50ZXN0KExvZy5sZXZlbCgpKSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ1ZFUkJPU0UnLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyYWNlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKC9UUkFDRXxBTEwvaS50ZXN0KExvZy5sZXZlbCgpKSkge1xuICAgICAgICAgICAgdGhpcy5sb2coJ1RSQUNFJywgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=