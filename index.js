'use strict';
const childProcess = require('child_process');
const {promisify} = require('util');
const {pipeline} = require('stream');
const csv = require('csv');
const csvHeaders = require('./csv-headers');
const transform = require('./transform');

const execFile = promisify(childProcess.execFile);

csv.parse[promisify.custom] = (input, options) => new Promise(resolve => {
	csv.parse(input, options, (_, records) => resolve(records));
});
const parse = promisify(csv.parse);

function main(options = {}) {
	const isRemote = options.system && options.username && options.password;

	if (process.platform !== 'win32') {
		throw new Error('Windows only');
	}

	if (options.verbose === true && (options.services === true || options.modules !== undefined)) {
		throw new Error('Verbose option is invalid when Services or Modules option is set');
	}

	if (options.modules !== undefined && options.services === true) {
		throw new Error('The Services and Modules options can\'t be used together');
	}

	// Check for unsupported filters on remote machines
	if (Array.isArray(options.filter) && isRemote) {
		options.filter.forEach(filter => {
			const parameter = filter.split(' ')[0].toLowerCase();
			if (parameter === 'windowtitle' || parameter === 'status') {
				throw new Error('Windowtitle and Status parameters for filtering are not supported when querying remote machines');
			}
		});
	}

	// Populate args
	const args = ['/nh', '/fo', 'csv'];

	if (options.verbose) {
		args.push('/v');
	}

	if (options.apps) {
		args.push('/apps');
	}

	if (options.modules !== undefined) {
		args.push('/m');
		if (options.modules.length > 0) {
			args.push(options.modules);
		}
	}

	if (options.services) {
		args.push('/svc');
	}

	if (isRemote) {
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

	let currentHeader;
	if (options.apps) {
		currentHeader = 'apps';
	} else if (options.modules !== undefined) {
		currentHeader = 'modules';
	} else if (options.services) {
		currentHeader = 'services';
	} else {
		currentHeader = 'default';
	}

	if (options.verbose) {
		currentHeader += 'Verbose';
	}

	const columns = csvHeaders[currentHeader];
	const currentTransform = transform.transforms[currentHeader];
	return {args, columns, currentTransform};
}

function streamInterface(options = {}) {
	const {args, columns, currentTransform} = main(options);
	const checkEmptyStream = new transform.ReportEmpty().getTransform();
	const processOutput = childProcess.spawn('tasklist.exe', args).stdout;

	// Ignore errors originating from stream end
	const resultStream = pipeline(processOutput, checkEmptyStream, csv.parse({columns}), transform.makeTransform(currentTransform));
	resultStream.on('error', error => error);
	return resultStream;
}

async function promiseInterface(options = {}) {
	const {args, columns, currentTransform} = main(options);
	const {stdout} = await execFile('tasklist.exe', args);
	if (!stdout.startsWith('"')) {
		return [];
	}

	const records = await parse(stdout, {columns});
	records.map(task => currentTransform(task));
	return records;
}

module.exports = promiseInterface;
module.exports.stream = streamInterface;
