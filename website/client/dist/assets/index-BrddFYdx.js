var _t=Object.defineProperty;var We=r=>{throw TypeError(r)};var Tt=(r,e,t)=>e in r?_t(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var k=(r,e,t)=>Tt(r,typeof e!="symbol"?e+"":e,t),Ce=(r,e,t)=>e.has(r)||We("Cannot "+t);var a=(r,e,t)=>(Ce(r,e,"read from private field"),t?t.call(r):e.get(r)),N=(r,e,t)=>e.has(r)?We("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),b=(r,e,t,i)=>(Ce(r,e,"write to private field"),i?i.call(r,t):e.set(r,t),t),_=(r,e,t)=>(Ce(r,e,"access private method"),t);var me=(r,e,t,i)=>({set _(n){b(r,e,n,t)},get _(){return a(r,e,i)}});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();function Le(r){return r.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}function Fe(r){return r instanceof Function&&!!r.prototype&&!!r.prototype.constructor}let Et=/^[a-zA-Z$][a-zA-Z0-9_$]*$/;function K(r){return r.match(Et)?`.${r}`:`[${JSON.stringify(r)}]`}function Ct(r,e){r.loading?r.addEventListener("loaded",e,{once:!0}):e()}class I{constructor(e){this.html=e}}class Lt{constructor(e){this.value=e}}function $e(){let r=[],e="";function t(...g){for(let p=0;p<g.length;p++){let h=g[p];h.lines?r.push(...h.lines.map(y=>e+y)):Array.isArray(h)?r.push(...h.filter(y=>y!=null).map(y=>e+y)):r.push(...h.split(`
`).map(y=>e+y))}}function i(){e+="  "}function n(){e=e.substring(2)}function o(){return r.join(`
`)+`
`}function d(g){t("{"),i(),g(this),n(),t("}")}function c(...g){let p={pos:this.lines.length};return this.append(g),p.headerLineCount=this.lines.length-p.pos,p}function m(g,...p){this.lines.length==g.pos+g.headerLineCount?this.lines.splice(g.pos,g.headerLineCount):this.append(p)}return{append:t,enterCollapsibleBlock:c,leaveCollapsibleBlock:m,indent:i,unindent:n,braced:d,toString:o,lines:r,get isEmpty(){return r.length==0}}}class He{constructor(){this.code=$e(),this.code.closure=this,this.functions=[],this.locals=[],this.prologs=[],this.epilogs=[]}get isEmpty(){return this.code.isEmpty&&this.locals.length==0&&this.functions.every(e=>e.code.isEmpty)&&this.prologs.every(e=>e.isEmpty)&&this.epilogs.every(e=>e.isEmpty)}addProlog(){let e=$e();return this.prologs.push(e),e}addEpilog(){let e=$e();return this.epilogs.push(e),e}addLocal(e,t){this.locals.push({name:e,init:t})}addFunction(e,t){t||(t=[]);let i={name:e,args:t,code:new He};return this.functions.push(i),i.code}getFunction(e){var t;return(t=this.functions.find(i=>i.name==e))==null?void 0:t.code}toString(){let e=$e();return this.appendTo(e),e.toString()}appendTo(e){this.locals.length>0&&e.append(`let ${this.locals.map(t=>t.init?`${t.name} = ${t.init}`:t.name).join(", ")};`);for(let t of this.prologs)e.append(t);e.append(this.code);for(let t of this.functions)e.append(`function ${t.name}(${t.args.join(", ")})`),e.append("{"),e.indent(),t.code.appendTo(e),e.unindent(),e.append("}");for(let t of this.epilogs)e.append(t)}}function Ne(r){return r==null?"":(""+r).replace(/["'&<>]/g,function(e){switch(e){case'"':return"&quot;";case"&":return"&amp;";case"'":return"&#39;";case"<":return"&lt;";case">":return"&gt;"}})}class Ke{static rawText(e){return e instanceof I?e.html:Ne(e)}static renderToString(e){let t="";return e({write:function(i){t+=i}}),t}static renderComponentToString(e){let t="";return e.render({write:function(i){t+=i}}),t}static rawStyle(e){let t;return e instanceof I?t=e.html:t=Ne(e),t=t.trim(),t.endsWith(";")||(t+=";"),t}static rawNamedStyle(e,t){if(!t)return"";let i;return t instanceof I?i=t.html:i=Ne(t),i=i.trim(),i+=";",`${e}:${i}`}static createTextNode(e){if(e instanceof I){let t=document.createElement("SPAN");return t.innerHTML=e.html,t}else return document.createTextNode(e)}static setElementText(e,t){t instanceof I?e.innerHTML=t.html:e.innerText=t}static setNodeText(e,t){if(t instanceof I){if(e.nodeType==1)return e.innerHTML=t.html,e;let i=document.createElement("SPAN");return i.innerHTML=t.html,e.replaceWith(i),i}else{if(e.nodeType==3)return e.nodeValue=t,e;let i=document.createTextNode(t);return e.replaceWith(i),i}}static setNodeClass(e,t,i){i?e.classList.add(t):e.classList.remove(t)}static setNodeStyle(e,t,i){i==null?e.style.removeProperty(t):e.style[t]=i}static setNodeDisplay(e,t,i){if(t===!0){i===null?e.style.removeProperty("display"):i!==void 0&&e.style.display!=i&&(e.style.display=i);return}else if(t===!1||t===null||t===void 0){let n=e.style.display;return e.style.display!="none"&&(e.style.display="none"),n??null}else if(typeof t=="string"){let n=e.style.display;return e.style.display!=t&&(e.style.display=t),n??null}}static replaceMany(e,t){var i;if((i=e==null?void 0:e[0])!=null&&i.parentNode){e[0].replaceWith(...t);for(let n=1;n<e.length;n++)e[n].remove()}}static addEventListener(e,t,i,n){function o(d){return n(e(),d)}return t.addEventListener(i,o),function(){t.removeEventListener(i,o)}}}function Ze(r){let e=function(){var i;let t=(i=C.document)==null?void 0:i.createComment(r);return{get rootNode(){return t},get rootNodes(){return[t]},get isSingleRoot(){return!0},destroy(){},update(){},render(n){n.write(`<!--${Ne(r)}-->`)}}};return e.isSingleRoot=!0,e}class Te{static integrate(e,t){let i=[],n=[],o=!1,d=!0;for(let c=0;c<e.branches.length;c++){let m=e.branches[c],g={};if(i.push(g),m.condition instanceof Function?(g.condition=m.condition,o=!1):m.condition!==void 0?(g.condition=()=>m.condition,o=!!m.condition):(g.condition=()=>!0,o=!0),m.template!==void 0){let p=new Y(m.template,t);p.isSingleRoot||(d=!1),g.nodeIndex=n.length,n.push(p)}}return delete e.branches,o||i.push({condition:()=>!0}),{isSingleRoot:d,wantsUpdate:!0,nodes:n,data:i}}static transform(e){if(e.if===void 0)return e;let t={type:Te,branches:[{template:e,condition:e.if}]};return delete e.if,t}static transformGroup(e){let t=null;for(let i=0;i<e.length;i++){let n=e[i];if(n.if)t={type:Te,branches:[{condition:n.if,template:n}]},delete n.if,e.splice(i,1,t);else if(n.elseif){if(!t)throw new Error("template has 'elseif' without a preceeding condition");t.branches.push({condition:n.elseif,template:n}),delete n.elseif,e.splice(i,1),i--}else if(n.else!==void 0){if(!t)throw new Error("template has 'else' without a preceeding condition");t.branches.push({condition:!0,template:n}),delete n.else,t=null,e.splice(i,1),i--}else t=null}}constructor(e){this.branches=e.data,this.branch_constructors=[],this.context=e.context;for(let t of this.branches)t.nodeIndex!==void 0?this.branch_constructors.push(e.nodes[t.nodeIndex]):this.branch_constructors.push(Ze(" IfBlock placeholder "));this.activeBranchIndex=-1,this.activeBranch=Ze(" IfBlock placeholder ")()}destroy(){this.activeBranch.destroy()}update(){this.switchActiveBranch(),this.activeBranch.update()}render(e){this.activeBranch.render(e)}unbind(){var e,t;(t=(e=this.activeBranch).unbind)==null||t.call(e)}bind(){var e,t;(t=(e=this.activeBranch).bind)==null||t.call(e)}switchActiveBranch(e){let t=this.resolveActiveBranch();if(t!=this.activeBranchIndex){let i=this.activeBranch;this.activeBranchIndex=t,this.activeBranch=this.branch_constructors[t](),Ke.replaceMany(i.rootNodes,this.activeBranch.rootNodes),i.destroy()}}resolveActiveBranch(){for(let e=0;e<this.branches.length;e++)if(this.branches[e].condition.call(this.context.model,this.context.model,this.context))return e;throw new Error("internal error, IfBlock didn't resolve to a branch")}get rootNodes(){return this.activeBranch.rootNodes}get rootNode(){return this.activeBranch.rootNode}}function kt(r,e){let t=Math.min(r.length,e.length),i=Math.max(r.length,e.length),n=0;for(;n<t&&r[n]==e[n];)n++;if(n==i)return[];if(n==r.length)return[{op:"insert",index:r.length,count:e.length-r.length}];let o=0;for(;o<t-n&&r[r.length-o-1]==e[e.length-o-1];)o++;if(o==r.length)return[{op:"insert",index:0,count:e.length-r.length}];if(n+o==r.length)return[{op:"insert",index:n,count:e.length-r.length}];if(n+o==e.length)return[{op:"delete",index:n,count:r.length-e.length}];let d=r.length-o,c=e.length-o,m=Q(e,n,c),g=null,p=[],h=n,y=n;for(;h<c;){for(;h<c&&r[y]==e[h];)m.delete(e[h],h),h++,y++;let u=h,x=y;for(;y<d&&!m.has(r[y]);)y++;if(y>x){p.push({op:"delete",index:u,count:y-x});continue}for(g||(g=Q(r,h,d));h<c&&!g.has(e[h]);)m.delete(e[h],h),h++;if(h>u){p.push({op:"insert",index:u,count:h-u});continue}break}if(h==c)return p;let l=0,P=new Ge;for(;y<d;){let u=y;for(;y<d&&!m.has(r[y]);)y++;if(y>u){p.push({op:"delete",index:h,count:y-u});continue}for(;y<d&&m.consume(r[y])!==void 0;)P.add(r[y],l++),y++;y>u&&p.push({op:"store",index:h,count:y-u})}for(;h<c;){let u=h;for(;h<c&&!P.has(e[h]);)h++;if(h>u){p.push({op:"insert",index:u,count:h-u});continue}let x={op:"restore",index:h,count:0};for(p.push(x);h<c;){let O=P.consume(e[h]);if(O===void 0)break;x.count==0?(x.storeIndex=O,x.count=1):x.storeIndex+x.count==O?x.count++:(x={op:"restore",index:h,storeIndex:O,count:1},p.push(x)),h++}}return p;function Q(u,x,O){let ae=new Ge;for(let le=x;le<O;le++)ae.add(u[le],le);return ae}}var V;class Ge{constructor(){N(this,V,new Map)}add(e,t){let i=a(this,V).get(e);i?i.push(t):a(this,V).set(e,[t])}delete(e,t){let i=a(this,V).get(e);if(i){let n=i.indexOf(t);if(n>=0){i.splice(n,1);return}}throw new Error("key/value pair not found")}consume(e){let t=a(this,V).get(e);if(!(!t||t.length==0))return t.shift()}has(e){return a(this,V).has(e)}}V=new WeakMap;var w,Oe,Se,J,te,ie,ne,et,Be,tt,Ie,it,Me,nt,Ae,ee;const de=class de{constructor(e){N(this,w);N(this,J);N(this,te);N(this,ie);N(this,ne);var t,i;this.itemConstructor=e.data.itemConstructor,this.outer=e.context,this.items=e.data.template.items,this.condition=e.data.template.condition,this.itemKey=e.data.template.itemKey,this.emptyConstructor=e.nodes.length?e.nodes[0]:null,this.itemDoms=[],this.headSentinal=(t=C.document)==null?void 0:t.createComment(" enter foreach block "),this.tailSentinal=(i=C.document)==null?void 0:i.createComment(" leave foreach block "),this.itemConstructor.isSingleRoot?(b(this,J,_(this,w,it)),b(this,ie,_(this,w,nt)),b(this,te,_(this,w,Me)),b(this,ne,_(this,w,Ae))):(b(this,J,_(this,w,et)),b(this,ie,_(this,w,tt)),b(this,te,_(this,w,Be)),b(this,ne,_(this,w,Ie)))}static integrate(e,t){let i={itemConstructor:t.compileTemplate(e.template),template:{items:e.items,condition:e.condition,itemKey:e.itemKey}},n;return e.empty&&(n=[new Y(e.empty,t)]),delete e.template,delete e.items,delete e.condition,delete e.itemKey,delete e.empty,{isSingleRoot:!1,wantsUpdate:!0,data:i,nodes:n}}static transform(e){if(e.foreach===void 0)return e;let t;return e.foreach instanceof Function||Array.isArray(e.foreach)?(t={type:de,template:e,items:e.foreach},delete e.foreach):(t=Object.assign({},e.foreach,{type:de,template:e}),delete e.foreach),t}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1].foreach!==void 0&&(e[t-1]=de.transform(e[t-1])),e[t-1].type===de&&!e[t-1].else&&(delete e[t].else,e[t-1].empty=e[t],e.splice(t,1),t--))}onObservableUpdate(e,t,i){let n={outer:this.outer};if(i==0&&t==0){let o=this.observableItems[e],d=[o],c=null;this.itemKey&&(n.model=o,c=[this.itemKey.call(o,o,n)]),_(this,w,ee).call(this,d,c,e,0,1)}else{let o=null,d=this.observableItems.slice(e,e+i);this.itemKey&&(o=d.map(c=>(n.model=c,this.itemKey.call(c,c,n)))),i&&t?_(this,w,Oe).call(this,e,t,d,o):t!=0?a(this,ie).call(this,e,t):i!=0&&a(this,J).call(this,d,o,e,0,i),_(this,w,Se).call(this)}}get rootNodes(){let e=this.emptyDom?this.emptyDom.rootNodes:[];if(this.itemConstructor.isSingleRoot)return[this.headSentinal,...this.itemDoms.map(t=>t.rootNode),...e,this.tailSentinal];{let t=[this.headSentinal];for(let i=0;i<this.itemDoms.length;i++)t.push(...this.itemDoms[i].rootNodes);return t.push(...e),t.push(this.tailSentinal),t}}update(){let e;this.items instanceof Function?e=this.items.call(this.outer.model,this.outer.model,this.outer):e=this.items,e=e??[],this.observableItems!=null&&this.observableItems!=e&&this.observableItems.removeListener(this._onObservableUpdate),Array.isArray(e)&&e.isObservable&&this.observableItems!=e&&(this._onObservableUpdate=this.onObservableUpdate.bind(this),this.observableItems=e,this.observableItems.addListener(this._onObservableUpdate),a(this,ie).call(this,0,this.itemDoms.length),this.itemsLoaded=!1);let t={outer:this.outer},i=null;if(this.observableItems||this.condition&&(e=e.filter(n=>(t.model=n,this.condition.call(n,n,t)))),this.itemKey&&(i=e.map(n=>(t.model=n,this.itemKey.call(n,n,t)))),!this.itemsLoaded){this.itemsLoaded=!0,a(this,J).call(this,e,i,0,0,e.length),_(this,w,Se).call(this);return}this.observableItems||_(this,w,Oe).call(this,0,this.itemDoms.length,e,i)}render(e){e.write("<!-- enter foreach block -->");for(let t=0;t<this.itemDoms.length;t++)this.itemDoms[t].render(e);e.write("<!-- leave foreach block -->")}bind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.bind)==null||t.call(e)}unbind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.unbind)==null||t.call(e)}destroy(){this.observableItems!=null&&(this.observableItems.removeListener(this._onObservableUpdate),this.observableItems=null);for(let e=0;e<this.itemDoms.length;e++)this.itemDoms[e].destroy();this.itemDoms=null}get isAttached(){var e;return((e=this.tailSentinal)==null?void 0:e.parentNode)!=null}};w=new WeakSet,Oe=function(e,t,i,n){let o=e+t,d;e==0&&t==this.itemDoms.length?d=this.itemDoms:d=this.itemDoms.slice(e,o);let c;if(n?c=kt(d.map(u=>u.context.key),n):i.length>d.length?c=[{op:"insert",index:d.length,count:i.length-d.length}]:i.length<d.length?c=[{op:"delete",index:i.length,count:d.length-i.length}]:c=[],c.length==0){_(this,w,ee).call(this,i,n,e,0,t);return}let m=[],g=[],p={insert:y,delete:l,store:P,restore:Q},h=0;for(let u of c)u.index>h&&(_(this,w,ee).call(this,i,n,e+h,h,u.index-h),h=u.index),p[u.op].call(this,u);h<i.length&&_(this,w,ee).call(this,i,n,e+h,h,i.length-h);for(let u=g.length-1;u>=0;u--)g[u].destroy();_(this,w,Se).call(this);function y(u){h+=u.count;let x=Math.min(g.length,u.count);x&&(a(this,te).call(this,u.index+e,g.splice(0,x)),_(this,w,ee).call(this,i,n,u.index+e,u.index,x)),x<u.count&&a(this,J).call(this,i,n,u.index+e+x,u.index+x,u.count-x)}function l(u){g.push(...a(this,ne).call(this,u.index+e,u.count))}function P(u){m.push(...a(this,ne).call(this,u.index+e,u.count))}function Q(u){h+=u.count,a(this,te).call(this,u.index+e,m.slice(u.storeIndex,u.storeIndex+u.count)),_(this,w,ee).call(this,i,n,u.index+e,u.index,u.count)}},Se=function(){if(this.itemDoms.length==0)!this.emptyDom&&this.emptyConstructor&&(this.emptyDom=this.emptyConstructor(),this.isAttached&&this.tailSentinal.before(...this.emptyDom.rootNodes)),this.emptyDom&&this.emptyDom.update();else if(this.emptyDom){if(this.isAttached)for(var e of this.emptyDom.rootNodes)e.remove();this.emptyDom.destroy(),this.emptyDom=null}},J=new WeakMap,te=new WeakMap,ie=new WeakMap,ne=new WeakMap,et=function(e,t,i,n,o){let d=[];for(let c=0;c<o;c++){let m={outer:this.outer,model:e[n+c],key:t==null?void 0:t[n+c],index:i+c};d.push(this.itemConstructor(m))}_(this,w,Be).call(this,i,d)},Be=function(e,t){if(this.itemDoms.splice(e,0,...t),this.isAttached){let i=[];t.forEach(o=>i.push(...o.rootNodes));let n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNodes[0]:n=this.tailSentinal,n.before(...i)}},tt=function(e,t){let i=_(this,w,Ie).call(this,e,t);for(let n=i.length-1;n>=0;n--)i[n].destroy()},Ie=function(e,t){let i=this.isAttached;for(let n=0;n<t;n++)if(i){let o=this.itemDoms[e+n].rootNodes;for(let d=0;d<o.length;d++)o[d].remove()}return this.itemDoms.splice(e,t)},it=function(e,t,i,n,o){let d=[];for(let c=0;c<o;c++){let m={outer:this.outer,model:e[n+c],key:t==null?void 0:t[n+c],index:i+c};d.push(this.itemConstructor(m))}_(this,w,Me).call(this,i,d)},Me=function(e,t){if(this.itemDoms.splice(e,0,...t),this.isAttached){let i=t.map(o=>o.rootNode),n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNode:n=this.tailSentinal,n.before(...i)}},nt=function(e,t){let i=_(this,w,Ae).call(this,e,t);for(let n=i.length-1;n>=0;n--)i[n].destroy()},Ae=function(e,t){let i=this.isAttached;for(let n=0;n<t;n++)i&&this.itemDoms[e+n].rootNode.remove();return this.itemDoms.splice(e,t)},ee=function(e,t,i,n,o){for(let d=0;d<o;d++){let c=this.itemDoms[i+d];c.context.key=t==null?void 0:t[n+d],c.context.index=i+d,c.context.model=e[n+d],c.rebind(),c.update()}};let Re=de;var B,A,F,se,D,re,ce,z,W;const he=class he{constructor(e){N(this,B);N(this,A);N(this,F);N(this,se);N(this,D);N(this,re);N(this,ce);N(this,z);N(this,W,!0);var t,i;b(this,B,e.context),b(this,ce,e.nodes[1]),b(this,se,(t=C.document)==null?void 0:t.createTextNode("")),b(this,re,(i=C.document)==null?void 0:i.createTextNode("")),b(this,D,[]),b(this,W,e.data.ownsContent??!0),e.nodes[0]?this.content=e.nodes[0]():this.content=e.data.content}static integrate(e,t){let i=null;e.content&&typeof e.content=="object"&&(i=e.content,delete e.content);let n={isSingleRoot:!1,wantsUpdate:!0,data:{ownsContent:e.ownsContent??!0,content:e.content},nodes:[i?new Y(i,t):null,e.placeholder?new Y(e.placeholder,t):null]};return delete e.content,delete e.placeholder,delete e.ownsContent,n}static transform(e){return e instanceof Function&&!Fe(e)?{type:he,content:e}:(e.type=="embed-slot"&&(e.type=he),e)}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1]=he.transform(e[t-1]),e[t-1].type===he&&!e[t-1].placeholder&&(delete e[t].else,e[t-1].placeholder=e[t],e.splice(t,1),t--))}get rootNodes(){return[a(this,se),...a(this,D),a(this,re)]}get isSingleRoot(){return!1}get ownsContent(){return a(this,W)}set ownsContent(e){b(this,W,e)}get content(){return a(this,A)}set content(e){b(this,A,e),a(this,A)instanceof Function?this.replaceContent(a(this,A).call(a(this,B).model,a(this,B).model,a(this,B))):this.replaceContent(a(this,A))}update(){a(this,A)instanceof Function&&this.replaceContent(a(this,A).call(a(this,B).model,a(this,B).model,a(this,B)))}bind(){var e,t;a(this,z)&&((t=(e=a(this,F))==null?void 0:e.bind)==null||t.call(e))}unbind(){var e,t;a(this,z)&&((t=(e=a(this,F))==null?void 0:e.unbind)==null||t.call(e))}get isAttached(){var e;return((e=a(this,se))==null?void 0:e.parentNode)!=null}replaceContent(e){var t,i;if(!(e==a(this,F)||!e&&a(this,z))){if(this.isAttached){let n=a(this,se).nextSibling;for(;n!=a(this,re);){let o=n.nextSibling;n.remove(),n=o}}if(b(this,D,[]),a(this,W)&&((i=(t=a(this,F))==null?void 0:t.destroy)==null||i.call(t)),b(this,F,e),b(this,z,!1),!e)a(this,ce)&&(b(this,F,a(this,ce).call(this,a(this,B))),b(this,z,!0),b(this,D,a(this,F).rootNodes));else if(e.rootNodes!==void 0)b(this,D,e.rootNodes);else if(Array.isArray(e))b(this,D,e);else if(C.Node!==void 0&&e instanceof C.Node)b(this,D,[e]);else if(e instanceof I){let n=C.document.createElement("span");n.innerHTML=e.html,b(this,D,[...n.childNodes])}else if(typeof e=="string")b(this,D,[C.document.createTextNode(e)]);else if(e.render)b(this,D,[]);else throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");this.isAttached&&a(this,re).before(...a(this,D))}}destroy(){var e,t;a(this,W)&&((t=(e=a(this,F))==null?void 0:e.destroy)==null||t.call(e))}render(e){var t,i;a(this,F)&&((i=(t=a(this,F)).render)==null||i.call(t,e))}};B=new WeakMap,A=new WeakMap,F=new WeakMap,se=new WeakMap,D=new WeakMap,re=new WeakMap,ce=new WeakMap,z=new WeakMap,W=new WeakMap;let qe=he;class je{static register(e){this.plugins.push(e)}static transform(e){for(let t of this.plugins)t.transform&&(e=t.transform(e));return e}static transformGroup(e){var t;for(let i of this.plugins)(t=i.transformGroup)==null||t.call(i,e)}}k(je,"plugins",[Re,qe,Te]);class Y{constructor(e,t){if(Array.isArray(e)&&(e={$:e}),e._&&!e.type&&(e.type=e._,delete e._),e=je.transform(e),Fe(e)&&(e={type:e}),this.template=e,Fe(e.type))e.type.integrate?this.kind="integrated":this.kind="component";else if(typeof e=="string")this.kind="text";else if(e instanceof I){if(this.kind="html",this.html=e.html,C.document){let i=C.document.createElement("div");i.innerHTML=e.html,this.nodes=[...i.childNodes],this.nodes.forEach(n=>n.remove())}}else e instanceof Function?this.kind="dynamic_text":e.type==="comment"?this.kind="comment":e.type===void 0?this.kind="fragment":this.kind="element";if(this.kind==="integrated"&&(e.$&&!e.content&&(e.content=e.$,delete e.$),this.integrated=this.template.type.integrate(this.template,t)),this.kind=="element"&&e.$&&!e.text&&(typeof e.$=="string"||e.$ instanceof I)&&(e.text=e.$,delete e.$),this.kind=="element"||this.kind=="fragment")e.$&&!e.childNodes&&(e.childNodes=e.$,delete e.$),e.childNodes?(Array.isArray(e.childNodes)?e.childNodes=e.childNodes.flat():e.childNodes=[e.childNodes],e.childNodes.forEach(i=>{i._&&!i.type&&(i.type=i._,delete i._)}),je.transformGroup(e.childNodes),this.childNodes=this.template.childNodes.map(i=>new Y(i,t))):this.childNodes=[];else if(this.isComponent)e.$&&!e.content&&(e.content=e.$,delete e.$);else if(e.childNodes)throw new Error("childNodes only supported on element and fragment nodes")}get isSingleRoot(){return this.isFragment?this.childNodes.length==1&&this.childNodes[0].isSingleRoot:this.isComponent?this.template.type.isSingleRoot:this.isIntegrated?this.integrated.isSingleRoot:this.kind=="html"?this.nodes.length==1:!0}get isComponent(){return this.kind==="component"}get isFragment(){return this.kind==="fragment"}get isIntegrated(){return this.kind==="integrated"}*enumLocalNodes(){if(this.isFragment||(yield this),this.childNodes)for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumLocalNodes()}spreadChildDomNodes(){return Array.from(e(this)).filter(t=>t.length>0).join(", ");function*e(t){for(let i=0;i<t.childNodes.length;i++)yield t.childNodes[i].spreadDomNodes()}}spreadDomNodes(){return Array.from(this.enumAllNodes()).join(", ")}*enumAllNodes(){switch(this.kind){case"fragment":for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumAllNodes();break;case"component":case"integrated":this.isSingleRoot?yield`${this.name}.rootNode`:yield`...${this.name}.rootNodes`;break;case"html":this.nodes.length>0&&(this.nodes.length>1?yield`...${this.name}`:yield`${this.name}`);break;default:yield this.name}}}function Dt(r,e){let t=1,i=1,n=[],o=null,d=new Y(r,e),c=new Map;return{code:g(d,!0).toString(),isSingleRoot:d.isSingleRoot,refs:n};function g(p,h){let y={emit_text_node:le,emit_html_node:mt,emit_dynamic_text_node:gt,emit_comment_node:yt,emit_fragment_node:wt,emit_element_node:$t,emit_integrated_node:vt,emit_component_node:bt},l=new He;l.create=l.addFunction("create").code,l.bind=l.addFunction("bind").code,l.update=l.addFunction("update").code,l.unbind=l.addFunction("unbind").code,l.destroy=l.addFunction("destroy").code;let P;h&&(P=l.addFunction("rebind").code);let Q=new Map;h&&(o=l,o.code.append("let model = context.model;"),o.code.append("let document = env.document;")),l.code.append("create();"),l.code.append("bind();"),l.code.append("update();"),ae(p);for(let s of p.enumLocalNodes())Nt(s);l.bind.closure.isEmpty||(l.create.append("bind();"),l.destroy.closure.addProlog().append("unbind();"));let u=[];return p.isSingleRoot&&u.push(`  get rootNode() { return ${p.spreadDomNodes()}; },`),h?(u.push("  context,"),p==d&&c.forEach((s,f)=>u.push(`  get ${f}() { return ${s}; },`)),l.getFunction("bind").isEmpty?P.append("model = context.model"):(P.append("if (model != context.model)"),P.braced(()=>{P.append("unbind();"),P.append("model = context.model"),P.append("bind();")})),u.push("  rebind,")):(u.push("  bind,"),u.push("  unbind,")),l.code.append(["return { ","  update,","  destroy,",`  get rootNodes() { return [ ${p.spreadDomNodes()} ]; },`,`  isSingleRoot: ${p.isSingleRoot},`,...u,"};"]),l;function x(s){s.template.export?o.addLocal(s.name):l.addLocal(s.name)}function O(){l.update.temp_declared||(l.update.temp_declared=!0,l.update.append("let temp;"))}function ae(s){s.name=`n${t++}`,y[`emit_${s.kind}_node`](s)}function le(s){x(s),l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`)}function mt(s){s.nodes.length!=0&&(x(s),s.nodes.length==1?(l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`),n.push(s.nodes[0])):(l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`),n.push(s.nodes)))}function gt(s){x(s);let f=`p${i++}`;l.addLocal(f),l.create.append(`${s.name} = helpers.createTextNode("");`),O(),l.update.append(`temp = ${j(n.length)};`),l.update.append(`if (temp !== ${f})`),l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${f} = ${j(n.length)});`),n.push(s.template)}function yt(s){if(x(s),s.template.text instanceof Function){let f=`p${i++}`;l.addLocal(f),l.create.append(`${s.name} = document.createComment("");`),O(),l.update.append(`temp = ${j(n.length)};`),l.update.append(`if (temp !== ${f})`),l.update.append(`  ${s.name}.nodeValue = ${f} = temp;`),n.push(s.template.text)}else l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`)}function vt(s){let f=[],E=!1;if(s.integrated.nodes)for(let v=0;v<s.integrated.nodes.length;v++){let $=s.integrated.nodes[v];if(!$){f.push(null);continue}$.name=`n${t++}`;let T=g($,!1);T.getFunction("bind").isEmpty||(E=!0);let ze=`${$.name}_constructor_${v+1}`,St=l.addFunction(ze,[]);T.appendTo(St.code),f.push(ze)}s.integrated.wantsUpdate&&l.update.append(`${s.name}.update()`),E&&(l.bind.append(`${s.name}.bind()`),l.unbind.append(`${s.name}.unbind()`));let L=-1;s.integrated.data&&(L=n.length,n.push(s.integrated.data)),x(s),l.create.append(`${s.name} = new refs[${n.length}]({`,"  context,",`  data: ${s.integrated.data?`refs[${L}]`:"null"},`,`  nodes: [ ${f.join(", ")} ],`,"});"),n.push(s.template.type);for(let v of Object.keys(s.template))if(!Ee(s,v))throw new Error(`Unknown element template key: ${v}`)}function bt(s){x(s),l.create.append(`${s.name} = new refs[${n.length}]();`),n.push(s.template.type);let f=new Set(s.template.type.slots??[]),E=s.template.update==="auto",L=!1;for(let v of Object.keys(s.template)){if(Ee(s,v)||v=="update")continue;if(f.has(v)){if(s.template[v]===void 0)continue;let T=new Y(s.template[v],e);ae(T),T.isSingleRoot?l.create.append(`${s.name}${K(v)}.content = ${T.name};`):l.create.append(`${s.name}${K(v)}.content = [${T.spreadDomNodes()}];`);continue}let $=typeof s.template[v];if($=="string"||$=="number"||$=="boolean")l.create.append(`${s.name}${K(v)} = ${JSON.stringify(s.template[v])}`);else if($==="function"){E&&!L&&(L=`${s.name}_mod`,l.update.append(`let ${L} = false;`));let T=`p${i++}`;l.addLocal(T);let Je=n.length;O(),l.update.append(`temp = ${j(Je)};`),l.update.append(`if (temp !== ${T})`),E&&(l.update.append("{"),l.update.append(`  ${L} = true;`)),l.update.append(`  ${s.name}${K(v)} = ${T} = temp;`),E&&l.update.append("}"),n.push(s.template[v])}else{let T=s.template[v];T instanceof Lt&&(T=T.value),l.create.append(`${s.name}${K(v)} = refs[${n.length}];`),n.push(T)}}s.template.update&&(typeof s.template.update=="function"?(l.update.append(`if (${j(n.length)})`),l.update.append(`  ${s.name}.update();`),n.push(s.template.update)):E?L&&(l.update.append(`if (${L})`),l.update.append(`  ${s.name}.update();`)):l.update.append(`${s.name}.update();`))}function wt(s){Ve(s)}function $t(s){var L;let f=l.current_xmlns,E=s.template.xmlns;E===void 0&&s.template.type=="svg"&&(E="http://www.w3.org/2000/svg"),E==null&&(E=l.current_xmlns),x(s),E?(l.current_xmlns=E,l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(E)}, ${JSON.stringify(s.template.type)});`)):l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);for(let v of Object.keys(s.template))if(!Ee(s,v)){if(v=="id"){H(s.template.id,$=>`${s.name}.setAttribute("id", ${$});`);continue}if(v=="class"){H(s.template.class,$=>`${s.name}.setAttribute("class", ${$});`);continue}if(v.startsWith("class_")){let $=Le(v.substring(6));H(s.template[v],T=>`helpers.setNodeClass(${s.name}, ${JSON.stringify($)}, ${T})`);continue}if(v=="style"){H(s.template.style,$=>`${s.name}.setAttribute("style", ${$});`);continue}if(v.startsWith("style_")){let $=Le(v.substring(6));H(s.template[v],T=>`helpers.setNodeStyle(${s.name}, ${JSON.stringify($)}, ${T})`);continue}if(v=="display"){if(s.template.display instanceof Function)l.addLocal(`${s.name}_prev_display`),H(s.template[v],$=>`${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${$}, ${s.name}_prev_display)`);else if(typeof s.template.display=="string")l.create.append(`${s.name}.style.display = '${s.template.display}';`);else if(s.template.display===!1||s.template.display===null||s.template.display===void 0)l.create.append(`${s.name}.style.display = 'none';`);else if(s.template.display!==!0)throw new Error("display property must be set to string, true, false, or null");continue}if(v.startsWith("attr_")){let $=v.substring(5);if($=="style"||$=="class"||$=="id")throw new Error(`Incorrect attribute: use '${$}' instead of '${v}'`);l.current_xmlns||($=Le($)),H(s.template[v],T=>`${s.name}.setAttribute(${JSON.stringify($)}, ${T})`);continue}if(v=="text"){s.template.text instanceof Function?H(s.template.text,$=>`helpers.setElementText(${s.name}, ${$})`):s.template.text instanceof I&&l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`),typeof s.template.text=="string"&&l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);continue}throw new Error(`Unknown element template key: ${v}`)}Ve(s),(L=s.childNodes)!=null&&L.length&&l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`),l.current_xmlns=f}function Ve(s){if(s.childNodes)for(let f=0;f<s.childNodes.length;f++)ae(s.childNodes[f])}function Ee(s,f){if(xt(f))return!0;if(f=="export"){if(typeof s.template.export!="string")throw new Error("'export' must be a string");if(c.has(s.template.export))throw new Error(`duplicate export name '${s.template.export}'`);return c.set(s.template.export,s.name),!0}if(f=="bind"){if(typeof s.template.bind!="string")throw new Error("'bind' must be a string");if(Q.has(s.template.export))throw new Error(`duplicate bind name '${s.template.bind}'`);return Q.set(s.template.bind,!0),l.bind.append(`model${K(s.template.bind)} = ${s.name};`),l.unbind.append(`model${K(s.template.bind)} = null;`),!0}if(f.startsWith("on_")){let E=f.substring(3);if(!(s.template[f]instanceof Function))throw new Error(`event handler for '${f}' is not a function`);s.listenerCount||(s.listenerCount=0),s.listenerCount++;let L=`${s.name}_ev${s.listenerCount}`;return l.addLocal(L),l.create.append(`${L} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(E)}, refs[${n.length}]);`),n.push(s.template[f]),!0}return f=="debug_create"?(typeof s.template[f]=="function"?(l.create.append(`if (${j(n.length)})`),l.create.append("  debugger;"),n.push(s.template[f])):s.template[f]&&l.create.append("debugger;"),!0):f=="debug_update"?(typeof s.template[f]=="function"?(l.update.append(`if (${j(n.length)})`),l.update.append("  debugger;"),n.push(s.template[f])):s.template[f]&&l.update.append("debugger;"),!0):f=="debug_render"}function xt(s){return s=="type"||s=="childNodes"||s=="xmlns"}function j(s){return`refs[${s}].call(model, model, context)`}function H(s,f){if(s instanceof Function){let E=`p${i++}`;l.addLocal(E),f(),O(),l.update.append(`temp = ${j(n.length)};`),l.update.append(`if (temp !== ${E})`),l.update.append(`  ${f(E+" = temp")};`),n.push(s)}else l.create.append(f(JSON.stringify(s)))}function Nt(s){if((s.isComponent||s.isIntegrated)&&l.destroy.append(`${s.name}.destroy();`),s.listenerCount)for(let f=0;f<s.listenerCount;f++)l.destroy.append(`${s.name}_ev${f+1}?.();`),l.destroy.append(`${s.name}_ev${f+1} = null;`);s.kind=="html"&&s.nodes.length==0||l.destroy.append(`${s.name} = null;`)}}}let Pt=1;function st(r,e){e=e??{},e.compileTemplate=st;let t=Dt(r,e),i=new Function("env","refs","helpers","context",t.code),n=function(o){return o||(o={}),o.$instanceId=Pt++,i(C,t.refs,Ke,o??{})};return n.isSingleRoot=t.isSingleRoot,n}let C=null;var Z;class Ft extends EventTarget{constructor(){super();N(this,Z,0);this.browser=!1}enterLoading(){me(this,Z)._++,a(this,Z)==1&&this.dispatchEvent(new Event("loading"))}leaveLoading(){me(this,Z)._--,a(this,Z)==0&&this.dispatchEvent(new Event("loaded"))}get loading(){return a(this,Z)!=0}async load(t){this.enterLoading();try{return await t()}finally{this.leaveLoading()}}}Z=new WeakMap;class Rt extends Ft{constructor(){super(),this.browser=!0,this.document=document,this.compileTemplate=st,this.window=window,this.requestAnimationFrame=window.requestAnimationFrame.bind(window),this.Node=Node}}function Ot(r){C=r}typeof document<"u"&&Ot(new Rt);let Ye=[],_e=[],ge=null;class X{static declare(e){Ye.push(e),_e.push(e),C.browser&&C.requestAnimationFrame(Bt)}static get all(){return Ye.join(`
`)}}function Bt(){_e.length!=0&&(ge==null&&(ge=document.createElement("style")),ge.innerHTML+=_e.join(`
`),_e=[],ge.parentNode||document.head.appendChild(ge))}let xe=[],ke=!1;function rt(r,e){r&&(e=e??0,e!=0&&(ke=!0),xe.push({callback:r,order:e}),xe.length==1&&C.requestAnimationFrame(function(){let t=xe;ke&&(t.sort((i,n)=>n.order-i.order),ke=!1),xe=[];for(let i=t.length-1;i>=0;i--)t[i].callback()}))}class It{static compile(){return C.compileTemplate(...arguments)}}var R,G;const U=class U extends EventTarget{constructor(){super();N(this,R);N(this,G,0);this.update=this.update.bind(this),this.invalidate=this.invalidate.bind(this)}static get compiledTemplate(){return this._compiledTemplate||(this._compiledTemplate=this.compileTemplate()),this._compiledTemplate}static compileTemplate(){return It.compile(this.template)}static get isSingleRoot(){return this.compiledTemplate.isSingleRoot}init(){a(this,R)||b(this,R,new this.constructor.compiledTemplate({model:this}))}get dom(){return a(this,R)||this.init(),a(this,R)}get isSingleRoot(){return this.dom.isSingleRoot}get rootNode(){if(!this.isSingleRoot)throw new Error("rootNode property can't be used on multi-root template");return this.dom.rootNode}get rootNodes(){return this.dom.rootNodes}invalidate(){a(this,R)&&(this.invalid||(this.invalid=!0,U.invalidate(this)))}validate(){this.invalid&&this.update()}static invalidate(t){this._invalidComponents.push(t),this._invalidComponents.length==1&&rt(()=>{for(let i=0;i<this._invalidComponents.length;i++)this._invalidComponents[i].validate();this._invalidComponents=[]},U.nextFrameOrder)}update(){a(this,R)&&(this.invalid=!1,this.dom.update())}async load(t){me(this,G)._++,a(this,G)==1&&(this.invalidate(),C.enterLoading(),this.dispatchEvent(new Event("loading")));try{return await t()}finally{me(this,G)._--,a(this,G)==0&&(this.invalidate(),this.dispatchEvent(new Event("loaded")),C.leaveLoading())}}get loading(){return a(this,G)!=0}set loading(t){throw new Error("setting Component.loading not supported, use load() function")}render(t){this.dom.render(t)}destroy(){a(this,R)&&(a(this,R).destroy(),b(this,R,null))}mount(t){return typeof t=="string"&&(t=document.querySelector(t)),t.append(...this.rootNodes),this}unmount(){a(this,R)&&this.rootNodes.forEach(t=>t.remove())}};R=new WeakMap,G=new WeakMap,k(U,"_compiledTemplate"),k(U,"nextFrameOrder",-100),k(U,"_invalidComponents",[]),k(U,"template",{});let M=U;class ot{static embed(e){return{type:"embed-slot",content:e}}static h(e,t){return{type:`h${e}`,text:t}}static p(e){return{type:"p",text:e}}static a(e,t){return{type:"a",attr_href:e,text:t}}static raw(e){return new I(e)}}function Mt(r){let e="^",t=r.length,i;for(let o=0;o<t;o++){i=!0;let d=r[o];if(d=="?")e+="[^\\/]";else if(d=="*")e+="[^\\/]+";else if(d==":"){o++;let c=o;for(;o<t&&n(r[o]);)o++;let m=r.substring(c,o);if(m.length==0)throw new Error("syntax error in url pattern: expected id after ':'");let g="[^\\/]+";if(r[o]=="("){o++,c=o;let p=0;for(;o<t;){if(r[o]=="(")p++;else if(r[o]==")"){if(p==0)break;p--}o++}if(o>=t)throw new Error("syntax error in url pattern: expected ')'");g=r.substring(c,o),o++}if(o<t&&r[o]=="*"||r[o]=="+"){let p=r[o];o++,r[o]=="/"?(e+=`(?<${m}>(?:${g}\\/)${p})`,o++):p=="*"?e+=`(?<${m}>(?:${g}\\/)*(?:${g})?\\/?)`:e+=`(?<${m}>(?:${g}\\/)*(?:${g})\\/?)`,i=!1}else e+=`(?<${m}>${g})`;o--}else d=="/"?(e+="\\"+d,o==r.length-1&&(e+="?")):".$^{}[]()|*+?\\/".indexOf(d)>=0?(e+="\\"+d,i=d!="/"):e+=d}return i&&(e+="\\/?"),e+="$",e;function n(o){return o>="a"&&o<="z"||o>="A"&&o<="Z"||o>="0"&&o<="9"||o=="_"||o=="$"}}class Xe{static get(){return{top:window.pageYOffset||document.documentElement.scrollTop,left:window.pageXOffset||document.documentElement.scrollLeft}}static set(e){e?window.scrollTo(e.left,e.top):window.scrollTo(0,0)}}var q,ve,S,pe,ue;class At extends EventTarget{constructor(){super(...arguments);N(this,q,{});N(this,ve);N(this,S);N(this,pe,[]);N(this,ue,!1)}start(){let t=window.sessionStorage.getItem("codeonly-view-states");t&&b(this,q,JSON.parse(t)),this.load(window.location,window.history.state??{sequence:0}),window.history.replaceState(a(this,S).state,null),document.body.addEventListener("click",i=>{var o,d;let n=i.target.closest("a");if(n){let c=n.getAttribute("href"),m=new URL(c,window.location);if(m.hostname==window.location.hostname&&m.port==window.location.port){if(m.pathname==a(this,S).url.pathname){(d=(o=a(this,S))==null?void 0:o.onHashChanged)!=null&&d.call(o,m.hash)&&(i.preventDefault=!0);return}if(this.navigate(m))return i.preventDefault(),!0}}}),window.addEventListener("popstate",i=>{this.captureCurrentViewState(),this.saveViewStatesToLocalStorage(),this.load(document.location,i.state??{sequence:a(this,S).state.sequence+1})}),window.addEventListener("beforeunload",i=>{this.captureCurrentViewState(),this.saveViewStatesToLocalStorage()}),window.history.scrollRestoration&&(window.history.scrollRestoration="manual")}saveViewStatesToLocalStorage(){window.sessionStorage.setItem("codeonly-view-states",JSON.stringify(a(this,q)))}captureCurrentViewState(){a(this,S)&&(a(this,q)[a(this,S).state.sequence]=a(this,S).handler.captureViewState())}get prefix(){return a(this,ve)}set prefix(t){b(this,ve,t)}get current(){return a(this,S)}navigate(t){if(typeof t=="string"&&(t=new URL(t)),this.prefix&&t.pathname!=this.prefix&&!t.pathname.startsWith(this.prefix+"/"))return null;this.captureCurrentViewState();for(let n of Object.keys(a(this,q)))parseInt(n)>a(this,S).state.sequence&&delete a(this,q)[n];this.saveViewStatesToLocalStorage();let i=this.load(t,{sequence:a(this,S).state.sequence+1});return i?(window.history.pushState(i.state,null,t),!0):null}replace(t){var i;typeof t=="string"&&(t=new URL(t)),a(this,S).pathname=t.pathname,this.prefix&&(t.pathname=this.prefix+t.pathname),a(this,S).url=t,a(this,S).originalUrl=t,a(this,S).match=(i=a(this,S).handler.pattern)==null?void 0:i.match(a(this,S).pathname),window.history.replaceState(a(this,S).state,null,t)}load(t,i){var d,c;let n=this.matchUrl(t,i);if(!n)return null;a(this,S)&&((c=(d=a(this,S).handler).leave)==null||c.call(d,a(this,S)),a(this,S).current=!1),b(this,S,n),a(this,S).current=!0;let o=new Event("navigate");return o.route=n,this.dispatchEvent(o),Ct(C,()=>{if(n.current){let m=new Event("navigateLoaded");m.route=n,this.dispatchEvent(m),rt(()=>{var g,p;if(n.current){(p=(g=n.handler).restoreViewState)==null||p.call(g,n.viewState);let h=document.getElementById(n.url.hash.substring(1));h&&h.scrollIntoView()}})}else{let m=new Event("navigateCancelled");m.route=n,this.dispatchEvent(m)}}),n}matchUrl(t,i){a(this,ue)&&(a(this,pe).sort((o,d)=>(o.order??0)-(d.order??0)),b(this,ue,!1));let n={url:t,pathname:t.pathname,state:i,viewState:a(this,q)[i.sequence],originalUrl:t};if(this.prefix){if(!pathname.startsWith(this.prefix))return null;n.pathname=pathname.substring(this.prefix.length)}for(let o of a(this,pe)){if(o.pattern&&(n.match=n.pathname.match(o.pattern),!n.match))continue;let d=o.match(n);if(d===!0||d==n)return n.handler=o,n;if(d===null)return null}return n.handler={},n}back(){if(a(this,S).state.sequence==0){let t=((this==null?void 0:this.prefix)??"")+"/";this.load(t,{sequence:0}),window.history.replaceState(a(this,S).state,null,t)}else window.history.back()}register(t){typeof t.pattern=="string"&&(t.pattern=Mt(t.pattern)),t.captureViewState===void 0&&t.restoreViewState===void 0&&(t.captureViewState=Xe.get,t.restoreViewState=Xe.set),a(this,pe).push(t),b(this,ue,!0)}}q=new WeakMap,ve=new WeakMap,S=new WeakMap,pe=new WeakMap,ue=new WeakMap;let ye=new At;class Qe{constructor(e,t){this.el=e,this.targetClass=t,this.entered=!1,this.pendingTransitions=[],this.detecting=!1,this.transitioning=!1,this.el.addEventListener("transitionend",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitioncancel",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitionrun",this.onTransitionRun.bind(this))}onTransitionEndOrCancel(e){let t=!1;for(let i=0;i<this.pendingTransitions.length;i++){let n=this.pendingTransitions[i];n.target==e.target&&n.propertyName==e.propertyName&&(this.pendingTransitions.splice(i,1),t=!0)}t&&this.pendingTransitions.length==0&&this.onTransitionsFinished()}onTransitionRun(e){this.detecting&&this.pendingTransitions.push({target:e.target,propertyName:e.propertyName})}detectTransitions(){this.transitioning=!0,this.detecting=!0,this.pendingTransitions=[],requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{this.detecting=!1,this.pendingTransitions.length==0&&this.onTransitionsFinished()})))}onTransitionsFinished(){this.el.classList.remove(`${this.targetClass}-start-enter`),this.el.classList.remove(`${this.targetClass}-start-leave`),this.el.classList.remove(`${this.targetClass}-enter`),this.el.classList.remove(`${this.targetClass}-leave`),this.entered?this.el.classList.add(this.targetClass):this.el.classList.remove(this.targetClass),this.transitioning=!1}enter(e){if(e){(this.transitioning||!this.entered)&&(this.entered=!0,this.onTransitionsFinished());return}this.entered||(this.entered=!0,this.detectTransitions(),this.el.classList.add(this.targetClass,`${this.targetClass}-enter`,`${this.targetClass}-start-enter`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-enter`)})))}leave(e){if(e){(this.transitioning||this.entered)&&(this.entered=!1,this.onTransitionsFinished());return}this.entered&&(this.entered=!1,this.detectTransitions(),this.el.classList.add(`${this.targetClass}-leave`,`${this.targetClass}-start-leave`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-leave`)})))}toggle(e){this.entered?this.leave():this.enter()}}class at extends M{}k(at,"template",{_:"header",id:"header",$:[{_:"div",class:"title",text:"CodeOnly"},{_:"div",class:"buttons",$:[]}]});X.declare(`
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
`);class qt{constructor(e){this.pathname=e,this.load()}load(){return C.load(async()=>{try{let e=this.pathname;(e==""||e.endsWith("/"))&&(e+="index");const t=await fetch(`/content/${e}.page`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.processMarkdown(await t.text())}catch{this.failed=!0}})}processMarkdown(e){this.frontmatter={},e=e.replace(/\r\n/g,`
`),this.markdown=e.replace(/^---([\s\S]*?)---\n/,(p,h)=>{for(let y of h.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))try{this.frontmatter[y[1]]=JSON.parse(y[2])}catch{this.frontmatter[y[1]]=y[2]}return""});let t=new commonmark.Parser;this.ast=t.parse(this.markdown);let i=this.ast.walker(),n,o=null,d="";this.headings=[];let c=[];for(;n=i.next();){if(n.entering&&n.node.type==="heading"&&n.node.level==2&&(o=n.node),o!=null&&n.node.type==="text"&&(d+=n.node.literal),!n.entering&&n.node==o){let p=jt(d);p.length>0&&(this.headings.push({node:n.node,text:d,id:p}),o=!1),d="",o=null}n.entering&&n.node.type=="code_block"&&c.push(n.node)}for(let p of this.headings){let h=new commonmark.Node("html_inline",p.node.sourcepos);h.literal=`<a class="hlink" href="#${p.id}">#</a>`,p.node.prependChild(h)}for(let p of c){let h=hljs.highlight(p.literal,{language:p.info,ignoreIllegals:!0}),y=`<pre><code class="hljs language-${h.language}">${h.value}</code></pre>`,l=new commonmark.Node("html_block",p.sourcepos);l.literal=y,p.insertBefore(l),p.unlink()}let m=new commonmark.HtmlRenderer,g=m.attrs;m.attrs=p=>{let h=g.call(m,...arguments);if(p.type=="heading"&&p.level==2){let y=this.headings.find(l=>l.node==p);y&&h.push(["id",y.id])}return h},this.html=m.render(this.ast)}}function jt(r){return r=r.toLowerCase(),r=r.replace(/[^\p{L}\p{N}]+/gu,"-"),r=r.replace(/-+/,"-"),r=r.replace(/^-|-$/g,""),r}class lt extends M{}k(lt,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});X.declare(`
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
`);var fe;class dt extends M{constructor(){super();N(this,fe)}set url(t){let i=new URL("toc",t).pathname;i!=a(this,fe)&&(b(this,fe,i),this.load())}load(){super.load(async()=>{this.error=!1;try{const t=await fetch(`/content${a(this,fe)}`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.toc=await t.json()}catch(t){this.error=!0,console.error(t.message)}})}}fe=new WeakMap,k(dt,"template",{_:"nav",id:"nav-main",$:[{foreach:t=>t.toc,$:[{type:"h5",text:t=>t.title},{type:"ul",$:{foreach:t=>t.pages,type:"li",$:{type:"a",attr_href:t=>t.url,text:t=>t.title}}}]}]});X.declare(`
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
`);var be;class Ht extends EventTarget{constructor(){super(...arguments);N(this,be,null)}get document(){return a(this,be)}set document(t){b(this,be,t),this.dispatchEvent(new Event("documentChanged"))}}be=new WeakMap;new Ht;var we;class ht extends M{constructor(){super();N(this,we)}get inPageLinks(){return a(this,we)}set inPageLinks(t){b(this,we,t),this.invalidate()}hidePopupNav(){this.dispatchEvent(new Event("hidePopupNav"))}}we=new WeakMap,k(ht,"template",{type:"nav",id:"secondary-nav",on_click:t=>t.hidePopupNav(),$:[{if:t=>{var i;return((i=t.inPageLinks)==null?void 0:i.length)>0},$:ot.h(6,"On This Page")},{type:"ul",$:{foreach:t=>t.inPageLinks,type:"li",$:{type:"a",attr_href:t=>`#${t.id}`,text:t=>t.text}}}]});X.declare(`
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

`);class ct extends M{constructor(){super(),this.init(),this.showSidePanelTransition=new Qe(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new Qe(this.rootNode,"show-secondary-panel")}loadRoute(e){this.url=e.url,this.page=e.page,this.invalidate(),this.hidePanel()}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}k(ct,"template",{type:"div",id:"layoutDocumentation",$:[{type:lt,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:{type:dt,url:e=>e.url}},{type:"div",id:"div-center",$:{type:"embed-slot",content:e=>e.page}},{type:"div",id:"div-rhs",$:{type:ht,inPageLinks:e=>{var t;return(t=e.page)==null?void 0:t.inPageLinks},on_hidePopupNav:e=>e.hidePanel()}}]}]});const De=720,Pe=250;X.declare(`
:root
{
    --side-panel-width: ${Pe}px;
    --max-content-width: ${De}px;
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


@media screen and (width < ${Pe*2+De+25}px) 
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

@media screen and (width < ${Pe+De+25}px) 
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



`);class pt extends M{constructor(){super()}loadRoute(e){this.page=e.page,this.invalidate()}}k(pt,"template",{type:"div",id:"layoutBare",$:{type:"embed-slot",content:e=>e.page}});X.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);class Ue extends M{constructor(e){super(),this.url=e}}k(Ue,"template",{type:"div",class:"center",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:e=>`The page ${e.url} doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]});ye.register({match:r=>(r.page=new Ue(r.url),!0),order:1e3});class ut extends M{constructor(e){super(),this.document=e}get inPageLinks(){return this.document.headings}get layout(){var e,t;switch((t=(e=this.document)==null?void 0:e.frontmatter)==null?void 0:t.layout){case"bare":return pt;default:return ct}}}k(ut,"template",{type:"div",class:"article",$:e=>ot.raw(e.document.html)});X.declare(`
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

`);ye.register({pattern:"/:pathname*",match:r=>(r.document=new qt(r.match.groups.pathname),Object.defineProperty(r,"page",{get:function(){return r._page||(r.document.failed?r._page=new Ue:r._page=new ut(r.document)),r._page}}),!0),order:10});var oe;class ft extends M{constructor(){super();N(this,oe,null);ye.addEventListener("navigateLoaded",t=>{var i;t.route.page&&(t.route.page.layout?(t.route.page.layout!=((i=a(this,oe))==null?void 0:i.constructor)&&(b(this,oe,new t.route.page.layout),this.layoutSlot.content=a(this,oe)),a(this,oe).loadRoute(t.route)):this.layoutSlot.content=t.route.page)}),ye.addEventListener("navigateCancelled",t=>{var i;(i=t.route.page)==null||i.destroy()})}}oe=new WeakMap,k(ft,"template",{type:"div",id:"layoutRoot",$:[at,{type:"embed-slot",bind:"layoutSlot"}]});X.declare(`
#layoutRoot
{
    padding-top: var(--fixed-header-height);
}
`);function Ut(){new ft().mount("body"),ye.start()}Ut();
