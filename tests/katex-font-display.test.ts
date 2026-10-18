import assert from 'node:assert/strict'
import test from 'node:test'
import { swapKatexFontDisplay } from '../src/plugins/katex-font-display.mjs'

test('KaTeX font faces use swap instead of block', () => {
  const css = '@font-face{font-display:block;font-family:KaTeX_Main} @font-face { font-display: block; font-family: KaTeX_Math }'
  const next = swapKatexFontDisplay(css)
  assert.equal(next.includes('font-display:block'), false)
  assert.equal(next.includes('font-display: block'), false)
  assert.match(next, /font-display:swap/)
  assert.match(next, /font-display: swap/)
})
