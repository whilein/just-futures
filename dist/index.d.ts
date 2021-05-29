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
    whenCompletethen<TCast = T>(callback: AnyCallback<TCast>): Future<T>;
    then<TCast = T>(callback: SuccessCallback<TCast>): Future<T>;
    map<A, TCast = T>(callback: SuccessMapCallback<TCast, A>): Future<A>;
    compose<A, TCast = T>(callback: SuccessMapCallback<TCast, Future<A>>): Future<A>;
    combine<A, U, TCast = T, ACast = A>(anotherFuture: Future<A>, callback: CombineCallback<TCast, ACast, U>): Future<U>;
}
