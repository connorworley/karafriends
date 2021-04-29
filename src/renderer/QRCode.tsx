import React, { useEffect, useRef } from "react";
import { graphql, QueryRenderer } from "react-relay";

import environment from "../common/graphqlEnvironment";
import { QRCodeQuery } from "./__generated__/QRCodeQuery.graphql";

function QRCode() {
  return (
    <QueryRenderer<QRCodeQuery>
      environment={environment}
      query={graphql`
        query QRCodeQuery {
          wanIpQrCode
        }
      `}
      variables={{}}
      render={({ error, props }) => {
        if (!props) {
          return <div>Loading...</div>;
        }
        return (
          <div>
            <img src={props.wanIpQrCode} />
          </div>
        );
      }}
    />
  );
}

export default QRCode;
