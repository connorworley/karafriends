import keytar from "keytar";

const SERVICE_NAME = "karafriends";

export function hasCredentials() {
  return keytar.findCredentials(SERVICE_NAME).then((creds) => creds.length > 0);
}

export function getCredentials() {
  return keytar.findCredentials(SERVICE_NAME).then((creds) => {
    if (creds.length > 0) {
      return creds[0];
    } else {
      return Promise.reject("no credentials found");
    }
  });
}

export function setCredentials(username: string, password: string) {
  return keytar.setPassword(SERVICE_NAME, username, password);
}

export function deleteCredentials() {
  return keytar
    .findCredentials(SERVICE_NAME)
    .then((creds) =>
      Promise.all(
        creds.map((cred) => keytar.deletePassword(SERVICE_NAME, cred.account))
      )
    );
}
