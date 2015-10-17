# tasklist [![Build status](https://ci.appveyor.com/api/projects/status/5yav2915fx0f3d0n/branch/master?svg=true)](https://ci.appveyor.com/project/sindresorhus/tasklist/branch/master)

> Wrapper for the Windows [`tasklist`](https://technet.microsoft.com/en-us/library/bb491010.aspx) command. Returns a list of apps and services with their Process ID (PID) for all tasks running on either a local or a remote computer.

Cleans up and normalizes the data.


## Install

```
$ npm install --save tasklist
```


## Usage

```js
const tasklist = require('tasklist');

tasklist().then(data => {
	console.log(data);
	/*
	[{
		imageName: 'taskhostex.exe',
		pid: 1820,
		sessionName: 'Console',
		sessionNumber: 1,
		memUsage: 4415488,  // bytes
		status: 'Running',
		username: 'SINDRESORHU3930\\sindre
		cpuTime: 0,  // seconds
		windowTitle: 'Task Host Window'
	}, ...]
	*/
});
```


## API

See the [`tasklist` docs](https://technet.microsoft.com/en-us/library/bb491010.aspx) for more.


### tasklist([options])

Returns a promise for an array of running tasks.

#### options

The `system`, `username`, `password` options are mutually inclusive.

##### system

Type: `string`

Name or IP address of a remote computer (do not use backslashes). The default is the local computer.

##### username

Type: `string`

User specified by User or Domain\User. The default is the permissions of the current logged on user on the computer issuing the command.

##### password

Type: `string`

Password of the user account for the specified `username`.

##### filter

Type: `array`

Specify the types of processes to include or exclude. [More info.](https://technet.microsoft.com/en-us/library/bb491010.aspx)


## Related

- [taskkill](https://github.com/sindresorhus/taskkill) - Wrapper for the Windows `taskkill` command


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
