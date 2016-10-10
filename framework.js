/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />
"use strict";
const http = require('http');
const responseTime = require('response-time');
const serveFavicon = require('serve-favicon');
exports.main = function () {
    http.createServer(function parser(req, res) {
        newCascade({ req, res });
        // newCascade(Promise.resolve({ req, res }))
    }).listen(3000, 'localhost');
};
function roll(a, mw) {
    let i = a(mw);
    let f = i.next.bind(i);
    return function () {
        let { value } = f();
        return value;
    };
}
exports.roll = roll;
exports.timer = function* (o) {
    let start = Date.now();
    o = yield o;
    let ms = Date.now() - start;
    console.log('ms: %s', ms);
    // console.log('%s %s - %s', this.method, this.url, ms);
};
function collapse(Promise, infix) {
    // Pre
    let start;
    return infix(Promise.then(function (o) {
        start = new Date;
        return o;
    })).then(function ({ req, res }) {
        let ms = new Date - start;
        console.log('%s %s - %s', req.method, req.url, ms);
    });
}
exports.collapse = collapse;
function bind(cc, start, infix) {
    return infix(start.then(cc)).then(cc);
}
exports.bind = bind;
function newCascade(flow) {
    return bind(roll(exports.timer, flow), 
    // mw => {
    //     console.log('preafter')
    //     return mw
    // },
    Promise.resolve(flow), server);
}
exports.newCascade = newCascade;
exports.thenify = function (middleware) {
    return function ({ req, res }) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res });
            });
        });
    };
};
exports.favicon = exports.thenify(serveFavicon('./favicon-bicycle.ico'));
exports.rt = exports.thenify(responseTime);
function server(flow) {
    return flow
        .then(({ req, res }) => { res.write('Hello'); return { req, res }; })
        .then(({ req, res }) => { res.end(' promises!'); return { req, res }; });
}
exports.server = server;
