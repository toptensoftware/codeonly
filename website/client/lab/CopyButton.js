import { Component  } from "@toptensoftware/codeonly";

export class CopyButton extends Component
{
    text = "";
    class = "";
    style = "";
    #checked = false;

    onClick(ev)
    {
        // Don't re-enter while showing checkmark
        if (this.#checked)
            return;

        try
        {
            // Dispatch it
            this.dispatchEvent(new Event("click"));

            // Temporarily switch text while maintaining the displayed width
            let saveStyle = this.style;
            let saveText = this.text;
            this.style += `; width: ${this.rootNode.offsetWidth}px`;
            this.text = "✓";
            this.#checked = true;
            this.invalidate();

            setTimeout(() => {
                this.style = saveStyle;
                this.text = saveText;
                this.#checked = false;
                this.invalidate();
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
        style: c => c.style,
        on_click: (c,ev) => c.onClick(ev)
    }
}