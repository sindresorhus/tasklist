import test from 'ava';
import {tasklist} from '../index.js';

test('reject windowtitle and status parameter filter for remote machine', async t => {
	await t.throwsAsync(
		tasklist({
			system: 'test',
			username: 'test',
			password: 'test',
			filter: ['Windowtitle eq asd'],
		}),
	);
});

test('reject /svc with /m flag', async t => {
	await t.throwsAsync(
		tasklist({
			services: true,
			modules: '',
		}),
	);
});

test('reject verbose with /svc flag', async t => {
	await t.throwsAsync(
		tasklist({
			verbose: true,
			services: true,
		}),
	);
});

test('reject verbose with /m flag', async t => {
	await t.throwsAsync(
		tasklist({
			verbose: true,
			modules: '',
		}),
	);
});

test('reject system without username and password', async t => {
	await t.throwsAsync(
		tasklist({
			system: '192.168.1.1',
		}),
	);
});
