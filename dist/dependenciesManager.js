"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runtime = _interopRequireDefault(require("regenerator-runtime/runtime"));

var _lodash = require("lodash");

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Utility class designed for merging dependencies list with simple validation and duplicate
 * detection.
 *
 * @class
 */
var DependenciesManager =
/*#__PURE__*/
function () {
  /**
   * @param {MeteorDesktop} $                   - context
   * @param {Object}        defaultDependencies - core dependencies list
   * @constructor
   */
  function DependenciesManager($, defaultDependencies) {
    _classCallCheck(this, DependenciesManager);

    this.log = new _log.default('dependenciesManager');
    this.$ = $;
    this.dependencies = defaultDependencies; // Regexes for matching certain types of dependencies version.
    // https://docs.npmjs.com/files/package.json#dependencies

    this.regexes = {
      local: /^(\.\.\/|~\/|\.\/|\/)/,
      git: /^git(\+(ssh|http)s?)?/,
      github: /^\w+-?\w+(?!-)\//,
      http: /^https?.+tar\.gz/,
      file: /^file:/
    }; // Check for commit hashes.

    var gitCheck = {
      type: 'regex',
      regex: /#[a-f0-9]{7,40}/,
      test: 'match',
      message: 'git or github link must have a commit hash'
    }; // Check for displaying warnings when npm package from local path is used.

    var localCheck = {
      onceName: 'localCheck',
      type: 'warning',
      message: 'using dependencies from local paths is permitted' + ' but dangerous - read more in README.md'
    };
    this.checks = {
      local: localCheck,
      file: localCheck,
      git: gitCheck,
      github: gitCheck,
      version: {
        type: 'regex',
        // Matches all the semver ranges operators, empty strings and `*`.
        regex: /[\^|><= ~-]|\.x|^$|^\*$/,
        test: 'do not match',
        message: 'semver ranges are forbidden, please specify exact version'
      }
    };
  }
  /**
   * Just a public getter.
   * @returns {Object}
   */


  _createClass(DependenciesManager, [{
    key: "getDependencies",
    value: function getDependencies() {
      return this.dependencies;
    }
    /**
     * Returns local dependencies.
     * @returns {Object}
     */

  }, {
    key: "getLocalDependencies",
    value: function getLocalDependencies() {
      var _this = this;

      return Object.keys(this.dependencies).filter(function (dependency) {
        return _this.regexes.local.test(_this.dependencies[dependency]) || _this.regexes.file.test(_this.dependencies[dependency]);
      }).reduce(function (localDependencies, currentDependency) {
        return Object.assign(localDependencies, {
          [currentDependency]: _this.dependencies[currentDependency]
        });
      }, {});
    }
    /**
     * Returns remote dependencies.
     * @returns {Object}
     */

  }, {
    key: "getRemoteDependencies",
    value: function getRemoteDependencies() {
      var _this2 = this;

      return Object.keys(this.dependencies).filter(function (dependency) {
        return !_this2.regexes.local.test(_this2.dependencies[dependency]) && !_this2.regexes.file.test(_this2.dependencies[dependency]);
      }).reduce(function (localDependencies, currentDependency) {
        return Object.assign(localDependencies, {
          [currentDependency]: _this2.dependencies[currentDependency]
        });
      }, {});
    }
    /**
     * Merges dependencies into one list.
     *
     * @param {string} from         - describes where the dependencies were set
     * @param {Object} dependencies - dependencies list
     */

  }, {
    key: "mergeDependencies",
    value: function mergeDependencies(from, dependencies) {
      if (this.validateDependenciesVersions(from, dependencies)) {
        this.detectDuplicatedDependencies(from, dependencies);
        (0, _lodash.assignIn)(this.dependencies, dependencies);
      }
    }
    /**
     * Detects dependency version type.
     * @param {string} version - version string of the dependency
     * @return {string}
     */

  }, {
    key: "detectDependencyVersionType",
    value: function detectDependencyVersionType(version) {
      var _this3 = this;

      var type = Object.keys(this.regexes).find(function (dependencyType) {
        return _this3.regexes[dependencyType].test(version);
      });
      return type || 'version';
    }
    /**
     * Validates semver and detect ranges.
     *
     * @param {string} from         - describes where the dependencies were set
     * @param {Object} dependencies - dependencies list
     */

  }, {
    key: "validateDependenciesVersions",
    value: function validateDependenciesVersions(from, dependencies) {
      var _this4 = this;

      var warningsShown = {};
      (0, _lodash.forEach)(dependencies, function (version, name) {
        var type = _this4.detectDependencyVersionType(version);

        if (_this4.checks[type]) {
          var check = _this4.checks[type];

          if (check.type === 'regex') {
            var checkResult = check.test === 'match' ? _this4.checks[type].regex.test(version) : !_this4.checks[type].regex.test(version);

            if (!checkResult) {
              throw new Error(`dependency ${name}:${version} from ${from} failed version ` + `check with message: ${_this4.checks[type].message}`);
            }
          }

          if (check.type === 'warning' && !warningsShown[check.onceName]) {
            warningsShown[check.onceName] = true;

            _this4.log.warn(`dependency ${name}:${version} from ${from} caused a` + ` warning: ${check.message}`);
          }
        }
      });
      return true;
    }
    /**
     * Detects duplicates.
     *
     * @param {string} from         - describes where the dependencies were set
     * @param {Object} dependencies - dependencies list
     */

  }, {
    key: "detectDuplicatedDependencies",
    value: function detectDuplicatedDependencies(from, dependencies) {
      var _this5 = this;

      var duplicates = (0, _lodash.intersection)(Object.keys(dependencies), Object.keys(this.dependencies));

      if (duplicates.length > 0) {
        duplicates.forEach(function (name) {
          if (dependencies[name] !== _this5.dependencies[name]) {
            throw new Error(`While processing dependencies from ${from}, a dependency ` + `${name}: ${dependencies[name]} was found to be conflicting with a ` + `dependency (${_this5.dependencies[name]}) that was already declared in ` + 'other module or it is used in core of the electron app.');
          }
        });
      }
    }
  }]);

  return DependenciesManager;
}();

exports.default = DependenciesManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9kZXBlbmRlbmNpZXNNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIkRlcGVuZGVuY2llc01hbmFnZXIiLCIkIiwiZGVmYXVsdERlcGVuZGVuY2llcyIsImxvZyIsImRlcGVuZGVuY2llcyIsInJlZ2V4ZXMiLCJsb2NhbCIsImdpdCIsImdpdGh1YiIsImh0dHAiLCJmaWxlIiwiZ2l0Q2hlY2siLCJ0eXBlIiwicmVnZXgiLCJ0ZXN0IiwibWVzc2FnZSIsImxvY2FsQ2hlY2siLCJvbmNlTmFtZSIsImNoZWNrcyIsInZlcnNpb24iLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwiZGVwZW5kZW5jeSIsInJlZHVjZSIsImxvY2FsRGVwZW5kZW5jaWVzIiwiY3VycmVudERlcGVuZGVuY3kiLCJhc3NpZ24iLCJmcm9tIiwidmFsaWRhdGVEZXBlbmRlbmNpZXNWZXJzaW9ucyIsImRldGVjdER1cGxpY2F0ZWREZXBlbmRlbmNpZXMiLCJmaW5kIiwiZGVwZW5kZW5jeVR5cGUiLCJ3YXJuaW5nc1Nob3duIiwibmFtZSIsImRldGVjdERlcGVuZGVuY3lWZXJzaW9uVHlwZSIsImNoZWNrIiwiY2hlY2tSZXN1bHQiLCJFcnJvciIsIndhcm4iLCJkdXBsaWNhdGVzIiwibGVuZ3RoIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7O0FBRUE7Ozs7OztJQU1xQkEsbUI7OztBQUNqQjs7Ozs7QUFLQSwrQkFBWUMsQ0FBWixFQUFlQyxtQkFBZixFQUFvQztBQUFBOztBQUNoQyxTQUFLQyxHQUFMLEdBQVcsaUJBQVEscUJBQVIsQ0FBWDtBQUNBLFNBQUtGLENBQUwsR0FBU0EsQ0FBVDtBQUNBLFNBQUtHLFlBQUwsR0FBb0JGLG1CQUFwQixDQUhnQyxDQUtoQztBQUNBOztBQUNBLFNBQUtHLE9BQUwsR0FBZTtBQUNYQyxhQUFPLHVCQURJO0FBRVhDLFdBQUssdUJBRk07QUFHWEMsY0FBUSxrQkFIRztBQUlYQyxZQUFNLGtCQUpL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QU1vQyxhQUFhLDBCQUFhcEIsT0FBT0MsSUFBUCxDQUFZakIsWUFBWixDQUFiLEVBQXdDZ0IsT0FBT0MsSUFBUCxDQUFZLEtBQUtqQixZQUFqQixDQUF4QyxDQUFuQjs7QUFDQSxVQUFJb0MsV0FBV0MsTUFBWCxHQUFvQixDQUF4QixFQUEyQjtBQUN2QkQsbUJBQVdFLE9BQVgsQ0FBbUIsVUFBQ1IsSUFBRCxFQUFVO0FBQ3pCLGNBQUk5QixhQUFhOEIsSUFBYixNQUF1QixPQUFLOUIsWUFBTCxDQUFrQjhCLElBQWxCLENBQTNCLEVBQW9EO0FBQ2hELGtCQUFNLElBQUlJLEtBQUosQ0FBVyxzQ0FBcUNWLElBQUssaUJBQTNDLEdBQ1gsR0FBRU0sSUFBSyxLQUFJOUIsYUFBYThCLElBQWIsQ0FBbUIsc0NBRG5CLEdBRVgsZUFBYyxPQUFLOUIsWUFBTCxDQUFrQjhCLElBQWxCLENBQXdCLGlDQUYzQixHQUdaLHlEQUhFLENBQU47QUFJSDtBQUNKLFNBUEQ7QUFRSDtBQUNKIiwiZmlsZSI6ImRlcGVuZGVuY2llc01hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbmltcG9ydCByZWdlbmVyYXRvclJ1bnRpbWUgZnJvbSAncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJztcbmltcG9ydCB7IGZvckVhY2gsIGFzc2lnbkluLCBpbnRlcnNlY3Rpb24gfSBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgTG9nIGZyb20gJy4vbG9nJztcblxuLyoqXG4gKiBVdGlsaXR5IGNsYXNzIGRlc2lnbmVkIGZvciBtZXJnaW5nIGRlcGVuZGVuY2llcyBsaXN0IHdpdGggc2ltcGxlIHZhbGlkYXRpb24gYW5kIGR1cGxpY2F0ZVxuICogZGV0ZWN0aW9uLlxuICpcbiAqIEBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXBlbmRlbmNpZXNNYW5hZ2VyIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01ldGVvckRlc2t0b3B9ICQgICAgICAgICAgICAgICAgICAgLSBjb250ZXh0XG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgICBkZWZhdWx0RGVwZW5kZW5jaWVzIC0gY29yZSBkZXBlbmRlbmNpZXMgbGlzdFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQsIGRlZmF1bHREZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5sb2cgPSBuZXcgTG9nKCdkZXBlbmRlbmNpZXNNYW5hZ2VyJyk7XG4gICAgICAgIHRoaXMuJCA9ICQ7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVmYXVsdERlcGVuZGVuY2llcztcblxuICAgICAgICAvLyBSZWdleGVzIGZvciBtYXRjaGluZyBjZXJ0YWluIHR5cGVzIG9mIGRlcGVuZGVuY2llcyB2ZXJzaW9uLlxuICAgICAgICAvLyBodHRwczovL2RvY3MubnBtanMuY29tL2ZpbGVzL3BhY2thZ2UuanNvbiNkZXBlbmRlbmNpZXNcbiAgICAgICAgdGhpcy5yZWdleGVzID0ge1xuICAgICAgICAgICAgbG9jYWw6IC9eKFxcLlxcLlxcL3x+XFwvfFxcLlxcL3xcXC8pLyxcbiAgICAgICAgICAgIGdpdDogL15naXQoXFwrKHNzaHxodHRwKXM/KT8vLFxuICAgICAgICAgICAgZ2l0aHViOiAvXlxcdystP1xcdysoPyEtKVxcLy8sXG4gICAgICAgICAgICBodHRwOiAvXmh0dHBzPy4rdGFyXFwuZ3ovLFxuICAgICAgICAgICAgZmlsZTogL15maWxlOi9cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgY29tbWl0IGhhc2hlcy5cbiAgICAgICAgY29uc3QgZ2l0Q2hlY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAncmVnZXgnLFxuICAgICAgICAgICAgcmVnZXg6IC8jW2EtZjAtOV17Nyw0MH0vLFxuICAgICAgICAgICAgdGVzdDogJ21hdGNoJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdnaXQgb3IgZ2l0aHViIGxpbmsgbXVzdCBoYXZlIGEgY29tbWl0IGhhc2gnXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGRpc3BsYXlpbmcgd2FybmluZ3Mgd2hlbiBucG0gcGFja2FnZSBmcm9tIGxvY2FsIHBhdGggaXMgdXNlZC5cbiAgICAgICAgY29uc3QgbG9jYWxDaGVjayA9IHtcbiAgICAgICAgICAgIG9uY2VOYW1lOiAnbG9jYWxDaGVjaycsXG4gICAgICAgICAgICB0eXBlOiAnd2FybmluZycsXG4gICAgICAgICAgICBtZXNzYWdlOiAndXNpbmcgZGVwZW5kZW5jaWVzIGZyb20gbG9jYWwgcGF0aHMgaXMgcGVybWl0dGVkJyArXG4gICAgICAgICAgICAnIGJ1dCBkYW5nZXJvdXMgLSByZWFkIG1vcmUgaW4gUkVBRE1FLm1kJ1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2hlY2tzID0ge1xuICAgICAgICAgICAgbG9jYWw6IGxvY2FsQ2hlY2ssXG4gICAgICAgICAgICBmaWxlOiBsb2NhbENoZWNrLFxuICAgICAgICAgICAgZ2l0OiBnaXRDaGVjayxcbiAgICAgICAgICAgIGdpdGh1YjogZ2l0Q2hlY2ssXG4gICAgICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JlZ2V4JyxcbiAgICAgICAgICAgICAgICAvLyBNYXRjaGVzIGFsbCB0aGUgc2VtdmVyIHJhbmdlcyBvcGVyYXRvcnMsIGVtcHR5IHN0cmluZ3MgYW5kIGAqYC5cbiAgICAgICAgICAgICAgICByZWdleDogL1tcXF58Pjw9IH4tXXxcXC54fF4kfF5cXCokLyxcbiAgICAgICAgICAgICAgICB0ZXN0OiAnZG8gbm90IG1hdGNoJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnc2VtdmVyIHJhbmdlcyBhcmUgZm9yYmlkZGVuLCBwbGVhc2Ugc3BlY2lmeSBleGFjdCB2ZXJzaW9uJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEp1c3QgYSBwdWJsaWMgZ2V0dGVyLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RGVwZW5kZW5jaWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBsb2NhbCBkZXBlbmRlbmNpZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRMb2NhbERlcGVuZGVuY2llcygpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdFxuICAgICAgICAgICAgLmtleXModGhpcy5kZXBlbmRlbmNpZXMpXG4gICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY3kgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdleGVzLmxvY2FsLnRlc3QodGhpcy5kZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV0pIHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnZXhlcy5maWxlLnRlc3QodGhpcy5kZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVkdWNlKFxuICAgICAgICAgICAgICAgIChsb2NhbERlcGVuZGVuY2llcywgY3VycmVudERlcGVuZGVuY3kpID0+XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERlcGVuZGVuY2llcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgW2N1cnJlbnREZXBlbmRlbmN5XTogdGhpcy5kZXBlbmRlbmNpZXNbY3VycmVudERlcGVuZGVuY3ldIH1cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHJlbW90ZSBkZXBlbmRlbmNpZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRSZW1vdGVEZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKHRoaXMuZGVwZW5kZW5jaWVzKVxuICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5ID0+XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnJlZ2V4ZXMubG9jYWwudGVzdCh0aGlzLmRlcGVuZGVuY2llc1tkZXBlbmRlbmN5XSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMucmVnZXhlcy5maWxlLnRlc3QodGhpcy5kZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVkdWNlKFxuICAgICAgICAgICAgICAgIChsb2NhbERlcGVuZGVuY2llcywgY3VycmVudERlcGVuZGVuY3kpID0+XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERlcGVuZGVuY2llcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgW2N1cnJlbnREZXBlbmRlbmN5XTogdGhpcy5kZXBlbmRlbmNpZXNbY3VycmVudERlcGVuZGVuY3ldIH1cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXJnZXMgZGVwZW5kZW5jaWVzIGludG8gb25lIGxpc3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZnJvbSAgICAgICAgIC0gZGVzY3JpYmVzIHdoZXJlIHRoZSBkZXBlbmRlbmNpZXMgd2VyZSBzZXRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVwZW5kZW5jaWVzIC0gZGVwZW5kZW5jaWVzIGxpc3RcbiAgICAgKi9cbiAgICBtZXJnZURlcGVuZGVuY2llcyhmcm9tLCBkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVEZXBlbmRlbmNpZXNWZXJzaW9ucyhmcm9tLCBkZXBlbmRlbmNpZXMpKSB7XG4gICAgICAgICAgICB0aGlzLmRldGVjdER1cGxpY2F0ZWREZXBlbmRlbmNpZXMoZnJvbSwgZGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIGFzc2lnbkluKHRoaXMuZGVwZW5kZW5jaWVzLCBkZXBlbmRlbmNpZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0cyBkZXBlbmRlbmN5IHZlcnNpb24gdHlwZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvbiAtIHZlcnNpb24gc3RyaW5nIG9mIHRoZSBkZXBlbmRlbmN5XG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIGRldGVjdERlcGVuZGVuY3lWZXJzaW9uVHlwZSh2ZXJzaW9uKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBPYmplY3Qua2V5cyh0aGlzLnJlZ2V4ZXMpXG4gICAgICAgICAgICAuZmluZChkZXBlbmRlbmN5VHlwZSA9PiB0aGlzLnJlZ2V4ZXNbZGVwZW5kZW5jeVR5cGVdLnRlc3QodmVyc2lvbikpO1xuICAgICAgICByZXR1cm4gdHlwZSB8fCAndmVyc2lvbic7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIHNlbXZlciBhbmQgZGV0ZWN0IHJhbmdlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tICAgICAgICAgLSBkZXNjcmliZXMgd2hlcmUgdGhlIGRlcGVuZGVuY2llcyB3ZXJlIHNldFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXBlbmRlbmNpZXMgLSBkZXBlbmRlbmNpZXMgbGlzdFxuICAgICAqL1xuICAgIHZhbGlkYXRlRGVwZW5kZW5jaWVzVmVyc2lvbnMoZnJvbSwgZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzU2hvd24gPSB7fTtcbiAgICAgICAgZm9yRWFjaChkZXBlbmRlbmNpZXMsICh2ZXJzaW9uLCBuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gdGhpcy5kZXRlY3REZXBlbmRlbmN5VmVyc2lvblR5cGUodmVyc2lvbik7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja3NbdHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVjayA9IHRoaXMuY2hlY2tzW3R5cGVdO1xuICAgICAgICAgICAgICAgIGlmIChjaGVjay50eXBlID09PSAncmVnZXgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrUmVzdWx0ID0gY2hlY2sudGVzdCA9PT0gJ21hdGNoJyA/XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrc1t0eXBlXS5yZWdleC50ZXN0KHZlcnNpb24pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICF0aGlzLmNoZWNrc1t0eXBlXS5yZWdleC50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNoZWNrUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGRlcGVuZGVuY3kgJHtuYW1lfToke3ZlcnNpb259IGZyb20gJHtmcm9tfSBmYWlsZWQgdmVyc2lvbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgY2hlY2sgd2l0aCBtZXNzYWdlOiAke3RoaXMuY2hlY2tzW3R5cGVdLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrLnR5cGUgPT09ICd3YXJuaW5nJyAmJiAhd2FybmluZ3NTaG93bltjaGVjay5vbmNlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgd2FybmluZ3NTaG93bltjaGVjay5vbmNlTmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy53YXJuKGBkZXBlbmRlbmN5ICR7bmFtZX06JHt2ZXJzaW9ufSBmcm9tICR7ZnJvbX0gY2F1c2VkIGFgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAgd2FybmluZzogJHtjaGVjay5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVjdHMgZHVwbGljYXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tICAgICAgICAgLSBkZXNjcmliZXMgd2hlcmUgdGhlIGRlcGVuZGVuY2llcyB3ZXJlIHNldFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZXBlbmRlbmNpZXMgLSBkZXBlbmRlbmNpZXMgbGlzdFxuICAgICAqL1xuICAgIGRldGVjdER1cGxpY2F0ZWREZXBlbmRlbmNpZXMoZnJvbSwgZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIGNvbnN0IGR1cGxpY2F0ZXMgPSBpbnRlcnNlY3Rpb24oT2JqZWN0LmtleXMoZGVwZW5kZW5jaWVzKSwgT2JqZWN0LmtleXModGhpcy5kZXBlbmRlbmNpZXMpKTtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZHVwbGljYXRlcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRlcGVuZGVuY2llc1tuYW1lXSAhPT0gdGhpcy5kZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaGlsZSBwcm9jZXNzaW5nIGRlcGVuZGVuY2llcyBmcm9tICR7ZnJvbX0sIGEgZGVwZW5kZW5jeSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke25hbWV9OiAke2RlcGVuZGVuY2llc1tuYW1lXX0gd2FzIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nIHdpdGggYSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBkZXBlbmRlbmN5ICgke3RoaXMuZGVwZW5kZW5jaWVzW25hbWVdfSkgdGhhdCB3YXMgYWxyZWFkeSBkZWNsYXJlZCBpbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdvdGhlciBtb2R1bGUgb3IgaXQgaXMgdXNlZCBpbiBjb3JlIG9mIHRoZSBlbGVjdHJvbiBhcHAuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=