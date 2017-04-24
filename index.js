const childProcess = require('child_process');
const pify = require('pify');
const neatCsv = require('neat-csv');
const sec = require('sec');

module.exports = opts => {
	if (process.platform !== 'win32') {
		return Promise.reject(new Error('Windows only'));
	}

	const options = opts || {};

	const args = ['/v', '/nh', '/fo', 'csv'];

	if (options.system && options.username && options.password) {
		args.push('/s', options.system, '/u', options.username, '/p', options.password);
	}

	if (Array.isArray(options.filter)) {
		options.filter.forEach(fi => args.push('/fi', fi));
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

	return pify(childProcess.execFile)('tasklist', args)
		.then(stdout => neatCsv(stdout, {headers}))
		.then(data => data.map(task => {
			// Normalize task props
			task.pid = Number(task.pid);
			task.sessionNumber = Number(task.sessionNumber);
			task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;
			if (options.verbose) {
				task.cpuTime = sec(task.cpuTime);
			}
			return task;
		}));
};
