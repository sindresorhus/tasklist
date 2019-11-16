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

const macro = async (t, options) => {
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

test('default', macro, {});
test('verbose option', macro, {verbose: true});
test('filter option', macro, {filter: ['sessionname eq console', 'username ne F4k3U53RN4M3']});

test('apps', appsMacro, {apps: true});
test('apps with verbose', appsMacro, {apps: true, verbose: true});

test('modules', async t => {
	const tasks = await tasklist({modules: ''});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasModulesProps(t, task);
	}
});

test('services', async t => {
	const tasks = await tasklist({services: true});
	t.true(tasks.length > 0);

	for (const task of tasks) {
		hasServicesProps(t, task);
	}
});

test('test handle no matching tasks gracefully', async t => {
	const tasks = await tasklist({
		filter: ['imagename eq does-not-exist']
	});
	t.is(tasks.length, 0);
});
