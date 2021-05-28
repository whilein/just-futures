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

type Operation<T> = (input: T | Error) => void;

export default class Future<T> {
    private value?: T | Error;
    private callbacks: Operation<T>[] = [];
    
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

    private when(callback: (result: T | Error) => void): Future<T> {
        const value = this.value;

        if (value !== undefined) {
            callback(value as Error);
        } else {
            this.callbacks.push(callback);
        }

        return this;
    }

    private whenError(callback: (error: Error) => void): Future<T> {
        return this.when(result => {
            if (!(result instanceof Error)) { return; }
            callback(result);
        });
    }

    private whenSuccess(callback: (input: T) => void): Future<T> {
        return this.when(result => {
            if (result instanceof Error) { return; }
            callback(result);
        });
    }

    catch(callback: (error: Error) => void): Future<T> {
        return this.whenError(callback);
    }

    mapError<A>(callback: (error: Error) => A): Future<A> {
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

    whenComplete(callback: (input: T | Error) => void): Future<T> {
        return this.when(callback);
    }

    then(callback: (input: T) => void): Future<T> {
        return this.whenSuccess(callback);
    }

    map<A>(callback: (input: T) => A): Future<A> {
        const future = new Future<A>();
        this.whenSuccess(input => future.complete(callback(input)));

        return future;
    }

    compose<A>(callback: (input: T) => Future<A>): Future<A> {
        const future = new Future<A>();
        this.whenSuccess(input => callback(input).then(future.complete));

        return future;
    }

    combine<A, U>(anotherFuture: Future<A>, callback: (inputThat: T, inputAnother: A) => U): Future<U> {
        const newFuture = new Future<U>();
        const thatFuture = this;

        var stateThat: T;
        var stateAnother: A;

        function complete(that?: T, another?: A) {
            if (that !== undefined) 
                stateThat = that;

            if (another !== undefined)
                stateAnother = another;

            if (stateThat !== undefined && stateAnother !== undefined)
                newFuture.complete(callback(stateThat, stateAnother));
        }

        thatFuture.then(input => complete(input, undefined));
        anotherFuture.then(input => complete(undefined, input));

        return newFuture;
    }

}