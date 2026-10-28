import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

// ─── PeelCornerReveal ─────────────────────────────────────────────────────────
// 2D SVG peel: a portrait card whose BR corner folds along diagonal A–B,
// flipping a green triangular flap out past the card. The card inverts between
// light and dark modes — in dark mode it's a white card on a near-black page;
// in light mode the card itself is dark on a warm off-white page.

// Peel flap — Better Beer orange
const PEEL_FILL = '#f57e3f'
const PEEL_FILL_DEEP = '#c95e28'

// Geometry (all in SVG units)
const VB_W = 500
const VB_H = 620
const CARD_W = 320
const CARD_H = 440
const CARD_X = 90 // top-left x of the card within the viewBox
const CARD_Y = 70 // top-left y of the card within the viewBox
const CARD_RADIUS = 16 // corner radius for TL, TR, BL (BR is carved by the peel)

// Card corner coordinates (derived)
const TL = { x: CARD_X, y: CARD_Y }
const TR = { x: CARD_X + CARD_W, y: CARD_Y }
const BR = { x: CARD_X + CARD_W, y: CARD_Y + CARD_H }
const BL = { x: CARD_X, y: CARD_Y + CARD_H }

// Peel progress endpoints (percent of card dimension)
const REST_W_PCT = 0.22
const REST_H_PCT = 0.18
const OPEN_W_PCT = 0.78
const OPEN_H_PCT = 0.9

// Idle ambient bob — subtle vertical breathing on the card at rest.
const BOB_AMPLITUDE = 2.4

// Card appearance — warm beige card with navy ink (Better Beer palette)
const CARD_FILL = '#efe6dc'
const CARD_INK = '#001f2d'
const FOLD_STROKE = 'rgba(0,31,45,0.28)'
const DIVIDER_STROKE = '#001f2d'
const DROP_SHADOW = '4px 4px 24px rgba(0,31,45,0.35)'

export default function PeelCornerReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const qrGroupRef = useRef<SVGGElement>(null)

  // Single progress 0..1 drives everything, smoothed by a spring.
  // Hover teases the peel open to ~0.18 (a small peek); tap locks fully open.
  const target = useMotionValue(0)
  useEffect(() => {
    target.set(isOpen ? 1 : isHovered ? 0.18 : 0)
  }, [isOpen, isHovered, target])
  const progress = useSpring(target, { stiffness: 170, damping: 22, mass: 0.9 })

  // w, h — the fold offsets on the bottom and right edges of the card
  const w = useTransform(
    progress,
    [0, 1],
    [REST_W_PCT * CARD_W, OPEN_W_PCT * CARD_W],
  )
  const h = useTransform(
    progress,
    [0, 1],
    [REST_H_PCT * CARD_H, OPEN_H_PCT * CARD_H],
  )

  // Fold endpoints A (on bottom edge) and B (on right edge)
  const Ax = useTransform(w, (v) => BR.x - v)
  const Ay = useMotionValue(BR.y)
  const Bx = useMotionValue(BR.x)
  const By = useTransform(h, (v) => BR.y - v)

  // C = reflection of BR across line A–B
  // Formula for reflecting point P across line through A with direction d (unit):
  //   P' = 2*(A + ((P-A)·d)*d) - P
  // but simpler: reflect P across line A-B = A + B - P + 2*((P-A)·n)*n where n is
  // perpendicular. We compute directly via the reflection matrix around an
  // arbitrary line. For a single point P=BR we derive Cx, Cy from w and h:
  //
  // Let AB = (w, -h) going from A to B in local coordinates where A=(BR.x-w, BR.y)
  // and B=(BR.x, BR.y-h). So AB = (w, -h). |AB|² = w² + h².
  //
  // The reflection of BR across line A-B is:
  //   BR' = A + B - BR + 2 * ((BR - A) · n̂) * n̂   (not quite — let's just use matrix)
  //
  // Cleaner: the midpoint of BR and its reflection lies on line A-B, and the
  // vector from BR to its reflection is perpendicular to AB. Using the formula
  // for reflection of point P across line through two points A and B:
  //
  //   t = ((P.x - A.x)*(B.x - A.x) + (P.y - A.y)*(B.y - A.y)) / |AB|²
  //   foot = A + t*(B - A)    // projection of P onto line A-B
  //   P' = 2*foot - P
  const Cx = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dx = BR.x - ax
    const dy = by - BR.y
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return BR.x
    // P=BR, A=(ax,BR.y). (P-A)·(B-A) = dx*dx since P-A = (dx, 0)
    const t = (dx * dx) / len2
    const footX = ax + t * dx
    return 2 * footX - BR.x
  })
  const Cy = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dx = BR.x - ax
    const dy = by - BR.y
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return BR.y
    const t = (dx * dx) / len2
    const footY = BR.y + t * dy
    return 2 * footY - BR.y
  })

  // Angle of line A–B in degrees (used for the reveal text rotation)
  const angle = useTransform<number, number>([Ax, By], ([ax, by]) => {
    const dy = by - BR.y // B.y - A.y  (A.y = BR.y)
    const dx = BR.x - ax // B.x - A.x  (B.x = BR.x)
    return (Math.atan2(dy, dx) * 180) / Math.PI
  })

  // Rounded card path: same shape as cardPoints, but TL/TR/BL corners are
  // rounded to CARD_RADIUS. The BR is still carved by the A–B fold and stays
  // straight (no arcs) so the peel math keeps working untouched.
  const cardPath = useMotionTemplate`M ${TL.x + CARD_RADIUS} ${TL.y} L ${TR.x - CARD_RADIUS} ${TR.y} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${TR.x} ${TR.y + CARD_RADIUS} L ${Bx} ${By} L ${Ax} ${Ay} L ${BL.x + CARD_RADIUS} ${BL.y} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${BL.x} ${BL.y - CARD_RADIUS} L ${TL.x} ${TL.y + CARD_RADIUS} A ${CARD_RADIUS} ${CARD_RADIUS} 0 0 1 ${TL.x + CARD_RADIUS} ${TL.y} Z`

  // Peel polygon (the visible orange flap): A → B → C
  const peelPoints = useMotionTemplate`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`

  // Fold line coordinates for the thin highlight
  const foldX1 = Ax
  const foldY1 = Ay
  const foldX2 = Bx
  const foldY2 = By

  // Midpoint of A-B — gradient from here toward C gives a darker band along the fold
  const foldMidX = useTransform<number, number>([Ax, Bx], ([ax, bx]) => (ax + bx) / 2)
  const foldMidY = useTransform<number, number>([Ay, By], ([ay, by]) => (ay + by) / 2)

  // Card idle bob — only when closed (subtle). We gate it by the progress so it
  // fades out as the card opens (keeps the open state feeling locked in).
  const bobRaw = useMotionValue(0)
  useEffect(() => {
    let raf = 0
    let alive = true
    const start = performance.now()
    function tick(now: number) {
      if (!alive) return
      const t = (now - start) / 1000
      bobRaw.set(Math.sin(t * 1.2) * BOB_AMPLITUDE)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [bobRaw])
  const bobGate = useTransform(progress, [0, 0.4], [1, 0])
  const bobY = useTransform<number, number>(
    [bobRaw, bobGate],
    ([b, g]) => b * g,
  )


  function handleToggle() {
    setIsOpen((v) => !v)
  }
  function handleKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((v) => !v)
    }
  }

  // Reveal text fade — opacity ramps in as the peel opens past ~35%.
  const revealOpacity = useTransform(progress, [0.35, 0.75], [0, 1])

  const QR_SIZE = 110
  const QR_ALONG_FRAC = 0.3 // 0 = at A, 1 = at B
  const QR_PERP_FRAC = 0.7 // 0 = on fold line, 1 = at C

  // Anchor is the CENTER of the QR (we'll draw the QR around it).
  // Math: anchor = A + along_frac*(B-A) + perp_frac * (C-BR)/2
  // because (C-BR) spans twice the perpendicular distance from fold to C.
  const QR_OFFSET_X = 54
  const QR_OFFSET_Y = 18
  const qrAnchorX = useTransform<number, number>(
    [Ax, Bx, Cx],
    ([ax, bx, cx]) =>
      ax + QR_ALONG_FRAC * (bx - ax) + (QR_PERP_FRAC / 2) * (cx - BR.x) + QR_OFFSET_X,
  )
  const qrAnchorY = useTransform<number, number>(
    [Ay, By, Cy],
    ([ay, by, cy]) =>
      ay + QR_ALONG_FRAC * (by - ay) + (QR_PERP_FRAC / 2) * (cy - BR.y) + QR_OFFSET_Y,
  )

  // Transform: translate origin to the anchor, then rotate to align with the fold.
  // A QR drawn at (0,0) now sits with its top-left AT that anchor, and its x-axis along the fold.
  const qrAngle = useTransform(angle, (a) => a + 31)
  const qrTransform = useMotionTemplate`translate(${qrAnchorX} ${qrAnchorY}) rotate(${qrAngle})`

  useMotionValueEvent(qrTransform, 'change', (latest) => {
    qrGroupRef.current?.setAttribute('transform', latest)
  })

  useEffect(() => {
    const el = qrGroupRef.current
    if (!el) return
    el.setAttribute('transform', qrTransform.get())
  }, [qrTransform])

  return (
    <div
      ref={containerRef}
      className="fixed top-4 right-4 z-50"
      style={{ background: 'transparent' }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Hide WhatsApp QR code' : 'Show WhatsApp QR code'}
        aria-pressed={isOpen}
        onTap={handleToggle}
        onKeyDown={handleKey}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-[185px] lg:w-[289px] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f57e3f] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-2xl"
        style={{ y: bobY, filter: `drop-shadow(${DROP_SHADOW})` }}
      >

        <motion.svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block h-auto w-full"
          style={{ rotate: 3, transformOrigin: '50% 50%' }}
          aria-hidden
        >
          <defs>
            {/* Peel gradient — slightly darker along the fold, flat green toward C.
                Runs perpendicular to A-B: from midpoint(A,B) to C. */}
            <motion.linearGradient
              id="pcr-peel-gradient"
              gradientUnits="userSpaceOnUse"
              x1={foldMidX}
              y1={foldMidY}
              x2={Cx}
              y2={Cy}
            >
              <stop offset="0%" stopColor={PEEL_FILL_DEEP} />
              <stop offset="22%" stopColor={PEEL_FILL} />
              <stop offset="100%" stopColor={PEEL_FILL} />
            </motion.linearGradient>

            {/* Clip for reveal text — confine to the peel triangle */}
            <clipPath id="pcr-peel-clip">
              <motion.polygon points={peelPoints} />
            </clipPath>

            {/* Clip for the front card — carves off the BR triangle */}
            <clipPath id="pcr-card-clip">
              <motion.path d={cardPath} />
            </clipPath>
          </defs>

          {/* Card body (with BR corner carved off) */}
          <motion.g>
            <motion.path d={cardPath} fill={CARD_FILL} />
          </motion.g>

          {/* Card front content, clipped to the carved card polygon */}
          <g clipPath="url(#pcr-card-clip)">
            {/* WhatsApp glyph — top-left */}
            <g
              transform={`translate(${CARD_X + 18}, ${CARD_Y + 20}) scale(${60 / 720})`}
            >
              <path fill={CARD_INK} d="M360,0C161.18,0,0,161.18,0,360c0,65.41,17.45,126.75,47.94,179.61L0,720l187.02-44.21c51.34,28.18,110.28,44.21,172.98,44.21,198.82,0,360-161.18,360-360S558.82,0,360,0ZM360,655.52c-60.17,0-116.13-17.98-162.82-48.87l-110.49,28.14,30.99-105.61c-33.53-47.93-53.2-106.26-53.2-169.19,0-163.21,132.31-295.52,295.52-295.52s295.52,132.31,295.52,295.52-132.31,295.52-295.52,295.52Z"/>
              <path fill={CARD_INK} d="M444.35,407.52l87.1,41.06c4,1.88,6.56,5.94,6.2,10.34-.94,11.46-5.54,34.43-26.13,55.02-58.12,58.12-162.49-7.64-166.74-10.18-25.67-13.79-50.06-32.24-73.19-55.36-23.12-23.12-41.58-47.52-55.37-73.19-2.55-4.24-68.31-108.61-10.18-166.74,20.59-20.59,43.56-25.19,55.02-26.13,4.41-.36,8.46,2.2,10.34,6.2l41.07,87.1c1.94,4.12,1.09,9.02-2.13,12.24l-30.61,30.61c-6.62,6.62-8.56,16.93-4,25.11,11.17,20.03,26.19,39.32,43.59,57.07,17.75,17.4,37.04,32.43,57.07,43.59,8.18,4.56,18.48,2.62,25.11-4l30.61-30.61c3.22-3.22,8.12-4.08,12.24-2.13Z"/>
            </g>

            {/* Large stacked display — Free / Wi-Fi */}
            <text
              x={CARD_X + 24}
              y={CARD_Y + 190}
              fill={CARD_INK}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={86}
              fontWeight={900}
              letterSpacing={-3}
              style={{ lineHeight: 0.9 }}
            >
              Get
            </text>
            <text
              x={CARD_X + 24}
              y={CARD_Y + 276}
              fill={CARD_INK}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={86}
              fontWeight={900}
              letterSpacing={-3}
              style={{ lineHeight: 0.9 }}
            >
              in
            </text>
            <text
              x={CARD_X + 24}
              y={CARD_Y + 356}
              fill={CARD_INK}
              fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
              fontSize={86}
              fontWeight={900}
              letterSpacing={-3}
              style={{ lineHeight: 0.9 }}
            >
              touch!
            </text>

            {/* Subtle divider below the Wi-Fi title */}
            <line
              x1={CARD_X + 40}
              y1={CARD_Y + 316}
              x2={CARD_X + 140}
              y2={CARD_Y + 316}
              stroke={DIVIDER_STROKE}
              strokeWidth={1}
              opacity={0.15}
            />

          </g>

          {/* Peel triangle (orange flap) */}
          <motion.g>
            <motion.polygon
              points={peelPoints}
              fill="url(#pcr-peel-gradient)"
            />
          </motion.g>

          {/* Thin highlight along the fold — paper thickness cue */}
          <motion.line
            x1={foldX1}
            y1={foldY1}
            x2={foldX2}
            y2={foldY2}
            stroke={FOLD_STROKE}
            strokeWidth={1.1}
            strokeLinecap="round"
          />

          {/* Reveal QR code — scannable Wi-Fi payload rendered inside the peel
              triangle. The local coordinate system is translated to the A-corner
              anchor (inset 20 along the fold and 20 perpendicular toward C) and
              rotated to align with A–B, so the QR's edges are parallel to the
              peel's edges. */}
          <motion.g
            clipPath="url(#pcr-peel-clip)"
            style={{ opacity: revealOpacity }}
          >
            <g ref={qrGroupRef}>
              <foreignObject
                x={-QR_SIZE / 2}
                y={-QR_SIZE / 2}
                width={QR_SIZE}
                height={QR_SIZE}
              >
                <div
                  style={{
                    width: QR_SIZE,
                    height: QR_SIZE,
                    padding: 6,
                    background: '#efe6dc',
                    borderRadius: 12,
                    boxSizing: 'border-box',
                  }}
                >
                  <QRCodeSVG
                    value="https://wa.me/447921173063"
                    size={QR_SIZE - 12}
                    level="M"
                    bgColor="#efe6dc"
                    fgColor="#001f2d"
                    style={{ display: 'block' }}
                  />
                </div>
              </foreignObject>
            </g>
          </motion.g>

        </motion.svg>
      </motion.div>
    </div>
  )
}

