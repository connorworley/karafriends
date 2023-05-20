import classnames from "classnames";
import React from "react";

import * as styles from "./Button.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  full?: boolean;
}

const Button = ({ className, disabled, full, ...rest }: Props) => (
  <button
    className={classnames(
      styles.button,
      {
        [styles.disabled]: disabled,
        [styles.full]: full,
      },
      className
    )}
    disabled={disabled}
    {...rest}
  />
);

export default Button;
