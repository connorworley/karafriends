import classnames from "classnames";
import React from "react";

import styles from "./Button.module.scss";

const Button = ({
  className,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={classnames(
      styles.button,
      { [styles.disabled]: disabled },
      className
    )}
    disabled={disabled}
    {...rest}
  />
);

export default Button;
