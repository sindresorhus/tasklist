import childProcess from 'node:child_process';
import {promisify} from 'node:util';
import {pipeline} from 'node:stream';
import process from 'node:process';
import {parse as csvParse} from 'csv';
import csvHeaders from './csv-headers.js';
import transform from './transform.js';

const execFile = promisify(childProcess.execFile);
const parse = promisify(csvParse);

function validateOptions(options) {
	if (process.platform !== 'win32') {
		throw new Error('Windows only');
	}

	if (options.verbose === true && (options.services === true || options.modules !== undefined)) {
		throw new Error('Verbose option is invalid when Services or Modules option is set');
	}

	if (options.apps === true && (options.services === true || options.modules !== undefined)) {
		throw new Error('Apps option is invalid when Services or Modules option is set');
	}

	if (options.modules !== undefined && options.services === true) {
		throw new Error('The Services and Modules options can\'t be used together');
	}

	// Check if system, username and password is specified together
	const remoteParameters = [options.system, options.username, options.password];
	const allUndefined = remoteParameters.every(value => value === undefined);
	const someUndefined = remoteParameters.includes(undefined);

	if (!allUndefined && someUndefined) {
		throw new Error('The System, Username and Password options must be specified together');
	}

	const isRemote = !allUndefined;

	// Check for unsupported filters on remote machines
	if (Array.isArray(options.filter) && isRemote) {
		for (const filter of options.filter) {
			const parameter = filter.split(' ')[0].toLowerCase();
			if (parameter === 'windowtitle' || parameter === 'status') {
				throw new Error('Windowtitle and Status parameters for filtering are not supported when querying remote machines');
			}
		}
	}

	return isRemote;
}

function buildArgs(options, isRemote) {
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
		args.push('/s', options.system, '/u', options.username, '/p', options.password);
	}

	if (Array.isArray(options.filter)) {
		for (const filter of options.filter) {
			args.push('/fi', filter);
		}
	}

	return args;
}

function getHeaderType(options) {
	let headerType;
	if (options.apps) {
		headerType = 'apps';
	} else if (options.modules !== undefined) {
		headerType = 'modules';
	} else if (options.services) {
		headerType = 'services';
	} else {
		headerType = 'default';
	}

	if (options.verbose) {
		headerType += 'Verbose';
	}

	return headerType;
}

function prepareTasklistOptions(options = {}) {
	const isRemote = validateOptions(options);
	const args = buildArgs(options, isRemote);
	const headerType = getHeaderType(options);
	const columns = csvHeaders[headerType];
	const currentTransform = transform.transforms[headerType];
	return {args, columns, currentTransform};
}

export async function tasklist(options = {}) {
	const {args, columns, currentTransform} = prepareTasklistOptions(options);
	const {stdout} = await execFile('tasklist.exe', args);
	if (!stdout.startsWith('"')) {
		return [];
	}

	const records = await parse(stdout, {columns});
	for (const task of records) {
		currentTransform(task);
	}

	return records;
}

export function tasklistStream(options = {}) {
	const {args, columns, currentTransform} = prepareTasklistOptions(options);
	const checkEmptyStream = new transform.ReportEmpty().getTransform();
	const processOutput = childProcess.spawn('tasklist.exe', args).stdout;

	// Ignore errors originating from stream end
	const resultStream = pipeline(processOutput, checkEmptyStream, csvParse({columns}), transform.makeTransform(currentTransform), error => error);
	resultStream.on('error', () => {});
	return resultStream;
}
