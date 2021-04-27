import React, { Suspense } from "react";

const Loader = () => (
  <div className="row section">
    <div className="col s12 center-align">
      <div className="preloader-wrapper big active">
        <div className="spinner-layer spinner-red-only">
          <div className="circle-clipper left">
            <div className="circle"></div>
          </div>
          <div className="gap-patch">
            <div className="circle"></div>
          </div>
          <div className="circle-clipper right">
            <div className="circle"></div>
          </div>
        </div>
      </div>
    </div>
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
