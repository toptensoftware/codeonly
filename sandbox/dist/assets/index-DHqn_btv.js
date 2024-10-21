var _=Object.defineProperty;var y=r=>{throw TypeError(r)};var $=(r,t,e)=>t in r?_(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var d=(r,t,e)=>$(r,typeof t!="symbol"?t+"":t,e),v=(r,t,e)=>t.has(r)||y("Cannot "+e);var a=(r,t,e)=>(v(r,t,"read from private field"),e?e.call(r):t.get(r)),u=(r,t,e)=>t.has(r)?y("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(r):t.set(r,e),l=(r,t,e,i)=>(v(r,t,"write to private field"),i?i.call(r,e):t.set(r,e),e);import{Style as w,Component as f}from"@toptensoftware/codeonly";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const b of s.addedNodes)b.tagName==="LINK"&&b.rel==="modulepreload"&&i(b)}).observe(document,{childList:!0,subtree:!0});function e(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=e(o);fetch(o.href,s)}})();async function O(r){const e=new Blob([r]).stream().pipeThrough(new CompressionStream("gzip")),i=[];for await(const o of e)i.push(o);return await x(i)}async function B(r){const e=new Blob([r]).stream().pipeThrough(new DecompressionStream("gzip")),i=[];for await(const s of e)i.push(s);const o=await x(i);return new TextDecoder().decode(o)}async function x(r){const e=await new Blob(r).arrayBuffer();return new Uint8Array(e)}async function D(r){const t=await new Promise(e=>{const i=new FileReader;i.onload=()=>e(i.result),i.readAsDataURL(new Blob([r]))});return t.slice(t.indexOf(",")+1)}async function T(r){var t="data:application/octet-binary;base64,"+r;return await(await fetch(t)).arrayBuffer()}let z=`class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;var h;class A extends EventTarget{constructor(){super();u(this,h,z);window.addEventListener("message",e=>{if(e.data.action=="error"){let i=new Event("scriptError");i.error=e.data.error,this.dispatchEvent(i)}}),window.addEventListener("hashchange",e=>{this.loadFromHash()}),this.loadFromHash()}get script(){return a(this,h)}set script(e){a(this,h)!=e&&(l(this,h,e),this.dispatchEvent(new Event("scriptChanged")))}async getDataLink(){return D(await O(this.script))}async restoreDataLink(e){this.script=await B(await T(e))}async onSaveLink(){window.location.hash=await n.getDataLink()}async loadFromHash(){window.location.hash.length>1&&this.restoreDataLink(window.location.hash.substring(1))}}h=new WeakMap;let n=new A;class C extends f{}d(C,"template",{_:"header",id:"header",$:[{_:"div",class:"title",text:"CodeOnly Sandbox"},{_:"div",class:"buttons",$:[{_:"button",class:"small",text:"Save Link",on_click:()=>n.onSaveLink()}]}]});w.declare(`
#header
{
    display: flex;
    justify-content: start;
    align-items: center;
    height: var(--header-height);
    border-bottom: 5px solid var(--back-color);
    padding-left: 10px;
    padding-right: 10px;

    .title 
    {
        flex-grow: 1;
    }


    .buttons
    {

    }
}
`);var c,m,p;class L extends f{constructor(){super();u(this,c,!1);u(this,m,null);u(this,p,null);this.init(),require(["vs/editor/editor.main"],()=>{this.editor=monaco.editor.create(this.editorContainer,{value:n.script,language:"javascript",theme:"vs-dark"}),this.editor.getModel().onDidChangeContent(i=>{this.onCodeChange()}),this.resizeEditor()}),new ResizeObserver(()=>{this.resizeEditor()}).observe(this.editorContainer),n.addEventListener("scriptChanged",i=>{!a(this,c)&&this.editor&&this.editor.setValue(n.script)}),n.addEventListener("scriptError",i=>{this.error=`line: ${i.error.lineno} col: ${i.error.colno}: ${i.error.message}`})}resizeEditor(){this.editor&&this.editor.layout()}get error(){return a(this,m)}set error(e){l(this,m,e),this.invalidate()}onCodeChange(){this.error=null,!a(this,c)&&(a(this,p)!=null&&clearTimeout(a(this,p)),l(this,p,setTimeout(()=>{l(this,c,!0),n.script=this.editor.getValue(),l(this,c,!1)},500)))}}c=new WeakMap,m=new WeakMap,p=new WeakMap,d(L,"template",{_:"div",id:"editor",$:[{_:"div",class:"editorContainer",bind:"editorContainer"},{_:"div",class:"error",display:e=>!!e.error,text:e=>e.error}]});w.declare(`

#editor
{
    position: relative;
    width: 50%;

    .editorContainer
    {
        width: 100%;
        height: 100%;
    }

    .error
    {

        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        padding: 0.5rem;
        background-color: rgb(from var(--danger-color) r g b / 10%);
        border: 1px solid var(--danger-color);
        border-radius: .3rem;
        z-index: 100;
    }
}
`);let g=`<html>
<head>
    <link href="./stylish.css" type="text/css" rel="stylesheet" />
<script type="importmap">
{
    "imports": {
        "@toptensoftware/codeonly": "./codeonly.js"
    }
}
<\/script>
<script>
window.addEventListener("error", (ev) => {
    parent.postMessage({action: "error", error: { message: ev.message, lineno: ev.lineno - ##patchlinecount##, colno: ev.colno } });
})
<\/script>
</head>
<body>
<script type="module">
import { Component, Style } from "@toptensoftware/codeonly";
`,F=`
<\/script>
</body>
</html>
`;g=g.replace("##patchlinecount##",(g.split(`
`).length-1).toString());class E extends f{constructor(t){super(),this.script=t}get srcdoc(){return`${g}${this.script}
        new Main().mount("body");
        ${F}
        `}}d(E,"template",{_:"iframe",attr_srcdoc:t=>t.srcdoc});class k extends f{constructor(){super(),n.addEventListener("scriptChanged",()=>{this.invalidate()})}createIframe(){return new E(n.script)}}d(k,"template",{_:"div",id:"preview",$:{_:"embed-slot",content:t=>t.createIframe()}});w.declare(`
#preview
{
    position: relative;
    flex-grow: 1;
    background: var(--body-back-color);
    iframe
    {
        width: 100%;
        height: 100%;
        border: none;
    }
}
`);class S extends f{}d(S,"template",[C,{_:"main",id:"main",$:[L,k]}]);w.declare(`
body
{
    padding: 0;
    margin: 0;

    --header-height: 40px;
}

#main
{
    display: flex;
    height: calc(100vh - var(--header-height));
    gap: 10px;
    background: var(--back-color);

}
`);function M(){new S().mount("body")}M();
