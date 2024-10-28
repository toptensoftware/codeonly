var Vt=Object.defineProperty;var ot=r=>{throw TypeError(r)};var Ht=(r,e,t)=>e in r?Vt(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var C=(r,e,t)=>Ht(r,typeof e!="symbol"?e+"":e,t),ze=(r,e,t)=>e.has(r)||ot("Cannot "+t);var a=(r,e,t)=>(ze(r,e,"read from private field"),t?t.call(r):e.get(r)),$=(r,e,t)=>e.has(r)?ot("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),f=(r,e,t,i)=>(ze(r,e,"write to private field"),i?i.call(r,t):e.set(r,t),t),S=(r,e,t)=>(ze(r,e,"access private method"),t);var ye=(r,e,t,i)=>({set _(n){f(r,e,n,t)},get _(){return a(r,e,i)}});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();function je(r){return r.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}function Je(r){return r instanceof Function&&!!r.prototype&&!!r.prototype.constructor}let Ut=/^[a-zA-Z$][a-zA-Z0-9_$]*$/;function re(r){return r.match(Ut)?`.${r}`:`[${JSON.stringify(r)}]`}function Jt(r,e){r.loading?r.addEventListener("loaded",e,{once:!0}):e()}class j{constructor(e){this.html=e}}class Wt{constructor(e){this.value=e}}function Re(){let r=[],e="";function t(...y){for(let p=0;p<y.length;p++){let c=y[p];c.lines?r.push(...c.lines.map(v=>e+v)):Array.isArray(c)?r.push(...c.filter(v=>v!=null).map(v=>e+v)):r.push(...c.split(`
`).map(v=>e+v))}}function i(){e+="  "}function n(){e=e.substring(2)}function o(){return r.join(`
`)+`
`}function d(y){t("{"),i(),y(this),n(),t("}")}function h(...y){let p={pos:this.lines.length};return this.append(y),p.headerLineCount=this.lines.length-p.pos,p}function m(y,...p){this.lines.length==y.pos+y.headerLineCount?this.lines.splice(y.pos,y.headerLineCount):this.append(p)}return{append:t,enterCollapsibleBlock:h,leaveCollapsibleBlock:m,indent:i,unindent:n,braced:d,toString:o,lines:r,get isEmpty(){return r.length==0}}}class tt{constructor(){this.code=Re(),this.code.closure=this,this.functions=[],this.locals=[],this.prologs=[],this.epilogs=[]}get isEmpty(){return this.code.isEmpty&&this.locals.length==0&&this.functions.every(e=>e.code.isEmpty)&&this.prologs.every(e=>e.isEmpty)&&this.epilogs.every(e=>e.isEmpty)}addProlog(){let e=Re();return this.prologs.push(e),e}addEpilog(){let e=Re();return this.epilogs.push(e),e}addLocal(e,t){this.locals.push({name:e,init:t})}addFunction(e,t){t||(t=[]);let i={name:e,args:t,code:new tt};return this.functions.push(i),i.code}getFunction(e){var t;return(t=this.functions.find(i=>i.name==e))==null?void 0:t.code}toString(){let e=Re();return this.appendTo(e),e.toString()}appendTo(e){this.locals.length>0&&e.append(`let ${this.locals.map(t=>t.init?`${t.name} = ${t.init}`:t.name).join(", ")};`);for(let t of this.prologs)e.append(t);e.append(this.code);for(let t of this.functions)e.append(`function ${t.name}(${t.args.join(", ")})`),e.append("{"),e.indent(),t.code.appendTo(e),e.unindent(),e.append("}");for(let t of this.epilogs)e.append(t)}}function Me(r){return r==null?"":(""+r).replace(/["'&<>]/g,function(e){switch(e){case'"':return"&quot;";case"&":return"&amp;";case"'":return"&#39;";case"<":return"&lt;";case">":return"&gt;"}})}class ut{static rawText(e){return e instanceof j?e.html:Me(e)}static renderToString(e){let t="";return e({write:function(i){t+=i}}),t}static renderComponentToString(e){let t="";return e.render({write:function(i){t+=i}}),t}static rawStyle(e){let t;return e instanceof j?t=e.html:t=Me(e),t=t.trim(),t.endsWith(";")||(t+=";"),t}static rawNamedStyle(e,t){if(!t)return"";let i;return t instanceof j?i=t.html:i=Me(t),i=i.trim(),i+=";",`${e}:${i}`}static createTextNode(e){if(e instanceof j){let t=document.createElement("SPAN");return t.innerHTML=e.html,t}else return document.createTextNode(e)}static setElementText(e,t){t instanceof j?e.innerHTML=t.html:e.innerText=t}static setNodeText(e,t){if(t instanceof j){if(e.nodeType==1)return e.innerHTML=t.html,e;let i=document.createElement("SPAN");return i.innerHTML=t.html,e.replaceWith(i),i}else{if(e.nodeType==3)return e.nodeValue=t,e;let i=document.createTextNode(t);return e.replaceWith(i),i}}static setNodeClass(e,t,i){i?e.classList.add(t):e.classList.remove(t)}static setNodeStyle(e,t,i){i==null?e.style.removeProperty(t):e.style[t]=i}static setNodeDisplay(e,t,i){if(t===!0){i===null?e.style.removeProperty("display"):i!==void 0&&e.style.display!=i&&(e.style.display=i);return}else if(t===!1||t===null||t===void 0){let n=e.style.display;return e.style.display!="none"&&(e.style.display="none"),n??null}else if(typeof t=="string"){let n=e.style.display;return e.style.display!=t&&(e.style.display=t),n??null}}static replaceMany(e,t){var i;if((i=e==null?void 0:e[0])!=null&&i.parentNode){e[0].replaceWith(...t);for(let n=1;n<e.length;n++)e[n].remove()}}static addEventListener(e,t,i,n){function o(d){return n(e(),d)}return t.addEventListener(i,o),function(){t.removeEventListener(i,o)}}}function at(r){let e=function(){var i;let t=(i=b.document)==null?void 0:i.createComment(r);return{get rootNode(){return t},get rootNodes(){return[t]},get isSingleRoot(){return!0},destroy(){},update(){},render(n){n.write(`<!--${Me(r)}-->`)}}};return e.isSingleRoot=!0,e}class Ae{static integrate(e,t){let i=[],n=[],o=!1,d=!0;for(let h=0;h<e.branches.length;h++){let m=e.branches[h],y={};if(i.push(y),m.condition instanceof Function?(y.condition=m.condition,o=!1):m.condition!==void 0?(y.condition=()=>m.condition,o=!!m.condition):(y.condition=()=>!0,o=!0),m.template!==void 0){let p=new ne(m.template,t);p.isSingleRoot||(d=!1),y.nodeIndex=n.length,n.push(p)}}return delete e.branches,o||i.push({condition:()=>!0}),{isSingleRoot:d,wantsUpdate:!0,nodes:n,data:i}}static transform(e){if(e.if===void 0)return e;let t={type:Ae,branches:[{template:e,condition:e.if}]};return delete e.if,t}static transformGroup(e){let t=null;for(let i=0;i<e.length;i++){let n=e[i];if(n.if)t={type:Ae,branches:[{condition:n.if,template:n}]},delete n.if,e.splice(i,1,t);else if(n.elseif){if(!t)throw new Error("template has 'elseif' without a preceeding condition");t.branches.push({condition:n.elseif,template:n}),delete n.elseif,e.splice(i,1),i--}else if(n.else!==void 0){if(!t)throw new Error("template has 'else' without a preceeding condition");t.branches.push({condition:!0,template:n}),delete n.else,t=null,e.splice(i,1),i--}else t=null}}constructor(e){this.branches=e.data,this.branch_constructors=[],this.context=e.context;for(let t of this.branches)t.nodeIndex!==void 0?this.branch_constructors.push(e.nodes[t.nodeIndex]):this.branch_constructors.push(at(" IfBlock placeholder "));this.activeBranchIndex=-1,this.activeBranch=at(" IfBlock placeholder ")()}destroy(){this.activeBranch.destroy()}update(){this.switchActiveBranch(),this.activeBranch.update()}render(e){this.activeBranch.render(e)}unbind(){var e,t;(t=(e=this.activeBranch).unbind)==null||t.call(e)}bind(){var e,t;(t=(e=this.activeBranch).bind)==null||t.call(e)}switchActiveBranch(e){let t=this.resolveActiveBranch();if(t!=this.activeBranchIndex){let i=this.activeBranch;this.activeBranchIndex=t,this.activeBranch=this.branch_constructors[t](),ut.replaceMany(i.rootNodes,this.activeBranch.rootNodes),i.destroy()}}resolveActiveBranch(){for(let e=0;e<this.branches.length;e++)if(this.branches[e].condition.call(this.context.model,this.context.model,this.context))return e;throw new Error("internal error, IfBlock didn't resolve to a branch")}get rootNodes(){return this.activeBranch.rootNodes}get rootNode(){return this.activeBranch.rootNode}}function Zt(r,e){let t=Math.min(r.length,e.length),i=Math.max(r.length,e.length),n=0;for(;n<t&&r[n]==e[n];)n++;if(n==i)return[];if(n==r.length)return[{op:"insert",index:r.length,count:e.length-r.length}];let o=0;for(;o<t-n&&r[r.length-o-1]==e[e.length-o-1];)o++;if(o==r.length)return[{op:"insert",index:0,count:e.length-r.length}];if(n+o==r.length)return[{op:"insert",index:n,count:e.length-r.length}];if(n+o==e.length)return[{op:"delete",index:n,count:r.length-e.length}];let d=r.length-o,h=e.length-o,m=se(e,n,h),y=null,p=[],c=n,v=n;for(;c<h;){for(;c<h&&r[v]==e[c];)m.delete(e[c],c),c++,v++;let u=c,_=v;for(;v<d&&!m.has(r[v]);)v++;if(v>_){p.push({op:"delete",index:u,count:v-_});continue}for(y||(y=se(r,c,d));c<h&&!y.has(e[c]);)m.delete(e[c],c),c++;if(c>u){p.push({op:"insert",index:u,count:c-u});continue}break}if(c==h)return p;let l=0,P=new lt;for(;v<d;){let u=v;for(;v<d&&!m.has(r[v]);)v++;if(v>u){p.push({op:"delete",index:c,count:v-u});continue}for(;v<d&&m.consume(r[v])!==void 0;)P.add(r[v],l++),v++;v>u&&p.push({op:"store",index:c,count:v-u})}for(;c<h;){let u=c;for(;c<h&&!P.has(e[c]);)c++;if(c>u){p.push({op:"insert",index:u,count:c-u});continue}let _={op:"restore",index:c,count:0};for(p.push(_);c<h;){let A=P.consume(e[c]);if(A===void 0)break;_.count==0?(_.storeIndex=A,_.count=1):_.storeIndex+_.count==A?_.count++:(_={op:"restore",index:c,storeIndex:A,count:1},p.push(_)),c++}}return p;function se(u,_,A){let me=new lt;for(let ge=_;ge<A;ge++)me.add(u[ge],ge);return me}}var Y;class lt{constructor(){$(this,Y,new Map)}add(e,t){let i=a(this,Y).get(e);i?i.push(t):a(this,Y).set(e,[t])}delete(e,t){let i=a(this,Y).get(e);if(i){let n=i.indexOf(t);if(n>=0){i.splice(n,1);return}}throw new Error("key/value pair not found")}consume(e){let t=a(this,Y).get(e);if(!(!t||t.length==0))return t.shift()}has(e){return a(this,Y).has(e)}}Y=new WeakMap;var x,Ze,Oe,X,ae,le,de,ft,Ge,mt,Ye,gt,Xe,yt,Qe,oe;const ve=class ve{constructor(e){$(this,x);$(this,X);$(this,ae);$(this,le);$(this,de);var t,i;this.itemConstructor=e.data.itemConstructor,this.outer=e.context,this.items=e.data.template.items,this.condition=e.data.template.condition,this.itemKey=e.data.template.itemKey,this.emptyConstructor=e.nodes.length?e.nodes[0]:null,this.itemDoms=[],this.headSentinal=(t=b.document)==null?void 0:t.createComment(" enter foreach block "),this.tailSentinal=(i=b.document)==null?void 0:i.createComment(" leave foreach block "),this.itemConstructor.isSingleRoot?(f(this,X,S(this,x,gt)),f(this,le,S(this,x,yt)),f(this,ae,S(this,x,Xe)),f(this,de,S(this,x,Qe))):(f(this,X,S(this,x,ft)),f(this,le,S(this,x,mt)),f(this,ae,S(this,x,Ge)),f(this,de,S(this,x,Ye)))}static integrate(e,t){let i={itemConstructor:t.compileTemplate(e.template),template:{items:e.items,condition:e.condition,itemKey:e.itemKey}},n;return e.empty&&(n=[new ne(e.empty,t)]),delete e.template,delete e.items,delete e.condition,delete e.itemKey,delete e.empty,{isSingleRoot:!1,wantsUpdate:!0,data:i,nodes:n}}static transform(e){if(e.foreach===void 0)return e;let t;return e.foreach instanceof Function||Array.isArray(e.foreach)?(t={type:ve,template:e,items:e.foreach},delete e.foreach):(t=Object.assign({},e.foreach,{type:ve,template:e}),delete e.foreach),t}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1].foreach!==void 0&&(e[t-1]=ve.transform(e[t-1])),e[t-1].type===ve&&!e[t-1].else&&(delete e[t].else,e[t-1].empty=e[t],e.splice(t,1),t--))}onObservableUpdate(e,t,i){let n={outer:this.outer};if(i==0&&t==0){let o=this.observableItems[e],d=[o],h=null;this.itemKey&&(n.model=o,h=[this.itemKey.call(o,o,n)]),S(this,x,oe).call(this,d,h,e,0,1)}else{let o=null,d=this.observableItems.slice(e,e+i);this.itemKey&&(o=d.map(h=>(n.model=h,this.itemKey.call(h,h,n)))),i&&t?S(this,x,Ze).call(this,e,t,d,o):t!=0?a(this,le).call(this,e,t):i!=0&&a(this,X).call(this,d,o,e,0,i),S(this,x,Oe).call(this)}}get rootNodes(){let e=this.emptyDom?this.emptyDom.rootNodes:[];if(this.itemConstructor.isSingleRoot)return[this.headSentinal,...this.itemDoms.map(t=>t.rootNode),...e,this.tailSentinal];{let t=[this.headSentinal];for(let i=0;i<this.itemDoms.length;i++)t.push(...this.itemDoms[i].rootNodes);return t.push(...e),t.push(this.tailSentinal),t}}update(){let e;this.items instanceof Function?e=this.items.call(this.outer.model,this.outer.model,this.outer):e=this.items,e=e??[],this.observableItems!=null&&this.observableItems!=e&&this.observableItems.removeListener(this._onObservableUpdate),Array.isArray(e)&&e.isObservable&&this.observableItems!=e&&(this._onObservableUpdate=this.onObservableUpdate.bind(this),this.observableItems=e,this.observableItems.addListener(this._onObservableUpdate),a(this,le).call(this,0,this.itemDoms.length),this.itemsLoaded=!1);let t={outer:this.outer},i=null;if(this.observableItems||this.condition&&(e=e.filter(n=>(t.model=n,this.condition.call(n,n,t)))),this.itemKey&&(i=e.map(n=>(t.model=n,this.itemKey.call(n,n,t)))),!this.itemsLoaded){this.itemsLoaded=!0,a(this,X).call(this,e,i,0,0,e.length),S(this,x,Oe).call(this);return}this.observableItems||S(this,x,Ze).call(this,0,this.itemDoms.length,e,i)}render(e){e.write("<!-- enter foreach block -->");for(let t=0;t<this.itemDoms.length;t++)this.itemDoms[t].render(e);e.write("<!-- leave foreach block -->")}bind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.bind)==null||t.call(e)}unbind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.unbind)==null||t.call(e)}destroy(){this.observableItems!=null&&(this.observableItems.removeListener(this._onObservableUpdate),this.observableItems=null);for(let e=0;e<this.itemDoms.length;e++)this.itemDoms[e].destroy();this.itemDoms=null}get isAttached(){var e;return((e=this.tailSentinal)==null?void 0:e.parentNode)!=null}};x=new WeakSet,Ze=function(e,t,i,n){let o=e+t,d;e==0&&t==this.itemDoms.length?d=this.itemDoms:d=this.itemDoms.slice(e,o);let h;if(n?h=Zt(d.map(u=>u.context.key),n):i.length>d.length?h=[{op:"insert",index:d.length,count:i.length-d.length}]:i.length<d.length?h=[{op:"delete",index:i.length,count:d.length-i.length}]:h=[],h.length==0){S(this,x,oe).call(this,i,n,e,0,t);return}let m=[],y=[],p={insert:v,delete:l,store:P,restore:se},c=0;for(let u of h)u.index>c&&(S(this,x,oe).call(this,i,n,e+c,c,u.index-c),c=u.index),p[u.op].call(this,u);c<i.length&&S(this,x,oe).call(this,i,n,e+c,c,i.length-c);for(let u=y.length-1;u>=0;u--)y[u].destroy();S(this,x,Oe).call(this);function v(u){c+=u.count;let _=Math.min(y.length,u.count);_&&(a(this,ae).call(this,u.index+e,y.splice(0,_)),S(this,x,oe).call(this,i,n,u.index+e,u.index,_)),_<u.count&&a(this,X).call(this,i,n,u.index+e+_,u.index+_,u.count-_)}function l(u){y.push(...a(this,de).call(this,u.index+e,u.count))}function P(u){m.push(...a(this,de).call(this,u.index+e,u.count))}function se(u){c+=u.count,a(this,ae).call(this,u.index+e,m.slice(u.storeIndex,u.storeIndex+u.count)),S(this,x,oe).call(this,i,n,u.index+e,u.index,u.count)}},Oe=function(){if(this.itemDoms.length==0)!this.emptyDom&&this.emptyConstructor&&(this.emptyDom=this.emptyConstructor(),this.isAttached&&this.tailSentinal.before(...this.emptyDom.rootNodes)),this.emptyDom&&this.emptyDom.update();else if(this.emptyDom){if(this.isAttached)for(var e of this.emptyDom.rootNodes)e.remove();this.emptyDom.destroy(),this.emptyDom=null}},X=new WeakMap,ae=new WeakMap,le=new WeakMap,de=new WeakMap,ft=function(e,t,i,n,o){let d=[];for(let h=0;h<o;h++){let m={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(m))}S(this,x,Ge).call(this,i,d)},Ge=function(e,t){if(this.itemDoms.splice(e,0,...t),this.isAttached){let i=[];t.forEach(o=>i.push(...o.rootNodes));let n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNodes[0]:n=this.tailSentinal,n.before(...i)}},mt=function(e,t){let i=S(this,x,Ye).call(this,e,t);for(let n=i.length-1;n>=0;n--)i[n].destroy()},Ye=function(e,t){let i=this.isAttached;for(let n=0;n<t;n++)if(i){let o=this.itemDoms[e+n].rootNodes;for(let d=0;d<o.length;d++)o[d].remove()}return this.itemDoms.splice(e,t)},gt=function(e,t,i,n,o){let d=[];for(let h=0;h<o;h++){let m={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(m))}S(this,x,Xe).call(this,i,d)},Xe=function(e,t){if(this.itemDoms.splice(e,0,...t),this.isAttached){let i=t.map(o=>o.rootNode),n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNode:n=this.tailSentinal,n.before(...i)}},yt=function(e,t){let i=S(this,x,Qe).call(this,e,t);for(let n=i.length-1;n>=0;n--)i[n].destroy()},Qe=function(e,t){let i=this.isAttached;for(let n=0;n<t;n++)i&&this.itemDoms[e+n].rootNode.remove();return this.itemDoms.splice(e,t)},oe=function(e,t,i,n,o){for(let d=0;d<o;d++){let h=this.itemDoms[i+d];h.context.key=t==null?void 0:t[n+d],h.context.index=i+d,h.context.model=e[n+d],h.rebind(),h.update()}};let We=ve;var q,V,F,he,D,ce,be,Q,K;const we=class we{constructor(e){$(this,q);$(this,V);$(this,F);$(this,he);$(this,D);$(this,ce);$(this,be);$(this,Q);$(this,K,!0);var t,i;f(this,q,e.context),f(this,be,e.nodes[1]),f(this,he,(t=b.document)==null?void 0:t.createTextNode("")),f(this,ce,(i=b.document)==null?void 0:i.createTextNode("")),f(this,D,[]),f(this,K,e.data.ownsContent??!0),e.nodes[0]?this.content=e.nodes[0]():this.content=e.data.content}static integrate(e,t){let i=null;e.content&&typeof e.content=="object"&&(i=e.content,delete e.content);let n={isSingleRoot:!1,wantsUpdate:!0,data:{ownsContent:e.ownsContent??!0,content:e.content},nodes:[i?new ne(i,t):null,e.placeholder?new ne(e.placeholder,t):null]};return delete e.content,delete e.placeholder,delete e.ownsContent,n}static transform(e){return e instanceof Function&&!Je(e)?{type:we,content:e}:(e.type=="embed-slot"&&(e.type=we),e)}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1]=we.transform(e[t-1]),e[t-1].type===we&&!e[t-1].placeholder&&(delete e[t].else,e[t-1].placeholder=e[t],e.splice(t,1),t--))}get rootNodes(){return[a(this,he),...a(this,D),a(this,ce)]}get isSingleRoot(){return!1}get ownsContent(){return a(this,K)}set ownsContent(e){f(this,K,e)}get content(){return a(this,V)}set content(e){f(this,V,e),a(this,V)instanceof Function?this.replaceContent(a(this,V).call(a(this,q).model,a(this,q).model,a(this,q))):this.replaceContent(a(this,V))}update(){a(this,V)instanceof Function&&this.replaceContent(a(this,V).call(a(this,q).model,a(this,q).model,a(this,q)))}bind(){var e,t;a(this,Q)&&((t=(e=a(this,F))==null?void 0:e.bind)==null||t.call(e))}unbind(){var e,t;a(this,Q)&&((t=(e=a(this,F))==null?void 0:e.unbind)==null||t.call(e))}get isAttached(){var e;return((e=a(this,he))==null?void 0:e.parentNode)!=null}replaceContent(e){var t,i;if(!(e==a(this,F)||!e&&a(this,Q))){if(this.isAttached){let n=a(this,he).nextSibling;for(;n!=a(this,ce);){let o=n.nextSibling;n.remove(),n=o}}if(f(this,D,[]),a(this,K)&&((i=(t=a(this,F))==null?void 0:t.destroy)==null||i.call(t)),f(this,F,e),f(this,Q,!1),!e)a(this,be)&&(f(this,F,a(this,be).call(this,a(this,q))),f(this,Q,!0),f(this,D,a(this,F).rootNodes));else if(e.rootNodes!==void 0)f(this,D,e.rootNodes);else if(Array.isArray(e))f(this,D,e);else if(b.Node!==void 0&&e instanceof b.Node)f(this,D,[e]);else if(e instanceof j){let n=b.document.createElement("span");n.innerHTML=e.html,f(this,D,[...n.childNodes])}else if(typeof e=="string")f(this,D,[b.document.createTextNode(e)]);else if(e.render)f(this,D,[]);else throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");this.isAttached&&a(this,ce).before(...a(this,D))}}destroy(){var e,t;a(this,K)&&((t=(e=a(this,F))==null?void 0:e.destroy)==null||t.call(e))}render(e){var t,i;a(this,F)&&((i=(t=a(this,F)).render)==null||i.call(t,e))}};q=new WeakMap,V=new WeakMap,F=new WeakMap,he=new WeakMap,D=new WeakMap,ce=new WeakMap,be=new WeakMap,Q=new WeakMap,K=new WeakMap;let Ke=we;class et{static register(e){this.plugins.push(e)}static transform(e){for(let t of this.plugins)t.transform&&(e=t.transform(e));return e}static transformGroup(e){var t;for(let i of this.plugins)(t=i.transformGroup)==null||t.call(i,e)}}C(et,"plugins",[We,Ke,Ae]);class ne{constructor(e,t){if(Array.isArray(e)&&(e={$:e}),e._&&!e.type&&(e.type=e._,delete e._),e=et.transform(e),Je(e)&&(e={type:e}),this.template=e,Je(e.type))e.type.integrate?this.kind="integrated":this.kind="component";else if(typeof e=="string")this.kind="text";else if(e instanceof j){if(this.kind="html",this.html=e.html,b.document){let i=b.document.createElement("div");i.innerHTML=e.html,this.nodes=[...i.childNodes],this.nodes.forEach(n=>n.remove())}}else e instanceof Function?this.kind="dynamic_text":e.type==="comment"?this.kind="comment":e.type===void 0?this.kind="fragment":this.kind="element";if(this.kind==="integrated"&&(e.$&&!e.content&&(e.content=e.$,delete e.$),this.integrated=this.template.type.integrate(this.template,t)),this.kind=="element"&&e.$&&!e.text&&(typeof e.$=="string"||e.$ instanceof j)&&(e.text=e.$,delete e.$),this.kind=="element"||this.kind=="fragment")e.$&&!e.childNodes&&(e.childNodes=e.$,delete e.$),e.childNodes?(Array.isArray(e.childNodes)?e.childNodes=e.childNodes.flat():e.childNodes=[e.childNodes],e.childNodes.forEach(i=>{i._&&!i.type&&(i.type=i._,delete i._)}),et.transformGroup(e.childNodes),this.childNodes=this.template.childNodes.map(i=>new ne(i,t))):this.childNodes=[];else if(this.isComponent)e.$&&!e.content&&(e.content=e.$,delete e.$);else if(e.childNodes)throw new Error("childNodes only supported on element and fragment nodes")}get isSingleRoot(){return this.isFragment?this.childNodes.length==1&&this.childNodes[0].isSingleRoot:this.isComponent?this.template.type.isSingleRoot:this.isIntegrated?this.integrated.isSingleRoot:this.kind=="html"?this.nodes.length==1:!0}get isComponent(){return this.kind==="component"}get isFragment(){return this.kind==="fragment"}get isIntegrated(){return this.kind==="integrated"}*enumLocalNodes(){if(this.isFragment||(yield this),this.childNodes)for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumLocalNodes()}spreadChildDomNodes(){return Array.from(e(this)).filter(t=>t.length>0).join(", ");function*e(t){for(let i=0;i<t.childNodes.length;i++)yield t.childNodes[i].spreadDomNodes()}}spreadDomNodes(){return Array.from(this.enumAllNodes()).join(", ")}*enumAllNodes(){switch(this.kind){case"fragment":for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumAllNodes();break;case"component":case"integrated":this.isSingleRoot?yield`${this.name}.rootNode`:yield`...${this.name}.rootNodes`;break;case"html":this.nodes.length>0&&(this.nodes.length>1?yield`...${this.name}`:yield`${this.name}`);break;default:yield this.name}}}function Gt(r,e){let t=1,i=1,n=[],o=null,d=new ne(r,e),h=new Map;return{code:y(d,!0).toString(),isSingleRoot:d.isSingleRoot,refs:n};function y(p,c){let v={emit_text_node:ge,emit_html_node:Ft,emit_dynamic_text_node:Rt,emit_comment_node:It,emit_fragment_node:Bt,emit_element_node:At,emit_integrated_node:Mt,emit_component_node:Ot},l=new tt;l.create=l.addFunction("create").code,l.bind=l.addFunction("bind").code,l.update=l.addFunction("update").code,l.unbind=l.addFunction("unbind").code,l.destroy=l.addFunction("destroy").code;let P;c&&(P=l.addFunction("rebind").code);let se=new Map;c&&(o=l,o.code.append("let model = context.model;"),o.code.append("let document = env.document;")),l.code.append("create();"),l.code.append("bind();"),l.code.append("update();"),me(p);for(let s of p.enumLocalNodes())zt(s);l.bind.closure.isEmpty||(l.create.append("bind();"),l.destroy.closure.addProlog().append("unbind();"));let u=[];return p.isSingleRoot&&u.push(`  get rootNode() { return ${p.spreadDomNodes()}; },`),c?(u.push("  context,"),p==d&&h.forEach((s,g)=>u.push(`  get ${g}() { return ${s}; },`)),l.getFunction("bind").isEmpty?P.append("model = context.model"):(P.append("if (model != context.model)"),P.braced(()=>{P.append("unbind();"),P.append("model = context.model"),P.append("bind();")})),u.push("  rebind,")):(u.push("  bind,"),u.push("  unbind,")),l.code.append(["return { ","  update,","  destroy,",`  get rootNodes() { return [ ${p.spreadDomNodes()} ]; },`,`  isSingleRoot: ${p.isSingleRoot},`,...u,"};"]),l;function _(s){s.template.export?o.addLocal(s.name):l.addLocal(s.name)}function A(){l.update.temp_declared||(l.update.temp_declared=!0,l.update.append("let temp;"))}function me(s){s.name=`n${t++}`,v[`emit_${s.kind}_node`](s)}function ge(s){_(s),l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`)}function Ft(s){s.nodes.length!=0&&(_(s),s.nodes.length==1?(l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`),n.push(s.nodes[0])):(l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`),n.push(s.nodes)))}function Rt(s){_(s);let g=`p${i++}`;l.addLocal(g),l.create.append(`${s.name} = helpers.createTextNode("");`),A(),l.update.append(`temp = ${J(n.length)};`),l.update.append(`if (temp !== ${g})`),l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${g} = ${J(n.length)});`),n.push(s.template)}function It(s){if(_(s),s.template.text instanceof Function){let g=`p${i++}`;l.addLocal(g),l.create.append(`${s.name} = document.createComment("");`),A(),l.update.append(`temp = ${J(n.length)};`),l.update.append(`if (temp !== ${g})`),l.update.append(`  ${s.name}.nodeValue = ${g} = temp;`),n.push(s.template.text)}else l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`)}function Mt(s){let g=[],L=!1;if(s.integrated.nodes)for(let w=0;w<s.integrated.nodes.length;w++){let N=s.integrated.nodes[w];if(!N){g.push(null);continue}N.name=`n${t++}`;let E=y(N,!1);E.getFunction("bind").isEmpty||(L=!0);let rt=`${N.name}_constructor_${w+1}`,jt=l.addFunction(rt,[]);E.appendTo(jt.code),g.push(rt)}s.integrated.wantsUpdate&&l.update.append(`${s.name}.update()`),L&&(l.bind.append(`${s.name}.bind()`),l.unbind.append(`${s.name}.unbind()`));let T=-1;s.integrated.data&&(T=n.length,n.push(s.integrated.data)),_(s),l.create.append(`${s.name} = new refs[${n.length}]({`,"  context,",`  data: ${s.integrated.data?`refs[${T}]`:"null"},`,`  nodes: [ ${g.join(", ")} ],`,"});"),n.push(s.template.type);for(let w of Object.keys(s.template))if(!qe(s,w))throw new Error(`Unknown element template key: ${w}`)}function Ot(s){_(s),l.create.append(`${s.name} = new refs[${n.length}]();`),n.push(s.template.type);let g=new Set(s.template.type.slots??[]),L=s.template.update==="auto",T=!1;for(let w of Object.keys(s.template)){if(qe(s,w)||w=="update")continue;if(g.has(w)){if(s.template[w]===void 0)continue;let E=new ne(s.template[w],e);me(E),E.isSingleRoot?l.create.append(`${s.name}${re(w)}.content = ${E.name};`):l.create.append(`${s.name}${re(w)}.content = [${E.spreadDomNodes()}];`);continue}let N=typeof s.template[w];if(N=="string"||N=="number"||N=="boolean")l.create.append(`${s.name}${re(w)} = ${JSON.stringify(s.template[w])}`);else if(N==="function"){L&&!T&&(T=`${s.name}_mod`,l.update.append(`let ${T} = false;`));let E=`p${i++}`;l.addLocal(E);let st=n.length;A(),l.update.append(`temp = ${J(st)};`),l.update.append(`if (temp !== ${E})`),L&&(l.update.append("{"),l.update.append(`  ${T} = true;`)),l.update.append(`  ${s.name}${re(w)} = ${E} = temp;`),L&&l.update.append("}"),n.push(s.template[w])}else{let E=s.template[w];E instanceof Wt&&(E=E.value),l.create.append(`${s.name}${re(w)} = refs[${n.length}];`),n.push(E)}}s.template.update&&(typeof s.template.update=="function"?(l.update.append(`if (${J(n.length)})`),l.update.append(`  ${s.name}.update();`),n.push(s.template.update)):L?T&&(l.update.append(`if (${T})`),l.update.append(`  ${s.name}.update();`)):l.update.append(`${s.name}.update();`))}function Bt(s){nt(s)}function At(s){var T;let g=l.current_xmlns,L=s.template.xmlns;L===void 0&&s.template.type=="svg"&&(L="http://www.w3.org/2000/svg"),L==null&&(L=l.current_xmlns),_(s),L?(l.current_xmlns=L,l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(L)}, ${JSON.stringify(s.template.type)});`)):l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);for(let w of Object.keys(s.template))if(!qe(s,w)){if(w=="id"){W(s.template.id,N=>`${s.name}.setAttribute("id", ${N});`);continue}if(w=="class"){W(s.template.class,N=>`${s.name}.setAttribute("class", ${N});`);continue}if(w.startsWith("class_")){let N=je(w.substring(6));W(s.template[w],E=>`helpers.setNodeClass(${s.name}, ${JSON.stringify(N)}, ${E})`);continue}if(w=="style"){W(s.template.style,N=>`${s.name}.setAttribute("style", ${N});`);continue}if(w.startsWith("style_")){let N=je(w.substring(6));W(s.template[w],E=>`helpers.setNodeStyle(${s.name}, ${JSON.stringify(N)}, ${E})`);continue}if(w=="display"){if(s.template.display instanceof Function)l.addLocal(`${s.name}_prev_display`),W(s.template[w],N=>`${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${N}, ${s.name}_prev_display)`);else if(typeof s.template.display=="string")l.create.append(`${s.name}.style.display = '${s.template.display}';`);else if(s.template.display===!1||s.template.display===null||s.template.display===void 0)l.create.append(`${s.name}.style.display = 'none';`);else if(s.template.display!==!0)throw new Error("display property must be set to string, true, false, or null");continue}if(w.startsWith("attr_")){let N=w.substring(5);if(N=="style"||N=="class"||N=="id")throw new Error(`Incorrect attribute: use '${N}' instead of '${w}'`);l.current_xmlns||(N=je(N)),W(s.template[w],E=>`${s.name}.setAttribute(${JSON.stringify(N)}, ${E})`);continue}if(w=="text"){s.template.text instanceof Function?W(s.template.text,N=>`helpers.setElementText(${s.name}, ${N})`):s.template.text instanceof j&&l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`),typeof s.template.text=="string"&&l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);continue}throw new Error(`Unknown element template key: ${w}`)}nt(s),(T=s.childNodes)!=null&&T.length&&l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`),l.current_xmlns=g}function nt(s){if(s.childNodes)for(let g=0;g<s.childNodes.length;g++)me(s.childNodes[g])}function qe(s,g){if(qt(g))return!0;if(g=="export"){if(typeof s.template.export!="string")throw new Error("'export' must be a string");if(h.has(s.template.export))throw new Error(`duplicate export name '${s.template.export}'`);return h.set(s.template.export,s.name),!0}if(g=="bind"){if(typeof s.template.bind!="string")throw new Error("'bind' must be a string");if(se.has(s.template.export))throw new Error(`duplicate bind name '${s.template.bind}'`);return se.set(s.template.bind,!0),l.bind.append(`model${re(s.template.bind)} = ${s.name};`),l.unbind.append(`model${re(s.template.bind)} = null;`),!0}if(g.startsWith("on_")){let L=g.substring(3);if(!(s.template[g]instanceof Function))throw new Error(`event handler for '${g}' is not a function`);s.listenerCount||(s.listenerCount=0),s.listenerCount++;let T=`${s.name}_ev${s.listenerCount}`;return l.addLocal(T),l.create.append(`${T} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(L)}, refs[${n.length}]);`),n.push(s.template[g]),!0}return g=="debug_create"?(typeof s.template[g]=="function"?(l.create.append(`if (${J(n.length)})`),l.create.append("  debugger;"),n.push(s.template[g])):s.template[g]&&l.create.append("debugger;"),!0):g=="debug_update"?(typeof s.template[g]=="function"?(l.update.append(`if (${J(n.length)})`),l.update.append("  debugger;"),n.push(s.template[g])):s.template[g]&&l.update.append("debugger;"),!0):g=="debug_render"}function qt(s){return s=="type"||s=="childNodes"||s=="xmlns"}function J(s){return`refs[${s}].call(model, model, context)`}function W(s,g){if(s instanceof Function){let L=`p${i++}`;l.addLocal(L),g(),A(),l.update.append(`temp = ${J(n.length)};`),l.update.append(`if (temp !== ${L})`),l.update.append(`  ${g(L+" = temp")};`),n.push(s)}else l.create.append(g(JSON.stringify(s)))}function zt(s){if((s.isComponent||s.isIntegrated)&&l.destroy.append(`${s.name}.destroy();`),s.listenerCount)for(let g=0;g<s.listenerCount;g++)l.destroy.append(`${s.name}_ev${g+1}?.();`),l.destroy.append(`${s.name}_ev${g+1} = null;`);s.kind=="html"&&s.nodes.length==0||l.destroy.append(`${s.name} = null;`)}}}let Yt=1;function vt(r,e){e=e??{},e.compileTemplate=vt;let t=Gt(r,e),i=new Function("env","refs","helpers","context",t.code),n=function(o){return o||(o={}),o.$instanceId=Yt++,i(b,t.refs,ut,o??{})};return n.isSingleRoot=t.isSingleRoot,n}let b=null;var ee;class Xt extends EventTarget{constructor(){super();$(this,ee,0);this.browser=!1}enterLoading(){ye(this,ee)._++,a(this,ee)==1&&this.dispatchEvent(new Event("loading"))}leaveLoading(){ye(this,ee)._--,a(this,ee)==0&&this.dispatchEvent(new Event("loaded"))}get loading(){return a(this,ee)!=0}async load(t){this.enterLoading();try{return await t()}finally{this.leaveLoading()}}}ee=new WeakMap;class Qt extends Xt{constructor(){super(),this.browser=!0,this.document=document,this.compileTemplate=vt,this.window=window,this.requestAnimationFrame=window.requestAnimationFrame.bind(window),this.Node=Node}}function Kt(r){b=r}typeof document<"u"&&Kt(new Qt);let dt=[],Be=[],Ce=null;class H{static declare(e){dt.push(e),Be.push(e),b.browser&&b.requestAnimationFrame(ei)}static get all(){return dt.join(`
`)}}function ei(){Be.length!=0&&(Ce==null&&(Ce=document.createElement("style")),Ce.innerHTML+=Be.join(`
`),Be=[],Ce.parentNode||document.head.appendChild(Ce))}let Ie=[],Ve=!1;function wt(r,e){r&&(e=e??0,e!=0&&(Ve=!0),Ie.push({callback:r,order:e}),Ie.length==1&&b.requestAnimationFrame(function(){let t=Ie;Ve&&(t.sort((i,n)=>n.order-i.order),Ve=!1),Ie=[];for(let i=t.length-1;i>=0;i--)t[i].callback()}))}class ti{static compile(){return b.compileTemplate(...arguments)}}var R,te;const G=class G extends EventTarget{constructor(){super();$(this,R);$(this,te,0);this.update=this.update.bind(this),this.invalidate=this.invalidate.bind(this)}static get compiledTemplate(){return this._compiledTemplate||(this._compiledTemplate=this.compileTemplate()),this._compiledTemplate}static compileTemplate(){return ti.compile(this.template)}static get isSingleRoot(){return this.compiledTemplate.isSingleRoot}init(){a(this,R)||f(this,R,new this.constructor.compiledTemplate({model:this}))}get dom(){return a(this,R)||this.init(),a(this,R)}get isSingleRoot(){return this.dom.isSingleRoot}get rootNode(){if(!this.isSingleRoot)throw new Error("rootNode property can't be used on multi-root template");return this.dom.rootNode}get rootNodes(){return this.dom.rootNodes}invalidate(){a(this,R)&&(this.invalid||(this.invalid=!0,G.invalidate(this)))}validate(){this.invalid&&this.update()}static invalidate(t){this._invalidComponents.push(t),this._invalidComponents.length==1&&wt(()=>{for(let i=0;i<this._invalidComponents.length;i++)this._invalidComponents[i].validate();this._invalidComponents=[]},G.nextFrameOrder)}update(){a(this,R)&&(this.invalid=!1,this.dom.update())}async load(t){ye(this,te)._++,a(this,te)==1&&(this.invalidate(),b.enterLoading(),this.dispatchEvent(new Event("loading")));try{return await t()}finally{ye(this,te)._--,a(this,te)==0&&(this.invalidate(),this.dispatchEvent(new Event("loaded")),b.leaveLoading())}}get loading(){return a(this,te)!=0}set loading(t){throw new Error("setting Component.loading not supported, use load() function")}render(t){this.dom.render(t)}destroy(){a(this,R)&&(a(this,R).destroy(),f(this,R,null))}mount(t){return typeof t=="string"&&(t=document.querySelector(t)),t.append(...this.rootNodes),this}unmount(){a(this,R)&&this.rootNodes.forEach(t=>t.remove())}};R=new WeakMap,te=new WeakMap,C(G,"_compiledTemplate"),C(G,"nextFrameOrder",-100),C(G,"_invalidComponents",[]),C(G,"template",{});let k=G;class bt{static embed(e){return{type:"embed-slot",content:e}}static h(e,t){return{type:`h${e}`,text:t}}static p(e){return{type:"p",text:e}}static a(e,t){return{type:"a",attr_href:e,text:t}}static raw(e){return new j(e)}}function ii(r){let e="^",t=r.length,i;for(let o=0;o<t;o++){i=!0;let d=r[o];if(d=="?")e+="[^\\/]";else if(d=="*")e+="[^\\/]+";else if(d==":"){o++;let h=o;for(;o<t&&n(r[o]);)o++;let m=r.substring(h,o);if(m.length==0)throw new Error("syntax error in url pattern: expected id after ':'");let y="[^\\/]+";if(r[o]=="("){o++,h=o;let p=0;for(;o<t;){if(r[o]=="(")p++;else if(r[o]==")"){if(p==0)break;p--}o++}if(o>=t)throw new Error("syntax error in url pattern: expected ')'");y=r.substring(h,o),o++}if(o<t&&r[o]=="*"||r[o]=="+"){let p=r[o];o++,r[o]=="/"?(e+=`(?<${m}>(?:${y}\\/)${p})`,o++):p=="*"?e+=`(?<${m}>(?:${y}\\/)*(?:${y})?\\/?)`:e+=`(?<${m}>(?:${y}\\/)*(?:${y})\\/?)`,i=!1}else e+=`(?<${m}>${y})`;o--}else d=="/"?(e+="\\"+d,o==r.length-1&&(e+="?")):".$^{}[]()|*+?\\/".indexOf(d)>=0?(e+="\\"+d,i=d!="/"):e+=d}return i&&(e+="\\/?"),e+="$",e;function n(o){return o>="a"&&o<="z"||o>="A"&&o<="Z"||o>="0"&&o<="9"||o=="_"||o=="$"}}class ht{constructor(e,t){this.el=e,this.targetClass=t,this.entered=!1,this.pendingTransitions=[],this.detecting=!1,this.transitioning=!1,this.el.addEventListener("transitionend",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitioncancel",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitionrun",this.onTransitionRun.bind(this))}onTransitionEndOrCancel(e){let t=!1;for(let i=0;i<this.pendingTransitions.length;i++){let n=this.pendingTransitions[i];n.target==e.target&&n.propertyName==e.propertyName&&(this.pendingTransitions.splice(i,1),t=!0)}t&&this.pendingTransitions.length==0&&this.onTransitionsFinished()}onTransitionRun(e){this.detecting&&this.pendingTransitions.push({target:e.target,propertyName:e.propertyName})}detectTransitions(){this.transitioning=!0,this.detecting=!0,this.pendingTransitions=[],requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{this.detecting=!1,this.pendingTransitions.length==0&&this.onTransitionsFinished()})))}onTransitionsFinished(){this.el.classList.remove(`${this.targetClass}-start-enter`),this.el.classList.remove(`${this.targetClass}-start-leave`),this.el.classList.remove(`${this.targetClass}-enter`),this.el.classList.remove(`${this.targetClass}-leave`),this.entered?this.el.classList.add(this.targetClass):this.el.classList.remove(this.targetClass),this.transitioning=!1}enter(e){if(e){(this.transitioning||!this.entered)&&(this.entered=!0,this.onTransitionsFinished());return}this.entered||(this.entered=!0,this.detectTransitions(),this.el.classList.add(this.targetClass,`${this.targetClass}-enter`,`${this.targetClass}-start-enter`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-enter`)})))}leave(e){if(e){(this.transitioning||this.entered)&&(this.entered=!1,this.onTransitionsFinished());return}this.entered&&(this.entered=!1,this.detectTransitions(),this.el.classList.add(`${this.targetClass}-leave`,`${this.targetClass}-start-leave`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-leave`)})))}toggle(e){this.entered?this.leave():this.enter()}}class ct{static get(){return{top:window.pageYOffset||document.documentElement.scrollTop,left:window.pageXOffset||document.documentElement.scrollLeft}}static set(e){e?window.scrollTo(e.left,e.top):window.scrollTo(0,0)}}var Te,I,O,pe,$e,xe;class ni{constructor(e,t){$(this,Te);C(this,"urlMapper");$(this,I,null);$(this,O,null);$(this,pe,[]);$(this,$e,[]);$(this,xe,!1);f(this,Te,e),e&&(this.navigate=e.navigate.bind(e),this.replace=e.navigate.bind(e),this.back=e.back.bind(e)),t&&this.register(t)}start(){return a(this,Te).start(this)}internalize(e){var t;return((t=this.urlMapper)==null?void 0:t.internalize(e))??new URL(e)}externalize(e){var t;return((t=this.urlMapper)==null?void 0:t.externalize(e))??new URL(e)}get current(){return a(this,I)}get pending(){return a(this,O)}addEventListener(e,t){a(this,pe).push({event:e,handler:t})}removeEventListener(e,t){let i=a(this,pe).findIndex(n=>n.event==e&&n.handler==t);i>=0&&a(this,pe).splice(i,1)}async dispatchEvent(e,t,i,n){for(let o of a(this,pe))if(o.event==e){let d=o.handler(i,n);if(t&&await Promise.resolve(d)==!1)return!1}return!0}async load(e,t,i){var o,d,h;let n=a(this,I);if(((o=a(this,I))==null?void 0:o.url.pathname)==e.pathname&&a(this,I).url.search==e.search){let m=(h=(d=a(this,I).handler).hashChange)==null?void 0:h.call(d,a(this,I),i);m!==void 0?i=m:i=Object.assign({},a(this,I),i)}if(i=Object.assign(i,{current:!1,url:e,pathname:e.pathname,state:t}),f(this,O,i),!i.match&&(i=await this.matchUrl(e,t,i),!i))return null;try{await this.tryLoad(i)!==!0&&f(this,O,null)}catch(m){throw this.dispatchCancelEvents(n,i),m}return a(this,O)!=i?(this.dispatchCancelEvents(n,i),null):(f(this,O,null),i)}dispatchCancelEvents(e,t){var i,n,o,d,h;(o=(i=a(this,I))==null?void 0:(n=i.handler).cancelLeave)==null||o.call(n,e,t),(h=(d=t.handler).cancelEnter)==null||h.call(d,e,t),this.dispatchEvent("cancel",!1,e,t)}async tryLoad(e){var n,o,d,h,m,y,p,c;let t=a(this,I),i;if(!(t&&(!await this.dispatchEvent("mayLeave",!0,t,e)||e!=a(this,O)||(i=(o=(n=t.handler).mayLeave)==null?void 0:o.call(n,t,e),await Promise.resolve(i)===!1)||e!=a(this,O)))&&(i=(h=(d=e.handler).mayEnter)==null?void 0:h.call(d,t,e),await Promise.resolve(i)!==!1&&e==a(this,O)&&await this.dispatchEvent("mayEnter",!0,t,e)&&e==a(this,O)))return t&&(t.current=!1),e.current=!0,f(this,I,e),t&&(this.dispatchEvent("didLeave",!1,t,e),(y=t==null?void 0:(m=t.handler).didLeave)==null||y.call(m,t,e)),(c=(p=e.handler).didEnter)==null||c.call(p,t,e),this.dispatchEvent("didEnter",!1,t,e),!0}async matchUrl(e,t,i){a(this,xe)&&(a(this,$e).sort((n,o)=>(n.order??0)-(o.order??0)),f(this,xe,!1));for(let n of a(this,$e)){if(n.pattern&&(i.match=i.pathname.match(n.pattern),!i.match))continue;let o=await Promise.resolve(n.match(i));if(o===!0||o==i)return i.handler=n,i;if(o===null)return null}return i.handler={},i}register(e){Array.isArray(e)||(e=[e]);for(let t of e)typeof t.pattern=="string"&&(t.pattern=new RegExp(ii(t.pattern))),a(this,$e).push(t);f(this,xe,!0)}}Te=new WeakMap,I=new WeakMap,O=new WeakMap,pe=new WeakMap,$e=new WeakMap,xe=new WeakMap;var Ne,M,_e;class si{constructor(){$(this,Ne,0);$(this,M);$(this,_e,!1)}async start(e){f(this,M,e),b.document.body.addEventListener("click",o=>{let d=o.target.closest("a");if(d){let h=d.getAttribute("href"),m=new URL(h,b.window.location);if(m.origin==b.window.location.origin){try{m=a(this,M).internalize(m)}catch{return}if(this.navigate(m))return o.preventDefault(),!0}}}),b.window.addEventListener("popstate",async o=>{if(a(this,_e)){f(this,_e,!1);return}let d=a(this,Ne)+1,h=a(this,M).internalize(b.window.location),m=o.state??{sequence:this.current.state.sequence+1};await this.load(h,m,{navMode:"pop"})||d==a(this,Ne)&&(f(this,_e,!0),b.window.history.go(this.current.state.sequence-m.sequence))});let t=a(this,M).internalize(b.window.location),i=b.window.history.state??{sequence:0},n=await this.load(t,i,{navMode:"start"});return b.window.history.replaceState(i,null),n}get current(){return a(this,M).current}async load(e,t,i){return ye(this,Ne)._++,await a(this,M).load(e,t,i)}back(){this.current.state.sequence==0?(this.replace("/"),this.load("/",{sequence:0},{navMode:"replace"})):b.window.history.back()}replace(e){typeof e=="string"&&(e=new URL(e,a(this,M).internalize(b.window.location))),this.current.pathname=e.pathname,this.current.url=e,b.window.history.replaceState(this.current.state,"",a(this,M).externalize(e))}async navigate(e){typeof e=="string"&&(e=new URL(e,a(this,M).internalize(b.window.location)));let t=await this.load(e,{sequence:this.current.state.sequence+1},{navMode:"push"});return t&&(b.window.history.pushState(t.state,"",a(this,M).externalize(e)),t)}}Ne=new WeakMap,M=new WeakMap,_e=new WeakMap;var U,z;class ri{constructor(e){$(this,U);$(this,z,{});f(this,U,e),b.window.history.scrollRestoration&&(b.window.history.scrollRestoration="manual");let t=b.window.sessionStorage.getItem("codeonly-view-states");t&&f(this,z,JSON.parse(t)),e.addEventListener("mayLeave",(i,n)=>(this.captureViewState(),!0)),e.addEventListener("mayEnter",(i,n)=>{n.viewState=a(this,z)[n.state.sequence]}),e.addEventListener("didEnter",(i,n)=>{if(n.navMode=="push"){for(let o of Object.keys(a(this,z)))parseInt(o)>n.state.sequence&&delete a(this,z)[o];this.saveViewStates()}Jt(b,()=>{wt(()=>{var o,d;if(n.handler.restoreViewState?n.handler.restoreViewState(n.viewState,n):a(this,U).restoreViewState?(d=(o=a(this,U)).restoreViewState)==null||d.call(o,n.viewState,n):ct.set(n.viewState),b.browser){let h=document.getElementById(n.url.hash.substring(1));h==null||h.scrollIntoView()}})})}),b.window.addEventListener("beforeunload",i=>{this.captureViewState()})}captureViewState(){var t,i;let e=a(this,U).current;e&&(e.handler.captureViewState?a(this,z)[e.state.sequence]=e.handler.captureViewState(e):a(this,U).captureViewState?a(this,z)[e.state.sequence]=(i=(t=a(this,U)).captureViewState)==null?void 0:i.call(t,e):a(this,z)[e.state.sequence]=ct.get()),this.saveViewStates()}saveViewStates(){b.window.sessionStorage.setItem("codeonly-view-states",JSON.stringify(a(this,z)))}}U=new WeakMap,z=new WeakMap;class $t extends k{}C($t,"template",{_:"header",id:"header",$:[{_:"a",class:"title",attr_href:"/",$:[{type:"img",attr_src:"/content/codeonly-logo.svg"},"CodeOnly"]},{_:"div",class:"buttons",$:[{type:"a",class:"subtle button",attr_href:"/sandbox",text:"Sandbox"},{type:"a",class:"subtle button",attr_href:"/guide/",text:"Guide"}]}]});H.declare(`
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
        display: flex;
        align-items: center;
        color: var(--body-fore-color);
        transition: opacity 0.2s;

        &:hover
        {
            opacity: 75%;
        }

        img
        {
            height: calc(var(--header-height) - 25px);
            padding-right: 10px
        }
    }


    .buttons
    {
        font-size: 12pt;
        display: flex;
        gap: 10px;
    }
}
`);let fe=new ni(new si);new ri(fe);class oi{constructor(e){this.pathname=e}load(){return b.load(async()=>{let e=this.pathname;(e==""||e.endsWith("/"))&&(e+="index");const t=await fetch(`/content/${e}.page`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.processMarkdown(await t.text())})}processMarkdown(e){this.frontmatter={},e=e.replace(/\r\n/g,`
`),this.markdown=e.replace(/^---([\s\S]*?)---\n/,(p,c)=>{for(let v of c.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))try{this.frontmatter[v[1]]=JSON.parse(v[2])}catch{this.frontmatter[v[1]]=v[2]}return""});let t=new commonmark.Parser;this.ast=t.parse(this.markdown);let i=this.ast.walker(),n,o=null,d="";this.headings=[];let h=[];for(;n=i.next();){if(n.entering&&n.node.type==="heading"&&n.node.level==2&&(o=n.node),o!=null&&n.node.type==="text"&&(d+=n.node.literal),!n.entering&&n.node==o){let p=ai(d);p.length>0&&(this.headings.push({node:n.node,text:d,id:p}),o=!1),d="",o=null}n.entering&&n.node.type=="code_block"&&h.push(n.node)}for(let p of this.headings){let c=new commonmark.Node("html_inline",p.node.sourcepos);c.literal=`<a class="hlink" href="#${p.id}">#</a>`,p.node.prependChild(c)}for(let p of h){let c=hljs.highlight(p.literal,{language:p.info,ignoreIllegals:!0}),v=`<pre><code class="hljs language-${c.language}">${c.value}</code></pre>`,l=new commonmark.Node("html_block",p.sourcepos);l.literal=v,p.insertBefore(l),p.unlink()}let m=new commonmark.HtmlRenderer,y=m.attrs;m.attrs=p=>{let c=y.call(m,...arguments);if(p.type=="heading"&&p.level==2){let v=this.headings.find(l=>l.node==p);v&&c.push(["id",v.id])}return c},this.html=m.render(this.ast)}}function ai(r){return r=r.toLowerCase(),r=r.replace(/[^\p{L}\p{N}]+/gu,"-"),r=r.replace(/-+/,"-"),r=r.replace(/^-|-$/g,""),r}class xt extends k{}C(xt,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});H.declare(`
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
`);var Se;class Nt extends k{constructor(){super();$(this,Se)}set url(t){let i=new URL("toc",t).pathname;i!=a(this,Se)&&(f(this,Se,i),this.load())}load(){super.load(async()=>{this.error=!1;try{const t=await fetch(`/content${a(this,Se)}`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.toc=await t.json()}catch(t){this.error=!0,console.error(t.message)}})}}Se=new WeakMap,C(Nt,"template",{_:"nav",id:"nav-main",$:[{foreach:t=>t.toc,$:[{type:"h5",text:t=>t.title},{type:"ul",$:{foreach:t=>t.pages,type:"li",$:{type:"a",attr_href:t=>t.url,text:t=>t.title}}}]}]});H.declare(`
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
`);var ke;class li extends EventTarget{constructor(){super(...arguments);$(this,ke,null)}get document(){return a(this,ke)}set document(t){f(this,ke,t),this.dispatchEvent(new Event("documentChanged"))}}ke=new WeakMap;new li;var De;class _t extends k{constructor(){super();$(this,De)}get inPageLinks(){return a(this,De)}set inPageLinks(t){f(this,De,t),this.invalidate()}hidePopupNav(){this.dispatchEvent(new Event("hidePopupNav"))}}De=new WeakMap,C(_t,"template",{type:"nav",id:"secondary-nav",on_click:t=>t.hidePopupNav(),$:[{if:t=>{var i;return((i=t.inPageLinks)==null?void 0:i.length)>0},$:bt.h(6,"On This Page")},{type:"ul",$:{foreach:t=>t.inPageLinks,type:"li",$:{type:"a",attr_href:t=>`#${t.id}`,text:t=>t.text}}}]});H.declare(`
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

`);class St extends k{constructor(){super(),this.init(),this.showSidePanelTransition=new ht(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new ht(this.rootNode,"show-secondary-panel"),fe.addEventListener("mayLeave",()=>this.hidePanel())}loadRoute(e){this.url=e.url,this.page=e.page,this.invalidate()}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}C(St,"template",{type:"div",id:"layoutDocumentation",$:[{type:xt,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:{type:Nt,url:e=>e.url}},{type:"div",id:"div-center",$:{type:"embed-slot",content:e=>e.page}},{type:"div",id:"div-rhs",$:{type:_t,inPageLinks:e=>{var t;return(t=e.page)==null?void 0:t.inPageLinks},on_hidePopupNav:e=>e.hidePanel()}}]}]});const He=720,Ue=250;H.declare(`
:root
{
    --side-panel-width: ${Ue}px;
    --max-content-width: ${He}px;
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


@media screen and (width < ${Ue*2+He+25}px) 
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

@media screen and (width < ${Ue+He+25}px) 
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



`);class Et extends k{constructor(){super()}loadRoute(e){this.page=e.page,this.invalidate()}}C(Et,"template",{type:"div",id:"layoutBare",$:{type:"embed-slot",content:e=>e.page}});H.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);class it extends k{constructor(e){super(),this.url=e}}C(it,"template",{type:"div",class:"center",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:e=>`The page ${e.url} doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]});fe.register({match:r=>(r.page=new it(r.url),!0),order:1e3});class Lt extends k{constructor(e){super(),this.document=e}get inPageLinks(){return this.document.headings}get layout(){var e,t;switch((t=(e=this.document)==null?void 0:e.frontmatter)==null?void 0:t.layout){case"bare":return Et;default:return St}}}C(Lt,"template",{type:"div",class:"article",$:e=>bt.raw(e.document.html)});H.declare(`
.article
{
    padding: 10px 20px;
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

`);fe.register({pattern:"/:pathname*",match:async r=>{try{return r.document=new oi(r.match.groups.pathname),await r.document.load(),r.page=new Lt(r.document),!0}catch{r.page=new it}return!0},order:10});var B,ue;class Ct extends k{constructor(){super();$(this,B);$(this,ue,"");this.init(),require(["vs/editor/editor.main"],()=>{f(this,B,monaco.editor.create(this.editorContainer,{value:a(this,ue),language:"javascript",theme:"vs-dark"})),f(this,ue,null),a(this,B).getModel().onDidChangeContent(i=>{this.dispatchEvent(new Event("input"))}),this.resizeEditor()}),new ResizeObserver(()=>{this.resizeEditor()}).observe(this.editorContainer)}resizeEditor(){a(this,B)&&a(this,B).layout()}get editor(){return a(this,B)}get value(){return a(this,B)?a(this,B).getValue():a(this,ue)}set value(t){a(this,B)?a(this,B).setValue(t):f(this,ue,t)}}B=new WeakMap,ue=new WeakMap,C(Ct,"template",{type:"div",class:"editorContainer",style:"width: 100%; height: 100%;",bind:"editorContainer"});let Z=`<html>
<head>
    <link href="./stylish.css" type="text/css" rel="stylesheet" />
<script type="importmap">
##importmap##
<\/script>
##stylesheets##
<script>
window.addEventListener("error", (ev) => {
    parent.postMessage({action: "error", error: { message: ev.message, lineno: ev.lineno - ##patchlinecount##, colno: ev.colno } });
})
<\/script>
</head>
<body>
<script type="module">
import { Component, Style } from "@toptensoftware/codeonly";
`,di=`
<\/script>
</body>
</html>
`,pt=!1;function hi(){if(pt)return;pt=!0;let r=document.querySelector("script[type=importmap");Z=Z.replace("##importmap##",r.textContent);let e=Array.from(document.querySelectorAll("link[rel=stylesheet]")).map(t=>`<link href="${t.getAttribute("href")}" type="${t.getAttribute("type")}" rel="stylesheet">`).join(`
`);Z=Z.replace("##stylesheets##",e),Z=Z.replace("##patchlinecount##",(Z.split(`
`).length-1).toString())}class Tt extends k{constructor(e){hi(),super(),this.script=e}get srcdoc(){return`${Z}${this.script}
        new Main().mount("body");
        ${di}
        `}}C(Tt,"template",{_:"iframe",attr_srcdoc:e=>e.srcdoc});var Pe;class kt extends k{constructor(){super();$(this,Pe,"")}set script(t){f(this,Pe,t),this.invalidate()}createIframe(){return new Tt(a(this,Pe))}}Pe=new WeakMap,C(kt,"template",{_:"div",id:"preview",$:{_:"embed-slot",content:t=>t.createIframe()}});H.declare(`
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
`);let ci=`class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;var Ee,Fe,Le;class Dt extends k{constructor(){super();$(this,Ee,!1);$(this,Fe,null);$(this,Le,null);this.init(),this.editor.value=ci,this.preview.script=this.editor.value,this.onIFrameMessage=this.onIFrameMessage.bind(this),window.addEventListener("message",this.onIFrameMessage)}destroy(){window.removeEventListener("message",this.onIFrameMessage)}onIFrameMessage(t){t.data.action=="error"&&(this.error=`line: ${t.data.error.lineno} col: ${t.data.error.colno}: ${t.data.error.message}`)}get error(){return a(this,Fe)}set error(t){f(this,Fe,t),this.invalidate()}onCodeChange(){this.error=null,!a(this,Ee)&&(a(this,Le)!=null&&clearTimeout(a(this,Le)),f(this,Le,setTimeout(()=>{f(this,Ee,!0),this.preview.script=this.editor.value,f(this,Ee,!1)},500)))}}Ee=new WeakMap,Fe=new WeakMap,Le=new WeakMap,C(Dt,"template",{type:"div",class:"sandbox",$:[{type:"div",style:"width: 50%; height: 100%; position: relative",$:[{type:Ct,bind:"editor",on_input:t=>t.onCodeChange()},{_:"div",class:"error",display:t=>!!t.error,text:t=>t.error}]},{type:kt,bind:"preview"}]});H.declare(`
.sandbox
{
    display: flex;
    align-items: stretch;
    height: calc(100% - var(--header-height));

    .error
    {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 2rem;
        padding: 0.5rem;
        background-color: rgb(from var(--danger-color) r g b / 10%);
        border: 1px solid var(--danger-color);
        border-radius: .3rem;
        z-index: 100;
    }
}
`);fe.register({pattern:"/sandbox",match:r=>(r.page=new Dt,!0)});var ie;class Pt extends k{constructor(){super();$(this,ie,null);fe.addEventListener("didEnter",(t,i)=>{var n;i.page&&(i.page.layout?(i.page.layout!=((n=a(this,ie))==null?void 0:n.constructor)&&(f(this,ie,new i.page.layout),this.layoutSlot.content=a(this,ie)),a(this,ie).loadRoute(i)):(this.layoutSlot.content=i.page,f(this,ie,null)))})}}ie=new WeakMap,C(Pt,"template",{type:"div",id:"layoutRoot",$:[$t,{type:"embed-slot",bind:"layoutSlot"}]});H.declare(`
#layoutRoot
{
    padding-top: var(--fixed-header-height);
}
`);function pi(){new Pt().mount("body"),fe.start()}pi();
