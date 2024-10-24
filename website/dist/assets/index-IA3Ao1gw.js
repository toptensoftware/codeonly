var H=Object.defineProperty;var w=t=>{throw TypeError(t)};var N=(t,e,n)=>e in t?H(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var s=(t,e,n)=>N(t,typeof e!="symbol"?e+"":e,n),y=(t,e,n)=>e.has(t)||w("Cannot "+n);var b=(t,e,n)=>(y(t,e,"read from private field"),n?n.call(t):e.get(t)),x=(t,e,n)=>e.has(t)?w("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,n),k=(t,e,n,r)=>(y(t,e,"write to private field"),r?r.call(t,n):e.set(t,n),n);import{Style as h,Component as c,Html as P,Transition as $}from"@toptensoftware/codeonly";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();class _ extends c{}s(_,"template",{_:"header",id:"header",$:[{_:"div",class:"title",text:"CodeOnly"},{_:"div",class:"buttons",$:[]}]});h.declare(`
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
`);class S extends c{}s(S,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});h.declare(`
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
`);class O{constructor(e){this.markdown=e.replace(/^---[\s\S]*?---\n/,"");let n=new commonmark.Parser;this.ast=n.parse(this.markdown);let r=this.ast.walker(),i,a=null,d="";this.headings=[];let v=[];for(;i=r.next();){if(i.entering&&i.node.type==="heading"&&i.node.level==2&&(a=i.node),a!=null&&i.node.type==="text"&&(d+=i.node.literal),!i.entering&&i.node==a){let o=R(d);o.length>0&&(this.headings.push({node:i.node,text:d,id:o}),a=!1),d="",a=null}i.entering&&i.node.type=="code_block"&&v.push(i.node)}for(let o of this.headings){let p=new commonmark.Node("html_inline",o.node.sourcepos);p.literal=`<a class="hlink" href="#${o.id}">#</a>`,o.node.prependChild(p)}for(let o of v){let p=hljs.highlight(o.literal,{language:o.info,ignoreIllegals:!0}),z=`<pre><code class="hljs language-${p.language}">${p.value}</code></pre>`,f=new commonmark.Node("html_block",o.sourcepos);f.literal=z,o.insertBefore(f),o.unlink()}}render(){let e=new commonmark.HtmlRenderer,n=e.attrs;return e.attrs=r=>{let i=n.call(e,...arguments);if(r.type=="heading"&&r.level==2){let a=this.headings.find(d=>d.node==r);a&&i.push(["id",a.id])}return i},e.render(this.ast)}}function R(t){return t=t.toLowerCase(),t=t.replace(/[^\p{L}\p{N}]+/gu,"-"),t=t.replace(/-+/,"-"),t=t.replace(/^-|-$/g,""),t}var g;class j extends EventTarget{constructor(){super(...arguments);x(this,g,null)}get document(){return b(this,g)}set document(n){k(this,g,n),this.dispatchEvent(new Event("documentChanged"))}}g=new WeakMap;let l=new j;class T extends c{constructor(){super();s(this,"location","index");s(this,"bodyContent","");s(this,"error",!0);this.load(),l.addEventListener("documentChanged",()=>{var n;this.bodyContent=(n=l.document)==null?void 0:n.render(),this.invalidate()})}async load(){this.loading=!0,this.error=!1;try{let n=`./content/${this.location}.page`;const r=await fetch(n);if(!r.ok)throw new Error(`Response status: ${r.status} - ${r.statusText}`);let i=await r.text(),a=new O(i);l.document=a}catch(n){l.document=null,this.error=!0,console.error(n.message)}this.loading=!1}}s(T,"template",{type:"main",$:[{if:n=>n.error,type:"div",class:"error",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:n=>`The page '${n.location}' doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]},{else:!0,$:n=>P.raw(n.bodyContent)}]});h.declare(`
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

    a.hlink
    {
        float: left;
        margin-left: -1.5rem;
    }

    .error
    {
        text-align: center;
    }
}

`);function M(){let t=[];for(let e=0;e<100;e++)t.push(P.p(`Line ${e}`));return t}class C extends c{}s(C,"template",{_:"nav",id:"nav-main",$:["Navigation Pane",...M()]});h.declare(`
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
`);class E extends c{constructor(){super(),l.addEventListener("documentChanged",()=>{this.invalidate()})}}s(E,"template",{type:"nav",id:"secondary-nav",$:[{if:()=>{var e,n;return((n=(e=l.document)==null?void 0:e.headings)==null?void 0:n.length)>0},$:"On This Page"},{type:"ul",$:{foreach:()=>{var e;return(e=l.document)==null?void 0:e.headings},type:"li",$:{type:"a",attr_href:e=>`#${e.id}`,text:e=>e.text}}}]});h.declare(`
#secondary-nav
{
    padding: 2.5rem 1rem 1rem 1rem;
}

`);class L extends c{constructor(){super(),this.init(),this.showSidePanelTransition=new $(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new $(this.rootNode,"show-secondary-panel")}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}s(L,"template",{type:"div",id:"contentRoot",$:[_,{type:S,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:C},{type:"div",id:"div-center",$:T},{type:"div",id:"div-rhs",$:E}]}]});const m=720,A=40,u=250;h.declare(`
body
{
    padding: 0;
    margin: 0;

    --header-height: ${A}px;
    --side-panel-width: ${u}px;
    --max-content-width: ${m}px;
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


@media screen and (width < ${u*2+m+25}px) 
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

@media screen and (width < ${u+m+25}px) 
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



`);function B(){new L().mount("body")}B();
