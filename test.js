import test from 'ava';
import fn from './';

test('main', async t => {
	const data = await fn();

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
	t.is(d.memUsage, undefined);
});

test('verbose option', async t => {
	const data = await fn({verbose: true});

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
	t.is(typeof d.memUsage, 'number');
});

test('filter option (array)', async t => {
	const data = await fn({filter: ['status eq running', 'username ne F4k3U53RN4M3']});

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
});

test('filter option (string)', async t => {
	const data = await fn({filter: 'status eq running'});

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
});

test('apps option', async () => {
	await fn({apps: true});
});
