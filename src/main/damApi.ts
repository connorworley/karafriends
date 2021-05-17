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

interface MinseiResponse {
  message: string;
  status: string;
  statusCode: string;
}

interface MinseiCredentials {
  userCode: string;
  authToken: string;
}

function makeMinseiRequestRaw(url: string, data: any) {
  // Minsei requests kind of look like dkwebsys requests, but are slightly different
  const body = Object.entries({
    ...BASE_MINSEI_REQUEST,
    ...data,
  })
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  console.debug(`Minsei request: curl ${url} -d '${body}'`);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

function makeMinseiRequest<T extends MinseiResponse>(url: string, data: any) {
  // Minsei requests kind of look like dkwebsys requests, but are slightly different
  return makeMinseiRequestRaw(url, data)
    .then((res) => {
      return res.json();
    })
    .then((json: T) => {
      if (json.statusCode !== "0000") {
        throw new Error(`${json.status}: ${json.message}`);
      }
      return json;
    });
}

const BASE_DK_DENMOKU_REQUEST = {
  appVer: "2.1.0",
  deviceId: "22",
};

interface DkdenmokuResponse {
  // There are literally no useful fields
  appVer: string;
}

function makeDkdenmokuRequest<T extends DkdenmokuResponse>(
  url: string,
  data: any
) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...BASE_DK_DENMOKU_REQUEST,
      ...data,
    }),
  })
    .then((res) => res.json())
    .then((json: T) => json);
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

function makeDkwebsysRequest<T extends DkwebsysReponse>(
  url: string,
  data: any
) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...BASE_DKWEBSYS_REQUEST,
      ...data,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((json: T) => {
      if (json.result.statusCode !== "0000") {
        throw new Error(`${json.result.message}: ${json.result.detailMessage}`);
      }
      return json;
    });
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

function searchMusicByKeyword(keyword: string) {
  return makeDkwebsysRequest<SearchMusicByKeywordResponse>(
    "https://csgw.clubdam.com/dkwebsys/search-api/SearchMusicByKeywordApi",
    {
      keyword,
      sort: "2",
      pageNo: "1",
      dispCount: "30",
    }
  );
}

interface SearchArtistByKeywordResponse extends DkwebsysReponse {
  list: {
    artist: string;
    artistCode: number;
    artistYomi: string;
    holdMusicCount: number;
  }[];
}

function searchArtistByKeyword(keyword: string) {
  return makeDkwebsysRequest<SearchArtistByKeywordResponse>(
    "https://csgw.clubdam.com/dkwebsys/search-api/SearchArtistByKeywordApi",
    {
      keyword,
      sort: "2",
      pageNo: "1",
      dispCount: "30",
    }
  );
}

interface GetMusicListByArtistResponse extends DkwebsysReponse {
  data: {
    artistCode: number;
    artist: string;
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

function getMusicListByArtist(artistCode: string) {
  return makeDkwebsysRequest<GetMusicListByArtistResponse>(
    "https://csgw.clubdam.com/dkwebsys/search-api/GetMusicListByArtistApi",
    {
      artistCode,
      sort: "2",
      pageNo: "1",
      dispCount: "30",
    }
  );
}

interface DkDamIsExistServletResponse extends DkdenmokuResponse {
  isExist: {
    artistName: string;
    firstBars: string;
    reqNo: string;
    songName: string;
  }[];
}

function getSongsByReqNos(reqNos: string[]) {
  return makeDkdenmokuRequest<DkDamIsExistServletResponse>(
    "https://denmoku.clubdam.com/dkdenmoku/DkDamIsExistServlet",
    {
      isExist: reqNos.map((reqNo) => ({
        reqNo: reqNo.replace("-", ""),
      })),
    }
  );
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

function getMusicDetails(reqNo: string, creds: MinseiCredentials) {
  return makeMinseiRequest<MinseiMusicDetails>(
    "https://csgw.clubdam.com/cwa/win/minsei/music/search/GetMusicDetail.api",
    {
      ...creds,
      requestNo: reqNo,
    }
  );
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

function getMusicStreamingUrls(reqNo: string, creds: MinseiCredentials) {
  return makeMinseiRequest<MinseiStreamingUrls>(
    "https://csgw.clubdam.com/cwa/win/minsei/music/playLog/GetMusicStreamingURL.api",
    {
      ...creds,
      requestNo: reqNo,
    }
  );
}

interface MinseiLogin extends MinseiResponse {
  data: {
    authToken: string;
    damtomoId: string;
  };
}

function login(username: string, password: string) {
  return makeMinseiRequest<MinseiLogin>(
    "https://csgw.clubdam.com/cwa/win/minsei/auth/LoginByDamtomoMemberId.api",
    {
      loginId: username,
      password,
    }
  );
}

function getScoringData(reqNo: string, creds: MinseiCredentials) {
  return makeMinseiRequestRaw(
    "https://csgw.clubdam.com/cwa/win/minsei/scoring/GetScoringReferenceData.api",
    {
      ...creds,
      requestNo: reqNo,
    }
  ).then((res) => {
    if (res.headers.get("Content-Type") === "application/octet-stream") {
      return res.arrayBuffer();
    } else {
      return Promise.reject("Scoring data was not returned in binary format");
    }
  });
}

export {
  getMusicListByArtist,
  getSongsByReqNos,
  searchArtistByKeyword,
  searchMusicByKeyword,
  getMusicDetails,
  getMusicStreamingUrls,
  login,
  getScoringData,
  MinseiCredentials,
};
