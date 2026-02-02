import {Readable as ReadableStream} from 'node:stream';

export type DefaultTask = {
	/**
	Image name of the process.
	*/
	readonly imageName: string;

	/**
	Process ID.
	*/
	readonly pid: number;

	/**
	Session name.
	*/
	readonly sessionName: string;

	/**
	Session number.
	*/
	readonly sessionNumber: number;

	/**
	Memory usage in bytes.
	*/
	readonly memUsage: number;
};

export type VerboseTask = DefaultTask & {
	/**
	Status of the process.

	One of `Running`, `Suspended`, `Not Responding`, or `Unknown`.
	*/
	readonly status: string;

	/**
	User name of the process owner.
	*/
	readonly username: string;

	/**
	CPU time in seconds.
	*/
	readonly cpuTime: number;

	/**
	Window title.
	*/
	readonly windowTitle: string;
};

export type AppsTask = {
	/**
	Image name of the process.
	*/
	readonly imageName: string;

	/**
	Process ID.
	*/
	readonly pid: number;

	/**
	Memory usage in bytes.
	*/
	readonly memUsage: number;

	/**
	Package name of the store app.
	*/
	readonly packageName: string;
};

export type VerboseAppsTask = AppsTask & {
	/**
	Session name.
	*/
	readonly sessionName: string;

	/**
	Session number.
	*/
	readonly sessionNumber: number;

	/**
	Status of the process.

	One of `Running`, `Suspended`, `Not Responding`, or `Unknown`.
	*/
	readonly status: string;

	/**
	User name of the process owner.
	*/
	readonly username: string;

	/**
	CPU time in seconds.
	*/
	readonly cpuTime: number;

	/**
	Window title.
	*/
	readonly windowTitle: string;
};

export type ModulesTask = {
	/**
	Image name of the process.
	*/
	readonly imageName: string;

	/**
	Process ID.
	*/
	readonly pid: number;

	/**
	List of loaded modules.
	*/
	readonly modules: readonly string[];
};

export type ServicesTask = {
	/**
	Image name of the process.
	*/
	readonly imageName: string;

	/**
	Process ID.
	*/
	readonly pid: number;

	/**
	List of hosted services.
	*/
	readonly services: readonly string[];
};

export type Task = DefaultTask | VerboseTask | AppsTask | VerboseAppsTask | ModulesTask | ServicesTask;

type LocalConnectionOptions = {
	readonly system?: undefined;
	readonly username?: undefined;
	readonly password?: undefined;
};

type RemoteConnectionOptions = {
	readonly system: string;
	readonly username: string;
	readonly password: string;
};

type ConnectionOptions = LocalConnectionOptions | RemoteConnectionOptions;

type OptionsBase = {
	/**
	Return verbose results.

	Without the `verbose` and `apps` option, `tasklist` returns tasks with the following properties:

	- `imageName` (Type: `string`)
	- `pid` (Type: `number`)
	- `sessionName` (Type: `string`)
	- `sessionNumber` (Type: `number`)
	- `memUsage` in bytes (Type: `number`)

	With the `verbose` option set to `true` but the `apps` option still set to `false`, it additionally returns the following properties:

	- `status` (Type: `string`): One of `Running`, `Suspended`, `Not Responding`, or `Unknown`
	- `username` (Type: `string`)
	- `cpuTime` in seconds (Type: `number`)
	- `windowTitle` (Type: `string`)

	Note: It's not guaranteed that the `username` and `windowTitle` properties are returned with proper values. If they are not available, `'N/A'` may be returned on English systems. In contrast, `'Nicht zutreffend'` may be returned on German systems, for example.

	Verbose example:

	```
	import {tasklist} from 'tasklist';

	console.log(await tasklist({verbose: true}));
	/*
	[
		{
			imageName: 'taskhostex.exe',
			pid: 1820,
			sessionName: 'Console',
			sessionNumber: 1,
			memUsage: 4415488,
			status: 'Running',
			username: 'SINDRESORHU3930\\sindre',
			cpuTime: 0,
			windowTitle: 'Task Host Window'
		},
		...
	]
	*/
	```

	Warning: Using the `verbose` option may have a considerable performance impact (See: [#6](https://github.com/sindresorhus/tasklist/issues/6)).

	@default false
	*/
	readonly verbose?: boolean;

	/**
	Name or IP address of a remote computer (don't use backslashes). The default is the local computer.
	*/
	readonly system?: string;

	/**
	User specified by `User` or `Domain\\User`. The default is the permissions of the current logged on user on the computer issuing the command.

	Example: `'SINDRESORHU3930\\sindre'`
	*/
	readonly username?: string;

	/**
	Password of the user account for the specified `username`.
	*/
	readonly password?: string;

	/**
	Specify the types of processes to include or exclude. [More info.](https://technet.microsoft.com/en-us/library/bb491010.aspx)
	*/
	readonly filter?: readonly string[];

	/**
	Displays store apps.

	Without the `verbose` option, the command returns the following data:

	- `imageName` (Type: `string`)
	- `pid` (Type: `number`)
	- `memUsage` in bytes (Type: `number`)
	- `packageName` (Type: `string`)

	```
	import {tasklist} from 'tasklist';

	console.log(await tasklist({apps: true}));
	/*
	[
		{
			imageName: 'SearchUI.exe (CortanaUI)',
			pid: 1820,
			memUsage: 4415488,
			packageName: 'Microsoft.Windows.Cortana'
		},
		...
	]
	*/
	```

	With the `verbose` option set to `true`, the command additionally returns the following data:

	- `sessionName` (Type: `string`)
	- `sessionNumber` (Type: `number`)
	- `status` (Type: `string`): One of `Running`, `Suspended`, `Not Responding`, or `Unknown`
	- `username` (Type: `string`)
	- `cpuTime` in seconds (Type: `number`)
	- `windowTitle` (Type: `string`)

	Note: It's not guaranteed that the `username` and `windowTitle` properties are returned with proper values. If they are not available, `'N/A'` may be returned on English systems. In contrast, `'Nicht zutreffend'` may be returned on German systems, for example.

	Verbose example:

	```
	import {tasklist} from 'tasklist';

	console.log(await tasklist({apps: true, verbose: true}));
	/*
	[
		{
			imageName: 'SearchUI.exe (CortanaUI)',
			pid: 1820,
			sessionName: 'Console',
			sessionNumber: 1,
			memUsage: 4415488,
			status: 'Running',
			username: 'SINDRESORHU3930\\sindre',
			cpuTime: 0,
			windowTitle: 'N/A',
			packageName: 'Microsoft.Windows.Cortana'
		},
		...
	]
	*/
	```

	@default false
	*/
	readonly apps?: boolean;

	/**
	List all tasks using the given DLL module name. If an empty string is given, it will list all tasks with the used DLL modules.

	Note: You can't use the `verbose` option with this option set.

	Example:

	```
	import {tasklist} from 'tasklist';

	console.log(await tasklist({modules: 'wmiutils.dll'}));
	/*
	[{
		imageName: 'chrome.exe',
		pid: 1820,
		modules: ['wmiutils.dll']
	}, ...]
	*/
	```
	*/
	readonly modules?: string;

	/**
	Displays services hosted in each process.

	Note: You can't use the `verbose` option with this option set.

	Example:

	```
	import {tasklist} from 'tasklist';

	console.log(await tasklist({services: true}));
	/*
	[{
		imageName: 'lsass.exe',
		pid: 856,
		services: ['KeyIso', 'SamSs', 'VaultSvc']
	}, ...]
	*/
	```
	*/
	readonly services?: boolean;
};

type DefaultOptions = ConnectionOptions & OptionsBase & {
	readonly verbose?: false;
	readonly apps?: false;
	readonly modules?: undefined;
	readonly services?: false;
};

type DefaultVerboseOptions = ConnectionOptions & OptionsBase & {
	readonly verbose: true;
	readonly apps?: false;
	readonly modules?: undefined;
	readonly services?: false;
};

type AppsOptions = ConnectionOptions & OptionsBase & {
	readonly apps: true;
	readonly verbose?: false;
	readonly modules?: undefined;
	readonly services?: false;
};

type AppsVerboseOptions = ConnectionOptions & OptionsBase & {
	readonly apps: true;
	readonly verbose: true;
	readonly modules?: undefined;
	readonly services?: false;
};

type ModulesOptions = ConnectionOptions & OptionsBase & {
	readonly modules: string;
	readonly verbose?: false;
	readonly apps?: false;
	readonly services?: false;
};

type ServicesOptions = ConnectionOptions & OptionsBase & {
	readonly services: true;
	readonly verbose?: false;
	readonly apps?: false;
	readonly modules?: undefined;
};

/**
Options for `tasklist`.

Warning:
- The `system`, `username`, `password` options must be specified together.
- The `modules` and `services` options can't be specified if verbose is set to `true`.
- The `modules` and `services` options can't be specified at the same time.
- The `apps` option can't be specified with `modules` or `services`.
- When `system`, `username`, `password` options are specified, the filter option can't have `windowtitle` and `status` as the parameter.
*/
export type Options = DefaultOptions | DefaultVerboseOptions | AppsOptions | AppsVerboseOptions | ModulesOptions | ServicesOptions;

/**
Wrapper for the Windows `tasklist` command. Returns a list of apps and services with their Process ID (PID) for all tasks running on either a local or a remote computer.

Cleans up and normalizes the data.

@returns Normalized results of the command output.

@example
```
import {tasklist} from 'tasklist';

console.log(await tasklist());
/*
[
	{
		imageName: 'taskhostex.exe',
		pid: 1820,
		sessionName: 'Console',
		sessionNumber: 1,
		memUsage: 4415488
	},
	...
]
*/
```
*/
export function tasklist(options?: DefaultOptions): Promise<DefaultTask[]>;
export function tasklist(options: DefaultVerboseOptions): Promise<VerboseTask[]>;
export function tasklist(options: AppsOptions): Promise<AppsTask[]>;
export function tasklist(options: AppsVerboseOptions): Promise<VerboseAppsTask[]>;
export function tasklist(options: ModulesOptions): Promise<ModulesTask[]>;
export function tasklist(options: ServicesOptions): Promise<ServicesTask[]>;
export function tasklist(options?: Options): Promise<Task[]>;

/**
Returns a `stream.Readable` that returns the resulting lines, normalized, one by one.

Options are the same as the Promise interface.

@returns A readable stream of normalized tasks.

@example
```
import {tasklistStream} from 'tasklist';

tasklistStream({verbose: true}).pipe(process.stdout);
/*
{
	imageName: 'taskhostex.exe',
	pid: 1820,
	sessionName: 'Console',
	sessionNumber: 1,
	memUsage: 4415488,
	status: 'Running',
	username: 'SINDRESORHU3930\\sindre',
	cpuTime: 0,
	windowTitle: 'Task Host Window'
}
...
*/
```
*/
export function tasklistStream(options?: DefaultOptions): ReadableStream;
export function tasklistStream(options: DefaultVerboseOptions): ReadableStream;
export function tasklistStream(options: AppsOptions): ReadableStream;
export function tasklistStream(options: AppsVerboseOptions): ReadableStream;
export function tasklistStream(options: ModulesOptions): ReadableStream;
export function tasklistStream(options: ServicesOptions): ReadableStream;
export function tasklistStream(options?: Options): ReadableStream;
