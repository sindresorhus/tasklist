'use strict';
var test = require('ava');
var tasklist = require('./');

test(function (t) {
	t.plan(4);

	tasklist().then(function (data) {
		t.assert(data.length > 0);
		var d = data[0];
		t.assert(d.imageName.length > 0);
		t.assert(typeof d.pid === 'number');
		t.assert(typeof d.memUsage === 'number');
	});
});

test(function (t) {
	t.plan(4);

	tasklist({filter: ['status ne running']}).then(function (data) {
		t.assert(data.length > 0);
		var d = data[0];
		t.assert(d.imageName.length > 0);
		t.assert(typeof d.pid === 'number');
		t.assert(typeof d.memUsage === 'number');
	});
});
