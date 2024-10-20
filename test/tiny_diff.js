import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff_tiny } from "../core/diff_tiny.js";

function run_diff(o, n)
{
    let oldKeys = o.split("");
    let newKeys = n.split("");

    let ops = diff_tiny(oldKeys, newKeys);

    let store = [];
    for (let op of ops)
    {
        switch (op.op)
        {
            case "insert":
                oldKeys.splice(op.index, 0, ...newKeys.slice(op.index, op.index + op.count));
                break;

            case "delete":
                oldKeys.splice(op.index, op.count);
                break;

            case "store":
                store.push(...oldKeys.splice(op.index, op.count));
                break;

            case "restore":
                oldKeys.splice(op.index, 0, ...store.slice(op.storeIndex, op.storeIndex + op.count));
                break;

            default:
                throw new Error("unknown diff op");
        }
    }

    let actual = oldKeys.join("");
    assert.strictEqual(actual, n);
}

test("no-op", () => {
    run_diff("abcd", "abcd");
});

test("insert start", () => {
    run_diff("abcd", "123abcd");
});

test("insert end", () => {
    run_diff("abcd", "abcd123");
});

test("insert inner", () => {
    run_diff("abcd", "ab123cd");
});

test("delete start", () => {
    run_diff("abcd", "cd");
});

test("delete end", () => {
    run_diff("abcd", "ab");
});

test("delete inner", () => {
    run_diff("abcd", "ad");
});

test("multiple deletes", () => {
    run_diff("abcde", "ace");
});

test("multiple inserts", () => {
    run_diff("abcde", "a12bcd34e");
});

test("move left", () => {
    run_diff("abcd*e", "a*bcde");
});

test("move right", () => {
    run_diff("a*bcde", "abcd*e");
});