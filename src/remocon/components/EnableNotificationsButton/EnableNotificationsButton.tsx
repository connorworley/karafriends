import React, { useState } from "react";
import Button from "../Button/Button";
import * as styles from "./EnableNotificationsButton.module.scss";

const EnableNotificationsButton = () => {
  if (typeof Notification === undefined) {
    return <></>;
  }

  const [permission, setPermission] = useState(Notification.permission);

  return permission === "default" ? (
    <div className={styles.enableNotificationsButtonContainer}>
      <Button
        onClick={async () =>
          setPermission(await Notification.requestPermission())
        }
      >
        Enable push notifications
      </Button>
    </div>
  ) : (
    <></>
  );
};

export default EnableNotificationsButton;
