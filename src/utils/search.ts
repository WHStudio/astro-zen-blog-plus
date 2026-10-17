export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightText(text: string, query: string): string {
  if (!query) return escapeHtml(text);

  const matcher = new RegExp(escapeRegExp(query), 'gi');
  let result = '';
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const index = match.index ?? 0;
    result += escapeHtml(text.slice(lastIndex, index));
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800">${escapeHtml(match[0])}</mark>`;
    lastIndex = index + match[0].length;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}
