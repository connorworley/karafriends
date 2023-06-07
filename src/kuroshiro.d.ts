declare interface KuroshiroUtil {
  isHiragana: (ch: string) => boolean;
  isKatakana: (ch: string) => boolean;
  isKana: (ch: string) => boolean;
  isKanji: (ch: string) => boolean;
  isJapanese: (ch: string) => boolean;
  hasHiragana: (str: string) => boolean;
  hasKatakana: (str: string) => boolean;
  hasKana: (str: string) => boolean;
  hasKanji: (str: string) => boolean;
  hasJapanese: (str: string) => boolean;
  kanaToHiragana: (str: string) => string;
  kanaToKatakana: (str: string) => string;
  kanaToRomaji: (
    str: string,
    system: "nippon" | "passport" | "hepburn"
  ) => string;
}

declare class KuroshiroClass {
  constructor();
  init(_analyzer: any): Promise<void>;
  _analyzer: any;
  convert(
    str: string,
    options?: {
      to?: string;
      mode?: string;
      romajiSystem?: string;
      delimiter_start?: string;
      delimiter_end?: string;
    }
  ): Promise<string>;
  static Util: KuroshiroUtil;
}

declare module "kuroshiro" {
  export = KuroshiroClass;
}
