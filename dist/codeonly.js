var wt = Object.defineProperty;
var st = (r) => {
  throw TypeError(r);
};
var bt = (r, e, t) => e in r ? wt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var re = (r, e, t) => bt(r, typeof e != "symbol" ? e + "" : e, t), Ve = (r, e, t) => e.has(r) || st("Cannot " + t);
var l = (r, e, t) => (Ve(r, e, "read from private field"), t ? t.call(r) : e.get(r)), L = (r, e, t) => e.has(r) ? st("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), b = (r, e, t, n) => (Ve(r, e, "write to private field"), n ? n.call(r, t) : e.set(r, t), t), C = (r, e, t) => (Ve(r, e, "access private method"), t);
var me = (r, e, t, n) => ({
  set _(i) {
    b(r, e, i, t);
  },
  get _() {
    return l(r, e, n);
  }
});
function Mt(r, e) {
  for (let t = 0; t < r.length; t++)
    e(r[t], t) || (r.splice(t, 1), t--);
}
function $e(r) {
  return r.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function We(r) {
  return r instanceof Function && !!r.prototype && !!r.prototype.constructor;
}
function Bt(r, e) {
  if (r === e) return !0;
  if (r.size !== e.size) return !1;
  for (const t of r) if (!e.has(t)) return !1;
  return !0;
}
function vt(r, e) {
  if (r === e || r === void 0 && e === void 0)
    return !0;
  if (r === void 0 || e === void 0)
    return !1;
  if (r === null && e === null)
    return !0;
  if (r === null || e === null || typeof r != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(r), n = Object.getOwnPropertyNames(e);
  if (t.length != n.length)
    return !1;
  for (let i of t)
    if (!Object.hasOwn(e, i) || !vt(r[i], e[i]))
      return !1;
  return !0;
}
function qt(r, e, t) {
  let n = 0, i = r.length - 1;
  for (; n <= i; ) {
    let a = Math.floor((n + i) / 2), c = r[a], u = e(c, t);
    if (u == 0)
      return a;
    u < 0 ? n = a + 1 : i = a - 1;
  }
  return -1 - n;
}
function Ut(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function jt(r, e) {
  return r = r.toLowerCase(), e = e.toLowerCase(), r < e ? -1 : r > e ? 1 : 0;
}
let Nt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function W(r) {
  return r.match(Nt) ? `.${r}` : `[${JSON.stringify(r)}]`;
}
function _t(r, e) {
  r.loading ? r.addEventListener("loaded", e, { once: !0 }) : e();
}
class R {
  constructor(e) {
    this.html = e;
  }
}
function At(r) {
  return new R(r);
}
class Ke {
  constructor(e) {
    this.value = e;
  }
}
function Vt(r) {
  return new Ke(r);
}
function Fe() {
  let r = [], e = "";
  function t(..._) {
    for (let N = 0; N < _.length; N++) {
      let g = _[N];
      g.lines ? r.push(...g.lines.map((h) => e + h)) : Array.isArray(g) ? r.push(...g.filter((h) => h != null).map((h) => e + h)) : r.push(...g.split(`
`).map((h) => e + h));
    }
  }
  function n() {
    e += "  ";
  }
  function i() {
    e = e.substring(2);
  }
  function a() {
    return r.join(`
`) + `
`;
  }
  function c(_) {
    t("{"), n(), _(this), i(), t("}");
  }
  function u(..._) {
    let N = {
      pos: this.lines.length
    };
    return this.append(_), N.headerLineCount = this.lines.length - N.pos, N;
  }
  function $(_, ...N) {
    this.lines.length == _.pos + _.headerLineCount ? this.lines.splice(_.pos, _.headerLineCount) : this.append(N);
  }
  return {
    append: t,
    enterCollapsibleBlock: u,
    leaveCollapsibleBlock: $,
    indent: n,
    unindent: i,
    braced: c,
    toString: a,
    lines: r,
    get isEmpty() {
      return r.length == 0;
    }
  };
}
class Oe {
  constructor() {
    this.code = Fe(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = Fe();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = Fe();
    return this.epilogs.push(e), e;
  }
  // Add a local variable to this closure
  addLocal(e, t) {
    this.locals.push({
      name: e,
      init: t
    });
  }
  // Add a function to this closure
  addFunction(e, t) {
    t || (t = []);
    let n = {
      name: e,
      args: t,
      code: new Oe()
    };
    return this.functions.push(n), n.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((n) => n.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = Fe();
    return this.appendTo(e), e.toString();
  }
  appendTo(e) {
    this.locals.length > 0 && e.append(`let ${this.locals.map((t) => t.init ? `${t.name} = ${t.init}` : t.name).join(", ")};`);
    for (let t of this.prologs)
      e.append(t);
    e.append(this.code);
    for (let t of this.functions)
      e.append(`function ${t.name}(${t.args.join(", ")})`), e.append("{"), e.indent(), t.code.appendTo(e), e.unindent(), e.append("}");
    for (let t of this.epilogs)
      e.append(t);
  }
}
function we(r) {
  return r == null ? "" : ("" + r).replace(/["'&<>]/g, function(e) {
    switch (e) {
      case '"':
        return "&quot;";
      case "&":
        return "&amp;";
      case "'":
        return "&#39;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
    }
  });
}
class et {
  static rawText(e) {
    return e instanceof R ? e.html : we(e);
  }
  static renderToString(e) {
    let t = "";
    return e({
      write: function(n) {
        t += n;
      }
    }), t;
  }
  static renderComponentToString(e) {
    let t = "";
    return e.render({
      write: function(n) {
        t += n;
      }
    }), t;
  }
  static rawStyle(e) {
    let t;
    return e instanceof R ? t = e.html : t = we(e), t = t.trim(), t.endsWith(";") || (t += ";"), t;
  }
  static rawNamedStyle(e, t) {
    if (!t)
      return "";
    let n;
    return t instanceof R ? n = t.html : n = we(t), n = n.trim(), n += ";", `${e}:${n}`;
  }
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof R) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof R ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof R) {
      if (e.nodeType == 1)
        return e.innerHTML = t.html, e;
      let n = document.createElement("SPAN");
      return n.innerHTML = t.html, e.replaceWith(n), n;
    } else {
      if (e.nodeType == 3)
        return e.nodeValue = t, e;
      let n = document.createTextNode(t);
      return e.replaceWith(n), n;
    }
  }
  // Set or remove a class on an element
  static setNodeClass(e, t, n) {
    n ? e.classList.add(t) : e.classList.remove(t);
  }
  // Set or remove a style on an element
  static setNodeStyle(e, t, n) {
    n == null ? e.style.removeProperty(t) : e.style[t] = n;
  }
  static setNodeDisplay(e, t, n) {
    if (t === !0) {
      n === null ? e.style.removeProperty("display") : n !== void 0 && e.style.display != n && (e.style.display = n);
      return;
    } else if (t === !1 || t === null || t === void 0) {
      let i = e.style.display;
      return e.style.display != "none" && (e.style.display = "none"), i ?? null;
    } else if (typeof t == "string") {
      let i = e.style.display;
      return e.style.display != t && (e.style.display = t), i ?? null;
    }
  }
  static replaceMany(e, t) {
    var n;
    if ((n = e == null ? void 0 : e[0]) != null && n.parentNode) {
      e[0].replaceWith(...t);
      for (let i = 1; i < e.length; i++)
        e[i].remove();
    }
  }
  static addEventListener(e, t, n, i) {
    function a(c) {
      return i(e(), c);
    }
    return t.addEventListener(n, a), function() {
      t.removeEventListener(n, a);
    };
  }
  /*
      static cloneNodeRecursive(node) 
      {
          // Clone the node deeply
          let clone = node.cloneNode(true);
  
          // If the node has children, clone them recursively
          if (node.hasChildNodes()) 
          {
              node.childNodes.forEach(child => {
                  clone.append(this.cloneNodeRecursive(child));
              });
          }
  
          return clone;
      }
      */
}
function rt(r) {
  let e = function() {
    var n;
    let t = (n = x.document) == null ? void 0 : n.createComment(r);
    return {
      get rootNode() {
        return t;
      },
      get rootNodes() {
        return [t];
      },
      get isSingleRoot() {
        return !0;
      },
      destroy() {
      },
      update() {
      },
      render(i) {
        i.write(`<!--${we(r)}-->`);
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
class ke {
  static integrate(e, t) {
    let n = [], i = [], a = !1, c = !0;
    for (let u = 0; u < e.branches.length; u++) {
      let $ = e.branches[u], _ = {};
      if (n.push(_), $.condition instanceof Function ? (_.condition = $.condition, a = !1) : $.condition !== void 0 ? (_.condition = () => $.condition, a = !!$.condition) : (_.condition = () => !0, a = !0), $.template !== void 0) {
        let N = new H($.template, t);
        N.isSingleRoot || (c = !1), _.nodeIndex = i.length, i.push(N);
      }
    }
    return delete e.branches, a || n.push({
      condition: () => !0
    }), {
      isSingleRoot: c,
      wantsUpdate: !0,
      nodes: i,
      data: n
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: ke,
      branches: [
        {
          template: e,
          condition: e.if
        }
      ]
    };
    return delete e.if, t;
  }
  static transformGroup(e) {
    let t = null;
    for (let n = 0; n < e.length; n++) {
      let i = e[n];
      if (i.if)
        t = {
          type: ke,
          branches: [
            {
              condition: i.if,
              template: i
            }
          ]
        }, delete i.if, e.splice(n, 1, t);
      else if (i.elseif) {
        if (!t)
          throw new Error("template has 'elseif' without a preceeding condition");
        t.branches.push({
          condition: i.elseif,
          template: i
        }), delete i.elseif, e.splice(n, 1), n--;
      } else if (i.else !== void 0) {
        if (!t)
          throw new Error("template has 'else' without a preceeding condition");
        t.branches.push({
          condition: !0,
          template: i
        }), delete i.else, t = null, e.splice(n, 1), n--;
      } else
        t = null;
    }
  }
  constructor(e) {
    this.branches = e.data, this.branch_constructors = [], this.context = e.context;
    for (let t of this.branches)
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(rt(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = rt(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    this.switchActiveBranch(), this.activeBranch.update();
  }
  render(e) {
    this.activeBranch.render(e);
  }
  unbind() {
    var e, t;
    (t = (e = this.activeBranch).unbind) == null || t.call(e);
  }
  bind() {
    var e, t;
    (t = (e = this.activeBranch).bind) == null || t.call(e);
  }
  switchActiveBranch(e) {
    let t = this.resolveActiveBranch();
    if (t != this.activeBranchIndex) {
      let n = this.activeBranch;
      this.activeBranchIndex = t, this.activeBranch = this.branch_constructors[t](), et.replaceMany(n.rootNodes, this.activeBranch.rootNodes), n.destroy();
    }
  }
  resolveActiveBranch() {
    for (let e = 0; e < this.branches.length; e++)
      if (this.branches[e].condition.call(this.context.model, this.context.model, this.context))
        return e;
    throw new Error("internal error, IfBlock didn't resolve to a branch");
  }
  get rootNodes() {
    return this.activeBranch.rootNodes;
  }
  get rootNode() {
    return this.activeBranch.rootNode;
  }
}
function xt(r, e) {
  let t = Math.min(r.length, e.length), n = Math.max(r.length, e.length), i = 0;
  for (; i < t && r[i] == e[i]; )
    i++;
  if (i == n)
    return [];
  if (i == r.length)
    return [{
      op: "insert",
      index: r.length,
      count: e.length - r.length
    }];
  let a = 0;
  for (; a < t - i && r[r.length - a - 1] == e[e.length - a - 1]; )
    a++;
  if (a == r.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - r.length
    }];
  if (i + a == r.length)
    return [{
      op: "insert",
      index: i,
      count: e.length - r.length
    }];
  if (i + a == e.length)
    return [{
      op: "delete",
      index: i,
      count: r.length - e.length
    }];
  let c = r.length - a, u = e.length - a, $ = A(e, i, u), _ = null, N = [], g = i, h = i;
  for (; g < u; ) {
    for (; g < u && r[h] == e[g]; )
      $.delete(e[g], g), g++, h++;
    let f = g, E = h;
    for (; h < c && !$.has(r[h]); )
      h++;
    if (h > E) {
      N.push({ op: "delete", index: f, count: h - E });
      continue;
    }
    for (_ || (_ = A(r, g, c)); g < u && !_.has(e[g]); )
      $.delete(e[g], g), g++;
    if (g > f) {
      N.push({ op: "insert", index: f, count: g - f });
      continue;
    }
    break;
  }
  if (g == u)
    return N;
  let o = 0, F = new at();
  for (; h < c; ) {
    let f = h;
    for (; h < c && !$.has(r[h]); )
      h++;
    if (h > f) {
      N.push({ op: "delete", index: g, count: h - f });
      continue;
    }
    for (; h < c && $.consume(r[h]) !== void 0; )
      F.add(r[h], o++), h++;
    h > f && N.push({ op: "store", index: g, count: h - f });
  }
  for (; g < u; ) {
    let f = g;
    for (; g < u && !F.has(e[g]); )
      g++;
    if (g > f) {
      N.push({ op: "insert", index: f, count: g - f });
      continue;
    }
    let E = { op: "restore", index: g, count: 0 };
    for (N.push(E); g < u; ) {
      let D = F.consume(e[g]);
      if (D === void 0)
        break;
      E.count == 0 ? (E.storeIndex = D, E.count = 1) : E.storeIndex + E.count == D ? E.count++ : (E = { op: "restore", index: g, storeIndex: D, count: 1 }, N.push(E)), g++;
    }
  }
  return N;
  function A(f, E, D) {
    let Z = new at();
    for (let X = E; X < D; X++)
      Z.add(f[X], X);
    return Z;
  }
}
var Q;
class at {
  constructor() {
    L(this, Q, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let n = l(this, Q).get(e);
    n ? n.push(t) : l(this, Q).set(e, [t]);
  }
  delete(e, t) {
    let n = l(this, Q).get(e);
    if (n) {
      let i = n.indexOf(t);
      if (i >= 0) {
        n.splice(i, 1);
        return;
      }
    }
    throw new Error("key/value pair not found");
  }
  consume(e) {
    let t = l(this, Q).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return l(this, Q).has(e);
  }
}
Q = new WeakMap();
var S, Pe, De, K, oe, le, de, ct, He, ut, Ge, pt, Ze, ft, Xe, ae;
const ge = class ge {
  constructor(e) {
    L(this, S);
    L(this, K);
    L(this, oe);
    L(this, le);
    L(this, de);
    var t, n;
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = (t = x.document) == null ? void 0 : t.createComment(" enter foreach block "), this.tailSentinal = (n = x.document) == null ? void 0 : n.createComment(" leave foreach block "), this.itemConstructor.isSingleRoot ? (b(this, K, C(this, S, pt)), b(this, le, C(this, S, ft)), b(this, oe, C(this, S, Ze)), b(this, de, C(this, S, Xe))) : (b(this, K, C(this, S, ct)), b(this, le, C(this, S, ut)), b(this, oe, C(this, S, He)), b(this, de, C(this, S, Ge)));
  }
  static integrate(e, t) {
    let n = {
      itemConstructor: t.compileTemplate(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, i;
    return e.empty && (i = [new H(e.empty, t)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: n,
      nodes: i
    };
  }
  static transform(e) {
    if (e.foreach === void 0)
      return e;
    let t;
    return e.foreach instanceof Function || Array.isArray(e.foreach) ? (t = {
      type: ge,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: ge,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = ge.transform(e[t - 1])), e[t - 1].type === ge && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, n) {
    let i = { outer: this.outer };
    if (n == 0 && t == 0) {
      let a = this.observableItems[e], c = [a], u = null;
      this.itemKey && (i.model = a, u = [this.itemKey.call(a, a, i)]), C(this, S, ae).call(this, c, u, e, 0, 1);
    } else {
      let a = null, c = this.observableItems.slice(e, e + n);
      this.itemKey && (a = c.map((u) => (i.model = u, this.itemKey.call(u, u, i)))), n && t ? C(this, S, Pe).call(this, e, t, c, a) : t != 0 ? l(this, le).call(this, e, t) : n != 0 && l(this, K).call(this, c, a, e, 0, n), C(this, S, De).call(this);
    }
  }
  get rootNodes() {
    let e = this.emptyDom ? this.emptyDom.rootNodes : [];
    if (this.itemConstructor.isSingleRoot)
      return [this.headSentinal, ...this.itemDoms.map((t) => t.rootNode), ...e, this.tailSentinal];
    {
      let t = [this.headSentinal];
      for (let n = 0; n < this.itemDoms.length; n++)
        t.push(...this.itemDoms[n].rootNodes);
      return t.push(...e), t.push(this.tailSentinal), t;
    }
  }
  update() {
    let e;
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), l(this, le).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, n = null;
    if (this.observableItems || this.condition && (e = e.filter((i) => (t.model = i, this.condition.call(i, i, t)))), this.itemKey && (n = e.map((i) => (t.model = i, this.itemKey.call(i, i, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, l(this, K).call(this, e, n, 0, 0, e.length), C(this, S, De).call(this);
      return;
    }
    this.observableItems || C(this, S, Pe).call(this, 0, this.itemDoms.length, e, n);
  }
  render(e) {
    e.write("<!-- enter foreach block -->");
    for (let t = 0; t < this.itemDoms.length; t++)
      this.itemDoms[t].render(e);
    e.write("<!-- leave foreach block -->");
  }
  bind() {
    var e, t;
    (t = (e = this.emptyDom) == null ? void 0 : e.bind) == null || t.call(e);
  }
  unbind() {
    var e, t;
    (t = (e = this.emptyDom) == null ? void 0 : e.unbind) == null || t.call(e);
  }
  destroy() {
    this.observableItems != null && (this.observableItems.removeListener(this._onObservableUpdate), this.observableItems = null);
    for (let e = 0; e < this.itemDoms.length; e++)
      this.itemDoms[e].destroy();
    this.itemDoms = null;
  }
  get isAttached() {
    var e;
    return ((e = this.tailSentinal) == null ? void 0 : e.parentNode) != null;
  }
};
S = new WeakSet(), Pe = function(e, t, n, i) {
  let a = e + t, c;
  e == 0 && t == this.itemDoms.length ? c = this.itemDoms : c = this.itemDoms.slice(e, a);
  let u;
  if (i ? u = xt(c.map((f) => f.context.key), i) : n.length > c.length ? u = [{
    op: "insert",
    index: c.length,
    count: n.length - c.length
  }] : n.length < c.length ? u = [{
    op: "delete",
    index: n.length,
    count: c.length - n.length
  }] : u = [], u.length == 0) {
    C(this, S, ae).call(this, n, i, e, 0, t);
    return;
  }
  let $ = [], _ = [], N = {
    insert: h,
    delete: o,
    store: F,
    restore: A
  }, g = 0;
  for (let f of u)
    f.index > g && (C(this, S, ae).call(this, n, i, e + g, g, f.index - g), g = f.index), N[f.op].call(this, f);
  g < n.length && C(this, S, ae).call(this, n, i, e + g, g, n.length - g);
  for (let f = _.length - 1; f >= 0; f--)
    _[f].destroy();
  C(this, S, De).call(this);
  function h(f) {
    g += f.count;
    let E = Math.min(_.length, f.count);
    E && (l(this, oe).call(this, f.index + e, _.splice(0, E)), C(this, S, ae).call(this, n, i, f.index + e, f.index, E)), E < f.count && l(this, K).call(this, n, i, f.index + e + E, f.index + E, f.count - E);
  }
  function o(f) {
    _.push(...l(this, de).call(this, f.index + e, f.count));
  }
  function F(f) {
    $.push(...l(this, de).call(this, f.index + e, f.count));
  }
  function A(f) {
    g += f.count, l(this, oe).call(this, f.index + e, $.slice(f.storeIndex, f.storeIndex + f.count)), C(this, S, ae).call(this, n, i, f.index + e, f.index, f.count);
  }
}, De = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.isAttached && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.isAttached)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, K = new WeakMap(), oe = new WeakMap(), le = new WeakMap(), de = new WeakMap(), ct = function(e, t, n, i, a) {
  let c = [];
  for (let u = 0; u < a; u++) {
    let $ = {
      outer: this.outer,
      model: e[i + u],
      key: t == null ? void 0 : t[i + u],
      index: n + u
    };
    c.push(this.itemConstructor($));
  }
  C(this, S, He).call(this, n, c);
}, He = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let n = [];
    t.forEach((a) => n.push(...a.rootNodes));
    let i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNodes[0] : i = this.tailSentinal, i.before(...n);
  }
}, ut = function(e, t) {
  let n = C(this, S, Ge).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    n[i].destroy();
}, Ge = function(e, t) {
  let n = this.isAttached;
  for (let i = 0; i < t; i++)
    if (n) {
      let a = this.itemDoms[e + i].rootNodes;
      for (let c = 0; c < a.length; c++)
        a[c].remove();
    }
  return this.itemDoms.splice(e, t);
}, pt = function(e, t, n, i, a) {
  let c = [];
  for (let u = 0; u < a; u++) {
    let $ = {
      outer: this.outer,
      model: e[i + u],
      key: t == null ? void 0 : t[i + u],
      index: n + u
    };
    c.push(this.itemConstructor($));
  }
  C(this, S, Ze).call(this, n, c);
}, Ze = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let n = t.map((a) => a.rootNode), i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNode : i = this.tailSentinal, i.before(...n);
  }
}, ft = function(e, t) {
  let n = C(this, S, Xe).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    n[i].destroy();
}, Xe = function(e, t) {
  let n = this.isAttached;
  for (let i = 0; i < t; i++)
    n && this.itemDoms[e + i].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, ae = function(e, t, n, i, a) {
  for (let c = 0; c < a; c++) {
    let u = this.itemDoms[n + c];
    u.context.key = t == null ? void 0 : t[i + c], u.context.index = n + c, u.context.model = e[i + c], u.rebind(), u.update();
  }
};
let Je = ge;
var V, P, O, he, k, ce, be, ee, te;
const ye = class ye {
  constructor(e) {
    L(this, V);
    L(this, P);
    L(this, O);
    // either #content, or if #content is a function the return value from the function
    L(this, he);
    L(this, k);
    L(this, ce);
    L(this, be);
    L(this, ee);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    L(this, te, !0);
    var t, n;
    b(this, V, e.context), b(this, be, e.nodes[1]), b(this, he, (t = x.document) == null ? void 0 : t.createTextNode("")), b(this, ce, (n = x.document) == null ? void 0 : n.createTextNode("")), b(this, k, []), b(this, te, e.data.ownsContent ?? !0), e.nodes[0] ? this.content = e.nodes[0]() : this.content = e.data.content;
  }
  static integrate(e, t) {
    let n = null;
    e.content && typeof e.content == "object" && (n = e.content, delete e.content);
    let i = {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: {
        ownsContent: e.ownsContent ?? !0,
        content: e.content
      },
      nodes: [
        n ? new H(n, t) : null,
        e.placeholder ? new H(e.placeholder, t) : null
      ]
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, i;
  }
  static transform(e) {
    return e instanceof Function && !We(e) ? {
      type: ye,
      content: e
    } : (e.type == "embed-slot" && (e.type = ye), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = ye.transform(e[t - 1]), e[t - 1].type === ye && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      l(this, he),
      ...l(this, k),
      l(this, ce)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return l(this, te);
  }
  set ownsContent(e) {
    b(this, te, e);
  }
  get content() {
    return l(this, P);
  }
  set content(e) {
    b(this, P, e), l(this, P) instanceof Function ? this.replaceContent(l(this, P).call(l(this, V).model, l(this, V).model, l(this, V))) : this.replaceContent(l(this, P));
  }
  update() {
    l(this, P) instanceof Function && this.replaceContent(l(this, P).call(l(this, V).model, l(this, V).model, l(this, V)));
  }
  bind() {
    var e, t;
    l(this, ee) && ((t = (e = l(this, O)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    l(this, ee) && ((t = (e = l(this, O)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  get isAttached() {
    var e;
    return ((e = l(this, he)) == null ? void 0 : e.parentNode) != null;
  }
  replaceContent(e) {
    var t, n;
    if (!(e == l(this, O) || !e && l(this, ee))) {
      if (this.isAttached) {
        let i = l(this, he).nextSibling;
        for (; i != l(this, ce); ) {
          let a = i.nextSibling;
          i.remove(), i = a;
        }
      }
      if (b(this, k, []), l(this, te) && ((n = (t = l(this, O)) == null ? void 0 : t.destroy) == null || n.call(t)), b(this, O, e), b(this, ee, !1), !e)
        l(this, be) && (b(this, O, l(this, be).call(this, l(this, V))), b(this, ee, !0), b(this, k, l(this, O).rootNodes));
      else if (e.rootNodes !== void 0)
        b(this, k, e.rootNodes);
      else if (Array.isArray(e))
        b(this, k, e);
      else if (x.Node !== void 0 && e instanceof x.Node)
        b(this, k, [e]);
      else if (e instanceof R) {
        let i = x.document.createElement("span");
        i.innerHTML = e.html, b(this, k, [...i.childNodes]);
      } else if (typeof e == "string")
        b(this, k, [x.document.createTextNode(e)]);
      else if (e.render)
        b(this, k, []);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      this.isAttached && l(this, ce).before(...l(this, k));
    }
  }
  destroy() {
    var e, t;
    l(this, te) && ((t = (e = l(this, O)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
  render(e) {
    var t, n;
    l(this, O) && ((n = (t = l(this, O)).render) == null || n.call(t, e));
  }
};
V = new WeakMap(), P = new WeakMap(), O = new WeakMap(), he = new WeakMap(), k = new WeakMap(), ce = new WeakMap(), be = new WeakMap(), ee = new WeakMap(), te = new WeakMap();
let Ye = ye;
class Qe {
  static register(e) {
    this.plugins.push(e);
  }
  static transform(e) {
    for (let t of this.plugins)
      t.transform && (e = t.transform(e));
    return e;
  }
  static transformGroup(e) {
    var t;
    for (let n of this.plugins)
      (t = n.transformGroup) == null || t.call(n, e);
  }
}
re(Qe, "plugins", [
  Je,
  Ye,
  ke
]);
class H {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e, t) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = Qe.transform(e), We(e) && (e = { type: e }), this.template = e, We(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof R) {
      if (this.kind = "html", this.html = e.html, x.document) {
        let n = x.document.createElement("div");
        n.innerHTML = e.html, this.nodes = [...n.childNodes], this.nodes.forEach((i) => i.remove());
      }
    } else e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (e.$ && !e.content && (e.content = e.$, delete e.$), this.integrated = this.template.type.integrate(this.template, t)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof R) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((n) => {
        n._ && !n.type && (n.type = n._, delete n._);
      }), Qe.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((n) => new H(n, t))) : this.childNodes = [];
    else if (this.isComponent)
      e.$ && !e.content && (e.content = e.$, delete e.$);
    else if (e.childNodes)
      throw new Error("childNodes only supported on element and fragment nodes");
  }
  // Checks if this node is a single or multi-root node
  // (fragments and foreach nodes are multi-root, all others are single root)
  get isSingleRoot() {
    return this.isFragment ? this.childNodes.length == 1 && this.childNodes[0].isSingleRoot : this.isComponent ? this.template.type.isSingleRoot : this.isIntegrated ? this.integrated.isSingleRoot : this.kind == "html" ? this.nodes.length == 1 : !0;
  }
  // Is this a component?
  get isComponent() {
    return this.kind === "component";
  }
  get isFragment() {
    return this.kind === "fragment";
  }
  get isIntegrated() {
    return this.kind === "integrated";
  }
  // Recursively get all the local node variables associated with this node and it's
  // children. This function is used to get all the variables that need to
  // be reset to null when this item is conditionally removed from the DOM
  *enumLocalNodes() {
    if (this.isFragment || (yield this), this.childNodes)
      for (let e = 0; e < this.childNodes.length; e++)
        yield* this.childNodes[e].enumLocalNodes();
  }
  // Returns a string describing all the child DOM nodes
  // as a sequence of spread variables.
  spreadChildDomNodes() {
    return Array.from(e(this)).filter((t) => t.length > 0).join(", ");
    function* e(t) {
      for (let n = 0; n < t.childNodes.length; n++)
        yield t.childNodes[n].spreadDomNodes();
    }
  }
  // Returns a string descibing all the DOM nodes of this node
  // with conditionally included nodes correctly included/excluded
  spreadDomNodes() {
    return Array.from(this.enumAllNodes()).join(", ");
  }
  // Generate code to list out all this node's dom nodes
  *enumAllNodes() {
    switch (this.kind) {
      case "fragment":
        for (let e = 0; e < this.childNodes.length; e++)
          yield* this.childNodes[e].enumAllNodes();
        break;
      case "component":
      case "integrated":
        this.isSingleRoot ? yield `${this.name}.rootNode` : yield `...${this.name}.rootNodes`;
        break;
      case "html":
        this.nodes.length > 0 && (this.nodes.length > 1 ? yield `...${this.name}` : yield `${this.name}`);
        break;
      default:
        yield this.name;
    }
  }
}
function St(r, e) {
  let t = 1, n = 1, i = [], a = null, c = new H(r, e), u = /* @__PURE__ */ new Map();
  return {
    code: _(c, !0).toString(),
    isSingleRoot: c.isSingleRoot,
    refs: i
  };
  function _(N, g) {
    let h = {
      emit_text_node: X,
      emit_html_node: Me,
      emit_dynamic_text_node: Be,
      emit_comment_node: qe,
      emit_fragment_node: Ae,
      emit_element_node: Ce,
      emit_integrated_node: Ue,
      emit_component_node: je
    }, o = new Oe();
    o.create = o.addFunction("create").code, o.bind = o.addFunction("bind").code, o.update = o.addFunction("update").code, o.unbind = o.addFunction("unbind").code, o.destroy = o.addFunction("destroy").code;
    let F;
    g && (F = o.addFunction("rebind").code);
    let A = /* @__PURE__ */ new Map();
    g && (a = o, a.code.append("let model = context.model;"), a.code.append("let document = env.document;")), o.code.append("create();"), o.code.append("bind();"), o.code.append("update();"), Z(N);
    for (let s of N.enumLocalNodes())
      d(s);
    o.bind.closure.isEmpty || (o.create.append("bind();"), o.destroy.closure.addProlog().append("unbind();"));
    let f = [];
    return N.isSingleRoot && f.push(`  get rootNode() { return ${N.spreadDomNodes()}; },`), g ? (f.push("  context,"), N == c && u.forEach((s, m) => f.push(`  get ${m}() { return ${s}; },`)), o.getFunction("bind").isEmpty ? F.append("model = context.model") : (F.append("if (model != context.model)"), F.braced(() => {
      F.append("unbind();"), F.append("model = context.model"), F.append("bind();");
    })), f.push("  rebind,")) : (f.push("  bind,"), f.push("  unbind,")), o.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${N.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${N.isSingleRoot},`,
      ...f,
      "};"
    ]), o;
    function E(s) {
      s.template.export ? a.addLocal(s.name) : o.addLocal(s.name);
    }
    function D() {
      o.update.temp_declared || (o.update.temp_declared = !0, o.update.append("let temp;"));
    }
    function Z(s) {
      s.name = `n${t++}`, h[`emit_${s.kind}_node`](s);
    }
    function X(s) {
      E(s), o.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function Me(s) {
      s.nodes.length != 0 && (E(s), s.nodes.length == 1 ? (o.create.append(`${s.name} = refs[${i.length}].cloneNode(true);`), i.push(s.nodes[0])) : (o.create.append(`${s.name} = refs[${i.length}].map(x => x.cloneNode(true));`), i.push(s.nodes)));
    }
    function Be(s) {
      E(s);
      let m = `p${n++}`;
      o.addLocal(m), o.create.append(`${s.name} = helpers.createTextNode("");`), D(), o.update.append(`temp = ${I(i.length)};`), o.update.append(`if (temp !== ${m})`), o.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${m} = ${I(i.length)});`), i.push(s.template);
    }
    function qe(s) {
      if (E(s), s.template.text instanceof Function) {
        let m = `p${n++}`;
        o.addLocal(m), o.create.append(`${s.name} = document.createComment("");`), D(), o.update.append(`temp = ${I(i.length)};`), o.update.append(`if (temp !== ${m})`), o.update.append(`  ${s.name}.nodeValue = ${m} = temp;`), i.push(s.template.text);
      } else
        o.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function Ue(s) {
      let m = [], p = !1;
      if (s.integrated.nodes)
        for (let w = 0; w < s.integrated.nodes.length; w++) {
          let v = s.integrated.nodes[w];
          if (!v) {
            m.push(null);
            continue;
          }
          v.name = `n${t++}`;
          let T = _(v, !1);
          T.getFunction("bind").isEmpty || (p = !0);
          let it = `${v.name}_constructor_${w + 1}`, $t = o.addFunction(it, []);
          T.appendTo($t.code), m.push(it);
        }
      s.integrated.wantsUpdate && o.update.append(`${s.name}.update()`), p && (o.bind.append(`${s.name}.bind()`), o.unbind.append(`${s.name}.unbind()`));
      let y = -1;
      s.integrated.data && (y = i.length, i.push(s.integrated.data)), E(s), o.create.append(
        `${s.name} = new refs[${i.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${y}]` : "null"},`,
        `  nodes: [ ${m.join(", ")} ],`,
        "});"
      ), i.push(s.template.type);
      for (let w of Object.keys(s.template))
        if (!Se(s, w))
          throw new Error(`Unknown element template key: ${w}`);
    }
    function je(s) {
      E(s), o.create.append(`${s.name} = new refs[${i.length}]();`), i.push(s.template.type);
      let m = new Set(s.template.type.slots ?? []), p = s.template.update === "auto", y = !1;
      for (let w of Object.keys(s.template)) {
        if (Se(s, w) || w == "update")
          continue;
        if (m.has(w)) {
          if (s.template[w] === void 0)
            continue;
          let T = new H(s.template[w], e);
          Z(T), T.isSingleRoot ? o.create.append(`${s.name}${W(w)}.content = ${T.name};`) : o.create.append(`${s.name}${W(w)}.content = [${T.spreadDomNodes()}];`);
          continue;
        }
        let v = typeof s.template[w];
        if (v == "string" || v == "number" || v == "boolean")
          o.create.append(`${s.name}${W(w)} = ${JSON.stringify(s.template[w])}`);
        else if (v === "function") {
          p && !y && (y = `${s.name}_mod`, o.update.append(`let ${y} = false;`));
          let T = `p${n++}`;
          o.addLocal(T);
          let nt = i.length;
          D(), o.update.append(`temp = ${I(nt)};`), o.update.append(`if (temp !== ${T})`), p && (o.update.append("{"), o.update.append(`  ${y} = true;`)), o.update.append(`  ${s.name}${W(w)} = ${T} = temp;`), p && o.update.append("}"), i.push(s.template[w]);
        } else {
          let T = s.template[w];
          T instanceof Ke && (T = T.value), o.create.append(`${s.name}${W(w)} = refs[${i.length}];`), i.push(T);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (o.update.append(`if (${I(i.length)})`), o.update.append(`  ${s.name}.update();`), i.push(s.template.update)) : p ? y && (o.update.append(`if (${y})`), o.update.append(`  ${s.name}.update();`)) : o.update.append(`${s.name}.update();`));
    }
    function Ae(s) {
      fe(s);
    }
    function Ce(s) {
      var y;
      let m = o.current_xmlns, p = s.template.xmlns;
      p === void 0 && s.template.type == "svg" && (p = "http://www.w3.org/2000/svg"), p == null && (p = o.current_xmlns), E(s), p ? (o.current_xmlns = p, o.create.append(`${s.name} = document.createElementNS(${JSON.stringify(p)}, ${JSON.stringify(s.template.type)});`)) : o.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let w of Object.keys(s.template))
        if (!Se(s, w)) {
          if (w == "id") {
            J(s.template.id, (v) => `${s.name}.setAttribute("id", ${v});`);
            continue;
          }
          if (w == "class") {
            J(s.template.class, (v) => `${s.name}.setAttribute("class", ${v});`);
            continue;
          }
          if (w.startsWith("class_")) {
            let v = $e(w.substring(6));
            J(s.template[w], (T) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(v)}, ${T})`);
            continue;
          }
          if (w == "style") {
            J(s.template.style, (v) => `${s.name}.setAttribute("style", ${v});`);
            continue;
          }
          if (w.startsWith("style_")) {
            let v = $e(w.substring(6));
            J(s.template[w], (T) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(v)}, ${T})`);
            continue;
          }
          if (w == "display") {
            if (s.template.display instanceof Function)
              o.addLocal(`${s.name}_prev_display`), J(s.template[w], (v) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${v}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              o.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              o.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (w.startsWith("attr_")) {
            let v = w.substring(5);
            if (v == "style" || v == "class" || v == "id")
              throw new Error(`Incorrect attribute: use '${v}' instead of '${w}'`);
            o.current_xmlns || (v = $e(v)), J(s.template[w], (T) => `${s.name}.setAttribute(${JSON.stringify(v)}, ${T})`);
            continue;
          }
          if (w == "text") {
            s.template.text instanceof Function ? J(s.template.text, (v) => `helpers.setElementText(${s.name}, ${v})`) : s.template.text instanceof R && o.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && o.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${w}`);
        }
      fe(s), (y = s.childNodes) != null && y.length && o.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), o.current_xmlns = m;
    }
    function fe(s) {
      if (s.childNodes)
        for (let m = 0; m < s.childNodes.length; m++)
          Z(s.childNodes[m]);
    }
    function Se(s, m) {
      if (U(m))
        return !0;
      if (m == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (u.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return u.set(s.template.export, s.name), !0;
      }
      if (m == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (A.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return A.set(s.template.bind, !0), o.bind.append(`model${W(s.template.bind)} = ${s.name};`), o.unbind.append(`model${W(s.template.bind)} = null;`), !0;
      }
      if (m.startsWith("on_")) {
        let p = m.substring(3);
        if (!(s.template[m] instanceof Function))
          throw new Error(`event handler for '${m}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let y = `${s.name}_ev${s.listenerCount}`;
        return o.addLocal(y), o.create.append(`${y} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(p)}, refs[${i.length}]);`), i.push(s.template[m]), !0;
      }
      return m == "debug_create" ? (typeof s.template[m] == "function" ? (o.create.append(`if (${I(i.length)})`), o.create.append("  debugger;"), i.push(s.template[m])) : s.template[m] && o.create.append("debugger;"), !0) : m == "debug_update" ? (typeof s.template[m] == "function" ? (o.update.append(`if (${I(i.length)})`), o.update.append("  debugger;"), i.push(s.template[m])) : s.template[m] && o.update.append("debugger;"), !0) : m == "debug_render";
    }
    function U(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function I(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function J(s, m) {
      if (s instanceof Function) {
        let p = `p${n++}`;
        o.addLocal(p), m(), D(), o.update.append(`temp = ${I(i.length)};`), o.update.append(`if (temp !== ${p})`), o.update.append(`  ${m(p + " = temp")};`), i.push(s);
      } else
        o.create.append(m(JSON.stringify(s)));
    }
    function d(s) {
      if ((s.isComponent || s.isIntegrated) && o.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let m = 0; m < s.listenerCount; m++)
          o.destroy.append(`${s.name}_ev${m + 1}?.();`), o.destroy.append(`${s.name}_ev${m + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || o.destroy.append(`${s.name} = null;`);
    }
  }
}
let Et = 1;
function mt(r, e) {
  e = e ?? {}, e.compileTemplate = mt;
  let t = St(r, e), n = new Function("env", "refs", "helpers", "context", t.code), i = function(a) {
    return a || (a = {}), a.$instanceId = Et++, n(x, t.refs, et, a ?? {});
  };
  return i.isSingleRoot = t.isSingleRoot, i;
}
let x = null;
var ne;
class gt extends EventTarget {
  constructor() {
    super();
    L(this, ne, 0);
    this.browser = !1;
  }
  enterLoading() {
    me(this, ne)._++, l(this, ne) == 1 && this.dispatchEvent(new Event("loading"));
  }
  leaveLoading() {
    me(this, ne)._--, l(this, ne) == 0 && this.dispatchEvent(new Event("loaded"));
  }
  get loading() {
    return l(this, ne) != 0;
  }
  async load(t) {
    this.enterLoading();
    try {
      return await t();
    } finally {
      this.leaveLoading();
    }
  }
}
ne = new WeakMap();
class Lt extends gt {
  constructor() {
    super(), this.browser = !0, this.document = document, this.compileTemplate = mt, this.window = window, this.requestAnimationFrame = window.requestAnimationFrame.bind(window), this.Node = Node;
  }
}
function Tt(r) {
  x = r;
}
typeof document < "u" && Tt(new Lt());
let ot = [], Ie = [], Ee = null;
class zt {
  static declare(e) {
    ot.push(e), Ie.push(e), x.browser && x.requestAnimationFrame(Ct);
  }
  static get all() {
    return ot.join(`
`);
  }
}
function Ct() {
  Ie.length != 0 && (Ee == null && (Ee = document.createElement("style")), Ee.innerHTML += Ie.join(`
`), Ie = [], Ee.parentNode || document.head.appendChild(Ee));
}
let Le = [], ze = !1;
function tt(r, e) {
  r && (e = e ?? 0, e != 0 && (ze = !0), Le.push({
    callback: r,
    order: e
  }), Le.length == 1 && x.requestAnimationFrame(function() {
    let t = Le;
    ze && (t.sort((n, i) => i.order - n.order), ze = !1), Le = [];
    for (let n = t.length - 1; n >= 0; n--)
      t[n].callback();
  }));
}
function Wt(r) {
  Le.length == 0 ? r() : tt(r, Number.MAX_SAFE_INTEGER);
}
class Ft {
  static compile() {
    return x.compileTemplate(...arguments);
  }
}
var M, ie;
const Y = class Y extends EventTarget {
  constructor() {
    super();
    L(this, M);
    L(this, ie, 0);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return Ft.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    l(this, M) || b(this, M, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return l(this, M) || this.init(), l(this, M);
  }
  get isSingleRoot() {
    return this.dom.isSingleRoot;
  }
  get rootNode() {
    if (!this.isSingleRoot)
      throw new Error("rootNode property can't be used on multi-root template");
    return this.dom.rootNode;
  }
  get rootNodes() {
    return this.dom.rootNodes;
  }
  invalidate() {
    l(this, M) && (this.invalid || (this.invalid = !0, Y.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && tt(() => {
      for (let n = 0; n < this._invalidComponents.length; n++)
        this._invalidComponents[n].validate();
      this._invalidComponents = [];
    }, Y.nextFrameOrder);
  }
  update() {
    l(this, M) && (this.invalid = !1, this.dom.update());
  }
  async load(t) {
    me(this, ie)._++, l(this, ie) == 1 && (this.invalidate(), x.enterLoading(), this.dispatchEvent(new Event("loading")));
    try {
      return await t();
    } finally {
      me(this, ie)._--, l(this, ie) == 0 && (this.invalidate(), this.dispatchEvent(new Event("loaded")), x.leaveLoading());
    }
  }
  get loading() {
    return l(this, ie) != 0;
  }
  set loading(t) {
    throw new Error("setting Component.loading not supported, use load() function");
  }
  render(t) {
    this.dom.render(t);
  }
  destroy() {
    l(this, M) && (l(this, M).destroy(), b(this, M, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    l(this, M) && this.rootNodes.forEach((t) => t.remove());
  }
};
M = new WeakMap(), ie = new WeakMap(), re(Y, "_compiledTemplate"), re(Y, "nextFrameOrder", -100), re(Y, "_invalidComponents", []), re(Y, "template", {});
let lt = Y;
class Jt {
  static embed(e) {
    return {
      type: "embed-slot",
      content: e
    };
  }
  static h(e, t) {
    return {
      type: `h${e}`,
      text: t
    };
  }
  static p(e) {
    return {
      type: "p",
      text: e
    };
  }
  static a(e, t) {
    return {
      type: "a",
      attr_href: e,
      text: t
    };
  }
  static raw(e) {
    return new R(e);
  }
}
var se;
const Re = class Re extends Array {
  constructor() {
    super(...arguments);
    L(this, se, []);
  }
  static from() {
    return new Re(...arguments);
  }
  addListener(t) {
    l(this, se).push(t);
  }
  removeListener(t) {
    let n = l(this, se).indexOf(fn);
    n >= 0 && l(this, se).splice(n, 1);
  }
  fire(t, n, i) {
    (n != 0 || i != 0) && l(this, se).forEach((a) => a(t, n, i));
  }
  touch(t) {
    t >= 0 && t < this.length && l(this, se).forEach((n) => n(t, 0, 0));
  }
  push() {
    let t = this.length;
    super.push(...arguments), this.fire(t, 0, this.length - t);
  }
  pop() {
    let t = this.length;
    super.pop(), this.fire(this.length, t - this.length, 0);
  }
  shift() {
    let t = this.length;
    super.shift(...arguments), this.fire(0, t - this.length, 0);
  }
  unshift() {
    let t = this.length;
    super.unshift(...arguments), this.fire(0, 0, this.length - t);
  }
  splice(t, n) {
    t < 0 && (t += this.length), t >= this.length && (n = 0, t = this.length), n === void 0 && (n = this.length - t), n < 0 && (n = 0);
    let i = super.splice(...arguments);
    return this.fire(t, n, arguments.length > 2 ? arguments.length - 2 : 0), i;
  }
  sort() {
    super.sort(...arguments), this.fire(0, this.length, this.length);
  }
  setAt(t, n) {
    if (t < 0 || t >= this.length)
      throw new Error("Observable array index out of range");
    this[t] = n, this.fire(t, 1, 1);
  }
  get isObservable() {
    return !0;
  }
  static from(t) {
    return new Re(...t);
  }
};
se = new WeakMap();
let dt = Re;
function Dt(r) {
  let e = "^", t = r.length, n;
  for (let a = 0; a < t; a++) {
    n = !0;
    let c = r[a];
    if (c == "?")
      e += "[^\\/]";
    else if (c == "*")
      e += "[^\\/]+";
    else if (c == ":") {
      a++;
      let u = a;
      for (; a < t && i(r[a]); )
        a++;
      let $ = r.substring(u, a);
      if ($.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let _ = "[^\\/]+";
      if (r[a] == "(") {
        a++, u = a;
        let N = 0;
        for (; a < t; ) {
          if (r[a] == "(")
            N++;
          else if (r[a] == ")") {
            if (N == 0)
              break;
            N--;
          }
          a++;
        }
        if (a >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        _ = r.substring(u, a), a++;
      }
      if (a < t && r[a] == "*" || r[a] == "+") {
        let N = r[a];
        a++, r[a] == "/" ? (e += `(?<${$}>(?:${_}\\/)${N})`, a++) : N == "*" ? e += `(?<${$}>(?:${_}\\/)*(?:${_})?\\/?)` : e += `(?<${$}>(?:${_}\\/)*(?:${_})\\/?)`, n = !1;
      } else
        e += `(?<${$}>${_})`;
      a--;
    } else c == "/" ? (e += "\\" + c, a == r.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(c) >= 0 ? (e += "\\" + c, n = c != "/") : e += c;
  }
  return n && (e += "\\/?"), e += "$", e;
  function i(a) {
    return a >= "a" && a <= "z" || a >= "A" && a <= "Z" || a >= "0" && a <= "9" || a == "_" || a == "$";
  }
}
class Pt {
  constructor(e, t) {
    this.el = e, this.targetClass = t, this.entered = !1, this.pendingTransitions = [], this.detecting = !1, this.transitioning = !1, this.el.addEventListener("transitionend", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitioncancel", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitionrun", this.onTransitionRun.bind(this));
  }
  onTransitionEndOrCancel(e) {
    let t = !1;
    for (let n = 0; n < this.pendingTransitions.length; n++) {
      let i = this.pendingTransitions[n];
      i.target == e.target && i.propertyName == e.propertyName && (this.pendingTransitions.splice(n, 1), t = !0);
    }
    t && this.pendingTransitions.length == 0 && this.onTransitionsFinished();
  }
  onTransitionRun(e) {
    this.detecting && this.pendingTransitions.push({
      target: e.target,
      propertyName: e.propertyName
    });
  }
  detectTransitions() {
    this.transitioning = !0, this.detecting = !0, this.pendingTransitions = [], requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      this.detecting = !1, this.pendingTransitions.length == 0 && this.onTransitionsFinished();
    })));
  }
  onTransitionsFinished() {
    this.el.classList.remove(`${this.targetClass}-start-enter`), this.el.classList.remove(`${this.targetClass}-start-leave`), this.el.classList.remove(`${this.targetClass}-enter`), this.el.classList.remove(`${this.targetClass}-leave`), this.entered ? this.el.classList.add(this.targetClass) : this.el.classList.remove(this.targetClass), this.transitioning = !1;
  }
  enter(e) {
    if (e) {
      (this.transitioning || !this.entered) && (this.entered = !0, this.onTransitionsFinished());
      return;
    }
    this.entered || (this.entered = !0, this.detectTransitions(), this.el.classList.add(this.targetClass, `${this.targetClass}-enter`, `${this.targetClass}-start-enter`), requestAnimationFrame(() => requestAnimationFrame(() => {
      this.el.classList.remove(`${this.targetClass}-start-enter`);
    })));
  }
  leave(e) {
    if (e) {
      (this.transitioning || this.entered) && (this.entered = !1, this.onTransitionsFinished());
      return;
    }
    this.entered && (this.entered = !1, this.detectTransitions(), this.el.classList.add(`${this.targetClass}-leave`, `${this.targetClass}-start-leave`), requestAnimationFrame(() => requestAnimationFrame(() => {
      this.el.classList.remove(`${this.targetClass}-start-leave`);
    })));
  }
  toggle(e) {
    this.entered ? this.leave() : this.enter();
  }
}
class ht {
  static get() {
    return {
      top: window.pageYOffset || document.documentElement.scrollTop,
      left: window.pageXOffset || document.documentElement.scrollLeft
    };
  }
  static set(e) {
    e ? window.scrollTo(e.left, e.top) : window.scrollTo(0, 0);
  }
}
var Te, B, j, ue, ve, Ne;
class Ht {
  constructor(e, t) {
    L(this, Te);
    re(this, "urlMapper");
    // The current route
    L(this, B, null);
    // The route currently being switched to
    L(this, j, null);
    L(this, ue, []);
    L(this, ve, []);
    L(this, Ne, !1);
    b(this, Te, e), e && (this.navigate = e.navigate.bind(e), this.replace = e.navigate.bind(e), this.back = e.back.bind(e)), t && this.register(t);
  }
  start() {
    return l(this, Te).start(this);
  }
  internalize(e) {
    var t;
    return ((t = this.urlMapper) == null ? void 0 : t.internalize(e)) ?? new URL(e);
  }
  externalize(e) {
    var t;
    return ((t = this.urlMapper) == null ? void 0 : t.externalize(e)) ?? new URL(e);
  }
  get current() {
    return l(this, B);
  }
  get pending() {
    return l(this, j);
  }
  addEventListener(e, t) {
    l(this, ue).push({ event: e, handler: t });
  }
  removeEventListener(e, t) {
    let n = l(this, ue).findIndex((i) => i.event == e && i.handler == t);
    n >= 0 && l(this, ue).splice(n, 1);
  }
  async dispatchEvent(e, t, n, i) {
    for (let a of l(this, ue))
      if (a.event == e) {
        let c = a.handler(n, i);
        if (t && await Promise.resolve(c) == !1)
          return !1;
      }
    return !0;
  }
  // Load a URL with state
  async load(e, t, n) {
    var a, c, u;
    let i = l(this, B);
    if (((a = l(this, B)) == null ? void 0 : a.url.pathname) == e.pathname && l(this, B).url.search == e.search) {
      let $ = (u = (c = l(this, B).handler).hashChange) == null ? void 0 : u.call(c, l(this, B), n);
      $ !== void 0 ? n = $ : n = Object.assign({}, l(this, B), n);
    }
    if (n = Object.assign(n, {
      current: !1,
      url: e,
      pathname: e.pathname,
      state: t
    }), b(this, j, n), !n.match && (n = await this.matchUrl(e, t, n), !n))
      return null;
    try {
      await this.tryLoad(n) !== !0 && b(this, j, null);
    } catch ($) {
      throw this.dispatchCancelEvents(i, n), $;
    }
    return l(this, j) != n ? (this.dispatchCancelEvents(i, n), null) : (b(this, j, null), n);
  }
  dispatchCancelEvents(e, t) {
    var n, i, a, c, u;
    (a = (n = l(this, B)) == null ? void 0 : (i = n.handler).cancelLeave) == null || a.call(i, e, t), (u = (c = t.handler).cancelEnter) == null || u.call(c, e, t), this.dispatchEvent("cancel", !1, e, t);
  }
  // Fires the sequence of events associated with loading a route
  // 
  // event => mayLeave        |
  // old route => mayLeave    |  Async and cancellable
  // new route => mayEnter    |
  // event => mayEnter        |
  // 
  // event => didLeave        |
  // old route => didLeave    |  Sync and non-cancellable
  // new route => didEnter    |
  // event => didEnter        |
  //
  async tryLoad(e) {
    var i, a, c, u, $, _, N, g;
    let t = l(this, B), n;
    if (!(t && (!await this.dispatchEvent("mayLeave", !0, t, e) || e != l(this, j) || (n = (a = (i = t.handler).mayLeave) == null ? void 0 : a.call(i, t, e), await Promise.resolve(n) === !1) || e != l(this, j))) && (n = (u = (c = e.handler).mayEnter) == null ? void 0 : u.call(c, t, e), await Promise.resolve(n) !== !1 && e == l(this, j) && await this.dispatchEvent("mayEnter", !0, t, e) && e == l(this, j)))
      return t && (t.current = !1), e.current = !0, b(this, B, e), t && (this.dispatchEvent("didLeave", !1, t, e), (_ = t == null ? void 0 : ($ = t.handler).didLeave) == null || _.call($, t, e)), (g = (N = e.handler).didEnter) == null || g.call(N, t, e), this.dispatchEvent("didEnter", !1, t, e), !0;
  }
  async matchUrl(e, t, n) {
    l(this, Ne) && (l(this, ve).sort((i, a) => (i.order ?? 0) - (a.order ?? 0)), b(this, Ne, !1));
    for (let i of l(this, ve)) {
      if (i.pattern && (n.match = n.pathname.match(i.pattern), !n.match))
        continue;
      let a = await Promise.resolve(i.match(n));
      if (a === !0 || a == n)
        return n.handler = i, n;
      if (a === null)
        return null;
    }
    return n.handler = {}, n;
  }
  register(e) {
    Array.isArray(e) || (e = [e]);
    for (let t of e)
      typeof t.pattern == "string" && (t.pattern = new RegExp(Dt(t.pattern))), l(this, ve).push(t);
    b(this, Ne, !0);
  }
}
Te = new WeakMap(), B = new WeakMap(), j = new WeakMap(), ue = new WeakMap(), ve = new WeakMap(), Ne = new WeakMap();
var _e, q, xe;
class Gt {
  constructor() {
    L(this, _e, 0);
    L(this, q);
    L(this, xe, !1);
  }
  async start(e) {
    b(this, q, e), x.document.body.addEventListener("click", (a) => {
      let c = a.target.closest("a");
      if (c) {
        let u = c.getAttribute("href"), $ = new URL(u, x.window.location);
        if ($.origin == x.window.location.origin) {
          try {
            $ = l(this, q).internalize($);
          } catch {
            return;
          }
          if (this.navigate($))
            return a.preventDefault(), !0;
        }
      }
    }), x.window.addEventListener("popstate", async (a) => {
      if (l(this, xe)) {
        b(this, xe, !1);
        return;
      }
      let c = l(this, _e) + 1, u = l(this, q).internalize(x.window.location), $ = a.state ?? { sequence: this.current.state.sequence + 1 };
      await this.load(u, $, { navMode: "pop" }) || c == l(this, _e) && (b(this, xe, !0), x.window.history.go(this.current.state.sequence - $.sequence));
    });
    let t = l(this, q).internalize(x.window.location), n = x.window.history.state ?? { sequence: 0 }, i = await this.load(t, n, { navMode: "start" });
    return x.window.history.replaceState(n, null), i;
  }
  get current() {
    return l(this, q).current;
  }
  async load(e, t, n) {
    return me(this, _e)._++, await l(this, q).load(e, t, n);
  }
  back() {
    this.current.state.sequence == 0 ? (this.replace("/"), this.load("/", { sequence: 0 }, { navMode: "replace" })) : x.window.history.back();
  }
  replace(e) {
    typeof e == "string" && (e = new URL(e, l(this, q).internalize(x.window.location))), this.current.pathname = e.pathname, this.current.url = e, x.window.history.replaceState(
      this.current.state,
      "",
      l(this, q).externalize(e)
    );
  }
  async navigate(e) {
    typeof e == "string" && (e = new URL(e, l(this, q).internalize(x.window.location)));
    let t = await this.load(
      e,
      { sequence: this.current.state.sequence + 1 },
      { navMode: "push" }
    );
    return t && (x.window.history.pushState(
      t.state,
      "",
      l(this, q).externalize(e)
    ), t);
  }
}
_e = new WeakMap(), q = new WeakMap(), xe = new WeakMap();
class Zt {
  constructor(e) {
    if (this.options = e, this.options.base && (!this.options.base.startsWith("/") || !this.options.base.endsWith("/")))
      throw new Error(`UrlMapper base '${this.options.base}' must start and end with '/'`);
  }
  internalize(e) {
    if (this.options.base) {
      if (!e.pathname.startsWith(this.options.base))
        throw new Error(`Can't internalize url '${e}'`);
      e = new URL(e), e.pathname = e.pathname.substring(this.options.base.length - 1);
    }
    if (this.options.hash) {
      let t = e.hash.substring(1);
      t.startsWith("/") || (t = "/" + t), e = new URL(`${e.origin}${t}`);
    }
    return e;
  }
  externalize(e) {
    return this.options.hash && (e = new URL(`${e.origin}/#${e.pathname}${e.search}${e.hash}`)), this.options.base && (e = new URL(e), e.pathname = this.options.base.slice(0, -1) + e.pathname), e;
  }
}
var G, z;
class Xt {
  constructor(e) {
    L(this, G);
    L(this, z, {});
    b(this, G, e), x.window.history.scrollRestoration && (x.window.history.scrollRestoration = "manual");
    let t = x.window.sessionStorage.getItem("codeonly-view-states");
    t && b(this, z, JSON.parse(t)), e.addEventListener("mayLeave", (n, i) => (this.captureViewState(), !0)), e.addEventListener("mayEnter", (n, i) => {
      i.viewState = l(this, z)[i.state.sequence];
    }), e.addEventListener("didEnter", (n, i) => {
      if (i.navMode == "push") {
        for (let a of Object.keys(l(this, z)))
          parseInt(a) > i.state.sequence && delete l(this, z)[a];
        this.saveViewStates();
      }
      _t(x, () => {
        tt(() => {
          var a, c;
          if (i.handler.restoreViewState ? i.handler.restoreViewState(i.viewState, i) : l(this, G).restoreViewState ? (c = (a = l(this, G)).restoreViewState) == null || c.call(a, i.viewState, i) : ht.set(i.viewState), x.browser) {
            let u = document.getElementById(i.url.hash.substring(1));
            u == null || u.scrollIntoView();
          }
        });
      });
    }), x.window.addEventListener("beforeunload", (n) => {
      this.captureViewState();
    });
  }
  captureViewState() {
    var t, n;
    let e = l(this, G).current;
    e && (e.handler.captureViewState ? l(this, z)[e.state.sequence] = e.handler.captureViewState(e) : l(this, G).captureViewState ? l(this, z)[e.state.sequence] = (n = (t = l(this, G)).captureViewState) == null ? void 0 : n.call(t, e) : l(this, z)[e.state.sequence] = ht.get()), this.saveViewStates();
  }
  saveViewStates() {
    x.window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(l(this, z)));
  }
}
G = new WeakMap(), z = new WeakMap();
var pe;
class It {
  constructor() {
    L(this, pe, "`");
  }
  text(e) {
    this.raw(we(e));
  }
  raw(e) {
    b(this, pe, l(this, pe) + e.replace(/[\\`]/g, "\\$&"));
  }
  expr(e) {
    b(this, pe, l(this, pe) + ("${" + e + "}"));
  }
  resolve() {
    let e = l(this, pe) + "`";
    return b(this, pe, "`"), e;
  }
}
pe = new WeakMap();
function kt(r, e) {
  let t = 1, n = 1, i = [], a = null, c = new H(r, e);
  return {
    code: $(c, !0).toString(),
    refs: i
  };
  function $(_, N) {
    let g = {
      emit_text_node: Z,
      emit_html_node: X,
      emit_dynamic_text_node: Me,
      emit_comment_node: Be,
      emit_fragment_node: je,
      emit_element_node: Ae,
      emit_integrated_node: qe,
      emit_component_node: Ue
    }, h = new Oe();
    h.create = h.addFunction("create").code, h.update = h.addFunction("update").code, h.render = h.addFunction("render", ["w"]).code, h.destroy = h.addFunction("destroy").code;
    let o = new It();
    N && (a = h, a.code.append("let model = context.model;")), h.code.append("create();"), h.code.append("update();"), D(_), A();
    for (let d of _.enumLocalNodes())
      J(d);
    let F = [];
    return N && (F.push("  context,"), F.push("  get html() { return helpers.renderToString(render) },")), h.code.append([
      "return { ",
      "  render,",
      "  update,",
      "  destroy,",
      ...F,
      "};"
    ]), h;
    function A() {
      let d = o.resolve();
      d != "``" && h.render.append(`w.write(${d});`);
    }
    function f(d) {
      d.template.export ? a.addLocal(d.name) : h.addLocal(d.name);
    }
    function E() {
      h.update.temp_declared || (h.update.temp_declared = !0, h.update.append("let temp;"));
    }
    function D(d) {
      d.name = `n${t++}`, g[`emit_${d.kind}_node`](d);
    }
    function Z(d) {
      o.text(d.template);
    }
    function X(d) {
      o.raw(d.html);
    }
    function Me(d) {
      o.expr(`helpers.rawText(${U(i.length)})`), i.push(d.template);
    }
    function Be(d) {
      o.raw("<!--"), d.template.text instanceof Function ? (o.text_expr(U(i.length)), i.push(d.template.text)) : o.text(d.template.text), o.raw("-->");
    }
    function qe(d) {
      let s = [];
      if (d.integrated.nodes)
        for (let p = 0; p < d.integrated.nodes.length; p++) {
          let y = d.integrated.nodes[p];
          if (!y) {
            s.push(null);
            continue;
          }
          y.name = `n${t++}`;
          let w = $(y, !1), v = `${y.name}_constructor_${p + 1}`, T = h.addFunction(v, []);
          w.appendTo(T.code), s.push(v);
        }
      let m = -1;
      d.integrated.data && (m = i.length, i.push(d.integrated.data)), d.integrated.wantsUpdate && h.update.append(`${d.name}.update()`), f(d), h.create.append(
        `${d.name} = new refs[${i.length}]({`,
        "  context,",
        `  data: ${d.integrated.data ? `refs[${m}]` : "null"},`,
        `  nodes: [ ${s.join(", ")} ],`,
        "});"
      ), i.push(d.template.type);
      for (let p of Object.keys(d.template))
        if (!fe(d, p))
          throw new Error(`Unknown element template key: ${p}`);
      A(), h.render.append(`${d.name}.render(w);`);
    }
    function Ue(d) {
      f(d), h.create.append(`${d.name} = new refs[${i.length}]();`), i.push(d.template.type);
      let s = new Set(d.template.type.slots ?? []), m = d.template.update === "auto", p = !1;
      A();
      for (let y of Object.keys(d.template)) {
        if (fe(d, y) || y == "update")
          continue;
        if (s.has(y)) {
          if (d.template[y] === void 0)
            continue;
          let v = new H(d.template[y], e);
          D(v), h.create.append(`${d.name}${W(y)}.content = ${v.name};`);
          continue;
        }
        let w = typeof d.template[y];
        if (w == "string" || w == "number" || w == "boolean")
          h.create.append(`${d.name}${W(y)} = ${JSON.stringify(d.template[y])}`);
        else if (w === "function") {
          m && !p && (p = `${d.name}_mod`, h.update.append(`let ${p} = false;`));
          let v = `p${n++}`;
          h.addLocal(v);
          let T = i.length;
          E(), h.update.append(`temp = ${U(T)};`), h.update.append(`if (temp !== ${v})`), m && (h.update.append("{"), h.update.append(`  ${p} = true;`)), h.update.append(`  ${d.name}${W(y)} = ${v} = temp;`), m && h.update.append("}"), i.push(d.template[y]);
        } else {
          let v = d.template[y];
          v instanceof Ke && (v = v.value), h.create.append(`${d.name}${W(y)} = refs[${i.length}];`), i.push(v);
        }
      }
      d.template.update && (typeof d.template.update == "function" ? (h.update.append(`if (${U(i.length)})`), h.update.append(`  ${d.name}.update();`), i.push(d.template.update)) : m ? p && (h.update.append(`if (${p})`), h.update.append(`  ${d.name}.update();`)) : h.update.append(`${d.name}.update();`)), h.render.append(`${d.name}.render(w);`);
    }
    function je(d) {
      Ce(d);
    }
    function Ae(d) {
      o.raw(`<${d.template.type}`);
      let s = [], m = [];
      for (let p of Object.keys(d.template))
        if (!fe(d, p)) {
          if (p == "id") {
            o.raw(' id="'), I(d.template.id), o.raw('"');
            continue;
          }
          if (p == "class") {
            s.push({
              name: d.template[p],
              condition: !0
            });
            continue;
          }
          if (p.startsWith("class_")) {
            s.push({
              name: $e(p.substring(6)),
              condition: d.template[p]
            });
            continue;
          }
          if (p == "style") {
            m.push({
              name: null,
              value: d.template[p]
            });
            continue;
          }
          if (p.startsWith("style_")) {
            m.push({
              name: $e(p.substring(6)),
              value: d.template[p]
            });
            continue;
          }
          if (p == "display") {
            if (d.template.display instanceof Function || typeof d.template.display == "string")
              m.push({
                name: "display",
                value: d.template.display
              });
            else if (d.template.display === !1 || d.template.display === null || d.template.display === void 0)
              m.add({
                name: "display",
                value: "none"
              });
            else if (d.template.display !== !0)
              throw new Error("display property must be set to function, string, true, false, or null");
            continue;
          }
          if (p != "text") {
            if (p.startsWith("attr_")) {
              let y = p.substring(5);
              if (y == "style" || y == "class" || y == "id")
                throw new Error(`Incorrect attribute: use '${y}' instead of '${p}'`);
              h.current_xmlns || (y = $e(y)), o.raw(` ${y}="`), I(d.template[p]), o.raw('"');
              continue;
            }
            throw new Error(`Unknown element template key: ${p}`);
          }
        }
      if (s.length > 0) {
        let p = !1;
        for (let y of s)
          y.condition && (p ? o.raw(" ") : o.raw(' class="'), p = !0, y.condition instanceof Function ? (o.expr(`${U(i.length)} ? "${we(y.name)}" : ""`), i.push(y.condition)) : y.condition && I(y.name));
        p && o.raw('"');
      }
      if (m.length > 0) {
        o.raw(' style="');
        for (let p of m)
          if (p.name === null)
            if (p.value instanceof Function)
              o.expr(`helpers.rawStyle(${U(i.length)})`), i.push(p.value);
            else if (p.value instanceof R) {
              let y = p.value.html.trim();
              y.endsWith(";") || (y += ";"), o.raw(y);
            } else {
              let y = p.value.toString().trim();
              y.endsWith(";") || (y += ";"), o.text(y);
            }
          else
            p.value instanceof Function ? (o.expr(`helpers.rawNamedStyle(${JSON.stringify(p.name)}, ${U(i.length)})`), i.push(p.value)) : p.value !== void 0 && p.value !== null && (o.raw(p.name), o.raw(":"), I(p.value), o.raw(";"));
        o.raw('"');
      }
      d.template.text || d.childNodes.length > 0 ? (o.raw(">"), d.template.text && I(d.template.text), Ce(d), o.raw(`</${d.template.type}>`)) : d.template.type.match(/^(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i) ? o.raw("/>") : o.raw(`></${d.template.type}>`);
    }
    function Ce(d) {
      if (d.childNodes)
        for (let s = 0; s < d.childNodes.length; s++)
          D(d.childNodes[s]);
    }
    function fe(d, s) {
      return Se(s) || s == "export" || s == "bind" || s.startsWith("on_") ? !0 : s == "debug_create" ? (typeof d.template[s] == "function" ? (h.create.append(`if (${U(i.length)})`), h.create.append("  debugger;"), i.push(d.template[s])) : d.template[s] && h.create.append("debugger;"), !0) : s == "debug_render" ? (typeof d.template[s] == "function" ? (h.render.append(`if (${U(i.length)})`), h.render.append("  debugger;"), i.push(d.template[s])) : d.template[s] && h.render.append("debugger;"), !0) : s == "debug_update";
    }
    function Se(d) {
      return d == "type" || d == "childNodes" || d == "xmlns";
    }
    function U(d) {
      return `refs[${d}].call(model, model, context)`;
    }
    function I(d) {
      d instanceof Function ? (o.expr(`helpers.rawText(${U(i.length)})`), i.push(d)) : d instanceof R ? o.raw(d.html) : o.text(d);
    }
    function J(d) {
      (d.isComponent || d.isIntegrated) && (h.destroy.append(`${d.name}.destroy();`), h.destroy.append(`${d.name} = null;`));
    }
  }
}
let Rt = 1;
function yt(r, e) {
  e = e ?? {}, e.compileTemplate = yt;
  let t = kt(r, e), n = new Function("env", "refs", "helpers", "context", t.code);
  return function(a) {
    return a || (a = {}), a.$instanceId = Rt++, n(x, t.refs, et, a ?? {});
  };
}
class Yt extends gt {
  constructor() {
    super(), this.compileTemplate = yt;
  }
}
export {
  Lt as BrowserEnvironment,
  Ke as CloakedValue,
  lt as Component,
  ht as DocumentScrollPosition,
  Ye as EmbedSlot,
  gt as EnvironmentBase,
  Je as ForEachBlock,
  Jt as Html,
  R as HtmlString,
  ke as IfBlock,
  dt as ObservableArray,
  Ht as Router,
  Yt as SSREnvironment,
  zt as Style,
  Ft as Template,
  Pt as Transition,
  Zt as UrlMapper,
  Xt as ViewStateRestoration,
  Gt as WebHistoryRouterDriver,
  Bt as areSetsEqual,
  qt as binarySearch,
  $e as camel_to_dash,
  Vt as cloak,
  Ut as compareStrings,
  jt as compareStringsI,
  yt as compileTemplate,
  kt as compileTemplateCode,
  vt as deepEqual,
  x as env,
  At as html,
  we as htmlEncode,
  Mt as inplace_filter_array,
  We as is_constructor,
  W as member,
  tt as nextFrame,
  Wt as postNextFrame,
  Tt as setEnvironment,
  Dt as urlPattern,
  _t as whenLoaded
};
