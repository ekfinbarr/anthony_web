/// <reference types="vite/client" />

// Optional third-party analytics loaded by tag snippets (absent unless configured).
declare function gtag(...args: unknown[]): void;
declare function fbq(...args: unknown[]): void;

// Vite's built-in asset declarations are lowercase; some uploaded audio uses upper-case extensions.
declare module "*.MP3" {
  const src: string;
  export default src;
}
