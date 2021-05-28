"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Future = /** @class */ (function () {
    function Future(value) {
        this.ops = [];
        this.value = value;
    }
    Future.ofPromise = function (promise) {
        var future = new Future();
        promise.then(future.complete);
        return future;
    };
    Future.prototype.run = function (op) {
        if (this.value !== undefined) {
            op(this.value);
        }
        else {
            this.ops.push(op);
        }
        return this;
    };
    Future.prototype.isCompleted = function () {
        return this.value !== undefined;
    };
    Future.prototype.getCompleted = function () {
        return this.value;
    };
    Future.prototype.complete = function (value) {
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }
        this.value = value;
        while (this.ops.length) {
            var op = this.ops.shift();
            if (op !== undefined) {
                op(value);
            }
        }
    };
    Future.prototype.then = function (op) {
        return this.run(op);
    };
    Future.prototype.map = function (op) {
        var future = new Future();
        this.run(function (input) { return future.complete(op(input)); });
        return future;
    };
    Future.prototype.compose = function (op) {
        var future = new Future();
        this.run(function (input) { return op(input).then(future.complete); });
        return future;
    };
    Future.prototype.combine = function (anotherFuture, op) {
        var newFuture = new Future();
        var thatFuture = this;
        var stateThat;
        var stateAnother;
        function complete(that, another) {
            if (that !== undefined)
                stateThat = that;
            if (another !== undefined)
                stateAnother = another;
            if (stateThat !== undefined && stateAnother !== undefined)
                newFuture.complete(op(stateThat, stateAnother));
        }
        thatFuture.then(function (input) { return complete(input, undefined); });
        anotherFuture.then(function (input) { return complete(undefined, input); });
        return newFuture;
    };
    return Future;
}());
exports.default = Future;
var future = new Future();
future.map(function (num) { return num * 10 / 2; }).then(console.log);
future.map(function (num) { return "Number: " + num; }).then(console.log);
future.complete(1);
//# sourceMappingURL=index.js.map