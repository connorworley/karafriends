import React, { useState } from "react";

declare global {
  interface Window {
    karafriends: {
      isLoggedIn(): Promise<boolean>;
      attemptLogin(creds: { account: string; password: string }): void;
    };
  }
}

export default function Login() {
  const [creds, setCreds] = useState({ account: "", password: "" });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.karafriends.attemptLogin(creds);
  };

  const setAccount = (account: string) =>
    setCreds({ account, password: creds.password });
  const setPassword = (password: string) =>
    setCreds({ account: creds.account, password });

  return (
    <form onSubmit={handleSubmit}>
      <label>karafriends</label>
      <input
        type="text"
        placeholder="Username"
        value={creds.account}
        onChange={(e) => setAccount(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={creds.password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn-small" type="submit">
        Login
      </button>
    </form>
  );
}
