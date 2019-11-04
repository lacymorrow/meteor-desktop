#!/usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _assignIn = _interopRequireDefault(require("lodash/assignIn"));

var _commander = _interopRequireDefault(require("commander"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _ = _interopRequireDefault(require("../.."));

var _addScript = _interopRequireDefault(require("../scripts/utils/addScript"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable global-require */
var join = _path.default.join;
var cmd = process.argv[2];
/* eslint-disable no-console */

var _console = console,
    log = _console.log,
    error = _console.error,
    info = _console.info,
    warn = _console.warn;
/* eslint-enable no-console */

/**
 * Looks for .meteor directory.
 * @param {string} appPath - Meteor app path
 */

function isMeteorApp(appPath) {
  var meteorPath = join(appPath, '.meteor');

  try {
    return _fs.default.statSync(meteorPath).isDirectory();
  } catch (e) {
    return false;
  }
}
/**
 * Just ensures a ddp url is set.
 *
 * @param {string|null} ddpUrl - the url that Meteor app connects to
 * @returns {string|null}
 */


function getDdpUrl() {
  var ddpUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (!ddpUrl && _commander.default.buildMeteor) {
    info('no ddp_url specified, setting default: http://127.0.0.1:3000');
    return 'http://127.0.0.1:3000';
  }

  return ddpUrl;
} // --------------------------


function collect(val, memo) {
  memo.push(val);
  return memo;
}

_commander.default.option('-b, --build-meteor', 'runs meteor to obtain the mobile build, kills it after').option('-t, --build-timeout <timeout_in_sec>', 'timeout value when waiting for ' + 'meteor to build, default 600sec').option('-p, --port <port>', 'port on which meteor is running, when with -b this will be passed to meteor when obtaining the build').option('--production', 'builds meteor app with the production switch, uglifies contents ' + 'of .desktop, packs app to app.asar').option('-a, --android', 'force adding android as a mobile platform instead of ios').option('-s, --scaffold', 'will scaffold .desktop if not present').option('-i, --ignore-stderr [string]', 'only with -b, strings that when found will not terminate meteor build', collect, []).option('--meteor-settings <path>', 'only with -b, adds --settings options to meteor').option('--prod-debug', 'forces adding dev tools to a production build').option('--ia32', 'generate 32bit installer/package').option('--all-archs', 'generate 32bit and 64bit installers').option('--win', 'generate Windows installer').option('--linux', 'generate Linux installer').option('--mac', 'generate Mac installer').option('-d, --debug', 'run electron with debug switch');

_commander.default.usage('[command] [options]').version(require('./../../package.json').version, '-V, --version').on('--help', function () {
  log('  [ddp_url] - pass a ddp url if you want to use different one than used in meteor\'s --mobile-server');
  log('              this will also work with -b');
  log('    ');
  log('  Examples:');
  log('');
  log('   ', ['# cd into meteor dir first', 'cd /your/meteor/app', 'meteor --mobile-server=127.0.0.1:3000', '', '# open new terminal, assuming you have done npm install --save-dev meteor-desktop', 'npm run desktop -- init', 'npm run desktop'].join('\n    '));
  log('\n');
});

function verifyArgsSyntax() {
  if (process.env.npm_config_argv) {
    var npmArgv;

    try {
      var args = ['-b', '--build-meteor', '-t', '--build-timeout', '-p', '--port', '--production', '-a', '--android', '-s', '--scaffold', '--ia32', '--win', '--linux', '--all-archs', '--win', '--mac', '--meteor-settings'];
      npmArgv = JSON.parse(process.env.npm_config_argv);

      if (npmArgv.remain.length === 0 && npmArgv.original.length > 2) {
        if (npmArgv.original.some(function (arg) {
          return !!~args.indexOf(arg);
        })) {
          warn('WARNING: seems that you might used the wrong console syntax, no ` --' + ' ` delimiter was found, be sure you are invoking meteor-desktop with' + ' it when passing commands or options -> ' + '`npm run desktop -- command --option`\n');
        }
      }
    } catch (e) {// Not sure if `npm_config_argv` is always present...
    }
  }
}

function meteorDesktopFactory(ddpUrl) {
  var production = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  info(`METEOR-DESKTOP v${require('./../../package.json').version}\n`);
  verifyArgsSyntax();
  var input = process.cwd();

  if (!isMeteorApp(input)) {
    error(`not in a meteor app dir\n ${input}`);
    process.exit();
  }

  if (!_commander.default.output) {
    _commander.default.output = input;
  }

  if (production && !_commander.default.production) {
    info('package/build-installer implies setting --production, setting it for you');
  }

  if (!_commander.default.buildMeteor) {
    _commander.default.port = _commander.default.port || 3000;
    info(`REMINDER: your Meteor project should be running now on port ${_commander.default.port}\n`);
  }

  if (_commander.default.prodDebug) {
    info('!! WARNING: You are adding devTools to a production build !!\n');
  }

  var options = {
    ddpUrl,
    skipMobileBuild: _commander.default.buildMeteor ? !_commander.default.buildMeteor : true,
    production: _commander.default.production || production
  };
  (0, _assignIn.default)(options, _commander.default);
  return (0, _.default)(input, _commander.default.output, options);
}

function run(ddpUrl) {
  meteorDesktopFactory(getDdpUrl(ddpUrl)).run();
}

function build(ddpUrl) {
  meteorDesktopFactory(getDdpUrl(ddpUrl)).build();
}

function init() {
  meteorDesktopFactory().init();
}

function justRun() {
  meteorDesktopFactory().justRun();
}

function runPackager(ddpUrl) {
  meteorDesktopFactory(getDdpUrl(ddpUrl), true).runPackager();
}

function buildInstaller(ddpUrl) {
  meteorDesktopFactory(getDdpUrl(ddpUrl), true).buildInstaller();
}

function initTestsSupport() {
  log('installing cross-env, ava, meteor-desktop-test-suite and spectron');
  log('running `meteor npm install --save-dev cross-env ava spectron meteor-desktop-test-suite`');

  var _shell$exec = _shelljs.default.exec('meteor npm install --save-dev cross-env ava spectron meteor-desktop-test-suite'),
      code = _shell$exec.code;

  if (code !== 0) {
    warn('could not add cross-env, ava and spectron to your `devDependencies`, please do it' + ' manually');
  }

  var test = 'cross-env NODE_ENV=test ava .desktop/**/*.test.js -s --verbose';
  var testWatch = 'cross-env NODE_ENV=test ava .desktop/**/*.test.js -s --verbose' + ' --watch --source .desktop';

  function fail() {
    error('\ncould not add entries to `scripts` in package.json');
    log('please try to add it manually\n');
    log(`test-desktop: ${test}`);
    log(`test-desktop-watch: ${testWatch}`);
  }

  var packageJsonPath = _path.default.resolve(_path.default.join(process.cwd(), 'package.json'));

  (0, _addScript.default)('test-desktop', test, packageJsonPath, fail);
  (0, _addScript.default)('test-desktop-watch', testWatch, packageJsonPath, fail);
  log('\nadded test-desktop and test-desktop-watch entries');
  log('run the test with `npm run test-desktop`');
}

_commander.default.command('init').description('scaffolds .desktop dir in the meteor app').action(init);

_commander.default.command('run [ddp_url]').description('(default) builds and runs desktop app').action(run);

_commander.default.command('build [ddp_url]').description('builds your desktop app').action(build);

_commander.default.command('build-installer [ddp_url]').description('creates the installer').action(buildInstaller);

_commander.default.command('just-run').description('alias for running `electron .` in `.meteor/desktop-build`').action(justRun);

_commander.default.command('package [ddp_url]').description('runs electron packager').action(runPackager);

_commander.default.command('init-tests-support').description('prepares project for running functional tests of desktop app').action(initTestsSupport);

if (process.argv.length === 2 || !~'-h|--help|run|init|build|build-installer|just-run|init-tests-support|package'.indexOf(cmd)) {
  var _process = process,
      argv = _process.argv;

  if (process.argv.length === 2) {
    argv.push('run');
  } else {
    var command = argv.splice(0, 2);
    command = command.concat('run', argv);
    argv = command;
  }

  _commander.default.parse(argv);
} else {
  _commander.default.parse(process.argv);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iaW4vY2xpLmpzIl0sIm5hbWVzIjpbImpvaW4iLCJjbWQiLCJwcm9jZXNzIiwiYXJndiIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsImluZm8iLCJ3YXJuIiwiaXNNZXRlb3JBcHAiLCJhcHBQYXRoIiwibWV0ZW9yUGF0aCIsInN0YXRTeW5jIiwiaXNEaXJlY3RvcnkiLCJlIiwiZ2V0RGRwVXJsIiwiZGRwVXJsIiwiYnVpbGRNZXRlb3IiLCJjb2xsZWN0IiwidmFsIiwibWVtbyIsInB1c2giLCJvcHRpb24iLCJ1c2FnZSIsInZlcnNpb24iLCJyZXF1aXJlIiwib24iLCJ2ZXJpZnlBcmdzU3ludGF4IiwiZW52IiwibnBtX2NvbmZpZ19hcmd2IiwibnBtQXJndiIsImFyZ3MiLCJKU09OIiwicGFyc2UiLCJyZW1haW4iLCJsZW5ndGgiLCJvcmlnaW5hbCIsInNvbWUiLCJpbmRleE9mIiwiYXJnIiwibWV0ZW9yRGVza3RvcEZhY3RvcnkiLCJwcm9kdWN0aW9uIiwiaW5wdXQiLCJjd2QiLCJleGl0Iiwib3V0cHV0IiwicG9ydCIsInByb2REZWJ1ZyIsIm9wdGlvbnMiLCJza2lwTW9iaWxlQnVpbGQiLCJydW4iLCJidWlsZCIsImluaXQiLCJqdXN0UnVuIiwicnVuUGFja2FnZXIiLCJidWlsZEluc3RhbGxlciIsImluaXRUZXN0c1N1cHBvcnQiLCJleGVjIiwiY29kZSIsInRlc3QiLCJ0ZXN0V2F0Y2giLCJmYWlsIiwicGFja2FnZUpzb25QYXRoIiwicmVzb2x2ZSIsImNvbW1hbmQiLCJkZXNjcmlwdGlvbiIsImFjdGlvbiIsInNwbGljZSIsImNvbmNhdCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7OztBQVJBO0lBVVFBLEksaUJBQUFBLEk7QUFDUixJQUFNQyxNQUFNQyxRQUFRQyxJQUFSLENBQWEsQ0FBYixDQUFaO0FBRUE7O2VBR0lDLE87SUFEQUMsRyxZQUFBQSxHO0lBQUtDLEss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Q2Esb0JBRGIsRUFFS0MsV0FGTCxDQUVpQiw4REFGakIsRUFHS0MsTUFITCxDQUdZVixnQkFIWjs7QUFLQSxJQUFJdEQsUUFBUUMsSUFBUixDQUFhZ0MsTUFBYixLQUF3QixDQUF4QixJQUE2QixDQUFDLENBQUUsK0VBQStFRyxPQUEvRSxDQUF1RnJDLEdBQXZGLENBQXBDLEVBQ0U7QUFBQSxpQkFDaUJDLE9BRGpCO0FBQUEsTUFDUUMsSUFEUixZQUNRQSxJQURSOztBQUVFLE1BQUlELFFBQVFDLElBQVIsQ0FBYWdDLE1BQWIsS0FBd0IsQ0FBNUIsRUFBK0I7QUFDM0JoQyxTQUFLa0IsSUFBTCxDQUFVLEtBQVY7QUFDSCxHQUZELE1BRU87QUFDSCxRQUFJMkMsVUFBVTdELEtBQUtnRSxNQUFMLENBQVksQ0FBWixFQUFlLENBQWYsQ0FBZDtBQUNBSCxjQUFVQSxRQUFRSSxNQUFSLENBQWUsS0FBZixFQUFzQmpFLElBQXRCLENBQVY7QUFDQUEsV0FBTzZELE9BQVA7QUFDSDs7QUFDRCxxQkFBUS9CLEtBQVIsQ0FBYzlCLElBQWQ7QUFDSCxDQVhELE1BV087QUFDSCxxQkFBUThCLEtBQVIsQ0FBYy9CLFFBQVFDLElBQXRCO0FBQ0giLCJmaWxlIjoiY2xpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKiBlc2xpbnQtZGlzYWJsZSBnbG9iYWwtcmVxdWlyZSAqL1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGFzc2lnbkluIGZyb20gJ2xvZGFzaC9hc3NpZ25Jbic7XG5pbXBvcnQgcHJvZ3JhbSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgbWV0ZW9yRGVza3RvcCBmcm9tICcuLi8uLic7XG5pbXBvcnQgYWRkU2NyaXB0IGZyb20gJy4uL3NjcmlwdHMvdXRpbHMvYWRkU2NyaXB0JztcblxuY29uc3QgeyBqb2luIH0gPSBwYXRoO1xuY29uc3QgY21kID0gcHJvY2Vzcy5hcmd2WzJdO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5jb25zdCB7XG4gICAgbG9nLCBlcnJvciwgaW5mbywgd2FyblxufSA9IGNvbnNvbGU7XG5cbi8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuXG4vKipcbiAqIExvb2tzIGZvciAubWV0ZW9yIGRpcmVjdG9yeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHBQYXRoIC0gTWV0ZW9yIGFwcCBwYXRoXG4gKi9cbmZ1bmN0aW9uIGlzTWV0ZW9yQXBwKGFwcFBhdGgpIHtcbiAgICBjb25zdCBtZXRlb3JQYXRoID0gam9pbihhcHBQYXRoLCAnLm1ldGVvcicpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmcy5zdGF0U3luYyhtZXRlb3JQYXRoKS5pc0RpcmVjdG9yeSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBKdXN0IGVuc3VyZXMgYSBkZHAgdXJsIGlzIHNldC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBkZHBVcmwgLSB0aGUgdXJsIHRoYXQgTWV0ZW9yIGFwcCBjb25uZWN0cyB0b1xuICogQHJldHVybnMge3N0cmluZ3xudWxsfVxuICovXG5mdW5jdGlvbiBnZXREZHBVcmwoZGRwVXJsID0gbnVsbCkge1xuICAgIGlmICghZGRwVXJsICYmIHByb2dyYW0uYnVpbGRNZXRlb3IpIHtcbiAgICAgICAgaW5mbygnbm8gZGRwX3VybCBzcGVjaWZpZWQsIHNldHRpbmcgZGVmYXVsdDogaHR0cDovLzEyNy4wLjAuMTozMDAwJyk7XG4gICAgICAgIHJldHVybiAnaHR0cDovLzEyNy4wLjAuMTozMDAwJztcbiAgICB9XG4gICAgcmV0dXJuIGRkcFVybDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gY29sbGVjdCh2YWwsIG1lbW8pIHtcbiAgICBtZW1vLnB1c2godmFsKTtcbiAgICByZXR1cm4gbWVtbztcbn1cblxucHJvZ3JhbVxuICAgIC5vcHRpb24oJy1iLCAtLWJ1aWxkLW1ldGVvcicsICdydW5zIG1ldGVvciB0byBvYnRhaW4gdGhlIG1vYmlsZSBidWlsZCwga2lsbHMgaXQgYWZ0ZXInKVxuICAgIC5vcHRpb24oJy10LCAtLWJ1aWxkLXRpbWVvdXQgPHRpbWVvdXRfaW5fc2VjPicsICd0aW1lb3V0IHZhbHVlIHdoZW4gd2FpdGluZyBmb3IgJyArXG4gICAgICAgICdtZXRlb3IgdG8gYnVpbGQsIGRlZmF1bHQgNjAwc2VjJylcbiAgICAub3B0aW9uKCctcCwgLS1wb3J0IDxwb3J0PicsICdwb3J0IG9uIHdoaWNoIG1ldGVvciBpcyBydW5uaW5nLCB3aGVuIHdpdGggLWIgdGhpcyB3aWxsIGJlIHBhc3NlZCB0byBtZXRlb3Igd2hlbiBvYnRhaW5pbmcgdGhlIGJ1aWxkJylcbiAgICAub3B0aW9uKCctLXByb2R1Y3Rpb24nLCAnYnVpbGRzIG1ldGVvciBhcHAgd2l0aCB0aGUgcHJvZHVjdGlvbiBzd2l0Y2gsIHVnbGlmaWVzIGNvbnRlbnRzICcgK1xuICAgICAgICAnb2YgLmRlc2t0b3AsIHBhY2tzIGFwcCB0byBhcHAuYXNhcicpXG4gICAgLm9wdGlvbignLWEsIC0tYW5kcm9pZCcsICdmb3JjZSBhZGRpbmcgYW5kcm9pZCBhcyBhIG1vYmlsZSBwbGF0Zm9ybSBpbnN0ZWFkIG9mIGlvcycpXG4gICAgLm9wdGlvbignLXMsIC0tc2NhZmZvbGQnLCAnd2lsbCBzY2FmZm9sZCAuZGVza3RvcCBpZiBub3QgcHJlc2VudCcpXG4gICAgLm9wdGlvbignLWksIC0taWdub3JlLXN0ZGVyciBbc3RyaW5nXScsICdvbmx5IHdpdGggLWIsIHN0cmluZ3MgdGhhdCB3aGVuIGZvdW5kIHdpbGwgbm90IHRlcm1pbmF0ZSBtZXRlb3IgYnVpbGQnLCBjb2xsZWN0LCBbXSlcbiAgICAub3B0aW9uKCctLW1ldGVvci1zZXR0aW5ncyA8cGF0aD4nLCAnb25seSB3aXRoIC1iLCBhZGRzIC0tc2V0dGluZ3Mgb3B0aW9ucyB0byBtZXRlb3InKVxuICAgIC5vcHRpb24oJy0tcHJvZC1kZWJ1ZycsICdmb3JjZXMgYWRkaW5nIGRldiB0b29scyB0byBhIHByb2R1Y3Rpb24gYnVpbGQnKVxuICAgIC5vcHRpb24oJy0taWEzMicsICdnZW5lcmF0ZSAzMmJpdCBpbnN0YWxsZXIvcGFja2FnZScpXG4gICAgLm9wdGlvbignLS1hbGwtYXJjaHMnLCAnZ2VuZXJhdGUgMzJiaXQgYW5kIDY0Yml0IGluc3RhbGxlcnMnKVxuICAgIC5vcHRpb24oJy0td2luJywgJ2dlbmVyYXRlIFdpbmRvd3MgaW5zdGFsbGVyJylcbiAgICAub3B0aW9uKCctLWxpbnV4JywgJ2dlbmVyYXRlIExpbnV4IGluc3RhbGxlcicpXG4gICAgLm9wdGlvbignLS1tYWMnLCAnZ2VuZXJhdGUgTWFjIGluc3RhbGxlcicpXG4gICAgLm9wdGlvbignLWQsIC0tZGVidWcnLCAncnVuIGVsZWN0cm9uIHdpdGggZGVidWcgc3dpdGNoJyk7XG5cblxucHJvZ3JhbVxuICAgIC51c2FnZSgnW2NvbW1hbmRdIFtvcHRpb25zXScpXG4gICAgLnZlcnNpb24ocmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uLCAnLVYsIC0tdmVyc2lvbicpXG4gICAgLm9uKCctLWhlbHAnLCAoKSA9PiB7XG4gICAgICAgIGxvZygnICBbZGRwX3VybF0gLSBwYXNzIGEgZGRwIHVybCBpZiB5b3Ugd2FudCB0byB1c2UgZGlmZmVyZW50IG9uZSB0aGFuIHVzZWQgaW4gbWV0ZW9yXFwncyAtLW1vYmlsZS1zZXJ2ZXInKTtcbiAgICAgICAgbG9nKCcgICAgICAgICAgICAgIHRoaXMgd2lsbCBhbHNvIHdvcmsgd2l0aCAtYicpO1xuICAgICAgICBsb2coJyAgICAnKTtcbiAgICAgICAgbG9nKCcgIEV4YW1wbGVzOicpO1xuICAgICAgICBsb2coJycpO1xuICAgICAgICBsb2coXG4gICAgICAgICAgICAnICAgJyxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnIyBjZCBpbnRvIG1ldGVvciBkaXIgZmlyc3QnLFxuICAgICAgICAgICAgICAgICdjZCAveW91ci9tZXRlb3IvYXBwJyxcbiAgICAgICAgICAgICAgICAnbWV0ZW9yIC0tbW9iaWxlLXNlcnZlcj0xMjcuMC4wLjE6MzAwMCcsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgJyMgb3BlbiBuZXcgdGVybWluYWwsIGFzc3VtaW5nIHlvdSBoYXZlIGRvbmUgbnBtIGluc3RhbGwgLS1zYXZlLWRldiBtZXRlb3ItZGVza3RvcCcsXG4gICAgICAgICAgICAgICAgJ25wbSBydW4gZGVza3RvcCAtLSBpbml0JyxcbiAgICAgICAgICAgICAgICAnbnBtIHJ1biBkZXNrdG9wJ1xuICAgICAgICAgICAgXS5qb2luKCdcXG4gICAgJylcbiAgICAgICAgKTtcbiAgICAgICAgbG9nKCdcXG4nKTtcbiAgICB9KTtcblxuXG5mdW5jdGlvbiB2ZXJpZnlBcmdzU3ludGF4KCkge1xuICAgIGlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX2FyZ3YpIHtcbiAgICAgICAgbGV0IG5wbUFyZ3Y7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gWyctYicsICctLWJ1aWxkLW1ldGVvcicsICctdCcsICctLWJ1aWxkLXRpbWVvdXQnLCAnLXAnLCAnLS1wb3J0JyxcbiAgICAgICAgICAgICAgICAnLS1wcm9kdWN0aW9uJywgJy1hJywgJy0tYW5kcm9pZCcsICctcycsICctLXNjYWZmb2xkJywgJy0taWEzMicsICctLXdpbicsXG4gICAgICAgICAgICAgICAgJy0tbGludXgnLCAnLS1hbGwtYXJjaHMnLCAnLS13aW4nLCAnLS1tYWMnLCAnLS1tZXRlb3Itc2V0dGluZ3MnXTtcbiAgICAgICAgICAgIG5wbUFyZ3YgPSBKU09OLnBhcnNlKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfYXJndik7XG4gICAgICAgICAgICBpZiAobnBtQXJndi5yZW1haW4ubGVuZ3RoID09PSAwICYmIG5wbUFyZ3Yub3JpZ2luYWwubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIGlmIChucG1Bcmd2Lm9yaWdpbmFsLnNvbWUoYXJnID0+ICEhfmFyZ3MuaW5kZXhPZihhcmcpKSkge1xuICAgICAgICAgICAgICAgICAgICB3YXJuKCdXQVJOSU5HOiBzZWVtcyB0aGF0IHlvdSBtaWdodCB1c2VkIHRoZSB3cm9uZyBjb25zb2xlIHN5bnRheCwgbm8gYCAtLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyBgIGRlbGltaXRlciB3YXMgZm91bmQsIGJlIHN1cmUgeW91IGFyZSBpbnZva2luZyBtZXRlb3ItZGVza3RvcCB3aXRoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGl0IHdoZW4gcGFzc2luZyBjb21tYW5kcyBvciBvcHRpb25zIC0+ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2BucG0gcnVuIGRlc2t0b3AgLS0gY29tbWFuZCAtLW9wdGlvbmBcXG4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5vdCBzdXJlIGlmIGBucG1fY29uZmlnX2FyZ3ZgIGlzIGFsd2F5cyBwcmVzZW50Li4uXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ldGVvckRlc2t0b3BGYWN0b3J5KGRkcFVybCwgcHJvZHVjdGlvbiA9IGZhbHNlKSB7XG4gICAgaW5mbyhgTUVURU9SLURFU0tUT1AgdiR7cmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9ufVxcbmApO1xuXG4gICAgdmVyaWZ5QXJnc1N5bnRheCgpO1xuXG4gICAgY29uc3QgaW5wdXQgPSBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgaWYgKCFpc01ldGVvckFwcChpbnB1dCkpIHtcbiAgICAgICAgZXJyb3IoYG5vdCBpbiBhIG1ldGVvciBhcHAgZGlyXFxuICR7aW5wdXR9YCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgpO1xuICAgIH1cblxuICAgIGlmICghcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgcHJvZ3JhbS5vdXRwdXQgPSBpbnB1dDtcbiAgICB9XG5cbiAgICBpZiAocHJvZHVjdGlvbiAmJiAhcHJvZ3JhbS5wcm9kdWN0aW9uKSB7XG4gICAgICAgIGluZm8oJ3BhY2thZ2UvYnVpbGQtaW5zdGFsbGVyIGltcGxpZXMgc2V0dGluZyAtLXByb2R1Y3Rpb24sIHNldHRpbmcgaXQgZm9yIHlvdScpO1xuICAgIH1cblxuICAgIGlmICghcHJvZ3JhbS5idWlsZE1ldGVvcikge1xuICAgICAgICBwcm9ncmFtLnBvcnQgPSBwcm9ncmFtLnBvcnQgfHwgMzAwMDtcbiAgICAgICAgaW5mbyhgUkVNSU5ERVI6IHlvdXIgTWV0ZW9yIHByb2plY3Qgc2hvdWxkIGJlIHJ1bm5pbmcgbm93IG9uIHBvcnQgJHtwcm9ncmFtLnBvcnR9XFxuYCk7XG4gICAgfVxuXG4gICAgaWYgKHByb2dyYW0ucHJvZERlYnVnKSB7XG4gICAgICAgIGluZm8oJyEhIFdBUk5JTkc6IFlvdSBhcmUgYWRkaW5nIGRldlRvb2xzIHRvIGEgcHJvZHVjdGlvbiBidWlsZCAhIVxcbicpO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGRkcFVybCxcbiAgICAgICAgc2tpcE1vYmlsZUJ1aWxkOiBwcm9ncmFtLmJ1aWxkTWV0ZW9yID8gIXByb2dyYW0uYnVpbGRNZXRlb3IgOiB0cnVlLFxuICAgICAgICBwcm9kdWN0aW9uOiBwcm9ncmFtLnByb2R1Y3Rpb24gfHwgcHJvZHVjdGlvblxuICAgIH07XG5cbiAgICBhc3NpZ25JbihvcHRpb25zLCBwcm9ncmFtKTtcblxuICAgIHJldHVybiBtZXRlb3JEZXNrdG9wKFxuICAgICAgICBpbnB1dCxcbiAgICAgICAgcHJvZ3JhbS5vdXRwdXQsXG4gICAgICAgIG9wdGlvbnNcbiAgICApO1xufVxuXG5mdW5jdGlvbiBydW4oZGRwVXJsKSB7XG4gICAgbWV0ZW9yRGVza3RvcEZhY3RvcnkoZ2V0RGRwVXJsKGRkcFVybCkpLnJ1bigpO1xufVxuXG5mdW5jdGlvbiBidWlsZChkZHBVcmwpIHtcbiAgICBtZXRlb3JEZXNrdG9wRmFjdG9yeShnZXREZHBVcmwoZGRwVXJsKSkuYnVpbGQoKTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBtZXRlb3JEZXNrdG9wRmFjdG9yeSgpLmluaXQoKTtcbn1cblxuZnVuY3Rpb24ganVzdFJ1bigpIHtcbiAgICBtZXRlb3JEZXNrdG9wRmFjdG9yeSgpLmp1c3RSdW4oKTtcbn1cblxuZnVuY3Rpb24gcnVuUGFja2FnZXIoZGRwVXJsKSB7XG4gICAgbWV0ZW9yRGVza3RvcEZhY3RvcnkoZ2V0RGRwVXJsKGRkcFVybCksIHRydWUpLnJ1blBhY2thZ2VyKCk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkSW5zdGFsbGVyKGRkcFVybCkge1xuICAgIG1ldGVvckRlc2t0b3BGYWN0b3J5KGdldERkcFVybChkZHBVcmwpLCB0cnVlKS5idWlsZEluc3RhbGxlcigpO1xufVxuXG5mdW5jdGlvbiBpbml0VGVzdHNTdXBwb3J0KCkge1xuICAgIGxvZygnaW5zdGFsbGluZyBjcm9zcy1lbnYsIGF2YSwgbWV0ZW9yLWRlc2t0b3AtdGVzdC1zdWl0ZSBhbmQgc3BlY3Ryb24nKTtcbiAgICBsb2coJ3J1bm5pbmcgYG1ldGVvciBucG0gaW5zdGFsbCAtLXNhdmUtZGV2IGNyb3NzLWVudiBhdmEgc3BlY3Ryb24gbWV0ZW9yLWRlc2t0b3AtdGVzdC1zdWl0ZWAnKTtcblxuICAgIGNvbnN0IHsgY29kZSB9ID0gc2hlbGwuZXhlYygnbWV0ZW9yIG5wbSBpbnN0YWxsIC0tc2F2ZS1kZXYgY3Jvc3MtZW52IGF2YSBzcGVjdHJvbiBtZXRlb3ItZGVza3RvcC10ZXN0LXN1aXRlJyk7XG5cbiAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgICB3YXJuKCdjb3VsZCBub3QgYWRkIGNyb3NzLWVudiwgYXZhIGFuZCBzcGVjdHJvbiB0byB5b3VyIGBkZXZEZXBlbmRlbmNpZXNgLCBwbGVhc2UgZG8gaXQnICtcbiAgICAgICAgICAgICcgbWFudWFsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXN0ID0gJ2Nyb3NzLWVudiBOT0RFX0VOVj10ZXN0IGF2YSAuZGVza3RvcC8qKi8qLnRlc3QuanMgLXMgLS12ZXJib3NlJztcbiAgICBjb25zdCB0ZXN0V2F0Y2ggPSAnY3Jvc3MtZW52IE5PREVfRU5WPXRlc3QgYXZhIC5kZXNrdG9wLyoqLyoudGVzdC5qcyAtcyAtLXZlcmJvc2UnICtcbiAgICAgICAgJyAtLXdhdGNoIC0tc291cmNlIC5kZXNrdG9wJztcblxuICAgIGZ1bmN0aW9uIGZhaWwoKSB7XG4gICAgICAgIGVycm9yKCdcXG5jb3VsZCBub3QgYWRkIGVudHJpZXMgdG8gYHNjcmlwdHNgIGluIHBhY2thZ2UuanNvbicpO1xuICAgICAgICBsb2coJ3BsZWFzZSB0cnkgdG8gYWRkIGl0IG1hbnVhbGx5XFxuJyk7XG4gICAgICAgIGxvZyhgdGVzdC1kZXNrdG9wOiAke3Rlc3R9YCk7XG4gICAgICAgIGxvZyhgdGVzdC1kZXNrdG9wLXdhdGNoOiAke3Rlc3RXYXRjaH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZS5qc29uJylcbiAgICApO1xuXG4gICAgYWRkU2NyaXB0KCd0ZXN0LWRlc2t0b3AnLCB0ZXN0LCBwYWNrYWdlSnNvblBhdGgsIGZhaWwpO1xuICAgIGFkZFNjcmlwdCgndGVzdC1kZXNrdG9wLXdhdGNoJywgdGVzdFdhdGNoLCBwYWNrYWdlSnNvblBhdGgsIGZhaWwpO1xuXG4gICAgbG9nKCdcXG5hZGRlZCB0ZXN0LWRlc2t0b3AgYW5kIHRlc3QtZGVza3RvcC13YXRjaCBlbnRyaWVzJyk7XG4gICAgbG9nKCdydW4gdGhlIHRlc3Qgd2l0aCBgbnBtIHJ1biB0ZXN0LWRlc2t0b3BgJyk7XG59XG5cbnByb2dyYW1cbiAgICAuY29tbWFuZCgnaW5pdCcpXG4gICAgLmRlc2NyaXB0aW9uKCdzY2FmZm9sZHMgLmRlc2t0b3AgZGlyIGluIHRoZSBtZXRlb3IgYXBwJylcbiAgICAuYWN0aW9uKGluaXQpO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ3J1biBbZGRwX3VybF0nKVxuICAgIC5kZXNjcmlwdGlvbignKGRlZmF1bHQpIGJ1aWxkcyBhbmQgcnVucyBkZXNrdG9wIGFwcCcpXG4gICAgLmFjdGlvbihydW4pO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ2J1aWxkIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdidWlsZHMgeW91ciBkZXNrdG9wIGFwcCcpXG4gICAgLmFjdGlvbihidWlsZCk7XG5cbnByb2dyYW1cbiAgICAuY29tbWFuZCgnYnVpbGQtaW5zdGFsbGVyIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdjcmVhdGVzIHRoZSBpbnN0YWxsZXInKVxuICAgIC5hY3Rpb24oYnVpbGRJbnN0YWxsZXIpO1xuXG5wcm9ncmFtXG4gICAgLmNvbW1hbmQoJ2p1c3QtcnVuJylcbiAgICAuZGVzY3JpcHRpb24oJ2FsaWFzIGZvciBydW5uaW5nIGBlbGVjdHJvbiAuYCBpbiBgLm1ldGVvci9kZXNrdG9wLWJ1aWxkYCcpXG4gICAgLmFjdGlvbihqdXN0UnVuKTtcblxucHJvZ3JhbVxuICAgIC5jb21tYW5kKCdwYWNrYWdlIFtkZHBfdXJsXScpXG4gICAgLmRlc2NyaXB0aW9uKCdydW5zIGVsZWN0cm9uIHBhY2thZ2VyJylcbiAgICAuYWN0aW9uKHJ1blBhY2thZ2VyKTtcblxucHJvZ3JhbVxuICAgIC5jb21tYW5kKCdpbml0LXRlc3RzLXN1cHBvcnQnKVxuICAgIC5kZXNjcmlwdGlvbigncHJlcGFyZXMgcHJvamVjdCBmb3IgcnVubmluZyBmdW5jdGlvbmFsIHRlc3RzIG9mIGRlc2t0b3AgYXBwJylcbiAgICAuYWN0aW9uKGluaXRUZXN0c1N1cHBvcnQpO1xuXG5pZiAocHJvY2Vzcy5hcmd2Lmxlbmd0aCA9PT0gMiB8fCAhfignLWh8LS1oZWxwfHJ1bnxpbml0fGJ1aWxkfGJ1aWxkLWluc3RhbGxlcnxqdXN0LXJ1bnxpbml0LXRlc3RzLXN1cHBvcnR8cGFja2FnZScuaW5kZXhPZihjbWQpKVxuKSB7XG4gICAgbGV0IHsgYXJndiB9ID0gcHJvY2VzcztcbiAgICBpZiAocHJvY2Vzcy5hcmd2Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICBhcmd2LnB1c2goJ3J1bicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjb21tYW5kID0gYXJndi5zcGxpY2UoMCwgMik7XG4gICAgICAgIGNvbW1hbmQgPSBjb21tYW5kLmNvbmNhdCgncnVuJywgYXJndik7XG4gICAgICAgIGFyZ3YgPSBjb21tYW5kO1xuICAgIH1cbiAgICBwcm9ncmFtLnBhcnNlKGFyZ3YpO1xufSBlbHNlIHtcbiAgICBwcm9ncmFtLnBhcnNlKHByb2Nlc3MuYXJndik7XG59XG4iXX0=