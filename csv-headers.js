const csvHeaders = {
	default: [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage',
	],
	defaultVerbose: [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage',
		'status',
		'username',
		'cpuTime',
		'windowTitle',
	],
	apps: [
		'imageName',
		'pid',
		'memUsage',
		'packageName',
	],
	appsVerbose: [
		'imageName',
		'pid',
		'sessionName',
		'sessionNumber',
		'memUsage',
		'status',
		'username',
		'cpuTime',
		'windowTitle',
		'packageName',
	],
	modules: [
		'imageName',
		'pid',
		'modules',
	],
	services: [
		'imageName',
		'pid',
		'services',
	],
};

export default csvHeaders;
