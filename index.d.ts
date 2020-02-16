/// <reference types="node"/>
import {Readable as ReadableStream} from 'stream';

declare namespace tasklist {
	type Options = {
		/**
		Make tasklist output more info

		Note: Can't be used with `modules` or `services` options
		@default false

		@example
		```
		const tasklist = require('tasklist');
		(async () => {
			console.log(await tasklist({verbose: true}));
			//=> [{
				imageName: 'taskhostex.exe',
				pid: 1820,
				sessionName: 'Console',
				sessionNumber: 1,
				memUsage: 4415488,
				status: 'Running',
				username: 'SINDRESORHU3930\\sindre'
				cpuTime: 0,
				windowTitle: 'Task Host Window'
			}, …]
		})();
		```
		*/
		readonly verbose?: Boolean

		/**
		Return store apps

		@default false

		@example
		```js
		const tasklist = require('tasklist');

		(async () => {
			console.log(await tasklist({apps: true}));
			//=> [{
				imageName: 'SearchUI.exe (CortanaUI)',
				pid: 1820,
				memUsage: 4415488,
				packageName: 'Microsoft.Windows.Cortana'
			}, …]
		})();
		```
		*/
		readonly apps?: Boolean

		/**
		List all service information for each process

		Note: Can't be used with `verbose` or `modules` options
		@default false

		@example
		```js
		const tasklist = require('tasklist');

		(async () => {
			console.log(await tasklist({services: true}));
			//=> [{
				imageName: 'lsass.exe',
				pid: 856,
				services: ['KeyIso', 'SamSs', 'VaultSvc']
			}, …]
		})();
		```
		*/
		readonly services?: Boolean

		/**
		Show tasks that loaded the specified DLL modules

		Note: Can't be used with `verbose` or `services` options
		@default undefined

		@example
		```js
		const tasklist = require('tasklist');

		(async () => {
			console.log(await tasklist({modules: 'wmiutils.dll'}));
			//=> [{
				imageName: 'chrome.exe',
				pid: 1820,
				modules: ['wmiutils.dll']
			}, …]
		})();
		```
		*/
		readonly modules?: String

		/**
		The IP address or hostname of the remote machine

		@default undefined
		*/
		readonly system?: String

		/**
		The username of the remote machine

		@default undefined
		*/
		readonly username?: String

		/**
		The password of the remote machine

		@default undefined
		*/
		readonly password?: String

		/**
		Filters to pass to the command

		Note: Windowtitle and Status parameters can't be used for filtering, when executing on a remote machine
		@default undefined
		*/
		readonly filter?: String[]
	};

	interface ResultRow {
		/**
		Name of the executed image

		@default "N/A"
		*/
		readonly imageName: string;

		/**
		PID of the process

		@default -1
		*/
		readonly pid: number;

		/**
		The name of the session the process is running in
		
		Note: Available with default options, or with `apps` option if the `verbose` option is set
		@default "N/A"
		*/
		readonly sessionName?: string;

		/**
		The number of the session the process is running in
		
		Note: Available with default options, or with `apps` option if the `verbose` option is set
		@default -1
		*/
		readonly sessionNumber?: number;

		/**
		The memory usage of the process in bytes
		
		Note: Only available if the `verbose` option is set
		@default -1
		*/
		readonly memUsage?: number;

		/**
		Status of the process

		Note: Only available if the `verbose` option is set
		@default "N/A"
		*/
		readonly status?: string;

		/**
		The name of the user who started the process

		Note: Only available if the `verbose` option is set
		@default "N/A"
		*/
		readonly username?: string;

		/**
		CPU time used since the start of the process in seconds

		Note: Only available if the `verbose` option is set
		@default "N/A"
		*/
		readonly cpuTime?: number;

		/**
		Title of the process's main window

		Note: Only available if the `verbose` option is set
		@default "N/A"
		*/
		readonly windowTitle?: string;

		/**
		The application's package name

		Note: Only available if the `apps` option has been set
		@default "N/A"
		*/
		readonly packageName?: string;

		/**
		List of DLLs loaded by the process

		Note: Only available if the `modules` option has been set
		@default ["N/A"]
		*/
		readonly modules?: string[];

		/**
		List of services executed by the process

		Note: Only available if the `services` option has been set
		@default ["N/A"]
		*/
		readonly services?: string[];
	}
}

/**
Execute tasklist.exe commands and get parsed results
*/
declare const tasklist: {
	/**
	Execute tasklist.exe with the specified options and return a promise with the results

	@param options - The options to pass to tasklist.exe
	@returns The results of the executed command

	@example
	```
	const tasklist = require('tasklist');

	(async () => {
		console.log(await tasklist());
		//=> [{
			imageName: 'taskhostex.exe',
			pid: 1820,
			sessionName: 'Console',
			sessionNumber: 1,
			memUsage: 4415488
		}, …]
	})();
	```
	*/
	(options?: tasklist.Options): Promise<tasklist.ResultRow[]>;

	/**
	Execute tasklist.exe with the specified options

	@param options - The options to pass to tasklist.exe
	@returns The results of the executed command

	@example
	```
	const tasklist = require('tasklist');
	tasklist.stream({verbose: true}).on('data', (process) => console.log(process))
	//=> {
		imageName: 'taskhostex.exe',
		pid: 1820,
		sessionName: 'Console',
		sessionNumber: 1,
		memUsage: 4415488,
		status: 'Running',
		username: 'SINDRESORHU3930\\sindre'
		cpuTime: 0,
		windowTitle: 'Task Host Window'
	}…
```
	*/
	stream(options?: tasklist.Options): ReadableStream;
}

export = tasklist;
