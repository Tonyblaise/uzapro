/* @ds-bundle: {"format":4,"namespace":"UzapointDesignSystem_dfe583","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"ICONS","sourcePath":"components/core/iconData.js"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Delta","sourcePath":"components/data/Delta.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"StatusPill","sourcePath":"components/data/StatusPill.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Input.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"PageHeader","sourcePath":"components/navigation/PageHeader.jsx"},{"name":"DEFAULT_MODULES","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"UserChip","sourcePath":"components/navigation/UserChip.jsx"},{"name":"Drawer","sourcePath":"components/overlays/Drawer.jsx"},{"name":"MenuList","sourcePath":"components/overlays/Menu.jsx"},{"name":"Menu","sourcePath":"components/overlays/Menu.jsx"},{"name":"Modal","sourcePath":"components/overlays/Modal.jsx"}],"sourceHashes":{"components/core/Button.jsx":"803122423e95","components/core/Icon.jsx":"8c97857fd777","components/core/IconButton.jsx":"e711bf311701","components/core/Logo.jsx":"ded8bc291c41","components/core/iconData.js":"f1f168274c00","components/data/Card.jsx":"23cbecfaf629","components/data/DataTable.jsx":"13a57a99389d","components/data/Delta.jsx":"2b14a5dc9a8d","components/data/KpiCard.jsx":"f813dd853fc2","components/data/StatusPill.jsx":"401d02c2d7bd","components/forms/Checkbox.jsx":"137ed3403460","components/forms/Input.jsx":"bf6daa0e1ee4","components/forms/Select.jsx":"6b75b6905270","components/navigation/AppHeader.jsx":"09725c32a7ce","components/navigation/NavItem.jsx":"4a2839f2eb19","components/navigation/PageHeader.jsx":"6dd77d0a316a","components/navigation/Sidebar.jsx":"ab6d2af0dbd1","components/navigation/UserChip.jsx":"2eb7b7001ff0","components/overlays/Drawer.jsx":"750191b511a2","components/overlays/Menu.jsx":"ee6c5bb11d3b","components/overlays/Modal.jsx":"d8c72da6bb06","ui_kits/erp-web/Dashboard.jsx":"0ee908de9e2a","ui_kits/erp-web/Inventory.jsx":"a34bea2b7988","ui_kits/erp-web/InvoiceDrawer.jsx":"a851e4dfc877","ui_kits/erp-web/POS.jsx":"d322302cfb31","ui_kits/erp-web/Sales.jsx":"867ff7e8342c","ui_kits/erp-web/data.js":"3f828aec11f9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UzapointDesignSystem_dfe583 = window.UzapointDesignSystem_dfe583 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Logo.jsx
try { (() => {
function Logo({
  size = 'md',
  tileOnly = false,
  style
}) {
  const s = {
    sm: [24, 14, 15],
    md: [32, 18, 18],
    lg: [40, 22, 22]
  }[size] || [32, 18, 18];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: s[0] * 0.3,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: s[0],
      height: s[0],
      borderRadius: 'var(--radius-md)',
      background: 'var(--green-500)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      font: '700 ' + s[1] + 'px/1 var(--font-sans)'
    }
  }, "U"), !tileOnly && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 ' + s[2] + 'px/1 var(--font-sans)',
      color: 'var(--green-600)',
      letterSpacing: '-0.01em'
    }
  }, "Uzapoint"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/iconData.js
try { (() => {
// Lucide icon path data (lucide-static@0.460.0, ISC). Generated — copied from assets/icons/*.svg
const ICONS = {
  "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />",
  "package": "<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\" /> <path d=\"M12 22V12\" /> <path d=\"m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7\" /> <path d=\"m7.5 4.27 9 5.15\" />",
  "boxes": "<path d=\"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z\" /> <path d=\"m7 16.5-4.74-2.85\" /> <path d=\"m7 16.5 5-3\" /> <path d=\"M7 16.5v5.17\" /> <path d=\"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z\" /> <path d=\"m17 16.5-5-3\" /> <path d=\"m17 16.5 4.74-2.85\" /> <path d=\"M17 16.5v5.17\" /> <path d=\"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z\" /> <path d=\"M12 8 7.26 5.15\" /> <path d=\"m12 8 4.74-2.85\" /> <path d=\"M12 13.5V8\" />",
  "factory": "<path d=\"M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\" /> <path d=\"M17 18h1\" /> <path d=\"M12 18h1\" /> <path d=\"M7 18h1\" />",
  "shopping-cart": "<circle cx=\"8\" cy=\"21\" r=\"1\" /> <circle cx=\"19\" cy=\"21\" r=\"1\" /> <path d=\"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12\" />",
  "truck": "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\" /> <path d=\"M15 18H9\" /> <path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\" /> <circle cx=\"17\" cy=\"18\" r=\"2\" /> <circle cx=\"7\" cy=\"18\" r=\"2\" />",
  "calculator": "<rect width=\"16\" height=\"20\" x=\"4\" y=\"2\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"6\" y2=\"6\" /> <line x1=\"16\" x2=\"16\" y1=\"14\" y2=\"18\" /> <path d=\"M16 10h.01\" /> <path d=\"M12 10h.01\" /> <path d=\"M8 10h.01\" /> <path d=\"M12 14h.01\" /> <path d=\"M8 14h.01\" /> <path d=\"M12 18h.01\" /> <path d=\"M8 18h.01\" />",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />",
  "chart-column": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /> <path d=\"M18 17V9\" /> <path d=\"M13 17V5\" /> <path d=\"M8 17v-3\" />",
  "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"8\" /> <path d=\"m21 21-4.3-4.3\" />",
  "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\" /> <path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\" />",
  "plus": "<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\" />",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\" />",
  "chevron-left": "<path d=\"m15 18-6-6 6-6\" />",
  "chevron-up": "<path d=\"m18 15-6-6-6 6\" />",
  "arrow-up": "<path d=\"m5 12 7-7 7 7\" /> <path d=\"M12 19V5\" />",
  "arrow-down": "<path d=\"M12 5v14\" /> <path d=\"m19 12-7 7-7-7\" />",
  "ellipsis": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"19\" cy=\"12\" r=\"1\" /> <circle cx=\"5\" cy=\"12\" r=\"1\" />",
  "ellipsis-vertical": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"12\" cy=\"5\" r=\"1\" /> <circle cx=\"12\" cy=\"19\" r=\"1\" />",
  "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />",
  "check": "<path d=\"M20 6 9 17l-5-5\" />",
  "filter": "<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\" />",
  "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <polyline points=\"7 10 12 15 17 10\" /> <line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />",
  "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <polyline points=\"17 8 12 3 7 8\" /> <line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\" />",
  "calendar": "<path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" />",
  "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M10 9H8\" /> <path d=\"M16 13H8\" /> <path d=\"M16 17H8\" />",
  "receipt": "<path d=\"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z\" /> <path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /> <path d=\"M12 17.5v-11\" />",
  "credit-card": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /> <line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\" />",
  "banknote": "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\" /> <circle cx=\"12\" cy=\"12\" r=\"2\" /> <path d=\"M6 12h.01M18 12h.01\" />",
  "wallet": "<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\" /> <path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\" />",
  "store": "<path d=\"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7\" /> <path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\" /> <path d=\"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4\" /> <path d=\"M2 7h20\" /> <path d=\"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7\" />",
  "tag": "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\" /> <circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />",
  "trash-2": "<path d=\"M3 6h18\" /> <path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /> <path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /> <line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /> <line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />",
  "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /> <path d=\"m15 5 4 4\" />",
  "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "log-out": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /> <polyline points=\"16 17 21 12 16 7\" /> <line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" />",
  "circle-help": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /> <path d=\"M12 17h.01\" />",
  "printer": "<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /> <path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" /> <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />",
  "minus": "<path d=\"M5 12h14\" />",
  "scan-barcode": "<path d=\"M3 7V5a2 2 0 0 1 2-2h2\" /> <path d=\"M17 3h2a2 2 0 0 1 2 2v2\" /> <path d=\"M21 17v2a2 2 0 0 1-2 2h-2\" /> <path d=\"M7 21H5a2 2 0 0 1-2-2v-2\" /> <path d=\"M8 7v10\" /> <path d=\"M12 7v10\" /> <path d=\"M17 7v10\" />",
  "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />",
  "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m9 12 2 2 4-4\" />",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />",
  "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /> <path d=\"M21 3v5h-5\" /> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /> <path d=\"M8 16H3v5\" />",
  "menu": "<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" /> <line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\" /> <line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\" />",
  "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /> <path d=\"M12 18h.01\" />",
  "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /> <path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" />",
  "phone": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\" />",
  "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /> <circle cx=\"12\" cy=\"7\" r=\"4\" />",
  "arrow-up-right": "<path d=\"M7 7h10v10\" /> <path d=\"M7 17 17 7\" />",
  "sliders-horizontal": "<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\" /> <line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\" /> <line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\" /> <line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\" /> <line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\" /> <line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\" /> <line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\" /> <line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\" /> <line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\" />",
  "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /> <path d=\"M12 11h4\" /> <path d=\"M12 16h4\" /> <path d=\"M8 11h.01\" /> <path d=\"M8 16h.01\" />",
  "layout-grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />"
};
Object.assign(__ds_scope, { ICONS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/iconData.js", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Icon({
  name,
  size = 16,
  stroke = 1.5,
  color = 'currentColor',
  style,
  title,
  ...rest
}) {
  const inner = __ds_scope.ICONS[name];
  if (!inner) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke * 24 / size,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": title ? undefined : true,
    role: title ? 'img' : undefined,
    style: {
      flex: 'none',
      display: 'block',
      ...style
    }
  }, rest, {
    dangerouslySetInnerHTML: {
      __html: (title ? '<title>' + title + '</title>' : '') + inner
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const VARIANTS = {
  primary: {
    bg: 'var(--action)',
    hover: 'var(--action-hover)',
    fg: 'var(--text-on-action)',
    border: 'transparent'
  },
  secondary: {
    bg: 'var(--surface)',
    hover: 'var(--surface-hover)',
    fg: 'var(--text)',
    border: 'var(--border-strong)'
  },
  soft: {
    bg: 'var(--action-soft)',
    hover: 'var(--action-soft-hover)',
    fg: 'var(--green-700)',
    border: 'transparent'
  },
  ghost: {
    bg: 'transparent',
    hover: 'var(--grey-100)',
    fg: 'var(--text)',
    border: 'transparent'
  },
  danger: {
    bg: 'var(--danger-text)',
    hover: '#932015',
    fg: '#fff',
    border: 'transparent'
  }
};
const SIZES = {
  sm: ['var(--control-height-sm)', '0 10px', 13, 14],
  md: ['var(--control-height)', '0 14px', 14, 16],
  lg: ['var(--control-height-lg)', '0 18px', 15, 18]
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  children,
  style,
  type = 'button',
  ...rest
}) {
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      height: s[0],
      padding: s[1],
      width: fullWidth ? '100%' : undefined,
      font: '500 ' + s[2] + 'px/1 var(--font-sans)',
      whiteSpace: 'nowrap',
      background: h && !disabled ? v.hover : v.bg,
      color: v.fg,
      border: '1px solid ' + v.border,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transform: p && !disabled ? 'translateY(1px)' : 'none',
      transition: 'background var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s[3]
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s[3]
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  badge,
  active,
  style,
  ...rest
}) {
  const [h, setH] = useState(false);
  const d = {
    sm: [30, 16],
    md: [36, 18],
    lg: [44, 18]
  }[size] || [36, 18];
  const bordered = variant === 'secondary';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      position: 'relative',
      width: d[0],
      height: d[0],
      display: 'inline-grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      color: active ? 'var(--green-700)' : 'var(--text)',
      background: active ? 'var(--action-soft)' : h ? bordered ? 'var(--surface-hover)' : 'var(--grey-100)' : bordered ? 'var(--surface)' : 'transparent',
      border: '1px solid ' + (bordered ? 'var(--border-strong)' : 'transparent'),
      padding: 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: d[1]
  }), badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--danger)',
      boxShadow: '0 0 0 2px var(--surface)'
    }
  }) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function Card({
  title,
  subtitle,
  action,
  cap,
  padding = 'var(--space-5)',
  children,
  style,
  bodyStyle
}) {
  const flush = padding === '0' || padding === 0;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      ...(cap ? {
        borderTop: '3px solid var(--green-500)'
      } : null),
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: flush ? 'var(--space-4) var(--space-5)' : padding,
      paddingBottom: flush ? 'var(--space-4)' : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--type-card-title)',
      color: 'var(--text)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, subtitle)), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padding,
      flex: 1,
      minWidth: 0,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
const {
  useState
} = React;
const th = {
  font: 'var(--type-table-head)',
  letterSpacing: 'var(--tracking-caps)',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  padding: '10px var(--space-4)',
  background: 'var(--canvas)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  textAlign: 'left'
};
const td = {
  font: 'var(--type-body)',
  color: 'var(--text-secondary)',
  padding: '12px var(--space-4)',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums'
};
function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  onRowClick,
  sortKey,
  sortDir = 'desc',
  onSort,
  empty = 'Nothing to show.',
  style
}) {
  const [hover, setHover] = useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 560
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      ...th,
      textAlign: 'center',
      width: c.width,
      cursor: c.sortable ? 'pointer' : 'default'
    },
    onClick: () => c.sortable && onSort && onSort(c.key)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, c.label, c.sortable && sortKey === c.key && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: sortDir === 'asc' ? 'chevron-up' : 'chevron-down',
    size: 12
  })))))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      ...td,
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '32px'
    }
  }, empty)), rows.map((r, i) => {
    const k = r[rowKey] ?? i;
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      onClick: () => onRowClick && onRowClick(r),
      onMouseEnter: () => setHover(k),
      onMouseLeave: () => setHover(null),
      style: {
        background: hover === k && onRowClick ? 'var(--surface-hover)' : 'transparent',
        cursor: onRowClick ? 'pointer' : 'default'
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        ...td,
        textAlign: c.align || 'center'
      }
    }, c.render ? c.render(r) : r[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Delta.jsx
try { (() => {
function Delta({
  value,
  good = 'up',
  suffix = '%',
  style
}) {
  const up = value >= 0;
  const positive = up && good === 'up' || !up && good === 'down';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color: value === 0 ? 'var(--text-muted)' : positive ? 'var(--success-text)' : 'var(--danger-text)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, value === 0 ? '→' : up ? '↑' : '↓', " ", Math.abs(value).toFixed(1), suffix);
}
Object.assign(__ds_scope, { Delta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Delta.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiCard.jsx
try { (() => {
function KpiCard({
  label,
  value,
  delta,
  good = 'up',
  caption = 'vs last month',
  icon,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--green-50)',
      color: 'var(--green-700)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-kpi)',
      color: 'var(--text)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), delta !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Delta, {
    value: delta,
    good: good
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, caption)));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/data/StatusPill.jsx
try { (() => {
const KEYS = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  danger: 'danger',
  neutral: 'status-neutral'
};
function StatusPill({
  status = 'neutral',
  children,
  dot = true,
  style
}) {
  const k = KEYS[status] || KEYS.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 22,
      padding: '0 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--' + k + '-soft)',
      color: 'var(--' + k + '-text)',
      font: 'var(--type-caption)',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: 'var(--' + k + ')'
    }
  }), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  disabled,
  style
}) {
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      font: 'var(--type-body)',
      color: 'var(--text)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: 4,
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      background: on ? 'var(--action)' : 'var(--surface)',
      border: '1px solid ' + (on ? 'var(--action)' : 'var(--border-strong)'),
      color: '#fff'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 12,
    stroke: 2
  }) : checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12,
    stroke: 2
  }) : null), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function Field({
  label,
  hint,
  error,
  children,
  htmlFor
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: 'var(--type-label)',
      color: 'var(--text)'
    }
  }, label), children, (error || hint) && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: error ? 'var(--danger-text)' : 'var(--text-muted)'
    }
  }, error || hint));
}
function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  size = 'md',
  id,
  style,
  disabled,
  ...rest
}) {
  const [f, setF] = useState(false);
  const h = {
    sm: 'var(--control-height-sm)',
    md: 'var(--control-height)',
    lg: 'var(--control-height-lg)'
  }[size];
  const box = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      height: h,
      padding: '0 12px',
      background: disabled ? 'var(--grey-50)' : 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid ' + (error ? 'var(--danger)' : f ? 'var(--action)' : 'var(--border-strong)'),
      boxShadow: f ? '0 0 0 3px ' + (error ? 'var(--danger-soft)' : 'var(--green-100)') : 'none',
      color: 'var(--text-muted)',
      transition: 'box-shadow var(--duration-fast)',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    disabled: disabled,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      font: 'var(--type-body)',
      color: 'var(--text)',
      padding: 0
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, suffix));
  if (!label && !hint && !error) return box;
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: id
  }, box);
}
Object.assign(__ds_scope, { Field, Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function Select({
  label,
  hint,
  error,
  options = [],
  size = 'md',
  id,
  style,
  ...rest
}) {
  const [f, setF] = useState(false);
  const h = {
    sm: 'var(--control-height-sm)',
    md: 'var(--control-height)',
    lg: 'var(--control-height-lg)'
  }[size];
  const box = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: h,
      padding: '0 34px 0 12px',
      font: 'var(--type-body)',
      color: 'var(--text)',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid ' + (error ? 'var(--danger)' : f ? 'var(--action)' : 'var(--border-strong)'),
      boxShadow: f ? '0 0 0 3px var(--green-100)' : 'none',
      outline: 0,
      cursor: 'pointer'
    }
  }, rest), options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  })));
  if (!label && !hint && !error) return box;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: id
  }, box);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
const {
  useState
} = React;
function NavItem({
  icon,
  label,
  active,
  count,
  onClick,
  style
}) {
  const [h, setH] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    "aria-current": active ? 'page' : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      width: '100%',
      height: 38,
      padding: '0 var(--space-3)',
      border: 0,
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      textAlign: 'left',
      font: active ? '600 14px/20px var(--font-sans)' : 'var(--type-label)',
      background: active ? 'var(--action)' : h ? 'var(--grey-100)' : 'transparent',
      color: active ? 'var(--text-on-action)' : 'var(--text-secondary)',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, label), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-micro)',
      padding: '2px 7px',
      borderRadius: 999,
      background: active ? 'rgba(255,255,255,.2)' : 'var(--grey-100)',
      color: active ? '#fff' : 'var(--text-muted)'
    }
  }, count));
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageHeader.jsx
try { (() => {
function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      flexWrap: 'wrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 4
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--type-h1)',
      color: 'var(--text)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: 'wrap'
    }
  }, actions));
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
const DEFAULT_MODULES = [{
  id: 'home',
  label: 'Dashboard',
  icon: 'house'
}, {
  id: 'products',
  label: 'Products',
  icon: 'package'
}, {
  id: 'inventory',
  label: 'Inventory',
  icon: 'boxes'
}, {
  id: 'manufacturing',
  label: 'Manufacturing',
  icon: 'factory'
}, {
  id: 'sales',
  label: 'Sales & POS',
  icon: 'shopping-cart'
}, {
  id: 'purchasing',
  label: 'Purchasing',
  icon: 'truck'
}, {
  id: 'accounting',
  label: 'Accounting',
  icon: 'calculator'
}, {
  id: 'crm',
  label: 'CRM',
  icon: 'users'
}, {
  id: 'reports',
  label: 'Reports',
  icon: 'chart-column'
}];
function Sidebar({
  items = DEFAULT_MODULES,
  activeId,
  onSelect,
  footer,
  style
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flex: 'none',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-5) var(--space-4)',
      gap: 'var(--space-6)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    size: "md"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, items.map(it => /*#__PURE__*/React.createElement(__ds_scope.NavItem, {
    key: it.id,
    icon: it.icon,
    label: it.label,
    count: it.count,
    active: it.id === activeId,
    onClick: () => onSelect && onSelect(it.id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, footer || /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.NavItem, {
    icon: "settings",
    label: "Settings"
  }), /*#__PURE__*/React.createElement(__ds_scope.NavItem, {
    icon: "circle-help",
    label: "Help"
  }))));
}
Object.assign(__ds_scope, { DEFAULT_MODULES, Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/UserChip.jsx
try { (() => {
const {
  useState
} = React;
function UserChip({
  name,
  role,
  initials,
  onClick,
  style
}) {
  const [h, setH] = useState(false);
  const ini = initials || (name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '4px 8px 4px 4px',
      border: 0,
      borderRadius: 'var(--radius-pill)',
      background: h ? 'var(--grey-100)' : 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: 'var(--green-100)',
      color: 'var(--green-700)',
      display: 'grid',
      placeItems: 'center',
      font: '600 13px/1 var(--font-sans)'
    }
  }, ini), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, name), role && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, role)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14
  })));
}
Object.assign(__ds_scope, { UserChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/UserChip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
function AppHeader({
  user = {
    name: 'Tony Mwangi',
    role: 'Owner'
  },
  search = '',
  onSearch,
  unread = true,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-6)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Input, {
    icon: "search",
    placeholder: "Search products, invoices, customers",
    value: search,
    onChange: e => onSearch && onSearch(e.target.value),
    style: {
      width: '100%',
      maxWidth: 420,
      background: 'var(--canvas)',
      borderColor: 'transparent'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), children, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "circle-help",
    label: "Help"
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "bell",
    label: "Notifications",
    badge: unread
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 28,
      background: 'var(--border)'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.UserChip, {
    name: user.name,
    role: user.role
  }));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Drawer.jsx
try { (() => {
function Drawer({
  open,
  title,
  subtitle,
  onClose,
  footer,
  width = 440,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      pointerEvents: open ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--overlay)',
      opacity: open ? 1 : 0,
      transition: 'opacity var(--duration-base) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("aside", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: width,
      background: 'var(--surface)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'none' : 'translateX(100%)',
      transition: 'transform var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--space-5) var(--space-6)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--type-h2)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, subtitle)), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    size: "sm",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 'var(--space-6)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6)',
      borderTop: '1px solid var(--border)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Drawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Drawer.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Menu.jsx
try { (() => {
const {
  useState,
  useEffect,
  useRef
} = React;
function MenuList({
  items = [],
  onPick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      minWidth: 180,
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-lg)',
      padding: 4,
      ...style
    }
  }, items.map((it, i) => it === '-' ? /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 1,
      background: 'var(--border)',
      margin: '4px 0'
    }
  }) : /*#__PURE__*/React.createElement(MenuRow, {
    key: i,
    item: it,
    onPick: onPick
  })));
}
function MenuRow({
  item,
  onPick
}) {
  const [h, setH] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    onClick: () => {
      item.onClick && item.onClick();
      onPick && onPick(item);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      width: '100%',
      height: 34,
      padding: '0 10px',
      border: 0,
      borderRadius: 'var(--radius-sm)',
      background: h ? item.danger ? 'var(--danger-soft)' : 'var(--grey-100)' : 'transparent',
      color: item.danger ? 'var(--danger-text)' : 'var(--text)',
      font: 'var(--type-body)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, item.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: item.icon,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, item.label), item.hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, item.hint));
}
function Menu({
  trigger,
  items,
  align = 'right',
  style
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const off = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      display: 'inline-block',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(o => !o)
  }, trigger), open && /*#__PURE__*/React.createElement(MenuList, {
    items: items,
    onPick: () => setOpen(false),
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      [align]: 0,
      zIndex: 20
    }
  }));
}
Object.assign(__ds_scope, { MenuList, Menu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Menu.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Modal.jsx
try { (() => {
function Modal({
  open,
  title,
  subtitle,
  onClose,
  footer,
  width = 480,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--overlay)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 100,
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '90vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--space-6) var(--space-6) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--type-h2)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, subtitle)), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "Close",
    size: "sm",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-6) var(--space-6)',
      overflow: 'auto'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6)',
      borderTop: '1px solid var(--border)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Modal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/Dashboard.jsx
try { (() => {
const {
  Card: DCard,
  KpiCard: DKpi,
  DataTable: DTable,
  StatusPill: DPill,
  PageHeader: DPage,
  Button: DButton,
  Select: DSelect,
  Icon: DIcon
} = window.UzapointDesignSystem_dfe583;
function RevenueChart({
  values,
  labels
}) {
  const W = 640,
    H = 200,
    pad = 24,
    max = Math.max(...values) * 1.1;
  const pts = values.map((v, i) => [pad + i * (W - pad * 2) / (values.length - 1), H - pad - v / max * (H - pad * 2)]);
  const line = pts.map(p => p.join(',')).join(' ');
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: '100%',
      height: 'auto',
      display: 'block'
    }
  }, [0.25, 0.5, 0.75].map(f => /*#__PURE__*/React.createElement("line", {
    key: f,
    x1: pad,
    x2: W - pad,
    y1: pad + f * (H - pad * 2),
    y2: pad + f * (H - pad * 2),
    stroke: "var(--border)"
  })), /*#__PURE__*/React.createElement("polygon", {
    points: area,
    fill: "var(--green-50)"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: line,
    fill: "none",
    stroke: "var(--green-500)",
    strokeWidth: "2.5",
    strokeLinejoin: "round"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: p[0],
    y: H - 4,
    textAnchor: "middle",
    style: {
      font: 'var(--type-micro)',
      fill: 'var(--text-muted)'
    }
  }, labels[i])), /*#__PURE__*/React.createElement("circle", {
    cx: pts[pts.length - 1][0],
    cy: pts[pts.length - 1][1],
    r: "4",
    fill: "var(--surface)",
    stroke: "var(--green-500)",
    strokeWidth: "2.5"
  }));
}
function Dashboard({
  go,
  openInvoice
}) {
  const D = window.UZ_DATA,
    F = window.UZ_FMT;
  const low = D.products.filter(p => p.stock < p.reorder);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(DPage, {
    title: "Good morning, Tony",
    subtitle: "Saturday, 1 Nov 2026",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DButton, {
      variant: "secondary",
      icon: "download"
    }, "Export"), /*#__PURE__*/React.createElement(DButton, {
      icon: "plus",
      onClick: () => go('sales')
    }, "New invoice"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(var(--grid-kpi-min), 1fr))',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(DKpi, {
    label: "Revenue",
    value: "KES 4.82M",
    delta: 12.4,
    icon: "banknote"
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "Gross margin",
    value: "31.6%",
    delta: 1.8,
    icon: "chart-column"
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "Overdue",
    value: "KES 312K",
    delta: 4.1,
    good: "down",
    icon: "receipt"
  }), /*#__PURE__*/React.createElement(DKpi, {
    label: "Orders",
    value: "1,284",
    delta: -2.3,
    icon: "shopping-cart"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(var(--grid-panel-min), 1fr))',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(DCard, {
    title: "Revenue",
    subtitle: "Last 12 months, KES thousands",
    cap: true,
    style: {
      gridColumn: 'span 2'
    },
    action: /*#__PURE__*/React.createElement(DSelect, {
      size: "sm",
      options: ['12 months', '6 months', '30 days'],
      style: {
        width: 130
      }
    })
  }, /*#__PURE__*/React.createElement(RevenueChart, {
    values: D.revenue,
    labels: D.months
  })), /*#__PURE__*/React.createElement(DCard, {
    title: "Low stock",
    subtitle: low.length + ' items below reorder level',
    action: /*#__PURE__*/React.createElement(DButton, {
      variant: "ghost",
      size: "sm",
      onClick: () => go('inventory')
    }, "View all")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, low.map(p => {
    const [t, s] = F.stockTone(p);
    return /*#__PURE__*/React.createElement("div", {
      key: p.sku,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--grey-100)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(DIcon, {
      name: "package",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)'
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-caption)',
        color: 'var(--text-muted)'
      },
      className: "u-num"
    }, p.stock, " left \xB7 reorder at ", p.reorder)), /*#__PURE__*/React.createElement(DPill, {
      status: t
    }, s));
  })))), /*#__PURE__*/React.createElement(DCard, {
    title: "Recent invoices",
    padding: "0",
    action: /*#__PURE__*/React.createElement(DButton, {
      variant: "ghost",
      size: "sm",
      onClick: () => go('sales')
    }, "View all")
  }, /*#__PURE__*/React.createElement(DTable, {
    rows: D.invoices.slice(0, 4),
    onRowClick: openInvoice,
    columns: [{
      key: 'id',
      label: 'Invoice',
      render: r => /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => e.preventDefault()
      }, r.id)
    }, {
      key: 'customer',
      label: 'Customer',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text)'
        }
      }, r.customer)
    }, {
      key: 'due',
      label: 'Due',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, r.due), /*#__PURE__*/React.createElement("div", {
        style: {
          font: 'var(--type-caption)',
          color: r.tone === 'danger' ? 'var(--danger-text)' : 'var(--text-muted)'
        }
      }, r.rel))
    }, {
      key: 'total',
      label: 'Total (KES)',
      align: 'right',
      render: r => F.money(r.total)
    }, {
      key: 'status',
      label: 'Status',
      render: r => /*#__PURE__*/React.createElement(DPill, {
        status: r.tone
      }, r.status)
    }]
  })));
}
window.Dashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/Inventory.jsx
try { (() => {
const {
  Card: ICard,
  KpiCard: IKpi,
  DataTable: ITable,
  StatusPill: IPill,
  PageHeader: IPage,
  Button: IButton,
  Input: IInput,
  Select: ISelect,
  Modal: IModal,
  IconButton: IIconBtn
} = window.UzapointDesignSystem_dfe583;
function Inventory({
  products,
  setProducts
}) {
  const F = window.UZ_FMT;
  const [q, setQ] = React.useState('');
  const [wh, setWh] = React.useState('All warehouses');
  const [adj, setAdj] = React.useState(null);
  const [qty, setQty] = React.useState('');
  const rows = products.filter(p => (wh === 'All warehouses' || p.wh === wh) && (p.name + p.sku).toLowerCase().includes(q.toLowerCase()));
  const value = products.reduce((a, p) => a + p.stock * p.price, 0);
  const save = () => {
    const n = parseInt(qty, 10);
    if (!isNaN(n)) setProducts(ps => ps.map(p => p.sku === adj.sku ? {
      ...p,
      stock: Math.max(0, n)
    } : p));
    setAdj(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(IPage, {
    title: "Inventory",
    subtitle: "3 warehouses \xB7 counted 28 Oct 2026",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IButton, {
      variant: "secondary",
      icon: "upload"
    }, "Import"), /*#__PURE__*/React.createElement(IButton, {
      icon: "plus"
    }, "New product"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(var(--grid-kpi-min), 1fr))',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(IKpi, {
    label: "Stock value",
    value: 'KES ' + (value / 1e6).toFixed(2) + 'M',
    delta: 3.2,
    icon: "wallet"
  }), /*#__PURE__*/React.createElement(IKpi, {
    label: "SKUs",
    value: String(products.length),
    icon: "package"
  }), /*#__PURE__*/React.createElement(IKpi, {
    label: "Low stock",
    value: String(products.filter(p => p.stock > 0 && p.stock < p.reorder).length),
    icon: "circle-alert"
  }), /*#__PURE__*/React.createElement(IKpi, {
    label: "Out of stock",
    value: String(products.filter(p => p.stock === 0).length),
    icon: "boxes"
  })), /*#__PURE__*/React.createElement(ICard, {
    padding: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(IInput, {
    icon: "search",
    placeholder: "Search name or SKU",
    value: q,
    onChange: e => setQ(e.target.value),
    style: {
      width: 280
    }
  }), /*#__PURE__*/React.createElement(ISelect, {
    options: ['All warehouses', 'Nairobi CBD', 'Mombasa Rd', 'Kisumu'],
    value: wh,
    onChange: e => setWh(e.target.value),
    style: {
      width: 180
    }
  })), /*#__PURE__*/React.createElement(ITable, {
    rowKey: "sku",
    rows: rows,
    empty: "No products match that search.",
    columns: [{
      key: 'name',
      label: 'Product',
      render: p => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text)',
          fontWeight: 500
        }
      }, p.name), /*#__PURE__*/React.createElement("div", {
        style: {
          font: 'var(--type-caption)',
          color: 'var(--text-muted)'
        }
      }, p.sku))
    }, {
      key: 'cat',
      label: 'Category'
    }, {
      key: 'wh',
      label: 'Warehouse'
    }, {
      key: 'stock',
      label: 'On hand',
      align: 'right',
      render: p => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text)',
          fontWeight: 500
        }
      }, p.stock)
    }, {
      key: 'reorder',
      label: 'Reorder at',
      align: 'right'
    }, {
      key: 'price',
      label: 'Price (KES)',
      align: 'right',
      render: p => F.money(p.price)
    }, {
      key: 'st',
      label: 'Status',
      render: p => {
        const [t, s] = F.stockTone(p);
        return /*#__PURE__*/React.createElement(IPill, {
          status: t
        }, s);
      }
    }, {
      key: 'a',
      label: '',
      width: 44,
      render: p => /*#__PURE__*/React.createElement(IIconBtn, {
        icon: "sliders-horizontal",
        label: "Adjust stock",
        size: "sm",
        onClick: () => {
          setAdj(p);
          setQty(String(p.stock));
        }
      })
    }]
  })), /*#__PURE__*/React.createElement(IModal, {
    open: !!adj,
    title: "Adjust stock",
    subtitle: adj ? adj.name + ' · ' + adj.wh : '',
    onClose: () => setAdj(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IButton, {
      variant: "secondary",
      onClick: () => setAdj(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(IButton, {
      onClick: save
    }, "Save count"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(IInput, {
    label: "Counted quantity",
    suffix: "pcs",
    value: qty,
    onChange: e => setQty(e.target.value),
    hint: adj ? 'System shows ' + adj.stock + ' on hand.' : ''
  }), /*#__PURE__*/React.createElement(ISelect, {
    label: "Reason",
    options: ['Stock count', 'Damaged', 'Returned to supplier', 'Other']
  }))));
}
window.Inventory = Inventory;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/Inventory.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/InvoiceDrawer.jsx
try { (() => {
const {
  Drawer: VDrawer,
  Modal: VModal,
  Button: VButton,
  Input: VInput,
  Select: VSelect,
  StatusPill: VPill
} = window.UzapointDesignSystem_dfe583;
function InvoiceDrawer({
  inv,
  onClose,
  onPaid
}) {
  const F = window.UZ_FMT;
  const [pay, setPay] = React.useState(false);
  const last = React.useRef(inv);
  if (inv) last.current = inv;
  const r = last.current;
  const meta = (k, v) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)'
    }
  }, v));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(VDrawer, {
    open: !!inv,
    title: r ? r.id : '',
    subtitle: r ? r.customer : '',
    onClose: onClose,
    footer: r && r.status !== 'Paid' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(VButton, {
      variant: "secondary",
      icon: "printer"
    }, "Print"), /*#__PURE__*/React.createElement(VButton, {
      icon: "wallet",
      onClick: () => setPay(true)
    }, "Record payment")) : /*#__PURE__*/React.createElement(VButton, {
      variant: "secondary",
      icon: "printer"
    }, "Print receipt")
  }, r && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(VPill, {
    status: r.tone
  }, r.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, meta('Issued', r.issued), meta('Due', r.due + ' · ' + r.rel), meta('Customer', r.customer), meta('Warehouse', 'Nairobi CBD')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 8
    }
  }, "Items"), r.lines.map(([n, q, p]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    className: "u-num",
    style: {
      display: 'flex',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      font: 'var(--type-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", null, n), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, q, " \xD7 ", F.money(p))), /*#__PURE__*/React.createElement("div", null, F.money(q * p)))), /*#__PURE__*/React.createElement("div", {
    className: "u-num",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 12,
      font: 'var(--type-title)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total (KES)"), /*#__PURE__*/React.createElement("span", null, F.money(r.total)))))), /*#__PURE__*/React.createElement(VModal, {
    open: pay,
    title: "Record payment",
    subtitle: r ? r.id + ' · ' + r.customer : '',
    onClose: () => setPay(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(VButton, {
      variant: "secondary",
      onClick: () => setPay(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(VButton, {
      onClick: () => {
        onPaid(r.id);
        setPay(false);
      }
    }, "Record payment"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(VInput, {
    label: "Amount",
    suffix: "KES",
    defaultValue: r ? F.money(r.total) : ''
  }), /*#__PURE__*/React.createElement(VSelect, {
    label: "Method",
    options: ['M-Pesa', 'Bank transfer', 'Cash', 'Cheque']
  }), /*#__PURE__*/React.createElement(VInput, {
    label: "Reference",
    placeholder: "e.g. QK7H2XP9LM"
  }))));
}
window.InvoiceDrawer = InvoiceDrawer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/InvoiceDrawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/POS.jsx
try { (() => {
const {
  Card: PCard,
  Button: PButton,
  Input: PInput,
  IconButton: PIconBtn,
  Icon: PIcon,
  PageHeader: PPage,
  Modal: PModal
} = window.UzapointDesignSystem_dfe583;
function POS({
  products,
  onSale
}) {
  const F = window.UZ_FMT;
  const [cart, setCart] = React.useState({});
  const [q, setQ] = React.useState('');
  const [pay, setPay] = React.useState(null);
  const [done, setDone] = React.useState(null);
  const add = (sku, d) => setCart(c => {
    const n = (c[sku] || 0) + d;
    const x = {
      ...c
    };
    if (n <= 0) delete x[sku];else x[sku] = n;
    return x;
  });
  const lines = Object.entries(cart).map(([sku, n]) => ({
    p: products.find(p => p.sku === sku),
    n
  }));
  const sub = lines.reduce((a, l) => a + l.p.price * l.n, 0),
    vat = sub * 0.16;
  const list = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const charge = () => {
    setDone({
      total: sub + vat,
      method: pay
    });
    setPay(null);
    setCart({});
    onSale && onSale();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(PPage, {
    title: "Point of sale",
    subtitle: "Nairobi CBD \xB7 Till 2",
    actions: /*#__PURE__*/React.createElement(PButton, {
      variant: "secondary",
      icon: "scan-barcode"
    }, "Scan item")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) 360px',
      gap: 'var(--space-4)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(PCard, null, /*#__PURE__*/React.createElement(PInput, {
    icon: "search",
    placeholder: "Search products",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-4)'
    }
  }, list.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.sku,
    disabled: p.stock === 0,
    onClick: () => add(p.sku, 1),
    style: {
      textAlign: 'left',
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid ' + (cart[p.sku] ? 'var(--action)' : 'var(--border)'),
      background: cart[p.sku] ? 'var(--green-50)' : 'var(--surface)',
      cursor: p.stock ? 'pointer' : 'not-allowed',
      opacity: p.stock ? 1 : 0.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      font: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--grey-100)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--text-muted)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(PIcon, {
    name: "package",
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    className: "u-num",
    style: {
      font: 'var(--type-small)',
      color: 'var(--text-muted)'
    }
  }, "KES ", F.money(p.price), " \xB7 ", p.stock ? p.stock + ' in stock' : 'Out of stock'))))), /*#__PURE__*/React.createElement(PCard, {
    title: "Current sale",
    subtitle: lines.length ? lines.length + ' items' : 'Add items to start a sale.',
    action: lines.length ? /*#__PURE__*/React.createElement(PButton, {
      variant: "ghost",
      size: "sm",
      onClick: () => setCart({})
    }, "Clear") : null
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, lines.map(({
    p,
    n
  }) => /*#__PURE__*/React.createElement("div", {
    key: p.sku,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "u-num",
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-muted)'
    }
  }, F.money(p.price))), /*#__PURE__*/React.createElement(PIconBtn, {
    icon: "minus",
    label: "Remove one",
    size: "sm",
    variant: "secondary",
    onClick: () => add(p.sku, -1)
  }), /*#__PURE__*/React.createElement("span", {
    className: "u-num",
    style: {
      width: 24,
      textAlign: 'center',
      font: 'var(--type-label)'
    }
  }, n), /*#__PURE__*/React.createElement(PIconBtn, {
    icon: "plus",
    label: "Add one",
    size: "sm",
    variant: "secondary",
    onClick: () => add(p.sku, 1)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "u-num",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 6,
      marginTop: 'var(--space-4)',
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, F.money(sub)), /*#__PURE__*/React.createElement("span", null, "VAT 16%"), /*#__PURE__*/React.createElement("span", null, F.money(vat)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-title)',
      color: 'var(--text)',
      marginTop: 6
    }
  }, "Total (KES)"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h2)',
      color: 'var(--text)',
      marginTop: 4
    }
  }, F.money(sub + vat))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginTop: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(PButton, {
    variant: "secondary",
    icon: "banknote",
    disabled: !lines.length,
    onClick: () => setPay('Cash')
  }, "Cash"), /*#__PURE__*/React.createElement(PButton, {
    variant: "secondary",
    icon: "smartphone",
    disabled: !lines.length,
    onClick: () => setPay('M-Pesa')
  }, "M-Pesa"), /*#__PURE__*/React.createElement(PButton, {
    size: "lg",
    fullWidth: true,
    disabled: !lines.length,
    onClick: () => setPay('Card'),
    style: {
      gridColumn: 'span 2'
    }
  }, "Charge KES ", F.money(sub + vat))), done && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--success-soft)',
      color: 'var(--success-text)',
      font: 'var(--type-small)',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PIcon, {
    name: "circle-check",
    size: 16
  }), "Sale recorded. KES ", F.money(done.total), " paid by ", done.method, "."))), /*#__PURE__*/React.createElement(PModal, {
    open: !!pay,
    title: 'Pay by ' + pay,
    subtitle: 'Total KES ' + F.money(sub + vat),
    onClose: () => setPay(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PButton, {
      variant: "secondary",
      onClick: () => setPay(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(PButton, {
      onClick: charge
    }, "Confirm payment"))
  }, pay === 'M-Pesa' ? /*#__PURE__*/React.createElement(PInput, {
    label: "Customer phone",
    icon: "phone",
    defaultValue: "0712 345 678",
    hint: "An STK push is sent to this number."
  }) : pay === 'Cash' ? /*#__PURE__*/React.createElement(PInput, {
    label: "Cash received",
    suffix: "KES",
    defaultValue: F.money(Math.ceil((sub + vat) / 100) * 100)
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--text-secondary)'
    }
  }, "Tap or insert the card on the terminal.")));
}
window.POS = POS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/POS.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/Sales.jsx
try { (() => {
const {
  Card: SCard,
  DataTable: STable,
  StatusPill: SPill,
  PageHeader: SPage,
  Button: SButton,
  Input: SInput,
  Select: SSelect,
  Menu: SMenu,
  IconButton: SIconBtn,
  Checkbox: SCheck
} = window.UzapointDesignSystem_dfe583;
function Sales({
  invoices,
  openInvoice,
  go
}) {
  const F = window.UZ_FMT;
  const [q, setQ] = React.useState('');
  const [st, setSt] = React.useState('All statuses');
  const [sel, setSel] = React.useState({});
  const rows = invoices.filter(r => (st === 'All statuses' || r.status === st) && (r.id + r.customer).toLowerCase().includes(q.toLowerCase()));
  const outstanding = invoices.filter(r => r.status !== 'Paid' && r.status !== 'Draft').reduce((a, r) => a + r.total, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(SPage, {
    title: "Invoices",
    subtitle: 'KES ' + F.money(outstanding) + ' outstanding across ' + invoices.filter(r => r.status !== 'Paid' && r.status !== 'Draft').length + ' invoices',
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SButton, {
      variant: "secondary",
      icon: "store",
      onClick: () => go('pos')
    }, "Open POS"), /*#__PURE__*/React.createElement(SButton, {
      icon: "plus"
    }, "New invoice"))
  }), /*#__PURE__*/React.createElement(SCard, {
    padding: "0"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SInput, {
    icon: "search",
    placeholder: "Search invoice or customer",
    value: q,
    onChange: e => setQ(e.target.value),
    style: {
      width: 280
    }
  }), /*#__PURE__*/React.createElement(SSelect, {
    options: ['All statuses', 'Draft', 'Sent', 'Pending', 'Paid', 'Overdue'],
    value: st,
    onChange: e => setSt(e.target.value),
    style: {
      width: 160
    }
  }), /*#__PURE__*/React.createElement(SSelect, {
    options: ['This month', 'Last month', 'This quarter'],
    style: {
      width: 150
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(SButton, {
    variant: "ghost",
    icon: "download"
  }, "Export")), /*#__PURE__*/React.createElement(STable, {
    rows: rows,
    onRowClick: openInvoice,
    empty: "No invoices match that search.",
    columns: [{
      key: 'sel',
      label: '',
      width: 36,
      render: r => /*#__PURE__*/React.createElement("span", {
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement(SCheck, {
        checked: !!sel[r.id],
        onChange: v => setSel(s => ({
          ...s,
          [r.id]: v
        }))
      }))
    }, {
      key: 'id',
      label: 'Invoice',
      render: r => /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => e.preventDefault()
      }, r.id)
    }, {
      key: 'customer',
      label: 'Customer',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text)'
        }
      }, r.customer)
    }, {
      key: 'issued',
      label: 'Issued'
    }, {
      key: 'due',
      label: 'Due',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, r.due), /*#__PURE__*/React.createElement("div", {
        style: {
          font: 'var(--type-caption)',
          color: r.tone === 'danger' ? 'var(--danger-text)' : 'var(--text-muted)'
        }
      }, r.rel))
    }, {
      key: 'total',
      label: 'Total (KES)',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text)',
          fontWeight: 500
        }
      }, F.money(r.total))
    }, {
      key: 'status',
      label: 'Status',
      render: r => /*#__PURE__*/React.createElement(SPill, {
        status: r.tone
      }, r.status)
    }, {
      key: 'more',
      label: '',
      width: 44,
      render: r => /*#__PURE__*/React.createElement("span", {
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement(SMenu, {
        trigger: /*#__PURE__*/React.createElement(SIconBtn, {
          icon: "ellipsis",
          label: "More actions",
          size: "sm"
        }),
        items: [{
          label: 'View',
          icon: 'eye',
          onClick: () => openInvoice(r)
        }, {
          label: 'Print',
          icon: 'printer'
        }, {
          label: 'Email to customer',
          icon: 'mail'
        }, '-', {
          label: 'Void invoice',
          icon: 'trash-2',
          danger: true
        }]
      }))
    }]
  })));
}
window.Sales = Sales;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/Sales.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp-web/data.js
try { (() => {
window.UZ_DATA = {
  invoices: [{
    id: 'INV-0358',
    customer: 'Kamau Hardware',
    issued: '28 Oct 2026',
    due: '12 Nov 2026',
    rel: 'in 11 days',
    total: 45600,
    status: 'Pending',
    tone: 'warning',
    lines: [['Cement 50kg', 20, 850], ['Steel bar Y12', 40, 715]]
  }, {
    id: 'INV-0357',
    customer: 'Wanjiru Supplies',
    issued: '17 Oct 2026',
    due: '31 Oct 2026',
    rel: '1 day late',
    total: 128400,
    status: 'Overdue',
    tone: 'danger',
    lines: [['Roofing sheet G30', 60, 1340], ['Ridge cap', 48, 1000]]
  }, {
    id: 'INV-0356',
    customer: 'Otieno & Sons',
    issued: '20 Oct 2026',
    due: '27 Oct 2026',
    rel: 'settled 27 Oct',
    total: 9850,
    status: 'Paid',
    tone: 'success',
    lines: [['PVC pipe 1"', 25, 394]]
  }, {
    id: 'INV-0355',
    customer: 'Mombasa Fresh Ltd',
    issued: '19 Oct 2026',
    due: '02 Nov 2026',
    rel: 'tomorrow',
    total: 61200,
    status: 'Sent',
    tone: 'info',
    lines: [['Paint 20L white', 12, 5100]]
  }, {
    id: 'INV-0354',
    customer: 'Achieng Traders',
    issued: '18 Oct 2026',
    due: '—',
    rel: 'not sent',
    total: 18300,
    status: 'Draft',
    tone: 'neutral',
    lines: [['Nails 3" (kg)', 60, 305]]
  }, {
    id: 'INV-0353',
    customer: 'Kipchoge Agrovet',
    issued: '14 Oct 2026',
    due: '28 Oct 2026',
    rel: 'settled 26 Oct',
    total: 74900,
    status: 'Paid',
    tone: 'success',
    lines: [['Wheelbarrow', 14, 5350]]
  }],
  products: [{
    sku: 'CEM-050',
    name: 'Cement 50kg',
    cat: 'Building',
    wh: 'Nairobi CBD',
    stock: 34,
    reorder: 50,
    price: 850
  }, {
    sku: 'STL-Y12',
    name: 'Steel bar Y12',
    cat: 'Building',
    wh: 'Mombasa Rd',
    stock: 412,
    reorder: 100,
    price: 715
  }, {
    sku: 'RFS-G30',
    name: 'Roofing sheet G30',
    cat: 'Roofing',
    wh: 'Nairobi CBD',
    stock: 0,
    reorder: 40,
    price: 1340
  }, {
    sku: 'PVC-100',
    name: 'PVC pipe 1"',
    cat: 'Plumbing',
    wh: 'Kisumu',
    stock: 188,
    reorder: 60,
    price: 394
  }, {
    sku: 'PNT-20W',
    name: 'Paint 20L white',
    cat: 'Finishing',
    wh: 'Nairobi CBD',
    stock: 9,
    reorder: 15,
    price: 5100
  }, {
    sku: 'NAL-003',
    name: 'Nails 3" (kg)',
    cat: 'Hardware',
    wh: 'Mombasa Rd',
    stock: 260,
    reorder: 80,
    price: 305
  }, {
    sku: 'WBR-001',
    name: 'Wheelbarrow',
    cat: 'Tools',
    wh: 'Kisumu',
    stock: 22,
    reorder: 10,
    price: 5350
  }, {
    sku: 'HMR-16',
    name: 'Claw hammer 16oz',
    cat: 'Tools',
    wh: 'Nairobi CBD',
    stock: 57,
    reorder: 20,
    price: 650
  }],
  revenue: [212, 248, 231, 276, 302, 288, 335, 318, 362, 391, 374, 412],
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
};
window.UZ_FMT = {
  money: n => n.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),
  stockTone: p => p.stock === 0 ? ['danger', 'Out of stock'] : p.stock < p.reorder ? ['warning', 'Low stock'] : ['success', 'In stock']
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp-web/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.ICONS = __ds_scope.ICONS;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Delta = __ds_scope.Delta;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.DEFAULT_MODULES = __ds_scope.DEFAULT_MODULES;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.UserChip = __ds_scope.UserChip;

__ds_ns.Drawer = __ds_scope.Drawer;

__ds_ns.MenuList = __ds_scope.MenuList;

__ds_ns.Menu = __ds_scope.Menu;

__ds_ns.Modal = __ds_scope.Modal;

})();
