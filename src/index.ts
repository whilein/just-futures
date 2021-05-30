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
export type ErrorCallback = <ECast = Error>(input: ECast) => void;
export type ErrorMapCallback<A> = <ECast = Error>(input: ECast) => A;
export type CombineCallback<T, A, U> = (x: T, y: A) => U;

export class FuturePromiseError<T> extends Error {
    constructor(
        readonly rejectValue: T
    ) {
        super("Promise were rejected");
    }
}

export default class Future<T> {
    private value?: T | Error;
    private readonly callbacks: AnyCallback<T>[] = [];
    
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
        future.completeWithPromise(promise);

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

    private notify(value: T | Error) {
        while (this.callbacks.length) { 
            const callback = this.callbacks.shift();
            
            if (callback !== undefined) {
                callback(value);
            }
        }
    }

    isCompleted(): boolean {
        return this.value !== undefined;
    }

    getCompleted(): T | undefined {
        return this.value instanceof Error 
            ? undefined : this.value;
    }

    completeWithPromise(promise: Promise<T>) {
        promise.then(success => this.complete(success), error => this.complete(new FuturePromiseError(error)));
    }

    complete(value: T | Error): void {              
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }

        this.notify(this.value = value);
    }

    catch(callback: ErrorCallback): Future<T> {
        return this.when(result => {
            if (result instanceof Error) 
                callback(result);
        });
    }

    whenComplete<TCast = T>(callback: AnyCallback<TCast>): Future<T> {
        return this.when(result => callback(result as any as TCast));
    }

    then<TCast = T>(callback: SuccessCallback<TCast>): Future<T> {
        return this.when(result => {
            if (!(result instanceof Error)) 
                callback(result as any as TCast)
        });
    }

    onThat(action: (future: Future<T>) => any): Future<T> {
        action(this);
        return this;
    }
    
    mapPromise<A, TCast = T>(callback: SuccessMapCallback<TCast, Promise<A>>, errorCallback?: ErrorMapCallback<A>): Future<A> {
        const future = new Future<A>();

        this.when(input => {
            if (input instanceof Error) {
                if (errorCallback !== undefined)
                    future.complete(errorCallback(input as any as TCast));
                future.notify(input);
            } else {
                future.completeWithPromise(callback(input as any as TCast));
            }
        });

        return future;
    }

    map<A, TCast = T>(callback: SuccessMapCallback<TCast, A>, errorCallback?: ErrorMapCallback<A>): Future<A> {
        const future = new Future<A>();

        this.when(input => {
            if (input instanceof Error) {
                if (errorCallback !== undefined)
                    future.complete(errorCallback(input as any as TCast));
                future.notify(input);
            } else {
                future.complete(callback(input as any as TCast));
            }
        });

        return future;
    }

    compose<A, TCast = T>(callback: SuccessMapCallback<TCast, Future<A>>): Future<A> {
        const future = new Future<A>();

        this.when(input => {
            if (input instanceof Error) {
                future.notify(input);
                return;
            }

            callback(input as any as TCast).then(future.complete)
        });

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