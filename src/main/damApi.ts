/* tslint:disable:max-classes-per-file */

import {
  RequestOptions,
  Response,
  RESTDataSource,
} from "apollo-datasource-rest";
import DataLoader from "dataloader";
import { request } from "express";
import fetch from "node-fetch";
import promiseRetry from "promise-retry";

const BASE_MINSEI_REQUEST = {
  charset: "UTF-8",
  compAuthKey: "2/Qb9R@8s*",
  compId: "1",
  deviceId: "22",
  format: "json",
  serviceId: "1",
  contractId: "1",
};

export interface MinseiCredentials {
  userCode: string;
  authToken: string;
}

interface MinseiResponse {
  message: string;
  status: string;
  statusCode: string;
}

interface MinseiLogin extends MinseiResponse {
  data: {
    authToken: string;
    damtomoId: string;
  };
}

interface MinseiStreamingUrls extends MinseiResponse {
  data: {
    karaokeContentsId: string;
  };
  list: {
    contentsId: string;
    duet: string;
    highBitrateUrl: string;
    lowBitrateUrl: string;
  }[];
}

interface MinseiPlayHistory extends MinseiResponse {
  data: {
    dataCount: string;
    hasNext: string;
    hasPreview: string;
    overFlg: string;
    pageCount: string;
    value: string;
  };
  list: {
    artistCd: string;
    artistName: string;
    contentsId: string;
    contentsName: string;
    contentsYomi: string;
    deviceName: string;
    playDate: string;
    requestNo: string;
    thumbnailUrl: string;
    url: string;
  }[];
}

export class MinseiAPI extends RESTDataSource {
  creds: MinseiCredentials;

  constructor(creds: MinseiCredentials) {
    super();
    this.baseURL = "https://csgw.clubdam.com/cwa/win/minsei";
    this.creds = creds;
  }

  post<T>(url: string, data: object): Promise<T> {
    const body = Object.entries({
      ...BASE_MINSEI_REQUEST,
      ...data,
    })
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    console.debug(`[minsei] curl ${this.baseURL}${url} -d '${body}'`);
    return super.post(url, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  parseBody(response: Response): Promise<object | string | ArrayBuffer> {
    if (response.headers.get("Content-Type") === "application/octet-stream") {
      return response.arrayBuffer();
    } else {
      return super.parseBody(response);
    }
  }

  static checkError<T extends MinseiResponse>(data: T) {
    // statusCode 1005 seems to mean pagination continues
    if (data.statusCode !== "0000" && data.statusCode !== "1005") {
      throw new Error(`${data.status}: ${data.message}`);
    }
    return data;
  }

  static login(loginId: string, password: string) {
    return fetch(
      "https://csgw.clubdam.com/cwa/win/minsei/auth/LoginByDamtomoMemberId.api",
      {
        method: "POST",
        body: `loginId=${loginId}&password=${password}&format=json`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
      .then((data) => data.json() as Promise<MinseiLogin>)
      .then((data) => MinseiAPI.checkError(data));
  }

  getMusicStreamingUrls(requestNo: string) {
    // This endpoint seems to be flaky
    return promiseRetry((retry) =>
      this.post<MinseiStreamingUrls>(
        "/music/playLog/GetMusicStreamingURL.api",
        { requestNo, ...this.creds }
      )
        .then(MinseiAPI.checkError)
        .catch(retry)
    );
  }

  getScoringData(requestNo: string) {
    // This endpoint seems to be flaky
    return promiseRetry((retry) =>
      this.post<object | ArrayBuffer>("/scoring/GetScoringReferenceData.api", {
        requestNo,
        ...this.creds,
      })
        .then((body) => {
          if (!(body instanceof ArrayBuffer)) {
            return Promise.reject(
              "Scoring data was not returned in binary format"
            );
          }
          return body;
        })
        .catch(retry)
    );
  }

  getPlayHistory(first: number, after: number) {
    const firstPage = Math.floor(after / 30) + 1;
    const pageCount = Math.ceil(first / 30);

    return Promise.all(
      [...Array(pageCount).keys()].map((pageOffset) =>
        this.post<MinseiPlayHistory>("/music/playLog/GetMusicPlayHistory.api", {
          pageNo: (firstPage + pageOffset).toString(),
          dispNumber: "30",
          compUseFlag: "1",
          ...this.creds,
        }).then(MinseiAPI.checkError)
      )
    )
      .then((results) =>
        results.reduce((acc, cur) => {
          acc.list = acc.list.concat(cur.list);
          return acc;
        })
      )
      .then((result) => ({
        data: result.data,
        list: result.list.slice(after % 30, first),
      }));
  }
}

const BASE_DKWEBSYS_REQUEST = {
  modelTypeCode: "2",
  minseiModelNum: "M1",
  compId: "1",
  authKey: "2/Qb9R@8s*",
};

interface DkwebsysReponse {
  result: {
    statusCode: string;
    message: string;
    detailMessage?: string;
  };
}

interface GetMusicDetailInfoResponse extends DkwebsysReponse {
  data: {
    artistCode: number;
    artist: string;
    requestNo: string;
    title: string;
    titleYomi_Kana: string;
    firstLine: string;
  };

  list: {
    mModelMusicInfoList: {
      highlightTieUp: string;
      shift: string;
      thumbnailType: string;
      thumbnailPath: string;
      guideVocal: string;
      playtime: string;
      contentTypeId: string;
      contentTypeName: string;
      scoreLevel: number;
      technicalLevel: number;
      scoreFlag: string;
      lyricsImageFlag: string;
      myListFlag: string;
      damTomoPublicVocalFlag: string;
      damTomoPublicMovieFlag: string;
      damTomoPublicRecordingFlag: string;
    }[];
  }[];
}

interface SearchMusicByKeywordResponse extends DkwebsysReponse {
  data: {
    totalCount: number;
  };
  list: {
    requestNo: string;
    title: string;
    titleYomi: string;
    artist: string;
    artistYomi: string;
  }[];
}

interface SearchArtistByKeywordResponse extends DkwebsysReponse {
  data: {
    totalCount: number;
  };
  list: {
    artist: string;
    artistCode: number;
    artistYomi: string;
    holdMusicCount: number;
  }[];
}

interface GetMusicListByArtistResponse extends DkwebsysReponse {
  data: {
    artistCode: number;
    artist: string;
    artistYomi_Kana: string;
    totalCount: number;
  };
  list: {
    requestNo: string;
    title: string;
    titleYomi: string;
    artist: string;
    artistYomi: string;
  }[];
}

export class DkwebsysAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://csgw.clubdam.com/dkwebsys";
  }

  post<T>(url: string, data: object): Promise<T> {
    return super.post(url, {
      ...BASE_DKWEBSYS_REQUEST,
      ...data,
    });
  }

  checkError<T extends DkwebsysReponse>(data: T) {
    if (data.result.statusCode !== "0000") {
      throw new Error(`${data.result.message}: ${data.result.detailMessage}`);
    }
    return data;
  }

  private musicDetailsInfoLoader = new DataLoader((requestNos) =>
    Promise.all(
      requestNos.map((requestNo) =>
        this.post<GetMusicDetailInfoResponse>(
          "/search-api/GetMusicDetailInfoApi",
          { requestNo }
        ).then(this.checkError)
      )
    )
  );

  getMusicDetailsInfo(requestNo: string) {
    return this.musicDetailsInfoLoader.load(requestNo);
  }

  private musicByKeywordLoader = new DataLoader(
    (keys: readonly { keyword: string; pageNo: number }[]) =>
      Promise.all(
        keys.map((key) =>
          this.post<SearchMusicByKeywordResponse>(
            "https://csgw.clubdam.com/dkwebsys/search-api/SearchMusicByKeywordApi",
            {
              keyword: key.keyword,
              sort: "2",
              pageNo: key.pageNo.toString(),
              dispCount: "30",
            }
          ).then(this.checkError)
        )
      )
  );

  getMusicByKeyword(keyword: string, first: number, after: number) {
    const firstPage = Math.floor(after / 30) + 1;
    const pageCount = Math.ceil(first / 30);

    return Promise.all(
      [...Array(pageCount).keys()].map((pageOffset) =>
        this.musicByKeywordLoader.load({
          keyword,
          pageNo: firstPage + pageOffset,
        })
      )
    )
      .then((results) =>
        results.reduce((acc, cur) => {
          acc.list = acc.list.concat(cur.list);
          return acc;
        })
      )
      .then((result) => ({
        data: result.data,
        list: result.list.slice(after % 30, first),
      }));
  }

  private artistByKeywordLoader = new DataLoader(
    (keys: readonly { keyword: string; pageNo: number }[]) =>
      Promise.all(
        keys.map((key) =>
          this.post<SearchArtistByKeywordResponse>(
            "https://csgw.clubdam.com/dkwebsys/search-api/SearchArtistByKeywordApi",
            {
              keyword: key.keyword,
              sort: "2",
              pageNo: key.pageNo.toString(),
              dispCount: "30",
            }
          ).then(this.checkError)
        )
      )
  );

  getArtistByKeyword(keyword: string, first: number, after: number) {
    const firstPage = Math.floor(after / 30) + 1;
    const pageCount = Math.ceil(first / 30);

    return Promise.all(
      [...Array(pageCount).keys()].map((pageOffset) =>
        this.artistByKeywordLoader.load({
          keyword,
          pageNo: firstPage + pageOffset,
        })
      )
    )
      .then((results) =>
        results.reduce((acc, cur) => {
          acc.list = acc.list.concat(cur.list);
          return acc;
        })
      )
      .then((result) => ({
        data: result.data,
        list: result.list.slice(after % 30, first),
      }));
  }

  private musicListByArtistLoader = new DataLoader(
    (keys: readonly { artistCode: string; pageNo: number }[]) =>
      Promise.all(
        keys.map((key) =>
          this.post<GetMusicListByArtistResponse>(
            "https://csgw.clubdam.com/dkwebsys/search-api/GetMusicListByArtistApi",
            {
              artistCode: key.artistCode,
              sort: "2",
              pageNo: key.pageNo.toString(),
              dispCount: "30",
            }
          ).then(this.checkError)
        )
      )
  );

  getMusicListByArtist(artistCode: string, first: number, after: number) {
    const firstPage = Math.floor(after / 30) + 1;
    const pageCount = Math.ceil(first / 30);

    return Promise.all(
      [...Array(pageCount).keys()].map((pageOffset) =>
        this.musicListByArtistLoader.load({
          artistCode,
          pageNo: firstPage + pageOffset,
        })
      )
    )
      .then((results) =>
        results.reduce((acc, cur) => {
          acc.list = acc.list.concat(cur.list);
          return acc;
        })
      )
      .then((result) => ({
        data: result.data,
        list: result.list.slice(after % 30, first),
      }));
  }
}
