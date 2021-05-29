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
        this.callbacks = [];
        this.value = value;
    }
    Future.incompleted = function () {
        return new Future();
    };
    Future.completed = function (value) {
        return new Future(value);
    };
    Future.completedExceptionally = function (error) {
        return new Future(error);
    };
    Future.ofPromise = function (promise) {
        var future = new Future();
        promise.then(future.complete, future.complete);
        return future;
    };
    Future.prototype.when = function (callback) {
        var value = this.value;
        if (value !== undefined) {
            callback(value);
        }
        else {
            this.callbacks.push(callback);
        }
        return this;
    };
    Future.prototype.whenError = function (callback) {
        return this.when(function (result) {
            if (!(result instanceof Error)) {
                return;
            }
            callback(result);
        });
    };
    Future.prototype.whenSuccess = function (callback) {
        return this.when(function (result) {
            if (result instanceof Error) {
                return;
            }
            callback(result);
        });
    };
    Future.prototype.catch = function (callback) {
        return this.whenError(callback);
    };
    Future.prototype.mapError = function (callback) {
        var future = new Future();
        this.whenError(function (input) { return future.complete(callback(input)); });
        return future;
    };
    Future.prototype.isCompleted = function () {
        return this.value !== undefined;
    };
    Future.prototype.getCompleted = function () {
        return this.value instanceof Error
            ? undefined : this.value;
    };
    Future.prototype.complete = function (value) {
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }
        this.value = value;
        while (this.callbacks.length) {
            var callback = this.callbacks.shift();
            if (callback !== undefined) {
                callback(value);
            }
        }
    };
    Future.prototype.whenComplete = function (callback) {
        return this.when(callback);
    };
    Future.prototype.then = function (callback) {
        return this.whenSuccess(callback);
    };
    Future.prototype.map = function (callback) {
        var future = new Future();
        this.whenSuccess(function (input) { return future.complete(callback(input)); });
        return future;
    };
    Future.prototype.compose = function (callback) {
        var future = new Future();
        this.whenSuccess(function (input) { return callback(input).then(future.complete); });
        return future;
    };
    Future.prototype.combine = function (anotherFuture, callback) {
        var future = new Future();
        var stateThat;
        var stateAnother;
        function complete(that, another) {
            if (that !== undefined)
                stateThat = that;
            if (another !== undefined)
                stateAnother = another;
            if (stateThat !== undefined && stateAnother !== undefined)
                future.complete(callback(stateThat, stateAnother));
        }
        this.then(function (input) { return complete(input, undefined); });
        anotherFuture.then(function (input) { return complete(undefined, input); });
        return future;
    };
    return Future;
}());
exports.default = Future;
//# sourceMappingURL=index.js.map