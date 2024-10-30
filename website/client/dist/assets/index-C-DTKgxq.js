var ri=Object.defineProperty;var wt=s=>{throw TypeError(s)};var oi=(s,e,t)=>e in s?ri(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var S=(s,e,t)=>oi(s,typeof e!="symbol"?e+"":e,t),Qe=(s,e,t)=>e.has(s)||wt("Cannot "+t);var o=(s,e,t)=>(Qe(s,e,"read from private field"),t?t.call(s):e.get(s)),g=(s,e,t)=>e.has(s)?wt("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(s):e.set(s,t),u=(s,e,t,i)=>(Qe(s,e,"write to private field"),i?i.call(s,t):e.set(s,t),t),E=(s,e,t)=>(Qe(s,e,"access private method"),t);var we=(s,e,t,i)=>({set _(n){u(s,e,n,t)},get _(){return o(s,e,i)}});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();function Ke(s){return s.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}function nt(s){return s instanceof Function&&!!s.prototype&&!!s.prototype.constructor}let ai=/^[a-zA-Z$][a-zA-Z0-9_$]*$/;function ae(s){return s.match(ai)?`.${s}`:`[${JSON.stringify(s)}]`}function li(s,e){s.loading?s.addEventListener("loaded",e,{once:!0}):e()}class U{constructor(e){this.html=e}}class di{constructor(e){this.value=e}}function Ue(){let s=[],e="";function t(...y){for(let f=0;f<y.length;f++){let c=y[f];c.lines?s.push(...c.lines.map(v=>e+v)):Array.isArray(c)?s.push(...c.filter(v=>v!=null).map(v=>e+v)):s.push(...c.split(`
`).map(v=>e+v))}}function i(){e+="  "}function n(){e=e.substring(2)}function a(){return s.join(`
`)+`
`}function d(y){t("{"),i(),y(this),n(),t("}")}function h(...y){let f={pos:this.lines.length};return this.append(y),f.headerLineCount=this.lines.length-f.pos,f}function m(y,...f){this.lines.length==y.pos+y.headerLineCount?this.lines.splice(y.pos,y.headerLineCount):this.append(f)}return{append:t,enterCollapsibleBlock:h,leaveCollapsibleBlock:m,indent:i,unindent:n,braced:d,toString:a,lines:s,get isEmpty(){return s.length==0}}}class ft{constructor(){this.code=Ue(),this.code.closure=this,this.functions=[],this.locals=[],this.prologs=[],this.epilogs=[]}get isEmpty(){return this.code.isEmpty&&this.locals.length==0&&this.functions.every(e=>e.code.isEmpty)&&this.prologs.every(e=>e.isEmpty)&&this.epilogs.every(e=>e.isEmpty)}addProlog(){let e=Ue();return this.prologs.push(e),e}addEpilog(){let e=Ue();return this.epilogs.push(e),e}addLocal(e,t){this.locals.push({name:e,init:t})}addFunction(e,t){t||(t=[]);let i={name:e,args:t,code:new ft};return this.functions.push(i),i.code}getFunction(e){var t;return(t=this.functions.find(i=>i.name==e))==null?void 0:t.code}toString(){let e=Ue();return this.appendTo(e),e.toString()}appendTo(e){this.locals.length>0&&e.append(`let ${this.locals.map(t=>t.init?`${t.name} = ${t.init}`:t.name).join(", ")};`);for(let t of this.prologs)e.append(t);e.append(this.code);for(let t of this.functions)e.append(`function ${t.name}(${t.args.join(", ")})`),e.append("{"),e.indent(),t.code.appendTo(e),e.unindent(),e.append("}");for(let t of this.epilogs)e.append(t)}}function Je(s){return s==null?"":(""+s).replace(/["'&<>]/g,function(e){switch(e){case'"':return"&quot;";case"&":return"&amp;";case"'":return"&#39;";case"<":return"&lt;";case">":return"&gt;"}})}class Et{static rawText(e){return e instanceof U?e.html:Je(e)}static renderToString(e){let t="";return e({write:function(i){t+=i}}),t}static renderComponentToString(e){let t="";return e.render({write:function(i){t+=i}}),t}static rawStyle(e){let t;return e instanceof U?t=e.html:t=Je(e),t=t.trim(),t.endsWith(";")||(t+=";"),t}static rawNamedStyle(e,t){if(!t)return"";let i;return t instanceof U?i=t.html:i=Je(t),i=i.trim(),i+=";",`${e}:${i}`}static createTextNode(e){if(e instanceof U){let t=document.createElement("SPAN");return t.innerHTML=e.html,t}else return document.createTextNode(e)}static setElementAttribute(e,t,i){i===void 0?e.removeAttribute(t):e.setAttribute(t,i)}static setElementText(e,t){t instanceof U?e.innerHTML=t.html:e.innerText=t}static setNodeText(e,t){if(t instanceof U){if(e.nodeType==1)return e.innerHTML=t.html,e;let i=document.createElement("SPAN");return i.innerHTML=t.html,e.replaceWith(i),i}else{if(e.nodeType==3)return e.nodeValue=t,e;let i=document.createTextNode(t);return e.replaceWith(i),i}}static setNodeClass(e,t,i){i?e.classList.add(t):e.classList.remove(t)}static setNodeStyle(e,t,i){i==null?e.style.removeProperty(t):e.style[t]=i}static setNodeDisplay(e,t,i){if(t===!0){i===null?e.style.removeProperty("display"):i!==void 0&&e.style.display!=i&&(e.style.display=i);return}else if(t===!1||t===null||t===void 0){let n=e.style.display;return e.style.display!="none"&&(e.style.display="none"),n??null}else if(typeof t=="string"){let n=e.style.display;return e.style.display!=t&&(e.style.display=t),n??null}}static replaceMany(e,t){var i;if((i=e==null?void 0:e[0])!=null&&i.parentNode){e[0].replaceWith(...t);for(let n=1;n<e.length;n++)e[n].remove()}}static addEventListener(e,t,i,n){function a(d){return n(e(),d)}return t.addEventListener(i,a),function(){t.removeEventListener(i,a)}}}function bt(s){let e=function(){var i;let t=(i=x.document)==null?void 0:i.createComment(s);return{get rootNode(){return t},get rootNodes(){return[t]},get isSingleRoot(){return!0},setMounted(n){},destroy(){},update(){},render(n){n.write(`<!--${Je(s)}-->`)}}};return e.isSingleRoot=!0,e}var Ie;const Ge=class Ge{constructor(e){g(this,Ie,!1);this.branches=e.data,this.branch_constructors=[],this.context=e.context;for(let t of this.branches)t.nodeIndex!==void 0?this.branch_constructors.push(e.nodes[t.nodeIndex]):this.branch_constructors.push(bt(" IfBlock placeholder "));this.activeBranchIndex=-1,this.activeBranch=bt(" IfBlock placeholder ")()}static integrate(e,t){let i=[],n=[],a=!1,d=!0;for(let h=0;h<e.branches.length;h++){let m=e.branches[h],y={};if(i.push(y),m.condition instanceof Function?(y.condition=m.condition,a=!1):m.condition!==void 0?(y.condition=()=>m.condition,a=!!m.condition):(y.condition=()=>!0,a=!0),m.template!==void 0){let f=new re(m.template,t);f.isSingleRoot||(d=!1),y.nodeIndex=n.length,n.push(f)}}return delete e.branches,a||i.push({condition:()=>!0}),{isSingleRoot:d,nodes:n,data:i}}static transform(e){if(e.if===void 0)return e;let t={type:Ge,branches:[{template:e,condition:e.if}]};return delete e.if,t}static transformGroup(e){let t=null;for(let i=0;i<e.length;i++){let n=e[i];if(n.if)t={type:Ge,branches:[{condition:n.if,template:n}]},delete n.if,e.splice(i,1,t);else if(n.elseif){if(!t)throw new Error("template has 'elseif' without a preceeding condition");t.branches.push({condition:n.elseif,template:n}),delete n.elseif,e.splice(i,1),i--}else if(n.else!==void 0){if(!t)throw new Error("template has 'else' without a preceeding condition");t.branches.push({condition:!0,template:n}),delete n.else,t=null,e.splice(i,1),i--}else t=null}}destroy(){this.activeBranch.destroy()}update(){this.switchActiveBranch(),this.activeBranch.update()}render(e){this.activeBranch.render(e)}unbind(){var e,t;(t=(e=this.activeBranch).unbind)==null||t.call(e)}bind(){var e,t;(t=(e=this.activeBranch).bind)==null||t.call(e)}switchActiveBranch(e){let t=this.resolveActiveBranch();if(t!=this.activeBranchIndex){let i=this.activeBranch;this.activeBranchIndex=t,this.activeBranch=this.branch_constructors[t](),Et.replaceMany(i.rootNodes,this.activeBranch.rootNodes),o(this,Ie)&&(i.setMounted(!1),this.activeBranch.setMounted(!0)),i.destroy()}}resolveActiveBranch(){for(let e=0;e<this.branches.length;e++)if(this.branches[e].condition.call(this.context.model,this.context.model,this.context))return e;throw new Error("internal error, IfBlock didn't resolve to a branch")}setMounted(e){u(this,Ie,e),this.activeBranch.setMounted(e)}get rootNodes(){return this.activeBranch.rootNodes}get rootNode(){return this.activeBranch.rootNode}};Ie=new WeakMap;let st=Ge;function hi(s,e){let t=Math.min(s.length,e.length),i=Math.max(s.length,e.length),n=0;for(;n<t&&s[n]==e[n];)n++;if(n==i)return[];if(n==s.length)return[{op:"insert",index:s.length,count:e.length-s.length}];let a=0;for(;a<t-n&&s[s.length-a-1]==e[e.length-a-1];)a++;if(a==s.length)return[{op:"insert",index:0,count:e.length-s.length}];if(n+a==s.length)return[{op:"insert",index:n,count:e.length-s.length}];if(n+a==e.length)return[{op:"delete",index:n,count:s.length-e.length}];let d=s.length-a,h=e.length-a,m=H(e,n,h),y=null,f=[],c=n,v=n;for(;c<h;){for(;c<h&&s[v]==e[c];)m.delete(e[c],c),c++,v++;let p=c,_=v;for(;v<d&&!m.has(s[v]);)v++;if(v>_){f.push({op:"delete",index:p,count:v-_});continue}for(y||(y=H(s,c,d));c<h&&!y.has(e[c]);)m.delete(e[c],c),c++;if(c>p){f.push({op:"insert",index:p,count:c-p});continue}break}if(c==h)return f;let l=0,M=new $t;for(;v<d;){let p=v;for(;v<d&&!m.has(s[v]);)v++;if(v>p){f.push({op:"delete",index:c,count:v-p});continue}for(;v<d&&m.consume(s[v])!==void 0;)M.add(s[v],l++),v++;v>p&&f.push({op:"store",index:c,count:v-p})}for(;c<h;){let p=c;for(;c<h&&!M.has(e[c]);)c++;if(c>p){f.push({op:"insert",index:p,count:c-p});continue}let _={op:"restore",index:c,count:0};for(f.push(_);c<h;){let z=M.consume(e[c]);if(z===void 0)break;_.count==0?(_.storeIndex=z,_.count=1):_.storeIndex+_.count==z?_.count++:(_={op:"restore",index:c,storeIndex:z,count:1},f.push(_)),c++}}return f;function H(p,_,z){let ye=new $t;for(let ve=_;ve<z;ve++)ye.add(p[ve],ve);return ye}}var Q;class $t{constructor(){g(this,Q,new Map)}add(e,t){let i=o(this,Q).get(e);i?i.push(t):o(this,Q).set(e,[t])}delete(e,t){let i=o(this,Q).get(e);if(i){let n=i.indexOf(t);if(n>=0){i.splice(n,1);return}}throw new Error("key/value pair not found")}consume(e){let t=o(this,Q).get(e);if(!(!t||t.length==0))return t.shift()}has(e){return o(this,Q).has(e)}}Q=new WeakMap;var _e,J,q,b,ot,We,K,he,ce,ue,le,kt,at,Ct,lt,Tt,dt,Lt,ht,de;const xe=class xe{constructor(e){g(this,b);g(this,_e);g(this,J);g(this,q,!1);g(this,K);g(this,he);g(this,ce);g(this,ue);var t,i;this.itemConstructor=e.data.itemConstructor,this.outer=e.context,this.items=e.data.template.items,this.condition=e.data.template.condition,this.itemKey=e.data.template.itemKey,this.emptyConstructor=e.nodes.length?e.nodes[0]:null,this.itemDoms=[],u(this,_e,(t=x.document)==null?void 0:t.createComment(" enter foreach block ")),u(this,J,(i=x.document)==null?void 0:i.createComment(" leave foreach block ")),this.itemConstructor.isSingleRoot?(u(this,K,E(this,b,Tt)),u(this,ce,E(this,b,Lt)),u(this,he,E(this,b,dt)),u(this,ue,E(this,b,ht))):(u(this,K,E(this,b,kt)),u(this,ce,E(this,b,Ct)),u(this,he,E(this,b,at)),u(this,ue,E(this,b,lt)))}static integrate(e,t){let i={itemConstructor:t.compileTemplate(e.template),template:{items:e.items,condition:e.condition,itemKey:e.itemKey}},n;return e.empty&&(n=[new re(e.empty,t)]),delete e.template,delete e.items,delete e.condition,delete e.itemKey,delete e.empty,{isSingleRoot:!1,data:i,nodes:n}}static transform(e){if(e.foreach===void 0)return e;let t;return e.foreach instanceof Function||Array.isArray(e.foreach)?(t={type:xe,template:e,items:e.foreach},delete e.foreach):(t=Object.assign({},e.foreach,{type:xe,template:e}),delete e.foreach),t}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1].foreach!==void 0&&(e[t-1]=xe.transform(e[t-1])),e[t-1].type===xe&&!e[t-1].else&&(delete e[t].else,e[t-1].empty=e[t],e.splice(t,1),t--))}onObservableUpdate(e,t,i){let n={outer:this.outer};if(i==0&&t==0){let a=this.observableItems[e],d=[a],h=null;this.itemKey&&(n.model=a,h=[this.itemKey.call(a,a,n)]),E(this,b,de).call(this,d,h,e,0,1)}else{let a=null,d=this.observableItems.slice(e,e+i);this.itemKey&&(a=d.map(h=>(n.model=h,this.itemKey.call(h,h,n)))),i&&t?E(this,b,ot).call(this,e,t,d,a):t!=0?o(this,ce).call(this,e,t):i!=0&&o(this,K).call(this,d,a,e,0,i),E(this,b,We).call(this)}}get rootNodes(){let e=this.emptyDom?this.emptyDom.rootNodes:[];if(this.itemConstructor.isSingleRoot)return[o(this,_e),...this.itemDoms.map(t=>t.rootNode),...e,o(this,J)];{let t=[o(this,_e)];for(let i=0;i<this.itemDoms.length;i++)t.push(...this.itemDoms[i].rootNodes);return t.push(...e),t.push(o(this,J)),t}}setMounted(e){u(this,q,e),be(this.itemDoms,e)}update(){let e;this.items instanceof Function?e=this.items.call(this.outer.model,this.outer.model,this.outer):e=this.items,e=e??[],this.observableItems!=null&&this.observableItems!=e&&this.observableItems.removeListener(this._onObservableUpdate),Array.isArray(e)&&e.isObservable&&this.observableItems!=e&&(this._onObservableUpdate=this.onObservableUpdate.bind(this),this.observableItems=e,this.observableItems.addListener(this._onObservableUpdate),o(this,ce).call(this,0,this.itemDoms.length),this.itemsLoaded=!1);let t={outer:this.outer},i=null;if(this.observableItems||this.condition&&(e=e.filter(n=>(t.model=n,this.condition.call(n,n,t)))),this.itemKey&&(i=e.map(n=>(t.model=n,this.itemKey.call(n,n,t)))),!this.itemsLoaded){this.itemsLoaded=!0,o(this,K).call(this,e,i,0,0,e.length),E(this,b,We).call(this);return}this.observableItems||E(this,b,ot).call(this,0,this.itemDoms.length,e,i)}render(e){e.write("<!-- enter foreach block -->");for(let t=0;t<this.itemDoms.length;t++)this.itemDoms[t].render(e);e.write("<!-- leave foreach block -->")}bind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.bind)==null||t.call(e)}unbind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.unbind)==null||t.call(e)}destroy(){this.observableItems!=null&&(this.observableItems.removeListener(this._onObservableUpdate),this.observableItems=null),Ve(this.itemDoms),this.itemDoms=null}};_e=new WeakMap,J=new WeakMap,q=new WeakMap,b=new WeakSet,ot=function(e,t,i,n){let a=e+t,d;e==0&&t==this.itemDoms.length?d=this.itemDoms:d=this.itemDoms.slice(e,a);let h;if(n?h=hi(d.map(p=>p.context.key),n):i.length>d.length?h=[{op:"insert",index:d.length,count:i.length-d.length}]:i.length<d.length?h=[{op:"delete",index:i.length,count:d.length-i.length}]:h=[],h.length==0){E(this,b,de).call(this,i,n,e,0,t);return}let m=[],y=[],f={insert:v,delete:l,store:M,restore:H},c=0;for(let p of h)p.index>c&&(E(this,b,de).call(this,i,n,e+c,c,p.index-c),c=p.index),f[p.op].call(this,p);c<i.length&&E(this,b,de).call(this,i,n,e+c,c,i.length-c),o(this,q)&&be(y,!1),Ve(y),E(this,b,We).call(this);function v(p){c+=p.count;let _=Math.min(y.length,p.count);_&&(o(this,he).call(this,p.index+e,y.splice(0,_)),E(this,b,de).call(this,i,n,p.index+e,p.index,_)),_<p.count&&o(this,K).call(this,i,n,p.index+e+_,p.index+_,p.count-_)}function l(p){y.push(...o(this,ue).call(this,p.index+e,p.count))}function M(p){m.push(...o(this,ue).call(this,p.index+e,p.count))}function H(p){c+=p.count,o(this,he).call(this,p.index+e,m.slice(p.storeIndex,p.storeIndex+p.count)),E(this,b,de).call(this,i,n,p.index+e,p.index,p.count)}},We=function(){if(this.itemDoms.length==0)!this.emptyDom&&this.emptyConstructor&&(this.emptyDom=this.emptyConstructor(),o(this,b,le)&&o(this,J).before(...this.emptyDom.rootNodes),o(this,q)&&this.emptyDom.setMounted(!0)),this.emptyDom&&this.emptyDom.update();else if(this.emptyDom){if(o(this,b,le))for(var e of this.emptyDom.rootNodes)e.remove();o(this,q)&&this.emptyDome.setMounted(!1),this.emptyDom.destroy(),this.emptyDom=null}},K=new WeakMap,he=new WeakMap,ce=new WeakMap,ue=new WeakMap,le=function(){var e;return((e=o(this,J))==null?void 0:e.parentNode)!=null},kt=function(e,t,i,n,a){let d=[];for(let h=0;h<a;h++){let m={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(m))}E(this,b,at).call(this,i,d),o(this,q)&&be(d,!0)},at=function(e,t){if(this.itemDoms.splice(e,0,...t),o(this,b,le)){let i=[];t.forEach(a=>i.push(...a.rootNodes));let n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNodes[0]:n=o(this,J),n.before(...i)}},Ct=function(e,t){let i=E(this,b,lt).call(this,e,t);o(this,q)&&be(i,!1),Ve(i)},lt=function(e,t){if(o(this,b,le))for(let i=0;i<t;i++){let n=this.itemDoms[e+i].rootNodes;for(let a=0;a<n.length;a++)n[a].remove()}return this.itemDoms.splice(e,t)},Tt=function(e,t,i,n,a){let d=[];for(let h=0;h<a;h++){let m={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(m))}E(this,b,dt).call(this,i,d),o(this,q)&&be(d,!0)},dt=function(e,t){if(this.itemDoms.splice(e,0,...t),o(this,b,le)){let i=t.map(a=>a.rootNode),n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNode:n=o(this,J),n.before(...i)}},Lt=function(e,t){let i=E(this,b,ht).call(this,e,t);o(this,q)&&be(i,!1),Ve(i)},ht=function(e,t){if(o(this,b,le))for(let i=0;i<t;i++)this.itemDoms[e+i].rootNode.remove();return this.itemDoms.splice(e,t)},de=function(e,t,i,n,a){for(let d=0;d<a;d++){let h=this.itemDoms[i+d];h.context.key=t==null?void 0:t[n+d],h.context.index=i+d,h.context.model=e[n+d],h.rebind(),h.update()}};let rt=xe;function Ve(s){for(let e=s.length-1;e>=0;e--)s[e].destroy()}function be(s,e){for(let t=s.length-1;t>=0;t--)s[t].setMounted(e)}var A,W,D,pe,P,fe,Se,ee,te,Be,ut,Ee;const Ne=class Ne{constructor(e){g(this,Be);g(this,A);g(this,W);g(this,D);g(this,pe);g(this,P);g(this,fe);g(this,Se);g(this,ee);g(this,te,!0);g(this,Ee);var t,i;u(this,A,e.context),u(this,Se,e.nodes[1]),u(this,pe,(t=x.document)==null?void 0:t.createTextNode("")),u(this,fe,(i=x.document)==null?void 0:i.createTextNode("")),u(this,P,[]),u(this,te,e.data.ownsContent??!0),e.nodes[0]?this.content=e.nodes[0]():this.content=e.data.content}static integrate(e,t){let i=null;e.content&&typeof e.content=="object"&&(i=e.content,delete e.content);let n={isSingleRoot:!1,data:{ownsContent:e.ownsContent??!0,content:e.content},nodes:[i?new re(i,t):null,e.placeholder?new re(e.placeholder,t):null]};return delete e.content,delete e.placeholder,delete e.ownsContent,n}static transform(e){return e instanceof Function&&!nt(e)?{type:Ne,content:e}:(e.type=="embed-slot"&&(e.type=Ne),e)}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1]=Ne.transform(e[t-1]),e[t-1].type===Ne&&!e[t-1].placeholder&&(delete e[t].else,e[t-1].placeholder=e[t],e.splice(t,1),t--))}get rootNodes(){return[o(this,pe),...o(this,P),o(this,fe)]}get isSingleRoot(){return!1}get ownsContent(){return o(this,te)}set ownsContent(e){u(this,te,e)}get content(){return o(this,W)}set content(e){u(this,W,e),o(this,W)instanceof Function?this.replaceContent(o(this,W).call(o(this,A).model,o(this,A).model,o(this,A))):this.replaceContent(o(this,W))}update(){o(this,W)instanceof Function&&this.replaceContent(o(this,W).call(o(this,A).model,o(this,A).model,o(this,A)))}bind(){var e,t;o(this,ee)&&((t=(e=o(this,D))==null?void 0:e.bind)==null||t.call(e))}unbind(){var e,t;o(this,ee)&&((t=(e=o(this,D))==null?void 0:e.unbind)==null||t.call(e))}get isAttached(){}setMounted(e){var t,i;u(this,Ee,e),(i=(t=o(this,D))==null?void 0:t.setMounted)==null||i.call(t,e)}replaceContent(e){var t,i,n,a,d,h;if(!(e==o(this,D)||!e&&o(this,ee))){if(o(this,Be,ut)){let m=o(this,pe).nextSibling;for(;m!=o(this,fe);){let y=m.nextSibling;m.remove(),m=y}}if(o(this,Ee)&&((i=(t=o(this,D))==null?void 0:t.setMounted)==null||i.call(t,!1)),u(this,P,[]),o(this,te)&&((a=(n=o(this,D))==null?void 0:n.destroy)==null||a.call(n)),u(this,D,e),u(this,ee,!1),!e)o(this,Se)&&(u(this,D,o(this,Se).call(this,o(this,A))),u(this,ee,!0),u(this,P,o(this,D).rootNodes));else if(e.rootNodes!==void 0)u(this,P,e.rootNodes);else if(Array.isArray(e))u(this,P,e);else if(x.Node!==void 0&&e instanceof x.Node)u(this,P,[e]);else if(e instanceof U){let m=x.document.createElement("span");m.innerHTML=e.html,u(this,P,[...m.childNodes])}else if(typeof e=="string")u(this,P,[x.document.createTextNode(e)]);else if(e.render)u(this,P,[]);else throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");o(this,Be,ut)&&o(this,fe).before(...o(this,P)),o(this,Ee)&&((h=(d=o(this,D))==null?void 0:d.setMounted)==null||h.call(d,!0))}}destroy(){var e,t;o(this,te)&&((t=(e=o(this,D))==null?void 0:e.destroy)==null||t.call(e))}render(e){var t,i;o(this,D)&&((i=(t=o(this,D)).render)==null||i.call(t,e))}};A=new WeakMap,W=new WeakMap,D=new WeakMap,pe=new WeakMap,P=new WeakMap,fe=new WeakMap,Se=new WeakMap,ee=new WeakMap,te=new WeakMap,Be=new WeakSet,ut=function(){var e;return((e=o(this,pe))==null?void 0:e.parentNode)!=null},Ee=new WeakMap;let ct=Ne;class pt{static register(e){this.plugins.push(e)}static transform(e){for(let t of this.plugins)t.transform&&(e=t.transform(e));return e}static transformGroup(e){var t;for(let i of this.plugins)(t=i.transformGroup)==null||t.call(i,e)}}S(pt,"plugins",[rt,ct,st]);class re{constructor(e,t){if(Array.isArray(e)&&(e={$:e}),e._&&!e.type&&(e.type=e._,delete e._),e=pt.transform(e),nt(e)&&(e={type:e}),this.template=e,nt(e.type))e.type.integrate?this.kind="integrated":this.kind="component";else if(typeof e=="string")this.kind="text";else if(e instanceof U){if(this.kind="html",this.html=e.html,x.document){let i=x.document.createElement("div");i.innerHTML=e.html,this.nodes=[...i.childNodes],this.nodes.forEach(n=>n.remove())}}else e instanceof Function?this.kind="dynamic_text":e.type==="comment"?this.kind="comment":e.type===void 0?this.kind="fragment":this.kind="element";if(this.kind==="integrated"&&(e.$&&!e.content&&(e.content=e.$,delete e.$),this.integrated=this.template.type.integrate(this.template,t)),this.kind=="element"&&e.$&&!e.text&&(typeof e.$=="string"||e.$ instanceof U)&&(e.text=e.$,delete e.$),this.kind=="element"||this.kind=="fragment")e.$&&!e.childNodes&&(e.childNodes=e.$,delete e.$),e.childNodes?(Array.isArray(e.childNodes)?e.childNodes=e.childNodes.flat():e.childNodes=[e.childNodes],e.childNodes.forEach(i=>{i._&&!i.type&&(i.type=i._,delete i._)}),pt.transformGroup(e.childNodes),this.childNodes=this.template.childNodes.map(i=>new re(i,t))):this.childNodes=[];else if(this.isComponent)e.$&&!e.content&&(e.content=e.$,delete e.$);else if(e.childNodes)throw new Error("childNodes only supported on element and fragment nodes")}get isSingleRoot(){return this.isFragment?this.childNodes.length==1&&this.childNodes[0].isSingleRoot:this.isComponent?this.template.type.isSingleRoot:this.isIntegrated?this.integrated.isSingleRoot:this.kind=="html"?this.nodes.length==1:!0}get isComponent(){return this.kind==="component"}get isFragment(){return this.kind==="fragment"}get isIntegrated(){return this.kind==="integrated"}*enumLocalNodes(){if(this.isFragment||(yield this),this.childNodes)for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumLocalNodes()}spreadChildDomNodes(){return Array.from(e(this)).filter(t=>t.length>0).join(", ");function*e(t){for(let i=0;i<t.childNodes.length;i++)yield t.childNodes[i].spreadDomNodes()}}spreadDomNodes(){return Array.from(this.enumAllNodes()).join(", ")}*enumAllNodes(){switch(this.kind){case"fragment":for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumAllNodes();break;case"component":case"integrated":this.isSingleRoot?yield`${this.name}.rootNode`:yield`...${this.name}.rootNodes`;break;case"html":this.nodes.length>0&&(this.nodes.length>1?yield`...${this.name}`:yield`${this.name}`);break;default:yield this.name}}}function ci(s,e){let t=1,i=1,n=[],a=null,d=new re(s,e),h=new Map;return{code:y(d,!0).toString(),isSingleRoot:d.isSingleRoot,refs:n};function y(f,c){let v={emit_text_node:ve,emit_html_node:Yt,emit_dynamic_text_node:Xt,emit_comment_node:Qt,emit_fragment_node:ti,emit_element_node:ii,emit_integrated_node:Kt,emit_component_node:ei},l=new ft;l.create=l.addFunction("create").code,l.bind=l.addFunction("bind").code,l.update=l.addFunction("update").code,l.unbind=l.addFunction("unbind").code,l.setMounted=l.addFunction("setMounted",["mounted"]).code,l.destroy=l.addFunction("destroy").code;let M;c&&(M=l.addFunction("rebind").code);let H=new Map;c&&(a=l,a.code.append("let model = context.model;"),a.code.append("let document = env.document;")),l.code.append("create();"),l.code.append("bind();"),l.code.append("update();"),ye(f),l.bind.closure.isEmpty||(l.create.append("bind();"),l.destroy.closure.addProlog().append("unbind();"));let p=[];return f.isSingleRoot&&p.push(`  get rootNode() { return ${f.spreadDomNodes()}; },`),c?(p.push("  context,"),f==d&&h.forEach((r,w)=>p.push(`  get ${w}() { return ${r}; },`)),l.getFunction("bind").isEmpty?M.append("model = context.model"):(M.append("if (model != context.model)"),M.braced(()=>{M.append("unbind();"),M.append("model = context.model"),M.append("bind();")})),p.push("  rebind,")):(p.push("  bind,"),p.push("  unbind,")),l.code.append(["return { ","  update,","  destroy,","  setMounted,",`  get rootNodes() { return [ ${f.spreadDomNodes()} ]; },`,`  isSingleRoot: ${f.isSingleRoot},`,...p,"};"]),l;function _(r){r.template.export?a.addLocal(r.name):l.addLocal(r.name)}function z(){l.update.temp_declared||(l.update.temp_declared=!0,l.update.append("let temp;"))}function ye(r){r.name=`n${t++}`,v[`emit_${r.kind}_node`](r)}function ve(r){_(r),l.create.append(`${r.name} = document.createTextNode(${JSON.stringify(r.template)});`)}function Yt(r){r.nodes.length!=0&&(_(r),r.nodes.length==1?(l.create.append(`${r.name} = refs[${n.length}].cloneNode(true);`),n.push(r.nodes[0])):(l.create.append(`${r.name} = refs[${n.length}].map(x => x.cloneNode(true));`),n.push(r.nodes)))}function Xt(r){_(r);let w=`p${i++}`;l.addLocal(w),l.create.append(`${r.name} = helpers.createTextNode("");`),z(),l.update.append(`temp = ${G(n.length)};`),l.update.append(`if (temp !== ${w})`),l.update.append(`  ${r.name} = helpers.setNodeText(${r.name}, ${w} = ${G(n.length)});`),n.push(r.template)}function Qt(r){if(_(r),r.template.text instanceof Function){let w=`p${i++}`;l.addLocal(w),l.create.append(`${r.name} = document.createComment("");`),z(),l.update.append(`temp = ${G(n.length)};`),l.update.append(`if (temp !== ${w})`),l.update.append(`  ${r.name}.nodeValue = ${w} = temp;`),n.push(r.template.text)}else l.create.append(`${r.name} = document.createComment(${JSON.stringify(r.template.text)});`)}function Kt(r){let w=[],C=!1;if(r.integrated.nodes)for(let $=0;$<r.integrated.nodes.length;$++){let N=r.integrated.nodes[$];if(!N){w.push(null);continue}N.name=`n${t++}`;let k=y(N,!1);k.getFunction("bind").isEmpty||(C=!0);let vt=`${N.name}_constructor_${$+1}`,si=l.addFunction(vt,[]);k.appendTo(si.code),w.push(vt)}l.update.append(`${r.name}.update()`),C&&(l.bind.append(`${r.name}.bind()`),l.unbind.append(`${r.name}.unbind()`));let T=-1;r.integrated.data&&(T=n.length,n.push(r.integrated.data)),_(r),l.create.append(`${r.name} = new refs[${n.length}]({`,"  context,",`  data: ${r.integrated.data?`refs[${T}]`:"null"},`,`  nodes: [ ${w.join(", ")} ],`,"});"),n.push(r.template.type),l.setMounted.append(`${r.name}.setMounted(mounted);`),l.destroy.append(`${r.name}?.destroy();`),l.destroy.append(`${r.name} = null;`);for(let $ of Object.keys(r.template))if(!Xe(r,$))throw new Error(`Unknown element template key: ${$}`)}function ei(r){_(r),l.create.append(`${r.name} = new refs[${n.length}]();`),n.push(r.template.type);let w=new Set(r.template.type.slots??[]),C=r.template.update==="auto",T=!1;l.setMounted.append(`${r.name}.setMounted(mounted);`),l.destroy.append(`${r.name}?.destroy();`),l.destroy.append(`${r.name} = null;`);for(let $ of Object.keys(r.template)){if(Xe(r,$)||$=="update")continue;if(w.has($)){if(r.template[$]===void 0)continue;let k=new re(r.template[$],e);ye(k),k.isSingleRoot?l.create.append(`${r.name}${ae($)}.content = ${k.name};`):l.create.append(`${r.name}${ae($)}.content = [${k.spreadDomNodes()}];`);continue}let N=typeof r.template[$];if(N=="string"||N=="number"||N=="boolean")l.create.append(`${r.name}${ae($)} = ${JSON.stringify(r.template[$])}`);else if(N==="function"){C&&!T&&(T=`${r.name}_mod`,l.update.append(`let ${T} = false;`));let k=`p${i++}`;l.addLocal(k);let yt=n.length;z(),l.update.append(`temp = ${G(yt)};`),l.update.append(`if (temp !== ${k})`),C&&(l.update.append("{"),l.update.append(`  ${T} = true;`)),l.update.append(`  ${r.name}${ae($)} = ${k} = temp;`),C&&l.update.append("}"),n.push(r.template[$])}else{let k=r.template[$];k instanceof di&&(k=k.value),l.create.append(`${r.name}${ae($)} = refs[${n.length}];`),n.push(k)}}r.template.update&&(typeof r.template.update=="function"?(l.update.append(`if (${G(n.length)})`),l.update.append(`  ${r.name}.update();`),n.push(r.template.update)):C?T&&(l.update.append(`if (${T})`),l.update.append(`  ${r.name}.update();`)):l.update.append(`${r.name}.update();`))}function ti(r){gt(r)}function ii(r){var T;let w=l.current_xmlns,C=r.template.xmlns;C===void 0&&r.template.type=="svg"&&(C="http://www.w3.org/2000/svg"),C==null&&(C=l.current_xmlns),_(r),C?(l.current_xmlns=C,l.create.append(`${r.name} = document.createElementNS(${JSON.stringify(C)}, ${JSON.stringify(r.template.type)});`)):l.create.append(`${r.name} = document.createElement(${JSON.stringify(r.template.type)});`),l.destroy.append(`${r.name} = null;`);for(let $ of Object.keys(r.template))if(!Xe(r,$)){if($=="id"){Y(r.template.id,N=>`${r.name}.setAttribute("id", ${N});`);continue}if($=="class"){Y(r.template.class,N=>`${r.name}.setAttribute("class", ${N});`);continue}if($.startsWith("class_")){let N=Ke($.substring(6));Y(r.template[$],k=>`helpers.setNodeClass(${r.name}, ${JSON.stringify(N)}, ${k})`);continue}if($=="style"){Y(r.template.style,N=>`${r.name}.setAttribute("style", ${N});`);continue}if($.startsWith("style_")){let N=Ke($.substring(6));Y(r.template[$],k=>`helpers.setNodeStyle(${r.name}, ${JSON.stringify(N)}, ${k})`);continue}if($=="display"){if(r.template.display instanceof Function)l.addLocal(`${r.name}_prev_display`),Y(r.template[$],N=>`${r.name}_prev_display = helpers.setNodeDisplay(${r.name}, ${N}, ${r.name}_prev_display)`);else if(typeof r.template.display=="string")l.create.append(`${r.name}.style.display = '${r.template.display}';`);else if(r.template.display===!1||r.template.display===null||r.template.display===void 0)l.create.append(`${r.name}.style.display = 'none';`);else if(r.template.display!==!0)throw new Error("display property must be set to string, true, false, or null");continue}if($.startsWith("attr_")){let N=$.substring(5);if(N=="style"||N=="class"||N=="id")throw new Error(`Incorrect attribute: use '${N}' instead of '${$}'`);l.current_xmlns||(N=Ke(N)),Y(r.template[$],k=>`helpers.setElementAttribute(${r.name}, ${JSON.stringify(N)}, ${k})`);continue}if($=="text"){r.template.text instanceof Function?Y(r.template.text,N=>`helpers.setElementText(${r.name}, ${N})`):r.template.text instanceof U&&l.create.append(`${r.name}.innerHTML = ${JSON.stringify(r.template.text.html)};`),typeof r.template.text=="string"&&l.create.append(`${r.name}.innerText = ${JSON.stringify(r.template.text)};`);continue}throw new Error(`Unknown element template key: ${$}`)}gt(r),(T=r.childNodes)!=null&&T.length&&l.create.append(`${r.name}.append(${r.spreadChildDomNodes()});`),l.current_xmlns=w}function gt(r){if(r.childNodes)for(let w=0;w<r.childNodes.length;w++)ye(r.childNodes[w])}function Xe(r,w){if(ni(w))return!0;if(w=="export"){if(typeof r.template.export!="string")throw new Error("'export' must be a string");if(h.has(r.template.export))throw new Error(`duplicate export name '${r.template.export}'`);return h.set(r.template.export,r.name),!0}if(w=="bind"){if(typeof r.template.bind!="string")throw new Error("'bind' must be a string");if(H.has(r.template.export))throw new Error(`duplicate bind name '${r.template.bind}'`);return H.set(r.template.bind,!0),l.bind.append(`model${ae(r.template.bind)} = ${r.name};`),l.unbind.append(`model${ae(r.template.bind)} = null;`),!0}if(w.startsWith("on_")){let C=w.substring(3);if(!(r.template[w]instanceof Function))throw new Error(`event handler for '${w}' is not a function`);r.listenerCount||(r.listenerCount=0),r.listenerCount++;let T=`${r.name}_ev${r.listenerCount}`;return l.addLocal(T),l.create.append(`${T} = helpers.addEventListener(() => model, ${r.name}, ${JSON.stringify(C)}, refs[${n.length}]);`),n.push(r.template[w]),l.destroy.append(`${T}?.();`),l.destroy.append(`${T} = null;`),!0}return w=="debug_create"?(typeof r.template[w]=="function"?(l.create.append(`if (${G(n.length)})`),l.create.append("  debugger;"),n.push(r.template[w])):r.template[w]&&l.create.append("debugger;"),!0):w=="debug_update"?(typeof r.template[w]=="function"?(l.update.append(`if (${G(n.length)})`),l.update.append("  debugger;"),n.push(r.template[w])):r.template[w]&&l.update.append("debugger;"),!0):w=="debug_render"}function ni(r){return r=="type"||r=="childNodes"||r=="xmlns"}function G(r){return`refs[${r}].call(model, model, context)`}function Y(r,w){if(r instanceof Function){let C=`p${i++}`;l.addLocal(C),w(),z(),l.update.append(`temp = ${G(n.length)};`),l.update.append(`if (temp !== ${C})`),l.update.append(`  ${w(C+" = temp")};`),n.push(r)}else l.create.append(w(JSON.stringify(r)))}}}let ui=1;function Mt(s,e){e=e??{},e.compileTemplate=Mt;let t=ci(s,e),i=new Function("env","refs","helpers","context",t.code),n=function(a){return a||(a={}),a.$instanceId=ui++,i(x,t.refs,Et,a??{})};return n.isSingleRoot=t.isSingleRoot,n}let x=null;var ie;class pi extends EventTarget{constructor(){super();g(this,ie,0);this.browser=!1}enterLoading(){we(this,ie)._++,o(this,ie)==1&&this.dispatchEvent(new Event("loading"))}leaveLoading(){we(this,ie)._--,o(this,ie)==0&&this.dispatchEvent(new Event("loaded"))}get loading(){return o(this,ie)!=0}async load(t){this.enterLoading();try{return await t()}finally{this.leaveLoading()}}}ie=new WeakMap;class fi extends pi{constructor(){super(),this.browser=!0,this.document=document,this.compileTemplate=Mt,this.window=window,this.requestAnimationFrame=window.requestAnimationFrame.bind(window),this.Node=Node}}function mi(s){x=s}typeof document<"u"&&mi(new fi);let xt=[],Ze=[],Re=null;class V{static declare(e){xt.push(e),Ze.push(e),x.browser&&x.requestAnimationFrame(gi)}static get all(){return xt.join(`
`)}}function gi(){Ze.length!=0&&(Re==null&&(Re=document.createElement("style")),Re.innerHTML+=Ze.join(`
`),Ze=[],Re.parentNode||document.head.appendChild(Re))}let He=[],et=!1;function Dt(s,e){s&&(e=e??0,e!=0&&(et=!0),He.push({callback:s,order:e}),He.length==1&&x.requestAnimationFrame(function(){let t=He;et&&(t.sort((i,n)=>n.order-i.order),et=!1),He=[];for(let i=t.length-1;i>=0;i--)t[i].callback()}))}class yi{static compile(){return x.compileTemplate(...arguments)}}var F,ne,Ye;const X=class X extends EventTarget{constructor(){super();g(this,F);g(this,ne,0);g(this,Ye,!1);this.update=this.update.bind(this),this.invalidate=this.invalidate.bind(this)}static get compiledTemplate(){return this._compiledTemplate||(this._compiledTemplate=this.compileTemplate()),this._compiledTemplate}static compileTemplate(){return yi.compile(this.template)}static get isSingleRoot(){return this.compiledTemplate.isSingleRoot}init(){o(this,F)||u(this,F,new this.constructor.compiledTemplate({model:this}))}get dom(){return o(this,F)||this.init(),o(this,F)}get isSingleRoot(){return this.dom.isSingleRoot}get rootNode(){if(!this.isSingleRoot)throw new Error("rootNode property can't be used on multi-root template");return this.dom.rootNode}get rootNodes(){return this.dom.rootNodes}invalidate(){o(this,F)&&(this.invalid||(this.invalid=!0,X.invalidate(this)))}validate(){this.invalid&&this.update()}static invalidate(t){this._invalidComponents.push(t),this._invalidComponents.length==1&&Dt(()=>{for(let i=0;i<this._invalidComponents.length;i++)this._invalidComponents[i].validate();this._invalidComponents=[]},X.nextFrameOrder)}update(){o(this,F)&&(this.invalid=!1,this.dom.update())}async load(t){we(this,ne)._++,o(this,ne)==1&&(this.invalidate(),x.enterLoading(),this.dispatchEvent(new Event("loading")));try{return await t()}finally{we(this,ne)._--,o(this,ne)==0&&(this.invalidate(),this.dispatchEvent(new Event("loaded")),x.leaveLoading())}}get loading(){return o(this,ne)!=0}set loading(t){throw new Error("setting Component.loading not supported, use load() function")}render(t){this.dom.render(t)}destroy(){o(this,F)&&(o(this,F).destroy(),u(this,F,null))}onMount(){}onUnmount(){}setMounted(t){var i;(i=o(this,F))==null||i.setMounted(t),u(this,Ye,t),t?this.onMount():this.onUnmount()}mount(t){return typeof t=="string"&&(t=document.querySelector(t)),t.append(...this.rootNodes),this.setMounted(!0),this}unmount(){o(this,F)&&this.rootNodes.forEach(t=>t.remove()),this.setMounted(!1)}};F=new WeakMap,ne=new WeakMap,Ye=new WeakMap,S(X,"_compiledTemplate"),S(X,"nextFrameOrder",-100),S(X,"_invalidComponents",[]),S(X,"template",{});let L=X;class Pt{static embed(e){return{type:"embed-slot",content:e}}static h(e,t){return{type:`h${e}`,text:t}}static p(e){return{type:"p",text:e}}static a(e,t){return{type:"a",attr_href:e,text:t}}static raw(e){return new U(e)}}function vi(s){let e="^",t=s.length,i;for(let a=0;a<t;a++){i=!0;let d=s[a];if(d=="?")e+="[^\\/]";else if(d=="*")e+="[^\\/]+";else if(d==":"){a++;let h=a;for(;a<t&&n(s[a]);)a++;let m=s.substring(h,a);if(m.length==0)throw new Error("syntax error in url pattern: expected id after ':'");let y="[^\\/]+";if(s[a]=="("){a++,h=a;let f=0;for(;a<t;){if(s[a]=="(")f++;else if(s[a]==")"){if(f==0)break;f--}a++}if(a>=t)throw new Error("syntax error in url pattern: expected ')'");y=s.substring(h,a),a++}if(a<t&&s[a]=="*"||s[a]=="+"){let f=s[a];a++,s[a]=="/"?(e+=`(?<${m}>(?:${y}\\/)${f})`,a++):f=="*"?e+=`(?<${m}>(?:${y}\\/)*(?:${y})?\\/?)`:e+=`(?<${m}>(?:${y}\\/)*(?:${y})\\/?)`,i=!1}else e+=`(?<${m}>${y})`;a--}else d=="/"?(e+="\\"+d,a==s.length-1&&(e+="?")):".$^{}[]()|*+?\\/".indexOf(d)>=0?(e+="\\"+d,i=d!="/"):e+=d}return i&&(e+="\\/?"),e+="$",e;function n(a){return a>="a"&&a<="z"||a>="A"&&a<="Z"||a>="0"&&a<="9"||a=="_"||a=="$"}}class Nt{constructor(e,t){this.el=e,this.targetClass=t,this.entered=!1,this.pendingTransitions=[],this.detecting=!1,this.transitioning=!1,this.el.addEventListener("transitionend",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitioncancel",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitionrun",this.onTransitionRun.bind(this))}onTransitionEndOrCancel(e){let t=!1;for(let i=0;i<this.pendingTransitions.length;i++){let n=this.pendingTransitions[i];n.target==e.target&&n.propertyName==e.propertyName&&(this.pendingTransitions.splice(i,1),t=!0)}t&&this.pendingTransitions.length==0&&this.onTransitionsFinished()}onTransitionRun(e){this.detecting&&this.pendingTransitions.push({target:e.target,propertyName:e.propertyName})}detectTransitions(){this.transitioning=!0,this.detecting=!0,this.pendingTransitions=[],requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{this.detecting=!1,this.pendingTransitions.length==0&&this.onTransitionsFinished()})))}onTransitionsFinished(){this.el.classList.remove(`${this.targetClass}-start-enter`),this.el.classList.remove(`${this.targetClass}-start-leave`),this.el.classList.remove(`${this.targetClass}-enter`),this.el.classList.remove(`${this.targetClass}-leave`),this.entered?this.el.classList.add(this.targetClass):this.el.classList.remove(this.targetClass),this.transitioning=!1}enter(e){if(e){(this.transitioning||!this.entered)&&(this.entered=!0,this.onTransitionsFinished());return}this.entered||(this.entered=!0,this.detectTransitions(),this.el.classList.add(this.targetClass,`${this.targetClass}-enter`,`${this.targetClass}-start-enter`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-enter`)})))}leave(e){if(e){(this.transitioning||this.entered)&&(this.entered=!1,this.onTransitionsFinished());return}this.entered&&(this.entered=!1,this.detectTransitions(),this.el.classList.add(`${this.targetClass}-leave`,`${this.targetClass}-start-leave`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-leave`)})))}toggle(e){this.entered?this.leave():this.enter()}}class _t{static get(){return{top:window.pageYOffset||document.documentElement.scrollTop,left:window.pageXOffset||document.documentElement.scrollLeft}}static set(e){e?window.scrollTo(e.left,e.top):window.scrollTo(0,0)}}var Oe,I,O,me,ke,Ce;class wi{constructor(e,t){g(this,Oe);S(this,"urlMapper");g(this,I,null);g(this,O,null);g(this,me,[]);g(this,ke,[]);g(this,Ce,!1);u(this,Oe,e),e&&(this.navigate=e.navigate.bind(e),this.replace=e.navigate.bind(e),this.back=e.back.bind(e)),t&&this.register(t)}start(){return o(this,Oe).start(this)}internalize(e){var t;return((t=this.urlMapper)==null?void 0:t.internalize(e))??new URL(e)}externalize(e){var t;return((t=this.urlMapper)==null?void 0:t.externalize(e))??new URL(e)}get current(){return o(this,I)}get pending(){return o(this,O)}addEventListener(e,t){o(this,me).push({event:e,handler:t})}removeEventListener(e,t){let i=o(this,me).findIndex(n=>n.event==e&&n.handler==t);i>=0&&o(this,me).splice(i,1)}async dispatchEvent(e,t,i,n){for(let a of o(this,me))if(a.event==e){let d=a.handler(i,n);if(t&&await Promise.resolve(d)==!1)return!1}return!0}async load(e,t,i){var a,d,h;i=i??{};let n=o(this,I);if(((a=o(this,I))==null?void 0:a.url.pathname)==e.pathname&&o(this,I).url.search==e.search){let m=(h=(d=o(this,I).handler).hashChange)==null?void 0:h.call(d,o(this,I),i);m!==void 0?i=m:i=Object.assign({},o(this,I),i)}if(i=Object.assign(i,{current:!1,url:e,pathname:e.pathname,state:t}),u(this,O,i),!i.match&&(i=await this.matchUrl(e,t,i),!i))return null;try{await this.tryLoad(i)!==!0&&u(this,O,null)}catch(m){throw this.dispatchCancelEvents(n,i),m}return o(this,O)!=i?(this.dispatchCancelEvents(n,i),null):(u(this,O,null),i)}dispatchCancelEvents(e,t){var i,n,a,d,h;(a=(i=o(this,I))==null?void 0:(n=i.handler).cancelLeave)==null||a.call(n,e,t),(h=(d=t.handler).cancelEnter)==null||h.call(d,e,t),this.dispatchEvent("cancel",!1,e,t)}async tryLoad(e){var n,a,d,h,m,y,f,c;let t=o(this,I),i;if(!(t&&(!await this.dispatchEvent("mayLeave",!0,t,e)||e!=o(this,O)||(i=(a=(n=t.handler).mayLeave)==null?void 0:a.call(n,t,e),await Promise.resolve(i)===!1)||e!=o(this,O)))&&(i=(h=(d=e.handler).mayEnter)==null?void 0:h.call(d,t,e),await Promise.resolve(i)!==!1&&e==o(this,O)&&await this.dispatchEvent("mayEnter",!0,t,e)&&e==o(this,O)))return t&&(t.current=!1),e.current=!0,u(this,I,e),t&&(this.dispatchEvent("didLeave",!1,t,e),(y=t==null?void 0:(m=t.handler).didLeave)==null||y.call(m,t,e)),(c=(f=e.handler).didEnter)==null||c.call(f,t,e),this.dispatchEvent("didEnter",!1,t,e),!0}async matchUrl(e,t,i){o(this,Ce)&&(o(this,ke).sort((n,a)=>(n.order??0)-(a.order??0)),u(this,Ce,!1));for(let n of o(this,ke)){if(n.pattern&&(i.match=i.pathname.match(n.pattern),!i.match))continue;let a=await Promise.resolve(n.match(i));if(a===!0||a==i)return i.handler=n,i;if(a===null)return null}return i.handler={},i}register(e){Array.isArray(e)||(e=[e]);for(let t of e)typeof t.pattern=="string"&&(t.pattern=new RegExp(vi(t.pattern))),o(this,ke).push(t);u(this,Ce,!0)}}Oe=new WeakMap,I=new WeakMap,O=new WeakMap,me=new WeakMap,ke=new WeakMap,Ce=new WeakMap;var Te,B,Le;class bi{constructor(){g(this,Te,0);g(this,B);g(this,Le,!1)}async start(e){u(this,B,e),x.document.body.addEventListener("click",a=>{let d=a.target.closest("a");if(d){let h=d.getAttribute("href"),m=new URL(h,x.window.location);if(m.origin==x.window.location.origin){try{m=o(this,B).internalize(m)}catch{return}if(this.navigate(m))return a.preventDefault(),!0}}}),x.window.addEventListener("popstate",async a=>{if(o(this,Le)){u(this,Le,!1);return}let d=o(this,Te)+1,h=o(this,B).internalize(x.window.location),m=a.state??{sequence:this.current.state.sequence+1};await this.load(h,m,{navMode:"pop"})||d==o(this,Te)&&(u(this,Le,!0),x.window.history.go(this.current.state.sequence-m.sequence))});let t=o(this,B).internalize(x.window.location),i=x.window.history.state??{sequence:0},n=await this.load(t,i,{navMode:"start"});return x.window.history.replaceState(i,null),n}get current(){return o(this,B).current}async load(e,t,i){return we(this,Te)._++,await o(this,B).load(e,t,i)}back(){this.current.state.sequence==0?(this.replace("/"),this.load("/",{sequence:0},{navMode:"replace"})):x.window.history.back()}replace(e){typeof e=="string"&&(e=new URL(e,o(this,B).internalize(x.window.location))),this.current.pathname=e.pathname,this.current.url=e,x.window.history.replaceState(this.current.state,"",o(this,B).externalize(e))}async navigate(e){typeof e=="string"&&(e=new URL(e,o(this,B).internalize(x.window.location)));let t=await this.load(e,{sequence:this.current.state.sequence+1},{navMode:"push"});return t&&(x.window.history.pushState(t.state,"",o(this,B).externalize(e)),t)}}Te=new WeakMap,B=new WeakMap,Le=new WeakMap;var Z,j;class $i{constructor(e){g(this,Z);g(this,j,{});u(this,Z,e),x.window.history.scrollRestoration&&(x.window.history.scrollRestoration="manual");let t=x.window.sessionStorage.getItem("codeonly-view-states");t&&u(this,j,JSON.parse(t)),e.addEventListener("mayLeave",(i,n)=>(this.captureViewState(),!0)),e.addEventListener("mayEnter",(i,n)=>{n.viewState=o(this,j)[n.state.sequence]}),e.addEventListener("didEnter",(i,n)=>{if(n.navMode=="push"){for(let a of Object.keys(o(this,j)))parseInt(a)>n.state.sequence&&delete o(this,j)[a];this.saveViewStates()}li(x,()=>{Dt(()=>{var a,d;if(n.handler.restoreViewState?n.handler.restoreViewState(n.viewState,n):o(this,Z).restoreViewState?(d=(a=o(this,Z)).restoreViewState)==null||d.call(a,n.viewState,n):_t.set(n.viewState),x.browser){let h=document.getElementById(n.url.hash.substring(1));h==null||h.scrollIntoView()}})})}),x.window.addEventListener("beforeunload",i=>{this.captureViewState()})}captureViewState(){var t,i;let e=o(this,Z).current;e&&(e.handler.captureViewState?o(this,j)[e.state.sequence]=e.handler.captureViewState(e):o(this,Z).captureViewState?o(this,j)[e.state.sequence]=(i=(t=o(this,Z)).captureViewState)==null?void 0:i.call(t,e):o(this,j)[e.state.sequence]=_t.get()),this.saveViewStates()}saveViewStates(){x.window.sessionStorage.setItem("codeonly-view-states",JSON.stringify(o(this,j)))}}Z=new WeakMap,j=new WeakMap;class Ft extends L{}S(Ft,"template",{_:"header",id:"header",$:[{_:"a",class:"title",attr_href:"/",$:[{type:"img",attr_src:"/codeonly-logo.svg"},"CodeOnly"]},{_:"div",class:"buttons",$:[{type:"a",class:"subtle button",attr_href:"/sandbox",text:"Sandbox"},{type:"a",class:"subtle button",attr_href:"/guide/",text:"Guide"},{type:"input",attr_type:"checkbox",attr_checked:window.stylish.darkMode?"checked":void 0,class:"theme-switch",on_click:()=>window.stylish.toggleTheme()}]}]});V.declare(`
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
        align-items: center;

        .theme-switch
        {
            transform: translateY(-1.5px);
        }
    }
}
`);let oe=new wi(new bi);new $i(oe);var R,ge;class Rt extends L{constructor(){super();g(this,R);g(this,ge,"");this.init(),this.updateTheme=this.updateTheme.bind(this),require(["vs/editor/editor.main"],()=>{u(this,R,monaco.editor.create(this.editorContainer,{value:o(this,ge),language:"javascript",theme:window.stylish.darkMode?"vs-dark":"vs-light"})),u(this,ge,null),o(this,R).getModel().onDidChangeContent(i=>{this.dispatchEvent(new Event("input"))}),this.resizeEditor()}),new ResizeObserver(()=>{this.resizeEditor()}).observe(this.editorContainer)}updateTheme(){o(this,R)&&o(this,R)._themeService.setTheme(stylish.darkMode?"vs-dark":"vs-light")}onMount(){window.stylish.addEventListener("darkModeChanged",this.updateTheme)}onUnmount(){window.stylish.removeEventListener("darkModeChanged",this.updateTheme)}resizeEditor(){o(this,R)&&o(this,R).layout()}get editor(){return o(this,R)}get value(){return o(this,R)?o(this,R).getValue():o(this,ge)}set value(t){o(this,R)?o(this,R).setValue(t):u(this,ge,t)}}R=new WeakMap,ge=new WeakMap,S(Rt,"template",{type:"div",class:"editorContainer",style:"width: 100%; height: 100%;",bind:"editorContainer"});let $e=`<html>
<head>
<script type="importmap">
{
    "imports": {
        "@toptensoftware/codeonly": "/codeonly.js"
    }
}
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
`,xi=`
<\/script>
</body>
</html>
`,St=!1;function Ni(){if(St)return;St=!0;let s=Array.from(document.querySelectorAll("link[rel=stylesheet]")).map(e=>`<link href="${e.getAttribute("href")}" rel="stylesheet">`).join(`
`);$e=$e.replace("##stylesheets##",s),$e=$e.replace("##patchlinecount##",($e.split(`
`).length-1).toString())}class It extends L{constructor(e){Ni(),super(),this.script=e}get srcdoc(){return`${$e}${this.script}
        new Main().mount("body");
        ${xi}
        `}}S(It,"template",{_:"iframe",attr_srcdoc:e=>e.srcdoc});var ze;class Bt extends L{constructor(){super();g(this,ze,"")}set script(t){u(this,ze,t),this.invalidate()}createIframe(){return new It(o(this,ze))}}ze=new WeakMap,S(Bt,"template",{_:"div",id:"preview",$:{_:"embed-slot",content:t=>t.createIframe()}});V.declare(`
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
`);async function Ot(s){const t=new Blob([s]).stream().pipeThrough(new CompressionStream("gzip")),i=[];for await(const n of t)i.push(n);return await zt(i)}async function _i(s){const t=new Blob([s]).stream().pipeThrough(new DecompressionStream("gzip")),i=[];for await(const a of t)i.push(a);const n=await zt(i);return new TextDecoder().decode(n)}async function zt(s){const t=await new Blob(s).arrayBuffer();return new Uint8Array(t)}async function qt(s){const e=await new Promise(t=>{const i=new FileReader;i.onload=()=>t(i.result),i.readAsDataURL(new Blob([s]))});return e.slice(e.indexOf(",")+1)}async function Si(s){var e="data:application/octet-binary;base64,"+s;return await(await fetch(e)).arrayBuffer()}function Ei(s){let e=`<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CodeOnly Sandbox</title>
<link href="${window.location.origin}/stylish.css" type="text/css" rel="stylesheet">
<script type="importmap">
{
    "imports": {
        "@toptensoftware/codeonly": "${window.location.origin}/codeonly.js"
    }
}
<\/script>
</head>
<body>
<script type="module">
import { Component, Style } from "@toptensoftware/codeonly";
${s}
new Main().mount("body");
<\/script>
</body>
</html>
`;var t=document.createElement("a");t.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),t.setAttribute("download","codeonly.html"),t.style.display="none",document.body.appendChild(t),t.click(),document.body.removeChild(t)}var Me;class At extends L{constructor(){super(...arguments);S(this,"text");S(this,"class");g(this,Me,!1)}onClick(t){if(!o(this,Me))try{this.dispatchEvent(new Event("click"));let i=this.button.getAttribute("style"),n=this.button.textContent,a=this.button.offsetWidth;this.button.style.width=`${a}px`,this.button.textContent="✓",u(this,Me,!0),setTimeout(()=>{this.button.setAttribute("style",i),this.button.textContent=n,u(this,Me,!1)},1e3)}catch(i){alert(i.message)}}}Me=new WeakMap,S(At,"template",{type:"button",text:t=>t.text,class:t=>t.class,bind:"button",on_click:(t,i)=>t.onClick(i)});let ki=`class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;var De,qe,Pe;class jt extends L{constructor(t){super();g(this,De,!1);g(this,qe,null);g(this,Pe,null);S(this,"showErrors",!0);this.init(),this.editor.value=(t==null?void 0:t.code)??ki,this.preview.script=this.editor.value,this.onIFrameMessage=this.onIFrameMessage.bind(this),window.addEventListener("message",this.onIFrameMessage)}destroy(){window.removeEventListener("message",this.onIFrameMessage)}onIFrameMessage(t){t.data.action=="error"&&(this.error=`line: ${t.data.error.lineno} col: ${t.data.error.colno}: ${t.data.error.message}`)}get error(){return o(this,qe)}set error(t){u(this,qe,t),this.invalidate()}onCodeChange(){this.error=null,!o(this,De)&&(o(this,Pe)!=null&&clearTimeout(o(this,Pe)),u(this,Pe,setTimeout(()=>{u(this,De,!0),this.preview.script=this.editor.value,u(this,De,!1)},500)))}async onCopyLink(){if(navigator.clipboard){let t=new URL(window.location),i=JSON.stringify({code:this.editor.value});t.hash=await qt(await Ot(i)),navigator.clipboard.writeText(t.href),window.location.hash=t.hash}}onShowErrorsChanged(t){this.showErrors=t.target.checked,this.invalidate()}onDownload(){Ei(this.editor.value)}}De=new WeakMap,qe=new WeakMap,Pe=new WeakMap,S(jt,"template",{type:"div",class:"sandbox",$:[{type:"div",class:"editor-container",$:[{type:Rt,bind:"editor",on_input:t=>t.onCodeChange()},{_:"div",class:"error",display:t=>!!t.error&&t.showErrors,text:t=>t.error}]},{type:"div",class:"preview-container",$:[{type:Bt,bind:"preview"},{type:"footer",$:[{type:"label",$:[{type:"input",attr_type:"checkbox",attr_checked:"checked",class:"switch",on_click:(t,i)=>t.onShowErrorsChanged(i)},"Show Errors"]},{type:At,class:"subtle",text:"Copy Link",on_click:t=>t.onCopyLink()},{type:"button",class:"subtle",text:"Download",on_click:t=>t.onDownload()}]}]}]});V.declare(`
.sandbox
{
    display: flex;
    align-items: stretch;
    height: calc(100% - var(--header-height));

    .editor-container
    {
        width: 50%; 
        height: 100%; 
        position: relative;
        border-right: 1px solid var(--gridline-color);
        padding-right: 1px;
    }


    .preview-container
    {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    footer
    {
        display: flex;
        gap: 10px;
        width: 100%;
        padding: 10px;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--gridline-color);
    }

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
`);oe.register({pattern:"/sandbox",match:async s=>{let e=null;return s.url.hash.length>1&&(e=JSON.parse(await _i(await Si(s.url.hash.substring(1))))),s.page=new jt(e),!0}});async function Ci(s){let e=JSON.stringify({code:s}),t=await qt(await Ot(e));oe.navigate(`/sandbox#${t}`)}class Ti{constructor(e){this.pathname=e}load(){return x.load(async()=>{let e=this.pathname;(e==""||e.endsWith("/"))&&(e+="index");const t=await fetch(`/content/${e}.page`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.processMarkdown(await t.text())})}mountDemos(){for(let e of this.demos){let t=`${e.code}

return new Main();`,i=new Function("Component","Style",t);e.main=i(L,V),e.main.mount(document.getElementById(e.id)),document.getElementById(`edit-${e.id}`).addEventListener("click",n=>{Ci(e.code),n.preventDefault()})}}processMarkdown(e){this.frontmatter={},e=e.replace(/\r\n/g,`
`),this.markdown=e.replace(/^---([\s\S]*?)---\n/,(f,c)=>{for(let v of c.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))try{this.frontmatter[v[1]]=JSON.parse(v[2])}catch{this.frontmatter[v[1]]=v[2]}return""});let t=new commonmark.Parser;this.ast=t.parse(this.markdown);let i=this.ast.walker(),n,a=null,d="";this.headings=[];let h=[];for(;n=i.next();){if(n.entering&&n.node.type==="heading"&&n.node.level==2&&(a=n.node),a!=null&&n.node.type==="text"&&(d+=n.node.literal),!n.entering&&n.node==a){let f=Li(d);f.length>0&&(this.headings.push({node:n.node,text:d,id:f}),a=!1),d="",a=null}n.entering&&n.node.type=="code_block"&&h.push(n.node)}for(let f of this.headings){let c=new commonmark.Node("html_inline",f.node.sourcepos);c.literal=`<a class="hlink" href="#${f.id}">#</a>`,f.node.prependChild(c)}this.demos=[];for(let f of h){let c=f.literal,v=c.startsWith("// demo");v&&(c=c.substring(7).trimStart());let l=hljs.highlight(c,{language:f.info,ignoreIllegals:!0}),M=`<pre><code class="hljs language-${l.language}">${l.value}</code></pre>
`;if(v){let p=`demo-${this.demos.length}`;this.demos.push({id:p,code:c}),M+=`
<div class="demo-header">
    <span>Result:</span>
    <a id="edit-${p}" class="edit-demo-link" href="#">Edit in Sandbox</a>
</div>
<div id="${p}" class="demo">
</div>
`}let H=new commonmark.Node("html_block",f.sourcepos);H.literal=M,f.insertBefore(H),f.unlink()}let m=new commonmark.HtmlRenderer,y=m.attrs;m.attrs=f=>{let c=y.call(m,...arguments);if(f.type=="heading"&&f.level==2){let v=this.headings.find(l=>l.node==f);v&&c.push(["id",v.id])}return c},this.html=m.render(this.ast)}}function Li(s){return s=s.toLowerCase(),s=s.replace(/[^\p{L}\p{N}]+/gu,"-"),s=s.replace(/-+/,"-"),s=s.replace(/^-|-$/g,""),s}class Ut extends L{}S(Ut,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});V.declare(`
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
`);var Fe;class Vt extends L{constructor(){super();g(this,Fe)}set url(t){let i=new URL("toc",t).pathname;i!=o(this,Fe)&&(u(this,Fe,i),this.load())}load(){super.load(async()=>{this.error=!1;try{const t=await fetch(`/content${o(this,Fe)}`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.toc=await t.json()}catch(t){this.error=!0,console.error(t.message)}})}}Fe=new WeakMap,S(Vt,"template",{_:"nav",id:"nav-main",$:[{foreach:t=>t.toc,$:[{type:"h5",text:t=>t.title},{type:"ul",$:{foreach:t=>t.pages,type:"li",$:{type:"a",attr_href:t=>t.url,text:t=>t.title}}}]}]});V.declare(`
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
`);var Ae;class Mi extends EventTarget{constructor(){super(...arguments);g(this,Ae,null)}get document(){return o(this,Ae)}set document(t){u(this,Ae,t),this.dispatchEvent(new Event("documentChanged"))}}Ae=new WeakMap;new Mi;var je;class Ht extends L{constructor(){super();g(this,je)}get inPageLinks(){return o(this,je)}set inPageLinks(t){u(this,je,t),this.invalidate()}hidePopupNav(){this.dispatchEvent(new Event("hidePopupNav"))}}je=new WeakMap,S(Ht,"template",{type:"nav",id:"secondary-nav",on_click:t=>t.hidePopupNav(),$:[{if:t=>{var i;return((i=t.inPageLinks)==null?void 0:i.length)>0},$:Pt.h(6,"On This Page")},{type:"ul",$:{foreach:t=>t.inPageLinks,type:"li",$:{type:"a",attr_href:t=>`#${t.id}`,text:t=>t.text}}}]});V.declare(`
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

`);class Jt extends L{constructor(){super(),this.init(),this.showSidePanelTransition=new Nt(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new Nt(this.rootNode,"show-secondary-panel"),oe.addEventListener("mayLeave",()=>this.hidePanel())}loadRoute(e){this.url=e.url,this.page=e.page,this.invalidate()}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}S(Jt,"template",{type:"div",id:"layoutDocumentation",$:[{type:Ut,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:{type:Vt,url:e=>e.url}},{type:"div",id:"div-center",$:{type:"embed-slot",content:e=>e.page}},{type:"div",id:"div-rhs",$:{type:Ht,inPageLinks:e=>{var t;return(t=e.page)==null?void 0:t.inPageLinks},on_hidePopupNav:e=>e.hidePanel()}}]}]});const tt=720,it=250;V.declare(`
:root
{
    --side-panel-width: ${it}px;
    --max-content-width: ${tt}px;
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


@media screen and (width < ${it*2+tt+25}px) 
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

@media screen and (width < ${it+tt+25}px) 
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



`);class Wt extends L{constructor(){super()}loadRoute(e){this.page=e.page,this.invalidate()}}S(Wt,"template",{type:"div",id:"layoutBare",$:{type:"embed-slot",content:e=>e.page}});V.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);class mt extends L{constructor(e){super(),this.url=e}}S(mt,"template",{type:"div",class:"center",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:e=>`The page ${e.url} doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]});oe.register({match:s=>(s.page=new mt(s.url),!0),order:1e3});class Zt extends L{constructor(e){super(),this.document=e}get inPageLinks(){return this.document.headings}get layout(){var e,t;switch((t=(e=this.document)==null?void 0:e.frontmatter)==null?void 0:t.layout){case"bare":return Wt;default:return Jt}}onMount(){this.document.mountDemos()}}S(Zt,"template",{type:"div",class:"article",$:e=>Pt.raw(e.document.html)});V.declare(`
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
        background-color: rgb(from var(--fore-color) r g b / 2%);
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

    div.demo-header
    {
        display: flex;
        justify-content: space-between;
    }

    div.demo
    {
        background-color: rgb(from var(--fore-color) r g b / 2%);
        padding: 10px;
    }
}

`);oe.register({pattern:"/:pathname*",match:async s=>{try{return s.document=new Ti(s.match.groups.pathname),await s.document.load(),s.page=new Zt(s.document),!0}catch{s.page=new mt}return!0},order:10});var se;class Gt extends L{constructor(){super();g(this,se,null);oe.addEventListener("didEnter",(t,i)=>{var n;i.page&&(i.page.layout?(i.page.layout!=((n=o(this,se))==null?void 0:n.constructor)&&(u(this,se,new i.page.layout),this.layoutSlot.content=o(this,se)),o(this,se).loadRoute(i)):(this.layoutSlot.content=i.page,u(this,se,null)))})}}se=new WeakMap,S(Gt,"template",{type:"div",id:"layoutRoot",$:[Ft,{type:"embed-slot",bind:"layoutSlot"}]});V.declare(`
#layoutRoot
{
    padding-top: var(--fixed-header-height);
}
`);function Di(){new Gt().mount("body"),oe.start()}Di();
