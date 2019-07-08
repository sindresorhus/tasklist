'use strict';
const childProcess = require('child_process');
const csv = require('csv');
const csvHeaders = require('./csv-headers');
const {passThrough, transforms} = require('./transform');

function Options() {
	/**
	 * Make tasklist output more info
	 * @type {Boolean}
	 */
	this.verbose = false;
	/**
	 * List all service information for each process
	 * @type {Boolean}
	 */
	this.services = false;
	/**
	 * Show DLL modules loaded by all tasks
	 * @type {String}
	 */
	this.modules = '';
	/**
	 * The IP address or hostname of the remote machine
	 * @type {String}
	 */
	this.system = '';
	/**
	 * The username of the remote machine
	 * @type {String}
	 */
	this.username = '';
	/**
	 * The password of the remote machine
	 * @type {String}
	 */
	this.password = '';
	/**
	 * Display store apps
	 * @type {Boolean}
	 */
	this.apps = false;
	/**
	 * Filters to pass to the command
	 * @see https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/tasklist
	 * @type {Array}
	 */
	this.filter = [];
}

/**
 * Exectue tasklist
 * @param {Options} options The options of the command
 * @returns Stream, returning parsed results
 */
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
	const currentTransform = transforms[currentHeader];
	const parser = csv.parse({columns});
	const pt = passThrough();
	const processOutput = childProcess.spawn('tasklist.exe', args).stdout;
	let outputChecked = false;

	processOutput.on('data', data => {
		if (!outputChecked) {
			outputChecked = true;
			// Check if result is empty
			if (!data.toString().startsWith('"')) {
				processOutput.end();
				pt.end();
				return;
			}
		}

		parser.write(data);
	});
	parser.on('readable', () => {
		let data;
		do {
			data = parser.read();
			if (data) {
				pt.write(currentTransform(data));
			}
		} while (data);
	});

	processOutput.on('end', () => {
		parser.end();
	});
	parser.on('end', () => pt.end());

	return pt;
}

module.exports = main;