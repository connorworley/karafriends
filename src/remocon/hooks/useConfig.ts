import { useEffect, useState } from "react";
import { fetchQuery, graphql, requestSubscription } from "react-relay";

import { KarafriendsConfig } from "../../common/config";
import environment from "../../common/graphqlEnvironment";
import {
  useConfigQuery,
  useConfigQuery$data,
} from "./__generated__/useConfigQuery.graphql";

const configQuery = graphql`
  query useConfigQuery {
    config {
      adminNicks
      adminDeviceIds
      supervisedMode
    }
  }
`;

type ConfigType = useConfigQuery["response"]["config"];

export default function useConfig() {
  const [config, setConfig] = useState<ConfigType | undefined>(undefined);

  useEffect(() => {
    const initialQuery = fetchQuery<useConfigQuery>(
      environment,
      configQuery,
      {}
    ).subscribe({
      next: (response: useConfigQuery$data) => setConfig(response.config),
    });

    return () => {
      initialQuery.unsubscribe();
    };
  }, []);

  return config;
}
