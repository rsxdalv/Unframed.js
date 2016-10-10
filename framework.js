/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />
"use strict";
const http = require('http');
const responseTime = require('response-time');
const serveFavicon = require('serve-favicon');
const morgan = require('morgan');
let main = function () {
    http.createServer(function parser(req, res) {
        cascade(Promise.resolve({ req, res }));
    }).listen(3000, 'localhost');
}();
function pre(mw) {
    console.log('pre');
    return mw;
}
function post(mw) {
    console.log('post');
    return mw;
}
function cascade(Promise) {
    // Pre
    let start;
    let first = Promise.then(function (o) {
        start = new Date;
        return o;
    });
    // infix
    let infix = server(first);
    // let infix = server(Promise)
    // Post
    let ms;
    let last = infix.then(function ({ req, res }) {
        ms = new Date - start;
        console.log('%s %s - %s', req.method, req.url, ms);
    });
    return last;
}
function server(Promise) {
    return Promise
        .then(thenify(morgan('combined')))
        .then(({ req, res }) => { res.write('Hello'); return { req, res }; })
        .then(({ req, res }) => { res.end(' promises!'); return { req, res }; });
}
let thenify = function (middleware) {
    return function ({ req, res }) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res });
            });
        });
    };
};
let favicon = thenify(serveFavicon('./favicon-bicycle.ico'));
let rt = thenify(responseTime);
function parser(req, res) {
    Promise.resolve({ req, res })
        .then(favicon)
        .then(thenify(morgan('combined')))
        .then(({ req, res }) => { res.write('Hello'); return { req, res }; })
        .then(({ req, res }) => { res.write(', oh hi again '); return { req, res }; })
        .then(({ req, res }) => res.end(' hack'));
}
