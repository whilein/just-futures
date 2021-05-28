## About
[![npm](https://img.shields.io/npm/dw/just-futures)](https://www.npmjs.com/package/just-futures)

That simple library allows you to work with 'Futures': map, combine and compose them

## Examples
```ts
const future = Future.incompleted<number>(); // also you can use new Future<number>();
future.map(num => num * 10 / 2).then(console.log); // 5
future.map(num => `Number: ${num}`).then(console.log); // Number: 5
future.complete(1);
```

```ts
const future = Future.ofPromise(...)
    .map(value => ...)
    .compose(value => Future.ofPromise(...))
    .combine(Future.ofPromise(...), (x, y) => ...)
    .then(console.log);
```