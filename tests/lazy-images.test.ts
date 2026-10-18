import assert from 'node:assert/strict'
import test from 'node:test'
import { rehypeLazyImages } from '../src/plugins/rehype-lazy-images.ts'

function img(properties: Record<string, unknown> = {}) {
  return { type: 'element', tagName: 'img', properties, children: [] }
}

test('content images lazy-load unless they already opt out', () => {
  const tree = {
    type: 'root',
    children: [
      img({ src: '/a.png' }),
      img({ src: '/b.png', loading: 'eager', fetchpriority: 'high' }),
      img({ src: '/c.png', decoding: 'sync' }),
    ],
  }

  rehypeLazyImages()(tree)

  const [plain, eager, sync] = tree.children
  assert.equal(plain.properties.loading, 'lazy')
  assert.equal(plain.properties.decoding, 'async')
  assert.equal(eager.properties.loading, 'eager')
  assert.equal(eager.properties.decoding, 'async')
  assert.equal(sync.properties.loading, 'lazy')
  assert.equal(sync.properties.decoding, 'sync')
})
