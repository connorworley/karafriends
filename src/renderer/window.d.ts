declare global {
  interface Window {
    karafriends: {
      hasCredentials(): Promise<boolean>;
      setCredentials(username: string, password: string): void;
    };
  }
}
