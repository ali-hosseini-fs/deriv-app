var globals = require('./globals');
var version = '1.2.0';
if (globals.debug) {
	console.log('%cBinary Bot (v' + version + ') started.', 'color: green');
} else {
	globals.addLogToQueue('%cBinary Bot (v' + version + ') started.', 'color: green');
}
module.exports = version;
