'use strict';
const {promisify} = require('util');
const childProcess = require('child_process');
const neatCsv = require('neat-csv');
const sec = require('sec');

const execFile = promisify(childProcess.execFile);

module.exports = async (options = {}) => {
	if (process.platform !== 'win32') {
		throw new Error('Windows only');
	}

	const args = ['/nh', '/fo', 'csv'];

	if (options.verbose) {
		args.push('/v');
	}

	if (options.system && options.username && options.password) {
		args.push(
			'/s', options.system,
			'/u', options.username,
			'/p', options.password
		);
	}

	if (Array.isArray(options.filter)) {
		for (const filter of options.filter) {
			args.push('/fi', filter);
		}
	}

	const defaultHeaders = [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage'
	];

	const verboseHeaders = defaultHeaders.concat([
		'status',
		'username',
		'cpuTime',
		'windowTitle'
	]);

	const headers = options.verbose ? verboseHeaders : defaultHeaders;

	const {stdout} = await execFile('tasklist', args, {windowsHide: true});

	// Not start with `"` means no matching tasks. See #11.
	const data = stdout.startsWith('"') ? await neatCsv(stdout, {headers}) : [];

	return data.map(task => {
		// Normalize task props
		task.pid = Number(task.pid);
		task.sessionNumber = Number(task.sessionNumber);
		task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;

		if (options.verbose) {
			task.cpuTime = sec(task.cpuTime);
		}

		return task;
	});
};
