import ParticleField from './ParticleField.jsx'

// Stacking order inside this isolated wrapper:
//   0 grid (CSS, .page-backdrop)
//   1 fog (blurred drifting blobs, no JS)
//   2 particle canvas
//   3 bottom vignette
function Background({ theme }) {
  return (
    <div
      aria-hidden="true"
      className="page-backdrop pointer-events-none fixed inset-0 isolate overflow-hidden"
    >
      <div className="fog absolute inset-0" />
      <ParticleField theme={theme} />
      <div className="backdrop-vignette absolute inset-0" />
    </div>
  )
}

export default Background
