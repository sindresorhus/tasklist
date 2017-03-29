import test from 'ava';
import * as isCI from 'is-ci';
import fn from './';

const hasDefaultTaskProps = (t, d) => {
	t.is(typeof d.imageName, 'string');
	t.is(typeof d.pid, 'number');
	t.is(typeof d.sessionName, 'string');
	t.is(typeof d.sessionNumber, 'number');
	t.is(typeof d.memUsage, 'number');
};

const hasNonVerboseTaskProps = (t, d) => {
	t.is(d.status, undefined);
	t.is(d.username, undefined);
	t.is(d.cpuTime, undefined);
	t.is(d.windowTitle, undefined);
};

const hasVerboseTaskProps = (t, d) => {
	t.is(typeof d.status, 'string');
	t.is(typeof d.username, 'string');
	t.is(typeof d.cpuTime, 'number');
	if (!isCI) {
		t.is(typeof d.windowTitle, 'string');
	}
};

test('main', async t => {
	const data = await fn();

	t.true(data.length > 0);
	const d = data[0];
	hasDefaultTaskProps(t, d);
	hasNonVerboseTaskProps(t, d);
});

test('verbose option', async t => {
	const data = await fn({verbose: true});

	t.true(data.length > 0);
	const d = data[0];
	hasDefaultTaskProps(t, d);
	hasVerboseTaskProps(t, d);
});

test('filter option (array)', async t => {
	const data = await fn({filter: ['status eq running', 'username ne F4k3U53RN4M3']});

	t.true(data.length > 0);
	const d = data[0];
	hasDefaultTaskProps(t, d);
});
