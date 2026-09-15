import { useEffect, useRef } from 'react'

const LINK_DISTANCE = 150
const POINTER_RADIUS = 130
// Pixels of displacement per frame at the pointer centre. Tuned by measurement:
// 0.9 was imperceptible (~0.3px/frame across the radius), 60 ejected dots
// off-screen. 3.2 stays visibly reactive without tearing the lattice apart.
const POINTER_PUSH = 3.2
const MAX_DPR = 2

// Decorative backdrop: drifting dots joined by faint links.
// Everything the browser can do in CSS (the fog) stays in index.css.
function ParticleField({ theme }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || !canvas) return

    let width = 0
    let height = 0
    let dots = []
    let color = ''
    let frame = 0
    const pointer = { x: -1e6, y: -1e6, active: false }

    const onMove = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
      pointer.x = -1e6
      pointer.y = -1e6
    }

    function spawn() {
      const count = Math.min(60, Math.round((width * height) / 26000))
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }))
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // Re-read the themed colour here, never per frame.
      const styles = getComputedStyle(document.documentElement)
      color =
        document.documentElement.dataset.theme === 'dark'
          ? styles.getPropertyValue('--accent').trim()
          : styles.getPropertyValue('--fg').trim()
      spawn()
    }

    function step(dot, dx, dy, distance) {
      if (pointer.active && distance < POINTER_RADIUS) {
        const push = ((POINTER_RADIUS - distance) / POINTER_RADIUS) * POINTER_PUSH
        dot.x += (dx / (distance || 1)) * push
        dot.y += (dy / (distance || 1)) * push
      }
      dot.x += dot.vx
      dot.y += dot.vy
      if (dot.x < 0 || dot.x > width) dot.vx *= -1
      if (dot.y < 0 || dot.y > height) dot.vy *= -1
      dot.x = Math.max(0, Math.min(width, dot.x))
      dot.y = Math.max(0, Math.min(height, dot.y))
    }

    function draw() {
      // Repaint at CSS pixel scale whatever the device ratio is.
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(canvas.width / width, canvas.height / height)

      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const distance = Math.hypot(dx, dy)
          if (distance < LINK_DISTANCE) {
            ctx.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.24
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 0.7
      for (const dot of dots) {
        ctx.fillRect(dot.x - 1.2, dot.y - 1.2, 2.4, 2.4)
      }
      ctx.globalAlpha = 1
    }

    function tick() {
      for (const dot of dots) {
        const dx = dot.x - pointer.x
        const dy = dot.y - pointer.y
        step(dot, dx, dy, Math.hypot(dx, dy))
      }
      draw()
      frame = requestAnimationFrame(tick)
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    function onVisibility() {
      stop()
      if (!document.hidden) frame = requestAnimationFrame(tick)
    }

    function onResize() {
      resize()
      ctx.fillStyle = color
      ctx.strokeStyle = color
    }

    onResize()

    // Reduced motion: leave one static frame and never start the loop.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw()
      return () => {}
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(tick)

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-2 h-full w-full"
    />
  )
}

export default ParticleField
