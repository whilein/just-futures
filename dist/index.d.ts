export declare type AnyCallback<T> = (input: T | Error) => void;
export declare type SuccessCallback<T> = (input: T) => void;
export declare type SuccessMapCallback<T, A> = (input: T) => A;
export declare type ErrorCallback = (input: Error) => void;
export declare type ErrorMapCallback<A> = (input: Error) => A;
export declare type CombineCallback<T, A, U> = (x: T, y: A) => U;
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
    catch(callback: ErrorCallback): Future<T>;
    mapError<A>(callback: ErrorMapCallback<A>): Future<A>;
    isCompleted(): boolean;
    getCompleted(): T | undefined;
    complete(value: T | Error): void;
    whenComplete(callback: AnyCallback<T>): Future<T>;
    then(callback: SuccessCallback<T>): Future<T>;
    map<A>(callback: SuccessMapCallback<T, A>): Future<A>;
    compose<A>(callback: SuccessMapCallback<T, Future<A>>): Future<A>;
    combine<A, U>(anotherFuture: Future<A>, callback: CombineCallback<T, A, U>): Future<U>;
}
