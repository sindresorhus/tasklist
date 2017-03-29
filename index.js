'use strict';
var childProcess = require('child_process');
var neatCsv = require('neat-csv');
var sec = require('sec');
var pify = require('pify');
var Promise = require('pinkie-promise');

module.exports = function (opts) {
	if (process.platform !== 'win32') {
		return Promise.reject(new Error('Windows only'));
	}

	opts = opts || {};

	var args = ['/v', '/nh', '/fo', 'CSV'];

	if (opts.system && opts.username && opts.password) {
		args.push('/s', opts.system, '/u', opts.username, '/p', opts.password);
	}

	if (Array.isArray(opts.filter)) {
		opts.filter.forEach(function (el) {
			args.push('/fi', el);
		});
	}

	var headerNames = [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage'
	];

	if (opts.verbose) {
		headerNames = headerNames.concat(
			[
				'status',
				'username',
				'cpuTime',
				'windowTitle'
			]
		);
	}

	return pify(childProcess.execFile, Promise)('tasklist', args).then(function (stdout) {
		return pify(neatCsv, Promise)(stdout, {headers: headerNames}).then(function (data) {
			return data.map(function (el) {
				Object.keys(el).forEach(function (key) {
					if (el[key] === 'N/A') {
						el[key] = null;
					}
				});

				el.pid = Number(el.pid);
				el.sessionNumber = Number(el.sessionNumber);
				el.memUsage = Number(el.memUsage.replace(/[^\d]/g, '')) * 1024;
				if (opts.verbose) {
					el.cpuTime = sec(el.cpuTime);
				}
				return el;
			});
		});
	});
};
