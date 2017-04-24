const test = require('ava');
const tasklist = require('./');

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

const makeTest = (options, t) => {
	return tasklist(options).then(tasks => {
		t.true(tasks.length > 0);
		tasks.forEach(task => {
			hasDefaultTaskProps(t, task);
			if (options.verbose) {
				hasVerboseTaskProps(t, task);
			} else {
				hasNonVerboseTaskProps(t, task);
			}
		});
	});
};

test('default', t =>
	makeTest({}, t));

test('verbose option', t =>
	makeTest({verbose: true}, t));

test('filter option', t =>
	makeTest({filter: ['status eq running', 'username ne F4k3U53RN4M3']}, t));
