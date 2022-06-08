import classnames from "classnames";
import React from "react";

import styles from "./Button.module.scss";

const Button = ({
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={classnames(styles.button, className)} {...rest} />
);

export default Button;
