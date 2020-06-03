declare namespace tasklist {
  interface ProcessDescriptor {
    readonly imageName?: string;
    readonly pid?: number;
    readonly sessionNumber?: number;
    readonly sessionName?: string;
  }
}

/**
Get running processes.
@returns List of running processes.
@example
```
import tasklist = require('tasklist');

(async () => {
	console.log(await tasklist());
})();
```
*/
declare function tasklist(): Promise<tasklist.ProcessDescriptor[]>;

export = tasklist;
