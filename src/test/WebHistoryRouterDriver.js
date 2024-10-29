import { test } from "node:test";
import { strict as assert } from "node:assert";

import { WebHistoryRouterDriver } from "../core/WebHistoryRouterDriver.js";
import { ViewStateRestoration } from "../core/ViewStateRestoration.js";
import "./mockdom.js";
import { env } from "../core/Environment.js";

function asyncOp()
{
    return new Promise((resolve) => setImmediate(resolve));
}

class MockRouter extends EventTarget
{
    start()
    {
        new ViewStateRestoration(this);
        this.driver = new WebHistoryRouterDriver();
        this.navigate = this.driver.navigate.bind(this.driver);
        this.replace = this.driver.navigate.bind(this.driver);
        this.back = this.driver.back.bind(this.driver);
        return this.driver.start(this);
    }

    internalize = x => x;
    externalize = x => x;

    captureViewState() { return {} }
    restoreViewState() {}

    current;
    driver;
    cancel_mode = false;
    listeners = [];
    addEventListener(event, listener, options)
    {
        this.listeners.push({event, listener, options});
    }
    dispatchEvent(event, from, to)
    {
        for (let i=0; i<this.listeners.length; i++)
        {
            let l = this.listeners[i];

            if (l.event == event)
            {
                l.listener(from, to);
                if (l.options?.once)
                {
                    this.listeners.splice(i, 1);
                    i--;
                }
            }
        }
    }

    async load(url, state)
    {
        try
        {
            assert(url instanceof URL);
            assert(!!state);
            await asyncOp();
            let route = {
                url: url,
                state: state,
                handler: this.handler ?? {},
            };
            if (this.current)
                this.dispatchEvent("mayLeave", this.current, route);
            this.dispatchEvent("mayEnter", this.current, route);

            if (this.cancel_mode)
                return null;
            if (this.current)
                this.current.current = false;

            let old = this.current;
            this.current = route;
            this.current.current = true;

            if (old)
                this.dispatchEvent("didLeave", old, route);
            this.dispatchEvent("didEnter", old, route);
            return this.current;
        }
        finally
        {
            this.dispatchEvent("finished");
        }
    }

    untilFinished()
    {
        return new Promise((resolve) => {
            this.addEventListener("finished", 
                () => resolve(), 
                { once: true }
            );
        });
    }

    async go(delta)
    {
        // Navigate backwards
        env.window.history.go(delta);

        // Wait for history to attempt load
        // on this router
        await this.untilFinished();

        // A cancelled navigation will call window.history.go
        // again, we need to wait for that to be dispatched
        await env.window.waitAnimationFrames();
    }
}

test("load new session", async () => {

    env.reset();
    let mr = new MockRouter();
    let route = await mr.start();
    assert(route != null);
    assert.equal(route.url, env.window.location);
    assert.equal(route.state.sequence, 0);
    await env.window.waitAnimationFrames();
    assert.equal(route.mockViewState, undefined);
});

test("load existing session", async () => {

    env.reset();

    // Setup existing session
    env.window.sessionStorage.setItem("codeonly-view-states", JSON.stringify({
        2: { x:2 },
    }));
    env.window.history.replaceState({
        sequence: 2,
    });

    let viewState;

    // Start router
    let mr = new MockRouter();
    mr.restoreViewState = vs => viewState = vs;
    let route = await mr.start(mr);
    assert.equal(route.state.sequence, 2);

    // View state restoration is delayed until next frame
    assert.deepEqual(viewState, undefined );
    await env.window.waitAnimationFrames();
    assert.deepEqual(viewState, { x: 2 } );
});


test("navigate", async () => {

    env.reset();

    // Start router
    let mr = new MockRouter();
    await mr.start(mr);

    let route = await mr.navigate("/path");
    assert.equal(mr.current, route);
    assert.equal(mr.current.url.pathname, "/path");
    assert.equal(mr.current.url.pathname, env.window.location.pathname);
});

test("cancelled navigate", async () => {

    env.reset();

    // Start router
    let mr = new MockRouter();
    let oldRoute = await mr.start(mr);

    mr.cancel_mode = true;

    let route = await mr.navigate("/cancel");
    assert.equal(route, null);
    assert.equal(mr.current, oldRoute);
    assert.equal(mr.current.url.pathname, env.window.location.pathname);
});


test("popstate", async () => {

    env.reset();

    // Start router
    let mr = new MockRouter();
    await mr.start(mr);
    await mr.navigate("/path");

    assert.equal(mr.current.url.pathname, "/path");
    assert.equal(mr.current.state.sequence, 1);

    await mr.go(-1);
    assert.equal(mr.current.url.pathname, "/");
    assert.equal(mr.current.state.sequence, 0);

    await mr.go(1);
    assert.equal(mr.current.url.pathname, "/path");
    assert.equal(mr.current.state.sequence, 1);

});


test("cancel navigate backwards", async () => {

    env.reset();

    // Start router
    let mr = new MockRouter();
    await mr.start(mr);
    let r = await mr.navigate("/cancel_leave");

    mr.cancel_mode = true;

    assert.equal(mr.current.url.pathname, "/cancel_leave");
    assert.equal(mr.current.state.sequence, 1);

    await mr.go(-1);
    assert.equal(mr.current.url.pathname, "/cancel_leave");
    assert.equal(mr.current.state.sequence, 1);
    assert.equal(mr.current.url.pathname, env.window.location.pathname);
});




test("cancel navigate forwards", async () => {

    env.reset();

    // Start router
    let mr = new MockRouter();
    await mr.start(mr);
    let foo = await mr.navigate("/foo");
    let bar = await mr.navigate("/bar");
    let baz = await mr.navigate("/baz");

    // Back to foo
    await mr.go(-2);
    assert.equal(mr.current.url.pathname, "/foo");

    // Stay keye
    mr.cancel_mode = true;
    await mr.go(2);

    assert.equal(mr.current.url.pathname, "/foo");
    assert.equal(mr.current.state.sequence, 1);
    assert.equal(mr.current.url.pathname, env.window.location.pathname);
});


test("view state restoration (via router)", async () => {

    env.reset();

    let viewState;

    // Start router
    let mr = new MockRouter();
    mr.captureViewState = () => viewState;
    mr.restoreViewState = (vs) => viewState = vs;

    await mr.start(mr);
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "start";

    await mr.navigate("/foo");
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "foo";

    await mr.navigate("/bar");
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "bar";
    
    // Back to foo
    await mr.go(-1);
    assert.equal(viewState, "foo");

    await mr.go(-1);
    assert.equal(viewState, "start");

    await mr.go(2);
    assert.equal(viewState, "bar");
});


test("view state restoration (via route handler)", async () => {

    env.reset();

    let viewState;

    // Start router
    let mr = new MockRouter();
    mr.handler = {
        captureViewState: () => viewState,
        restoreViewState: (vs) => viewState = vs,
    }
    await mr.start(mr);
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "start";

    await mr.navigate("/foo");
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "foo";

    await mr.navigate("/bar");
    await env.window.waitAnimationFrames();
    assert.equal(viewState, undefined);
    viewState = "bar";
    
    // Back to foo
    await mr.go(-1);
    assert.equal(viewState, "foo");

    await mr.go(-1);
    assert.equal(viewState, "start");

    await mr.go(2);
    assert.equal(viewState, "bar");
});














