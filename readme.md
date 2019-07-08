# tasklist [![Build Status](https://travis-ci.org/sindresorhus/tasklist.svg?branch=master)](https://travis-ci.org/sindresorhus/tasklist)

> Wrapper for the Windows [`tasklist`](https://technet.microsoft.com/en-us/library/bb491010.aspx) command. Returns a list of apps and services with their Process ID (PID) for all tasks running on either a local or a remote computer.

Cleans up and normalizes the data.


## Install

```
$ npm install tasklist
```

## Usage
```js
const tasklist = require('tasklist');
tasklist().on('data', (process) => console.log(process))
/*
{
    imageName: 'taskhostex.exe',
    pid: 1820,
    sessionName: 'Console',
    sessionNumber: 1,
    memUsage: 4415488
}…
*/
```


## API

See the [`tasklist` docs](https://technet.microsoft.com/en-us/library/bb491010.aspx) for more.

### tasklist(options?)

Returns a `Stream` that sends the running processes one-by-one.

#### options

Type: `object`

**Warning**
The `system`, `username`, `password` options must be specified together.  
The `modules` and `services` options can't be specified if verbose is set to `true`.  
The `modules` and `services` options can't be specified at the same time.  
When `system`, `username`, `password` options are specified, the filter option can't have `windowtitle` and `status` as the parameter.  

##### verbose

Type: `boolean`<br>
Default: `false`

Return verbose results.

Without the `verbose` and `apps` option, `taskkill` returns tasks with the following properties:

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

**Note:** It's not guaranteed that the `username` and `windowTitle` properties are returned with proper values. If they are *not available*, `'N/A'` may be returned on English systems. In contrast, `'Nicht zutreffend'` may be returned on German systems, for example.

**Verbose example:**

```js
const tasklist = require('tasklist');
tasklist({verbose: true}).on('data', (process) => console.log(process))
/*
{
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
*/
```

**Warning:** Using the `verbose` option may have a considerable performance impact (See: [#6](https://github.com/sindresorhus/tasklist/issues/6)).

##### system

Type: `string`

Name or IP address of a remote computer (don't use backslashes). The default is the local computer.

##### username

Type: `string`<br>
Example: `SINDRESORHU3930\\sindre`

User specified by `User` or `Domain\User`. The default is the permissions of the current logged on user on the computer issuing the command.

##### password

Type: `string`

Password of the user account for the specified `username`.

##### filter

Type: `array`

Specify the types of processes to include or exclude. [More info.](https://technet.microsoft.com/en-us/library/bb491010.aspx)

##### apps

Type: `boolean`

Displays store apps.  
Without the `verbose` option, the command returns the following data:
- `imageName` (Type: `string`)
- `pid` (Type: `number`)
- `memUsage` in bytes (Type: `number`)
- `packageName` (Type: `string`)

**Example:**

```js
const tasklist = require('tasklist');
tasklist({apps: true}).on('data', (app) => console.log(app))
/*
{
    imageName: 'SearchUI.exe (CortanaUI)',
    pid: 1820,
    memUsage: 4415488,
    packageName: 'Microsoft.Windows.Cortana'
}…
*/
```

With the `verbose` option set to `true`, the command additionally returns the following data:
- `sessionName` (Type: `string`)
- `sessionNumber` (Type: `number`)
- `status` (Type: `string`): One of `Running`, `Suspended`, `Not Responding`, or `Unknown`
- `username` (Type: `string`)
- `cpuTime` in seconds (Type: `number`)
- `windowTitle` (Type: `string`)

**Note:** It's not guaranteed that the `username` and `windowTitle` properties are returned with proper values. If they are *not available*, `'N/A'` may be returned on English systems. In contrast, `'Nicht zutreffend'` may be returned on German systems, for example.

**Verbose example:**

```js
const tasklist = require('tasklist');
tasklist({verbose: true, apps: true}).on('data', (process) => console.log(process))
/*
{
    imageName: 'SearchUI.exe (CortanaUI)',
    pid: 1820,
    sessionName: 'Console',
    sessionNumber: 1,
    memUsage: 4415488,
    status: 'Running',
    username: 'SINDRESORHU3930\\sindre'
    cpuTime: 0,
    windowTitle: 'N/A',
    packageName: 'Microsoft.Windows.Cortana'
}…
*/
```

##### modules

Type: `string`

List all tasks using the given DLL module name. If an empty string is given, it will list all tasks with the used DLL modules.  
**Note:** You can't use the `verbose` option with this option set

**Example:**

```js
const tasklist = require('tasklist');
tasklist({modules: 'wmiutils.dll'}).on('data', (task) => console.log(task))
/*
{
    imageName: 'chrome.exe',
    pid: 1820,
    modules: ['wmiutils.dll']
}…
*/
```

##### services

Type: `boolean`

Displays services hosted in each process.  
**Note:** You can't use the `verbose` option with this option set

**Example:**

```js
const tasklist = require('tasklist');
tasklist({services: true}).on('data', (service) => console.log(service))
/*
{
    imageName: 'lsass.exe',
    pid: 856,
    services: ['KeyIso', 'SamSs', 'VaultSvc']
}…
*/
```

## Related

- [taskkill](https://github.com/sindresorhus/taskkill) - Wrapper for the Windows `taskkill` command


## Maintainers

- [Sindre Sorhus](https://sindresorhus.com)
- [Mark Tiedemann](https://marksweb.site)
