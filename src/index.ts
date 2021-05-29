// Copyright 2021 Whilein
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type AnyCallback<T> = (input: T | Error) => void;
export type SuccessCallback<T> = (input: T) => void;
export type SuccessMapCallback<T, A> = (input: T) => A;
export type ErrorCallback = (input: Error) => void;
export type ErrorMapCallback<A> = (input: Error) => A;
export type CombineCallback<T, A, U> = (x: T, y: A) => U;

export default class Future<T> {
    private value?: T | Error;
    private callbacks: AnyCallback<T>[] = [];
    
    constructor(value?: T | Error) {
        this.value = value;
    }

    static incompleted<T>(): Future<T> {
        return new Future<T>();
    }

    static completed<T>(value: T): Future<T> {
        return new Future<T>(value);
    }

    static completedExceptionally<T>(error: Error): Future<T> {
        return new Future<T>(error);
    }

    static ofPromise<T>(promise: Promise<T>): Future<T> {
        const future = new Future<T>();
        promise.then(future.complete, future.complete);

        return future;
    }

    private when(callback: AnyCallback<T>): Future<T> {
        const value = this.value;

        if (value !== undefined) {
            callback(value);
        } else {
            this.callbacks.push(callback);
        }

        return this;
    }

    private whenError(callback: ErrorCallback): Future<T> {
        return this.when(result => {
            if (!(result instanceof Error)) { return; }
            callback(result);
        });
    }

    private whenSuccess(callback: SuccessCallback<T>): Future<T> {
        return this.when(result => {
            if (result instanceof Error) { return; }
            callback(result);
        });
    }

    catch(callback: ErrorCallback): Future<T> {
        return this.whenError(callback);
    }

    mapError<A>(callback: ErrorMapCallback<A>): Future<A> {
        const future = new Future<A>();
        this.whenError(input => future.complete(callback(input)));

        return future;
    }
    
    isCompleted(): boolean {
        return this.value !== undefined;
    }

    getCompleted(): T | undefined {
        return this.value instanceof Error 
            ? undefined : this.value;
    }

    complete(value: T | Error): void {
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }

        this.value = value;

        while (this.callbacks.length) { 
            const callback = this.callbacks.shift();
            
            if (callback !== undefined) {
                callback(value);
            }
        }
    }

    whenCompletethen<TCast = T>(callback: AnyCallback<TCast>): Future<T> {
        return this.when(result => callback(result as any as TCast));
    }

    then<TCast = T>(callback: SuccessCallback<TCast>): Future<T> {
        return this.whenSuccess(result => callback(result as any as TCast));
    }

    map<A, TCast = T>(callback: SuccessMapCallback<TCast, A>): Future<A> {
        const future = new Future<A>();
        this.whenSuccess(input => future.complete(callback(input as any as TCast)));

        return future;
    }

    compose<A, TCast = T>(callback: SuccessMapCallback<TCast, Future<A>>): Future<A> {
        const future = new Future<A>();
        this.whenSuccess(input => callback(input as any as TCast).then(future.complete));

        return future;
    }

    combine<A, U, TCast = T, ACast = A>(anotherFuture: Future<A>, callback: CombineCallback<TCast, ACast, U>): Future<U> {
        const future = new Future<U>();

        var stateThat: T;
        var stateAnother: A;

        function complete(that?: T, another?: A) {
            if (that !== undefined) 
                stateThat = that;

            if (another !== undefined)
                stateAnother = another;

            if (stateThat !== undefined && stateAnother !== undefined)
            future.complete(callback(stateThat as any as TCast, stateAnother as any as ACast));
        }

        this.then(input => complete(input, undefined));
        anotherFuture.then(input => complete(undefined, input));

        return future;
    }

}