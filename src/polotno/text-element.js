var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };

Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.TextElement =
    exports.usePrevious =
    exports.getLineHeight =
    exports.useFontLoader =
    exports.getDir =
    exports.isRTLText =
      void 0);

const react_1 = __importDefault(require("react"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_konva_1 = require("react-konva");
const react_konva_utils_1 = require("react-konva-utils");
const mobx_1 = require("mobx");
const konva_1 = __importDefault(require("konva"));
const svg_round_corners_1 = require("svg-round-corners");
const use_color_1 = require("./use-color");
const loader_1 = require("../utils/loader");
const fonts_1 = require("../utils/fonts");
const flags_1 = require("../utils/flags");
const text_1 = require("../utils/text");
const apply_filters_1 = require("./apply-filters");
const use_fadein_1 = require("./use-fadein");
const highlighter_1 = require("./highlighter");
const screen_1 = require("../utils/screen");

const styleNode = document.createElement("style");
styleNode.type = "text/css";
document.head.appendChild(styleNode);

const initialStyles = {
  border: "none",
  padding: "0px",
  overflow: "hidden",
  background: "none",
  outline: "none",
  resize: "none",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
  userSelect: "text",
  wordBreak: "normal",
};

function isRTL(e) {
  var t = "֑-߿‏‫‮יִ-﷽ﹰ-ﻼ";
  return new RegExp("^[^" + t + "]*?[" + t + "]").test(e);
}

function isRTLText(e) {
  e = e.replace(/\s/g, "");
  let t = 0;

  for (var r = 0; r < e.length; r++) {
    isRTL(e[r]) && (t += 1);
  }

  return t > e.length / 2;
}

function getDir(e) {
  return isRTLText(e) ? "rtl" : "ltr";
}

exports.isRTLText = isRTLText;
exports.getDir = getDir;

const TextInput = (0, mobx_react_lite_1.observer)(
    ({
      textNodeRef: e,
      element: t,
      onBlur: r,
      selectAll: n,
      cursorPosition: i,
    }) => {
      const [o, a] = react_1.default.useState(initialStyles),
        l = e.current;

      react_1.default.useLayoutEffect(() => {
        const e = {};
        (e.width = l.width() - 2 * l.padding() + "px"),
          (e.height = l.height() - 2 * l.padding() + 10 + "px"),
          (e.fontSize = l.fontSize() + "px"),
          (e.lineHeight = l.lineHeight() + 0.01),
          (e.fontFamily = l.fontFamily()),
          (e.textAlign = l.align()),
          (e.color = l.fill()),
          (e.fontWeight = t.fontWeight),
          (e.fontStyle = t.fontStyle),
          (e.letterSpacing = t.letterSpacing + "em");

        const r = `\n        .polotno-input::placeholder {\n          color: ${o.color};\n          opacity: 0.6;\n        }\n      `;

        (styleNode.innerHTML = ""),
          styleNode.appendChild(document.createTextNode(r)),
          JSON.stringify(e) !== JSON.stringify(o) && a(e);
      });

      const s = react_1.default.useRef(null);

      react_1.default.useEffect(() => {
        const e = setTimeout(() => {
          var e;
          const t = s.current;

          if (!t) return;
          null === (e = s.current) || void 0 === e || e.focus();
          const r = i || t.value.length;
          (t.selectionStart = t.selectionEnd = r),
            n &&
              (null == t || t.select(),
              document.execCommand("selectAll", !1, null));
        });

        return () => {
          clearTimeout(e);
        };
      }, []),
        react_1.default.useEffect(() => {
          window.addEventListener("blur", r);
          const e = (e) => {
            var t;
            (null === (t = s.current) || void 0 === t
              ? void 0
              : t.contains(e.target)) || r();
          };

          return (
            window.addEventListener("touchstart", e),
            () => {
              window.removeEventListener("blur", r),
                window.removeEventListener("touchstart", e);
            }
          );
        }, []);

      let d = 0;

      const c = l.textArr.length * l.lineHeight() * l.fontSize();

      "middle" === t.verticalAlign && (d = (t.a.height - c) / 2),
        "bottom" === t.verticalAlign && (d = t.a.height - c);

      const u = (0, text_1.removeTags)(t.text);

      return react_1.default.createElement(
        react_konva_utils_1.Html,
        null,
        react_1.default.createElement("textarea", {
          className: "polotno-input",
          ref: s,
          dir: getDir(u),
          style: Object.assign(
            Object.assign(Object.assign({}, initialStyles), o),
            { paddingTop: d + "px" }
          ),
          value: u,
          onChange: (e) => {
            t.set({ text: e.target.value });
          },
          placeholder: t.placeholder,
          onBlur: r,
        })
      );
    }
  ),
  useEditor = (e) => {
    const [t, r] = react_1.default.useState(!1),
      n = react_1.default.useRef(!1);
    return (
      react_1.default.useEffect(() => {
        var t = !0;
        return (
          setTimeout(() => {
            t &&
              (e._editModeEnabled && (n.current = !0),
              r(!0),
              setTimeout(() => {
                n.current = !1;
              }, 50));
          }, 50),
          () => {
            t = !1;
          }
        );
      }, []),
      { editorEnabled: t && e._editModeEnabled, selectAll: n.current }
    );
  },
  useFontLoader = (e, t) => {
    const [r, n] = react_1.default.useReducer((e) => e + 1, 0),
      i = react_1.default.useRef((0, fonts_1.isFontLoaded)(t));
    return (
      react_1.default.useLayoutEffect(() => {
        if (((i.current = (0, fonts_1.isFontLoaded)(t)), i.current)) return;
        let r = !0;
        return (
          (async () => {
            (i.current = !1), n();
            const o = (0, loader_1.incrementLoader)(`text ${t}`);
            await e.loadFont(t),
              konva_1.default.Util.requestAnimFrame(o),
              r && ((i.current = !0), n());
          })(),
          () => {
            r = !1;
          }
        );
      }, [t]),
      [i.current]
    );
  };
exports.useFontLoader = useFontLoader;
const getLineHeight = ({
  fontLoaded: e,
  fontFamily: t,
  fontSize: r,
  lineHeight: n,
}) =>
  react_1.default.useMemo(() => {
    if ("number" == typeof n) return n;
    const e = document.createElement("div");
    (e.style.fontFamily = t),
      (e.style.fontSize = r + "px"),
      (e.style.lineHeight = n),
      (e.innerText = "Test text"),
      document.body.appendChild(e);
    const i = e.offsetHeight;
    return document.body.removeChild(e), i / r;
  }, [e, t, r, n]);
function getRelativePointerPosition(e) {
  var t = e.getAbsoluteTransform().copy();
  t.invert();
  var r = e.getStage().getPointerPosition();
  return t.point(r);
}
function getCursorPosition(e) {
  var t;
  const r = e.target,
    n = getRelativePointerPosition(r),
    i = r.textArr,
    o = Math.floor(n.y / (r.fontSize() * r.lineHeight())),
    a = i.slice(0, o).reduce((e, t) => e + t.text.length, o),
    l = null !== (t = i[o]) && void 0 !== t ? t : i[0];
  let s = 0;
  "right" === r.align()
    ? (s = r.width() - l.width)
    : "center" === r.align() && (s = r.width() / 2 - l.width / 2);
  return a + Math.round(((n.x - s) / l.width) * l.text.length);
}
function usePrevious(e) {
  const t = react_1.default.useRef(e),
    r = react_1.default.useRef(e);
  return (
    react_1.default.useMemo(() => {
      (r.current = t.current), (t.current = e);
    }, [e]),
    r.current
  );
}
function findFitFontSize(e, t) {
  const r = e.fontSize(),
    n = e.height(),
    i = (0, text_1.removeTags)(t.text);
  let o = t.a.fontSize;
  e.height(void 0);
  const a = Math.round(2 * t.a.fontSize) - 1;
  for (let r = 1; r < a; r++) {
    const r = t.a.height && e.height() > t.a.height,
      n = i
        .split("\n")
        .join(" ")
        .split(/[\s-]+/);
    let a = e.textArr.map((e) => e.text).join(";");
    const l = n.find((e) => !a.includes(e) || ((a = a.replace(e, "")), !1));
    if (!(r || l)) break;
    (o -= 0.5), e.fontSize(o);
  }
  return e.fontSize(r), e.height(n), o;
}
function generateBackgroundShape({
  lines: e,
  lineHeight: t,
  width: r,
  align: n = "left",
  padding: i = 0,
  cornerRadius: o = 0,
}) {
  var a;
  e.forEach((e, t) => {
    (e.cx = r / 2),
      "right" === n
        ? (e.cx = r - e.width / 2)
        : "left" === n && (e.cx = e.width / 2),
      "justify" !== n || e.lastInParagraph || (e.width = r),
      "justify" === n && (e.cx = e.width / 2);
  });
  let l = `M ${null === (a = e[0]) || void 0 === a ? void 0 : a.cx} ${-i}`;
  e.forEach((r, n) => {
    const { cx: o } = r,
      a = e[n - 1];
    a && a.width > r.width
      ? (l += ` L ${o + r.width / 2 + i} ${n * t + i}`)
      : (l += ` L ${o + r.width / 2 + i} ${n * t - i}`);
    const s = e[n + 1];
    s && s.width > r.width
      ? (l += ` L ${o + r.width / 2 + i} ${(n + 1) * t - i}`)
      : (l += ` L ${o + r.width / 2 + i} ${(n + 1) * t + i}`);
  });
  for (var s = e.length - 1; s >= 0; s--) {
    const r = e[s],
      { cx: n } = r,
      o = e[s + 1];
    o && o.width > r.width
      ? (l += ` L ${n - r.width / 2 - i} ${(s + 1) * t - i}`)
      : (l += ` L ${n - r.width / 2 - i} ${(s + 1) * t + i}`);
    const a = e[s - 1];
    a && a.width > r.width
      ? (l += ` L ${n - r.width / 2 - i} ${s * t + i}`)
      : (l += ` L ${n - r.width / 2 - i} ${s * t - i}`);
  }
  l += " Z";
  const d = (0, svg_round_corners_1.parsePath)(l);
  return (0, svg_round_corners_1.roundCommands)(d, o).path;
}
(exports.getLineHeight = getLineHeight),
  (exports.usePrevious = usePrevious),
  (exports.TextElement = (0, mobx_react_lite_1.observer)(
    ({ element: e, store: t }) => {
      const r = react_1.default.useRef(null),
        n = react_1.default.useRef(null),
        { editorEnabled: i, selectAll: o } = useEditor(e),
        [a, l] = react_1.default.useState(!1),
        [s, d] = react_1.default.useState(!1),
        c = react_1.default.useRef(e.a.height),
        u = t.selectedElements.indexOf(e) >= 0,
        { textVerticalResizeEnabled: f } = flags_1.flags,
        h = usePrevious(e.fontFamily),
        [g, _] = react_1.default.useState([]);
      react_1.default.useEffect(() => {
        var e, t;
        const n =
          null !==
            (t =
              null === (e = r.current) || void 0 === e ? void 0 : e.textArr) &&
          void 0 !== t
            ? t
            : [];
        JSON.stringify(n) !== JSON.stringify(g) && _(n);
      }),
        react_1.default.useEffect(() => {
          if (e.a.width) return;
          const t = r.current;
          t.width(600), e.set({ width: 1.4 * t.getTextWidth() });
        }, []),
        react_1.default.useLayoutEffect(() =>
          (0, mobx_1.autorun)(() => {
            const t = r.current;
            (0, apply_filters_1.applyFilter)(t, e);
          })
        );
      const [p] = (0, exports.useFontLoader)(t, e.fontFamily),
        x = (0, text_1.removeTags)(e.text),
        v = () => {
          const e = r.current.clone({ height: void 0 }),
            t = Math.ceil(e.fontSize() * e.lineHeight() * e.textArr.length + 1);
          return e.destroy(), t;
        };
      react_1.default.useLayoutEffect(() => {
        if (!p) return;
        const { textOverflow: n } = flags_1.flags;
        if (e.a.height)
          if ("change-font-size" !== n || s || t.isPlaying) {
            if ("resize" === n) {
              const n = v();
              f &&
                e.a.height < n &&
                t.history.ignore(
                  () => {
                    e.set({ height: n }), r.current.height(n);
                  },
                  !1,
                  !0
                ),
                f ||
                  e.a.height === n ||
                  t.history.ignore(
                    () => {
                      e.set({ height: n }), r.current.height(n);
                    },
                    !1,
                    !0
                  );
            }
          } else {
            const n = findFitFontSize(r.current, e);
            if (n !== e.a.fontSize)
              return void t.history.ignore(
                () => {
                  e.set({ fontSize: n });
                },
                !1,
                !0
              );
            const i = v();
            e.a.height === i ||
              f ||
              t.history.ignore(
                () => {
                  e.set({ height: i });
                },
                !1,
                !0
              );
          }
        else {
          const r = v();
          t.history.ignore(
            () => {
              e.set({ height: r });
            },
            !1,
            !0
          );
        }
      }),
        react_1.default.useLayoutEffect(() => {
          const t = r.current;
          t &&
            (t.width(t.width() + 1e-8),
            t._setTextData(),
            (0, apply_filters_1.applyFilter)(t, e));
        }, [p]);
      const m = react_1.default.useRef(null),
        y = react_1.default.useRef(0),
        w = (r) => {
          r.evt.preventDefault();
          const n = t.selectedShapes.find((t) => t === e);
          n &&
            e.contentEditable &&
            ((y.current = getCursorPosition(r)), e.toggleEditMode());
        },
        S = !x && e.placeholder ? 0.6 : e.a.opacity;
      (0, use_fadein_1.useFadeIn)(r, S);
      const b = (0, exports.getLineHeight)({
          fontLoaded: p,
          fontFamily: e.fontFamily,
          fontSize: e.a.fontSize,
          lineHeight: e.lineHeight,
        }),
        E = e.selectable || "admin" === t.role,
        L = (0, use_color_1.useColor)(e),
        T = react_1.default.useMemo(
          () =>
            e.backgroundEnabled
              ? generateBackgroundShape({
                  lines: JSON.parse(JSON.stringify(g)),
                  cornerRadius:
                    e.backgroundCornerRadius * (e.a.fontSize * b * 0.5),
                  lineHeight: b * e.a.fontSize,
                  padding: e.backgroundPadding * (e.a.fontSize * b * 0.5),
                  width: e.a.width,
                  align: e.align,
                })
              : "",
          [
            e.backgroundEnabled,
            e.backgroundCornerRadius,
            e.a.fontSize,
            b,
            e.backgroundPadding,
            e.a.width,
            e.align,
            g,
          ]
        ),
        k = (0, screen_1.useMobile)();
      let z = 0;
      return (
        "middle" === e.verticalAlign
          ? (z = (e.a.height - g.length * b * e.a.fontSize) / 2)
          : "bottom" === e.verticalAlign &&
            (z = e.a.height - g.length * b * e.a.fontSize),
        react_1.default.createElement(
          react_1.default.Fragment,
          null,
          react_1.default.createElement(react_konva_1.Path, {
            ref: n,
            x: e.a.x,
            y: e.a.y,
            rotation: e.a.rotation,
            hideInExport: !e.showInExport || !x,
            listening: !1,
            visible: e.backgroundEnabled,
            opacity: e.backgroundOpacity,
            data: T,
            fill: e.backgroundColor,
            offsetY: -z,
          }),
          react_1.default.createElement(
            react_konva_1.Text,
            Object.assign(
              {
                ref: r,
                id: e.id,
                name: "element",
                hideInExport: !e.showInExport || !x,
                editModeEnabled: e._editModeEnabled,
                x: e.a.x,
                y: e.a.y,
                rotation: e.a.rotation,
                width: e.a.width,
                height: e.a.height,
                text: x || e.placeholder,
              },
              L,
              {
                stroke: e.stroke,
                lineJoin: "round",
                strokeWidth: e.strokeWidth,
                fillAfterStrokeEnabled: !0,
                fontSize: e.a.fontSize,
                fontFamily: `"${e.fontFamily}", "${h}"`,
                fontStyle: e.fontStyle + " " + e.fontWeight,
                textDecoration: e.textDecoration,
                align: e.align,
                verticalAlign: e.verticalAlign,
                draggable: k ? e.draggable && u : e.draggable,
                preventDefault: !k || u,
                opacity: S,
                visible: !e._editModeEnabled,
                ellipsis: "ellipsis" === flags_1.flags.textOverflow,
                shadowEnabled: e.shadowEnabled,
                shadowBlur: e.shadowBlur,
                shadowOffsetX: e.shadowOffsetX,
                shadowOffsetY: e.shadowOffsetY,
                shadowColor: e.shadowColor,
                shadowOpacity: e.shadowOpacity,
                lineHeight: b,
                letterSpacing: e.letterSpacing * e.a.fontSize,
                listening: E,
                onDragMove: (t) => {
                  e.set({ x: t.target.x(), y: t.target.y() });
                },
                onDragEnd: (t) => {
                  e.set({ x: t.target.x(), y: t.target.y() });
                },
                onMouseEnter: () => {
                  l(!0);
                },
                onMouseLeave: () => {
                  l(!1);
                },
                onClick: w,
                onTap: w,
                onTransformStart: () => {
                  d(!0), (c.current = r.current.height());
                },
                onTransform: (t) => {
                  var r, i;
                  const o = t.target;
                  null === (r = n.current) ||
                    void 0 === r ||
                    r.setAttrs({
                      x: o.x(),
                      y: o.y(),
                      rotation: o.rotation(),
                      scale: o.scale(),
                    });
                  const a = (
                    null === (i = o.getStage()) || void 0 === i
                      ? void 0
                      : i.findOne("Transformer")
                  ).getActiveAnchor();
                  if ("middle-left" === a || "middle-right" === a) {
                    const t = o.scaleX(),
                      r = o.width() * t,
                      n = e.a.fontSize;
                    let i = r;
                    r < n && ((i = n), m.current && o.position(m.current)),
                      o.width(i),
                      o.scaleX(1),
                      o.scaleY(1);
                    const a = v();
                    if ("ellipsis" !== flags_1.flags.textOverflow) {
                      const t = Math.max(a, c.current);
                      o.height(t), e.set({ height: o.height() });
                    }
                    e.set({
                      x: o.x(),
                      y: o.y(),
                      width: o.width(),
                      rotation: o.rotation(),
                    }),
                      (0, apply_filters_1.applyFilter)(o, e);
                  }
                  if ("top-center" === a || "bottom-center" === a) {
                    let r =
                      "resize" === flags_1.flags.textOverflow
                        ? v()
                        : b * e.a.fontSize;
                    t.target.height(
                      Math.max(r, t.target.height() * t.target.scaleY())
                    ),
                      t.target.scaleY(1);
                  }
                  t.target.strokeWidth(e.strokeWidth / t.target.scaleX()),
                    (m.current = t.target.position());
                },
                onTransformEnd: (t) => {
                  var r;
                  const i = t.target.scaleX();
                  t.target.scaleX(1),
                    t.target.scaleY(1),
                    t.target.strokeWidth(e.strokeWidth),
                    e.set({
                      fontSize: Math.round(e.a.fontSize * i),
                      width: Math.ceil(t.target.width() * i),
                      x: t.target.x(),
                      y: t.target.y(),
                      rotation: t.target.rotation(),
                      height: t.target.height() * i,
                    }),
                    null === (r = n.current) ||
                      void 0 === r ||
                      r.setAttrs({ scaleX: 1, scaleY: 1 }),
                    d(!1);
                },
              }
            )
          ),
          i &&
            react_1.default.createElement(
              react_konva_1.Group,
              { x: e.a.x, y: e.a.y, rotation: e.a.rotation },
              react_1.default.createElement(TextInput, {
                textNodeRef: r,
                element: e,
                selectAll: o,
                cursorPosition: y.current,
                onBlur: () => {
                  e.toggleEditMode(!1);
                },
              })
            ),
          !s &&
            (a || u) &&
            react_1.default.createElement(highlighter_1.Highlighter, {
              element: e,
            })
        )
      );
    }
  ));
