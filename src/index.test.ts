import Future from '.'

let future: Future<any>;

future = Future.incompleted<string>()
    .then(value => {
        test("Type is string", () => expect(typeof value).toBe('string'));
        test("String is '12345'", () => expect(value).toBe("12345"));
    });

future
    .map(parseInt)
    .map(value => value + 54321)
    .then(value => {
        test("Type is number", () => expect(typeof value).toBe('number'));
        test("Number is 66666", () => expect(value).toBe(66666));
    });

future.complete("12345");

future = Future.incompleted<any>()
    .then((value: number) => {
        test("Cast test", () => expect(typeof value).toBe('number'));
        test("Number is 100", () => expect(value).toBe(100));
    });

future.complete(100);