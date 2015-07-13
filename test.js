'use strict';
var test = require('ava');
var tasklist = require('./');

test(function (t) {
	t.plan(5);

	tasklist(function (err, data) {
		t.assert(!err, err);
		t.assert(data.length > 0);
		var d = data[0];
		t.assert(d.imageName.length > 0);
		t.assert(typeof d.pid === 'number');
		t.assert(typeof d.memUsage === 'number');
	});
});

test(function (t) {
	t.plan(5);

	tasklist({filter: ['status ne running']}, function (err, data) {
		t.assert(!err, err);
		t.assert(data.length > 0);
		var d = data[0];
		t.assert(d.imageName.length > 0);
		t.assert(typeof d.pid === 'number');
		t.assert(typeof d.memUsage === 'number');
	});
});
