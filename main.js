import { Component, html } from "./codeonly/codeonly.js";

class TestComponent extends Component
{
    constructor()
    {
        super();

        this.count = 0;

        this.template = {
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
                                this.update();
                            },
                            attr_type: 'button',
                            attr_dataMyCount: () => this.count,
                        },
                        {
                            type: 'label',
                            text: ' TRUE',
                            condition: true,
                        },
                        {
                            type: 'label',
                            text: ' FALSE',
                            condition: false,
                        },
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
                        () => ` - text #${this.count} node - `,
                        {
                            type: 'label',
                            text: () => html(`<b>counter</b>: #${this.count}`),
                        },
                    ]
                },
                () => html(`<b>Hello</b> World <i>${this.count}</i>`),
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
                    foreach: () => this.items,
                    text: (item, index) => `#${index + 1}: ${item}`,
                },
                {
                    type: "div",
                    childNodes: [
                        "Insert: ",
                        {
                            type: "button",
                            text: "Start",
                            on_click: () => {
                                this.items.unshift(nextIndex++);
                                this.update();
                            }
                        },
                        {
                            type: "button",
                            text: "Middle",
                            on_click: () => {
                                this.items.splice(this.items.length / 2, 0, nextIndex++);
                                this.update();
                            }
                        },
                        {
                            type: "button",
                            text: "End",
                            on_click: () => {
                                this.items.push(nextIndex++);
                                this.update();
                            }
                        }
                    ]
                }
            ]
        }
    }
}

export function main()
{
    new ListComponent().mount(document.getElementById("main"));
}