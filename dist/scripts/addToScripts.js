"use strict";

var _path = _interopRequireDefault(require("path"));

var _addScript = _interopRequireDefault(require("./utils/addScript"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */

/**
 * This script adds a 'desktop' entry to 'scripts' in package.json. If the entry already exists
 * it leaves it untouched.
 */
function fail() {
  console.error('[meteor-desktop] failed to add meteor-desktop to your package.json scripts, ' + 'please add it manually as \'desktop\': \'meteor-desktop\'');
  process.exit(0);
}

var packageJsonPath = _path.default.resolve(_path.default.join(__dirname, '..', '..', '..', '..', 'package.json'));

(0, _addScript.default)('desktop', 'meteor-desktop', packageJsonPath, fail);
console.log('[meteor-desktop] successfully added a \'desktop\' entry to your package.json' + ' scripts section.');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zY3JpcHRzL2FkZFRvU2NyaXB0cy5qcyJdLCJuYW1lcyI6WyJmYWlsIiwiY29uc29sZSIsImVycm9yIiwicHJvY2VzcyIsImV4aXQiLCJwYWNrYWdlSnNvblBhdGgiLCJyZXNvbHZlIiwiam9pbiIsIl9fZGlybmFtZSIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7QUFFQTs7OztBQUhBOztBQUlBOzs7O0FBSUEsU0FBU0EsSUFBVCxHQUFnQjtBQUNaQyxVQUFRQyxLQUFSLENBQWMsaUZBQ1YsMkRBREo7QUFFQUMsVUFBUUMsSUFBUixDQUFhLENBQWI7QUFDSDs7QUFFRCxJQUFNQyxrQkFBa0IsY0FBS0MsT0FBTCxDQUNwQixjQUFLQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsSUFBakMsRUFBdUMsSUFBdkMsRUFBNkMsY0FBN0MsQ0FEb0IsQ0FBeEI7O0FBSUEsd0JBQVUsU0FBVixFQUFxQixnQkFBckIsRUFBdUNILGVBQXZDLEVBQXdETCxJQUF4RDtBQUVBQyxRQUFRUSxHQUFSLENBQVksaUZBQ1IsbUJBREoiLCJmaWxlIjoiYWRkVG9TY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCBhZGRTY3JpcHQgZnJvbSAnLi91dGlscy9hZGRTY3JpcHQnO1xuLyoqXG4gKiBUaGlzIHNjcmlwdCBhZGRzIGEgJ2Rlc2t0b3AnIGVudHJ5IHRvICdzY3JpcHRzJyBpbiBwYWNrYWdlLmpzb24uIElmIHRoZSBlbnRyeSBhbHJlYWR5IGV4aXN0c1xuICogaXQgbGVhdmVzIGl0IHVudG91Y2hlZC5cbiAqL1xuZnVuY3Rpb24gZmFpbCgpIHtcbiAgICBjb25zb2xlLmVycm9yKCdbbWV0ZW9yLWRlc2t0b3BdIGZhaWxlZCB0byBhZGQgbWV0ZW9yLWRlc2t0b3AgdG8geW91ciBwYWNrYWdlLmpzb24gc2NyaXB0cywgJyArXG4gICAgICAgICdwbGVhc2UgYWRkIGl0IG1hbnVhbGx5IGFzIFxcJ2Rlc2t0b3BcXCc6IFxcJ21ldGVvci1kZXNrdG9wXFwnJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG5jb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJy4uJywgJy4uJywgJ3BhY2thZ2UuanNvbicpXG4pO1xuXG5hZGRTY3JpcHQoJ2Rlc2t0b3AnLCAnbWV0ZW9yLWRlc2t0b3AnLCBwYWNrYWdlSnNvblBhdGgsIGZhaWwpO1xuXG5jb25zb2xlLmxvZygnW21ldGVvci1kZXNrdG9wXSBzdWNjZXNzZnVsbHkgYWRkZWQgYSBcXCdkZXNrdG9wXFwnIGVudHJ5IHRvIHlvdXIgcGFja2FnZS5qc29uJyArXG4gICAgJyBzY3JpcHRzIHNlY3Rpb24uJyk7XG4iXX0=