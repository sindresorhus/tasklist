import {Readable as ReadableStream} from 'node:stream';
import {expectError, expectType} from 'tsd';
import {
	tasklist,
	tasklistStream,
	type AppsTask,
	type DefaultTask,
	type ModulesTask,
	type Options,
	type ServicesTask,
	type Task,
	type VerboseAppsTask,
	type VerboseTask,
} from './index.js';

const options: Options = {verbose: true};

expectType<Promise<DefaultTask[]>>(tasklist());
expectType<Promise<DefaultTask[]>>(tasklist({}));
expectType<Promise<DefaultTask[]>>(tasklist({filter: ['sessionname eq console']}));
expectType<Promise<DefaultTask[]>>(tasklist({system: 'remote', username: 'user', password: 'pass'}));
expectType<Promise<VerboseTask[]>>(tasklist({verbose: true}));
expectType<Promise<AppsTask[]>>(tasklist({apps: true}));
expectType<Promise<VerboseAppsTask[]>>(tasklist({apps: true, verbose: true}));
expectType<Promise<ModulesTask[]>>(tasklist({modules: ''}));
expectType<Promise<ServicesTask[]>>(tasklist({services: true}));
expectType<Promise<Task[]>>(tasklist(options));

expectType<ReadableStream>(tasklistStream());
expectType<ReadableStream>(tasklistStream({verbose: true}));
expectType<ReadableStream>(tasklistStream({apps: true}));
expectType<ReadableStream>(tasklistStream({apps: true, verbose: true}));
expectType<ReadableStream>(tasklistStream({modules: ''}));
expectType<ReadableStream>(tasklistStream({services: true}));
expectType<ReadableStream>(tasklistStream({system: 'remote', username: 'user', password: 'pass'}));
expectType<ReadableStream>(tasklistStream(options));

expectError(tasklist({services: true, modules: ''}));
expectError(tasklist({services: true, verbose: true}));
expectError(tasklist({modules: '', verbose: true}));
expectError(tasklist({apps: true, modules: ''}));
expectError(tasklist({apps: true, services: true}));
expectError(tasklist({system: 'remote'}));
expectError(tasklist({username: 'user', password: 'pass'}));
