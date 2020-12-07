import React, { useEffect, useRef } from "react";
import * as libqrcode from "qrcode";

import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { graphql, QueryRenderer } from "react-relay";
import { QRCodeQuery } from "./__generated__/QRCodeQuery.graphql";

function fetchQuery(operation: any, variables: any) {
  return fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then((response) => {
    return response.json();
  });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

function QRCode() {
  return (
    <div>
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
          return <div>{props.wanIpAddress as string}</div>;
        }}
      />
    </div>
  );
}

export default QRCode;
