import assert from 'node:assert/strict'
import test from 'node:test'
import { rehypeTaskListLabels } from '../src/plugins/rehype-task-list-labels.ts'

function item(children) {
  return {
    type: 'element',
    tagName: 'li',
    properties: { className: ['task-list-item'] },
    children,
  }
}

function checkbox(checked = false) {
  return {
    type: 'element',
    tagName: 'input',
    properties: { type: 'checkbox', disabled: true, ...(checked ? { checked: true } : {}) },
    children: [],
  }
}

test('task checkboxes are labelled by their own text and not by nested items', () => {
  const nested = item([checkbox(true), { type: 'text', value: ' 子项' }])
  const tree = {
    type: 'root',
    children: [
      item([
        checkbox(false),
        { type: 'text', value: ' ' },
        { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: 'Cmd' }] },
        { type: 'text', value: ' 开发' },
        { type: 'element', tagName: 'ul', properties: { className: ['contains-task-list'] }, children: [nested] },
      ]),
    ],
  }

  rehypeTaskListLabels()(tree)

  const label = tree.children[0].children[0]
  assert.equal(label.tagName, 'label')
  assert.equal(label.children[0].tagName, 'input')
  assert.equal(tree.children[0].children[1].tagName, 'ul')
  assert.equal(nested.children[0].tagName, 'label')
  assert.equal(nested.children[0].children[1].value, ' 子项')
})

test('a checkbox with no item text gets an accessible name', () => {
  const tree = { type: 'root', children: [item([checkbox(false), { type: 'text', value: '   ' }])] }
  rehypeTaskListLabels()(tree)
  assert.equal(tree.children[0].children[0].properties.ariaLabel, '待办事项')
  assert.equal(tree.children[0].children[0].tagName, 'input')
})
