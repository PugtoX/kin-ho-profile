// 从 Lighthouse 报告里提取本次关注的指标（一次性）
import { readFileSync } from 'node:fs'

const p = String.raw`E:\AI\AI_Agent\workplace\portfolio\docs\lighthouse\mobile.json`
const r = JSON.parse(readFileSync(p, 'utf8'))

console.log('=== 类别分数 ===')
for (const [key, cat] of Object.entries(r.categories)) {
  const score = cat.score === null ? 'n/a' : Math.round(cat.score * 100)
  console.log(`  ${key.padEnd(16)} ${score}`)
}

console.log('\n=== 关键指标 ===')
const wanted = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
  'server-response-time',
  'total-byte-weight',
]
for (const id of wanted) {
  const a = r.audits[id]
  if (a) console.log(`  ${id.padEnd(28)} ${a.displayValue ?? a.numericValue}`)
}

console.log('\n=== 未通过的审计（score < 1 且有影响）===')
const failed = Object.values(r.audits)
  .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable')
  .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
  .slice(0, 12)
for (const a of failed) {
  console.log(`  [${String(a.score).padEnd(5)}] ${a.id.padEnd(32)} ${a.title}`)
}

console.log('\n=== 采集环境 ===')
console.log('  formFactor      :', r.configSettings.formFactor)
console.log('  throttling      :', r.configSettings.throttlingMethod)
console.log('  lighthouseVer   :', r.lighthouseVersion)
console.log('  fetchTime       :', r.fetchTime)
console.log('  finalUrl        :', r.finalDisplayedUrl)
