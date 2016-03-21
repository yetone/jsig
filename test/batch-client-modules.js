'use strict';

var test = require('tape');
var path = require('path');

var compile = require('../type-checker/');

var batchClientDir = path.join(__dirname, 'batch-client-modules');

test('working method calls within a closure', function t(assert) {
    var file = getFile('good-working-require1.js');

    var meta = compile(file);
    assert.ok(meta, 'expected meta to exist');
    assert.equal(meta.errors.length, 0, 'expected one error');
    assert.ok(meta.moduleExportsType, 'expected export to exist');

    console.log('e', meta.errors);

    assert.end();
});

function getFile(fileName) {
    return path.join(batchClientDir, fileName);
}
