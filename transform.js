const {PassThrough} = require('stream');
const sec = require('sec');

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

const passThrough = () => new PassThrough({objectMode: true});

module.exports = {
	passThrough,
	transforms: {
		default: defaultTransform,
		defaultVerbose: defaultVerboseTransform,
		apps: appsTransform,
		appsVerbose: defaultVerboseTransform,
		modules: modulesTransform,
		services: servicesTransform
	}
};
