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

export default class Future<T> {
    private value?: T;
    private ops: ((input: T) => void)[] = [];
    
    private run(op: (input: T) => void): Future<T> {
        if (this.value !== undefined) {
            op(this.value);
        } else {
            this.ops.push(op);
        }

        return this;
    } 
    
    isCompleted(): boolean {
        return this.value !== undefined;
    }

    getCompleted(): T | undefined {
        return this.value;
    }

    complete(value: T): void {
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }

        this.value = value;

        while (this.ops.length) { 
            const op = this.ops.pop();
            
            if (op !== undefined) {
                op(value);
            }
        }
    }

    await(): T {
        throw new Error('TODO');
    }

    then(op: (input: T) => void): Future<T> {
        return this.run(op);
    }

    map<A>(op: (input: T) => A): Future<A> {
        const future = new Future<A>();
        this.run((input) => future.complete(op(input)));

        return future;
    }

    compose<A>(op: (input: T) => Future<A>): Future<A> {
        const future = new Future<A>();
        this.run((input) => op(input).then(future.complete));

        return future;
    }

    combine<A, U>(anotherFuture: Future<A>, op: (inputThat: T, inputAnother: A) => U): Future<U> {
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
                newFuture.complete(op(stateThat, stateAnother));
        }

        thatFuture.then(input => complete(input, undefined));
        anotherFuture.then(input => complete(undefined, input));

        return newFuture;
    }

}