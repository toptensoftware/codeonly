import { EnvironmentBase, setEnvironment  } from "../core/Environment.js";
import { compileTemplate } from "../core/TemplateCompiler.js";
import { Document, Window, Node } from "../minidom/minidom.js";

class History
{
    constructor(window)
    {
        this.#window = window;
    }

    #window;
    #state = null;
    #stack = [];        // Array of { state: , url: }
    #position = 0;

    get state()
    {
        return this.#state;
    }

    pushState(state, unused, url)
    {
        if (unused !== null && unused != "")
            throw new Error("Unexpected unused param value in pushState");

        // Clear forward stack
        if (this.#stack.length > this.#position)
            this.#stack.splice(this.#position);

        // Save current state
        this.#stack.push({ 
            state: this.#state, 
            url: this.#window.location 
        });
        this.#position++;

        // Move to new state
        this.replaceState(state, url);
    }

    replaceState(state, url)
    {
        // Update state
        this.#state = state;

        // Update URL
        if (url)
            this.#window.location = new URL(url, this.#window.location);
    }

    back()
    {
        this.go(-1);
    }

    forward()
    {
        this.go(1);
    }

    go(delta)
    {
        // Don't support page reloads.
        if (!delta)
            return;

        // Go() happens asynchronously
        this.#window.requestAnimationFrame(() => {

            // Save current state before navigating away
            this.#stack[this.#position] = { 
                state: this.#state, 
                url: this.#window.location 
            };
            
            // Work out new position
            let newPosition = this.#position + delta;

            // Check in range
            if (newPosition < 0 || newPosition >= this.#stack.length)
                throw new Error("Out of range history go()");

            // Load new state
            this.#position = newPosition;
            this.#state = this.#stack[newPosition].state;
            this.#window.location = this.#stack[newPosition].url;

            // Raise event
            let event = new Event("popstate");
            event.state = this.#state;
            this.#window.dispatchEvent(event);

        }, 0);
    }

    // Simulates user clicking a hash or appending
    // a hash in the address bar
    hashnav(hash)
    {
        this.pushState(null, "", `#${hash}`)

        let event = new Event("popstate");
        event.state = null;
        this.#window.dispatchEvent(event);
    }

}


class Storage
{
    #map = new Map();
    getItem(name)
    {
        return this.#map.get(name) ?? null;
    }
    setItem(name, value)
    {
        this.#map.set(name, value);
    }
}


class MockEnvironment extends EnvironmentBase
{
    constructor()
    {
        super();
        this.document = new Document(),
        this.document.body = this.document.createElement("body");
        this.window = new Window(),
        this.window.history = new History(this.window),
        this.window.sessionStorage = new Storage();
        this.window.location =new URL("http://toptensoftware.com/");
        this.requestAnimationFrame = this.window.requestAnimationFrame.bind(this.window),
        this.Node = Node,
        this.compileTemplate = compileTemplate;
    }

    reset()
    {
        reset_mock_environment();
    }
}

function reset_mock_environment()
{
    setEnvironment(new MockEnvironment());
}

reset_mock_environment();

