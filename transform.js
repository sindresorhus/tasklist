const {PassThrough, Transform} = require('stream');
const sec = require('sec');

const makeTransform = convert => new Transform({
	objectMode: true,
	transform: (task, _, callback) =>
		callback(null, convert(task))
});

const defaultTransform = task => {
	task.pid = Number(task.pid);
	task.sessionNumber = Number(task.sessionNumber);
	task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;
	return task;
};

const defaultVerboseTransform = task => {
	task.pid = Number(task.pid);
	task.sessionNumber = Number(task.sessionNumber);
	task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;
	task.cpuTime = sec(task.cpuTime);
	return task;
};

const appsTransform = task => {
	task.pid = Number(task.pid);
	task.memUsage = Number(task.memUsage.replace(/[^\d]/g, '')) * 1024;
	return task;
};

const modulesTransform = task => {
	task.pid = Number(task.pid);
	if (task.modules === 'N/A') {
		task.modules = [];
	} else {
		task.modules = task.modules.split(',');
	}

	return task;
};

const servicesTransform = task => {
	task.pid = Number(task.pid);
	if (task.services && task.services !== 'N/A') {
		task.services = task.services.split(',');
	} else {
		task.services = [];
	}

	return task;
};

const passThrough = () => new PassThrough({objectMode: true});

class ReportEmpty {
	constructor() {
		this.checked = false;
	}

	getTransform() {
		return new Transform({
			transform: (input, _, callback) => {
				const stringInput = input.toString();
				if (!stringInput.startsWith('"') && !this.checked) {
					callback(null, null);
				} else {
					callback(null, input);
					this.checked = true;
				}
			}
		});
	}
}

module.exports = {
	passThrough,
	ReportEmpty,
	makeTransform,
	transforms: {
		default: defaultTransform,
		defaultVerbose: defaultVerboseTransform,
		apps: appsTransform,
		appsVerbose: defaultVerboseTransform,
		modules: modulesTransform,
		services: servicesTransform
	}
};
