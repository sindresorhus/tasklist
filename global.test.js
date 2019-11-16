import test from 'ava';
import tasklist from '.';

test('reject windowtitle and status parameter filter for remote machine', async t => {
	await t.throwsAsync(() => {
		return tasklist({
			system: 'test',
			username: 'test',
			password: 'test',
			filter: ['Windowtitle eq asd']
		});
	});
});

test('reject /svc with /m flag', async t => {
	await t.throwsAsync(() => {
		return tasklist({
			services: true,
			modules: ''
		});
	});
});

test('reject verbose with /svc flag', async t => {
	await t.throwsAsync(() => {
		return tasklist({
			verbose: true,
			services: true
		});
	});
});

test('reject verbose with /m flag', async t => {
	await t.throwsAsync(() => {
		return tasklist({
			verbose: true,
			modules: ''
		});
	});
});
