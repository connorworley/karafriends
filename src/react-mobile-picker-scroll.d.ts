declare module "react-mobile-picker-scroll" {
  import { FunctionComponent } from "react";

  interface Props {
    optionGroups: { [key: string]: string[] };
    valueGroups: { [key: string]: string };
    onChange: (_: string, line: string) => void;
  }

  const Picker: FunctionComponent<Props>;

  export default Picker;
}
