import { useEffect } from "react";

import formatDuration from "format-duration";
import useQueue from "../../common/hooks/useQueue";

export default function useQueueNotifications(myDeviceId: string) {
  Notification.requestPermission();

  const queue = useQueue();

  useEffect(() => {
    for (const [item, eta] of queue) {
      if (
        item.userIdentity &&
        item.userIdentity.deviceId === myDeviceId &&
        eta <= 10 * 60
      ) {
        new Notification("karafriends", {
          // tslint:disable-line:no-unused-expression
          body: `Your song ${
            item.name
          } is coming up soon! Estimated wait: T-${formatDuration(eta * 1000)}`,
        });
        return;
      }
    }
  }, [queue]);
}
