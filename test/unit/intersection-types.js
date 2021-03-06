'use strict';

var JSIGSnippet = require('../lib/jsig-snippet.js');

JSIGSnippet.test('allow intersection of function and object', {
    snippet: function m() {/*
        function Foo(x) {
            this.x = x;
        }

        Foo.STATIC_TYPE = 'Foo';

        module.exports = Foo;
    */},
    header: function h() {/*
        type Foo : {
            x: String
        }

        Foo : {
            STATIC_TYPE: String
        } & (this: Foo, x: String) => void
    */}
}, function t(snippet, assert) {
    var meta = snippet.compileAndCheck(assert);
    var exported = meta.serializeType(meta.moduleExportsType);

    assert.equal(exported,
        '{ STATIC_TYPE: String } & ' +
        '(this: Foo, x: String) => void');

    assert.end();
});

JSIGSnippet.test('cannot assign function to object type', {
    snippet: function m() {/*
        function Foo(x) {
            this.x = x;
        }

        Foo.STATIC_TYPE = 'Foo';

        module.exports = Foo;
    */},
    header: function h() {/*
        type Foo : {
            x: String
        }

        Foo : {
            STATIC_TYPE: String
        } & {
            STATIC_TYPE2: String
        }
    */}
}, function t(snippet, assert) {
    var meta = snippet.compile(assert);
    var exported = meta.serializeType(meta.moduleExportsType);

    assert.equal(exported,
        '{ STATIC_TYPE: String } & { STATIC_TYPE2: String }');
    assert.equal(meta.errors.length, 1);

    var err = meta.errors[0];
    assert.equal(err.type, 'jsig.verify.found-unexpected-function');
    assert.equal(err.expected, '{ STATIC_TYPE2: String }');
    assert.equal(err.actual, 'Function');
    assert.equal(err.funcName, 'Foo');
    assert.equal(err.line, 1);

    assert.end();
});

JSIGSnippet.test('allow methods on intersection constructor', {
    snippet: function m() {/*
        function Foo(x) {
            this.x = x;
        }

        Foo.STATIC_TYPE = 'Foo';

        Foo.prototype.y = function y() {
            return this.x;
        };

        module.exports = Foo;
    */},
    header: function h() {/*
        type Foo : {
            x: String,

            y: (this: Foo) => String
        }

        Foo : {
            STATIC_TYPE: String
        } & (this: Foo, x: String) => void
    */}
}, function t(snippet, assert) {
    var meta = snippet.compileAndCheck(assert);
    var exported = meta.serializeType(meta.moduleExportsType);

    assert.equal(exported,
        '{ STATIC_TYPE: String } & ' +
        '(this: Foo, x: String) => void');

    assert.end();
});

JSIGSnippet.test('can pass intersection func to Function', {
    snippet: function m() {/*
        function Foo(x) {
            this.x = x;
        }

        Foo.STATIC_TYPE = 'Foo';

        util.inherits(Foo, Foo);

        module.exports = Foo;
    */},
    header: function h() {/*
        type Foo : {
            x: String
        }

        util : {
            inherits: (Function, Function) => void
        }

        Foo : {
            STATIC_TYPE: String
        } & (this: Foo, x: String) => void
    */}
}, function t(snippet, assert) {
    var meta = snippet.compileAndCheck(assert);
    var exported = meta.serializeType(meta.moduleExportsType);

    assert.equal(exported,
        '{ STATIC_TYPE: String } & ' +
        '(this: Foo, x: String) => void');

    assert.end();
});

JSIGSnippet.test('object intersection types', {
    snippet: function m() {/*
        var foo = {
            a: '',
            b: ''
        };

        foo.a.split('');
        foo.b.split('');
    */},
    header: function h() {/*
        foo : { a: String } & { b: String }
    */}
}, function t(snippet, assert) {
    var meta = snippet.compileAndCheck(assert);

    assert.equal(meta.errors.length, 0);
    assert.end();
});

// TEST: Object & Object intersection
