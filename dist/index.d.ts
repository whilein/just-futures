export default class Future<T> {
    private value?;
    private ops;
    constructor(value?: T);
    static ofPromise<T>(promise: Promise<T>): Future<T>;
    private run;
    isCompleted(): boolean;
    getCompleted(): T | undefined;
    complete(value: T): void;
    then(op: (input: T) => void): Future<T>;
    map<A>(op: (input: T) => A): Future<A>;
    compose<A>(op: (input: T) => Future<A>): Future<A>;
    combine<A, U>(anotherFuture: Future<A>, op: (inputThat: T, inputAnother: A) => U): Future<U>;
}
