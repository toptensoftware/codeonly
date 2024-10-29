import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template, Component } from "../codeonly.js";

let mountedInstances = [];

class TestComponent extends Component
{
    mountCount = 0;
    unmountCount = 0;

    onMount()
    {
        mountedInstances.push(this);
        this.mountCount++;
    }
    onUnmount()
    {
        let index = mountedInstances.indexOf(this);
        assert(index >= 0);
        mountedInstances.splice(index, 1);
        this.unmountCount++;
    }
}


test("Component ", () => {

    let c = new TestComponent();
    assert.equal(c.mountCount, 0);
    assert.equal(c.unmountCount, 0);

    c.setMounted(true);
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 0);

    c.setMounted(false);
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 1);
});

test("If Block Passthrough", () => {

    let val = true;
    let r = Template.compile({
        if: () => val,
        $: {
            type: TestComponent,
            export: "c",
        }
    })();

    let c = r.c;

    // Not mounted
    assert.equal(c.mountCount, 0);
    assert.equal(c.unmountCount, 0);

    // Mount
    r.setMounted(true);
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 0);

    // False condition should unmount
    val = false;
    r.update();
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 1);

    // True condition should mount new item
    val = true;
    r.update();
    c = r.c;        // (new instance)
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 0);

    // Unmount
    r.setMounted(false);
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 1);
});

test("Embed Block Passthrough", () => {

    let val = true;
    let r = Template.compile({
        type: "embed-slot",
        export: "slot",
    })();

    let c = new TestComponent();

    // Not mounted
    assert.equal(c.mountCount, 0);
    assert.equal(c.unmountCount, 0);

    // Load slot, still not mounted
    r.slot.content = c;
    assert.equal(c.mountCount, 0);
    assert.equal(c.unmountCount, 0);

    // Mount
    r.setMounted(true);
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 0);

    // Remove from slot, should unmount
    r.slot.content = null;
    assert.equal(c.mountCount, 1);
    assert.equal(c.unmountCount, 1);

    // Add to slot to remount
    r.slot.content = c;
    assert.equal(c.mountCount, 2);
    assert.equal(c.unmountCount, 1);

    // Unmount
    r.setMounted(false);
    assert.equal(c.mountCount, 2);
    assert.equal(c.unmountCount, 2);
});


test("ForEach Block Passthrough", () => {

    mountedInstances = [];
    let items = [ 1 ];

    let r = Template.compile({
        foreach: {
            items: () => items,
        },
        type: TestComponent,
    })();

    assert.equal(mountedInstances.length, 0);

    // Add while unmounted, shouldn't mount items
    items.push(2);
    r.update();
    assert.equal(mountedInstances.length, 0);

    // Delete while unmounted, shouldn't unmount items
    items.splice(0, 1);
    r.update();
    assert.equal(mountedInstances.length, 0);

    // Mount, should mount all current items
    r.setMounted(true);
    assert.equal(mountedInstances.length, 1);

    // Add while mounted, should mount
    items.push(2);
    r.update();
    assert.equal(mountedInstances.length, 2);

    // Delete while mounted, should unmount
    items.splice(0, 1);
    r.update();
    assert.equal(mountedInstances.length, 1);

    // Unmount, should unmount all items
    r.setMounted(false);
    assert.equal(mountedInstances.length, 0);
});