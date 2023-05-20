import React, { Suspense } from "react";
// tslint:disable-next-line:no-submodule-imports
import { BiLoaderAlt } from "react-icons/bi";

import * as styles from "./Loader.module.scss";

const Loader = () => (
  <div className={styles.loader}>
    <BiLoaderAlt />
  </div>
);

export const withLoader = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) =>
  class WithLoader extends React.Component<P> {
    render() {
      return (
        <Suspense fallback={<Loader />}>
          <WrappedComponent {...(this.props as P)} />
        </Suspense>
      );
    }
  };

export default Loader;
