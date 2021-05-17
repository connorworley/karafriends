declare module "wanakana" {
  export function isRomaji(input: string): boolean;
  export function toKana(input: string): string;
  export function toRomaji(input: string): string;
  export function bind(element: HTMLInputElement | HTMLTextAreaElement): void;
  export function unbind(element: HTMLInputElement | HTMLTextAreaElement): void;
}
