import React, { useEffect, useRef } from "react";
import * as libqrcode from "qrcode";
import { graphql, QueryRenderer } from "react-relay";

import environment from "../common/graphqlEnvironment";
import { QRCodeQuery } from "./__generated__/QRCodeQuery.graphql";

function QRCode() {
  return (
    <QueryRenderer<QRCodeQuery>
      environment={environment}
      query={graphql`
        query QRCodeQuery {
          wanIpAddress
        }
      `}
      variables={{}}
      render={({ error, props }) => {
        if (!props) {
          return <div>Loading...</div>;
        }
        return <div>{props.wanIpAddress}</div>;
      }}
    />
  );
}

export default QRCode;
