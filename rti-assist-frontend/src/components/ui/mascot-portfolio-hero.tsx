"use client"

import * as React from "react"

/* ------------------------------------------------------------------ types */

export type MascotPortfolioHeroProps = {
  /**
   * Height of the hero. Must be a definite length — the poster is fitted to
   * this box, so a percentage collapses to 0px unless every ancestor up to
   * `<html>` has a real height. Never pass `"100%"`.
   */
  height?: string
  /** Floor for the height, so the headline stays legible. */
  minHeight?: string

  /* ---- top rule ---- */
  /** Set in the green half of the index pill, top left. */
  index?: string
  /** Set beside the index, inside the same pill. */
  discipline?: string
  /** The bold line beside the pill. */
  tagline?: string
  /** Centre-right, set inside braces: `{ first / second }`. */
  collection?: [string, string]
  /** Top right, two lines beside the green dot. */
  reel?: [string, string]

  /* ---- headline ---- */
  /** First headline line, before the arrow. */
  year?: string
  /** First headline line, after the arrow. */
  initials?: string
  /** The ringed stamp beside the first line. */
  badge?: string
  /** Second headline line. */
  line2?: string
  /** Third headline line. Its last letter gets the looping swash. */
  line3?: string
  /** Fourth line, the big one — set before the vertical tag. */
  word?: string
  /** The vertical label between `word` and the bracketed letters. */
  verticalTag?: string
  /** Set between the two arcs, followed by an asterisk. */
  bracketed?: string

  /* ---- pill and services ---- */
  /** White half of the pill. */
  seekingLabel?: string
  /** Green half of the pill. */
  seeking?: string
  /** Turns the green half into a link. */
  href?: string
  /** The row along the bottom edge. */
  services?: string[]

  /* ---- the character ---- */
  avatarPreset?: "yash" | "prachi" | "default"
  /** Custom recorded audio file(s) (e.g. '/audio/yash.mp3'). If not provided, defaults to /audio/yash.mp3 or /audio/prachi.mp3 */
  audioSrc?: string | string[]
  /** Cycled through, one per click on the character. */
  greetings?: string[]
  skin?: string
  beanie?: string
  shirt?: string
  /** The leather tag on the beanie cuff. */
  tag?: string

  /* ---- palette ---- */
  /** The green: index pill, dot, seeking pill, hover rules. */
  accent?: string
  /** The sheet. */
  paper?: string
  /** Type, rules and the room. */
  ink?: string
  className?: string
}

const SANS_STACK =
  '"Inter","Helvetica Neue",Helvetica,Arial,system-ui,sans-serif'
const DISPLAY_STACK =
  '"Archivo Black","Arial Black","Helvetica Neue",Helvetica,Arial,system-ui,sans-serif'

/* The character's sheet. Every coordinate in the figure lives in this box. */
const CW = 600
const CH = 720

/* --------------------------------------------------------------- the gaze */

/**
 * Where the pointer is, relative to the head, as a direction in (-1, 1) on
 * each axis. Soft-saturated rather than clamped, so the head never slams into
 * a stop: it keeps turning a little further the further away you go.
 */
export function aim(px: number, py: number, cx: number, cy: number, rx: number, ry: number) {
  const sat = (v: number) => v / Math.sqrt(1 + v * v)
  return [sat((px - cx) / rx), sat((py - cy) / ry)]
}

/** Frame-rate-independent easing of `cur` towards `target`. */
export function approach(cur: number, target: number, dt: number, rate: number) {
  return target + (cur - target) * Math.exp(-rate * dt)
}

/**
 * How far each layer moves for a gaze of (x, y). Offsets are in figure units
 * and nested: `face` is relative to `head`, `nose` and `eyes` to `face`.
 * `near` is 0..1, how close the pointer is to the face — it widens the eyes
 * and lifts the brows.
 */
export function pose(x: number, y: number, near: number) {
  return {
    body: { dx: x * 4, dy: 0 },
    head: { dx: x * 10, dy: y * 7, rot: x * 4 },
    ears: { dx: -x * 7, dy: -y * 3, lead: 1 + x * 0.16, trail: 1 - x * 0.16 },
    beanie: { dx: x * 13, dy: y * 4 },
    tag: { dx: x * 7, dy: 0 },
    blush: { dx: x * 20, dy: y * 14 },
    face: { dx: x * 28, dy: y * (y < 0 ? 11 : 20) },
    nose: { dx: x * 10, dy: y * 7 },
    eyes: { dx: x * 4, dy: y * 4, scale: 1 + near * 0.14 },
    brows: { dx: x * 3, dy: y * 2 + Math.min(0, y) * 3 - near * 9 },
  }
}

/** Blink envelope: 1 is open, dips towards 0.08 across a 150ms blink. */
export function blink(since: number) {
  const d = 0.15
  if (since < 0 || since > d) return 1
  return 1 - Math.sin((Math.PI * since) / d) * 0.92
}

/* ------------------------------------------------------------- the room */

type Seg = [number, number, number, number]

function room(): { back: Seg[]; rays: Seg[]; depth: string[] } {
  const x0 = 95
  const x1 = 905
  const y0 = 85
  const y1 = 865
  const vx = (x0 + x1) / 2
  const vy = (y0 + y1) / 2
  const cols = 14
  const rows = 11
  const back: Seg[] = []
  const rays: Seg[] = []
  const out = (x: number, y: number): Seg => {
    const dx = x - vx
    const dy = y - vy
    const tx = dx > 0 ? (1000 - x) / dx : dx < 0 ? -x / dx : Infinity
    const ty = dy > 0 ? (1000 - y) / dy : dy < 0 ? -y / dy : Infinity
    const t = Math.min(tx, ty)
    return [x, y, x + dx * t, y + dy * t]
  }
  for (let i = 0; i <= cols; i++) {
    const x = x0 + ((x1 - x0) * i) / cols
    back.push([x, y0, x, y1])
    rays.push(out(x, y0), out(x, y1))
  }
  for (let j = 0; j <= rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows
    back.push([x0, y, x1, y])
    rays.push(out(x0, y), out(x1, y))
  }
  const depth = [1.07, 1.16, 1.28, 1.45, 1.7].map((s) => {
    const l = vx + (x0 - vx) * s
    const r = vx + (x1 - vx) * s
    const t = vy + (y0 - vy) * s
    const b = vy + (y1 - vy) * s
    return "M" + l + " " + t + "H" + r + "V" + b + "H" + l + "Z"
  })
  return { back, rays, depth }
}

const ROOM = room()

function flowerPath() {
  const n = 180
  const lens = [1, 0.84, 0.95, 0.78, 0.9]
  let d = ""
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = Math.floor(((a + Math.PI / 5) / (Math.PI * 2)) * 5) % 5
    const lobe = Math.pow(Math.abs(Math.cos((a * 5) / 2)), 0.9)
    const r = 50 * (0.3 + 0.7 * lobe * lens[k])
    const x = 60 + Math.cos(a - Math.PI / 2) * r
    const y = 60 + Math.sin(a - Math.PI / 2) * r
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)
  }
  return d + "Z"
}

const FLOWER = flowerPath()

/* ----------------------------------------------------------------- styles */

const CSS = `
.mph-root{position:relative;width:100%;overflow:hidden;isolation:isolate;background:var(--mph-paper);color:var(--mph-ink);container:mph / size;font-family:var(--mph-sans);-webkit-font-smoothing:antialiased;}
.mph-room{position:absolute;inset:0;width:100%;height:100%;display:block;color:var(--mph-ink);pointer-events:none;}
.mph-room line,.mph-room path{vector-effect:non-scaling-stroke;}
.mph-stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(100cqw,177.78cqh);aspect-ratio:16/9;container:mphs / inline-size;}

.mph-top{position:absolute;left:4.6%;right:4.6%;top:4.4%;display:grid;grid-template-columns:auto auto 1fr auto auto;align-items:center;column-gap:2.4cqw;font-size:1.05cqw;font-weight:800;line-height:1.1;text-transform:uppercase;letter-spacing:.02em;}
.mph-index{display:inline-flex;align-items:center;gap:.9em;border:.12cqw solid var(--mph-ink);border-radius:999px;padding:.12em .9em .12em .12em;font-size:.72em;}
.mph-index b{background:var(--mph-accent);color:var(--mph-ink);border-radius:999px;padding:.3em 1.2em;font-weight:800;}
.mph-tagline{font-size:1.18em;font-weight:900;margin-left:1cqw;}
.mph-brace{grid-column:4;font-size:1.3em;font-weight:700;letter-spacing:.04em;margin-right:2.6cqw;}
.mph-reel{grid-column:5;display:flex;align-items:center;gap:.8em;font-size:.8em;text-align:right;}
.mph-reel i{display:block;width:1.9em;height:1.9em;border-radius:50%;background:var(--mph-accent);border:.12cqw solid var(--mph-ink);flex:none;}

.mph-h1{position:absolute;left:8.8%;top:17.5%;margin:0;font-family:var(--mph-display);font-weight:900;font-size:6.5cqw;line-height:.93;letter-spacing:-.045em;text-transform:uppercase;color:var(--mph-ink);}
.mph-line{display:block;width:max-content;white-space:nowrap;position:relative;}
.mph-ch{display:inline-block;transition:transform .35s cubic-bezier(.3,1.6,.5,1),color .2s;}
.mph-ch:hover{transform:translateY(-.08em) rotate(-4deg);color:var(--mph-accent);}
.mph-arrow{display:inline-block;width:.6em;height:.6em;margin:0 .06em 0 .1em;vertical-align:-.02em;}
.mph-arrow path{stroke:currentColor;stroke-width:15;fill:none;stroke-linecap:square;}
.mph-badge{position:absolute;top:-.02em;left:calc(100% + .55em);font-family:var(--mph-sans);font-size:.2em;font-weight:800;letter-spacing:0;line-height:1;text-transform:none;border:.13cqw solid var(--mph-ink);border-radius:50%;padding:.75em 1.15em;transform:rotate(-9deg);transition:background .25s,transform .4s cubic-bezier(.3,1.6,.5,1);cursor:default;}
.mph-badge sup{font-size:.7em;margin-left:.1em;}
.mph-badge:hover{background:var(--mph-accent);transform:rotate(6deg) scale(1.08);}
.mph-swash{position:relative;display:inline-block;}
.mph-swash svg{position:absolute;left:-.95em;top:.3em;width:2.55em;height:.72em;overflow:visible;pointer-events:none;}
.mph-swash path{fill:none;stroke:var(--mph-ink);stroke-width:.2cqw;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:0;animation:mph-draw 1.6s .5s cubic-bezier(.6,0,.2,1) both;}
.mph-h1:hover .mph-swash path{animation:mph-draw 1.1s cubic-bezier(.6,0,.2,1) both;}
.mph-l4{font-size:1.2em;letter-spacing:-.02em;margin-top:.04em;}
.mph-vtag{display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:-.02em;margin:0 .1em 0 .06em;width:.2em;}
.mph-vtag span{display:block;background:var(--mph-ink);color:var(--mph-paper);writing-mode:vertical-rl;font-family:var(--mph-sans);font-size:.105em;font-weight:800;letter-spacing:.12em;padding:.55em 0;text-align:center;}
.mph-vtag i{display:block;height:.34em;background:repeating-linear-gradient(to bottom,var(--mph-ink) 0 .02em,transparent .02em .045em);}
.mph-bracket{position:relative;display:inline-block;padding:0 .08em;}
.mph-bracket svg{position:absolute;left:-.02em;right:-.02em;top:-.1em;bottom:-.12em;width:calc(100% + .04em);height:calc(100% + .22em);overflow:visible;}
.mph-bracket path{fill:none;stroke:var(--mph-ink);stroke-width:.62cqw;stroke-linecap:butt;transition:transform .45s cubic-bezier(.3,1.6,.5,1);}
.mph-bracket:hover .mph-arc-t{transform:translateY(-10px);}
.mph-bracket:hover .mph-arc-b{transform:translateY(10px);}
.mph-star{display:inline-block;font-size:.66em;vertical-align:.5em;margin-left:.02em;transition:transform .6s cubic-bezier(.3,1.6,.5,1);}
.mph-l4:hover .mph-star{transform:rotate(180deg) scale(1.2);}

.mph-pill{position:absolute;left:8.8%;top:72.8%;display:flex;align-items:stretch;font-size:1.72cqw;font-weight:800;line-height:1;}
.mph-pill-a{position:relative;z-index:1;background:#fff;color:#0f172a;border:.16cqw solid var(--mph-ink);border-radius:999px;padding:.72em 1.25em;}
.mph-pill-b{display:inline-flex;align-items:center;gap:.5em;margin-left:-1.4em;padding:.72em 3.4em .72em 3.1em;background:var(--mph-accent);color:var(--mph-ink);border:.16cqw solid var(--mph-ink);border-radius:0 999px 999px 0;text-decoration:none;transition:background .25s,color .25s,padding .35s cubic-bezier(.3,1.4,.5,1);}
.mph-pill-b em{font-style:normal;display:inline-block;width:0;overflow:hidden;opacity:0;transition:width .35s,opacity .25s;}
.mph-pill-b:hover,.mph-pill-b:focus-visible{background:var(--mph-ink);color:var(--mph-paper);padding-right:2.4em;outline:none;}
.mph-pill-b:hover em,.mph-pill-b:focus-visible em{width:1em;opacity:1;}

.mph-flower{position:absolute;left:35.4%;top:64%;width:7.4%;aspect-ratio:1;animation:mph-spin 22s linear infinite;cursor:grab;}
.mph-flower svg{display:block;width:100%;height:100%;overflow:visible;transition:transform .5s cubic-bezier(.3,1.8,.5,1);}
.mph-flower:hover svg{transform:scale(1.18) rotate(40deg);}
.mph-flower path{fill:#fff;stroke:var(--mph-ink);stroke-width:2.6;stroke-linejoin:round;}
.mph-curl{position:absolute;left:43.2%;top:52.5%;width:5.6%;aspect-ratio:1;overflow:visible;pointer-events:none;}
.mph-curl path{fill:none;stroke:var(--mph-ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;animation:mph-draw 1.4s 1s cubic-bezier(.6,0,.2,1) both;}

.mph-services{position:absolute;left:4.6%;bottom:4.6%;display:flex;gap:4cqw;margin:0;padding:0;list-style:none;font-size:1.3cqw;font-weight:800;}
.mph-services li{position:relative;cursor:default;padding-bottom:.25em;}
.mph-services li::after{content:"";position:absolute;left:0;right:0;bottom:0;height:.18em;background:var(--mph-accent);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.6,0,.2,1);}
.mph-services li:hover::after{transform:scaleX(1);}

.mph-rule{position:absolute;width:0;border-left:.1cqw solid var(--mph-ink);}
.mph-rule::after{content:"";position:absolute;bottom:0;left:-.1cqw;width:1.1cqw;border-top:.1cqw solid var(--mph-ink);transform:rotate(28deg);transform-origin:left;}
.mph-rule-l{left:3.7%;top:23%;height:13%;}
.mph-rule-r{left:94.8%;top:66%;height:13%;}

.mph-char{position:absolute;left:55.5%;bottom:-1.2%;width:40.5%;aspect-ratio:600/720;padding:0;margin:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:40% 40% 8% 8%;}
.mph-char-prachi{left:55.5%;width:40.5%;bottom:-1.2%;}
.mph-char:focus-visible{outline:.2cqw dashed var(--mph-ink);outline-offset:.4cqw;}
.mph-char svg{display:block;width:100%;height:100%;overflow:visible;}
.mph-tagwig{transform-box:fill-box;transform-origin:50% 0;}
.mph-happy .mph-tagwig{animation:mph-wiggle .9s cubic-bezier(.3,1.6,.5,1);}
.mph-bubble{position:absolute;left:-4%;top:6%;max-width:48%;background:#ffffff;color:#0f172a;border:.16cqw solid var(--mph-ink);border-radius:1.4em 1.4em 1.4em .2em;padding:.8em 1.1em;font-size:1.2cqw;font-weight:800;line-height:1.3;text-align:left;box-shadow:.35cqw .35cqw 0 var(--mph-accent);transform-origin:0 100%;transform:scale(0) rotate(-8deg);opacity:0;transition:transform .45s cubic-bezier(.3,1.6,.5,1),opacity .2s;pointer-events:none;z-index:10;}
.mph-bubble[data-on="true"]{transform:scale(1) rotate(-4deg);opacity:1;}

@keyframes mph-draw{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}
@keyframes mph-spin{to{transform:rotate(360deg);}}
@keyframes mph-wiggle{0%{transform:rotate(0);}25%{transform:rotate(-14deg);}55%{transform:rotate(9deg);}80%{transform:rotate(-4deg);}100%{transform:rotate(0);}}

@container mph (orientation: portrait){
.mph-stage{top:0;transform:translateX(-50%);width:min(100cqw,56.25cqh);height:100cqh;aspect-ratio:auto;}
.mph-top{top:5cqw;left:6%;right:6%;grid-template-columns:auto 1fr auto;font-size:2.5cqw;}
.mph-tagline,.mph-brace{display:none;}
.mph-reel{grid-column:3;}
.mph-h1{left:7%;top:17cqw;font-size:11.4cqw;}
.mph-badge{left:calc(100% + .35em);top:.1em;font-size:.22em;}
.mph-pill{left:7%;top:70cqw;font-size:3.5cqw;}
.mph-flower{left:auto;right:6%;top:66cqw;width:13%;}
.mph-curl{left:auto;right:4%;top:44cqw;width:11%;}
.mph-services{left:7%;right:7%;bottom:auto;top:84cqw;flex-wrap:wrap;gap:1.6cqw 5cqw;font-size:3cqw;}
.mph-rule-l{left:3%;top:22cqw;height:12cqw;}
.mph-rule-r{left:95%;top:auto;bottom:40cqw;height:12cqw;}
.mph-char{left:12%;width:76%;bottom:-.6%;}
.mph-char-prachi{left:12%;width:76%;bottom:-.6%;}
.mph-bubble{font-size:2.8cqw;left:-8%;top:2%;max-width:54%;}
}

@media (prefers-reduced-motion: reduce){
.mph-root *,.mph-root *::after{animation:none!important;transition:none!important;}
}
`

/* ------------------------------------------------------------- component */

type Layers = Partial<
  Record<
    | "body" | "head" | "earL" | "earR" | "beanie" | "tag" | "blush"
    | "face" | "nose" | "eyes" | "brows" | "hair" | "hairBack" | "glasses",
    SVGGElement | null
  >
>

const DEFAULT_SERVICES = ["Full-Stack Architecture", "MERN Stack", "Gemini AI Pipeline", "Section 6(1) Drafter"]
const DEFAULT_GREETINGS = [
  "Hi! Click on me to hear more about RTI Assist.",
  "We engineered RTI Assist to democratize civic information.",
  "Procedural legal petition drafting made simple and transparent!",
  "Built with love & modern tech for every Indian citizen!"
]

export default function MascotPortfolioHero({
  height = "100svh",
  minHeight = "440px",
  index = "08/01",
  discipline = "Creator & Architect",
  tagline = "Civic Transparency",
  collection = ["RTI Assist", "Founders"],
  reel = ["B.Tech CSE @ DSEU", "Delhi, India"],
  year = "2026",
  initials = "YS",
  badge = "Creator",
  line2 = "RTI Assist",
  line3 = "Engineers",
  word = "Build",
  verticalTag = "Architect",
  bracketed = "AI",
  seekingLabel = "Status",
  seeking = "DSEU Okhla-II",
  href,
  services = DEFAULT_SERVICES,
  avatarPreset = "default",
  audioSrc,
  greetings = DEFAULT_GREETINGS,
  skin = "#f5cdb0",
  beanie = "#1d1d1f",
  shirt = "#1e3a5f",
  tag = "#b98158",
  accent = "#2563eb",
  paper = "#f8fafc",
  ink = "#0f172a",
  className,
}: MascotPortfolioHeroProps) {
  const uid = React.useId().replace(/:/g, "")
  const id = (n: string) => n + uid
  const u = (n: string) => "url(#" + id(n) + ")"

  const isYash = avatarPreset === "yash"
  const isPrachi = avatarPreset === "prachi"

  const rootRef = React.useRef<HTMLDivElement>(null)
  const charRef = React.useRef<HTMLButtonElement>(null)
  const layers = React.useRef<Layers>({})
  const set = (k: keyof Layers) => (el: SVGGElement | null) => {
    layers.current[k] = el
  }

  const [happy, setHappy] = React.useState(false)
  const [said, setSaid] = React.useState(-1)
  const [talkMouth, setTalkMouth] = React.useState(0)
  const happyTimer = React.useRef<number | undefined>(undefined)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Preload browser voices on mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices()
      const onVoices = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.addEventListener("voiceschanged", onVoices)
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices)
      }
    }
  }, [])

  // Custom recorded intro voice (e.g. /audio/yash1.mp3)
  const defaultAudio = isYash ? "/audio/yash1.mp3" : isPrachi ? "/audio/prachi1.mp3" : undefined
  const customIntroAudio = audioSrc
    ? Array.isArray(audioSrc)
      ? audioSrc[0]
      : audioSrc
    : defaultAudio

  const currentUttRef = React.useRef<SpeechSynthesisUtterance | null>(null)

  const playTTS = (nextIdx: number) => {
    const text = greetings[nextIdx]
    const displayDuration = Math.max(4500, (text?.length || 20) * 65)

    // Guarantee the speech bubble stays visible for reading
    happyTimer.current = window.setTimeout(() => setHappy(false), displayDuration)

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        // Detach previous utterance handlers before cancelling to prevent spurious 'canceled' events
        if (currentUttRef.current) {
          currentUttRef.current.onend = null
          currentUttRef.current.onerror = null
        }
        window.speechSynthesis.cancel()

        const utt = new SpeechSynthesisUtterance(text)
        currentUttRef.current = utt

        // Select authentic female voice for Prachi, male for Yash
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          if (isPrachi) {
            const femaleVoice =
              voices.find(
                (v) =>
                  (v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().startsWith("en")) &&
                  /(heera|neerja|veena|swara)/i.test(v.name)
              ) ||
              voices.find(
                (v) =>
                  v.lang.toLowerCase().startsWith("en") &&
                  /(zira|jenny|aria|samantha|victoria|karen|moira|fiona|tessa|female)/i.test(v.name)
              ) ||
              voices.find((v) => /(female|woman|girl)/i.test(v.name)) ||
              voices.find(
                (v) =>
                  v.lang.toLowerCase().startsWith("en") &&
                  !/(david|mark|guy|ravi|prabhat|daniel|alex|fred|oliver|stefan|male|george)/i.test(v.name)
              )

            if (femaleVoice) {
              utt.voice = femaleVoice
            }
            utt.pitch = 1.2
            utt.rate = 1.0
          } else if (isYash) {
            const maleVoice =
              voices.find(
                (v) =>
                  (v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().startsWith("en")) &&
                  /(ravi|prabhat)/i.test(v.name)
              ) ||
              voices.find(
                (v) =>
                  v.lang.toLowerCase().startsWith("en") &&
                  /(david|mark|guy|daniel|alex|ravi|prabhat|male|george|stefan)/i.test(v.name)
              )

            if (maleVoice) {
              utt.voice = maleVoice
            }
            utt.pitch = 0.95
            utt.rate = 1.02
          } else {
            utt.pitch = 1.0
            utt.rate = 1.0
          }
        } else {
          utt.pitch = isPrachi ? 1.25 : 0.95
          utt.rate = 1.0
        }

        utt.onend = () => {
          // Allow gentle time for user to finish reading text
          window.clearTimeout(happyTimer.current)
          happyTimer.current = window.setTimeout(() => setHappy(false), 1200)
        }
        utt.onerror = (e) => {
          // Ignore cancelled/interrupted errors when cycling quickly; keep bubble visible
          if (e.error === "canceled" || e.error === "interrupted") {
            return
          }
        }
        window.speechSynthesis.speak(utt)
      } catch {
        // Fallback: timer will close bubble after displayDuration
      }
    }
  }

  const poke = () => {
    const next = (said + 1) % Math.max(1, greetings.length)
    setSaid(next)
    setHappy(true)
    window.clearTimeout(happyTimer.current)

    // Stop previous custom audio playback if any
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Play recorded voice note only on the 1st greeting click (next === 0)
    if (next === 0 && customIntroAudio) {
      const text = greetings[next]
      const displayDuration = Math.max(4500, (text?.length || 20) * 75)
      happyTimer.current = window.setTimeout(() => setHappy(false), displayDuration)

      try {
        const audio = new Audio(customIntroAudio)
        audioRef.current = audio

        audio.onended = () => {
          window.clearTimeout(happyTimer.current)
          happyTimer.current = window.setTimeout(() => setHappy(false), 1000)
        }
        audio.onerror = () => {
          // If first audio path fails, attempt fallback between prachi1 and prach1
          if (isPrachi && customIntroAudio && !customIntroAudio.includes("prach1.mp3")) {
            const fallback = new Audio("/audio/prach1.mp3")
            audioRef.current = fallback
            fallback.onended = () => {
              window.clearTimeout(happyTimer.current)
              happyTimer.current = window.setTimeout(() => setHappy(false), 1000)
            }
            fallback.onerror = () => playTTS(next)
            fallback.play().catch(() => playTTS(next))
            return
          }
          // If custom audio file does not exist, fall back to browser TTS
          playTTS(next)
        }
        audio
          .play()
          .then(() => {
            setHappy(true)
          })
          .catch(() => {
            // Autoplay restriction or 404, fall back to TTS
            playTTS(next)
          })
        return
      } catch {
        playTTS(next)
        return
      }
    }

    // For subsequent clicks (2nd, 3rd, 4th...), play the other greetings periodically
    playTTS(next)
  }

  React.useEffect(() => {
    if (!happy) {
      setTalkMouth(0)
      return
    }
    const interval = window.setInterval(() => {
      setTalkMouth((m) => (m + 1) % 4)
    }, 140)
    return () => window.clearInterval(interval)
  }, [happy])

  React.useEffect(() => () => window.clearTimeout(happyTimer.current), [])

  React.useEffect(() => {
    const root = rootRef.current
    const char = charRef.current
    if (!root || !char) return

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    let still = mq.matches
    const onMq = () => (still = mq.matches)
    mq.addEventListener("change", onMq)

    let px = 0
    let py = 0
    let lastMove = -1e9
    let gx = 0
    let gy = 0
    let near = 0
    let prev = performance.now()
    let nextBlink = prev + 1800
    let blinkAt = -1e9
    let raf = 0
    let visible = true

    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
      lastMove = performance.now()
    }
    const onLeave = () => (lastMove = -1e9)
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    window.addEventListener("blur", onLeave)

    const tr = (dx: number, dy: number) => "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")"
    const L = layers.current

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now

      const r = char.getBoundingClientRect()
      const cx = r.left + r.width * 0.5
      const cy = r.top + r.height * 0.48
      let tx = 0
      let ty = 0
      let tn = 0
      const idle = now - lastMove > 3500
      if (!idle) {
        const reach = Math.max(innerWidth, innerHeight)
        ;[tx, ty] = aim(px, py, cx, cy, reach * 0.3, reach * 0.26)
        const dist = Math.hypot(px - cx, py - cy)
        tn = Math.max(0, 1 - dist / (r.width * 0.45))
      } else if (!still) {
        const t = now / 1000
        tx = Math.sin(t * 0.45) * 0.55 + Math.sin(t * 1.1) * 0.1
        ty = Math.sin(t * 0.31 + 1) * 0.25
      }

      const rate = still ? 30 : 7
      gx = approach(gx, tx, dt, rate)
      gy = approach(gy, ty, dt, rate)
      near = approach(near, tn, dt, 8)
      const p = pose(gx, gy, near)
      const breathe = still ? 0 : Math.sin(now / 620) * 1.6

      if (!still && now > nextBlink) {
        blinkAt = now
        nextBlink = now + (Math.random() < 0.15 ? 280 : 3000 + Math.random() * 2000)
      }
      const open = still ? 1 : blink((now - blinkAt) / 1000)
      const headBob = happy && !still ? Math.sin(now / 115) * 1.8 : 0

      L.body?.setAttribute("transform", tr(p.body.dx, p.body.dy + breathe * 0.4))
      L.head?.setAttribute(
        "transform",
        tr(p.head.dx, p.head.dy + breathe + headBob) + " rotate(" + p.head.rot.toFixed(2) + " 300 560)",
      )
      L.earL?.setAttribute("transform", tr(p.ears.dx, p.ears.dy) + " translate(138 380) scale(" + p.ears.lead.toFixed(3) + " 1) translate(-138 -380)")
      L.earR?.setAttribute("transform", tr(p.ears.dx, p.ears.dy) + " translate(462 380) scale(" + p.ears.trail.toFixed(3) + " 1) translate(-462 -380)")
      L.beanie?.setAttribute("transform", tr(p.beanie.dx, p.beanie.dy))
      L.tag?.setAttribute("transform", tr(p.tag.dx, p.tag.dy))
      L.blush?.setAttribute("transform", tr(p.blush.dx, p.blush.dy))
      L.face?.setAttribute("transform", tr(p.face.dx, p.face.dy))
      L.nose?.setAttribute("transform", tr(p.nose.dx, p.nose.dy))
      L.brows?.setAttribute("transform", tr(p.brows.dx, p.brows.dy))
      L.glasses?.setAttribute("transform", tr(p.eyes.dx * 1.1, p.eyes.dy * 1.1))
      L.hair?.setAttribute("transform", tr(p.beanie.dx, p.beanie.dy))
      L.hairBack?.setAttribute("transform", tr(p.body.dx * 1.05, p.body.dy + breathe * 0.35))
      L.eyes?.setAttribute(
        "transform",
        tr(p.eyes.dx, p.eyes.dy) +
          " translate(300 350) scale(" + p.eyes.scale.toFixed(3) + " " + (p.eyes.scale * open).toFixed(3) + ") translate(-300 -350)",
      )
    }
    raf = requestAnimationFrame(frame)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      prev = performance.now()
    })
    io.observe(root)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      mq.removeEventListener("change", onMq)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("blur", onLeave)
    }
  }, [])

  const chars = (s: string) =>
    Array.from(s).map((c, i) => (
      <span key={i} className="mph-ch">
        {c === " " ? " " : c}
      </span>
    ))

  const l3 = Array.from(line3)
  const l3Head = l3.slice(0, -1).join("")
  const l3Tail = l3[l3.length - 1] ?? ""
  const greeting = said >= 0 ? greetings[said % greetings.length] : greetings[0]

  const vars = {
    "--mph-accent": accent,
    "--mph-paper": paper,
    "--mph-ink": ink,
    "--mph-sans": SANS_STACK,
    "--mph-display": DISPLAY_STACK,
    height,
    minHeight,
  } as React.CSSProperties

  const pillInner = (
    <>
      {seeking}
      <em aria-hidden="true">→</em>
    </>
  )



  return (
    <div ref={rootRef} className={"mph-root" + (className ? " " + className : "")} style={vars}>
      <style>{CSS}</style>

      <svg className="mph-room" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.13">
          {ROOM.back.map((s, i) => (
            <line key={"b" + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />
          ))}
          {ROOM.rays.map((s, i) => (
            <line key={"r" + i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} />
          ))}
          {ROOM.depth.map((d, i) => (
            <path key={"d" + i} d={d} />
          ))}
        </g>
      </svg>

      <div className="mph-stage">
        <header className="mph-top">
          <span className="mph-index">
            <b>{index}</b>
            {discipline}
          </span>
          <span className="mph-tagline">{tagline}</span>
          <span className="mph-brace">
            {"{"}
            {collection[0]}/{collection[1]}
            {"}"}
          </span>
          <span className="mph-reel">
            <i aria-hidden="true" />
            <span>
              {reel[0]}
              <br />
              {reel[1]}
            </span>
          </span>
        </header>

        <span className="mph-rule mph-rule-l" aria-hidden="true" />
        <span className="mph-rule mph-rule-r" aria-hidden="true" />

        <h1 className="mph-h1" aria-label={[year, initials, line2, line3, word + bracketed].join(" ")}>
          <span className="mph-line" aria-hidden="true">
            {chars(year)}
            <svg className="mph-arrow" viewBox="0 0 100 100">
              <path d="M14 14 L84 84 M84 30 V84 H30" />
            </svg>
            {chars(initials)}
            <span className="mph-badge">
              {badge}
              <sup>@</sup>
            </span>
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars(line2)}
          </span>
          <span className="mph-line" aria-hidden="true">
            {chars(l3Head)}
            <span className="mph-swash">
              <span className="mph-ch">{l3Tail}</span>
              <svg viewBox="0 0 255 72" preserveAspectRatio="none">
                <path
                  pathLength={1}
                  d="M6 44 C40 18 150 4 222 14 C262 20 258 48 214 58 C150 72 60 70 30 60 C10 53 20 40 60 34"
                />
              </svg>
            </span>
          </span>
          <span className="mph-line mph-l4" aria-hidden="true">
            {chars(word)}
            <span className="mph-vtag">
              <span>{verticalTag}</span>
              <i />
            </span>
            <span className="mph-bracket">
              <svg viewBox="0 0 100 120" preserveAspectRatio="none">
                <path className="mph-arc-t" vectorEffect="non-scaling-stroke" d="M4 16 Q50 -8 96 16" />
                <path className="mph-arc-b" vectorEffect="non-scaling-stroke" d="M4 104 Q50 128 96 104" />
              </svg>
              {bracketed}
            </span>
            <span className="mph-star">*</span>
          </span>
        </h1>

        <svg className="mph-curl" viewBox="0 0 100 100" aria-hidden="true">
          <path
            pathLength={1}
            d="M92 8 C70 6 52 22 58 40 C63 56 84 52 80 36 C76 22 50 30 40 48 C32 62 26 74 16 84 M14 66 L14 86 L34 86"
          />
        </svg>

        <div className="mph-pill">
          <span className="mph-pill-a">{seekingLabel}</span>
          {href ? (
            <a className="mph-pill-b" href={href}>
              {pillInner}
            </a>
          ) : (
            <span className="mph-pill-b" tabIndex={0}>
              {pillInner}
            </span>
          )}
        </div>

        <div className="mph-flower" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <path d={FLOWER} />
            <circle cx="60" cy="60" r="4" fill="none" stroke={ink} strokeWidth="2" />
          </svg>
        </div>

        <ul className="mph-services">
          {services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <button
          ref={charRef}
          type="button"
          className={"mph-char" + (happy ? " mph-happy" : "") + (isPrachi ? " mph-char-prachi" : "")}
          onClick={poke}
          aria-label={isYash ? "Talk to Yash Sehgal" : isPrachi ? "Talk to Prachi Mehra" : "Say hi to the character"}
        >
          <svg viewBox={"0 0 " + CW + " " + CH} aria-hidden="true">
            <defs>
              <radialGradient id={id("shade")} cx="46%" cy="40%" r="62%">
                <stop offset="0.55" stopColor={isPrachi ? "#8a3a24" : "#7a2e14"} stopOpacity={isPrachi ? "0.15" : "0.34"} />
                <stop offset="1" stopColor={isPrachi ? "#8a3a24" : "#7a2e14"} stopOpacity={isPrachi ? "0.28" : "0.34"} />
              </radialGradient>
              <radialGradient id={id("hi")} cx="36%" cy="30%" r="42%">
                <stop offset="0" stopColor="#fff" stopOpacity={isPrachi ? "0.65" : "0.55"} />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={id("blush")}>
                <stop offset="0" stopColor="#ff6f6f" stopOpacity={isPrachi ? "0.6" : "0.45"} />
                <stop offset="1" stopColor="#ff6f6f" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={id("knit")} cx="38%" cy="22%" r="80%">
                <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.35" />
              </radialGradient>
              <radialGradient id={id("eye")} cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#3a3a3c" />
                <stop offset="1" stopColor="#050505" />
              </radialGradient>
              <radialGradient id={id("nose")} cx="42%" cy="36%" r="66%">
                <stop offset="0" stopColor="#ff9c82" stopOpacity="0.18" />
                <stop offset="1" stopColor="#b8583a" stopOpacity="0.42" />
              </radialGradient>
              <linearGradient id={id("neck")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6b2a14" stopOpacity={isPrachi ? "0.25" : "0.45"} />
                <stop offset="0.5" stopColor="#6b2a14" stopOpacity="0.06" />
              </linearGradient>
              <linearGradient id={id("cloth")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="1" stopColor="#000" stopOpacity="0.3" />
              </linearGradient>

              {/* Custom assets for Prachi */}
              <radialGradient id={id("prachiEye")} cx="42%" cy="36%" r="66%">
                <stop offset="0" stopColor="#452718" />
                <stop offset="0.65" stopColor="#1a0f09" />
                <stop offset="1" stopColor="#0a0503" />
              </radialGradient>
              <linearGradient id={id("prachiLip")} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e86b7b" />
                <stop offset="1" stopColor="#c54153" />
              </linearGradient>
              <linearGradient id={id("prachiGold")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe28a" />
                <stop offset="0.5" stopColor="#f5b842" />
                <stop offset="1" stopColor="#d48f18" />
              </linearGradient>
              <linearGradient id={id("prachiHairSilk")} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#101012" />
                <stop offset="0.22" stopColor="#2c2732" />
                <stop offset="0.5" stopColor="#131316" />
                <stop offset="0.78" stopColor="#2c2732" />
                <stop offset="1" stopColor="#101012" />
              </linearGradient>
              <radialGradient id={id("prachiBlushGlow")} cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#ff7080" stopOpacity="0.58" />
                <stop offset="0.6" stopColor="#ff7080" stopOpacity="0.18" />
                <stop offset="1" stopColor="#ff7080" stopOpacity="0" />
              </radialGradient>

              <pattern id={id("plaid")} width="36" height="36" patternUnits="userSpaceOnUse">
                <rect width="36" height="36" fill="#1e3a5f" />
                <rect width="36" height="18" fill="#244b7a" opacity="0.6" />
                <rect width="18" height="36" fill="#244b7a" opacity="0.6" />
                <line x1="0" y1="18" x2="36" y2="18" stroke="#d94f4f" strokeWidth="2.5" opacity="0.75" />
                <line x1="18" y1="0" x2="18" y2="36" stroke="#d94f4f" strokeWidth="2.5" opacity="0.75" />
                <line x1="0" y1="9" x2="36" y2="9" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
                <line x1="9" y1="0" x2="9" y2="36" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
              </pattern>
              <filter id={id("fuzz")} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <clipPath id={id("mouth")}>
                <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" />
              </clipPath>
              <clipPath id={id("cuff")}>
                <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" />
              </clipPath>
            </defs>

            {/* Contact shadow */}
            <ellipse cx="300" cy="712" rx="250" ry="16" fill="#000" opacity="0.08" />

            {/* Prachi's flowing back hair behind shoulders */}
            {isPrachi && (
              <g ref={set("hairBack")}>
                {/* Flowing dark hair waterfall */}
                <path
                  d="M130 250 C90 340 60 480 65 725 C115 735 180 710 195 620 C180 490 155 370 175 290 Z"
                  fill={u("prachiHairSilk")}
                />
                <path
                  d="M470 250 C510 340 540 480 535 725 C485 735 420 710 405 620 C420 490 445 370 425 290 Z"
                  fill={u("prachiHairSilk")}
                />
                {/* Hair strand highlights */}
                <path d="M100 370 C85 470 90 580 110 680" fill="none" stroke="#3d3744" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
                <path d="M500 370 C515 470 510 580 490 680" fill="none" stroke="#3d3744" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
              </g>
            )}

            <g ref={set("body")}>
              {/* Torso & shirt */}
              <path
                d="M28 730 C40 646 104 604 206 588 L394 588 C496 604 560 646 572 730 Z"
                fill={isYash ? u("plaid") : isPrachi ? "#131316" : shirt}
              />
              <path
                d="M28 730 C40 646 104 604 206 588 L394 588 C496 604 560 646 572 730 Z"
                fill={u("cloth")}
              />
              {/* Neck */}
              <path d="M246 500 L354 500 L360 600 Q300 624 240 600 Z" fill={skin} />
              <path d="M246 500 L354 500 L360 600 Q300 624 240 600 Z" fill={u("neck")} />

              {/* Collar & jewelry details */}
              {isYash ? (
                <>
                  <path d="M236 566 Q262 604 300 628 L250 668 Q214 628 194 594 Z" fill="#1b3452" stroke="#d94f4f" strokeWidth="2" />
                  <path d="M364 566 Q338 604 300 628 L350 668 Q386 628 406 594 Z" fill="#1b3452" stroke="#d94f4f" strokeWidth="2" />
                  <rect x="288" y="628" width="24" height="102" fill="#162c45" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
                  <circle cx="300" cy="656" r="5" fill="#f4f1ea" stroke="#000" strokeOpacity="0.5" />
                  <circle cx="300" cy="698" r="5" fill="#f4f1ea" stroke="#000" strokeOpacity="0.5" />
                </>
              ) : isPrachi ? (
                <>
                  {/* Collarbone subtle shadow */}
                  <path d="M260 594 Q280 602 295 597 M305 597 Q320 602 340 594" stroke="#a24c2e" strokeWidth="2.2" strokeLinecap="round" opacity="0.25" fill="none" />
                  {/* Dainty gold necklace with sparkling diamond pendant */}
                  <path d="M266 548 Q300 584 334 548" fill="none" stroke={u("prachiGold")} strokeWidth="2.4" />
                  <circle cx="300" cy="578" r="4.5" fill={u("prachiGold")} stroke="#a86d14" strokeWidth="0.8" />
                  <path d="M300 573 L302 577 L306 578 L302 579 L300 583 L298 579 L294 578 L298 577 Z" fill="#ffffff" />
                  {/* Clean fitted crewneck collar */}
                  <path d="M242 590 Q300 630 358 590 Q300 618 242 590 Z" fill="#0c0c0e" stroke="#242428" strokeWidth="2.5" />
                </>
              ) : (
                <>
                  <path d="M236 566 Q262 604 300 628 L250 668 Q214 628 194 594 Z" fill={shirt} />
                  <path d="M364 566 Q338 604 300 628 L350 668 Q386 628 406 594 Z" fill={shirt} />
                  <rect x="288" y="628" width="24" height="102" fill="#fff" opacity="0.05" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
                  <circle cx="300" cy="656" r="6" fill="#2a2a2c" stroke="#000" strokeOpacity="0.5" />
                  <circle cx="300" cy="698" r="6" fill="#2a2a2c" stroke="#000" strokeOpacity="0.5" />
                </>
              )}
            </g>

            <g ref={set("head")}>
              <g ref={set("earL")}>
                <ellipse cx="138" cy="380" rx="46" ry="60" fill={skin} />
                <ellipse cx="138" cy="380" rx="46" ry="60" fill={u("shade")} />
                <path d="M150 348 Q118 360 124 392 Q130 416 150 414" fill="none" stroke="#a24c2e" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="136" cy="392" rx="24" ry="22" fill={u("blush")} />
                {isPrachi && (
                  <circle cx="140" cy="406" r="4.5" fill={u("prachiGold")} stroke="#a86d14" strokeWidth="0.8" />
                )}
              </g>
              <g ref={set("earR")}>
                <ellipse cx="462" cy="380" rx="46" ry="60" fill={skin} />
                <ellipse cx="462" cy="380" rx="46" ry="60" fill={u("shade")} />
                <path d="M450 348 Q482 360 476 392 Q470 416 450 414" fill="none" stroke="#a24c2e" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="464" cy="392" rx="24" ry="22" fill={u("blush")} />
                {isPrachi && (
                  <circle cx="460" cy="406" r="4.5" fill={u("prachiGold")} stroke="#a86d14" strokeWidth="0.8" />
                )}
              </g>

              {/* Skull and face */}
              {isPrachi ? (
                <>
                  <path d="M300 148 C398 148 460 216 460 338 C460 450 384 546 300 546 C216 546 140 450 140 338 C140 216 202 148 300 148 Z" fill={skin} />
                  <path d="M300 148 C398 148 460 216 460 338 C460 450 384 546 300 546 C216 546 140 450 140 338 C140 216 202 148 300 148 Z" fill={u("shade")} />
                  <path d="M300 148 C398 148 460 216 460 338 C460 450 384 546 300 546 C216 546 140 450 140 338 C140 216 202 148 300 148 Z" fill={u("hi")} />
                </>
              ) : (
                <>
                  <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={skin} />
                  <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={u("shade")} />
                  <path d="M300 150 C402 150 470 226 470 348 C470 472 396 562 300 562 C204 562 130 472 130 348 C130 226 198 150 300 150 Z" fill={u("hi")} />
                </>
              )}

              {/* Blush */}
              <g ref={set("blush")}>
                {isPrachi ? (
                  <>
                    <ellipse cx="186" cy="418" rx={happy ? 52 : 44} ry={happy ? 32 : 26} fill={u("prachiBlushGlow")} />
                    <ellipse cx="414" cy="418" rx={happy ? 52 : 44} ry={happy ? 32 : 26} fill={u("prachiBlushGlow")} />
                  </>
                ) : (
                  <>
                    <ellipse cx="190" cy="430" rx={happy ? 50 : 44} ry={happy ? 34 : 30} fill={u("blush")} />
                    <ellipse cx="410" cy="430" rx={happy ? 50 : 44} ry={happy ? 34 : 30} fill={u("blush")} />
                  </>
                )}
              </g>

              <g ref={set("face")}>
                {/* Brows */}
                <g ref={set("brows")}>
                  {isPrachi ? (
                    <>
                      <path
                        d={happy ? "M204 290 Q236 270 268 284" : "M204 294 Q236 274 268 287"}
                        fill="none"
                        stroke="#221611"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d={happy ? "M332 284 Q364 270 396 290" : "M332 287 Q364 274 396 294"}
                        fill="none"
                        stroke="#221611"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d={happy ? "M198 292 Q230 270 264 286" : "M198 300 Q230 282 264 294"}
                        fill="none"
                        stroke="#271810"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      <path
                        d={happy ? "M336 286 Q370 270 402 292" : "M336 294 Q370 282 402 300"}
                        fill="none"
                        stroke="#271810"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </g>

                {/* Eyes */}
                <g ref={set("eyes")}>
                  {isPrachi ? (
                    happy ? (
                      <>
                        {/* Beautiful smiling crescent eyes with winged flutter lashes */}
                        <path d="M212 352 Q238 322 268 348" fill="none" stroke="#100a08" strokeWidth="8" strokeLinecap="round" />
                        <path d="M266 348 L276 342 M262 342 L274 334" stroke="#100a08" strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M332 348 Q362 322 388 352" fill="none" stroke="#100a08" strokeWidth="8" strokeLinecap="round" />
                        <path d="M334 348 L324 342 M338 342 L326 334" stroke="#100a08" strokeWidth="3.5" strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        {/* Eyeball & deep warm espresso iris */}
                        <ellipse cx="240" cy="350" rx="26" ry="30" fill={u("prachiEye")} />
                        <ellipse cx="360" cy="350" rx="26" ry="30" fill={u("prachiEye")} />

                        {/* Iris subtle amber ring */}
                        <ellipse cx="240" cy="354" rx="20" ry="17" fill="none" stroke="#8c502b" strokeWidth="2.2" opacity="0.6" />
                        <ellipse cx="360" cy="354" rx="20" ry="17" fill="none" stroke="#8c502b" strokeWidth="2.2" opacity="0.6" />

                        {/* Pupil */}
                        <circle cx="240" cy="350" r="14" fill="#080402" />
                        <circle cx="360" cy="350" r="14" fill="#080402" />

                        {/* Crisp anime catchlights */}
                        <circle cx="230" cy="336" r="7.8" fill="#ffffff" />
                        <circle cx="249" cy="358" r="3.6" fill="#ffffff" opacity="0.9" />
                        <circle cx="231" cy="356" r="2" fill="#ffffff" opacity="0.6" />

                        <circle cx="350" cy="336" r="7.8" fill="#ffffff" />
                        <circle cx="369" cy="358" r="3.6" fill="#ffffff" opacity="0.9" />
                        <circle cx="351" cy="356" r="2" fill="#ffffff" opacity="0.6" />

                        {/* Winged upper eyeliner & lash ticks */}
                        <path d="M214 346 Q240 326 268 342" fill="none" stroke="#100a08" strokeWidth="6.5" strokeLinecap="round" />
                        <line x1="214" y1="346" x2="204" y2="338" stroke="#100a08" strokeWidth="4.5" strokeLinecap="round" />
                        <line x1="210" y1="342" x2="200" y2="332" stroke="#100a08" strokeWidth="3.2" strokeLinecap="round" />

                        <path d="M332 342 Q360 326 386 346" fill="none" stroke="#100a08" strokeWidth="6.5" strokeLinecap="round" />
                        <line x1="386" y1="346" x2="396" y2="338" stroke="#100a08" strokeWidth="4.5" strokeLinecap="round" />
                        <line x1="390" y1="342" x2="400" y2="332" stroke="#100a08" strokeWidth="3.2" strokeLinecap="round" />
                      </>
                    )
                  ) : happy ? (
                    <>
                      <path d="M214 356 Q240 324 266 356" fill="none" stroke="#111" strokeWidth="13" strokeLinecap="round" />
                      <path d="M334 356 Q360 324 386 356" fill="none" stroke="#111" strokeWidth="13" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="240" cy="350" rx={24} ry="31" fill={u("eye")} />
                      <circle cx="231" cy="336" r="8.5" fill="#fff" />
                      <circle cx="250" cy="361" r="3.5" fill="#fff" opacity="0.8" />
                      <ellipse cx="360" cy="350" rx={24} ry="31" fill={u("eye")} />
                      <circle cx="351" cy="336" r="8.5" fill="#fff" />
                      <circle cx="370" cy="361" r="3.5" fill="#fff" opacity="0.8" />
                    </>
                  )}
                </g>

                {/* Yash Sehgal's Glasses */}
                {isYash && (
                  <g ref={set("glasses")}>
                    <rect x="184" y="312" width="106" height="74" rx="20" fill="none" stroke="#222020" strokeWidth="7" />
                    <rect x="186" y="314" width="102" height="70" rx="18" fill="#ffffff" fillOpacity="0.08" />
                    <rect x="310" y="312" width="106" height="74" rx="20" fill="none" stroke="#222020" strokeWidth="7" />
                    <rect x="312" y="314" width="102" height="70" rx="18" fill="#ffffff" fillOpacity="0.08" />
                    <path d="M290 342 Q300 336 310 342" fill="none" stroke="#222020" strokeWidth="6" strokeLinecap="round" />
                    <line x1="184" y1="340" x2="148" y2="348" stroke="#222020" strokeWidth="5" strokeLinecap="round" />
                    <line x1="416" y1="340" x2="452" y2="348" stroke="#222020" strokeWidth="5" strokeLinecap="round" />
                    <path d="M200 330 L220 370" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                    <path d="M326 330 L346 370" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                  </g>
                )}

                {/* Prachi's gentle beauty mark */}
                {isPrachi && (
                  <circle cx="395" cy="405" r="2.5" fill="#5c3826" />
                )}

                {/* Yash's neat mustache & chin beard shadow */}
                {isYash && (
                  <g opacity="0.45">
                    <path d="M260 435 Q300 428 340 435 Q325 446 300 448 Q275 446 260 435 Z" fill="#2d1d15" />
                    <path d="M272 538 Q300 554 328 538 Q300 562 272 538 Z" fill="#2d1d15" opacity="0.6" />
                  </g>
                )}

                {/* Mouth / Lips */}
                {isPrachi ? (
                  <g transform={happy ? "translate(300 440) scale(1.04 1.08) translate(-300 -440)" : undefined}>
                    {happy ? (
                      <g>
                        {/* Joyful radiant smile */}
                        <path d="M236 448 Q300 442 364 448 Q360 496 300 502 Q240 496 236 448 Z" fill="#66141c" />
                        <path d="M244 450 Q300 446 356 450 L354 466 Q300 472 246 466 Z" fill="#ffffff" />
                        <ellipse cx="300" cy="494" rx="28" ry="14" fill="#e87080" />
                        <path d="M232 448 Q264 440 300 443 Q336 440 368 448 Q300 452 232 448 Z" fill={u("prachiLip")} />
                        <path d="M234 448 Q230 454 236 458 M366 448 Q370 454 364 458" stroke="#a83244" strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    ) : (
                      <g>
                        {/* Upper lip with delicate cupid's bow */}
                        <path
                          d="M246 452 Q272 444 300 448 Q328 444 354 452 Q330 458 300 458 Q270 458 246 452 Z"
                          fill={u("prachiLip")}
                        />
                        {/* Lower lip with soft plump contour */}
                        <path
                          d="M248 454 Q300 482 352 454 Q326 476 300 476 Q274 476 248 454 Z"
                          fill={u("prachiLip")}
                        />
                        {/* Lip seam with gentle smile curve */}
                        <path
                          d="M238 450 Q268 456 300 454 Q332 456 362 450"
                          fill="none"
                          stroke="#8e1e2d"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />
                        {/* Soft glossy highlights */}
                        <ellipse cx="300" cy="466" rx="16" ry="4.5" fill="#ffffff" opacity="0.65" />
                        {/* Cute dimple accents */}
                        <path d="M235 448 Q232 452 236 456" fill="none" stroke="#b34b5c" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        <path d="M365 448 Q368 452 364 456" fill="none" stroke="#b34b5c" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                      </g>
                    )}
                  </g>
                ) : (
                  <g transform={happy ? "translate(300 440) scale(1.06 1.12) translate(-300 -440)" : undefined}>
                    <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" fill="#3d0f0f" />
                    <g clipPath={u("mouth")}>
                      <ellipse cx="300" cy="530" rx="46" ry="22" fill="#d9575a" />
                      <path d="M210 436 Q300 456 390 436 L390 474 Q300 490 210 474 Z" fill="#fff" />
                      <path d="M236 516 Q300 500 364 516 L364 540 L236 540 Z" fill="#f3efe9" />
                      <path d="M262 452 V484 M300 456 V488 M338 452 V484" stroke="#000" strokeOpacity="0.08" strokeWidth="2" />
                    </g>
                    <path d="M218 440 Q300 458 382 440 Q376 524 300 530 Q224 524 218 440 Z" fill="none" stroke="#8a3524" strokeOpacity="0.45" strokeWidth="3" />
                    <path d="M208 432 Q212 442 220 446 M392 432 Q388 442 380 446" fill="none" stroke="#a24c2e" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
                  </g>
                )}

                {/* Nose */}
                <g ref={set("nose")}>
                  {isPrachi ? (
                    <>
                      <ellipse cx="300" cy="406" rx="14" ry="7" fill="#a84d32" opacity="0.22" />
                      <ellipse cx="300" cy="396" rx="14" ry="11" fill={skin} />
                      <ellipse cx="300" cy="396" rx="14" ry="11" fill={u("nose")} />
                      <ellipse cx="296" cy="391" rx="5" ry="4" fill="#ffffff" opacity="0.5" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="300" cy="414" rx="28" ry="12" fill="#6b2a14" opacity="0.14" />
                      <ellipse cx="300" cy="398" rx="29" ry="26" fill={skin} />
                      <ellipse cx="300" cy="398" rx="29" ry="26" fill={u("nose")} />
                      <ellipse cx="291" cy="387" rx="10" ry="8" fill="#fff" opacity="0.45" />
                    </>
                  )}
                </g>
              </g>

              {/* Yash's Short Textured Hair */}
              {isYash && (
                <g ref={set("hair")}>
                  <path
                    d="M136 305 C120 180 180 80 300 80 C420 80 480 180 464 305 C450 260 410 230 350 226 C310 224 280 230 250 226 C190 220 150 260 136 305 Z"
                    fill="#18181a"
                  />
                  <path
                    d="M145 280 C170 210 230 190 300 190 C370 190 430 210 455 280 C420 220 370 196 300 196 C230 196 180 220 145 280 Z"
                    fill="#262629"
                  />
                  <path d="M140 300 L146 360 L160 330 Z" fill="#18181a" />
                  <path d="M460 300 L454 360 L440 330 Z" fill="#18181a" />
                </g>
              )}

              {/* Prachi's Long Cascading Hair (Balanced natural hairline, flowing locks on both sides) */}
              {isPrachi && (
                <g ref={set("hair")}>
                  {/* Full crown & scalp volume with natural-proportioned hairline (compact feminine forehead) */}
                  <path
                    d="M300 74 C412 74 468 135 466 240 C464 285 452 330 442 355 C422 300 384 252 344 232 C324 224 310 226 300 228 C290 226 276 224 256 232 C216 252 178 300 158 355 C148 330 136 285 134 240 C132 135 188 74 300 74 Z"
                    fill={u("prachiHairSilk")}
                  />

                  {/* Clean natural center parting */}
                  <line x1="300" y1="76" x2="300" y2="228" stroke="#f0ceb7" strokeWidth="1.6" opacity="0.5" />
                  <line x1="300" y1="76" x2="300" y2="228" stroke="#161214" strokeWidth="1.1" opacity="0.85" />

                  {/* Soft hairline depth & subtle edge shadow */}
                  <path
                    d="M245 238 Q272 228 300 228 Q328 228 355 238"
                    fill="none"
                    stroke="#1c1410"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                  {/* Subtle delicate baby wisps at hairline (stays well above brows at y=270) */}
                  <path d="M298 228 Q286 238 274 246" fill="none" stroke="#251c19" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                  <path d="M302 228 Q314 238 326 246" fill="none" stroke="#251c19" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                  <path d="M276 238 Q260 250 244 260" fill="none" stroke="#2d221e" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
                  <path d="M324 238 Q340 250 356 260" fill="none" stroke="#2d221e" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />

                  {/* Left front cascading lock — falls past shoulder over front collarbone */}
                  <path
                    d="M144 350 C130 425 122 515 124 610 C126 665 130 725 136 725 L196 725 C190 660 186 585 182 515 C178 445 178 390 172 348 C162 325 148 332 144 350 Z"
                    fill={u("prachiHairSilk")}
                  />
                  {/* Left lock highlight waves */}
                  <path d="M140 380 C134 470 136 570 146 670" fill="none" stroke="#3d3544" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  <path d="M160 420 C154 510 158 610 170 705" fill="none" stroke="#4d4456" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

                  {/* Right front cascading lock — restored flowing lock past shoulder */}
                  <path
                    d="M456 350 C470 425 478 515 476 610 C474 665 470 725 464 725 L404 725 C410 660 414 585 418 515 C422 445 422 390 428 348 C438 325 452 332 456 350 Z"
                    fill={u("prachiHairSilk")}
                  />
                  {/* Right lock highlight waves */}
                  <path d="M460 380 C466 470 464 570 454 670" fill="none" stroke="#3d3544" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  <path d="M440 420 C446 510 442 610 430 705" fill="none" stroke="#4d4456" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

                  {/* Crown volume shine arches */}
                  <path d="M174 135 Q236 94 292 114" fill="none" stroke="#443c4c" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
                  <path d="M308 114 Q364 94 426 135" fill="none" stroke="#443c4c" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
                  <path d="M192 150 Q242 118 292 132" fill="none" stroke="#322b38" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M308 132 Q358 118 408 150" fill="none" stroke="#322b38" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                </g>
              )}

              {/* Default beanie for generic preset */}
              {!isYash && !isPrachi && (
                <g ref={set("beanie")}>
                  <g transform="translate(0 -22)">
                    <g filter={u("fuzz")}>
                      <path d="M126 300 C112 168 196 88 300 88 C404 88 488 168 474 300 Z" fill={beanie} />
                      <path d="M126 300 C112 168 196 88 300 88 C404 88 488 168 474 300 Z" fill={u("knit")} />
                      <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" fill={beanie} />
                      <g clipPath={u("cuff")} stroke="#fff" strokeOpacity="0.08" strokeWidth="5">
                        {Array.from({ length: 34 }, (_, i) => (
                          <line key={i} x1={112 + i * 11.4} y1="220" x2={112 + i * 11.4} y2="330" />
                        ))}
                      </g>
                      <path d="M114 262 Q300 222 486 262 L490 322 Q300 286 110 322 Z" fill="#000" opacity="0.18" />
                      <path d="M112 292 Q300 254 488 292" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="3" />
                    </g>
                    <g ref={set("tag")}>
                      <g className="mph-tagwig">
                        <g transform="rotate(-7 190 272)">
                          <rect x="172" y="238" width="36" height="64" rx="5" fill={tag} />
                          <rect x="172" y="238" width="36" height="64" rx="5" fill={u("cloth")} />
                          <rect x="177" y="243" width="26" height="54" rx="3" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="3 3" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              )}
            </g>
          </svg>
          <span className="mph-bubble" data-on={happy ? "true" : "false"} aria-live="polite">
            {greeting}
          </span>
        </button>
      </div>
    </div>
  )
}
