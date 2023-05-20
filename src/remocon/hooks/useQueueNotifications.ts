import { useEffect } from "react";

import formatDuration from "format-duration";
import useQueue from "../../common/hooks/useQueue";

async function registerServiceWorker() {
  return navigator.serviceWorker.register(
    new URL("../notificationServiceWorker.ts", import.meta.url),
    { scope: "/" }
  );
}

async function showNotification(
  ...args: ConstructorParameters<typeof Notification>
) {
  if ("servierWorker" in navigator) {
    const registration = await registerServiceWorker();
    return registration.showNotification(...args);
  } else {
    new Notification(...args); // tslint:disable-line:no-unused-expression
  }
}

export default function useQueueNotifications(myDeviceId: string) {
  const queue = useQueue();

  // Preemptively register the service worker
  if ("serviceWorker" in navigator) registerServiceWorker();

  useEffect(() => {
    for (const [item, eta] of queue) {
      if (
        item.userIdentity &&
        item.userIdentity.deviceId === myDeviceId &&
        eta <= 10 * 60
      ) {
        showNotification("karafriends", {
          body: `Your song ${
            item.name
          } is coming up soon! Estimated wait: T-${formatDuration(eta * 1000)}`,
        });
      }
    }
  }, [queue]);
}
