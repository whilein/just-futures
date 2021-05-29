"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __importDefault(require("."));
var future;
future = _1.default.incompleted()
    .then(function (value) {
    test("Type is string", function () { return expect(typeof value).toBe('string'); });
    test("String is '12345'", function () { return expect(value).toBe("12345"); });
});
future
    .map(parseInt)
    .map(function (value) { return value + 54321; })
    .then(function (value) {
    test("Type is number", function () { return expect(typeof value).toBe('number'); });
    test("Number is 66666", function () { return expect(value).toBe(66666); });
});
future.complete("12345");
future = _1.default.incompleted()
    .then(function (value) {
    test("Cast test", function () { return expect(typeof value).toBe('number'); });
    test("Number is 100", function () { return expect(value).toBe(100); });
});
future.complete(100);
//# sourceMappingURL=index.test.js.map