var lt = Object.defineProperty;
var Me = (o) => {
  throw TypeError(o);
};
var at = (o, e, t) => e in o ? lt(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var oe = (o, e, t) => at(o, typeof e != "symbol" ? e + "" : e, t), we = (o, e, t) => e.has(o) || Me("Cannot " + t);
var a = (o, e, t) => (we(o, e, "read from private field"), t ? t.call(o) : e.get(o)), S = (o, e, t) => e.has(o) ? Me("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(o) : e.set(o, t), y = (o, e, t, n) => (we(o, e, "write to private field"), n ? n.call(o, t) : e.set(o, t), t), x = (o, e, t) => (we(o, e, "access private method"), t);
let L = {};
typeof document < "u" && (L.document = document);
typeof window < "u" && (L.window = window);
typeof Node < "u" && (L.Node = Node);
function bt(o) {
  L = o;
}
class V {
  constructor(e) {
    this.html = e;
  }
}
function Nt(o) {
  return new V(o);
}
class He {
  constructor(e) {
    this.value = e;
  }
}
function wt(o) {
  return new He(o);
}
let ge = [], ce = null;
class vt {
  static declare(e) {
    ge.push(e), requestAnimationFrame(dt);
  }
}
function dt() {
  ge.length != 0 && (ce == null && (ce = document.createElement("style")), ce.innerHTML += ge.join(`
`), ge = [], ce.parentNode || document.head.appendChild(ce));
}
function St(o, e) {
  for (let t = 0; t < o.length; t++)
    e(o[t], t) || (o.splice(t, 1), t--);
}
function ve(o) {
  return o.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function xe(o) {
  return o instanceof Function && !!o.prototype && !!o.prototype.constructor;
}
function xt(o, e) {
  if (o === e) return !0;
  if (o.size !== e.size) return !1;
  for (const t of o) if (!e.has(t)) return !1;
  return !0;
}
function ht(o, e) {
  if (o === e || o === void 0 && e === void 0)
    return !0;
  if (o === void 0 || e === void 0)
    return !1;
  if (o === null && e === null)
    return !0;
  if (o === null || e === null || typeof o != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(o), n = Object.getOwnPropertyNames(e);
  if (t.length != n.length)
    return !1;
  for (let i of t)
    if (!Object.hasOwn(e, i) || !ht(o[i], e[i]))
      return !1;
  return !0;
}
function _t(o, e, t) {
  let n = 0, i = o.length - 1;
  for (; n <= i; ) {
    let r = Math.floor((n + i) / 2), d = o[r], h = e(d, t);
    if (h == 0)
      return r;
    h < 0 ? n = r + 1 : i = r - 1;
  }
  return -1 - n;
}
function Et(o, e) {
  return o < e ? -1 : o > e ? 1 : 0;
}
function Ct(o, e) {
  return o = o.toLowerCase(), e = e.toLowerCase(), o < e ? -1 : o > e ? 1 : 0;
}
function me() {
  let o = [], e = "";
  function t(...g) {
    for (let m = 0; m < g.length; m++) {
      let c = g[m];
      c.lines ? o.push(...c.lines.map(($) => e + $)) : Array.isArray(c) ? o.push(...c.filter(($) => $ != null).map(($) => e + $)) : o.push(...c.split(`
`).map(($) => e + $));
    }
  }
  function n() {
    e += "  ";
  }
  function i() {
    e = e.substring(2);
  }
  function r() {
    return o.join(`
`) + `
`;
  }
  function d(g) {
    t("{"), n(), g(this), i(), t("}");
  }
  function h(...g) {
    let m = {
      pos: this.lines.length
    };
    return this.append(g), m.headerLineCount = this.lines.length - m.pos, m;
  }
  function N(g, ...m) {
    this.lines.length == g.pos + g.headerLineCount ? this.lines.splice(g.pos, g.headerLineCount) : this.append(m);
  }
  return {
    append: t,
    enterCollapsibleBlock: h,
    leaveCollapsibleBlock: N,
    indent: n,
    unindent: i,
    braced: d,
    toString: r,
    lines: o,
    get isEmpty() {
      return o.length == 0;
    }
  };
}
class ke {
  constructor() {
    this.code = me(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = me();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = me();
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
      code: new ke()
    };
    return this.functions.push(n), n.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((n) => n.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = me();
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
class Pe {
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof V) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof V ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof V) {
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
    if (e[0].parentNode) {
      e[0].replaceWith(...t);
      for (let n = 1; n < e.length; n++)
        e[n].remove();
    }
  }
  static addEventListener(e, t, n, i) {
    function r(d) {
      return i(e(), d);
    }
    return t.addEventListener(n, r), function() {
      t.removeEventListener(n, r);
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
function Ve(o) {
  let e = function() {
    let t = L.document.createComment(o);
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
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
class $e {
  static integrate(e) {
    let t = [], n = [], i = !1, r = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let h = e.branches[d], N = {};
      if (t.push(N), h.condition instanceof Function ? (N.condition = h.condition, i = !1) : h.condition !== void 0 ? (N.condition = () => h.condition, i = !!h.condition) : (N.condition = () => !0, i = !0), h.template !== void 0) {
        let g = new ie(h.template);
        g.isSingleRoot || (r = !1), N.nodeIndex = n.length, n.push(g);
      }
    }
    return delete e.branches, i || t.push({
      condition: () => !0
    }), {
      isSingleRoot: r,
      wantsUpdate: !0,
      nodes: n,
      data: t
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: $e,
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
          type: $e,
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
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(Ve(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = Ve(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    let e = this.resolveActiveBranch();
    if (e != this.activeBranchIndex) {
      let t = this.activeBranch;
      this.activeBranchIndex = e, this.activeBranch = this.branch_constructors[e](), Pe.replaceMany(t.rootNodes, this.activeBranch.rootNodes), t.destroy();
    }
    this.activeBranch.update();
  }
  unbind() {
    var e, t;
    (t = (e = this.activeBranch).unbind) == null || t.call(e);
  }
  bind() {
    var e, t;
    (t = (e = this.activeBranch).bind) == null || t.call(e);
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
function ut(o, e) {
  let t = Math.min(o.length, e.length), n = Math.max(o.length, e.length), i = 0;
  for (; i < t && o[i] == e[i]; )
    i++;
  if (i == n)
    return [];
  if (i == o.length)
    return [{
      op: "insert",
      index: o.length,
      count: e.length - o.length
    }];
  let r = 0;
  for (; r < t - i && o[o.length - r - 1] == e[e.length - r - 1]; )
    r++;
  if (r == o.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - o.length
    }];
  if (i + r == o.length)
    return [{
      op: "insert",
      index: i,
      count: e.length - o.length
    }];
  if (i + r == e.length)
    return [{
      op: "delete",
      index: i,
      count: o.length - e.length
    }];
  let d = o.length - r, h = e.length - r, N = Z(e, i, h), g = null, m = [], c = i, $ = i;
  for (; c < h; ) {
    for (; c < h && o[$] == e[c]; )
      N.delete(e[c], c), c++, $++;
    let u = c, w = $;
    for (; $ < d && !N.has(o[$]); )
      $++;
    if ($ > w) {
      m.push({ op: "delete", index: u, count: $ - w });
      continue;
    }
    for (g || (g = Z(o, c, d)); c < h && !g.has(e[c]); )
      N.delete(e[c], c), c++;
    if (c > u) {
      m.push({ op: "insert", index: u, count: c - u });
      continue;
    }
    break;
  }
  if (c == h)
    return m;
  let l = 0, D = new je();
  for (; $ < d; ) {
    let u = $;
    for (; $ < d && !N.has(o[$]); )
      $++;
    if ($ > u) {
      m.push({ op: "delete", index: c, count: $ - u });
      continue;
    }
    for (; $ < d && N.consume(o[$]) !== void 0; )
      D.add(o[$], l++), $++;
    $ > u && m.push({ op: "store", index: c, count: $ - u });
  }
  for (; c < h; ) {
    let u = c;
    for (; c < h && !D.has(e[c]); )
      c++;
    if (c > u) {
      m.push({ op: "insert", index: u, count: c - u });
      continue;
    }
    let w = { op: "restore", index: c, count: 0 };
    for (m.push(w); c < h; ) {
      let k = D.consume(e[c]);
      if (k === void 0)
        break;
      w.count == 0 ? (w.storeIndex = k, w.count = 1) : w.storeIndex + w.count == k ? w.count++ : (w = { op: "restore", index: c, storeIndex: k, count: 1 }, m.push(w)), c++;
    }
  }
  return m;
  function Z(u, w, k) {
    let ne = new je();
    for (let se = w; se < k; se++)
      ne.add(u[se], se);
    return ne;
  }
}
var q;
class je {
  constructor() {
    S(this, q, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let n = a(this, q).get(e);
    n ? n.push(t) : a(this, q).set(e, [t]);
  }
  delete(e, t) {
    let n = a(this, q).get(e);
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
    let t = a(this, q).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return a(this, q).has(e);
  }
}
q = new WeakMap();
var b, Ee, ye, H, Y, Q, K, We, Ce, Ge, Te, ze, Le, Ze, De, X;
const re = class re {
  constructor(e) {
    S(this, b);
    S(this, H);
    S(this, Y);
    S(this, Q);
    S(this, K);
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = L.document.createComment(" enter foreach block "), this.tailSentinal = L.document.createComment(" leave foreach block "), this.itemConstructor.isSingleRoot ? (y(this, H, x(this, b, ze)), y(this, Q, x(this, b, Ze)), y(this, Y, x(this, b, Le)), y(this, K, x(this, b, De))) : (y(this, H, x(this, b, We)), y(this, Q, x(this, b, Ge)), y(this, Y, x(this, b, Ce)), y(this, K, x(this, b, Te)));
  }
  static integrate(e) {
    let t = {
      itemConstructor: Ae.compile(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, n;
    return e.empty && (n = [new ie(e.empty)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: t,
      nodes: n
    };
  }
  static transform(e) {
    if (e.foreach === void 0)
      return e;
    let t;
    return e.foreach instanceof Function || Array.isArray(e.foreach) ? (t = {
      type: re,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: re,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = re.transform(e[t - 1])), e[t - 1].type === re && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, n) {
    let i = { outer: this.outer };
    if (n == 0 && t == 0) {
      let r = this.observableItems[e], d = [r], h = null;
      this.itemKey && (i.model = r, h = [this.itemKey.call(r, r, i)]), x(this, b, X).call(this, d, h, e, 0, 1);
    } else {
      let r = null, d = this.observableItems.slice(e, e + n);
      this.itemKey && (r = d.map((h) => (i.model = h, this.itemKey.call(h, h, i)))), n && t ? x(this, b, Ee).call(this, e, t, d, r) : t != 0 ? a(this, Q).call(this, e, t) : n != 0 && a(this, H).call(this, d, r, e, 0, n), x(this, b, ye).call(this);
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
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), a(this, Q).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, n = null;
    if (this.observableItems || this.condition && (e = e.filter((i) => (t.model = i, this.condition.call(i, i, t)))), this.itemKey && (n = e.map((i) => (t.model = i, this.itemKey.call(i, i, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, a(this, H).call(this, e, n, 0, 0, e.length), x(this, b, ye).call(this);
      return;
    }
    this.observableItems || x(this, b, Ee).call(this, 0, this.itemDoms.length, e, n);
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
};
b = new WeakSet(), Ee = function(e, t, n, i) {
  let r = e + t, d;
  e == 0 && t == this.itemDoms.length ? d = this.itemDoms : d = this.itemDoms.slice(e, r);
  let h;
  if (i ? h = ut(d.map((u) => u.context.key), i) : n.length > d.length ? h = [{
    op: "insert",
    index: d.length,
    count: n.length - d.length
  }] : n.length < d.length ? h = [{
    op: "delete",
    index: n.length,
    count: d.length - n.length
  }] : h = [], h.length == 0) {
    x(this, b, X).call(this, n, i, e, 0, t);
    return;
  }
  let N = [], g = [], m = {
    insert: $,
    delete: l,
    store: D,
    restore: Z
  }, c = 0;
  for (let u of h)
    u.index > c && (x(this, b, X).call(this, n, i, e + c, c, u.index - c), c = u.index), m[u.op].call(this, u);
  c < n.length && x(this, b, X).call(this, n, i, e + c, c, n.length - c);
  for (let u = g.length - 1; u >= 0; u--)
    g[u].destroy();
  x(this, b, ye).call(this);
  function $(u) {
    c += u.count;
    let w = Math.min(g.length, u.count);
    w && (a(this, Y).call(this, u.index + e, g.splice(0, w)), x(this, b, X).call(this, n, i, u.index + e, u.index, w)), w < u.count && a(this, H).call(this, n, i, u.index + e + w, u.index + w, u.count - w);
  }
  function l(u) {
    g.push(...a(this, K).call(this, u.index + e, u.count));
  }
  function D(u) {
    N.push(...a(this, K).call(this, u.index + e, u.count));
  }
  function Z(u) {
    c += u.count, a(this, Y).call(this, u.index + e, N.slice(u.storeIndex, u.storeIndex + u.count)), x(this, b, X).call(this, n, i, u.index + e, u.index, u.count);
  }
}, ye = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.tailSentinal.parentNode && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.tailSentinal.parentNode)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, H = new WeakMap(), Y = new WeakMap(), Q = new WeakMap(), K = new WeakMap(), We = function(e, t, n, i, r) {
  let d = [];
  for (let h = 0; h < r; h++) {
    let N = {
      outer: this.outer,
      model: e[i + h],
      key: t == null ? void 0 : t[i + h],
      index: n + h
    };
    d.push(this.itemConstructor(N));
  }
  x(this, b, Ce).call(this, n, d);
}, Ce = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = [];
  if (t.forEach((i) => n.push(...i.rootNodes)), this.tailSentinal.parentNode) {
    let i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNodes[0] : i = this.tailSentinal, i.before(...n);
  }
}, Ge = function(e, t) {
  let n = x(this, b, Te).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    itemsDoms[i].destroy();
}, Te = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let i = 0; i < t; i++)
    if (n) {
      let r = this.itemDoms[e + i].rootNodes;
      for (let d = 0; d < r.length; d++)
        r[d].remove();
    }
  return this.itemDoms.splice(e, t);
}, ze = function(e, t, n, i, r) {
  let d = [];
  for (let h = 0; h < r; h++) {
    let N = {
      outer: this.outer,
      model: e[i + h],
      key: t == null ? void 0 : t[i + h],
      index: n + h
    };
    d.push(this.itemConstructor(N));
  }
  x(this, b, Le).call(this, n, d);
}, Le = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = t.map((i) => i.rootNode);
  if (this.tailSentinal.parentNode) {
    let i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNode : i = this.tailSentinal, i.before(...n);
  }
}, Ze = function(e, t) {
  let n = x(this, b, De).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    n[i].destroy();
}, De = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let i = 0; i < t; i++)
    n && this.itemDoms[e + i].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, X = function(e, t, n, i, r) {
  for (let d = 0; d < r; d++) {
    let h = this.itemDoms[n + d];
    h.context.key = t == null ? void 0 : t[i + d], h.context.index = n + d, h.context.model = e[i + d], h.rebind(), h.update();
  }
};
let _e = re;
var I, B, R, ee, O, P, ae, W, G;
const le = class le {
  constructor(e) {
    S(this, I);
    S(this, B);
    S(this, R);
    // either #content, or if #content is a function the return value from the function
    S(this, ee);
    S(this, O);
    S(this, P);
    S(this, ae);
    S(this, W);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    S(this, G, !0);
    y(this, I, e.context), y(this, ae, e.nodes.length > 0 ? e.nodes[0] : null), y(this, ee, L.document.createTextNode("")), y(this, P, L.document.createTextNode("")), y(this, O, []), y(this, G, e.data.ownsContent ?? !0), this.content = e.data.content;
  }
  static integrate(e) {
    let t = {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: {
        content: e.content,
        ownsContent: e.ownsContent ?? !0
      },
      nodes: e.placeholder ? [new ie(e.placeholder)] : []
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, t;
  }
  static transform(e) {
    return e instanceof Function && !xe(e) ? {
      type: le,
      content: e
    } : (e.type == "embed-slot" && (e.type = le), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = le.transform(e[t - 1]), e[t - 1].type === le && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      a(this, ee),
      ...a(this, O),
      a(this, P)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return a(this, G);
  }
  set ownsContent(e) {
    y(this, G, e);
  }
  get content() {
    return a(this, B);
  }
  set content(e) {
    y(this, B, e), a(this, B) instanceof Function ? this.replaceContent(a(this, B).call(a(this, I).model, a(this, I).model, a(this, I))) : this.replaceContent(a(this, B));
  }
  update() {
    a(this, B) instanceof Function && this.replaceContent(a(this, B).call(a(this, I).model, a(this, I).model, a(this, I)));
  }
  bind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, R)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, R)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  replaceContent(e) {
    var t, n;
    if (!(e == a(this, R) || !e && a(this, W))) {
      if (a(this, ee).parentNode != null) {
        let i = a(this, ee).nextSibling;
        for (; i != a(this, P); ) {
          let r = i.nextSibling;
          i.remove(), i = r;
        }
      }
      if (y(this, O, []), a(this, G) && ((n = (t = a(this, R)) == null ? void 0 : t.destroy) == null || n.call(t)), y(this, R, e), y(this, W, !1), !e)
        a(this, ae) && (y(this, R, a(this, ae).call(this, a(this, I))), y(this, W, !0), y(this, O, a(this, R).rootNodes));
      else if (e.rootNodes !== void 0)
        y(this, O, e.rootNodes);
      else if (Array.isArray(e))
        y(this, O, e);
      else if (e instanceof L.Node)
        y(this, O, [e]);
      else if (e instanceof V) {
        let i = L.document.createElement("span");
        i.innerHTML = e.html, y(this, O, [...i.childNodes]);
      } else if (typeof e == "string")
        y(this, O, [L.document.createTextNode(e)]);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      a(this, P).parentNode && a(this, P).before(...a(this, O));
    }
  }
  destroy() {
    var e, t;
    a(this, G) && ((t = (e = a(this, R)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
};
I = new WeakMap(), B = new WeakMap(), R = new WeakMap(), ee = new WeakMap(), O = new WeakMap(), P = new WeakMap(), ae = new WeakMap(), W = new WeakMap(), G = new WeakMap();
let Oe = le;
class Fe {
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
oe(Fe, "plugins", [
  _e,
  Oe,
  $e
]);
class ie {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = Fe.transform(e), xe(e) && (e = { type: e }), this.template = e, xe(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof V) {
      let t = L.document.createElement("div");
      t.innerHTML = e.html, this.kind = "html", this.nodes = [...t.childNodes], this.nodes.forEach((n) => n.remove());
    } else e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (this.integrated = this.template.type.integrate(this.template)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof V) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((t) => {
        t._ && !t.type && (t.type = t._, delete t._);
      }), Fe.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((t) => new ie(t))) : this.childNodes = [];
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
function ct(o, e) {
  let t = 1, n = 1, i = [], r = null, d = new ie(o), h = /* @__PURE__ */ new Map();
  return {
    code: g(d, !0).toString(),
    isSingleRoot: d.isSingleRoot,
    refs: i
  };
  function g(m, c) {
    let $ = {
      emit_text_node: se,
      emit_html_node: Ye,
      emit_dynamic_text_node: Qe,
      emit_comment_node: Ke,
      emit_fragment_node: it,
      emit_element_node: nt,
      emit_integrated_node: et,
      emit_component_node: tt
    }, l = new ke();
    l.create = l.addFunction("create").code, l.bind = l.addFunction("bind").code, l.update = l.addFunction("update").code, l.unbind = l.addFunction("unbind").code, l.destroy = l.addFunction("destroy").code;
    let D;
    c && (D = l.addFunction("rebind").code);
    let Z = /* @__PURE__ */ new Map();
    c && (r = l, r.code.append("let model = context.model;"), r.code.append("let document = Environment.document;")), l.code.append("create();"), l.code.append("bind();"), l.code.append("update();"), ne(m);
    for (let s of m.enumLocalNodes())
      ot(s);
    l.bind.closure.isEmpty || (l.create.append("bind();"), l.destroy.closure.addProlog().append("unbind();"));
    let u = [];
    return m.isSingleRoot && u.push(`  get rootNode() { return ${m.spreadDomNodes()}; },`), c ? (u.push("  context,"), m == d && h.forEach((s, f) => u.push(`  get ${f}() { return ${s}; },`)), l.getFunction("bind").isEmpty ? D.append("model = context.model") : (D.append("if (model != context.model)"), D.braced(() => {
      D.append("unbind();"), D.append("model = context.model"), D.append("bind();");
    })), u.push("  rebind,")) : (u.push("  bind,"), u.push("  unbind,")), l.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${m.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${m.isSingleRoot},`,
      ...u,
      "};"
    ]), l;
    function w(s) {
      s.template.export ? r.addLocal(s.name) : l.addLocal(s.name);
    }
    function k() {
      l.update.temp_declared || (l.update.temp_declared = !0, l.update.append("let temp;"));
    }
    function ne(s) {
      s.name = `n${t++}`, $[`emit_${s.kind}_node`](s);
    }
    function se(s) {
      w(s), l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function Ye(s) {
      s.nodes.length != 0 && (w(s), s.nodes.length == 1 ? (l.create.append(`${s.name} = refs[${i.length}].cloneNode(true);`), i.push(s.nodes[0])) : (l.create.append(`${s.name} = refs[${i.length}].map(x => x.cloneNode(true));`), i.push(s.nodes)));
    }
    function Qe(s) {
      w(s);
      let f = `p${n++}`;
      l.addLocal(f), l.create.append(`${s.name} = helpers.createTextNode("");`), k(), l.update.append(`temp = ${j(i.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${f} = ${j(i.length)});`), i.push(s.template);
    }
    function Ke(s) {
      if (w(s), s.template.text instanceof Function) {
        let f = `p${n++}`;
        l.addLocal(f), l.create.append(`${s.name} = document.createComment("");`), k(), l.update.append(`temp = ${j(i.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name}.nodeValue = ${f} = temp;`), i.push(s.template.text);
      } else
        l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function et(s) {
      let f = [], C = !1;
      if (s.integrated.nodes)
        for (let p = 0; p < s.integrated.nodes.length; p++) {
          let v = s.integrated.nodes[p];
          v.name = `n${t++}`;
          let _ = g(v, !1);
          _.getFunction("bind").isEmpty || (C = !0);
          let Be = `${v.name}_constructor_${p + 1}`, rt = l.addFunction(Be, []);
          _.appendTo(rt.code), f.push(Be);
        }
      s.integrated.wantsUpdate && l.update.append(`${s.name}.update()`), C && (l.bind.append(`${s.name}.bind()`), l.unbind.append(`${s.name}.unbind()`));
      let T = -1;
      s.integrated.data && (T = i.length, i.push(s.integrated.data)), w(s), l.create.append(
        `${s.name} = new refs[${i.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${T}]` : "null"},`,
        `  nodes: [ ${f.join(", ")} ],`,
        "});"
      ), i.push(s.template.type);
      for (let p of Object.keys(s.template))
        if (!Ne(s, p))
          throw new Error(`Unknown element template key: ${p}`);
    }
    function tt(s) {
      w(s), l.create.append(`${s.name} = new refs[${i.length}]();`), i.push(s.template.type);
      let f = new Set(s.template.type.slots ?? []), C = s.template.update === "auto", T = !1;
      for (let p of Object.keys(s.template)) {
        if (Ne(s, p) || p == "update")
          continue;
        if (f.has(p)) {
          if (s.template[p] === void 0)
            continue;
          let _ = new ie(s.template[p]);
          ne(_), _.isSingleRoot ? l.create.append(`${s.name}${A(p)}.content = ${_.name};`) : l.create.append(`${s.name}${A(p)}.content = [${_.spreadDomNodes()}];`);
          continue;
        }
        let v = typeof s.template[p];
        if (v == "string" || v == "number" || v == "boolean")
          l.create.append(`${s.name}${A(p)} = ${JSON.stringify(s.template[p])}`);
        else if (v === "function") {
          C && !T && (T = `${s.name}_mod`, l.update.append(`let ${T} = false;`));
          let _ = `p${n++}`;
          l.addLocal(_);
          let Re = i.length;
          k(), l.update.append(`temp = ${j(Re)};`), l.update.append(`if (temp !== ${_})`), C && (l.update.append("{"), l.update.append(`  ${T} = true;`)), l.update.append(`  ${s.name}${A(p)} = ${_} = temp;`), C && l.update.append("}"), i.push(s.template[p]);
        } else {
          let _ = s.template[p];
          _ instanceof He && (_ = _.value), l.create.append(`${s.name}${A(p)} = refs[${i.length}];`), i.push(_);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (l.update.append(`if (${j(i.length)})`), l.update.append(`  ${s.name}.update();`), i.push(s.template.update)) : C ? T && (l.update.append(`if (${T})`), l.update.append(`  ${s.name}.update();`)) : l.update.append(`${s.name}.update();`));
    }
    function it(s) {
      Ie(s);
    }
    function nt(s) {
      var T;
      let f = l.current_xmlns, C = s.template.xmlns;
      C === void 0 && s.template.type == "svg" && (C = "http://www.w3.org/2000/svg"), C == null && (C = l.current_xmlns), w(s), C ? (l.current_xmlns = C, l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(C)}, ${JSON.stringify(s.template.type)});`)) : l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let p of Object.keys(s.template))
        if (!Ne(s, p)) {
          if (p == "id") {
            J(s.template.id, (v) => `${s.name}.setAttribute("id", ${v});`);
            continue;
          }
          if (p == "class") {
            J(s.template.class, (v) => `${s.name}.setAttribute("class", ${v});`);
            continue;
          }
          if (p.startsWith("class_")) {
            let v = ve(p.substring(6));
            J(s.template[p], (_) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (p == "style") {
            J(s.template.style, (v) => `${s.name}.setAttribute("style", ${v});`);
            continue;
          }
          if (p.startsWith("style_")) {
            let v = ve(p.substring(6));
            J(s.template[p], (_) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (p == "display") {
            if (s.template.display instanceof Function)
              l.addLocal(`${s.name}_prev_display`), J(s.template[p], (v) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${v}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              l.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              l.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (p.startsWith("attr_")) {
            let v = p.substring(5);
            l.current_xmlns || (v = ve(v)), J(s.template[p], (_) => `${s.name}.setAttribute(${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (p == "text") {
            s.template.text instanceof Function ? J(s.template.text, (v) => `helpers.setElementText(${s.name}, ${v})`) : s.template.text instanceof V && l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${p}`);
        }
      Ie(s), (T = s.childNodes) != null && T.length && l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), l.current_xmlns = f;
    }
    function Ie(s) {
      if (s.childNodes)
        for (let f = 0; f < s.childNodes.length; f++)
          ne(s.childNodes[f]);
    }
    function Ne(s, f) {
      if (st(f))
        return !0;
      if (f == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (h.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return h.set(s.template.export, s.name), !0;
      }
      if (f == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (Z.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return Z.set(s.template.bind, !0), l.bind.append(`model${A(s.template.bind)} = ${s.name};`), l.unbind.append(`model${A(s.template.bind)} = null;`), !0;
      }
      if (f.startsWith("on_")) {
        let C = f.substring(3);
        if (!(s.template[f] instanceof Function))
          throw new Error(`event handler for '${f}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let T = `${s.name}_ev${s.listenerCount}`;
        return l.addLocal(T), l.create.append(`${T} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(C)}, refs[${i.length}]);`), i.push(s.template[f]), !0;
      }
      return f == "debug_create" ? (typeof s.template[f] == "function" ? (l.create.append(`if (${j(i.length)})`), l.create.append("  debugger;"), i.push(s.template[f])) : s.template[f] && l.create.append("debugger;"), !0) : f == "debug_update" ? (typeof s.template[f] == "function" ? (l.update.append(`if (${j(i.length)})`), l.update.append("  debugger;"), i.push(s.template[f])) : s.template[f] && l.update.append("debugger;"), !0) : !1;
    }
    function st(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function j(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function J(s, f) {
      if (s instanceof Function) {
        let C = `p${n++}`;
        l.addLocal(C), f(), k(), l.update.append(`temp = ${j(i.length)};`), l.update.append(`if (temp !== ${C})`), l.update.append(`  ${f(C + " = temp")};`), i.push(s);
      } else
        l.create.append(f(JSON.stringify(s)));
    }
    function ot(s) {
      if ((s.isComponent || s.isIntegrated) && l.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let f = 0; f < s.listenerCount; f++)
          l.destroy.append(`${s.name}_ev${f + 1}?.();`), l.destroy.append(`${s.name}_ev${f + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || l.destroy.append(`${s.name} = null;`);
    }
  }
}
let ft = 1;
function pt(o, e) {
  let t = ct(o), n = new Function("Environment", "refs", "helpers", "context", t.code), i = function(r) {
    return r || (r = {}), r.$instanceId = ft++, n(L, t.refs, Pe, r ?? {});
  };
  return i.isSingleRoot = t.isSingleRoot, i;
}
let mt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function A(o) {
  return o.match(mt) ? `.${o}` : `[${JSON.stringify(o)}]`;
}
class Ae {
  static compile() {
    return pt(...arguments);
  }
}
let fe = [], Se = !1;
function Xe(o, e) {
  o && (e = e ?? 0, e != 0 && (Se = !0), fe.push({
    callback: o,
    order: e
  }), fe.length == 1 && L.window.requestAnimationFrame(function() {
    let t = fe;
    Se && (t.sort((n, i) => i.order - n.order), Se = !1), fe = [];
    for (let n = t.length - 1; n >= 0; n--)
      t[n].callback();
  }));
}
function Tt(o) {
  fe.length == 0 ? o() : Xe(o, Number.MAX_SAFE_INTEGER);
}
var F, te, de;
const U = class U extends EventTarget {
  constructor() {
    super();
    S(this, F);
    S(this, te, !1);
    S(this, de, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return Ae.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    a(this, F) || y(this, F, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return a(this, F) || this.init(), a(this, F);
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
    a(this, F) && (this.invalid || (this.invalid = !0, U.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && Xe(() => {
      for (let n = 0; n < this._invalidComponents.length; n++)
        this._invalidComponents[n].validate();
      this._invalidComponents = [];
    }, U.nextFrameOrder);
  }
  update() {
    a(this, F) && (this.invalid = !1, this.dom.update(), a(this, de) && !a(this, te) && (y(this, de, !1), this.dispatchEvent(new Event("loaded"))));
  }
  destroy() {
    a(this, F) && (a(this, F).destroy(), y(this, F, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    a(this, F) && this.rootNodes.forEach((t) => t.remove());
  }
  get loading() {
    return a(this, te);
  }
  set loading(t) {
    t != a(this, te) && (y(this, te, t), t && y(this, de, !0), this.invalidate());
  }
};
F = new WeakMap(), te = new WeakMap(), de = new WeakMap(), oe(U, "_compiledTemplate"), oe(U, "nextFrameOrder", -100), oe(U, "_invalidComponents", []), oe(U, "template", {});
let Je = U;
class Lt {
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
    return new V(e);
  }
}
var z;
const be = class be extends Array {
  constructor() {
    super(...arguments);
    S(this, z, []);
  }
  static from() {
    return new be(...arguments);
  }
  addListener(t) {
    a(this, z).push(t);
  }
  removeListener(t) {
    let n = a(this, z).indexOf(fn);
    n >= 0 && a(this, z).splice(n, 1);
  }
  fire(t, n, i) {
    (n != 0 || i != 0) && a(this, z).forEach((r) => r(t, n, i));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, z).forEach((n) => n(t, 0, 0));
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
    return new be(...t);
  }
};
z = new WeakMap();
let Ue = be;
function gt(o) {
  let e = "^", t = o.length, n;
  for (let r = 0; r < t; r++) {
    n = !0;
    let d = o[r];
    if (d == "?")
      e += "[^\\/]";
    else if (d == "*")
      e += "[^\\/]+";
    else if (d == ":") {
      r++;
      let h = r;
      for (; r < t && i(o[r]); )
        r++;
      let N = o.substring(h, r);
      if (N.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let g = "[^\\/]+";
      if (o[r] == "(") {
        r++, h = r;
        let m = 0;
        for (; r < t; ) {
          if (o[r] == "(")
            m++;
          else if (o[r] == ")") {
            if (m == 0)
              break;
            m--;
          }
          r++;
        }
        if (r >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        g = o.substring(h, r), r++;
      }
      if (r < t && o[r] == "*" || o[r] == "+") {
        let m = o[r];
        r++, o[r] == "/" ? (e += `(?<${N}>(?:${g}\\/)${m})`, r++) : m == "*" ? e += `(?<${N}>(?:${g}\\/)*(?:${g})?\\/?)` : e += `(?<${N}>(?:${g}\\/)*(?:${g})\\/?)`, n = !1;
      } else
        e += `(?<${N}>${g})`;
      r--;
    } else d == "/" ? (e += "\\" + d, r == o.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(d) >= 0 ? (e += "\\" + d, n = d != "/") : e += d;
  }
  return n && (e += "\\/?"), e += "$", e;
  function i(r) {
    return r >= "a" && r <= "z" || r >= "A" && r <= "Z" || r >= "0" && r <= "9" || r == "_" || r == "$";
  }
}
function Dt(o) {
  return o == null ? "" : ("" + o).replace(/["'&<>]/g, function(e) {
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
class qe {
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
var M, pe, E, he, ue;
class yt extends EventTarget {
  constructor() {
    super(...arguments);
    S(this, M, {});
    // Prefix for all url matching
    S(this, pe);
    // The current route
    S(this, E);
    S(this, he, []);
    S(this, ue, !1);
  }
  start() {
    let t = window.sessionStorage.getItem("codeonly-view-states");
    t && y(this, M, JSON.parse(t)), this.load(window.location.pathname, window.history.state ?? { sequence: 0 }), window.history.replaceState(a(this, E).state, null), document.body.addEventListener("click", (n) => {
      let i = n.target.closest("a");
      if (i) {
        let r = i.getAttribute("href");
        this.navigate(r) && n.preventDefault();
      }
    }), window.addEventListener("popstate", (n) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage(), this.load(document.location.pathname, n.state);
    }), window.addEventListener("beforeunload", (n) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage();
    }), window.history.scrollRestoration && (window.history.scrollRestoration = "manual");
  }
  saveViewStatesToLocalStorage() {
    window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(a(this, M)));
  }
  captureCurrentViewState() {
    a(this, E) && (a(this, M)[a(this, E).state.sequence] = a(this, E).handler.captureViewState());
  }
  get prefix() {
    return a(this, pe);
  }
  set prefix(t) {
    y(this, pe, t);
  }
  get current() {
    return a(this, E);
  }
  navigate(t) {
    if (!t.startsWith("/") || this.prefix && t != this.prefix && !t.startsWith(this.prefix + "/"))
      return null;
    this.captureCurrentViewState();
    for (let i of Object.keys(a(this, M)))
      parseInt(i) > a(this, E).state.sequence && delete a(this, M)[i];
    this.saveViewStatesToLocalStorage();
    let n = this.load(t, { sequence: a(this, E).state.sequence + 1 });
    return n ? (window.history.pushState(n.state, null, t), !0) : null;
  }
  replace(t) {
    var n;
    a(this, E).url = t, this.prefix && (t = this.prefix + t), a(this, E).originalUrl = t, a(this, E).match = (n = a(this, E).handler.pattern) == null ? void 0 : n.match(a(this, E).url), window.history.replaceState(a(this, E).state, null, t);
  }
  load(t, n) {
    var d, h, N, g, m, c;
    let i = this.matchUrl(t, n);
    if (!i)
      return null;
    (N = (d = a(this, E)) == null ? void 0 : (h = d.handler).leave) == null || N.call(h, a(this, E)), y(this, E, i);
    let r = new Event("navigate");
    return r.route = i, this.dispatchEvent(r), (g = i.page) != null && g.loading ? i.page.addEventListener("loaded", () => {
      var $, l;
      a(this, E) == i && ((l = ($ = i.handler).restoreViewState) == null || l.call($, i.viewState));
    }, { once: !0 }) : (c = (m = i.handler).restoreViewState) == null || c.call(m, i.viewState), i;
  }
  matchUrl(t, n) {
    a(this, ue) && (a(this, he).sort((r, d) => (r.order ?? 0) - (d.order ?? 0)), y(this, ue, !1));
    let i = {
      url: t,
      state: n,
      viewState: a(this, M)[n.sequence],
      originalUrl: t
    };
    if (this.prefix) {
      if (!t.startsWith(this.prefix))
        return null;
      i.url = t.substring(this.prefix.length);
    }
    for (let r of a(this, he)) {
      if (r.pattern && (i.match = i.url.match(r.pattern), !i.match))
        continue;
      let d = r.match(i);
      if (d === !0 || d == i)
        return i.handler = r, i;
      if (d === null)
        return null;
    }
    return i.handler = {}, i;
  }
  back() {
    if (a(this, E).state.sequence == 0) {
      let t = ((this == null ? void 0 : this.prefix) ?? "") + "/";
      this.load(t, { sequence: 0 }), window.history.replaceState(a(this, E).state, null, t);
    } else
      window.history.back();
  }
  register(t) {
    typeof t.pattern == "string" && (t.pattern = gt(t.pattern)), t.captureViewState === void 0 && t.restoreViewState === void 0 && (t.captureViewState = qe.get, t.restoreViewState = qe.set), a(this, he).push(t), y(this, ue, !0);
  }
}
M = new WeakMap(), pe = new WeakMap(), E = new WeakMap(), he = new WeakMap(), ue = new WeakMap();
let Ot = new yt();
export {
  He as CloakedValue,
  Je as Component,
  qe as DocumentScrollPosition,
  Oe as EmbedSlot,
  L as Environment,
  _e as ForEachBlock,
  Lt as Html,
  V as HtmlString,
  $e as IfBlock,
  Ue as ObservableArray,
  yt as Router,
  vt as Style,
  Ae as Template,
  xt as areSetsEqual,
  _t as binarySearch,
  ve as camel_to_dash,
  wt as cloak,
  Et as compareStrings,
  Ct as compareStringsI,
  ht as deepEqual,
  Nt as html,
  Dt as htmlEncode,
  St as inplace_filter_array,
  xe as is_constructor,
  Xe as nextFrame,
  Tt as postNextFrame,
  Ot as router,
  bt as setEnvironment,
  gt as urlPattern
};
