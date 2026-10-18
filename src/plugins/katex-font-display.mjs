export function swapKatexFontDisplay(css) {
  return css
    .replaceAll('font-display:block', 'font-display:swap')
    .replaceAll('font-display: block', 'font-display: swap')
}

export function katexFontDisplaySwap() {
  return {
    name: 'katex-font-display-swap',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0]
      if (!file.endsWith('katex.min.css') && !file.endsWith('katex.css')) return
      if (!code.includes('font-display')) return
      const next = swapKatexFontDisplay(code)
      if (next === code) return
      return next
    },
    generateBundle(_options, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type !== 'asset' || typeof item.source !== 'string') continue
        if (!item.source.includes('KaTeX') || !item.source.includes('font-display')) continue
        item.source = swapKatexFontDisplay(item.source)
      }
    },
  }
}
