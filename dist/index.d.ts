export default class Future<T> {
    private value?;
    private callbacks;
    constructor(value?: T | Error);
    static incompleted<T>(): Future<T>;
    static completed<T>(value: T): Future<T>;
    static completedExceptionally<T>(error: Error): Future<T>;
    static ofPromise<T>(promise: Promise<T>): Future<T>;
    private when;
    private whenError;
    private whenSuccess;
    catch(callback: (error: Error) => void): Future<T>;
    mapError<A>(callback: (error: Error) => A): Future<A>;
    isCompleted(): boolean;
    getCompleted(): T | undefined;
    complete(value: T | Error): void;
    whenComplete(callback: (input: T | Error) => void): Future<T>;
    then(callback: (input: T) => void): Future<T>;
    map<A>(callback: (input: T) => A): Future<A>;
    compose<A>(callback: (input: T) => Future<A>): Future<A>;
    combine<A, U>(anotherFuture: Future<A>, callback: (inputThat: T, inputAnother: A) => U): Future<U>;
}
