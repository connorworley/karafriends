import { Request, Response } from "express";

function remoconServiceWorkerAllowed() {
  return (req: Request, res: Response, next: () => void) => {
    res.append("Service-Worker-Allowed", "/notificationServiceWorker.js");
    next();
  };
}

export default remoconServiceWorkerAllowed;
