import {PassThrough as PassThroughStream, Transform as TransformStream} from 'node:stream';
import sec from 'sec';

const makeTransform = convert => new TransformStream({
	objectMode: true,
	transform: (task, _, callback) =>
		callback(null, convert(task)),
});

const defaultTransform = task => {
	task.pid = Number(task.pid);
	task.sessionNumber = Number(task.sessionNumber);
	task.memUsage = Number(task.memUsage.replace(/\D/g, '')) * 1024;
	return task;
};

const defaultVerboseTransform = task => {
	task.pid = Number(task.pid);
	task.sessionNumber = Number(task.sessionNumber);
	task.memUsage = Number(task.memUsage.replace(/\D/g, '')) * 1024;
	task.cpuTime = sec(task.cpuTime);
	return task;
};

const appsTransform = task => {
	task.pid = Number(task.pid);
	task.memUsage = Number(task.memUsage.replace(/\D/g, '')) * 1024;
	return task;
};

const modulesTransform = task => {
	task.pid = Number(task.pid);
	task.modules = task.modules.split(',');
	return task;
};

const servicesTransform = task => {
	task.pid = Number(task.pid);
	if (task.services) {
		task.services = task.services.split(',');
	}

	return task;
};

const passThrough = () => new PassThroughStream({objectMode: true});

class ReportEmpty {
	constructor() {
		this.checked = false;
	}

	getTransform() {
		return new TransformStream({
			transform: (input, _, callback) => {
				const stringInput = input.toString();
				if (!stringInput.startsWith('"') && !this.checked) {
					callback(null, null);
				} else {
					callback(null, input);
					this.checked = true;
				}
			},
		});
	}
}

const transform = {
	passThrough,
	ReportEmpty,
	makeTransform,
	transforms: {
		default: defaultTransform,
		defaultVerbose: defaultVerboseTransform,
		apps: appsTransform,
		appsVerbose: defaultVerboseTransform,
		modules: modulesTransform,
		services: servicesTransform,
	},
};

export default transform;
