var a=Object.defineProperty;var d=(o,t,i)=>t in o?a(o,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):o[t]=i;var s=(o,t,i)=>d(o,typeof t!="symbol"?t+"":t,i);import{Component as u,Html as f,Style as p}from"@toptensoftware/codeonly";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&c(n)}).observe(document,{childList:!0,subtree:!0});function i(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(e){if(e.ep)return;e.ep=!0;const r=i(e);fetch(e.href,r)}})();class l extends u{}s(l,"template",[f.h(1,"CodeOnly Docs!!")]);p.declare(`
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
`);function m(){new l().mount("body")}m();
