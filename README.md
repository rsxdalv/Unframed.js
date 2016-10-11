# unframed
## Least a framework can probably be

A 'framework' or rather a convention with utilities for linking existing 
code and simplifying common tasks.

# The principle
ES2015 has given JavaScript and Node.js Promises which is an abstract
object representing an asynchrounous task. From that logic, any server,
for instance a http web server, can be represented using a callback
function that accepts a promise.
```js
function( Promise ) { Promise.then({request, response} => { response.end('Hello, World!') })}
```
Such a function can use all the might of promises.  
However, to be middleware/monoid-like, it **must** return an expression which resolves 
to a single argument (limitation of promises) which is {request, 
response}  
This of course is just an enabling limitation that *should* be ignored at
the end of the responses, considering that the chain can contain database
requests and ultimately be piped into a template engine.

## Why not express? 
Express uses callback based code that becomes tortourous when implementing 
a view from external API with a database based cache.
## Don't we already have koa?
Koa enables yielding promises, however, also introduces a lot of additional 
complexity as it imposes an understanding of generators at a fundamental 
level. 

# Basic implementation

```js
require('http')
.createServer((req, res) => {
    Promise.resolve({ req, res })
        .then(({ req, res }) => { res.write('Hello'); return { req, res }; })        
        .then(({ req, res }) => { res.end(' World!'); return { req, res }; })        
})
    .listen(3000, 'localhost');
```

That's it.

# Utilities

Since such a framework has no native middleware, conversion utilities are
very useful.

## Thenify: express-style >> unframed .then

```js
function thenify(middleware) {
    return function ({ req, res }) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res });
            });
        });
    };
};
```
This function enables conversion between express style middleware and .then
style by creating a function that accepts {req, res} and replacing the next()
with a resolve callback of a new Promise. This function works on morgan and
serve-favicon, for example; however, misbehaves with 'response-time'.

## Advanced: Cascading | Suspended execution | generator functions

Phew. The real battle against Koa begins here. While cascade middleware is
possible, it's not the first class citizen as in Koa. TL;DR: The solution 
uses generator functions. And it's more of an journey of how it can be 
done by unlocking the power of promise chain.

### Wrapping

The simplest pattern of wrapping is this:

```js
...then(before).then(... encapsulated middleware ...).then(after) 
```

Problems arise when they have to share state.

### Shared state

Shared state between two functions can be done using suspended execution.
Using promise resolution asumes that the middleware inbetween might fail to
pass along the side effects. 

JavaScript allows for suspended execution through generator functions, by
blocking execution at every yield statement.

First, we need a function that matches the signature:
```js
{req, res} => {req, res}
```
### Returning
Because suspended execution requires calling next, the choice is to yield
the {req, res} that then gets returned to next for monoids behaviour. Same
goes for the return statement
```js
function*() {
    yield {req, res}
    return {req, res}
}
```
However, this returns {value, finished}, which needs to be exploded. One way
of doing that is by combining .then statements to resolve the value back to
{req, res}. A cleaner looking solution is to wrap the next statement:
```js
return {value} = iterator.next()
```

### Invocation
The outline above lacks a source for the {req, res}. For the first part,
it has to be supplied on inception. A curried function enables this:
```js
function roll(generator: any) {
    let i
    return function(o) {
        i = i || generator(o)
        let {value} = i.next(o)
        return value
    }
}
```
The result is a transformer function that takes a generator to later use when
it's passed a state. 

Now, in order to inherit the state, the generator functions have to conform more:
```js
function* ({req, res}) {
    {req, res} = yield {req, res}
    return {req, res}
}
```

### Binding

There's just one last problem: to remember to invoke the function twice, once
before, once after the execution of the chain.
```js
function bind(cc, start, infix) {
    return infix(start.then(cc)).then(cc)
}
```
The condition here is that CasCade is the suspended function, start is the first
promise in the chain to attach to, and infix is a function that both takes and
returns a promise.

### Result

Thus, if we bind a generator function for measuring time on our callback, this is
what we can make:
```js
function callback(flow) {
    return bind(
        roll(timer),
        flow,
        server)
}
```
```js
function server(flow) {
    return flow
        .then(thenify(morgan('combined')))
        .then(({req, res}) => { res.write('Hello'); return { req, res } })
        .then(({req, res}) => { res.end(' promises!'); return { req, res } })
}
```
```js
export let timer = function* ({req, res}: mw) {
    let start = Date.now();
    let {_req, _res} = yield {req, res};
    let ms = Date.now() - start;
    console.log('%s %s ms: %s', req.method, req.url, ms);
    return {_req, _res}
}
```