import { Component, html } from "./codeonly/codeonly.js";


class TestComponent extends Component
{
    constructor()
    {
        super();

        this.count = 0;

        this.template = {
            type: 'div',
            childNodes: [
                {
                    type: 'div',
                    class: 'myclass',
                    childNodes: [
                        {
                            type: 'button',
                            bind: 'button',
                            text: () => `click me #${this.count}`,
                            on_click: () => {
                                this.count++;
                                this.invalidate();
                            },
                            attr_type: 'button',
                            attr_dataMyCount: () => this.count,
                        },
                        {
                            childNodes: [
                                {
                                    type: 'label',
                                    text: ' MOD 2',
                                    condition: () => this.count % 2 == 0,
                                },
                                {
                                    type: 'label',
                                    text: ' MOD 3',
                                    condition: () => this.count % 3 == 0,
                                },
                            ]
                        },
                        () => ` - text #${this.count} node - `,
                        {
                            type: 'label',
                            text: () => html(`<b>counter</b>: #${this.count}`),
                        },
                    ]
                },
                html(`<b>Hello</b> World `),
                {
                    type: 'i',
                    text: () => `${this.count}`,
                },
            ]
        };
    }
}

class ListComponent extends Component
{
    constructor()
    {
        super();
        let nextIndex = 4;
        this.items = [ 1, 2, 3 ];
        this.template = {
            type: "div",
            childNodes: [
                {
                    type: "div",
                    childNodes: [
                        "Insert: ",
                        {
                            type: "button",
                            text: "Start",
                            on_click: () => {
                                this.items.unshift(nextIndex++);
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "Middle",
                            on_click: () => {
                                this.items.splice(this.items.length / 2, 0, nextIndex++);
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "End",
                            on_click: () => {
                                this.items.push(nextIndex++);
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "End x1000",
                            on_click: () => {
                                for (let i=0; i< 1000; i++)
                                    this.items.push(nextIndex++);
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "direct x1000",
                            on_click: () => {
                                for (let i=0; i < 1000; i++)
                                {
                                    let node = document.createElement("div");
                                    node.innerText = `#${i}: direct`;
                                    this.heading.before(node);
                                }
                            }
                        }


                    ]
                },
                {
                    type: "div",
                    childNodes: [
                        "Delete: ",
                        {
                            type: "button",
                            text: "Start",
                            on_click: () => {
                                this.items.shift();
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "Middle",
                            on_click: () => {
                                this.items.splice(this.items.length / 2, 1);
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "End",
                            on_click: () => {
                                this.items.pop();
                                this.invalidate();
                            }
                        },
                        {
                            type: "button",
                            text: "All",
                            on_click: () => {
                                this.items = [];
                                this.invalidate();
                            }
                        }
                    ]
                },
                {
                    type: "p",
                    text: "---------------------",
                    bind: "heading",
                },
                {   
                    foreach: () => this.items,
                    type: "div",
                    text: (item, ctx) => `#${ctx.index + 1}: ${item}`,
                },
                {
                    type: "p",
                    text: "---------------------",
                },
                {   
                    foreach: () => this.items,
                    type: "div",
                    text: (item, ctx) => `#${ctx.index + 1}: ${item}`,
                },
                {
                    type: "p",
                    text: "---------------------",
                },

            ]
        }
    }
}

export function main()
{
    new ListComponent().mount(document.getElementById("main"));
}