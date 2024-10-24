import { Component, Style, Transition, router } from "@toptensoftware/codeonly";
import { Header } from "./Header.js";
import { MobileBar } from "./MobileBar.js";
import { MainContent } from "./MainContent.js";
import { MainNavigation } from "./MainNavigation.js";
import { SecondaryNavigation } from "./SecondaryNavigation.js";

import "./ArticlePage.js";
import "./NotFoundPage.js";

// Main application
class Application extends Component
{
    constructor()
    {
        super();
        this.init();
        this.showSidePanelTransition = new Transition(this.rootNode, "show-side-panel");
        this.showSecondaryPanelTransition = new Transition(this.rootNode, "show-secondary-panel");
    }

    showPanel()
    {
        this.showSidePanelTransition.enter();
        this.showSecondaryPanelTransition.leave();

    }
    showSecondaryPanel()
    {
        this.showSecondaryPanelTransition.toggle();
        this.showSidePanelTransition.leave();
    }
    hidePanel()
    {
        this.showSidePanelTransition.leave();
        this.showSecondaryPanelTransition.leave();
    }


    static template = {
        type: "div",
        id: "contentRoot",
        $: [
            Header, 
            {
                type: MobileBar,
                on_showPanel: c => c.showPanel(),
                on_showSecondaryPanel: c => c.showSecondaryPanel(),
            },
            {
                type: "div",
                id: "div-wrapper",
                $: [
                    {
                        type: "div",
                        id: "backdrop",
                        on_click: c => c.hidePanel(),
                    },
                    {
                        type: "div",
                        id: "div-lhs",
                        $: MainNavigation,
                    },
                    {
                        type: "div",
                        id: "div-center",
                        $: MainContent,
                    },
                    {
                        type: "div",
                        id: "div-rhs",
                        $: SecondaryNavigation,
                    }

                ]
            }
        ]
    };
}

const maxContentWidth = 720;
const headerHeight = 40;
const sidePanelWidth = 250;

Style.declare(`
body
{
    padding: 0;
    margin: 0;

    --header-height: ${headerHeight}px;
    --side-panel-width: ${sidePanelWidth}px;
    --max-content-width: ${maxContentWidth}px;
    --main-indent: calc((100% - (var(--max-content-width) + var(--side-panel-width) * 2)) / 2);
}

#header
{
    position: fixed;
    width: 100%;
    height: var(--header-height);
}

#mobile-bar
{
    position: fixed;
    width: 100%;
    height: var(--header-height);
    top: var(--header-height);
}

#div-wrapper
{
    width: 100%;
    height: 100% - var(--header-height);
}

#div-lhs
{
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    margin-left: var(--main-indent);
    width: var(--side-panel-width);
    height: calc(100% - var(--header-height));
    background-color: var(--body-back-color);
    z-index: 1;
}
#div-center
{
    position: relative;
    padding-top: var(--header-height);
    margin-left: calc(var(--side-panel-width) + var(--main-indent));
    margin-right: calc(var(--side-panel-width) + var(--main-indent));
}
#div-rhs
{
    position: fixed;
    top: var(--header-height);
    right: 0;
    bottom: 0;
    width: var(--side-panel-width);
    margin-right: var(--main-indent);
}


#backdrop
{
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(from var(--back-color) r g b / 75%);
    display: none;
    z-index: 1;
}


@media screen and (width < ${sidePanelWidth*2 + maxContentWidth + 25}px) 
{
    body
    {
        --main-indent: calc((100% - (var(--max-content-width) + var(--side-panel-width))) / 2);
    }

    #div-rhs
    {
         display: none;
    }

    #div-center
    {
        width: var(--max-content-width);
    }
}

@media screen and (width < ${sidePanelWidth + maxContentWidth + 25}px) 
{
    main
    {
        padding: 10px 40px;
    }
    #header
    {
        position: relative;
        height: var(--header-height);
    }
    #mobile-bar
    {
        position: relative;
    }

    #div-lhs
    {
         display: none;
    }
    #div-center
    {
        padding-top: 0;
        width: unset;
        max-width: var(--max-content-width);
        margin: 0 auto;
    }
    #mobile-bar
    {
        position: sticky;
        top: 0;
        display: flex;
    }

    body.show-side-panel
    {
    }

    #contentRoot.show-secondary-panel
    {
        #div-rhs
        {
            display: flex;
            align-items: stretch;
            top: calc(var(--header-height) * 2 + 1rem);
            left: 15%;
            right: 15%;
            width: 70%;
            height: unset;
            bottom: unset;
            background-color: var(--body-back-color);
            border: 1px solid var(--accent-color);
            border-radius: 0.5rem;
            z-index: 100;
            overflow: hidden;

            nav
            {
                flex-grow: 1;
                position: relative;
                max-height: 50vh;
                overflow: auto;
                padding: 1rem;
            }
        }

        #backdrop
        {
            display: block;
            opacity: 1;
        }

        &.show-secondary-panel-enter,
        &.show-secondary-panel-leave
        {
            #backdrop,
            #div-rhs
            {
                transition: 0.2s ease-out;
            }
        }

        &.show-secondary-panel-start-enter
        {
            #div-rhs
            {
                transform: translateY(-20px);
                opacity: 0;
            }
            #backdrop
            {
                opacity: 0;
            }
        }

        &.show-secondary-panel-leave
        {
            #div-rhs
            {
                transform: translateY(-20px);
                opacity: 0;
            }
            #backdrop
            {
                opacity: 0;
            }
        }
    }

    #contentRoot.show-side-panel
    {
        #div-lhs
        {
            display: unset;
            margin-left: 0;
            top: 0;
            bottom: 0;
            height: 100%;
            z-index: 100;
        }

        #backdrop
        {
            display: block;
            opacity: 1;
        }

        &.show-side-panel-enter,
        &.show-side-panel-leave
        {
            #backdrop,
            #div-lhs
            {
                transition: 0.2s ease-in;
            }
        }

        &.show-side-panel-start-enter
        {
            #div-lhs
            {
                transform: translateX(calc(var(--side-panel-width) * -1));
            }
            #backdrop
            {
                opacity: 0;
            }

        }

        &.show-side-panel-leave
        {
            #div-lhs
            {
                transform: translateX(calc(var(--side-panel-width) * -1));
            }
            #backdrop
            {
                opacity: 0;
            }
        }
    }

}



`);

// Main entry point, create Application and mount
export function main()
{
    new Application().mount("body");
    router.start();
}