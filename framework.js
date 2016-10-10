/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />
"use strict";
const http = require('http');
// declare let responseTime: (req, res, next) => void
const responseTime = require('response-time');
const serveFavicon = require('serve-favicon');
let app = new Promise((resolve, reject) => {
    const cb = (req, res) => resolve([req, res]);
    http.createServer(cb).listen(3001, 'localhost');
});
let thenify = function (middleware) {
    return function ([req, res]) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve([req, res]);
            });
        });
    };
};
let favicon = thenify(serveFavicon('./favicon-bicycle.ico'));
let rt = function ([req, res]) {
    return new Promise((resolve, reject) => {
        responseTime(req, res, function () {
            resolve([req, res]);
        });
    });
};
app
    .then(([req, res]) => { res.write('Hello'); return [req, res]; })
    .then(([req, res]) => res.end(' hack'));
// .then(rt)
// app.then(
// console.log
// ) 
