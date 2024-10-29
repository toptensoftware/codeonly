var ti=Object.defineProperty;var vt=r=>{throw TypeError(r)};var ii=(r,e,t)=>e in r?ti(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var C=(r,e,t)=>ii(r,typeof e!="symbol"?e+"":e,t),Xe=(r,e,t)=>e.has(r)||vt("Cannot "+t);var o=(r,e,t)=>(Xe(r,e,"read from private field"),t?t.call(r):e.get(r)),g=(r,e,t)=>e.has(r)?vt("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),p=(r,e,t,i)=>(Xe(r,e,"write to private field"),i?i.call(r,t):e.set(r,t),t),S=(r,e,t)=>(Xe(r,e,"access private method"),t);var we=(r,e,t,i)=>({set _(n){p(r,e,n,t)},get _(){return o(r,e,i)}});(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();function Qe(r){return r.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}function it(r){return r instanceof Function&&!!r.prototype&&!!r.prototype.constructor}let ni=/^[a-zA-Z$][a-zA-Z0-9_$]*$/;function oe(r){return r.match(ni)?`.${r}`:`[${JSON.stringify(r)}]`}function si(r,e){r.loading?r.addEventListener("loaded",e,{once:!0}):e()}class V{constructor(e){this.html=e}}class ri{constructor(e){this.value=e}}function je(){let r=[],e="";function t(...y){for(let u=0;u<y.length;u++){let c=y[u];c.lines?r.push(...c.lines.map(v=>e+v)):Array.isArray(c)?r.push(...c.filter(v=>v!=null).map(v=>e+v)):r.push(...c.split(`
`).map(v=>e+v))}}function i(){e+="  "}function n(){e=e.substring(2)}function a(){return r.join(`
`)+`
`}function d(y){t("{"),i(),y(this),n(),t("}")}function h(...y){let u={pos:this.lines.length};return this.append(y),u.headerLineCount=this.lines.length-u.pos,u}function f(y,...u){this.lines.length==y.pos+y.headerLineCount?this.lines.splice(y.pos,y.headerLineCount):this.append(u)}return{append:t,enterCollapsibleBlock:h,leaveCollapsibleBlock:f,indent:i,unindent:n,braced:d,toString:a,lines:r,get isEmpty(){return r.length==0}}}class ut{constructor(){this.code=je(),this.code.closure=this,this.functions=[],this.locals=[],this.prologs=[],this.epilogs=[]}get isEmpty(){return this.code.isEmpty&&this.locals.length==0&&this.functions.every(e=>e.code.isEmpty)&&this.prologs.every(e=>e.isEmpty)&&this.epilogs.every(e=>e.isEmpty)}addProlog(){let e=je();return this.prologs.push(e),e}addEpilog(){let e=je();return this.epilogs.push(e),e}addLocal(e,t){this.locals.push({name:e,init:t})}addFunction(e,t){t||(t=[]);let i={name:e,args:t,code:new ut};return this.functions.push(i),i.code}getFunction(e){var t;return(t=this.functions.find(i=>i.name==e))==null?void 0:t.code}toString(){let e=je();return this.appendTo(e),e.toString()}appendTo(e){this.locals.length>0&&e.append(`let ${this.locals.map(t=>t.init?`${t.name} = ${t.init}`:t.name).join(", ")};`);for(let t of this.prologs)e.append(t);e.append(this.code);for(let t of this.functions)e.append(`function ${t.name}(${t.args.join(", ")})`),e.append("{"),e.indent(),t.code.appendTo(e),e.unindent(),e.append("}");for(let t of this.epilogs)e.append(t)}}function He(r){return r==null?"":(""+r).replace(/["'&<>]/g,function(e){switch(e){case'"':return"&quot;";case"&":return"&amp;";case"'":return"&#39;";case"<":return"&lt;";case">":return"&gt;"}})}class St{static rawText(e){return e instanceof V?e.html:He(e)}static renderToString(e){let t="";return e({write:function(i){t+=i}}),t}static renderComponentToString(e){let t="";return e.render({write:function(i){t+=i}}),t}static rawStyle(e){let t;return e instanceof V?t=e.html:t=He(e),t=t.trim(),t.endsWith(";")||(t+=";"),t}static rawNamedStyle(e,t){if(!t)return"";let i;return t instanceof V?i=t.html:i=He(t),i=i.trim(),i+=";",`${e}:${i}`}static createTextNode(e){if(e instanceof V){let t=document.createElement("SPAN");return t.innerHTML=e.html,t}else return document.createTextNode(e)}static setElementAttribute(e,t,i){i===void 0?e.removeAttribute(t):e.setAttribute(t,i)}static setElementText(e,t){t instanceof V?e.innerHTML=t.html:e.innerText=t}static setNodeText(e,t){if(t instanceof V){if(e.nodeType==1)return e.innerHTML=t.html,e;let i=document.createElement("SPAN");return i.innerHTML=t.html,e.replaceWith(i),i}else{if(e.nodeType==3)return e.nodeValue=t,e;let i=document.createTextNode(t);return e.replaceWith(i),i}}static setNodeClass(e,t,i){i?e.classList.add(t):e.classList.remove(t)}static setNodeStyle(e,t,i){i==null?e.style.removeProperty(t):e.style[t]=i}static setNodeDisplay(e,t,i){if(t===!0){i===null?e.style.removeProperty("display"):i!==void 0&&e.style.display!=i&&(e.style.display=i);return}else if(t===!1||t===null||t===void 0){let n=e.style.display;return e.style.display!="none"&&(e.style.display="none"),n??null}else if(typeof t=="string"){let n=e.style.display;return e.style.display!=t&&(e.style.display=t),n??null}}static replaceMany(e,t){var i;if((i=e==null?void 0:e[0])!=null&&i.parentNode){e[0].replaceWith(...t);for(let n=1;n<e.length;n++)e[n].remove()}}static addEventListener(e,t,i,n){function a(d){return n(e(),d)}return t.addEventListener(i,a),function(){t.removeEventListener(i,a)}}}function wt(r){let e=function(){var i;let t=(i=x.document)==null?void 0:i.createComment(r);return{get rootNode(){return t},get rootNodes(){return[t]},get isSingleRoot(){return!0},setMounted(n){},destroy(){},update(){},render(n){n.write(`<!--${He(r)}-->`)}}};return e.isSingleRoot=!0,e}var Re;const Ze=class Ze{constructor(e){g(this,Re,!1);this.branches=e.data,this.branch_constructors=[],this.context=e.context;for(let t of this.branches)t.nodeIndex!==void 0?this.branch_constructors.push(e.nodes[t.nodeIndex]):this.branch_constructors.push(wt(" IfBlock placeholder "));this.activeBranchIndex=-1,this.activeBranch=wt(" IfBlock placeholder ")()}static integrate(e,t){let i=[],n=[],a=!1,d=!0;for(let h=0;h<e.branches.length;h++){let f=e.branches[h],y={};if(i.push(y),f.condition instanceof Function?(y.condition=f.condition,a=!1):f.condition!==void 0?(y.condition=()=>f.condition,a=!!f.condition):(y.condition=()=>!0,a=!0),f.template!==void 0){let u=new se(f.template,t);u.isSingleRoot||(d=!1),y.nodeIndex=n.length,n.push(u)}}return delete e.branches,a||i.push({condition:()=>!0}),{isSingleRoot:d,nodes:n,data:i}}static transform(e){if(e.if===void 0)return e;let t={type:Ze,branches:[{template:e,condition:e.if}]};return delete e.if,t}static transformGroup(e){let t=null;for(let i=0;i<e.length;i++){let n=e[i];if(n.if)t={type:Ze,branches:[{condition:n.if,template:n}]},delete n.if,e.splice(i,1,t);else if(n.elseif){if(!t)throw new Error("template has 'elseif' without a preceeding condition");t.branches.push({condition:n.elseif,template:n}),delete n.elseif,e.splice(i,1),i--}else if(n.else!==void 0){if(!t)throw new Error("template has 'else' without a preceeding condition");t.branches.push({condition:!0,template:n}),delete n.else,t=null,e.splice(i,1),i--}else t=null}}destroy(){this.activeBranch.destroy()}update(){this.switchActiveBranch(),this.activeBranch.update()}render(e){this.activeBranch.render(e)}unbind(){var e,t;(t=(e=this.activeBranch).unbind)==null||t.call(e)}bind(){var e,t;(t=(e=this.activeBranch).bind)==null||t.call(e)}switchActiveBranch(e){let t=this.resolveActiveBranch();if(t!=this.activeBranchIndex){let i=this.activeBranch;this.activeBranchIndex=t,this.activeBranch=this.branch_constructors[t](),St.replaceMany(i.rootNodes,this.activeBranch.rootNodes),o(this,Re)&&(i.setMounted(!1),this.activeBranch.setMounted(!0)),i.destroy()}}resolveActiveBranch(){for(let e=0;e<this.branches.length;e++)if(this.branches[e].condition.call(this.context.model,this.context.model,this.context))return e;throw new Error("internal error, IfBlock didn't resolve to a branch")}setMounted(e){p(this,Re,e),this.activeBranch.setMounted(e)}get rootNodes(){return this.activeBranch.rootNodes}get rootNode(){return this.activeBranch.rootNode}};Re=new WeakMap;let nt=Ze;function oi(r,e){let t=Math.min(r.length,e.length),i=Math.max(r.length,e.length),n=0;for(;n<t&&r[n]==e[n];)n++;if(n==i)return[];if(n==r.length)return[{op:"insert",index:r.length,count:e.length-r.length}];let a=0;for(;a<t-n&&r[r.length-a-1]==e[e.length-a-1];)a++;if(a==r.length)return[{op:"insert",index:0,count:e.length-r.length}];if(n+a==r.length)return[{op:"insert",index:n,count:e.length-r.length}];if(n+a==e.length)return[{op:"delete",index:n,count:r.length-e.length}];let d=r.length-a,h=e.length-a,f=re(e,n,h),y=null,u=[],c=n,v=n;for(;c<h;){for(;c<h&&r[v]==e[c];)f.delete(e[c],c),c++,v++;let m=c,_=v;for(;v<d&&!f.has(r[v]);)v++;if(v>_){u.push({op:"delete",index:m,count:v-_});continue}for(y||(y=re(r,c,d));c<h&&!y.has(e[c]);)f.delete(e[c],c),c++;if(c>m){u.push({op:"insert",index:m,count:c-m});continue}break}if(c==h)return u;let l=0,R=new bt;for(;v<d;){let m=v;for(;v<d&&!f.has(r[v]);)v++;if(v>m){u.push({op:"delete",index:c,count:v-m});continue}for(;v<d&&f.consume(r[v])!==void 0;)R.add(r[v],l++),v++;v>m&&u.push({op:"store",index:c,count:v-m})}for(;c<h;){let m=c;for(;c<h&&!R.has(e[c]);)c++;if(c>m){u.push({op:"insert",index:m,count:c-m});continue}let _={op:"restore",index:c,count:0};for(u.push(_);c<h;){let z=R.consume(e[c]);if(z===void 0)break;_.count==0?(_.storeIndex=z,_.count=1):_.storeIndex+_.count==z?_.count++:(_={op:"restore",index:c,storeIndex:z,count:1},u.push(_)),c++}}return u;function re(m,_,z){let ye=new bt;for(let ve=_;ve<z;ve++)ye.add(m[ve],ve);return ye}}var X;class bt{constructor(){g(this,X,new Map)}add(e,t){let i=o(this,X).get(e);i?i.push(t):o(this,X).set(e,[t])}delete(e,t){let i=o(this,X).get(e);if(i){let n=i.indexOf(t);if(n>=0){i.splice(n,1);return}}throw new Error("key/value pair not found")}consume(e){let t=o(this,X).get(e);if(!(!t||t.length==0))return t.shift()}has(e){return o(this,X).has(e)}}X=new WeakMap;var _e,U,q,b,rt,Je,Q,de,he,ce,ae,Et,ot,kt,at,Ct,lt,Lt,dt,le;const xe=class xe{constructor(e){g(this,b);g(this,_e);g(this,U);g(this,q,!1);g(this,Q);g(this,de);g(this,he);g(this,ce);var t,i;this.itemConstructor=e.data.itemConstructor,this.outer=e.context,this.items=e.data.template.items,this.condition=e.data.template.condition,this.itemKey=e.data.template.itemKey,this.emptyConstructor=e.nodes.length?e.nodes[0]:null,this.itemDoms=[],p(this,_e,(t=x.document)==null?void 0:t.createComment(" enter foreach block ")),p(this,U,(i=x.document)==null?void 0:i.createComment(" leave foreach block ")),this.itemConstructor.isSingleRoot?(p(this,Q,S(this,b,Ct)),p(this,he,S(this,b,Lt)),p(this,de,S(this,b,lt)),p(this,ce,S(this,b,dt))):(p(this,Q,S(this,b,Et)),p(this,he,S(this,b,kt)),p(this,de,S(this,b,ot)),p(this,ce,S(this,b,at)))}static integrate(e,t){let i={itemConstructor:t.compileTemplate(e.template),template:{items:e.items,condition:e.condition,itemKey:e.itemKey}},n;return e.empty&&(n=[new se(e.empty,t)]),delete e.template,delete e.items,delete e.condition,delete e.itemKey,delete e.empty,{isSingleRoot:!1,data:i,nodes:n}}static transform(e){if(e.foreach===void 0)return e;let t;return e.foreach instanceof Function||Array.isArray(e.foreach)?(t={type:xe,template:e,items:e.foreach},delete e.foreach):(t=Object.assign({},e.foreach,{type:xe,template:e}),delete e.foreach),t}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1].foreach!==void 0&&(e[t-1]=xe.transform(e[t-1])),e[t-1].type===xe&&!e[t-1].else&&(delete e[t].else,e[t-1].empty=e[t],e.splice(t,1),t--))}onObservableUpdate(e,t,i){let n={outer:this.outer};if(i==0&&t==0){let a=this.observableItems[e],d=[a],h=null;this.itemKey&&(n.model=a,h=[this.itemKey.call(a,a,n)]),S(this,b,le).call(this,d,h,e,0,1)}else{let a=null,d=this.observableItems.slice(e,e+i);this.itemKey&&(a=d.map(h=>(n.model=h,this.itemKey.call(h,h,n)))),i&&t?S(this,b,rt).call(this,e,t,d,a):t!=0?o(this,he).call(this,e,t):i!=0&&o(this,Q).call(this,d,a,e,0,i),S(this,b,Je).call(this)}}get rootNodes(){let e=this.emptyDom?this.emptyDom.rootNodes:[];if(this.itemConstructor.isSingleRoot)return[o(this,_e),...this.itemDoms.map(t=>t.rootNode),...e,o(this,U)];{let t=[o(this,_e)];for(let i=0;i<this.itemDoms.length;i++)t.push(...this.itemDoms[i].rootNodes);return t.push(...e),t.push(o(this,U)),t}}setMounted(e){p(this,q,e),be(this.itemDoms,e)}update(){let e;this.items instanceof Function?e=this.items.call(this.outer.model,this.outer.model,this.outer):e=this.items,e=e??[],this.observableItems!=null&&this.observableItems!=e&&this.observableItems.removeListener(this._onObservableUpdate),Array.isArray(e)&&e.isObservable&&this.observableItems!=e&&(this._onObservableUpdate=this.onObservableUpdate.bind(this),this.observableItems=e,this.observableItems.addListener(this._onObservableUpdate),o(this,he).call(this,0,this.itemDoms.length),this.itemsLoaded=!1);let t={outer:this.outer},i=null;if(this.observableItems||this.condition&&(e=e.filter(n=>(t.model=n,this.condition.call(n,n,t)))),this.itemKey&&(i=e.map(n=>(t.model=n,this.itemKey.call(n,n,t)))),!this.itemsLoaded){this.itemsLoaded=!0,o(this,Q).call(this,e,i,0,0,e.length),S(this,b,Je).call(this);return}this.observableItems||S(this,b,rt).call(this,0,this.itemDoms.length,e,i)}render(e){e.write("<!-- enter foreach block -->");for(let t=0;t<this.itemDoms.length;t++)this.itemDoms[t].render(e);e.write("<!-- leave foreach block -->")}bind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.bind)==null||t.call(e)}unbind(){var e,t;(t=(e=this.emptyDom)==null?void 0:e.unbind)==null||t.call(e)}destroy(){this.observableItems!=null&&(this.observableItems.removeListener(this._onObservableUpdate),this.observableItems=null),Ve(this.itemDoms),this.itemDoms=null}};_e=new WeakMap,U=new WeakMap,q=new WeakMap,b=new WeakSet,rt=function(e,t,i,n){let a=e+t,d;e==0&&t==this.itemDoms.length?d=this.itemDoms:d=this.itemDoms.slice(e,a);let h;if(n?h=oi(d.map(m=>m.context.key),n):i.length>d.length?h=[{op:"insert",index:d.length,count:i.length-d.length}]:i.length<d.length?h=[{op:"delete",index:i.length,count:d.length-i.length}]:h=[],h.length==0){S(this,b,le).call(this,i,n,e,0,t);return}let f=[],y=[],u={insert:v,delete:l,store:R,restore:re},c=0;for(let m of h)m.index>c&&(S(this,b,le).call(this,i,n,e+c,c,m.index-c),c=m.index),u[m.op].call(this,m);c<i.length&&S(this,b,le).call(this,i,n,e+c,c,i.length-c),o(this,q)&&be(y,!1),Ve(y),S(this,b,Je).call(this);function v(m){c+=m.count;let _=Math.min(y.length,m.count);_&&(o(this,de).call(this,m.index+e,y.splice(0,_)),S(this,b,le).call(this,i,n,m.index+e,m.index,_)),_<m.count&&o(this,Q).call(this,i,n,m.index+e+_,m.index+_,m.count-_)}function l(m){y.push(...o(this,ce).call(this,m.index+e,m.count))}function R(m){f.push(...o(this,ce).call(this,m.index+e,m.count))}function re(m){c+=m.count,o(this,de).call(this,m.index+e,f.slice(m.storeIndex,m.storeIndex+m.count)),S(this,b,le).call(this,i,n,m.index+e,m.index,m.count)}},Je=function(){if(this.itemDoms.length==0)!this.emptyDom&&this.emptyConstructor&&(this.emptyDom=this.emptyConstructor(),o(this,b,ae)&&o(this,U).before(...this.emptyDom.rootNodes),o(this,q)&&this.emptyDom.setMounted(!0)),this.emptyDom&&this.emptyDom.update();else if(this.emptyDom){if(o(this,b,ae))for(var e of this.emptyDom.rootNodes)e.remove();o(this,q)&&this.emptyDome.setMounted(!1),this.emptyDom.destroy(),this.emptyDom=null}},Q=new WeakMap,de=new WeakMap,he=new WeakMap,ce=new WeakMap,ae=function(){var e;return((e=o(this,U))==null?void 0:e.parentNode)!=null},Et=function(e,t,i,n,a){let d=[];for(let h=0;h<a;h++){let f={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(f))}S(this,b,ot).call(this,i,d),o(this,q)&&be(d,!0)},ot=function(e,t){if(this.itemDoms.splice(e,0,...t),o(this,b,ae)){let i=[];t.forEach(a=>i.push(...a.rootNodes));let n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNodes[0]:n=o(this,U),n.before(...i)}},kt=function(e,t){let i=S(this,b,at).call(this,e,t);o(this,q)&&be(i,!1),Ve(i)},at=function(e,t){if(o(this,b,ae))for(let i=0;i<t;i++){let n=this.itemDoms[e+i].rootNodes;for(let a=0;a<n.length;a++)n[a].remove()}return this.itemDoms.splice(e,t)},Ct=function(e,t,i,n,a){let d=[];for(let h=0;h<a;h++){let f={outer:this.outer,model:e[n+h],key:t==null?void 0:t[n+h],index:i+h};d.push(this.itemConstructor(f))}S(this,b,lt).call(this,i,d),o(this,q)&&be(d,!0)},lt=function(e,t){if(this.itemDoms.splice(e,0,...t),o(this,b,ae)){let i=t.map(a=>a.rootNode),n;e+t.length<this.itemDoms.length?n=this.itemDoms[e+t.length].rootNode:n=o(this,U),n.before(...i)}},Lt=function(e,t){let i=S(this,b,dt).call(this,e,t);o(this,q)&&be(i,!1),Ve(i)},dt=function(e,t){if(o(this,b,ae))for(let i=0;i<t;i++)this.itemDoms[e+i].rootNode.remove();return this.itemDoms.splice(e,t)},le=function(e,t,i,n,a){for(let d=0;d<a;d++){let h=this.itemDoms[i+d];h.context.key=t==null?void 0:t[n+d],h.context.index=i+d,h.context.model=e[n+d],h.rebind(),h.update()}};let st=xe;function Ve(r){for(let e=r.length-1;e>=0;e--)r[e].destroy()}function be(r,e){for(let t=r.length-1;t>=0;t--)r[t].setMounted(e)}var A,H,T,pe,D,ue,Se,K,ee,Ie,ct,Ee;const Ne=class Ne{constructor(e){g(this,Ie);g(this,A);g(this,H);g(this,T);g(this,pe);g(this,D);g(this,ue);g(this,Se);g(this,K);g(this,ee,!0);g(this,Ee);var t,i;p(this,A,e.context),p(this,Se,e.nodes[1]),p(this,pe,(t=x.document)==null?void 0:t.createTextNode("")),p(this,ue,(i=x.document)==null?void 0:i.createTextNode("")),p(this,D,[]),p(this,ee,e.data.ownsContent??!0),e.nodes[0]?this.content=e.nodes[0]():this.content=e.data.content}static integrate(e,t){let i=null;e.content&&typeof e.content=="object"&&(i=e.content,delete e.content);let n={isSingleRoot:!1,data:{ownsContent:e.ownsContent??!0,content:e.content},nodes:[i?new se(i,t):null,e.placeholder?new se(e.placeholder,t):null]};return delete e.content,delete e.placeholder,delete e.ownsContent,n}static transform(e){return e instanceof Function&&!it(e)?{type:Ne,content:e}:(e.type=="embed-slot"&&(e.type=Ne),e)}static transformGroup(e){for(let t=1;t<e.length;t++)e[t].else!==void 0&&(e[t-1]=Ne.transform(e[t-1]),e[t-1].type===Ne&&!e[t-1].placeholder&&(delete e[t].else,e[t-1].placeholder=e[t],e.splice(t,1),t--))}get rootNodes(){return[o(this,pe),...o(this,D),o(this,ue)]}get isSingleRoot(){return!1}get ownsContent(){return o(this,ee)}set ownsContent(e){p(this,ee,e)}get content(){return o(this,H)}set content(e){p(this,H,e),o(this,H)instanceof Function?this.replaceContent(o(this,H).call(o(this,A).model,o(this,A).model,o(this,A))):this.replaceContent(o(this,H))}update(){o(this,H)instanceof Function&&this.replaceContent(o(this,H).call(o(this,A).model,o(this,A).model,o(this,A)))}bind(){var e,t;o(this,K)&&((t=(e=o(this,T))==null?void 0:e.bind)==null||t.call(e))}unbind(){var e,t;o(this,K)&&((t=(e=o(this,T))==null?void 0:e.unbind)==null||t.call(e))}get isAttached(){}setMounted(e){var t,i;p(this,Ee,e),(i=(t=o(this,T))==null?void 0:t.setMounted)==null||i.call(t,e)}replaceContent(e){var t,i,n,a,d,h;if(!(e==o(this,T)||!e&&o(this,K))){if(o(this,Ie,ct)){let f=o(this,pe).nextSibling;for(;f!=o(this,ue);){let y=f.nextSibling;f.remove(),f=y}}if(o(this,Ee)&&((i=(t=o(this,T))==null?void 0:t.setMounted)==null||i.call(t,!1)),p(this,D,[]),o(this,ee)&&((a=(n=o(this,T))==null?void 0:n.destroy)==null||a.call(n)),p(this,T,e),p(this,K,!1),!e)o(this,Se)&&(p(this,T,o(this,Se).call(this,o(this,A))),p(this,K,!0),p(this,D,o(this,T).rootNodes));else if(e.rootNodes!==void 0)p(this,D,e.rootNodes);else if(Array.isArray(e))p(this,D,e);else if(x.Node!==void 0&&e instanceof x.Node)p(this,D,[e]);else if(e instanceof V){let f=x.document.createElement("span");f.innerHTML=e.html,p(this,D,[...f.childNodes])}else if(typeof e=="string")p(this,D,[x.document.createTextNode(e)]);else if(e.render)p(this,D,[]);else throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");o(this,Ie,ct)&&o(this,ue).before(...o(this,D)),o(this,Ee)&&((h=(d=o(this,T))==null?void 0:d.setMounted)==null||h.call(d,!0))}}destroy(){var e,t;o(this,ee)&&((t=(e=o(this,T))==null?void 0:e.destroy)==null||t.call(e))}render(e){var t,i;o(this,T)&&((i=(t=o(this,T)).render)==null||i.call(t,e))}};A=new WeakMap,H=new WeakMap,T=new WeakMap,pe=new WeakMap,D=new WeakMap,ue=new WeakMap,Se=new WeakMap,K=new WeakMap,ee=new WeakMap,Ie=new WeakSet,ct=function(){var e;return((e=o(this,pe))==null?void 0:e.parentNode)!=null},Ee=new WeakMap;let ht=Ne;class pt{static register(e){this.plugins.push(e)}static transform(e){for(let t of this.plugins)t.transform&&(e=t.transform(e));return e}static transformGroup(e){var t;for(let i of this.plugins)(t=i.transformGroup)==null||t.call(i,e)}}C(pt,"plugins",[st,ht,nt]);class se{constructor(e,t){if(Array.isArray(e)&&(e={$:e}),e._&&!e.type&&(e.type=e._,delete e._),e=pt.transform(e),it(e)&&(e={type:e}),this.template=e,it(e.type))e.type.integrate?this.kind="integrated":this.kind="component";else if(typeof e=="string")this.kind="text";else if(e instanceof V){if(this.kind="html",this.html=e.html,x.document){let i=x.document.createElement("div");i.innerHTML=e.html,this.nodes=[...i.childNodes],this.nodes.forEach(n=>n.remove())}}else e instanceof Function?this.kind="dynamic_text":e.type==="comment"?this.kind="comment":e.type===void 0?this.kind="fragment":this.kind="element";if(this.kind==="integrated"&&(e.$&&!e.content&&(e.content=e.$,delete e.$),this.integrated=this.template.type.integrate(this.template,t)),this.kind=="element"&&e.$&&!e.text&&(typeof e.$=="string"||e.$ instanceof V)&&(e.text=e.$,delete e.$),this.kind=="element"||this.kind=="fragment")e.$&&!e.childNodes&&(e.childNodes=e.$,delete e.$),e.childNodes?(Array.isArray(e.childNodes)?e.childNodes=e.childNodes.flat():e.childNodes=[e.childNodes],e.childNodes.forEach(i=>{i._&&!i.type&&(i.type=i._,delete i._)}),pt.transformGroup(e.childNodes),this.childNodes=this.template.childNodes.map(i=>new se(i,t))):this.childNodes=[];else if(this.isComponent)e.$&&!e.content&&(e.content=e.$,delete e.$);else if(e.childNodes)throw new Error("childNodes only supported on element and fragment nodes")}get isSingleRoot(){return this.isFragment?this.childNodes.length==1&&this.childNodes[0].isSingleRoot:this.isComponent?this.template.type.isSingleRoot:this.isIntegrated?this.integrated.isSingleRoot:this.kind=="html"?this.nodes.length==1:!0}get isComponent(){return this.kind==="component"}get isFragment(){return this.kind==="fragment"}get isIntegrated(){return this.kind==="integrated"}*enumLocalNodes(){if(this.isFragment||(yield this),this.childNodes)for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumLocalNodes()}spreadChildDomNodes(){return Array.from(e(this)).filter(t=>t.length>0).join(", ");function*e(t){for(let i=0;i<t.childNodes.length;i++)yield t.childNodes[i].spreadDomNodes()}}spreadDomNodes(){return Array.from(this.enumAllNodes()).join(", ")}*enumAllNodes(){switch(this.kind){case"fragment":for(let e=0;e<this.childNodes.length;e++)yield*this.childNodes[e].enumAllNodes();break;case"component":case"integrated":this.isSingleRoot?yield`${this.name}.rootNode`:yield`...${this.name}.rootNodes`;break;case"html":this.nodes.length>0&&(this.nodes.length>1?yield`...${this.name}`:yield`${this.name}`);break;default:yield this.name}}}function ai(r,e){let t=1,i=1,n=[],a=null,d=new se(r,e),h=new Map;return{code:y(d,!0).toString(),isSingleRoot:d.isSingleRoot,refs:n};function y(u,c){let v={emit_text_node:ve,emit_html_node:Jt,emit_dynamic_text_node:Wt,emit_comment_node:Zt,emit_fragment_node:Xt,emit_element_node:Qt,emit_integrated_node:Gt,emit_component_node:Yt},l=new ut;l.create=l.addFunction("create").code,l.bind=l.addFunction("bind").code,l.update=l.addFunction("update").code,l.unbind=l.addFunction("unbind").code,l.setMounted=l.addFunction("setMounted",["mounted"]).code,l.destroy=l.addFunction("destroy").code;let R;c&&(R=l.addFunction("rebind").code);let re=new Map;c&&(a=l,a.code.append("let model = context.model;"),a.code.append("let document = env.document;")),l.code.append("create();"),l.code.append("bind();"),l.code.append("update();"),ye(u),l.bind.closure.isEmpty||(l.create.append("bind();"),l.destroy.closure.addProlog().append("unbind();"));let m=[];return u.isSingleRoot&&m.push(`  get rootNode() { return ${u.spreadDomNodes()}; },`),c?(m.push("  context,"),u==d&&h.forEach((s,w)=>m.push(`  get ${w}() { return ${s}; },`)),l.getFunction("bind").isEmpty?R.append("model = context.model"):(R.append("if (model != context.model)"),R.braced(()=>{R.append("unbind();"),R.append("model = context.model"),R.append("bind();")})),m.push("  rebind,")):(m.push("  bind,"),m.push("  unbind,")),l.code.append(["return { ","  update,","  destroy,","  setMounted,",`  get rootNodes() { return [ ${u.spreadDomNodes()} ]; },`,`  isSingleRoot: ${u.isSingleRoot},`,...m,"};"]),l;function _(s){s.template.export?a.addLocal(s.name):l.addLocal(s.name)}function z(){l.update.temp_declared||(l.update.temp_declared=!0,l.update.append("let temp;"))}function ye(s){s.name=`n${t++}`,v[`emit_${s.kind}_node`](s)}function ve(s){_(s),l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`)}function Jt(s){s.nodes.length!=0&&(_(s),s.nodes.length==1?(l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`),n.push(s.nodes[0])):(l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`),n.push(s.nodes)))}function Wt(s){_(s);let w=`p${i++}`;l.addLocal(w),l.create.append(`${s.name} = helpers.createTextNode("");`),z(),l.update.append(`temp = ${Z(n.length)};`),l.update.append(`if (temp !== ${w})`),l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${w} = ${Z(n.length)});`),n.push(s.template)}function Zt(s){if(_(s),s.template.text instanceof Function){let w=`p${i++}`;l.addLocal(w),l.create.append(`${s.name} = document.createComment("");`),z(),l.update.append(`temp = ${Z(n.length)};`),l.update.append(`if (temp !== ${w})`),l.update.append(`  ${s.name}.nodeValue = ${w} = temp;`),n.push(s.template.text)}else l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`)}function Gt(s){let w=[],k=!1;if(s.integrated.nodes)for(let $=0;$<s.integrated.nodes.length;$++){let N=s.integrated.nodes[$];if(!N){w.push(null);continue}N.name=`n${t++}`;let E=y(N,!1);E.getFunction("bind").isEmpty||(k=!0);let yt=`${N.name}_constructor_${$+1}`,ei=l.addFunction(yt,[]);E.appendTo(ei.code),w.push(yt)}l.update.append(`${s.name}.update()`),k&&(l.bind.append(`${s.name}.bind()`),l.unbind.append(`${s.name}.unbind()`));let L=-1;s.integrated.data&&(L=n.length,n.push(s.integrated.data)),_(s),l.create.append(`${s.name} = new refs[${n.length}]({`,"  context,",`  data: ${s.integrated.data?`refs[${L}]`:"null"},`,`  nodes: [ ${w.join(", ")} ],`,"});"),n.push(s.template.type),l.setMounted.append(`${s.name}.setMounted(mounted);`),l.destroy.append(`${s.name}?.destroy();`),l.destroy.append(`${s.name} = null;`);for(let $ of Object.keys(s.template))if(!Ye(s,$))throw new Error(`Unknown element template key: ${$}`)}function Yt(s){_(s),l.create.append(`${s.name} = new refs[${n.length}]();`),n.push(s.template.type);let w=new Set(s.template.type.slots??[]),k=s.template.update==="auto",L=!1;l.setMounted.append(`${s.name}.setMounted(mounted);`),l.destroy.append(`${s.name}?.destroy();`),l.destroy.append(`${s.name} = null;`);for(let $ of Object.keys(s.template)){if(Ye(s,$)||$=="update")continue;if(w.has($)){if(s.template[$]===void 0)continue;let E=new se(s.template[$],e);ye(E),E.isSingleRoot?l.create.append(`${s.name}${oe($)}.content = ${E.name};`):l.create.append(`${s.name}${oe($)}.content = [${E.spreadDomNodes()}];`);continue}let N=typeof s.template[$];if(N=="string"||N=="number"||N=="boolean")l.create.append(`${s.name}${oe($)} = ${JSON.stringify(s.template[$])}`);else if(N==="function"){k&&!L&&(L=`${s.name}_mod`,l.update.append(`let ${L} = false;`));let E=`p${i++}`;l.addLocal(E);let gt=n.length;z(),l.update.append(`temp = ${Z(gt)};`),l.update.append(`if (temp !== ${E})`),k&&(l.update.append("{"),l.update.append(`  ${L} = true;`)),l.update.append(`  ${s.name}${oe($)} = ${E} = temp;`),k&&l.update.append("}"),n.push(s.template[$])}else{let E=s.template[$];E instanceof ri&&(E=E.value),l.create.append(`${s.name}${oe($)} = refs[${n.length}];`),n.push(E)}}s.template.update&&(typeof s.template.update=="function"?(l.update.append(`if (${Z(n.length)})`),l.update.append(`  ${s.name}.update();`),n.push(s.template.update)):k?L&&(l.update.append(`if (${L})`),l.update.append(`  ${s.name}.update();`)):l.update.append(`${s.name}.update();`))}function Xt(s){mt(s)}function Qt(s){var L;let w=l.current_xmlns,k=s.template.xmlns;k===void 0&&s.template.type=="svg"&&(k="http://www.w3.org/2000/svg"),k==null&&(k=l.current_xmlns),_(s),k?(l.current_xmlns=k,l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(k)}, ${JSON.stringify(s.template.type)});`)):l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`),l.destroy.append(`${s.name} = null;`);for(let $ of Object.keys(s.template))if(!Ye(s,$)){if($=="id"){G(s.template.id,N=>`${s.name}.setAttribute("id", ${N});`);continue}if($=="class"){G(s.template.class,N=>`${s.name}.setAttribute("class", ${N});`);continue}if($.startsWith("class_")){let N=Qe($.substring(6));G(s.template[$],E=>`helpers.setNodeClass(${s.name}, ${JSON.stringify(N)}, ${E})`);continue}if($=="style"){G(s.template.style,N=>`${s.name}.setAttribute("style", ${N});`);continue}if($.startsWith("style_")){let N=Qe($.substring(6));G(s.template[$],E=>`helpers.setNodeStyle(${s.name}, ${JSON.stringify(N)}, ${E})`);continue}if($=="display"){if(s.template.display instanceof Function)l.addLocal(`${s.name}_prev_display`),G(s.template[$],N=>`${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${N}, ${s.name}_prev_display)`);else if(typeof s.template.display=="string")l.create.append(`${s.name}.style.display = '${s.template.display}';`);else if(s.template.display===!1||s.template.display===null||s.template.display===void 0)l.create.append(`${s.name}.style.display = 'none';`);else if(s.template.display!==!0)throw new Error("display property must be set to string, true, false, or null");continue}if($.startsWith("attr_")){let N=$.substring(5);if(N=="style"||N=="class"||N=="id")throw new Error(`Incorrect attribute: use '${N}' instead of '${$}'`);l.current_xmlns||(N=Qe(N)),G(s.template[$],E=>`helpers.setElementAttribute(${s.name}, ${JSON.stringify(N)}, ${E})`);continue}if($=="text"){s.template.text instanceof Function?G(s.template.text,N=>`helpers.setElementText(${s.name}, ${N})`):s.template.text instanceof V&&l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`),typeof s.template.text=="string"&&l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);continue}throw new Error(`Unknown element template key: ${$}`)}mt(s),(L=s.childNodes)!=null&&L.length&&l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`),l.current_xmlns=w}function mt(s){if(s.childNodes)for(let w=0;w<s.childNodes.length;w++)ye(s.childNodes[w])}function Ye(s,w){if(Kt(w))return!0;if(w=="export"){if(typeof s.template.export!="string")throw new Error("'export' must be a string");if(h.has(s.template.export))throw new Error(`duplicate export name '${s.template.export}'`);return h.set(s.template.export,s.name),!0}if(w=="bind"){if(typeof s.template.bind!="string")throw new Error("'bind' must be a string");if(re.has(s.template.export))throw new Error(`duplicate bind name '${s.template.bind}'`);return re.set(s.template.bind,!0),l.bind.append(`model${oe(s.template.bind)} = ${s.name};`),l.unbind.append(`model${oe(s.template.bind)} = null;`),!0}if(w.startsWith("on_")){let k=w.substring(3);if(!(s.template[w]instanceof Function))throw new Error(`event handler for '${w}' is not a function`);s.listenerCount||(s.listenerCount=0),s.listenerCount++;let L=`${s.name}_ev${s.listenerCount}`;return l.addLocal(L),l.create.append(`${L} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(k)}, refs[${n.length}]);`),n.push(s.template[w]),l.destroy.append(`${L}?.();`),l.destroy.append(`${L} = null;`),!0}return w=="debug_create"?(typeof s.template[w]=="function"?(l.create.append(`if (${Z(n.length)})`),l.create.append("  debugger;"),n.push(s.template[w])):s.template[w]&&l.create.append("debugger;"),!0):w=="debug_update"?(typeof s.template[w]=="function"?(l.update.append(`if (${Z(n.length)})`),l.update.append("  debugger;"),n.push(s.template[w])):s.template[w]&&l.update.append("debugger;"),!0):w=="debug_render"}function Kt(s){return s=="type"||s=="childNodes"||s=="xmlns"}function Z(s){return`refs[${s}].call(model, model, context)`}function G(s,w){if(s instanceof Function){let k=`p${i++}`;l.addLocal(k),w(),z(),l.update.append(`temp = ${Z(n.length)};`),l.update.append(`if (temp !== ${k})`),l.update.append(`  ${w(k+" = temp")};`),n.push(s)}else l.create.append(w(JSON.stringify(s)))}}}let li=1;function Tt(r,e){e=e??{},e.compileTemplate=Tt;let t=ai(r,e),i=new Function("env","refs","helpers","context",t.code),n=function(a){return a||(a={}),a.$instanceId=li++,i(x,t.refs,St,a??{})};return n.isSingleRoot=t.isSingleRoot,n}let x=null;var te;class di extends EventTarget{constructor(){super();g(this,te,0);this.browser=!1}enterLoading(){we(this,te)._++,o(this,te)==1&&this.dispatchEvent(new Event("loading"))}leaveLoading(){we(this,te)._--,o(this,te)==0&&this.dispatchEvent(new Event("loaded"))}get loading(){return o(this,te)!=0}async load(t){this.enterLoading();try{return await t()}finally{this.leaveLoading()}}}te=new WeakMap;class hi extends di{constructor(){super(),this.browser=!0,this.document=document,this.compileTemplate=Tt,this.window=window,this.requestAnimationFrame=window.requestAnimationFrame.bind(window),this.Node=Node}}function ci(r){x=r}typeof document<"u"&&ci(new hi);let $t=[],We=[],Fe=null;class J{static declare(e){$t.push(e),We.push(e),x.browser&&x.requestAnimationFrame(pi)}static get all(){return $t.join(`
`)}}function pi(){We.length!=0&&(Fe==null&&(Fe=document.createElement("style")),Fe.innerHTML+=We.join(`
`),We=[],Fe.parentNode||document.head.appendChild(Fe))}let Ue=[],Ke=!1;function Mt(r,e){r&&(e=e??0,e!=0&&(Ke=!0),Ue.push({callback:r,order:e}),Ue.length==1&&x.requestAnimationFrame(function(){let t=Ue;Ke&&(t.sort((i,n)=>n.order-i.order),Ke=!1),Ue=[];for(let i=t.length-1;i>=0;i--)t[i].callback()}))}class ui{static compile(){return x.compileTemplate(...arguments)}}var P,ie,Ge;const Y=class Y extends EventTarget{constructor(){super();g(this,P);g(this,ie,0);g(this,Ge,!1);this.update=this.update.bind(this),this.invalidate=this.invalidate.bind(this)}static get compiledTemplate(){return this._compiledTemplate||(this._compiledTemplate=this.compileTemplate()),this._compiledTemplate}static compileTemplate(){return ui.compile(this.template)}static get isSingleRoot(){return this.compiledTemplate.isSingleRoot}init(){o(this,P)||p(this,P,new this.constructor.compiledTemplate({model:this}))}get dom(){return o(this,P)||this.init(),o(this,P)}get isSingleRoot(){return this.dom.isSingleRoot}get rootNode(){if(!this.isSingleRoot)throw new Error("rootNode property can't be used on multi-root template");return this.dom.rootNode}get rootNodes(){return this.dom.rootNodes}invalidate(){o(this,P)&&(this.invalid||(this.invalid=!0,Y.invalidate(this)))}validate(){this.invalid&&this.update()}static invalidate(t){this._invalidComponents.push(t),this._invalidComponents.length==1&&Mt(()=>{for(let i=0;i<this._invalidComponents.length;i++)this._invalidComponents[i].validate();this._invalidComponents=[]},Y.nextFrameOrder)}update(){o(this,P)&&(this.invalid=!1,this.dom.update())}async load(t){we(this,ie)._++,o(this,ie)==1&&(this.invalidate(),x.enterLoading(),this.dispatchEvent(new Event("loading")));try{return await t()}finally{we(this,ie)._--,o(this,ie)==0&&(this.invalidate(),this.dispatchEvent(new Event("loaded")),x.leaveLoading())}}get loading(){return o(this,ie)!=0}set loading(t){throw new Error("setting Component.loading not supported, use load() function")}render(t){this.dom.render(t)}destroy(){o(this,P)&&(o(this,P).destroy(),p(this,P,null))}onMount(){}onUnmount(){}setMounted(t){var i;(i=o(this,P))==null||i.setMounted(t),p(this,Ge,t),t?this.onMount():this.onUnmount()}mount(t){return typeof t=="string"&&(t=document.querySelector(t)),t.append(...this.rootNodes),this}unmount(){o(this,P)&&this.rootNodes.forEach(t=>t.remove())}};P=new WeakMap,ie=new WeakMap,Ge=new WeakMap,C(Y,"_compiledTemplate"),C(Y,"nextFrameOrder",-100),C(Y,"_invalidComponents",[]),C(Y,"template",{});let M=Y;class Dt{static embed(e){return{type:"embed-slot",content:e}}static h(e,t){return{type:`h${e}`,text:t}}static p(e){return{type:"p",text:e}}static a(e,t){return{type:"a",attr_href:e,text:t}}static raw(e){return new V(e)}}function fi(r){let e="^",t=r.length,i;for(let a=0;a<t;a++){i=!0;let d=r[a];if(d=="?")e+="[^\\/]";else if(d=="*")e+="[^\\/]+";else if(d==":"){a++;let h=a;for(;a<t&&n(r[a]);)a++;let f=r.substring(h,a);if(f.length==0)throw new Error("syntax error in url pattern: expected id after ':'");let y="[^\\/]+";if(r[a]=="("){a++,h=a;let u=0;for(;a<t;){if(r[a]=="(")u++;else if(r[a]==")"){if(u==0)break;u--}a++}if(a>=t)throw new Error("syntax error in url pattern: expected ')'");y=r.substring(h,a),a++}if(a<t&&r[a]=="*"||r[a]=="+"){let u=r[a];a++,r[a]=="/"?(e+=`(?<${f}>(?:${y}\\/)${u})`,a++):u=="*"?e+=`(?<${f}>(?:${y}\\/)*(?:${y})?\\/?)`:e+=`(?<${f}>(?:${y}\\/)*(?:${y})\\/?)`,i=!1}else e+=`(?<${f}>${y})`;a--}else d=="/"?(e+="\\"+d,a==r.length-1&&(e+="?")):".$^{}[]()|*+?\\/".indexOf(d)>=0?(e+="\\"+d,i=d!="/"):e+=d}return i&&(e+="\\/?"),e+="$",e;function n(a){return a>="a"&&a<="z"||a>="A"&&a<="Z"||a>="0"&&a<="9"||a=="_"||a=="$"}}class xt{constructor(e,t){this.el=e,this.targetClass=t,this.entered=!1,this.pendingTransitions=[],this.detecting=!1,this.transitioning=!1,this.el.addEventListener("transitionend",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitioncancel",this.onTransitionEndOrCancel.bind(this)),this.el.addEventListener("transitionrun",this.onTransitionRun.bind(this))}onTransitionEndOrCancel(e){let t=!1;for(let i=0;i<this.pendingTransitions.length;i++){let n=this.pendingTransitions[i];n.target==e.target&&n.propertyName==e.propertyName&&(this.pendingTransitions.splice(i,1),t=!0)}t&&this.pendingTransitions.length==0&&this.onTransitionsFinished()}onTransitionRun(e){this.detecting&&this.pendingTransitions.push({target:e.target,propertyName:e.propertyName})}detectTransitions(){this.transitioning=!0,this.detecting=!0,this.pendingTransitions=[],requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{this.detecting=!1,this.pendingTransitions.length==0&&this.onTransitionsFinished()})))}onTransitionsFinished(){this.el.classList.remove(`${this.targetClass}-start-enter`),this.el.classList.remove(`${this.targetClass}-start-leave`),this.el.classList.remove(`${this.targetClass}-enter`),this.el.classList.remove(`${this.targetClass}-leave`),this.entered?this.el.classList.add(this.targetClass):this.el.classList.remove(this.targetClass),this.transitioning=!1}enter(e){if(e){(this.transitioning||!this.entered)&&(this.entered=!0,this.onTransitionsFinished());return}this.entered||(this.entered=!0,this.detectTransitions(),this.el.classList.add(this.targetClass,`${this.targetClass}-enter`,`${this.targetClass}-start-enter`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-enter`)})))}leave(e){if(e){(this.transitioning||this.entered)&&(this.entered=!1,this.onTransitionsFinished());return}this.entered&&(this.entered=!1,this.detectTransitions(),this.el.classList.add(`${this.targetClass}-leave`,`${this.targetClass}-start-leave`),requestAnimationFrame(()=>requestAnimationFrame(()=>{this.el.classList.remove(`${this.targetClass}-start-leave`)})))}toggle(e){this.entered?this.leave():this.enter()}}class Nt{static get(){return{top:window.pageYOffset||document.documentElement.scrollTop,left:window.pageXOffset||document.documentElement.scrollLeft}}static set(e){e?window.scrollTo(e.left,e.top):window.scrollTo(0,0)}}var Be,I,O,fe,ke,Ce;class mi{constructor(e,t){g(this,Be);C(this,"urlMapper");g(this,I,null);g(this,O,null);g(this,fe,[]);g(this,ke,[]);g(this,Ce,!1);p(this,Be,e),e&&(this.navigate=e.navigate.bind(e),this.replace=e.navigate.bind(e),this.back=e.back.bind(e)),t&&this.register(t)}start(){return o(this,Be).start(this)}internalize(e){var t;return((t=this.urlMapper)==null?void 0:t.internalize(e))??new URL(e)}externalize(e){var t;return((t=this.urlMapper)==null?void 0:t.externalize(e))??new URL(e)}get current(){return o(this,I)}get pending(){return o(this,O)}addEventListener(e,t){o(this,fe).push({event:e,handler:t})}removeEventListener(e,t){let i=o(this,fe).findIndex(n=>n.event==e&&n.handler==t);i>=0&&o(this,fe).splice(i,1)}async dispatchEvent(e,t,i,n){for(let a of o(this,fe))if(a.event==e){let d=a.handler(i,n);if(t&&await Promise.resolve(d)==!1)return!1}return!0}async load(e,t,i){var a,d,h;i=i??{};let n=o(this,I);if(((a=o(this,I))==null?void 0:a.url.pathname)==e.pathname&&o(this,I).url.search==e.search){let f=(h=(d=o(this,I).handler).hashChange)==null?void 0:h.call(d,o(this,I),i);f!==void 0?i=f:i=Object.assign({},o(this,I),i)}if(i=Object.assign(i,{current:!1,url:e,pathname:e.pathname,state:t}),p(this,O,i),!i.match&&(i=await this.matchUrl(e,t,i),!i))return null;try{await this.tryLoad(i)!==!0&&p(this,O,null)}catch(f){throw this.dispatchCancelEvents(n,i),f}return o(this,O)!=i?(this.dispatchCancelEvents(n,i),null):(p(this,O,null),i)}dispatchCancelEvents(e,t){var i,n,a,d,h;(a=(i=o(this,I))==null?void 0:(n=i.handler).cancelLeave)==null||a.call(n,e,t),(h=(d=t.handler).cancelEnter)==null||h.call(d,e,t),this.dispatchEvent("cancel",!1,e,t)}async tryLoad(e){var n,a,d,h,f,y,u,c;let t=o(this,I),i;if(!(t&&(!await this.dispatchEvent("mayLeave",!0,t,e)||e!=o(this,O)||(i=(a=(n=t.handler).mayLeave)==null?void 0:a.call(n,t,e),await Promise.resolve(i)===!1)||e!=o(this,O)))&&(i=(h=(d=e.handler).mayEnter)==null?void 0:h.call(d,t,e),await Promise.resolve(i)!==!1&&e==o(this,O)&&await this.dispatchEvent("mayEnter",!0,t,e)&&e==o(this,O)))return t&&(t.current=!1),e.current=!0,p(this,I,e),t&&(this.dispatchEvent("didLeave",!1,t,e),(y=t==null?void 0:(f=t.handler).didLeave)==null||y.call(f,t,e)),(c=(u=e.handler).didEnter)==null||c.call(u,t,e),this.dispatchEvent("didEnter",!1,t,e),!0}async matchUrl(e,t,i){o(this,Ce)&&(o(this,ke).sort((n,a)=>(n.order??0)-(a.order??0)),p(this,Ce,!1));for(let n of o(this,ke)){if(n.pattern&&(i.match=i.pathname.match(n.pattern),!i.match))continue;let a=await Promise.resolve(n.match(i));if(a===!0||a==i)return i.handler=n,i;if(a===null)return null}return i.handler={},i}register(e){Array.isArray(e)||(e=[e]);for(let t of e)typeof t.pattern=="string"&&(t.pattern=new RegExp(fi(t.pattern))),o(this,ke).push(t);p(this,Ce,!0)}}Be=new WeakMap,I=new WeakMap,O=new WeakMap,fe=new WeakMap,ke=new WeakMap,Ce=new WeakMap;var Le,B,Te;class gi{constructor(){g(this,Le,0);g(this,B);g(this,Te,!1)}async start(e){p(this,B,e),x.document.body.addEventListener("click",a=>{let d=a.target.closest("a");if(d){let h=d.getAttribute("href"),f=new URL(h,x.window.location);if(f.origin==x.window.location.origin){try{f=o(this,B).internalize(f)}catch{return}if(this.navigate(f))return a.preventDefault(),!0}}}),x.window.addEventListener("popstate",async a=>{if(o(this,Te)){p(this,Te,!1);return}let d=o(this,Le)+1,h=o(this,B).internalize(x.window.location),f=a.state??{sequence:this.current.state.sequence+1};await this.load(h,f,{navMode:"pop"})||d==o(this,Le)&&(p(this,Te,!0),x.window.history.go(this.current.state.sequence-f.sequence))});let t=o(this,B).internalize(x.window.location),i=x.window.history.state??{sequence:0},n=await this.load(t,i,{navMode:"start"});return x.window.history.replaceState(i,null),n}get current(){return o(this,B).current}async load(e,t,i){return we(this,Le)._++,await o(this,B).load(e,t,i)}back(){this.current.state.sequence==0?(this.replace("/"),this.load("/",{sequence:0},{navMode:"replace"})):x.window.history.back()}replace(e){typeof e=="string"&&(e=new URL(e,o(this,B).internalize(x.window.location))),this.current.pathname=e.pathname,this.current.url=e,x.window.history.replaceState(this.current.state,"",o(this,B).externalize(e))}async navigate(e){typeof e=="string"&&(e=new URL(e,o(this,B).internalize(x.window.location)));let t=await this.load(e,{sequence:this.current.state.sequence+1},{navMode:"push"});return t&&(x.window.history.pushState(t.state,"",o(this,B).externalize(e)),t)}}Le=new WeakMap,B=new WeakMap,Te=new WeakMap;var W,j;class yi{constructor(e){g(this,W);g(this,j,{});p(this,W,e),x.window.history.scrollRestoration&&(x.window.history.scrollRestoration="manual");let t=x.window.sessionStorage.getItem("codeonly-view-states");t&&p(this,j,JSON.parse(t)),e.addEventListener("mayLeave",(i,n)=>(this.captureViewState(),!0)),e.addEventListener("mayEnter",(i,n)=>{n.viewState=o(this,j)[n.state.sequence]}),e.addEventListener("didEnter",(i,n)=>{if(n.navMode=="push"){for(let a of Object.keys(o(this,j)))parseInt(a)>n.state.sequence&&delete o(this,j)[a];this.saveViewStates()}si(x,()=>{Mt(()=>{var a,d;if(n.handler.restoreViewState?n.handler.restoreViewState(n.viewState,n):o(this,W).restoreViewState?(d=(a=o(this,W)).restoreViewState)==null||d.call(a,n.viewState,n):Nt.set(n.viewState),x.browser){let h=document.getElementById(n.url.hash.substring(1));h==null||h.scrollIntoView()}})})}),x.window.addEventListener("beforeunload",i=>{this.captureViewState()})}captureViewState(){var t,i;let e=o(this,W).current;e&&(e.handler.captureViewState?o(this,j)[e.state.sequence]=e.handler.captureViewState(e):o(this,W).captureViewState?o(this,j)[e.state.sequence]=(i=(t=o(this,W)).captureViewState)==null?void 0:i.call(t,e):o(this,j)[e.state.sequence]=Nt.get()),this.saveViewStates()}saveViewStates(){x.window.sessionStorage.setItem("codeonly-view-states",JSON.stringify(o(this,j)))}}W=new WeakMap,j=new WeakMap;class Pt extends M{}C(Pt,"template",{_:"header",id:"header",$:[{_:"a",class:"title",attr_href:"/",$:[{type:"img",attr_src:"/codeonly-logo.svg"},"CodeOnly"]},{_:"div",class:"buttons",$:[{type:"a",class:"subtle button",attr_href:"/sandbox",text:"Sandbox"},{type:"a",class:"subtle button",attr_href:"/guide/",text:"Guide"},{type:"input",attr_type:"checkbox",attr_checked:window.stylish.darkMode?"checked":void 0,class:"theme-switch",on_click:()=>window.stylish.toggleTheme()}]}]});J.declare(`
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
`);let ge=new mi(new gi);new yi(ge);class vi{constructor(e){this.pathname=e}load(){return x.load(async()=>{let e=this.pathname;(e==""||e.endsWith("/"))&&(e+="index");const t=await fetch(`/content/${e}.page`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.processMarkdown(await t.text())})}processMarkdown(e){this.frontmatter={},e=e.replace(/\r\n/g,`
`),this.markdown=e.replace(/^---([\s\S]*?)---\n/,(u,c)=>{for(let v of c.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))try{this.frontmatter[v[1]]=JSON.parse(v[2])}catch{this.frontmatter[v[1]]=v[2]}return""});let t=new commonmark.Parser;this.ast=t.parse(this.markdown);let i=this.ast.walker(),n,a=null,d="";this.headings=[];let h=[];for(;n=i.next();){if(n.entering&&n.node.type==="heading"&&n.node.level==2&&(a=n.node),a!=null&&n.node.type==="text"&&(d+=n.node.literal),!n.entering&&n.node==a){let u=wi(d);u.length>0&&(this.headings.push({node:n.node,text:d,id:u}),a=!1),d="",a=null}n.entering&&n.node.type=="code_block"&&h.push(n.node)}for(let u of this.headings){let c=new commonmark.Node("html_inline",u.node.sourcepos);c.literal=`<a class="hlink" href="#${u.id}">#</a>`,u.node.prependChild(c)}for(let u of h){let c=hljs.highlight(u.literal,{language:u.info,ignoreIllegals:!0}),v=`<pre><code class="hljs language-${c.language}">${c.value}</code></pre>`,l=new commonmark.Node("html_block",u.sourcepos);l.literal=v,u.insertBefore(l),u.unlink()}let f=new commonmark.HtmlRenderer,y=f.attrs;f.attrs=u=>{let c=y.call(f,...arguments);if(u.type=="heading"&&u.level==2){let v=this.headings.find(l=>l.node==u);v&&c.push(["id",v.id])}return c},this.html=f.render(this.ast)}}function wi(r){return r=r.toLowerCase(),r=r.replace(/[^\p{L}\p{N}]+/gu,"-"),r=r.replace(/-+/,"-"),r=r.replace(/^-|-$/g,""),r}class Ft extends M{}C(Ft,"template",{_:"header",id:"mobile-bar",$:[{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showPanel")),$:[{type:"svg",attr_width:"20",attr_height:"20",attr_viewBox:"0 -960 960 960",attr_preserveAspectRatio:"xMidYMid slice",attr_role:"img",$:{type:"path",attr_d:"M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"}}," Menu"]},{type:"button",class:"subtle muted",id:"side-panel-menu-button",on_click:e=>e.dispatchEvent(new Event("showSecondaryPanel")),text:"On this page ›"}]});J.declare(`
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
`);var Me;class Rt extends M{constructor(){super();g(this,Me)}set url(t){let i=new URL("toc",t).pathname;i!=o(this,Me)&&(p(this,Me,i),this.load())}load(){super.load(async()=>{this.error=!1;try{const t=await fetch(`/content${o(this,Me)}`);if(!t.ok)throw new Error(`Response status: ${t.status} - ${t.statusText}`);this.toc=await t.json()}catch(t){this.error=!0,console.error(t.message)}})}}Me=new WeakMap,C(Rt,"template",{_:"nav",id:"nav-main",$:[{foreach:t=>t.toc,$:[{type:"h5",text:t=>t.title},{type:"ul",$:{foreach:t=>t.pages,type:"li",$:{type:"a",attr_href:t=>t.url,text:t=>t.title}}}]}]});J.declare(`
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
`);var Oe;class bi extends EventTarget{constructor(){super(...arguments);g(this,Oe,null)}get document(){return o(this,Oe)}set document(t){p(this,Oe,t),this.dispatchEvent(new Event("documentChanged"))}}Oe=new WeakMap;new bi;var ze;class It extends M{constructor(){super();g(this,ze)}get inPageLinks(){return o(this,ze)}set inPageLinks(t){p(this,ze,t),this.invalidate()}hidePopupNav(){this.dispatchEvent(new Event("hidePopupNav"))}}ze=new WeakMap,C(It,"template",{type:"nav",id:"secondary-nav",on_click:t=>t.hidePopupNav(),$:[{if:t=>{var i;return((i=t.inPageLinks)==null?void 0:i.length)>0},$:Dt.h(6,"On This Page")},{type:"ul",$:{foreach:t=>t.inPageLinks,type:"li",$:{type:"a",attr_href:t=>`#${t.id}`,text:t=>t.text}}}]});J.declare(`
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

`);class Bt extends M{constructor(){super(),this.init(),this.showSidePanelTransition=new xt(this.rootNode,"show-side-panel"),this.showSecondaryPanelTransition=new xt(this.rootNode,"show-secondary-panel"),ge.addEventListener("mayLeave",()=>this.hidePanel())}loadRoute(e){this.url=e.url,this.page=e.page,this.invalidate()}showPanel(){this.showSidePanelTransition.enter(),this.showSecondaryPanelTransition.leave()}showSecondaryPanel(){this.showSecondaryPanelTransition.toggle(),this.showSidePanelTransition.leave()}hidePanel(){this.showSidePanelTransition.leave(),this.showSecondaryPanelTransition.leave()}}C(Bt,"template",{type:"div",id:"layoutDocumentation",$:[{type:Ft,on_showPanel:e=>e.showPanel(),on_showSecondaryPanel:e=>e.showSecondaryPanel()},{type:"div",id:"div-wrapper",$:[{type:"div",id:"backdrop",on_click:e=>e.hidePanel()},{type:"div",id:"div-lhs",$:{type:Rt,url:e=>e.url}},{type:"div",id:"div-center",$:{type:"embed-slot",content:e=>e.page}},{type:"div",id:"div-rhs",$:{type:It,inPageLinks:e=>{var t;return(t=e.page)==null?void 0:t.inPageLinks},on_hidePopupNav:e=>e.hidePanel()}}]}]});const et=720,tt=250;J.declare(`
:root
{
    --side-panel-width: ${tt}px;
    --max-content-width: ${et}px;
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


@media screen and (width < ${tt*2+et+25}px) 
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

@media screen and (width < ${tt+et+25}px) 
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



`);class Ot extends M{constructor(){super()}loadRoute(e){this.page=e.page,this.invalidate()}}C(Ot,"template",{type:"div",id:"layoutBare",$:{type:"embed-slot",content:e=>e.page}});J.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);class ft extends M{constructor(e){super(),this.url=e}}C(ft,"template",{type:"div",class:"center",$:[{type:"h1",class:"danger",text:"Page not found! 😟"},{type:"p",text:e=>`The page ${e.url} doesn't exist!`},{type:"p",$:{type:"a",attr_href:"/",text:"Return Home"}}]});ge.register({match:r=>(r.page=new ft(r.url),!0),order:1e3});class zt extends M{constructor(e){super(),this.document=e}get inPageLinks(){return this.document.headings}get layout(){var e,t;switch((t=(e=this.document)==null?void 0:e.frontmatter)==null?void 0:t.layout){case"bare":return Ot;default:return Bt}}}C(zt,"template",{type:"div",class:"article",$:e=>Dt.raw(e.document.html)});J.declare(`
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

`);ge.register({pattern:"/:pathname*",match:async r=>{try{return r.document=new vi(r.match.groups.pathname),await r.document.load(),r.page=new zt(r.document),!0}catch{r.page=new ft}return!0},order:10});var F,me;class qt extends M{constructor(){super();g(this,F);g(this,me,"");this.init(),window.stylish.addEventListener("darkModeChanged",i=>{o(this,F)&&o(this,F)._themeService.setTheme(i.darkMode?"vs-dark":"vs-light")}),require(["vs/editor/editor.main"],()=>{p(this,F,monaco.editor.create(this.editorContainer,{value:o(this,me),language:"javascript",theme:window.stylish.darkMode?"vs-dark":"vs-light"})),p(this,me,null),o(this,F).getModel().onDidChangeContent(i=>{this.dispatchEvent(new Event("input"))}),this.resizeEditor()}),new ResizeObserver(()=>{this.resizeEditor()}).observe(this.editorContainer)}resizeEditor(){o(this,F)&&o(this,F).layout()}get editor(){return o(this,F)}get value(){return o(this,F)?o(this,F).getValue():o(this,me)}set value(t){o(this,F)?o(this,F).setValue(t):p(this,me,t)}}F=new WeakMap,me=new WeakMap,C(qt,"template",{type:"div",class:"editorContainer",style:"width: 100%; height: 100%;",bind:"editorContainer"});let $e=`<html>
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
`,$i=`
<\/script>
</body>
</html>
`,_t=!1;function xi(){if(_t)return;_t=!0;let r=Array.from(document.querySelectorAll("link[rel=stylesheet]")).map(e=>`<link href="${e.getAttribute("href")}" rel="stylesheet">`).join(`
`);$e=$e.replace("##stylesheets##",r),$e=$e.replace("##patchlinecount##",($e.split(`
`).length-1).toString())}class At extends M{constructor(e){xi(),super(),this.script=e}get srcdoc(){return`${$e}${this.script}
        new Main().mount("body");
        ${$i}
        `}}C(At,"template",{_:"iframe",attr_srcdoc:e=>e.srcdoc});var qe;class jt extends M{constructor(){super();g(this,qe,"")}set script(t){p(this,qe,t),this.invalidate()}createIframe(){return new At(o(this,qe))}}qe=new WeakMap,C(jt,"template",{_:"div",id:"preview",$:{_:"embed-slot",content:t=>t.createIframe()}});J.declare(`
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
`);async function Ni(r){const t=new Blob([r]).stream().pipeThrough(new CompressionStream("gzip")),i=[];for await(const n of t)i.push(n);return await Vt(i)}async function _i(r){const t=new Blob([r]).stream().pipeThrough(new DecompressionStream("gzip")),i=[];for await(const a of t)i.push(a);const n=await Vt(i);return new TextDecoder().decode(n)}async function Vt(r){const t=await new Blob(r).arrayBuffer();return new Uint8Array(t)}async function Si(r){const e=await new Promise(t=>{const i=new FileReader;i.onload=()=>t(i.result),i.readAsDataURL(new Blob([r]))});return e.slice(e.indexOf(",")+1)}async function Ei(r){var e="data:application/octet-binary;base64,"+r;return await(await fetch(e)).arrayBuffer()}function ki(r){let e=`<html lang="en">
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
${r}
new Main().mount("body");
<\/script>
</body>
</html>
`;var t=document.createElement("a");t.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),t.setAttribute("download","codeonly.html"),t.style.display="none",document.body.appendChild(t),t.click(),document.body.removeChild(t)}let Ci=`class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;var De,Ae,Pe;class Ut extends M{constructor(t){super();g(this,De,!1);g(this,Ae,null);g(this,Pe,null);C(this,"showErrors",!0);this.init(),this.editor.value=(t==null?void 0:t.code)??Ci,this.preview.script=this.editor.value,this.onIFrameMessage=this.onIFrameMessage.bind(this),window.addEventListener("message",this.onIFrameMessage)}destroy(){window.removeEventListener("message",this.onIFrameMessage)}onIFrameMessage(t){t.data.action=="error"&&(this.error=`line: ${t.data.error.lineno} col: ${t.data.error.colno}: ${t.data.error.message}`)}get error(){return o(this,Ae)}set error(t){p(this,Ae,t),this.invalidate()}onCodeChange(){this.error=null,!o(this,De)&&(o(this,Pe)!=null&&clearTimeout(o(this,Pe)),p(this,Pe,setTimeout(()=>{p(this,De,!0),this.preview.script=this.editor.value,p(this,De,!1)},500)))}async onCopyLink(){if(navigator.clipboard){let t=new URL(window.location),i=JSON.stringify({code:this.editor.value});t.hash=await Si(await Ni(i)),navigator.clipboard.writeText(t.href),alert("Link copied to clipboard")}}onShowErrorsChanged(t){this.showErrors=t.target.checked,this.invalidate()}onDownload(){ki(this.editor.value)}}De=new WeakMap,Ae=new WeakMap,Pe=new WeakMap,C(Ut,"template",{type:"div",class:"sandbox",$:[{type:"div",class:"editor-container",$:[{type:qt,bind:"editor",on_input:t=>t.onCodeChange()},{_:"div",class:"error",display:t=>!!t.error&&t.showErrors,text:t=>t.error}]},{type:"div",class:"preview-container",$:[{type:jt,bind:"preview"},{type:"footer",$:[{type:"label",$:[{type:"input",attr_type:"checkbox",attr_checked:"checked",class:"switch",on_click:(t,i)=>t.onShowErrorsChanged(i)},"Show Errors"]},{type:"button",class:"subtle",text:"Copy Link",on_click:t=>t.onCopyLink()},{type:"button",class:"subtle",text:"Download",on_click:t=>t.onDownload()}]}]}]});J.declare(`
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
`);ge.register({pattern:"/sandbox",match:async r=>{let e=null;return r.url.hash.length>1&&(e=JSON.parse(await _i(await Ei(r.url.hash.substring(1))))),r.page=new Ut(e),!0}});var ne;class Ht extends M{constructor(){super();g(this,ne,null);ge.addEventListener("didEnter",(t,i)=>{var n;i.page&&(i.page.layout?(i.page.layout!=((n=o(this,ne))==null?void 0:n.constructor)&&(p(this,ne,new i.page.layout),this.layoutSlot.content=o(this,ne)),o(this,ne).loadRoute(i)):(this.layoutSlot.content=i.page,p(this,ne,null)))})}}ne=new WeakMap,C(Ht,"template",{type:"div",id:"layoutRoot",$:[Pt,{type:"embed-slot",bind:"layoutSlot"}]});J.declare(`
#layoutRoot
{
    padding-top: var(--fixed-header-height);
}
`);function Li(){new Ht().mount("body"),ge.start()}Li();
