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

const macro = async (t, options) => {
	const tasks = await tasklist(options);

	console.log(t);
	console.log(tasks);

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

test('default', macro, {});
test('verbose option', macro, {verbose: true});
test('filter option', macro, {filter: ['status eq running', 'username ne F4k3U53RN4M3']});

test('test handle no matching tasks gracefully', async t => {
	const tasks = await tasklist({
		filter: ['imagename eq does-not-exist']
	});
	t.is(tasks.length, 0);
});
