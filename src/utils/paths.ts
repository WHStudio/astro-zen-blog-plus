export function postHref(id: string): string {
  const encoded = id
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/blog/${encoded}`;
}
