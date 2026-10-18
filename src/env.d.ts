/// <reference path="../.astro/types.d.ts" />

declare module '*.css?inline' {
  const css: string
  export default css
}