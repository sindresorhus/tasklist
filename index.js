import childProcess from 'node:child_process';
import {promisify} from 'node:util';
import {pipeline} from 'node:stream';
import process from 'node:process';
import csv from 'csv';
import csvHeaders from './csv-headers.js';
import transform from './transform.js';

const execFile = promisify(childProcess.execFile);
const parse = promisify(csv.parse);

function main(options = {}) {
	if (process.platform !== 'win32') {
		throw new Error('Windows only');
	}

	if (options.verbose === true && (options.services === true || options.modules !== undefined)) {
		throw new Error('Verbose option is invalid when Services or Modules option is set');
	}

	if (options.modules !== undefined && options.services === true) {
		throw new Error('The Services and Modules options can\'t be used together');
	}

	// Check if system, username and password is specified together
	const remoteParameters = [options.system, options.username, options.password];
	let isRemote;
	if (remoteParameters.every(value => value === undefined)) {
		// All params are undefined
		isRemote = false;
	} else if (remoteParameters.includes(undefined)) {
		// Some, but not all of the params are undefined
		throw new Error('The System, Username and Password options must be specified together');
	} else {
		isRemote = true;
	}

	// Check for unsupported filters on remote machines
	if (Array.isArray(options.filter) && isRemote) {
		for (const filter of options.filter) {
			const parameter = filter.split(' ')[0].toLowerCase();
			if (parameter === 'windowtitle' || parameter === 'status') {
				throw new Error('Windowtitle and Status parameters for filtering are not supported when querying remote machines');
			}
		}
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
			'/p', options.password,
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

export async function tasklist(options = {}) {
	const {args, columns, currentTransform} = main(options);
	const {stdout} = await execFile('tasklist.exe', args);
	if (!stdout.startsWith('"')) {
		return [];
	}

	const records = await parse(stdout, {columns});
	records.map(task => currentTransform(task));
	return records;
}

export function tasklistStream(options = {}) {
	const {args, columns, currentTransform} = main(options);
	const checkEmptyStream = new transform.ReportEmpty().getTransform();
	const processOutput = childProcess.spawn('tasklist.exe', args).stdout;

	// Ignore errors originating from stream end
	const resultStream = pipeline(processOutput, checkEmptyStream, csv.parse({columns}), transform.makeTransform(currentTransform), error => error);
	resultStream.on('error', error => error);
	return resultStream;
}
