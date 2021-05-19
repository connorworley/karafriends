/* tslint:disable:max-classes-per-file */

import {
  RequestOptions,
  Response,
  RESTDataSource,
} from "apollo-datasource-rest";
import DataLoader from "dataloader";
import { request } from "express";
import fetch from "node-fetch";

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

interface MinseiMusicDetails extends MinseiResponse {
  data: {
    artistCode: string;
    artistName: string;
    contentsId: string;
    contentsYomi: string;
    firstLine: string;
    guideVocalList: {
      contentsId: string;
      duet: string;
      playtime: string;
    }[];
    musicTypeList: {
      musicTypeCode: string;
      musicTypeId: string;
      musicTypeName: string;
    }[];
    mylist: string;
    requestNo: string;
    songDifficulty: string;
    songTechDifficulty: string;
    thumbnailPathList: {
      thumbnailPath: string;
      thumbnailType: string;
    }[];
    value: string;
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

export class MinseiAPI extends RESTDataSource {
  creds: MinseiCredentials;

  constructor(creds: MinseiCredentials) {
    super();
    this.baseURL = "https://csgw.clubdam.com/cwa/win/minsei";
    this.creds = creds;
  }

  post<T>(url: string, data: object): Promise<T> {
    return super.post(
      url,
      Object.entries({
        ...BASE_MINSEI_REQUEST,
        ...data,
      })
        .map(([k, v]) => `${k}=${v}`)
        .join("&"),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  }

  parseBody(response: Response): Promise<object | string | ArrayBuffer> {
    if (response.headers.get("Content-Type") === "application/octet-stream") {
      return response.arrayBuffer();
    } else {
      return super.parseBody(response);
    }
  }

  static checkError<T extends MinseiResponse>(data: T) {
    if (data.statusCode !== "0000") {
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
      .then((data) => data.json())
      .then(MinseiAPI.checkError);
  }

  private musicDetailsLoader = new DataLoader((requestNos) =>
    Promise.all(
      requestNos.map((requestNo) =>
        this.post<MinseiMusicDetails>("/music/search/GetMusicDetail.api", {
          requestNo,
          ...this.creds,
        }).then(MinseiAPI.checkError)
      )
    )
  );

  getMusicDetails(requestNo: string) {
    return this.musicDetailsLoader.load(requestNo);
  }

  getMusicStreamingUrls(requestNo: string) {
    return this.post<MinseiStreamingUrls>(
      "/music/playLog/GetMusicStreamingURL.api",
      { requestNo, ...this.creds }
    ).then(MinseiAPI.checkError);
  }

  getScoringData(requestNo: string) {
    return this.post<object | ArrayBuffer>(
      "/scoring/GetScoringReferenceData.api",
      { requestNo, ...this.creds }
    ).then((body) => {
      if (!(body instanceof ArrayBuffer)) {
        return Promise.reject("Scoring data was not returned in binary format");
      }
      return body;
    });
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

interface SearchMusicByKeywordResponse extends DkwebsysReponse {
  list: {
    requestNo: string;
    title: string;
    titleYomi: string;
    artist: string;
    artistYomi: string;
  }[];
}

interface SearchArtistByKeywordResponse extends DkwebsysReponse {
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

  private musicByKeywordLoader = new DataLoader((keywords) =>
    Promise.all(
      keywords.map((keyword) =>
        this.post<SearchMusicByKeywordResponse>(
          "https://csgw.clubdam.com/dkwebsys/search-api/SearchMusicByKeywordApi",
          {
            keyword,
            sort: "1",
            pageNo: "1",
            dispCount: "30",
          }
        ).then(this.checkError)
      )
    )
  );

  getMusicByKeyword(keyword: string) {
    return this.musicByKeywordLoader.load(keyword);
  }

  private artistByKeywordLoader = new DataLoader((keywords) =>
    Promise.all(
      keywords.map((keyword) =>
        this.post<SearchArtistByKeywordResponse>(
          "https://csgw.clubdam.com/dkwebsys/search-api/SearchArtistByKeywordApi",
          {
            keyword,
            sort: "1",
            pageNo: "1",
            dispCount: "30",
          }
        ).then(this.checkError)
      )
    )
  );

  getArtistByKeyword(keyword: string) {
    return this.artistByKeywordLoader.load(keyword);
  }

  private musicListByArtistLoader = new DataLoader((artistCodes) =>
    Promise.all(
      artistCodes.map((artistCode) =>
        this.post<GetMusicListByArtistResponse>(
          "https://csgw.clubdam.com/dkwebsys/search-api/GetMusicListByArtistApi",
          {
            artistCode,
            sort: "1",
            pageNo: "1",
            dispCount: "30",
          }
        ).then(this.checkError)
      )
    )
  );

  getMusicListByArtist(artistCode: string) {
    return this.musicListByArtistLoader.load(artistCode);
  }
}
