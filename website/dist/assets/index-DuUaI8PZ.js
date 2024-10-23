var x=Object.defineProperty;var k=(t,e,n)=>e in t?x(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var o=(t,e,n)=>k(t,typeof e!="symbol"?e+"":e,n);import{Style as d,Component as s,Html as m,nextFrame as P,Transition as p}from"@toptensoftware/codeonly";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();class v extends s{}o(v,"template",{_:"header",id:"header",$:[{_:"div",class:"title",text:"CodeOnly"},{_:"div",class:"buttons",$:[]}]});d.declare(`
#header
{
    display: flex;
    justify-content: start;
    align-items: center;
    border-bottom: 1px solid var(--gridline-color);
    padding-left: 10px;
    padding-right: 10px;
    background-color: rgb(from var(--back-color) r g b / 75%);
    z-index: 1;

    .title 
    {
        flex-grow: 1;
    }


    .buttons
    {
        font-size: 12pt;
        display: flex;
        gap: 10px;
    }
}
`);class g extends s{}o(g,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});d.declare(`
#mobile-bar
{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gridline-color);
    padding-left: 10px;
    padding-right: 10px;
    background-color: rgb(from var(--back-color) r g b / 75%);
    z-index: 1;
    display: none;

}

#side-panel-menu-button
{
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    padding: 5px;

    svg
    {
        margin-right: 0.2rem;
    }
}
`);function $(){let t=[];for(let e=0;e<100;e++)t.push(m.p(`Line ${e}`));return t}class w extends s{}o(w,"template",{_:"nav",id:"nav-main",$:["Navigation Pane",...$()]});d.declare(`
#nav-main
{
    x-background-color: purple;
    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px;
}
`);class y extends s{constructor(){super();o(this,"location","index");o(this,"bodyContent","");this.load()}async load(){this.loading=!0;try{let n=`./content/${this.location}.page`;const r=await fetch(n);if(!r.ok)throw new Error(`Response status: ${r.status}`);let i=await r.text(),a=new commonmark.Parser,l=new commonmark.HtmlRenderer,f=a.parse(i.replace(/^---[\s\S]*?---\n/,""));this.bodyContent=l.render(f),this.invalidate(),P(()=>{hljs.highlightAll()})}catch(n){console.error(n.message)}this.loading=!1}}o(y,"template",{type:"main",$:n=>m.raw(n.bodyContent)});d.declare(`
main
{
    padding: 10px 50px;
    margin: 0;
    margin-top: -1rem;

    .hljs 
    {
        background-color: #282828;
        font-size: 0.9rem;
    }
}

`);function _(){let t=[];for(let e=0;e<10;e++)t.push({type:"li",text:`Nav ${e}`});return t}class u extends s{}o(u,"template",{type:"nav",id:"secondary-nav",$:["On This Page",{type:"ul",$:_()}]});d.declare(`
#secondary-nav
{
    padding: 2.5rem 1rem 1rem 1rem;
}
`);class b extends s{constructor(){super(),this.init(),this.showSidePanelTransition=new p(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new p(this.rootNode,"show-secondary-panel")}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}o(b,"template",{type:"div",id:"contentRoot",$:[v,{type:g,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:w},{type:"div",id:"div-center",$:y},{type:"div",id:"div-rhs",$:u}]}]});const c=720,S=40,h=250;d.declare(`
body
{
    padding: 0;
    margin: 0;

    --header-height: ${S}px;
    --side-panel-width: ${h}px;
    --max-content-width: ${c}px;
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


@media screen and (width < ${h*2+c+25}px) 
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

@media screen and (width < ${h+c+25}px) 
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



`);function T(){new b().mount("body")}T();
