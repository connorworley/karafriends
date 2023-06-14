import { app } from "electron"; // tslint:disable-line:no-implicit-dependencies
import fs from "fs";
import path from "path";
import { parse } from "yaml";

export interface KarafriendsConfig {
  // Whether to use the low bitrate URLs for DAM songs
  useLowBitrateUrl: boolean;
  // Whether to download DAM songs locally instead of streaming them
  paxSongQueueLimit: number;
  // Which port to listen on for the remocon server
  remoconPort: number;
  // DAM username for DAM creds
  damUsername: string;
  // DAM password for DAM creds
  damPassword: string;
  // Joysound email for joysound creds
  joysoundEmail: string;
  // Joysound password for joysound creds
  joysoundPassword: string;
  // List of admins by nickname
  adminNicks: string[];
  // List of admins by deviceId
  adminDeviceIds: string[];
}

const DEFAULT_CONFIG: KarafriendsConfig = {
  useLowBitrateUrl: false,
  paxSongQueueLimit: 1,
  remoconPort: 8080,
  damUsername: "YOUR_USERNAME_HERE",
  damPassword: "YOUR_PASSWORD_HERE",
  joysoundEmail: "YOUR_EMAIL_HERE",
  joysoundPassword: "YOUR_PASSWORD_HERE",
  adminNicks: [],
  adminDeviceIds: [],
};

function getConfig(): KarafriendsConfig {
  // Refer to https://www.electronjs.org/docs/latest/api/app#appgetpathname
  // for where the config file should be placed. On Windows, it should be %APPDATA%/karafriends/config.yaml
  const configFilepath: string = path.join(
    app.getPath("userData"),
    "config.yaml"
  );

  console.log(`Checking ${configFilepath} for configs`);

  if (fs.existsSync(configFilepath)) {
    console.log(`Configs found. Loading them up.`);
    const localConfig: KarafriendsConfig = parse(
      fs.readFileSync(configFilepath, { encoding: "utf8", flag: "r" })
    );
    return {
      ...DEFAULT_CONFIG,
      ...localConfig,
    };
  }

  console.log("No local configs found. Using default.");
  return DEFAULT_CONFIG;
}

const karafriendsConfig: KarafriendsConfig = getConfig();

export default karafriendsConfig;
