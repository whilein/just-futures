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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuturePromiseError = void 0;
var FuturePromiseError = /** @class */ (function (_super) {
    __extends(FuturePromiseError, _super);
    function FuturePromiseError(rejectValue) {
        var _this = _super.call(this, "Promise were rejected") || this;
        _this.rejectValue = rejectValue;
        return _this;
    }
    return FuturePromiseError;
}(Error));
exports.FuturePromiseError = FuturePromiseError;
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
        future.completeWithPromise(promise);
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
    Future.prototype.notify = function (value) {
        while (this.callbacks.length) {
            var callback = this.callbacks.shift();
            if (callback !== undefined) {
                callback(value);
            }
        }
    };
    Future.prototype.isCompleted = function () {
        return this.value !== undefined;
    };
    Future.prototype.getCompleted = function () {
        return this.value instanceof Error
            ? undefined : this.value;
    };
    Future.prototype.completeWithPromise = function (promise) {
        var _this = this;
        promise.then(function (success) { return _this.complete(success); }, function (error) { return _this.complete(new FuturePromiseError(error)); });
    };
    Future.prototype.complete = function (value) {
        if (this.value !== undefined) {
            throw new Error("Future is already completed");
        }
        this.notify(this.value = value);
    };
    Future.prototype.catch = function (callback) {
        return this.when(function (result) {
            if (result instanceof Error)
                callback(result);
        });
    };
    Future.prototype.whenComplete = function (callback) {
        return this.when(function (result) { return callback(result); });
    };
    Future.prototype.then = function (callback) {
        return this.when(function (result) {
            if (!(result instanceof Error))
                callback(result);
        });
    };
    Future.prototype.onThat = function (action) {
        action(this);
        return this;
    };
    Future.prototype.mapPromise = function (callback, errorCallback) {
        var future = new Future();
        this.when(function (input) {
            if (input instanceof Error) {
                if (errorCallback !== undefined)
                    future.complete(errorCallback(input));
                future.notify(input);
            }
            else {
                future.completeWithPromise(callback(input));
            }
        });
        return future;
    };
    Future.prototype.map = function (callback, errorCallback) {
        var future = new Future();
        this.when(function (input) {
            if (input instanceof Error) {
                if (errorCallback !== undefined)
                    future.complete(errorCallback(input));
                future.notify(input);
            }
            else {
                future.complete(callback(input));
            }
        });
        return future;
    };
    Future.prototype.compose = function (callback) {
        var future = new Future();
        this.when(function (input) {
            if (input instanceof Error) {
                future.notify(input);
                return;
            }
            callback(input).then(future.complete);
        });
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