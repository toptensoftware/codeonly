var Lt = Object.defineProperty;
var st = (r) => {
  throw TypeError(r);
};
var Ct = (r, e, t) => e in r ? Lt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var ie = (r, e, t) => Ct(r, typeof e != "symbol" ? e + "" : e, t), Ue = (r, e, t) => e.has(r) || st("Cannot " + t);
var o = (r, e, t) => (Ue(r, e, "read from private field"), t ? t.call(r) : e.get(r)), v = (r, e, t) => e.has(r) ? st("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), p = (r, e, t, i) => (Ue(r, e, "write to private field"), i ? i.call(r, t) : e.set(r, t), t), S = (r, e, t) => (Ue(r, e, "access private method"), t);
var pe = (r, e, t, i) => ({
  set _(n) {
    p(r, e, n, t);
  },
  get _() {
    return o(r, e, i);
  }
});
function zt(r, e) {
  for (let t = 0; t < r.length; t++)
    e(r[t], t) || (r.splice(t, 1), t--);
}
function je(r) {
  return r.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function ze(r) {
  return r instanceof Function && !!r.prototype && !!r.prototype.constructor;
}
function Pt(r, e) {
  if (r === e) return !0;
  if (r.size !== e.size) return !1;
  for (const t of r) if (!e.has(t)) return !1;
  return !0;
}
function Tt(r, e) {
  if (r === e || r === void 0 && e === void 0)
    return !0;
  if (r === void 0 || e === void 0)
    return !1;
  if (r === null && e === null)
    return !0;
  if (r === null || e === null || typeof r != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(r), i = Object.getOwnPropertyNames(e);
  if (t.length != i.length)
    return !1;
  for (let n of t)
    if (!Object.hasOwn(e, n) || !Tt(r[n], e[n]))
      return !1;
  return !0;
}
function Jt(r, e, t) {
  let i = 0, n = r.length - 1;
  for (; i <= n; ) {
    let a = Math.floor((i + n) / 2), h = r[a], d = e(h, t);
    if (d == 0)
      return a;
    d < 0 ? i = a + 1 : n = a - 1;
  }
  return -1 - i;
}
function At(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function Ht(r, e) {
  return r = r.toLowerCase(), e = e.toLowerCase(), r < e ? -1 : r > e ? 1 : 0;
}
let Mt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function ne(r) {
  return r.match(Mt) ? `.${r}` : `[${JSON.stringify(r)}]`;
}
function Dt(r, e) {
  r.loading ? r.addEventListener("loaded", e, { once: !0 }) : e();
}
class k {
  constructor(e) {
    this.html = e;
  }
}
function Wt(r) {
  return new k(r);
}
class ct {
  constructor(e) {
    this.value = e;
  }
}
function Gt(r) {
  return new ct(r);
}
function Me() {
  let r = [], e = "";
  function t(...m) {
    for (let $ = 0; $ < m.length; $++) {
      let u = m[$];
      u.lines ? r.push(...u.lines.map((N) => e + N)) : Array.isArray(u) ? r.push(...u.filter((N) => N != null).map((N) => e + N)) : r.push(...u.split(`
`).map((N) => e + N));
    }
  }
  function i() {
    e += "  ";
  }
  function n() {
    e = e.substring(2);
  }
  function a() {
    return r.join(`
`) + `
`;
  }
  function h(m) {
    t("{"), i(), m(this), n(), t("}");
  }
  function d(...m) {
    let $ = {
      pos: this.lines.length
    };
    return this.append(m), $.headerLineCount = this.lines.length - $.pos, $;
  }
  function f(m, ...$) {
    this.lines.length == m.pos + m.headerLineCount ? this.lines.splice(m.pos, m.headerLineCount) : this.append($);
  }
  return {
    append: t,
    enterCollapsibleBlock: d,
    leaveCollapsibleBlock: f,
    indent: i,
    unindent: n,
    braced: h,
    toString: a,
    lines: r,
    get isEmpty() {
      return r.length == 0;
    }
  };
}
class Ke {
  constructor() {
    this.code = Me(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = Me();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = Me();
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
    let i = {
      name: e,
      args: t,
      code: new Ke()
    };
    return this.functions.push(i), i.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((i) => i.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = Me();
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
function Fe(r) {
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
class ut {
  static rawText(e) {
    return e instanceof k ? e.html : Fe(e);
  }
  static renderToString(e) {
    let t = "";
    return e({
      write: function(i) {
        t += i;
      }
    }), t;
  }
  static renderComponentToString(e) {
    let t = "";
    return e.render({
      write: function(i) {
        t += i;
      }
    }), t;
  }
  static rawStyle(e) {
    let t;
    return e instanceof k ? t = e.html : t = Fe(e), t = t.trim(), t.endsWith(";") || (t += ";"), t;
  }
  static rawNamedStyle(e, t) {
    if (!t)
      return "";
    let i;
    return t instanceof k ? i = t.html : i = Fe(t), i = i.trim(), i += ";", `${e}:${i}`;
  }
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof k) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof k ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof k) {
      if (e.nodeType == 1)
        return e.innerHTML = t.html, e;
      let i = document.createElement("SPAN");
      return i.innerHTML = t.html, e.replaceWith(i), i;
    } else {
      if (e.nodeType == 3)
        return e.nodeValue = t, e;
      let i = document.createTextNode(t);
      return e.replaceWith(i), i;
    }
  }
  // Set or remove a class on an element
  static setNodeClass(e, t, i) {
    i ? e.classList.add(t) : e.classList.remove(t);
  }
  // Set or remove a style on an element
  static setNodeStyle(e, t, i) {
    i == null ? e.style.removeProperty(t) : e.style[t] = i;
  }
  static setNodeDisplay(e, t, i) {
    if (t === !0) {
      i === null ? e.style.removeProperty("display") : i !== void 0 && e.style.display != i && (e.style.display = i);
      return;
    } else if (t === !1 || t === null || t === void 0) {
      let n = e.style.display;
      return e.style.display != "none" && (e.style.display = "none"), n ?? null;
    } else if (typeof t == "string") {
      let n = e.style.display;
      return e.style.display != t && (e.style.display = t), n ?? null;
    }
  }
  static replaceMany(e, t) {
    var i;
    if ((i = e == null ? void 0 : e[0]) != null && i.parentNode) {
      e[0].replaceWith(...t);
      for (let n = 1; n < e.length; n++)
        e[n].remove();
    }
  }
  static addEventListener(e, t, i, n) {
    function a(h) {
      return n(e(), h);
    }
    return t.addEventListener(i, a), function() {
      t.removeEventListener(i, a);
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
    var i;
    let t = (i = w.document) == null ? void 0 : i.createComment(r);
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
      setMounted(n) {
      },
      destroy() {
      },
      update() {
      },
      render(n) {
        n.write(`<!--${Fe(r)}-->`);
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
var Le;
const Oe = class Oe {
  constructor(e) {
    v(this, Le, !1);
    this.branches = e.data, this.branch_constructors = [], this.context = e.context;
    for (let t of this.branches)
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(rt(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = rt(" IfBlock placeholder ")();
  }
  static integrate(e, t) {
    let i = [], n = [], a = !1, h = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let f = e.branches[d], m = {};
      if (i.push(m), f.condition instanceof Function ? (m.condition = f.condition, a = !1) : f.condition !== void 0 ? (m.condition = () => f.condition, a = !!f.condition) : (m.condition = () => !0, a = !0), f.template !== void 0) {
        let $ = new ee(f.template, t);
        $.isSingleRoot || (h = !1), m.nodeIndex = n.length, n.push($);
      }
    }
    return delete e.branches, a || i.push({
      condition: () => !0
    }), {
      isSingleRoot: h,
      nodes: n,
      data: i
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: Oe,
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
    for (let i = 0; i < e.length; i++) {
      let n = e[i];
      if (n.if)
        t = {
          type: Oe,
          branches: [
            {
              condition: n.if,
              template: n
            }
          ]
        }, delete n.if, e.splice(i, 1, t);
      else if (n.elseif) {
        if (!t)
          throw new Error("template has 'elseif' without a preceeding condition");
        t.branches.push({
          condition: n.elseif,
          template: n
        }), delete n.elseif, e.splice(i, 1), i--;
      } else if (n.else !== void 0) {
        if (!t)
          throw new Error("template has 'else' without a preceeding condition");
        t.branches.push({
          condition: !0,
          template: n
        }), delete n.else, t = null, e.splice(i, 1), i--;
      } else
        t = null;
    }
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
      let i = this.activeBranch;
      this.activeBranchIndex = t, this.activeBranch = this.branch_constructors[t](), ut.replaceMany(i.rootNodes, this.activeBranch.rootNodes), o(this, Le) && (i.setMounted(!1), this.activeBranch.setMounted(!0)), i.destroy();
    }
  }
  resolveActiveBranch() {
    for (let e = 0; e < this.branches.length; e++)
      if (this.branches[e].condition.call(this.context.model, this.context.model, this.context))
        return e;
    throw new Error("internal error, IfBlock didn't resolve to a branch");
  }
  setMounted(e) {
    p(this, Le, e), this.activeBranch.setMounted(e);
  }
  get rootNodes() {
    return this.activeBranch.rootNodes;
  }
  get rootNode() {
    return this.activeBranch.rootNode;
  }
};
Le = new WeakMap();
let Pe = Oe;
function Ft(r, e) {
  let t = Math.min(r.length, e.length), i = Math.max(r.length, e.length), n = 0;
  for (; n < t && r[n] == e[n]; )
    n++;
  if (n == i)
    return [];
  if (n == r.length)
    return [{
      op: "insert",
      index: r.length,
      count: e.length - r.length
    }];
  let a = 0;
  for (; a < t - n && r[r.length - a - 1] == e[e.length - a - 1]; )
    a++;
  if (a == r.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - r.length
    }];
  if (n + a == r.length)
    return [{
      op: "insert",
      index: n,
      count: e.length - r.length
    }];
  if (n + a == e.length)
    return [{
      op: "delete",
      index: n,
      count: r.length - e.length
    }];
  let h = r.length - a, d = e.length - a, f = te(e, n, d), m = null, $ = [], u = n, N = n;
  for (; u < d; ) {
    for (; u < d && r[N] == e[u]; )
      f.delete(e[u], u), u++, N++;
    let c = u, x = N;
    for (; N < h && !f.has(r[N]); )
      N++;
    if (N > x) {
      $.push({ op: "delete", index: c, count: N - x });
      continue;
    }
    for (m || (m = te(r, u, h)); u < d && !m.has(e[u]); )
      f.delete(e[u], u), u++;
    if (u > c) {
      $.push({ op: "insert", index: c, count: u - c });
      continue;
    }
    break;
  }
  if (u == d)
    return $;
  let l = 0, F = new ot();
  for (; N < h; ) {
    let c = N;
    for (; N < h && !f.has(r[N]); )
      N++;
    if (N > c) {
      $.push({ op: "delete", index: u, count: N - c });
      continue;
    }
    for (; N < h && f.consume(r[N]) !== void 0; )
      F.add(r[N], l++), N++;
    N > c && $.push({ op: "store", index: u, count: N - c });
  }
  for (; u < d; ) {
    let c = u;
    for (; u < d && !F.has(e[u]); )
      u++;
    if (u > c) {
      $.push({ op: "insert", index: c, count: u - c });
      continue;
    }
    let x = { op: "restore", index: u, count: 0 };
    for ($.push(x); u < d; ) {
      let B = F.consume(e[u]);
      if (B === void 0)
        break;
      x.count == 0 ? (x.storeIndex = B, x.count = 1) : x.storeIndex + x.count == B ? x.count++ : (x = { op: "restore", index: u, storeIndex: B, count: 1 }, $.push(x)), u++;
    }
  }
  return $;
  function te(c, x, B) {
    let ue = new ot();
    for (let fe = x; fe < B; fe++)
      ue.add(c[fe], fe);
    return ue;
  }
}
var W;
class ot {
  constructor() {
    v(this, W, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let i = o(this, W).get(e);
    i ? i.push(t) : o(this, W).set(e, [t]);
  }
  delete(e, t) {
    let i = o(this, W).get(e);
    if (i) {
      let n = i.indexOf(t);
      if (n >= 0) {
        i.splice(n, 1);
        return;
      }
    }
    throw new Error("key/value pair not found");
  }
  consume(e) {
    let t = o(this, W).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return o(this, W).has(e);
  }
}
W = new WeakMap();
var $e, V, q, y, Ae, Re, G, oe, ae, le, se, ft, He, pt, We, mt, Ge, gt, Ze, re;
const ge = class ge {
  constructor(e) {
    v(this, y);
    v(this, $e);
    v(this, V);
    v(this, q, !1);
    v(this, G);
    v(this, oe);
    v(this, ae);
    v(this, le);
    var t, i;
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], p(this, $e, (t = w.document) == null ? void 0 : t.createComment(" enter foreach block ")), p(this, V, (i = w.document) == null ? void 0 : i.createComment(" leave foreach block ")), this.itemConstructor.isSingleRoot ? (p(this, G, S(this, y, mt)), p(this, ae, S(this, y, gt)), p(this, oe, S(this, y, Ge)), p(this, le, S(this, y, Ze))) : (p(this, G, S(this, y, ft)), p(this, ae, S(this, y, pt)), p(this, oe, S(this, y, He)), p(this, le, S(this, y, We)));
  }
  static integrate(e, t) {
    let i = {
      itemConstructor: t.compileTemplate(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, n;
    return e.empty && (n = [new ee(e.empty, t)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      data: i,
      nodes: n
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
  onObservableUpdate(e, t, i) {
    let n = { outer: this.outer };
    if (i == 0 && t == 0) {
      let a = this.observableItems[e], h = [a], d = null;
      this.itemKey && (n.model = a, d = [this.itemKey.call(a, a, n)]), S(this, y, re).call(this, h, d, e, 0, 1);
    } else {
      let a = null, h = this.observableItems.slice(e, e + i);
      this.itemKey && (a = h.map((d) => (n.model = d, this.itemKey.call(d, d, n)))), i && t ? S(this, y, Ae).call(this, e, t, h, a) : t != 0 ? o(this, ae).call(this, e, t) : i != 0 && o(this, G).call(this, h, a, e, 0, i), S(this, y, Re).call(this);
    }
  }
  get rootNodes() {
    let e = this.emptyDom ? this.emptyDom.rootNodes : [];
    if (this.itemConstructor.isSingleRoot)
      return [o(this, $e), ...this.itemDoms.map((t) => t.rootNode), ...e, o(this, V)];
    {
      let t = [o(this, $e)];
      for (let i = 0; i < this.itemDoms.length; i++)
        t.push(...this.itemDoms[i].rootNodes);
      return t.push(...e), t.push(o(this, V)), t;
    }
  }
  setMounted(e) {
    p(this, q, e), me(this.itemDoms, e);
  }
  update() {
    let e;
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), o(this, ae).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, i = null;
    if (this.observableItems || this.condition && (e = e.filter((n) => (t.model = n, this.condition.call(n, n, t)))), this.itemKey && (i = e.map((n) => (t.model = n, this.itemKey.call(n, n, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, o(this, G).call(this, e, i, 0, 0, e.length), S(this, y, Re).call(this);
      return;
    }
    this.observableItems || S(this, y, Ae).call(this, 0, this.itemDoms.length, e, i);
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
    this.observableItems != null && (this.observableItems.removeListener(this._onObservableUpdate), this.observableItems = null), De(this.itemDoms), this.itemDoms = null;
  }
};
$e = new WeakMap(), V = new WeakMap(), q = new WeakMap(), y = new WeakSet(), Ae = function(e, t, i, n) {
  let a = e + t, h;
  e == 0 && t == this.itemDoms.length ? h = this.itemDoms : h = this.itemDoms.slice(e, a);
  let d;
  if (n ? d = Ft(h.map((c) => c.context.key), n) : i.length > h.length ? d = [{
    op: "insert",
    index: h.length,
    count: i.length - h.length
  }] : i.length < h.length ? d = [{
    op: "delete",
    index: i.length,
    count: h.length - i.length
  }] : d = [], d.length == 0) {
    S(this, y, re).call(this, i, n, e, 0, t);
    return;
  }
  let f = [], m = [], $ = {
    insert: N,
    delete: l,
    store: F,
    restore: te
  }, u = 0;
  for (let c of d)
    c.index > u && (S(this, y, re).call(this, i, n, e + u, u, c.index - u), u = c.index), $[c.op].call(this, c);
  u < i.length && S(this, y, re).call(this, i, n, e + u, u, i.length - u), o(this, q) && me(m, !1), De(m), S(this, y, Re).call(this);
  function N(c) {
    u += c.count;
    let x = Math.min(m.length, c.count);
    x && (o(this, oe).call(this, c.index + e, m.splice(0, x)), S(this, y, re).call(this, i, n, c.index + e, c.index, x)), x < c.count && o(this, G).call(this, i, n, c.index + e + x, c.index + x, c.count - x);
  }
  function l(c) {
    m.push(...o(this, le).call(this, c.index + e, c.count));
  }
  function F(c) {
    f.push(...o(this, le).call(this, c.index + e, c.count));
  }
  function te(c) {
    u += c.count, o(this, oe).call(this, c.index + e, f.slice(c.storeIndex, c.storeIndex + c.count)), S(this, y, re).call(this, i, n, c.index + e, c.index, c.count);
  }
}, Re = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), o(this, y, se) && o(this, V).before(...this.emptyDom.rootNodes), o(this, q) && this.emptyDom.setMounted(!0)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (o(this, y, se))
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    o(this, q) && this.emptyDome.setMounted(!1), this.emptyDom.destroy(), this.emptyDom = null;
  }
}, G = new WeakMap(), oe = new WeakMap(), ae = new WeakMap(), le = new WeakMap(), se = function() {
  var e;
  return ((e = o(this, V)) == null ? void 0 : e.parentNode) != null;
}, ft = function(e, t, i, n, a) {
  let h = [];
  for (let d = 0; d < a; d++) {
    let f = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: i + d
    };
    h.push(this.itemConstructor(f));
  }
  S(this, y, He).call(this, i, h), o(this, q) && me(h, !0);
}, He = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), o(this, y, se)) {
    let i = [];
    t.forEach((a) => i.push(...a.rootNodes));
    let n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNodes[0] : n = o(this, V), n.before(...i);
  }
}, pt = function(e, t) {
  let i = S(this, y, We).call(this, e, t);
  o(this, q) && me(i, !1), De(i);
}, We = function(e, t) {
  if (o(this, y, se))
    for (let i = 0; i < t; i++) {
      let n = this.itemDoms[e + i].rootNodes;
      for (let a = 0; a < n.length; a++)
        n[a].remove();
    }
  return this.itemDoms.splice(e, t);
}, mt = function(e, t, i, n, a) {
  let h = [];
  for (let d = 0; d < a; d++) {
    let f = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: i + d
    };
    h.push(this.itemConstructor(f));
  }
  S(this, y, Ge).call(this, i, h), o(this, q) && me(h, !0);
}, Ge = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), o(this, y, se)) {
    let i = t.map((a) => a.rootNode), n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNode : n = o(this, V), n.before(...i);
  }
}, gt = function(e, t) {
  let i = S(this, y, Ze).call(this, e, t);
  o(this, q) && me(i, !1), De(i);
}, Ze = function(e, t) {
  if (o(this, y, se))
    for (let i = 0; i < t; i++)
      this.itemDoms[e + i].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, re = function(e, t, i, n, a) {
  for (let h = 0; h < a; h++) {
    let d = this.itemDoms[i + h];
    d.context.key = t == null ? void 0 : t[n + h], d.context.index = i + h, d.context.model = e[n + h], d.rebind(), d.update();
  }
};
let Je = ge;
function De(r) {
  for (let e = r.length - 1; e >= 0; e--)
    r[e].destroy();
}
function me(r, e) {
  for (let t = r.length - 1; t >= 0; t--)
    r[t].setMounted(e);
}
var U, z, T, he, M, de, be, Z, X, Ce, Ye, we;
const ye = class ye {
  constructor(e) {
    v(this, Ce);
    v(this, U);
    v(this, z);
    v(this, T);
    // either #content, or if #content is a function the return value from the function
    v(this, he);
    v(this, M);
    v(this, de);
    v(this, be);
    v(this, Z);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    v(this, X, !0);
    v(this, we);
    var t, i;
    p(this, U, e.context), p(this, be, e.nodes[1]), p(this, he, (t = w.document) == null ? void 0 : t.createTextNode("")), p(this, de, (i = w.document) == null ? void 0 : i.createTextNode("")), p(this, M, []), p(this, X, e.data.ownsContent ?? !0), e.nodes[0] ? this.content = e.nodes[0]() : this.content = e.data.content;
  }
  static integrate(e, t) {
    let i = null;
    e.content && typeof e.content == "object" && (i = e.content, delete e.content);
    let n = {
      isSingleRoot: !1,
      data: {
        ownsContent: e.ownsContent ?? !0,
        content: e.content
      },
      nodes: [
        i ? new ee(i, t) : null,
        e.placeholder ? new ee(e.placeholder, t) : null
      ]
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, n;
  }
  static transform(e) {
    return e instanceof Function && !ze(e) ? {
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
      o(this, he),
      ...o(this, M),
      o(this, de)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return o(this, X);
  }
  set ownsContent(e) {
    p(this, X, e);
  }
  get content() {
    return o(this, z);
  }
  set content(e) {
    p(this, z, e), o(this, z) instanceof Function ? this.replaceContent(o(this, z).call(o(this, U).model, o(this, U).model, o(this, U))) : this.replaceContent(o(this, z));
  }
  update() {
    o(this, z) instanceof Function && this.replaceContent(o(this, z).call(o(this, U).model, o(this, U).model, o(this, U)));
  }
  bind() {
    var e, t;
    o(this, Z) && ((t = (e = o(this, T)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    o(this, Z) && ((t = (e = o(this, T)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  get isAttached() {
  }
  setMounted(e) {
    var t, i;
    p(this, we, e), (i = (t = o(this, T)) == null ? void 0 : t.setMounted) == null || i.call(t, e);
  }
  replaceContent(e) {
    var t, i, n, a, h, d;
    if (!(e == o(this, T) || !e && o(this, Z))) {
      if (o(this, Ce, Ye)) {
        let f = o(this, he).nextSibling;
        for (; f != o(this, de); ) {
          let m = f.nextSibling;
          f.remove(), f = m;
        }
      }
      if (o(this, we) && ((i = (t = o(this, T)) == null ? void 0 : t.setMounted) == null || i.call(t, !1)), p(this, M, []), o(this, X) && ((a = (n = o(this, T)) == null ? void 0 : n.destroy) == null || a.call(n)), p(this, T, e), p(this, Z, !1), !e)
        o(this, be) && (p(this, T, o(this, be).call(this, o(this, U))), p(this, Z, !0), p(this, M, o(this, T).rootNodes));
      else if (e.rootNodes !== void 0)
        p(this, M, e.rootNodes);
      else if (Array.isArray(e))
        p(this, M, e);
      else if (w.Node !== void 0 && e instanceof w.Node)
        p(this, M, [e]);
      else if (e instanceof k) {
        let f = w.document.createElement("span");
        f.innerHTML = e.html, p(this, M, [...f.childNodes]);
      } else if (typeof e == "string")
        p(this, M, [w.document.createTextNode(e)]);
      else if (e.render)
        p(this, M, []);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      o(this, Ce, Ye) && o(this, de).before(...o(this, M)), o(this, we) && ((d = (h = o(this, T)) == null ? void 0 : h.setMounted) == null || d.call(h, !0));
    }
  }
  destroy() {
    var e, t;
    o(this, X) && ((t = (e = o(this, T)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
  render(e) {
    var t, i;
    o(this, T) && ((i = (t = o(this, T)).render) == null || i.call(t, e));
  }
};
U = new WeakMap(), z = new WeakMap(), T = new WeakMap(), he = new WeakMap(), M = new WeakMap(), de = new WeakMap(), be = new WeakMap(), Z = new WeakMap(), X = new WeakMap(), Ce = new WeakSet(), Ye = function() {
  var e;
  return ((e = o(this, he)) == null ? void 0 : e.parentNode) != null;
}, we = new WeakMap();
let Xe = ye;
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
    for (let i of this.plugins)
      (t = i.transformGroup) == null || t.call(i, e);
  }
}
ie(Qe, "plugins", [
  Je,
  Xe,
  Pe
]);
class ee {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e, t) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = Qe.transform(e), ze(e) && (e = { type: e }), this.template = e, ze(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof k) {
      if (this.kind = "html", this.html = e.html, w.document) {
        let i = w.document.createElement("div");
        i.innerHTML = e.html, this.nodes = [...i.childNodes], this.nodes.forEach((n) => n.remove());
      }
    } else e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (e.$ && !e.content && (e.content = e.$, delete e.$), this.integrated = this.template.type.integrate(this.template, t)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof k) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((i) => {
        i._ && !i.type && (i.type = i._, delete i._);
      }), Qe.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((i) => new ee(i, t))) : this.childNodes = [];
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
      for (let i = 0; i < t.childNodes.length; i++)
        yield t.childNodes[i].spreadDomNodes();
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
function Rt(r, e) {
  let t = 1, i = 1, n = [], a = null, h = new ee(r, e), d = /* @__PURE__ */ new Map();
  return {
    code: m(h, !0).toString(),
    isSingleRoot: h.isSingleRoot,
    refs: n
  };
  function m($, u) {
    let N = {
      emit_text_node: fe,
      emit_html_node: $t,
      emit_dynamic_text_node: bt,
      emit_comment_node: wt,
      emit_fragment_node: Et,
      emit_element_node: xt,
      emit_integrated_node: vt,
      emit_component_node: Nt
    }, l = new Ke();
    l.create = l.addFunction("create").code, l.bind = l.addFunction("bind").code, l.update = l.addFunction("update").code, l.unbind = l.addFunction("unbind").code, l.setMounted = l.addFunction("setMounted", ["mounted"]).code, l.destroy = l.addFunction("destroy").code;
    let F;
    u && (F = l.addFunction("rebind").code);
    let te = /* @__PURE__ */ new Map();
    u && (a = l, a.code.append("let model = context.model;"), a.code.append("let document = env.document;")), l.code.append("create();"), l.code.append("bind();"), l.code.append("update();"), ue($), l.bind.closure.isEmpty || (l.create.append("bind();"), l.destroy.closure.addProlog().append("unbind();"));
    let c = [];
    return $.isSingleRoot && c.push(`  get rootNode() { return ${$.spreadDomNodes()}; },`), u ? (c.push("  context,"), $ == h && d.forEach((s, g) => c.push(`  get ${g}() { return ${s}; },`)), l.getFunction("bind").isEmpty ? F.append("model = context.model") : (F.append("if (model != context.model)"), F.braced(() => {
      F.append("unbind();"), F.append("model = context.model"), F.append("bind();");
    })), c.push("  rebind,")) : (c.push("  bind,"), c.push("  unbind,")), l.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      "  setMounted,",
      `  get rootNodes() { return [ ${$.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${$.isSingleRoot},`,
      ...c,
      "};"
    ]), l;
    function x(s) {
      s.template.export ? a.addLocal(s.name) : l.addLocal(s.name);
    }
    function B() {
      l.update.temp_declared || (l.update.temp_declared = !0, l.update.append("let temp;"));
    }
    function ue(s) {
      s.name = `n${t++}`, N[`emit_${s.kind}_node`](s);
    }
    function fe(s) {
      x(s), l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function $t(s) {
      s.nodes.length != 0 && (x(s), s.nodes.length == 1 ? (l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`), n.push(s.nodes[0])) : (l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`), n.push(s.nodes)));
    }
    function bt(s) {
      x(s);
      let g = `p${i++}`;
      l.addLocal(g), l.create.append(`${s.name} = helpers.createTextNode("");`), B(), l.update.append(`temp = ${J(n.length)};`), l.update.append(`if (temp !== ${g})`), l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${g} = ${J(n.length)});`), n.push(s.template);
    }
    function wt(s) {
      if (x(s), s.template.text instanceof Function) {
        let g = `p${i++}`;
        l.addLocal(g), l.create.append(`${s.name} = document.createComment("");`), B(), l.update.append(`temp = ${J(n.length)};`), l.update.append(`if (temp !== ${g})`), l.update.append(`  ${s.name}.nodeValue = ${g} = temp;`), n.push(s.template.text);
      } else
        l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function vt(s) {
      let g = [], L = !1;
      if (s.integrated.nodes)
        for (let b = 0; b < s.integrated.nodes.length; b++) {
          let E = s.integrated.nodes[b];
          if (!E) {
            g.push(null);
            continue;
          }
          E.name = `n${t++}`;
          let _ = m(E, !1);
          _.getFunction("bind").isEmpty || (L = !0);
          let nt = `${E.name}_constructor_${b + 1}`, _t = l.addFunction(nt, []);
          _.appendTo(_t.code), g.push(nt);
        }
      l.update.append(`${s.name}.update()`), L && (l.bind.append(`${s.name}.bind()`), l.unbind.append(`${s.name}.unbind()`));
      let C = -1;
      s.integrated.data && (C = n.length, n.push(s.integrated.data)), x(s), l.create.append(
        `${s.name} = new refs[${n.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${C}]` : "null"},`,
        `  nodes: [ ${g.join(", ")} ],`,
        "});"
      ), n.push(s.template.type), l.setMounted.append(`${s.name}.setMounted(mounted);`), l.destroy.append(`${s.name}?.destroy();`), l.destroy.append(`${s.name} = null;`);
      for (let b of Object.keys(s.template))
        if (!qe(s, b))
          throw new Error(`Unknown element template key: ${b}`);
    }
    function Nt(s) {
      x(s), l.create.append(`${s.name} = new refs[${n.length}]();`), n.push(s.template.type);
      let g = new Set(s.template.type.slots ?? []), L = s.template.update === "auto", C = !1;
      l.setMounted.append(`${s.name}.setMounted(mounted);`), l.destroy.append(`${s.name}?.destroy();`), l.destroy.append(`${s.name} = null;`);
      for (let b of Object.keys(s.template)) {
        if (qe(s, b) || b == "update")
          continue;
        if (g.has(b)) {
          if (s.template[b] === void 0)
            continue;
          let _ = new ee(s.template[b], e);
          ue(_), _.isSingleRoot ? l.create.append(`${s.name}${ne(b)}.content = ${_.name};`) : l.create.append(`${s.name}${ne(b)}.content = [${_.spreadDomNodes()}];`);
          continue;
        }
        let E = typeof s.template[b];
        if (E == "string" || E == "number" || E == "boolean")
          l.create.append(`${s.name}${ne(b)} = ${JSON.stringify(s.template[b])}`);
        else if (E === "function") {
          L && !C && (C = `${s.name}_mod`, l.update.append(`let ${C} = false;`));
          let _ = `p${i++}`;
          l.addLocal(_);
          let it = n.length;
          B(), l.update.append(`temp = ${J(it)};`), l.update.append(`if (temp !== ${_})`), L && (l.update.append("{"), l.update.append(`  ${C} = true;`)), l.update.append(`  ${s.name}${ne(b)} = ${_} = temp;`), L && l.update.append("}"), n.push(s.template[b]);
        } else {
          let _ = s.template[b];
          _ instanceof ct && (_ = _.value), l.create.append(`${s.name}${ne(b)} = refs[${n.length}];`), n.push(_);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (l.update.append(`if (${J(n.length)})`), l.update.append(`  ${s.name}.update();`), n.push(s.template.update)) : L ? C && (l.update.append(`if (${C})`), l.update.append(`  ${s.name}.update();`)) : l.update.append(`${s.name}.update();`));
    }
    function Et(s) {
      tt(s);
    }
    function xt(s) {
      var C;
      let g = l.current_xmlns, L = s.template.xmlns;
      L === void 0 && s.template.type == "svg" && (L = "http://www.w3.org/2000/svg"), L == null && (L = l.current_xmlns), x(s), L ? (l.current_xmlns = L, l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(L)}, ${JSON.stringify(s.template.type)});`)) : l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`), l.destroy.append(`${s.name} = null;`);
      for (let b of Object.keys(s.template))
        if (!qe(s, b)) {
          if (b == "id") {
            A(s.template.id, (E) => `${s.name}.setAttribute("id", ${E});`);
            continue;
          }
          if (b == "class") {
            A(s.template.class, (E) => `${s.name}.setAttribute("class", ${E});`);
            continue;
          }
          if (b.startsWith("class_")) {
            let E = je(b.substring(6));
            A(s.template[b], (_) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(E)}, ${_})`);
            continue;
          }
          if (b == "style") {
            A(s.template.style, (E) => `${s.name}.setAttribute("style", ${E});`);
            continue;
          }
          if (b.startsWith("style_")) {
            let E = je(b.substring(6));
            A(s.template[b], (_) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(E)}, ${_})`);
            continue;
          }
          if (b == "display") {
            if (s.template.display instanceof Function)
              l.addLocal(`${s.name}_prev_display`), A(s.template[b], (E) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${E}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              l.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              l.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (b.startsWith("attr_")) {
            let E = b.substring(5);
            if (E == "style" || E == "class" || E == "id")
              throw new Error(`Incorrect attribute: use '${E}' instead of '${b}'`);
            l.current_xmlns || (E = je(E)), A(s.template[b], (_) => `${s.name}.setAttribute(${JSON.stringify(E)}, ${_})`);
            continue;
          }
          if (b == "text") {
            s.template.text instanceof Function ? A(s.template.text, (E) => `helpers.setElementText(${s.name}, ${E})`) : s.template.text instanceof k && l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${b}`);
        }
      tt(s), (C = s.childNodes) != null && C.length && l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), l.current_xmlns = g;
    }
    function tt(s) {
      if (s.childNodes)
        for (let g = 0; g < s.childNodes.length; g++)
          ue(s.childNodes[g]);
    }
    function qe(s, g) {
      if (St(g))
        return !0;
      if (g == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (d.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return d.set(s.template.export, s.name), !0;
      }
      if (g == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (te.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return te.set(s.template.bind, !0), l.bind.append(`model${ne(s.template.bind)} = ${s.name};`), l.unbind.append(`model${ne(s.template.bind)} = null;`), !0;
      }
      if (g.startsWith("on_")) {
        let L = g.substring(3);
        if (!(s.template[g] instanceof Function))
          throw new Error(`event handler for '${g}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let C = `${s.name}_ev${s.listenerCount}`;
        return l.addLocal(C), l.create.append(`${C} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(L)}, refs[${n.length}]);`), n.push(s.template[g]), l.destroy.append(`${C}?.();`), l.destroy.append(`${C} = null;`), !0;
      }
      return g == "debug_create" ? (typeof s.template[g] == "function" ? (l.create.append(`if (${J(n.length)})`), l.create.append("  debugger;"), n.push(s.template[g])) : s.template[g] && l.create.append("debugger;"), !0) : g == "debug_update" ? (typeof s.template[g] == "function" ? (l.update.append(`if (${J(n.length)})`), l.update.append("  debugger;"), n.push(s.template[g])) : s.template[g] && l.update.append("debugger;"), !0) : g == "debug_render";
    }
    function St(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function J(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function A(s, g) {
      if (s instanceof Function) {
        let L = `p${i++}`;
        l.addLocal(L), g(), B(), l.update.append(`temp = ${J(n.length)};`), l.update.append(`if (temp !== ${L})`), l.update.append(`  ${g(L + " = temp")};`), n.push(s);
      } else
        l.create.append(g(JSON.stringify(s)));
    }
  }
}
let It = 1;
function yt(r, e) {
  e = e ?? {}, e.compileTemplate = yt;
  let t = Rt(r, e), i = new Function("env", "refs", "helpers", "context", t.code), n = function(a) {
    return a || (a = {}), a.$instanceId = It++, i(w, t.refs, ut, a ?? {});
  };
  return n.isSingleRoot = t.isSingleRoot, n;
}
let w = null;
var Y;
class Ot extends EventTarget {
  constructor() {
    super();
    v(this, Y, 0);
    this.browser = !1;
  }
  enterLoading() {
    pe(this, Y)._++, o(this, Y) == 1 && this.dispatchEvent(new Event("loading"));
  }
  leaveLoading() {
    pe(this, Y)._--, o(this, Y) == 0 && this.dispatchEvent(new Event("loaded"));
  }
  get loading() {
    return o(this, Y) != 0;
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
Y = new WeakMap();
class kt extends Ot {
  constructor() {
    super(), this.browser = !0, this.document = document, this.compileTemplate = yt, this.window = window, this.requestAnimationFrame = window.requestAnimationFrame.bind(window), this.Node = Node;
  }
}
function Bt(r) {
  w = r;
}
typeof document < "u" && Bt(new kt());
let at = [], Ie = [], Se = null;
class Zt {
  static declare(e) {
    at.push(e), Ie.push(e), w.browser && w.requestAnimationFrame(qt);
  }
  static get all() {
    return at.join(`
`);
  }
}
function qt() {
  Ie.length != 0 && (Se == null && (Se = document.createElement("style")), Se.innerHTML += Ie.join(`
`), Ie = [], Se.parentNode || document.head.appendChild(Se));
}
let _e = [], Ve = !1;
function et(r, e) {
  r && (e = e ?? 0, e != 0 && (Ve = !0), _e.push({
    callback: r,
    order: e
  }), _e.length == 1 && w.requestAnimationFrame(function() {
    let t = _e;
    Ve && (t.sort((i, n) => n.order - i.order), Ve = !1), _e = [];
    for (let i = t.length - 1; i >= 0; i--)
      t[i].callback();
  }));
}
function Xt(r) {
  _e.length == 0 ? r() : et(r, Number.MAX_SAFE_INTEGER);
}
class Ut {
  static compile() {
    return w.compileTemplate(...arguments);
  }
}
var D, Q, ke;
const H = class H extends EventTarget {
  constructor() {
    super();
    v(this, D);
    v(this, Q, 0);
    v(this, ke, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return Ut.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    o(this, D) || p(this, D, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return o(this, D) || this.init(), o(this, D);
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
    o(this, D) && (this.invalid || (this.invalid = !0, H.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && et(() => {
      for (let i = 0; i < this._invalidComponents.length; i++)
        this._invalidComponents[i].validate();
      this._invalidComponents = [];
    }, H.nextFrameOrder);
  }
  update() {
    o(this, D) && (this.invalid = !1, this.dom.update());
  }
  async load(t) {
    pe(this, Q)._++, o(this, Q) == 1 && (this.invalidate(), w.enterLoading(), this.dispatchEvent(new Event("loading")));
    try {
      return await t();
    } finally {
      pe(this, Q)._--, o(this, Q) == 0 && (this.invalidate(), this.dispatchEvent(new Event("loaded")), w.leaveLoading());
    }
  }
  get loading() {
    return o(this, Q) != 0;
  }
  set loading(t) {
    throw new Error("setting Component.loading not supported, use load() function");
  }
  render(t) {
    this.dom.render(t);
  }
  destroy() {
    o(this, D) && (o(this, D).destroy(), p(this, D, null));
  }
  onMount() {
  }
  onUnmount() {
  }
  setMounted(t) {
    var i;
    (i = o(this, D)) == null || i.setMounted(t), p(this, ke, t), t ? this.onMount() : this.onUnmount();
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    o(this, D) && this.rootNodes.forEach((t) => t.remove());
  }
};
D = new WeakMap(), Q = new WeakMap(), ke = new WeakMap(), ie(H, "_compiledTemplate"), ie(H, "nextFrameOrder", -100), ie(H, "_invalidComponents", []), ie(H, "template", {});
let lt = H;
class Yt {
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
    return new k(e);
  }
}
var K;
const Be = class Be extends Array {
  constructor() {
    super(...arguments);
    v(this, K, []);
  }
  static from() {
    return new Be(...arguments);
  }
  addListener(t) {
    o(this, K).push(t);
  }
  removeListener(t) {
    let i = o(this, K).indexOf(fn);
    i >= 0 && o(this, K).splice(i, 1);
  }
  fire(t, i, n) {
    (i != 0 || n != 0) && o(this, K).forEach((a) => a(t, i, n));
  }
  touch(t) {
    t >= 0 && t < this.length && o(this, K).forEach((i) => i(t, 0, 0));
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
  splice(t, i) {
    t < 0 && (t += this.length), t >= this.length && (i = 0, t = this.length), i === void 0 && (i = this.length - t), i < 0 && (i = 0);
    let n = super.splice(...arguments);
    return this.fire(t, i, arguments.length > 2 ? arguments.length - 2 : 0), n;
  }
  sort() {
    super.sort(...arguments), this.fire(0, this.length, this.length);
  }
  setAt(t, i) {
    if (t < 0 || t >= this.length)
      throw new Error("Observable array index out of range");
    this[t] = i, this.fire(t, 1, 1);
  }
  get isObservable() {
    return !0;
  }
  static from(t) {
    return new Be(...t);
  }
};
K = new WeakMap();
let ht = Be;
function jt(r) {
  let e = "^", t = r.length, i;
  for (let a = 0; a < t; a++) {
    i = !0;
    let h = r[a];
    if (h == "?")
      e += "[^\\/]";
    else if (h == "*")
      e += "[^\\/]+";
    else if (h == ":") {
      a++;
      let d = a;
      for (; a < t && n(r[a]); )
        a++;
      let f = r.substring(d, a);
      if (f.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let m = "[^\\/]+";
      if (r[a] == "(") {
        a++, d = a;
        let $ = 0;
        for (; a < t; ) {
          if (r[a] == "(")
            $++;
          else if (r[a] == ")") {
            if ($ == 0)
              break;
            $--;
          }
          a++;
        }
        if (a >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        m = r.substring(d, a), a++;
      }
      if (a < t && r[a] == "*" || r[a] == "+") {
        let $ = r[a];
        a++, r[a] == "/" ? (e += `(?<${f}>(?:${m}\\/)${$})`, a++) : $ == "*" ? e += `(?<${f}>(?:${m}\\/)*(?:${m})?\\/?)` : e += `(?<${f}>(?:${m}\\/)*(?:${m})\\/?)`, i = !1;
      } else
        e += `(?<${f}>${m})`;
      a--;
    } else h == "/" ? (e += "\\" + h, a == r.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(h) >= 0 ? (e += "\\" + h, i = h != "/") : e += h;
  }
  return i && (e += "\\/?"), e += "$", e;
  function n(a) {
    return a >= "a" && a <= "z" || a >= "A" && a <= "Z" || a >= "0" && a <= "9" || a == "_" || a == "$";
  }
}
class Qt {
  constructor(e, t) {
    this.el = e, this.targetClass = t, this.entered = !1, this.pendingTransitions = [], this.detecting = !1, this.transitioning = !1, this.el.addEventListener("transitionend", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitioncancel", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitionrun", this.onTransitionRun.bind(this));
  }
  onTransitionEndOrCancel(e) {
    let t = !1;
    for (let i = 0; i < this.pendingTransitions.length; i++) {
      let n = this.pendingTransitions[i];
      n.target == e.target && n.propertyName == e.propertyName && (this.pendingTransitions.splice(i, 1), t = !0);
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
class dt {
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
var Te, R, O, ce, ve, Ne;
class Kt {
  constructor(e, t) {
    v(this, Te);
    ie(this, "urlMapper");
    // The current route
    v(this, R, null);
    // The route currently being switched to
    v(this, O, null);
    v(this, ce, []);
    v(this, ve, []);
    v(this, Ne, !1);
    p(this, Te, e), e && (this.navigate = e.navigate.bind(e), this.replace = e.navigate.bind(e), this.back = e.back.bind(e)), t && this.register(t);
  }
  start() {
    return o(this, Te).start(this);
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
    return o(this, R);
  }
  get pending() {
    return o(this, O);
  }
  addEventListener(e, t) {
    o(this, ce).push({ event: e, handler: t });
  }
  removeEventListener(e, t) {
    let i = o(this, ce).findIndex((n) => n.event == e && n.handler == t);
    i >= 0 && o(this, ce).splice(i, 1);
  }
  async dispatchEvent(e, t, i, n) {
    for (let a of o(this, ce))
      if (a.event == e) {
        let h = a.handler(i, n);
        if (t && await Promise.resolve(h) == !1)
          return !1;
      }
    return !0;
  }
  // Load a URL with state
  async load(e, t, i) {
    var a, h, d;
    i = i ?? {};
    let n = o(this, R);
    if (((a = o(this, R)) == null ? void 0 : a.url.pathname) == e.pathname && o(this, R).url.search == e.search) {
      let f = (d = (h = o(this, R).handler).hashChange) == null ? void 0 : d.call(h, o(this, R), i);
      f !== void 0 ? i = f : i = Object.assign({}, o(this, R), i);
    }
    if (i = Object.assign(i, {
      current: !1,
      url: e,
      pathname: e.pathname,
      state: t
    }), p(this, O, i), !i.match && (i = await this.matchUrl(e, t, i), !i))
      return null;
    try {
      await this.tryLoad(i) !== !0 && p(this, O, null);
    } catch (f) {
      throw this.dispatchCancelEvents(n, i), f;
    }
    return o(this, O) != i ? (this.dispatchCancelEvents(n, i), null) : (p(this, O, null), i);
  }
  dispatchCancelEvents(e, t) {
    var i, n, a, h, d;
    (a = (i = o(this, R)) == null ? void 0 : (n = i.handler).cancelLeave) == null || a.call(n, e, t), (d = (h = t.handler).cancelEnter) == null || d.call(h, e, t), this.dispatchEvent("cancel", !1, e, t);
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
    var n, a, h, d, f, m, $, u;
    let t = o(this, R), i;
    if (!(t && (!await this.dispatchEvent("mayLeave", !0, t, e) || e != o(this, O) || (i = (a = (n = t.handler).mayLeave) == null ? void 0 : a.call(n, t, e), await Promise.resolve(i) === !1) || e != o(this, O))) && (i = (d = (h = e.handler).mayEnter) == null ? void 0 : d.call(h, t, e), await Promise.resolve(i) !== !1 && e == o(this, O) && await this.dispatchEvent("mayEnter", !0, t, e) && e == o(this, O)))
      return t && (t.current = !1), e.current = !0, p(this, R, e), t && (this.dispatchEvent("didLeave", !1, t, e), (m = t == null ? void 0 : (f = t.handler).didLeave) == null || m.call(f, t, e)), (u = ($ = e.handler).didEnter) == null || u.call($, t, e), this.dispatchEvent("didEnter", !1, t, e), !0;
  }
  async matchUrl(e, t, i) {
    o(this, Ne) && (o(this, ve).sort((n, a) => (n.order ?? 0) - (a.order ?? 0)), p(this, Ne, !1));
    for (let n of o(this, ve)) {
      if (n.pattern && (i.match = i.pathname.match(n.pattern), !i.match))
        continue;
      let a = await Promise.resolve(n.match(i));
      if (a === !0 || a == i)
        return i.handler = n, i;
      if (a === null)
        return null;
    }
    return i.handler = {}, i;
  }
  register(e) {
    Array.isArray(e) || (e = [e]);
    for (let t of e)
      typeof t.pattern == "string" && (t.pattern = new RegExp(jt(t.pattern))), o(this, ve).push(t);
    p(this, Ne, !0);
  }
}
Te = new WeakMap(), R = new WeakMap(), O = new WeakMap(), ce = new WeakMap(), ve = new WeakMap(), Ne = new WeakMap();
var Ee, I, xe;
class ei {
  constructor() {
    v(this, Ee, 0);
    v(this, I);
    v(this, xe, !1);
  }
  async start(e) {
    p(this, I, e), w.document.body.addEventListener("click", (a) => {
      let h = a.target.closest("a");
      if (h) {
        let d = h.getAttribute("href"), f = new URL(d, w.window.location);
        if (f.origin == w.window.location.origin) {
          try {
            f = o(this, I).internalize(f);
          } catch {
            return;
          }
          if (this.navigate(f))
            return a.preventDefault(), !0;
        }
      }
    }), w.window.addEventListener("popstate", async (a) => {
      if (o(this, xe)) {
        p(this, xe, !1);
        return;
      }
      let h = o(this, Ee) + 1, d = o(this, I).internalize(w.window.location), f = a.state ?? { sequence: this.current.state.sequence + 1 };
      await this.load(d, f, { navMode: "pop" }) || h == o(this, Ee) && (p(this, xe, !0), w.window.history.go(this.current.state.sequence - f.sequence));
    });
    let t = o(this, I).internalize(w.window.location), i = w.window.history.state ?? { sequence: 0 }, n = await this.load(t, i, { navMode: "start" });
    return w.window.history.replaceState(i, null), n;
  }
  get current() {
    return o(this, I).current;
  }
  async load(e, t, i) {
    return pe(this, Ee)._++, await o(this, I).load(e, t, i);
  }
  back() {
    this.current.state.sequence == 0 ? (this.replace("/"), this.load("/", { sequence: 0 }, { navMode: "replace" })) : w.window.history.back();
  }
  replace(e) {
    typeof e == "string" && (e = new URL(e, o(this, I).internalize(w.window.location))), this.current.pathname = e.pathname, this.current.url = e, w.window.history.replaceState(
      this.current.state,
      "",
      o(this, I).externalize(e)
    );
  }
  async navigate(e) {
    typeof e == "string" && (e = new URL(e, o(this, I).internalize(w.window.location)));
    let t = await this.load(
      e,
      { sequence: this.current.state.sequence + 1 },
      { navMode: "push" }
    );
    return t && (w.window.history.pushState(
      t.state,
      "",
      o(this, I).externalize(e)
    ), t);
  }
}
Ee = new WeakMap(), I = new WeakMap(), xe = new WeakMap();
class ti {
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
var P, j;
class ii {
  constructor(e) {
    v(this, P);
    v(this, j, {});
    p(this, P, e), w.window.history.scrollRestoration && (w.window.history.scrollRestoration = "manual");
    let t = w.window.sessionStorage.getItem("codeonly-view-states");
    t && p(this, j, JSON.parse(t)), e.addEventListener("mayLeave", (i, n) => (this.captureViewState(), !0)), e.addEventListener("mayEnter", (i, n) => {
      n.viewState = o(this, j)[n.state.sequence];
    }), e.addEventListener("didEnter", (i, n) => {
      if (n.navMode == "push") {
        for (let a of Object.keys(o(this, j)))
          parseInt(a) > n.state.sequence && delete o(this, j)[a];
        this.saveViewStates();
      }
      Dt(w, () => {
        et(() => {
          var a, h;
          if (n.handler.restoreViewState ? n.handler.restoreViewState(n.viewState, n) : o(this, P).restoreViewState ? (h = (a = o(this, P)).restoreViewState) == null || h.call(a, n.viewState, n) : dt.set(n.viewState), w.browser) {
            let d = document.getElementById(n.url.hash.substring(1));
            d == null || d.scrollIntoView();
          }
        });
      });
    }), w.window.addEventListener("beforeunload", (i) => {
      this.captureViewState();
    });
  }
  captureViewState() {
    var t, i;
    let e = o(this, P).current;
    e && (e.handler.captureViewState ? o(this, j)[e.state.sequence] = e.handler.captureViewState(e) : o(this, P).captureViewState ? o(this, j)[e.state.sequence] = (i = (t = o(this, P)).captureViewState) == null ? void 0 : i.call(t, e) : o(this, j)[e.state.sequence] = dt.get()), this.saveViewStates();
  }
  saveViewStates() {
    w.window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(o(this, j)));
  }
}
P = new WeakMap(), j = new WeakMap();
export {
  kt as BrowserEnvironment,
  ct as CloakedValue,
  lt as Component,
  dt as DocumentScrollPosition,
  Xe as EmbedSlot,
  Ot as EnvironmentBase,
  Je as ForEachBlock,
  Yt as Html,
  k as HtmlString,
  Pe as IfBlock,
  ht as ObservableArray,
  Kt as Router,
  Zt as Style,
  Ut as Template,
  Qt as Transition,
  ti as UrlMapper,
  ii as ViewStateRestoration,
  ei as WebHistoryRouterDriver,
  Pt as areSetsEqual,
  Jt as binarySearch,
  je as camel_to_dash,
  Gt as cloak,
  At as compareStrings,
  Ht as compareStringsI,
  Tt as deepEqual,
  w as env,
  Wt as html,
  Fe as htmlEncode,
  zt as inplace_filter_array,
  ze as is_constructor,
  ne as member,
  et as nextFrame,
  Xt as postNextFrame,
  Bt as setEnvironment,
  jt as urlPattern,
  Dt as whenLoaded
};
