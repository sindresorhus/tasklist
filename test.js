import test from 'ava';
import fn from './';

test('main', async t => {
	const data = await fn();

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
	t.is(typeof d.memUsage, 'number');
});

test('filter option', async t => {
	const data = await fn({filter: ['status ne running']});

	t.true(data.length > 0);
	const d = data[0];
	t.true(d.imageName.length > 0);
	t.is(typeof d.pid, 'number');
	t.is(typeof d.memUsage, 'number');
});
