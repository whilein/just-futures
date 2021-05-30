export declare type AnyCallback<T> = (input: T | Error) => void;
export declare type SuccessCallback<T> = (input: T) => void;
export declare type SuccessMapCallback<T, A> = (input: T) => A;
export declare type ErrorCallback = <ECast = Error>(input: ECast) => void;
export declare type ErrorMapCallback<A> = <ECast = Error>(input: ECast) => A;
export declare type CombineCallback<T, A, U> = (x: T, y: A) => U;
export declare class FuturePromiseError<T> extends Error {
    readonly rejectValue: T;
    constructor(rejectValue: T);
}
export default class Future<T> {
    private value?;
    private readonly callbacks;
    constructor(value?: T | Error);
    static incompleted<T>(): Future<T>;
    static completed<T>(value: T): Future<T>;
    static completedExceptionally<T>(error: Error): Future<T>;
    static ofPromise<T>(promise: Promise<T>): Future<T>;
    private when;
    private notify;
    isCompleted(): boolean;
    getCompleted(): T | undefined;
    completeWithPromise(promise: Promise<T>): void;
    complete(value: T | Error): void;
    catch(callback: ErrorCallback): Future<T>;
    whenComplete<TCast = T>(callback: AnyCallback<TCast>): Future<T>;
    then<TCast = T>(callback: SuccessCallback<TCast>): Future<T>;
    onThat(action: (future: Future<T>) => any): Future<T>;
    mapPromise<A, TCast = T>(callback: SuccessMapCallback<TCast, Promise<A>>, errorCallback?: ErrorMapCallback<A>): Future<A>;
    map<A, TCast = T>(callback: SuccessMapCallback<TCast, A>, errorCallback?: ErrorMapCallback<A>): Future<A>;
    compose<A, TCast = T>(callback: SuccessMapCallback<TCast, Future<A>>): Future<A>;
    combine<A, U, TCast = T, ACast = A>(anotherFuture: Future<A>, callback: CombineCallback<TCast, ACast, U>): Future<U>;
}
