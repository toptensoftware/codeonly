import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Router } from "../core/Router.js";

function asyncOp()
{
    return new Promise((resolve) => setImmediate(resolve));
}

let events = [];
let cancelled_route = null;

let routes = [
    {
        pattern: "/sync",
        match: async (route) => {
            route.page = "/sync";
            return true;
        },
    },
    {
        pattern: "/async",
        match: async (route) => {
            await asyncOp();
            route.page = "/async";
            return true;
        },
    },
    {
        pattern: "/from",
        match: async (route) => {
            await asyncOp();
            route.page = "/from";
            return true;
        },
        mayLeave: async (from, to) => {
            await asyncOp();
            events.push({ event: "mayLeave", from, to});
        },
        didLeave: (from, to) => {
            events.push({ event: "didLeave", from, to});
        },
        cancelLeave: (from, to) => {
            events.push({ event: "cancelLeave", from, to});
        },
    },
    {
        pattern: "/to",
        match: async (route) => {
            await asyncOp();
            route.page = "/to";
            return true;
        },
        mayEnter: async (from, to) => {
            await asyncOp();
            events.push({ event: "mayEnter", from, to});
        },
        didEnter: (from, to) => {
            events.push({ event: "didEnter", from, to});
        },
    },
    {
        pattern: "/cancel_leave",
        match: async (route) => {
            await asyncOp();
            route.page = "/cancel_leave";
            return true;
        },
        mayLeave: async (from, to) => {
            await asyncOp();
            cancelled_route = to;
            return false;
        },
    },
    {
        pattern: "/cancel_enter",
        match: async (route) => {
            await asyncOp();
            route.page = "/cancel_enter";
            return true;
        },
        mayEnter: async (from, to) => {
            await asyncOp();
            cancelled_route = to;
            return false;
        },
        cancelEnter: (from, to) => {
            events.push({ event: "cancelEnter", from, to});
        },
    },
    {
        pattern: "/busy",
        match: async (route) => {
            route.page = "/slow";
            route.busy = new Promise((resolve) => {
                route.resolve = resolve;
            });
            await route.busy;
            return true;
        },
        mayEnter: async (from, to) => {
        },
        cancelEnter: (from, to) => {
            events.push({ event: "cancelEnter", from, to});
        },
    },
]

test("simple sync route", async () => {

    let router = new Router(null, routes);
    let r = await router.load(new URL("http://co/sync"), null);
    assert.equal(r.page, "/sync");
    assert.equal(router.current, r);
});

test("simple async route", async () => {

    let router = new Router(null, routes);
    let r = await router.load(new URL("http://co/async"), null);
    assert.equal(r.page, "/async");
    assert.equal(router.current, r);
});

test("events", async () => {

    events = [];

    let router = new Router(null, routes);

    router.addEventListener("mayLeave", async (from, to) => {
        await asyncOp();
        events.push({ event: "event mayLeave", from, to});
        return true;
    });

    router.addEventListener("mayEnter", async (from, to) => {
        await asyncOp();
        events.push({ event: "event mayEnter", from, to});
        return true;
    });

    router.addEventListener("didLeave", (from, to) => {
        events.push({ event: "event didLeave", from, to});
        return true;
    });

    router.addEventListener("didEnter", (from, to) => {
        events.push({ event: "event didEnter", from, to});
        return true;
    });

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");

    events = [];

    let to = await router.load(new URL("http://co/to"), null);
    assert.equal(to.page, "/to");

    assert.equal(events.length, 8);
    assert.deepEqual(events[0], { event: "event mayLeave", from, to });
    assert.deepEqual(events[1], { event: "mayLeave", from, to });
    assert.deepEqual(events[2], { event: "mayEnter", from, to });
    assert.deepEqual(events[3], { event: "event mayEnter", from, to });
    assert.deepEqual(events[4], { event: "event didLeave", from, to });
    assert.deepEqual(events[5], { event: "didLeave", from, to });
    assert.deepEqual(events[6], { event: "didEnter", from, to });
    assert.deepEqual(events[7], { event: "event didEnter", from, to });

});


test("cancel by mayLeave event", async () => {

    let router = new Router(null, routes);

    router.addEventListener("mayLeave", async (from, to) => {
        await asyncOp();
        return false;
    });

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");

    let to = await router.load(new URL("http://co/to"), null);
    assert.equal(to, null);
});

test("cancel by mayEnter event", async () => {

    let router = new Router(null, routes);

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");

    router.addEventListener("mayEnter", async (from, to) => {
        await asyncOp();
        return false;
    });


    let to = await router.load(new URL("http://co/to"), null);
    assert.equal(to, null);
});

test("cancel by handler mayLeave", async () => {

    let router = new Router(null, routes);

    let from = await router.load(new URL("http://co/cancel_leave"), null);
    assert.equal(from.page, "/cancel_leave");


    let to = await router.load(new URL("http://co/to"), null);
    assert.equal(to, null);
});

test("cancel by handler mayLnter", async () => {

    let router = new Router(null, routes);

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");


    let to = await router.load(new URL("http://co/cancel_enter"), null);
    assert.equal(to, null);
});


test("cancel events", async () => {

    let router = new Router(null, routes);

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");

    events = [];
    router.addEventListener("cancel", (from, to) => {
        events.push({ event: "cancel", from, to });
    });

    let to = await router.load(new URL("http://co/cancel_enter"), null);
    assert.equal(to, null);

    assert.equal(events.length, 4);
    assert.deepEqual(events[0], { event: "mayLeave", from, to: cancelled_route });
    assert.deepEqual(events[1], { event: "cancelLeave", from, to: cancelled_route });
    assert.deepEqual(events[2], { event: "cancelEnter", from, to: cancelled_route });
    assert.deepEqual(events[3], { event: "cancel", from, to: cancelled_route });
});

test("concurrent navigation", async () => {

    let router = new Router(null, routes);

    let from = await router.load(new URL("http://co/from"), null);
    assert.equal(from.page, "/from");

    // Start first navigation
    let busy_promise = router.load(new URL("http://co/busy"), null);
    let busy = router.pending;
    assert(busy != null);

    // Before it finishes, start a second
    let to = await router.load(new URL("http://co/to"), null);

    // Now trigger the busy route to finish
    events = [];
    busy.resolve();
    await busy_promise;

    // Make sure the busy route got the cancel event
    assert.equal(events.length, 1);
    assert.deepEqual(events[0], { event: "cancelEnter", from, to: busy });

    // Make sure the second navigation stuck
    assert.equal(router.current, to);

});