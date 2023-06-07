declare interface AnalyzerResultVerbose {
  word_id: number;
  word_type: string;
  word_position: number;
}

declare interface AnalyzerResult {
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

declare class Analyzer {
  constructor(obj: { dictPath?: string });
  init(): Promise<void>;
  parse(str: string): Promise<AnalyzerResult[]>;
}

declare module "kuroshiro-analyzer-kuromoji" {
  export = Analyzer;
}
