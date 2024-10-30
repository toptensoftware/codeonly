import { Component  } from "@toptensoftware/codeonly";

export class CopyButton extends Component
{
    text;
    class;

    #checked = false;
    onClick(ev)
    {
        if (this.#checked)
            return;
        try
        {
            this.dispatchEvent(new Event("click"));

            let saveStyle = this.button.getAttribute("style");
            let saveText = this.button.textContent;
            let width = this.button.offsetWidth;

            this.button.style.width = `${width}px`;
            this.button.textContent = "✓";
            this.#checked = true;
            setTimeout(() => {
                this.button.setAttribute("style", saveStyle);
                this.button.textContent = saveText;
                this.#checked = false;
            }, 1000);

        }
        catch (err)
        {
            alert(err.message);
        }
    }

    static template = {
        type: "button",
        text: c => c.text,
        class: c => c.class,
        bind: "button",
        on_click: (c,ev) => c.onClick(ev)
    }
}