import test from 'ava';
import tasklist from '.';

const hasDefaultTaskProps = (t, task) => {
	t.is(typeof task.imageName, 'string');
	t.is(typeof task.pid, 'number');
	t.is(typeof task.sessionName, 'string');
	t.is(typeof task.sessionNumber, 'number');
	t.is(typeof task.memUsage, 'number');
};

const hasNonVerboseTaskProps = (t, task) => {
	t.is(task.status, undefined);
	t.is(task.username, undefined);
	t.is(task.cpuTime, undefined);
	t.is(task.windowTitle, undefined);
};

const hasVerboseTaskProps = (t, task) => {
	t.is(typeof task.status, 'string');
	t.is(typeof task.username, 'string');
	t.is(typeof task.cpuTime, 'number');
	t.is(typeof task.windowTitle, 'string');
};

const hasAppsProps = (t, task) => {
	t.is(typeof task.imageName, 'string');
	t.is(typeof task.pid, 'number');
	t.is(typeof task.memUsage, 'number');
	t.is(typeof task.packageName, 'string');
};

const hasNonVerboseAppsProps = (t, task) => {
	t.is(task.status, undefined);
	t.is(task.username, undefined);
	t.is(task.cpuTime, undefined);
	t.is(task.windowTitle, undefined);
	t.is(task.sessionName, undefined);
	t.is(task.sessionNumber, undefined);
};

const hasVerboseAppsProps = (t, task) => {
	t.is(typeof task.status, 'string');
	t.is(typeof task.username, 'string');
	t.is(typeof task.cpuTime, 'number');
	t.is(typeof task.windowTitle, 'string');
	t.is(typeof task.sessionName, 'string');
	t.is(typeof task.sessionNumber, 'number');
};

const hasModulesProps = (t, task) => {
	t.is(typeof task.imageName, 'string');
	t.is(typeof task.pid, 'number');
	t.true(Array.isArray(task.modules));
};

const hasServicesProps = (t, task) => {
	t.is(typeof task.imageName, 'string');
	t.is(typeof task.pid, 'number');
	t.true(Array.isArray(task.services));
};

const _call = opts => {
	return new Promise((resolve, reject) => {
		const tasks = [];
		try {
			const apiStream = tasklist.stream(opts);
			apiStream.on('data', data => tasks.push(data));
			apiStream.on('end', () => resolve(tasks));
			apiStream.on('error', error => reject(error));
		} catch (error) {
			reject(error);
		}
	});
};

const _callAndClose = opts => {
	return new Promise((resolve, reject) => {
		try {
			const apiStream = tasklist.stream(opts);
			apiStream.on('data', () => apiStream.end());
			apiStream.on('end', () => resolve());
			apiStream.on('error', error => reject(error));
		} catch (error) {
			reject(error);
		}
	});
};

const macro = async (t, options) => {
	const tasks = await _call(options);
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasDefaultTaskProps(t, task);

		if (options.verbose) {
			hasVerboseTaskProps(t, task);
		} else {
			hasNonVerboseTaskProps(t, task);
		}
	}
};

const macroPromise = async (t, options) => {
	const tasks = await tasklist(options);
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasDefaultTaskProps(t, task);

		if (options.verbose) {
			hasVerboseTaskProps(t, task);
		} else {
			hasNonVerboseTaskProps(t, task);
		}
	}
};

const appsMacro = async (t, options) => {
	const tasks = await _call(options);
	if (tasks.length === 0) {
		// TravisCI doesn't seem to have any apps so this test fails
		t.pass('Test passing with empty result, probably running inside TravisCI');
	} else {
		for (const task of tasks) {
			hasAppsProps(t, task);

			if (options.verbose) {
				hasVerboseAppsProps(t, task);
			} else {
				hasNonVerboseAppsProps(t, task);
			}
		}
	}
};

const appsMacroPromise = async (t, options) => {
	const tasks = await tasklist(options);
	if (tasks.length === 0) {
		// TravisCI doesn't seem to have any apps so this test fails
		t.pass('Test passing with empty result, probably running inside TravisCI');
	} else {
		for (const task of tasks) {
			hasAppsProps(t, task);

			if (options.verbose) {
				hasVerboseAppsProps(t, task);
			} else {
				hasNonVerboseAppsProps(t, task);
			}
		}
	}
};

test('[Stream interface] default', macro, {});
test('[Stream interface] verbose option', macro, {verbose: true});
test('[Stream interface] filter option', macro, {filter: ['sessionname eq console', 'username ne F4k3U53RN4M3']});

test('[Promise interface] default', macroPromise, {});
test('[Promise interface] verbose option', macroPromise, {verbose: true});
test('[Promise interface] filter option', macroPromise, {filter: ['sessionname eq console', 'username ne F4k3U53RN4M3']});

test('[Stream interface] apps', appsMacro, {apps: true});
test('[Stream interface] apps with verbose', appsMacro, {apps: true, verbose: true});

test('[Promise interface] apps', appsMacroPromise, {apps: true});
test('[Promise interface] apps with verbose', appsMacroPromise, {apps: true, verbose: true});

test('[Stream interface] modules', async t => {
	const tasks = await _call({modules: ''});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasModulesProps(t, task);
	}
});

test('[Promise interface] modules', async t => {
	const tasks = await tasklist({modules: ''});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasModulesProps(t, task);
	}
});

test('[Stream interface] services', async t => {
	const tasks = await _call({services: true});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasServicesProps(t, task);
	}
});

test('[Promise interface] services', async t => {
	const tasks = await tasklist({services: true});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasServicesProps(t, task);
	}
});

test('[Stream interface] test handle no matching tasks gracefully', async t => {
	const tasks = await _call({
		filter: ['imagename eq does-not-exist']
	});
	t.is(tasks.length, 0);
});

test('[Promise interface] test handle no matching tasks gracefully', async t => {
	const tasks = await tasklist({
		filter: ['imagename eq does-not-exist']
	});
	t.is(tasks.length, 0);
});

test('[Stream interface] test handle stream close gracefully', async t => {
	await t.notThrowsAsync(() => {
		return _callAndClose();
	});
});

test('[Global] reject windowtitle and status parameter filter for remote machine', async t => {
	await t.throwsAsync(() => {
		return _call({
			system: 'test',
			username: 'test',
			password: 'test',
			filter: ['Windowtitle eq asd']
		});
	});
});

test('[Global] reject verbose with /svc flag', async t => {
	await t.throwsAsync(() => {
		return _call({
			verbose: true,
			services: true
		});
	});
});

test('[Global] reject verbose with /m flag', async t => {
	await t.throwsAsync(() => {
		return _call({
			verbose: true,
			modules: ''
		});
	});
});
