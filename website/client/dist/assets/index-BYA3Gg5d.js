var D=Object.defineProperty;var S=a=>{throw TypeError(a)};var Z=(a,e,t)=>e in a?D(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var d=(a,e,t)=>Z(a,typeof e!="symbol"?e+"":e,t),T=(a,e,t)=>e.has(a)||S("Cannot "+t);var p=(a,e,t)=>(T(a,e,"read from private field"),t?t.call(a):e.get(a)),v=(a,e,t)=>e.has(a)?S("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(a):e.set(a,t),f=(a,e,t,n)=>(T(a,e,"write to private field"),n?n.call(a,t):e.set(a,t),t);import{Style as g,Component as h,env as I,Html as N,Transition as E,router as y}from"@toptensoftware/codeonly";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();class z extends h{}d(z,"template",{_:"header",id:"header",$:[{_:"div",class:"title",text:"CodeOnly"},{_:"div",class:"buttons",$:[]}]});g.declare(`
:root
{
    --header-height: 50px;
}

#header
{
    position: fixed;
    top: 0;
    width: 100%;
    height: var(--header-height);

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
`);class W{constructor(e){this.pathname=e,this.load()}load(){return I.load(async()=>{try{let e=this.pathname;(e==""||e.endsWith("/"))&&(e+="index");const t=await fetch(`/content/${e}.page`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.processMarkdown(await t.text())}catch{this.failed=!0}})}processMarkdown(e){this.frontmatter={},e=e.replace(/\r\n/g,`
`),this.markdown=e.replace(/^---([\s\S]*?)---\n/,(o,s)=>{for(let l of s.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))try{this.frontmatter[l[1]]=JSON.parse(l[2])}catch{this.frontmatter[l[1]]=l[2]}return""});let t=new commonmark.Parser;this.ast=t.parse(this.markdown);let n=this.ast.walker(),i,r=null,c="";this.headings=[];let L=[];for(;i=n.next();){if(i.entering&&i.node.type==="heading"&&i.node.level==2&&(r=i.node),r!=null&&i.node.type==="text"&&(c+=i.node.literal),!i.entering&&i.node==r){let o=Y(c);o.length>0&&(this.headings.push({node:i.node,text:c,id:o}),r=!1),c="",r=null}i.entering&&i.node.type=="code_block"&&L.push(i.node)}for(let o of this.headings){let s=new commonmark.Node("html_inline",o.node.sourcepos);s.literal=`<a class="hlink" href="#${o.id}">#</a>`,o.node.prependChild(s)}for(let o of L){let s=hljs.highlight(o.literal,{language:o.info,ignoreIllegals:!0}),l=`<pre><code class="hljs language-${s.language}">${s.value}</code></pre>`,k=new commonmark.Node("html_block",o.sourcepos);k.literal=l,o.insertBefore(k),o.unlink()}let x=new commonmark.HtmlRenderer,B=x.attrs;x.attrs=o=>{let s=B.call(x,...arguments);if(o.type=="heading"&&o.level==2){let l=this.headings.find(k=>k.node==o);l&&s.push(["id",l.id])}return s},this.html=x.render(this.ast)}}function Y(a){return a=a.toLowerCase(),a=a.replace(/[^\p{L}\p{N}]+/gu,"-"),a=a.replace(/-+/,"-"),a=a.replace(/^-|-$/g,""),a}class O extends h{}d(O,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});g.declare(`
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
`);var m;class R extends h{constructor(){super();v(this,m)}set url(t){let n=new URL("toc",t).pathname;n!=p(this,m)&&(f(this,m,n),this.load())}load(){super.load(async()=>{this.error=!1;try{const t=await fetch(`/content${p(this,m)}`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.toc=await t.json()}catch(t){this.error=!0,console.error(t.message)}})}}m=new WeakMap,d(R,"template",{_:"nav",id:"nav-main",$:[{foreach:t=>t.toc,$:[{type:"h5",text:t=>t.title},{type:"ul",$:{foreach:t=>t.pages,type:"li",$:{type:"a",attr_href:t=>t.url,text:t=>t.title}}}]}]});g.declare(`
#nav-main
{
    x-background-color: purple;
    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px;

    padding: 0rem 1rem 1rem 1rem;

    ul
    {
        font-size: 0.8rem;
        li
        {
            padding-top: 0.5rem;
            line-height: 1.2rem;
        }
    }

}
`);var w;class X extends EventTarget{constructor(){super(...arguments);v(this,w,null)}get document(){return p(this,w)}set document(t){f(this,w,t),this.dispatchEvent(new Event("documentChanged"))}}w=new WeakMap;new X;var b;class H extends h{constructor(){super();v(this,b)}get inPageLinks(){return p(this,b)}set inPageLinks(t){f(this,b,t),this.invalidate()}hidePopupNav(){this.dispatchEvent(new Event("hidePopupNav"))}}b=new WeakMap,d(H,"template",{type:"nav",id:"secondary-nav",on_click:t=>t.hidePopupNav(),$:[{if:t=>{var n;return((n=t.inPageLinks)==null?void 0:n.length)>0},$:N.h(6,"On This Page")},{type:"ul",$:{foreach:t=>t.inPageLinks,type:"li",$:{type:"a",attr_href:t=>`#${t.id}`,text:t=>t.text}}}]});g.declare(`
#secondary-nav
{
    padding: 0rem 1rem 1rem 1rem;

    ul
    {
        font-size: 0.8rem;
        li
        {
            padding-top: 0.5rem;
            line-height: 1.2rem;
        }
    }
}

`);class j extends h{constructor(){super(),this.init(),this.showSidePanelTransition=new E(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new E(this.rootNode,"show-secondary-panel")}loadRoute(e){this.url=e.url,this.page=e.page,this.invalidate(),this.hidePanel()}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}d(j,"template",{type:"div",id:"layoutDocumentation",$:[{type:O,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:{type:R,url:e=>e.url}},{type:"div",id:"div-center",$:{type:"embed-slot",content:e=>e.page}},{type:"div",id:"div-rhs",$:{type:H,inPageLinks:e=>{var t;return(t=e.page)==null?void 0:t.inPageLinks},on_hidePopupNav:e=>e.hidePanel()}}]}]});const P=720,$=250;g.declare(`
:root
{
    --side-panel-width: ${$}px;
    --max-content-width: ${P}px;
    --main-indent: calc((100% - (var(--max-content-width) + var(--side-panel-width) * 2)) / 2);
    --fixed-header-height: var(--header-height);
    --align-content: -1.3rem;

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


@media screen and (width < ${$*2+P+25}px) 
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

@media screen and (width < ${$+P+25}px) 
{
    :root
    {
        --fixed-header-height: 0;
        --align-content: 0;
    }
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
    #div-rhs
    {
        h6
        {
            margin-top: 0;
        }
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

    #layoutDocumentation.show-secondary-panel
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

    #layoutDocumentation.show-side-panel
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



`);class C extends h{constructor(){super()}loadRoute(e){this.page=e.page,this.invalidate()}}d(C,"template",{type:"div",id:"layoutBare",$:{type:"embed-slot",content:e=>e.page}});g.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);class _ extends h{constructor(e){super(),this.url=e}}d(_,"template",{type:"div",class:"center",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:e=>`The page ${e.url} doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]});y.register({match:a=>(a.page=new _(a.url),!0),order:1e3});class M extends h{constructor(e){super(),this.document=e}get inPageLinks(){return this.document.headings}get layout(){var e,t;switch((t=(e=this.document)==null?void 0:e.frontmatter)==null?void 0:t.layout){case"bare":return C;default:return j}}}d(M,"template",{type:"div",class:"article",$:e=>N.raw(e.document.html)});g.declare(`
.article
{
    padding: 10px 50px;
    margin: 0;
    margin-top: var(--align-content);

    h1
    {
        margin-top: 0;
    }

    .hljs 
    {
        background-color: #282828;
        font-size: 0.9rem;
    }

    h2::before
    {
        content: " ";
        display: block;
        height: 5rem; 
        margin-top: -5rem;
    }

    a.hlink
    {
        float: left;
        margin-left: -1.2rem;
        opacity: 0;
        transition: opacity .2s;
    }

    h2:hover
    {
        a.hlink
        {
            opacity: 1;
        }
    }
}

`);y.register({pattern:"/:pathname*",match:a=>(a.document=new W(a.match.groups.pathname),Object.defineProperty(a,"page",{get:function(){return a._page||(a.document.failed?a._page=new _:a._page=new M(a.document)),a._page}}),!0),order:10});var u;class A extends h{constructor(){super();v(this,u,null);y.addEventListener("navigateLoaded",t=>{var n;t.route.page&&(t.route.page.layout?(t.route.page.layout!=((n=p(this,u))==null?void 0:n.constructor)&&(f(this,u,new t.route.page.layout),this.layoutSlot.content=p(this,u)),p(this,u).loadRoute(t.route)):this.layoutSlot.content=t.route.page)}),y.addEventListener("navigateCancelled",t=>{var n;(n=t.route.page)==null||n.destroy()})}}u=new WeakMap,d(A,"template",{type:"div",id:"layoutRoot",$:[z,{type:"embed-slot",bind:"layoutSlot"}]});g.declare(`
#layoutRoot
{
    padding-top: var(--fixed-header-height);
}
`);function q(){new A().mount("body"),y.start()}q();
