import { test } from "node:test";
import { strict as assert } from "node:assert";
import { EventEmitter } from "../codeonly/codeonly.js";

test("No Handlers", () => {
    let ee = new EventEmitter();
    ee.emit("event", {});
});

test("Single Handler", () => {

    let ee = new EventEmitter();

    let received = 0;
    ee.addEventListener("event", (p1, p2) => {
        received++;
        assert.equal(p1, 10);
        assert.equal(p2, 20);
    });

    ee.emit("event", 10, 20);
    ee.emit("other");

    assert.equal(received, 1);
});


test("Multiple Handlers", () => {

    let ee = new EventEmitter();

    let received = 0;
    ee.addEventListener("event", (p1, p2) => {
        received++;
        assert.equal(p1, 10);
        assert.equal(p2, 20);
    });

    ee.addEventListener("event", (p1, p2) => {
        received++;
        assert.equal(p1, 10);
        assert.equal(p2, 20);
    });

    ee.emit("event", 10, 20);

    assert.equal(received, 2);
});


test("Remove Handler", () => {

    let ee = new EventEmitter();

    let received = 0;

    function handler(p1, p2)
    {
        received++;
        assert.equal(p1, 10);
        assert.equal(p2, 20);
    }

    ee.addEventListener("event", handler);
    ee.emit("event", 10, 20);
    ee.removeEventListener("other", handler);
    ee.emit("event", 10, 20);

    assert.equal(received, 2);

    ee.removeEventListener("event", handler);
    ee.emit("event", 10, 20);
    assert.equal(received, 2);
});


test("on/off aliases", () => {

    let ee = new EventEmitter();

    let received = 0;

    function handler(p1, p2)
    {
        received++;
        assert.equal(p1, 10);
        assert.equal(p2, 20);
    }

    ee.on("event", handler);
    ee.emit("event", 10, 20);
    ee.off("other", handler);
    ee.emit("event", 10, 20);

    assert.equal(received, 2);

    ee.off("event", handler);
    ee.emit("event", 10, 20);
    assert.equal(received, 2);
});



test("Remove Handler in Event", () => {

    let ee = new EventEmitter();

    let receivedA = 0;
    let receivedB = 0;
    let receivedC = 0;

    function handlerA()
    {
        receivedA++;
    }

    function handlerB()
    {
        receivedB++;
        ee.removeEventListener("event", handlerB);
    }

    function handlerC()
    {
        receivedC++;
    }

    ee.addEventListener("event", handlerA);
    ee.addEventListener("event", handlerB);
    ee.addEventListener("event", handlerC);

    ee.emit("event");
    ee.emit("event");

    assert.equal(receivedA, 2);
    assert.equal(receivedB, 1);
    assert.equal(receivedC, 2);
});




test("Once", () => {

    let ee = new EventEmitter();

    let receivedA = 0;
    let receivedB = 0;
    let receivedC = 0;

    function handlerA()
    {
        receivedA++;
    }

    function handlerB()
    {
        receivedB++;
    }

    function handlerC()
    {
        receivedC++;
    }

    ee.on("event", handlerA);
    ee.once("event", handlerB);
    ee.on("event", handlerC);

    ee.emit("event");
    ee.emit("event");

    assert.equal(receivedA, 2);
    assert.equal(receivedB, 1);
    assert.equal(receivedC, 2);
});

