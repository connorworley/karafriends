declare module "kuroshiro-analyzer-kuromoji" {
  interface AnalyzerResultVerbose {
    word_id: number;
    word_type: string;
    word_position: number;
  }

  export interface AnalyzerResult {
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading: string;
    pronunciation: string;
    verbose: AnalyzerResultVerbose;
  }

  export default class Analyzer {
    constructor(obj: { dictPath?: string });
    init(): Promise<void>;
    parse(str: string): Promise<AnalyzerResult[]>;
  }
}
