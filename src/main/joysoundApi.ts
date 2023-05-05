import { RESTDataSource } from "apollo-datasource-rest";
import fetch from "node-fetch";
import invariant from "ts-invariant";

const COOKIE_IDS: string[] = ["AWSALB", "AWSALBCORS", "JSESSIONID"];

export interface JoysoundCreds {
  cookies: JoysoundCookies;
  csrfToken: string;
}

interface JoysoundCookies {
  AWSALB: string;
  AWSALBCORS: string;
  JSESSIONID: string;
}

interface JoysoundArtistListItem {
  selSongNo: null;
  songName: null;
  artistName: string;
  serviceTypeList: null;
  artistId_digi: string;
}

interface JoysoundMovieList {
  slc: string;
  movie: JoysoundMovieUrlList;
}

interface JoysoundMovieUrlList {
  [index: string]: string;
}

interface JoysoundSongDetail {
  name: string;
  artistName: string;
  lyricsPreview: string;
  tieUp: string;
}

interface JoysoundSongListItem {
  selSongNo: string;
  songName: string;
  artistName: string;
  serviceTypeList: ServiceTypeData[];
  artistId_digi: string;
}

export interface JoysoundSongRawData {
  slc: string;
  telop: string;
  ogg: string;
  streaming_wifi_url: string;
}

interface ServiceTypeData {
  serviceType: string;
}

function generateCookieString(cookies: JoysoundCookies) {
  return COOKIE_IDS.map(
    (cookieId) => cookieId + "=" + cookies[cookieId as keyof JoysoundCookies]
  ).join("; ");
}

function parseCookies(setCookie: string, target: JoysoundCookies) {
  for (const cookieId of COOKIE_IDS) {
    const re = new RegExp(cookieId + "=([^;]+);");

    const matchData = setCookie.match(re);
    invariant(matchData);

    target[cookieId as keyof JoysoundCookies] = matchData[1];
  }
}

export class JoysoundAPI extends RESTDataSource {
  cookies: JoysoundCookies;
  csrfToken: string;

  constructor(creds: JoysoundCreds) {
    super();

    this.baseURL = "https://www.sound-cafe.jp";
    this.cookies = creds.cookies;
    this.csrfToken = creds.csrfToken;
  }

  post<T>(url: string, data: object): Promise<T> {
    const body = Object.entries(data)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    console.debug(
      `[joysound] curl ${
        this.baseURL
      }${url} -d "${body}" -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -H "Cookie: ${generateCookieString(
        this.cookies
      )}" -H "X-CSRF-TOKEN: ${this.csrfToken}"`
    );

    return super.post(url, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: generateCookieString(this.cookies),
        "X-CSRF-TOKEN": this.csrfToken,
      },
    });
  }

  getArtistListByKeyword(keyword: string, start: number, count: number) {
    return this.post<JoysoundArtistListItem[]>("/search/artist/list", {
      keyword,
      match: "partial",
      sort: "name",
      order: "asc",
      start: start.toString(),
      count: count.toString(),
    });
  }

  getMovieUrls(id: string) {
    return this.get<JoysoundMovieList>(
      "/player/contentsInfo",
      { songNumber: id, serviceType: "003000761" },
      { headers: { Cookie: generateCookieString(this.cookies) } }
    );
  }

  getSongDetail(id: string) {
    return this.get(
      `songdetail/${id}`,
      {},
      { headers: { Cookie: generateCookieString(this.cookies) } }
    ).then((data) => {
      const re = new RegExp(
        /<div class="flex items-center w-full border-b border-gray">([^<>]*)/,
        "g"
      );

      const results: string[] = [];

      for (const matchData of data.matchAll(re)) {
        results.push(matchData[1]);
      }

      const name = results[0];
      invariant(name);

      const artistName = results[1];
      invariant(artistName);

      const tieUp = results[2];
      invariant(tieUp !== undefined);

      const lyricsPreview = data.match(
        /<div class="flex items-center w-full border-b select-none border-gray">([^<>]*)/
      )[1];
      invariant(lyricsPreview !== undefined);

      const payload: JoysoundSongDetail = {
        name,
        artistName,
        lyricsPreview,
        tieUp,
      };

      return payload;
    });
  }

  getSongListByArtist(artistId: string, start: number, count: number) {
    return this.post<JoysoundSongListItem[]>("/search/artist/song/list", {
      artistId,
      sort: "popular",
      order: "asc",
      start: start.toString(),
      count: count.toString(),
    });
  }

  getSongListByKeyword(keyword: string, start: number, count: number) {
    return this.post<JoysoundSongListItem[]>("/search/song/list", {
      keyword,
      match: "partial",
      sort: "popular",
      order: "asc",
      start: start.toString(),
      count: count.toString(),
    });
  }

  getSongRawData(id: string) {
    return this.get<JoysoundSongRawData>(
      "/player/getFME",
      { songNumber: id, serviceType: "003000761" },
      { headers: { Cookie: generateCookieString(this.cookies) } }
    );
  }

  static async login(email: string, password: string) {
    const loginCookies: JoysoundCookies = {
      AWSALB: "",
      AWSALBCORS: "",
      JSESSIONID: "",
    };

    const csrfToken = await fetch("https://www.sound-cafe.jp/login", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    })
      .then((resp) => {
        const setCookie = resp.headers.get("set-cookie");
        invariant(setCookie);

        parseCookies(setCookie, loginCookies);

        return resp.text();
      })
      .then((respBody) => {
        const matchData = respBody.match(
          /<meta name="_csrf" content="([^"]+)" \/>/
        );
        invariant(matchData);

        return matchData[1];
      });

    return fetch("https://www.sound-cafe.jp/login", {
      method: "POST",
      body: `_csrf=${csrfToken}&mailAddress=${email}&password=${password}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: generateCookieString(loginCookies),
      },
      redirect: "manual",
    })
      .then((resp) => {
        const setCookie = resp.headers.get("set-cookie");
        invariant(setCookie);

        parseCookies(setCookie, loginCookies);

        return fetch(resp.url, {
          headers: { Cookie: generateCookieString(loginCookies) },
        });
      })
      .then((resp) => {
        const setCookie = resp.headers.get("set-cookie");
        invariant(setCookie);

        parseCookies(setCookie, loginCookies);

        return resp.text();
      })
      .then((respBody) => {
        const matchData = respBody.match(
          /<meta name="_csrf" content="([^"]+)" \/>/
        );
        invariant(matchData);

        return {
          cookies: loginCookies,
          csrfToken: matchData[1],
        };
      });
  }
}
