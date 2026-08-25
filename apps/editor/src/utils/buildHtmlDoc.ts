// ─── Font Entry Type ──────────────────────────────────────────────────────────
type FontEntry = {
  family: string;
  weight?: number;
  style?: "normal" | "italic";
};

// ─── Complete Font Map ───────────────────────────────────────────────────────
const FONT_MAP: Record<string, FontEntry> = {
  // ── Nimbus / LaTeX (Times New Roman equivalents) ──────────────────────────
  NimbusRomNo9LRegu: { family: '"Times New Roman", Times, serif', weight: 400 },
  NimbusRomNo9LMedi: { family: '"Times New Roman", Times, serif', weight: 700 },
  NimbusRomNo9LReguItal: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  NimbusRomNo9LMediItal: {
    family: '"Times New Roman", Times, serif',
    weight: 700,
    style: "italic",
  },
  NimbusRomNo9L: { family: '"Times New Roman", Times, serif' },
  // ── Computer Modern (LaTeX default) ──────────────────────────────────────
  CMR5: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR6: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR7: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR8: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR9: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR10: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMR12: { family: '"Times New Roman", Times, serif', weight: 400 },
  CMBX5: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX6: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX7: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX8: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX9: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX10: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMBX12: { family: '"Times New Roman", Times, serif', weight: 700 },
  CMTI7: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  CMTI8: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  CMTI9: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  CMTI10: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  CMBI10: {
    family: '"Times New Roman", Times, serif',
    weight: 700,
    style: "italic",
  },
  CMSY5: { family: '"Times New Roman", Times, serif' },
  CMSY6: { family: '"Times New Roman", Times, serif' },
  CMSY7: { family: '"Times New Roman", Times, serif' },
  CMSY8: { family: '"Times New Roman", Times, serif' },
  CMSY9: { family: '"Times New Roman", Times, serif' },
  CMSY10: { family: '"Times New Roman", Times, serif' },
  CMMI5: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI6: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI7: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI8: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI9: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI10: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMMI12: { family: '"Times New Roman", Times, serif', style: "italic" },
  CMSS8: { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  CMSS9: { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  CMSS10: { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  CMSSBX10: { family: '"Open Sans", Arial, sans-serif', weight: 700 },
  CMTT8: { family: '"Courier New", Courier, monospace' },
  CMTT9: { family: '"Courier New", Courier, monospace' },
  CMTT10: { family: '"Courier New", Courier, monospace' },
  // ── TeX Gyre (LaTeX modern fonts) ────────────────────────────────────────
  TeXGyreTermesRegular: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
  },
  TeXGyreTermesBold: { family: '"Times New Roman", Times, serif', weight: 700 },
  TeXGyreTermesItalic: {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  TeXGyreTermesBoldItalic: {
    family: '"Times New Roman", Times, serif',
    weight: 700,
    style: "italic",
  },
  TeXGyreTermes: { family: '"Times New Roman", Times, serif' },
  TeXGyrePagellaRegular: {
    family: '"Palatino Linotype", Palatino, serif',
    weight: 400,
  },
  TeXGyrePagellaBold: {
    family: '"Palatino Linotype", Palatino, serif',
    weight: 700,
  },
  TeXGyrePagellaItalic: {
    family: '"Palatino Linotype", Palatino, serif',
    weight: 400,
    style: "italic",
  },
  TeXGyrePagella: { family: '"Palatino Linotype", Palatino, serif' },
  TeXGyreHerosRegular: {
    family: '"Open Sans", Arial, sans-serif',
    weight: 400,
  },
  TeXGyreHerosBold: { family: '"Open Sans", Arial, sans-serif', weight: 700 },
  TeXGyreHeros: { family: '"Open Sans", Arial, sans-serif' },
  TeXGyreCursorRegular: {
    family: '"Courier New", Courier, monospace',
    weight: 400,
  },
  TeXGyreCursor: { family: '"Courier New", Courier, monospace' },
  TeXGyreAdventorBold: { family: '"Oswald", sans-serif', weight: 700 },
  TeXGyreAdventor: { family: '"Oswald", sans-serif' },
  TeXGyreBonum: { family: "Georgia, serif" },
  TeXGyreSchola: { family: '"EB Garamond", Georgia, serif' },
  TeXGyreChorus: { family: '"Dancing Script", cursive' },
  // ── Times / Serif ─────────────────────────────────────────────────────────
  TimesNewRomanPSMT: { family: '"Times New Roman", Times, serif', weight: 400 },
  TimesNewRomanPS: { family: '"Times New Roman", Times, serif', weight: 400 },
  "TimesNewRomanPS-BoldMT": {
    family: '"Times New Roman", Times, serif',
    weight: 700,
  },
  "TimesNewRomanPS-ItalicMT": {
    family: '"Times New Roman", Times, serif',
    weight: 400,
    style: "italic",
  },
  "TimesNewRomanPS-BoldItalicMT": {
    family: '"Times New Roman", Times, serif',
    weight: 700,
    style: "italic",
  },
  // ── Charter / Bitstream ───────────────────────────────────────────────────
  CharterBT: { family: "Georgia, serif", weight: 400 },
  CharterBTBold: { family: "Georgia, serif", weight: 700 },
  CharterBTItalic: { family: "Georgia, serif", weight: 400, style: "italic" },
  CharterBTBoldItal: { family: "Georgia, serif", weight: 700, style: "italic" },
  // ── Utopia / Minion ───────────────────────────────────────────────────────
  Utopia: { family: "Georgia, serif", weight: 400 },
  UtopiaRegular: { family: "Georgia, serif", weight: 400 },
  UtopiaBold: { family: "Georgia, serif", weight: 700 },
  UtopiaItalic: { family: "Georgia, serif", weight: 400, style: "italic" },
  MinionPro: { family: "Georgia, serif", weight: 400 },
  MinionProBold: { family: "Georgia, serif", weight: 700 },
  MinionProIt: { family: "Georgia, serif", weight: 400, style: "italic" },
  MinionProBoldIt: { family: "Georgia, serif", weight: 700, style: "italic" },
  // ── Helvetica / Nimbus Sans ───────────────────────────────────────────────
  MyriadPro: { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  MyriadProBold: { family: '"Open Sans", Arial, sans-serif', weight: 700 },
  MyriadProIt: {
    family: '"Open Sans", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  HelveticaNeue: {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: 400,
  },
  "HelveticaNeue-Bold": {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: 700,
  },
  "HelveticaNeue-Light": {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: 300,
  },
  "HelveticaNeue-Italic": {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  NimbusSanL: { family: "Arial, Helvetica, sans-serif", weight: 400 },
  NimbusSanLRegu: { family: "Arial, Helvetica, sans-serif", weight: 400 },
  NimbusSanLBold: { family: "Arial, Helvetica, sans-serif", weight: 700 },
  NimbusSanLReguItal: {
    family: "Arial, Helvetica, sans-serif",
    weight: 400,
    style: "italic",
  },
  NimbusSanLBoldItal: {
    family: "Arial, Helvetica, sans-serif",
    weight: 700,
    style: "italic",
  },
  // ─ Arial ─────────────────────────────────────────────────────────────────
  ArialMT: { family: "Arial, Helvetica, sans-serif", weight: 400 },
  "Arial-BoldMT": { family: "Arial, Helvetica, sans-serif", weight: 700 },
  "Arial-ItalicMT": {
    family: "Arial, Helvetica, sans-serif",
    weight: 400,
    style: "italic",
  },
  "Arial-BoldItalicMT": {
    family: "Arial, Helvetica, sans-serif",
    weight: 700,
    style: "italic",
  },
  ArialBlack: { family: '"Arial Black", sans-serif', weight: 900 },
  "Arial-Black": { family: '"Arial Black", sans-serif', weight: 900 },
  ArialNarrow: { family: '"Arial Narrow", Arial, sans-serif', weight: 400 },
  "Arial-Narrow": { family: '"Arial Narrow", Arial, sans-serif', weight: 400 },
  "Arial-NarrowBold": {
    family: '"Arial Narrow", Arial, sans-serif',
    weight: 700,
  },
  // ─ Calibri / Office ─────────────────────────────────────────────────────
  Calibri: { family: 'Calibri, "Gill Sans", sans-serif', weight: 400 },
  "Calibri-Bold": { family: 'Calibri, "Gill Sans", sans-serif', weight: 700 },
  "Calibri-Italic": {
    family: 'Calibri, "Gill Sans", sans-serif',
    weight: 400,
    style: "italic",
  },
  "Calibri-BoldItalic": {
    family: 'Calibri, "Gill Sans", sans-serif',
    weight: 700,
    style: "italic",
  },
  "Calibri-Light": { family: 'Calibri, "Gill Sans", sans-serif', weight: 300 },
  CambriaMath: { family: "Cambria, Georgia, serif", weight: 400 },
  Cambria: { family: "Cambria, Georgia, serif", weight: 400 },
  "Cambria-Bold": { family: "Cambria, Georgia, serif", weight: 700 },
  Segoe: { family: '"Segoe UI", Arial, sans-serif', weight: 400 },
  SegoeUI: { family: '"Segoe UI", Arial, sans-serif', weight: 400 },
  "SegoeUI-Bold": { family: '"Segoe UI", Arial, sans-serif', weight: 700 },
  "SegoeUI-Light": { family: '"Segoe UI", Arial, sans-serif', weight: 300 },
  // ── Google Fonts ──────────────────────────────────────────────────────────
  Roboto: { family: '"Roboto", Arial, sans-serif', weight: 400 },
  "Roboto-Regular": { family: '"Roboto", Arial, sans-serif', weight: 400 },
  "Roboto-Bold": { family: '"Roboto", Arial, sans-serif', weight: 700 },
  "Roboto-Medium": { family: '"Roboto", Arial, sans-serif', weight: 500 },
  "Roboto-Light": { family: '"Roboto", Arial, sans-serif', weight: 300 },
  "Roboto-Thin": { family: '"Roboto", Arial, sans-serif', weight: 100 },
  "Roboto-Italic": {
    family: '"Roboto", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  "Roboto-BoldItalic": {
    family: '"Roboto", Arial, sans-serif',
    weight: 700,
    style: "italic",
  },
  OpenSans: { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  "OpenSans-Regular": { family: '"Open Sans", Arial, sans-serif', weight: 400 },
  "OpenSans-Bold": { family: '"Open Sans", Arial, sans-serif', weight: 700 },
  "OpenSans-SemiBold": {
    family: '"Open Sans", Arial, sans-serif',
    weight: 600,
  },
  "OpenSans-Light": { family: '"Open Sans", Arial, sans-serif', weight: 300 },
  "OpenSans-Italic": {
    family: '"Open Sans", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  "OpenSans-BoldItalic": {
    family: '"Open Sans", Arial, sans-serif',
    weight: 700,
    style: "italic",
  },
  Lato: { family: '"Lato", Arial, sans-serif', weight: 400 },
  "Lato-Regular": { family: '"Lato", Arial, sans-serif', weight: 400 },
  "Lato-Bold": { family: '"Lato", Arial, sans-serif', weight: 700 },
  "Lato-Light": { family: '"Lato", Arial, sans-serif', weight: 300 },
  "Lato-Italic": {
    family: '"Lato", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  Montserrat: { family: '"Montserrat", Arial, sans-serif', weight: 400 },
  "Montserrat-Regular": {
    family: '"Montserrat", Arial, sans-serif',
    weight: 400,
  },
  "Montserrat-Bold": { family: '"Montserrat", Arial, sans-serif', weight: 700 },
  "Montserrat-SemiBold": {
    family: '"Montserrat", Arial, sans-serif',
    weight: 600,
  },
  "Montserrat-Light": {
    family: '"Montserrat", Arial, sans-serif',
    weight: 300,
  },
  "Montserrat-Italic": {
    family: '"Montserrat", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  Poppins: { family: '"Poppins", Arial, sans-serif', weight: 400 },
  "Poppins-Regular": { family: '"Poppins", Arial, sans-serif', weight: 400 },
  "Poppins-Bold": { family: '"Poppins", Arial, sans-serif', weight: 700 },
  "Poppins-SemiBold": { family: '"Poppins", Arial, sans-serif', weight: 600 },
  "Poppins-Medium": { family: '"Poppins", Arial, sans-serif', weight: 500 },
  "Poppins-Light": { family: '"Poppins", Arial, sans-serif', weight: 300 },
  "Poppins-Italic": {
    family: '"Poppins", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  Nunito: { family: '"Nunito", Arial, sans-serif', weight: 400 },
  "Nunito-Bold": { family: '"Nunito", Arial, sans-serif', weight: 700 },
  "Nunito-SemiBold": { family: '"Nunito", Arial, sans-serif', weight: 600 },
  "Nunito-Light": { family: '"Nunito", Arial, sans-serif', weight: 300 },
  Inter: { family: '"Inter", Arial, sans-serif', weight: 400 },
  "Inter-Regular": { family: '"Inter", Arial, sans-serif', weight: 400 },
  "Inter-Bold": { family: '"Inter", Arial, sans-serif', weight: 700 },
  "Inter-SemiBold": { family: '"Inter", Arial, sans-serif', weight: 600 },
  "Inter-Medium": { family: '"Inter", Arial, sans-serif', weight: 500 },
  "Inter-Light": { family: '"Inter", Arial, sans-serif', weight: 300 },
  Ubuntu: { family: '"Ubuntu", Arial, sans-serif', weight: 400 },
  "Ubuntu-Bold": { family: '"Ubuntu", Arial, sans-serif', weight: 700 },
  "Ubuntu-Medium": { family: '"Ubuntu", Arial, sans-serif', weight: 500 },
  "Ubuntu-Light": { family: '"Ubuntu", Arial, sans-serif', weight: 300 },
  "Ubuntu-Italic": {
    family: '"Ubuntu", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  Oswald: { family: '"Oswald", sans-serif', weight: 400 },
  "Oswald-Regular": { family: '"Oswald", sans-serif', weight: 400 },
  "Oswald-Bold": { family: '"Oswald", sans-serif', weight: 700 },
  "Oswald-SemiBold": { family: '"Oswald", sans-serif', weight: 600 },
  "Oswald-Light": { family: '"Oswald", sans-serif', weight: 300 },
  // ── Serif / Classic ───────────────────────────────────────────────────────
  Georgia: { family: "Georgia, serif", weight: 400 },
  Garamond: { family: '"EB Garamond", Georgia, serif', weight: 400 },
  "Garamond-Bold": { family: '"EB Garamond", Georgia, serif', weight: 700 },
  "Garamond-Italic": {
    family: '"EB Garamond", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  "EBGaramond-Regular": {
    family: '"EB Garamond", Georgia, serif',
    weight: 400,
  },
  "EBGaramond-Bold": { family: '"EB Garamond", Georgia, serif', weight: 700 },
  LibreBaskerville: {
    family: '"Libre Baskerville", Georgia, serif',
    weight: 400,
  },
  "LibreBaskerville-Bold": {
    family: '"Libre Baskerville", Georgia, serif',
    weight: 700,
  },
  "LibreBaskerville-Italic": {
    family: '"Libre Baskerville", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  PlayfairDisplay: {
    family: '"Playfair Display", Georgia, serif',
    weight: 400,
  },
  "PlayfairDisplay-Bold": {
    family: '"Playfair Display", Georgia, serif',
    weight: 700,
  },
  "PlayfairDisplay-Italic": {
    family: '"Playfair Display", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  Lora: { family: '"Lora", Georgia, serif', weight: 400 },
  "Lora-Bold": { family: '"Lora", Georgia, serif', weight: 700 },
  "Lora-Italic": {
    family: '"Lora", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  "Lora-BoldItalic": {
    family: '"Lora", Georgia, serif',
    weight: 700,
    style: "italic",
  },
  Merriweather: { family: '"Merriweather", Georgia, serif', weight: 400 },
  "Merriweather-Bold": {
    family: '"Merriweather", Georgia, serif',
    weight: 700,
  },
  "Merriweather-Light": {
    family: '"Merriweather", Georgia, serif',
    weight: 300,
  },
  "Merriweather-Italic": {
    family: '"Merriweather", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  CrimsonText: { family: '"Crimson Text", Georgia, serif', weight: 400 },
  "CrimsonText-Bold": { family: '"Crimson Text", Georgia, serif', weight: 700 },
  "CrimsonText-Italic": {
    family: '"Crimson Text", Georgia, serif',
    weight: 400,
    style: "italic",
  },
  "PTSans-Regular": { family: '"PT Sans", Arial, sans-serif', weight: 400 },
  "PTSans-Bold": { family: '"PT Sans", Arial, sans-serif', weight: 700 },
  "PTSans-Narrow": {
    family: '"PT Sans Narrow", Arial, sans-serif',
    weight: 400,
  },
  "PTSans-NarrowBold": {
    family: '"PT Sans Narrow", Arial, sans-serif',
    weight: 700,
  },
  PTSans: { family: '"PT Sans", Arial, sans-serif', weight: 400 },
  // ── Monospace ─────────────────────────────────────────────────────────────
  CourierNewPSMT: { family: '"Courier New", Courier, monospace', weight: 400 },
  "CourierNew-Bold": {
    family: '"Courier New", Courier, monospace',
    weight: 700,
  },
  "CourierNew-Italic": {
    family: '"Courier New", Courier, monospace',
    weight: 400,
    style: "italic",
  },
  "CourierNew-BoldItalic": {
    family: '"Courier New", Courier, monospace',
    weight: 700,
    style: "italic",
  },
  LucidaConsole: { family: '"Lucida Console", Monaco, monospace', weight: 400 },
  "SourceCodePro-Regular": {
    family: '"Source Code Pro", monospace',
    weight: 400,
  },
  "SourceCodePro-Bold": { family: '"Source Code Pro", monospace', weight: 700 },
  // ── Display / Decorative ─────────────────────────────────────────────────
  Pacifico: { family: '"Pacifico", cursive', weight: 400 },
  Lobster: { family: '"Lobster", cursive', weight: 400 },
  BebasNeue: { family: '"Bebas Neue", sans-serif', weight: 700 },
  "Bebas-Neue": { family: '"Bebas Neue", sans-serif', weight: 700 },
  Anton: { family: '"Anton", sans-serif', weight: 700 },
  Righteous: { family: '"Righteous", sans-serif', weight: 400 },
  Satisfy: { family: '"Satisfy", cursive', weight: 400 },
  GreatVibes: { family: '"Great Vibes", cursive', weight: 400 },
  DancingScript: { family: '"Dancing Script", cursive', weight: 400 },
  "DancingScript-Bold": { family: '"Dancing Script", cursive', weight: 700 },
  Caveat: { family: '"Caveat", cursive', weight: 400 },
  "Caveat-Bold": { family: '"Caveat", cursive', weight: 700 },
  Courgette: { family: '"Courgette", cursive', weight: 400 },
  AbrilFatface: { family: '"Abril Fatface", serif', weight: 400 },
  IndieFlower: { family: '"Indie Flower", cursive', weight: 400 },
  PermanentMarker: { family: '"Permanent Marker", cursive', weight: 400 },
  MonotypeCorsiva: { family: '"Dancing Script", cursive', weight: 400 },
  BrushScriptMT: { family: '"Brush Script MT", cursive', weight: 400 },
  // ── System / Other ────────────────────────────────────────────────────────
  Verdana: { family: "Verdana, Geneva, sans-serif", weight: 400 },
  "Verdana-Bold": { family: "Verdana, Geneva, sans-serif", weight: 700 },
  "Verdana-Italic": {
    family: "Verdana, Geneva, sans-serif",
    weight: 400,
    style: "italic",
  },
  Tahoma: { family: "Tahoma, Geneva, sans-serif", weight: 400 },
  "Tahoma-Bold": { family: "Tahoma, Geneva, sans-serif", weight: 700 },
  TrebuchetMS: { family: '"Trebuchet MS", Arial, sans-serif', weight: 400 },
  "TrebuchetMS-Bold": {
    family: '"Trebuchet MS", Arial, sans-serif',
    weight: 700,
  },
  "TrebuchetMS-Italic": {
    family: '"Trebuchet MS", Arial, sans-serif',
    weight: 400,
    style: "italic",
  },
  Impact: { family: 'Impact, "Arial Narrow", sans-serif', weight: 900 },
  CenturyGothic: {
    family: '"Century Gothic", "Gill Sans", sans-serif',
    weight: 400,
  },
  "CenturyGothic-Bold": {
    family: '"Century Gothic", "Gill Sans", sans-serif',
    weight: 700,
  },
  GillSansMT: {
    family: '"Gill Sans MT", "Gill Sans", Arial, sans-serif',
    weight: 400,
  },
  "GillSansMT-Bold": {
    family: '"Gill Sans MT", "Gill Sans", Arial, sans-serif',
    weight: 700,
  },
  ProximaNova: { family: '"Montserrat", sans-serif', weight: 400 },
  "ProximaNova-Bold": { family: '"Montserrat", sans-serif', weight: 700 },
  "ProximaNova-Light": { family: '"Montserrat", sans-serif', weight: 300 },
};

// ─── Normalized lookup ────────────────────────────────────────────────────────
const NORMALIZED_FONT_MAP = new Map<string, FontEntry>(
  Object.entries(FONT_MAP).map(([key, entry]) => [
    key.toLowerCase().replace(/[^a-z0-9]/g, ""),
    entry,
  ]),
);

// ─── Google Fonts stylesheet ──────────────────────────────────────────────────
const GOOGLE_FONTS_LINK = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Oswald:wght@300;400;500;600;700&family=Pacifico&family=Lobster&family=Dancing+Script:wght@400;700&family=Indie+Flower&family=Permanent+Marker&family=Caveat:wght@400;700&family=Satisfy&family=Great+Vibes&family=Courgette&family=Abril+Fatface&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=PT+Sans:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&family=Inter:wght@300;400;500;600;700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Bebas+Neue&family=Anton&family=Righteous&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet">
`;

// ── Base iframe reset style ──────────────────────────────────────────────────
const BASE_STYLE = `
<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}
img, svg {
  max-width: 100%;
  height: auto;
}
* {
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
  /* CRITICAL: Preserve original spacing from PDF */
  word-spacing: 0 !important;
  letter-spacing: -0.1px !important;
  font-kerning: none !important;
  font-variant-ligatures: none !important;
  text-rendering: geometricPrecision;
  font-feature-settings: "kern" 0, "liga" 0 !important;
}
/* Keep all absolutely-positioned text in its original pixel lane */
div[id$="-div"] {
  overflow: visible !important;
  white-space: nowrap !important;
}
/* CRITICAL: Preserve nowrap for all positioned elements */
p[style*="position:absolute"] {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  /* Prevent text from expanding beyond original bounds */
  max-width: none !important;
  width: auto !important;
}
/* ── Link underline fix ─────────────────────────────────────────────── */

/* Apply underline ONLY to links with border-bottom to avoid double underline */
a:link, a:visited, a:hover, a:active, a:focus, a[href] {
  text-decoration: none !important;
  cursor: pointer;
  pointer-events: auto !important;
  display: inline-block !important;
}

a:hover {
    border-bottom: 1px solid #0000ff !important;
}

/* Links inside paragraphs */
p a {
  white-space: nowrap !important;
}
a[href]:hover::after {
  content: attr(href);
  position: absolute;
  bottom: 100%;
  left: 0;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 11px;
  z-index: 10000;
  pointer-events: none;
  margin-bottom: 4px;
}
a[href]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 8px;
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.85);
  z-index: 10000;
  pointer-events: none;
}
p {
  margin: 0;
  padding: 0;
  line-height: normal;
}
</style>
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const normKey = (raw: string): string =>
  raw
    .replace(/^[A-Za-z0-9]{1,8}\+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const inferWeight = (lower: string): number => {
  if (lower.includes("thin")) return 100;
  if (lower.includes("extralight") || lower.includes("ultralight")) return 200;
  if (lower.includes("light")) return 300;
  if (lower.includes("medium") || lower.includes("medi")) return 500;
  if (lower.includes("semibold") || lower.includes("demi")) return 600;
  if (
    lower.includes("bold") ||
    lower.includes("heavy") ||
    lower.includes("black")
  )
    return 700;
  if (lower.includes("extrabold") || lower.includes("ultrabold")) return 800;
  return 400;
};

const inferStyle = (lower: string): "italic" | null =>
  lower.includes("ital") || lower.includes("oblique") ? "italic" : null;

// ─── Inline-element space injection ─────────────────────────────────────────
// Stirling PDF emits HTML where styled inline runs (i, b, span, font, a, em,
// strong, u, s, sub, sup) have no whitespace between them and adjacent text
// nodes, causing words to collide: "between<i>posture</i>is" → "betweenpostureis".
// We fix this with a regex pass on the raw HTML string before it hits the browser.
//
// Strategy: for every closing tag of an inline element that is immediately
// followed by a non-space character, inject a space; and for every opening
// tag of an inline element that is immediately preceded by a non-space
// character, inject a space. We only do this for INLINE elements (not block
// elements like div/p/table), so we never add spurious spaces inside
// absolutely-positioned block runs.

const INLINE_TAGS =
  "a|abbr|acronym|b|bdo|big|br|cite|code|dfn|em|font|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var";

const INLINE_OPEN_RE = new RegExp(
  `([^\\s>])(<(?:${INLINE_TAGS})(?:\\s[^>]*)?>)`,
  "gi",
);
// Do NOT inject space before punctuation (.,;:!?'")] that naturally follows
// a closing inline tag — that would push e.g. "safe." → "safe ."
const INLINE_CLOSE_RE = new RegExp(
  `(<\\/(?:${INLINE_TAGS})>)([^\\s<.,;:!?'"\\)])`,
  "gi",
);

/**
 * Injects a single space between inline elements and adjacent non-space text
 * to repair Stirling PDF's space-free HTML4 output.
 * Only injects where a space is actually missing; leaves existing spaces alone.
 * Does not insert space before punctuation characters (.,;:!?'"]).
 */
const fixInlineSpacing = (html: string): string => {
  // Pass 1 – insert space BEFORE an opening inline tag when preceded by text
  // e.g.  "between<i>" → "between <i>"
  let fixed = html.replace(INLINE_OPEN_RE, "$1 $2");

  // Pass 2 – insert space AFTER a closing inline tag when followed by text
  // e.g.  "</i>is" → "</i> is"
  fixed = fixed.replace(INLINE_CLOSE_RE, "$1 $2");

  return fixed;
};

const createFontReplacement = (entry: FontEntry): string => {
  let replacement = `font-family:${entry.family}`;
  if (entry.weight !== undefined) {
    replacement += `;font-weight:${entry.weight}`;
  }
  if (entry.style && entry.style !== "normal") {
    replacement += `;font-style:${entry.style}`;
  }
  return replacement;
};

const getFontFamilyReplacement = (
  fontMatch: string,
  rawFamily: string,
): string => {
  const primary = rawFamily.split(",")[0]?.trim() ?? "";
  if (!primary) return fontMatch;

  // 1. Try a direct lookup
  let key = normKey(primary);
  let entry = NORMALIZED_FONT_MAP.get(key);
  if (entry) {
    return createFontReplacement(entry);
  }

  // 2. If that fails, strip the PDF prefix and try again
  const stripped = primary.replace(/^[A-Za-z0-9]{1,8}\+/, "").trim();
  if (stripped && stripped !== primary) {
    key = normKey(stripped);
    entry = NORMALIZED_FONT_MAP.get(key);
    if (entry) {
      return createFontReplacement(entry);
    }
  }

  // 3. (Original fallback) If still no match, infer from the stripped name
  if (stripped && stripped !== primary) {
    const lower = stripped.toLowerCase();
    const weight = inferWeight(lower);
    const style = inferStyle(lower);

    let replacement = `font-family:"${stripped}", Arial, sans-serif;font-weight:${weight}`;
    if (style) replacement += `;font-style:${style}`;
    return replacement;
  }

  return fontMatch; // Return original if no logic matches
};

// ─── Main export ─────────────────────────────────────────────────────────────
export const buildHtmlDoc = (html: string): string => {
  let out = html;

  // Fix missing spaces around inline elements from Stirling PDF output
  out = fixInlineSpacing(out);

  // Add target="_blank" to all external links
  out = out.replace(
    /<a\s+([^>]*?)href=(['"])([^"']+)\2([^>]*)>/gi,
    (match, before, quote, url, after) => {
      if (/target=/i.test(match)) return match;
      if (url.startsWith("http") || url.startsWith("mailto:")) {
        return `<a ${before}href=${quote}${url}${quote}${after} target="_blank" rel="noopener noreferrer">`;
      }
      return match;
    },
  );

  // Extract and protect <style> tags
  const styleTags: string[] = [];
  out = out.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, styleContent: string) => {
      const id = `__STYLE_TAG_${styleTags.length}__`;

      // Rewrite font-family declarations, but SKIP any that are tied to an
      // @font-face rule in the same stylesheet.  Here's why this matters:
      //
      // Stirling PDF embeds fonts as data URLs and declares them with their
      // original PDF name, e.g.:
      //   @font-face { font-family: 'CPPABO+TimesNewRoman'; src: url('data:...') }
      //   .ft014 { font-family: CPPABO+TimesNewRoman; }
      //
      // If buildHtmlDoc rewrites the class rule to "TimesNewRoman, Arial, sans-serif"
      // the @font-face name no longer matches → browser ignores the embedded font
      // and falls back to a system font with *different glyph-advance widths*.
      // Absolutely-positioned text runs then overlap or gap incorrectly.
      //
      // Fix: collect every font-family name declared inside @font-face blocks,
      // then skip substitution for those exact names elsewhere in the stylesheet.
      const fontFaceNames = new Set<string>();
      const fontFaceRe = /@font-face\s*\{([^}]*)\}/gi;
      let ffMatch: RegExpExecArray | null;
      while ((ffMatch = fontFaceRe.exec(styleContent)) !== null) {
        const inner = ffMatch[1];
        const famMatch = /font-family\s*:\s*['"]?([^;'"}\n]+)['"]?/i.exec(
          inner,
        );
        if (famMatch) {
          // Normalise: strip quotes, trim, lower-case for comparison
          fontFaceNames.add(famMatch[1].trim().toLowerCase());
        }
      }

      const processedStyle = styleContent
        // Pass 1: preserve @font-face blocks verbatim
        .replace(/@font-face\s*\{[^}]*\}/gi, (block) => block)
        // Pass 2: rewrite font-family everywhere else, but skip names that have
        // a matching @font-face declaration (those must stay in sync)
        .replace(
          /font-family:\s*([^;}{'"<\n]+)/gi,
          (fontMatch, rawFamily: string) => {
            const primary = rawFamily.split(",")[0]?.trim() ?? "";
            if (!primary) return fontMatch;

            const primaryLower = primary
              .replace(/^['"]|['"]$/g, "")
              .toLowerCase();
            if (fontFaceNames.has(primaryLower)) return fontMatch;

            return getFontFamilyReplacement(fontMatch, rawFamily);
          },
        );

      styleTags.push(`<style${attrs}>${processedStyle}</style>`);
      return id;
    },
  );

  // Extract inline styles
  const styleMap = new Map<string, string>();
  let styleIdCounter = 0;

  out = out.replace(/\s+style="([^"]*)"/gi, (_match, styleContent: string) => {
    const id = `__STYLE_PLACEHOLDER_${styleIdCounter++}__`;
    styleMap.set(id, styleContent);
    return ` data-temp-style="${id}"`;
  });

  out = out.replace(/\s+style='([^']*)'/gi, (_match, styleContent: string) => {
    const id = `__STYLE_PLACEHOLDER_${styleIdCounter++}__`;
    styleMap.set(id, styleContent);
    return ` data-temp-style="${id}"`;
  });

  // Replace font-family declarations
  out = out.replace(
    /font-family:\s*([^;}{'"<\n]+)/gi,
    getFontFamilyReplacement,
  );

  // Restore inline styles
  out = out.replace(
    /\s+data-temp-style="(__STYLE_PLACEHOLDER_\d+__)"/gi,
    (_match, id: string) => {
      const originalStyle = styleMap.get(id);
      if (!originalStyle) return _match;
      const escapedStyle = originalStyle.replace(/"/g, "&quot;");
      return ` style="${escapedStyle}"`;
    },
  );

  // Restore <style> tags
  styleTags.forEach((styleTag, index) => {
    const placeholder = `__STYLE_TAG_${index}__`;
    out = out.replace(placeholder, styleTag);
  });

  // Strip body link/vlink/alink attributes
  out = out.replace(/<body([^>]*)>/gi, (_match, attrs: string) => {
    const cleaned = attrs
      .replace(/\s+link\s*=\s*['"][^'"]*['']/gi, "")
      .replace(/\s+vlink\s*=\s*['"][^'"]*['']/gi, "")
      .replace(/\s+alink\s*=\s*['"][^'"]*['']/gi, "")
      .replace(/\s+text\s*=\s*['"][^'"]*['']/gi, "")
      .replace(/\s+bgcolor\s*=\s*['"][^'"]*['']/gi, "");
    return `<body${cleaned}>`;
  });

  // Inject Google Fonts
  if (out.includes("</head>")) {
    out = out.replace("</head>", `${GOOGLE_FONTS_LINK}</head>`);
  } else if (out.includes("<head>")) {
    out = out.replace("<head>", `<head>${GOOGLE_FONTS_LINK}`);
  } else {
    out = `${GOOGLE_FONTS_LINK}${out}`;
  }

  // Inject BASE_STYLE
  if (out.includes("</body>")) {
    return out.replace("</body>", `${BASE_STYLE}</body>`);
  }
  if (out.includes("</html>")) {
    return out.replace("</html>", `${BASE_STYLE}</html>`);
  }
  return `${out}${BASE_STYLE}`;
};
