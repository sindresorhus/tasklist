import {expectType} from 'tsd-check';
import {Stream} from 'stream';
import getStream from 'get-stream';
import * as tasklist from './index';

// Test promise interface types
expectType<Promise<tasklist.ResultRow[]>>(tasklist());

// Test stream interface types
expectType<tasklist.ResultStream>(tasklist.stream());

// Test stream interface result type
expectType<Promise<tasklist.ResultRow[]>>(getStream.array(tasklist.stream()));

// Test verbose + default options
expectType<Promise<tasklist.ResultRow[]>>(tasklist({verbose: true}));

// Test apps option
expectType<Promise<tasklist.ResultRow[]>>(tasklist({apps: true}));

// Test apps + verbose option
expectType<Promise<tasklist.ResultRow[]>>(tasklist({apps: true, verbose: true}));

// Test modules option
expectType<Promise<tasklist.ResultRow[]>>(tasklist({modules: ''}));

// Test services option
expectType<Promise<tasklist.ResultRow[]>>(tasklist({services: true}));