import fetch from "node-fetch";

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
    artist: string;
  }[];
}

function searchMusicByKeyword(keyword: string) {
  return makeDkwebsysRequest<SearchMusicByKeywordResponse>(
    "https://csgw.clubdam.com/dkwebsys/search-api/SearchMusicByKeywordApi",
    {
      keyword,
      sort: "1",
      pageNo: "1",
      dispCount: "30",
    }
  );
}

export { searchMusicByKeyword };
