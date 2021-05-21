/* tslint:disable:max-classes-per-file */

import {
  RequestOptions,
  Response,
  RESTDataSource,
} from "apollo-datasource-rest";
import DataLoader from "dataloader";
import { request } from "express";
import fetch from "node-fetch";
import UserAgent from "user-agents";

// "Public" Innertube API Key
const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const INNERTUBE_CLIENT_VERSION = "2.20210520.22.00";

const BASE_INNERTUBE_REQUEST = {
  context: {
    client: {
      clientName: "WEB",
      clientVersion: INNERTUBE_CLIENT_VERSION,
    },
  },
};

interface GetVideoInfoResponse {
  playabilityStatus: {
    status: string;
    reason: string;
  };
  videoDetails: {
    videoId: string;
    title: string;
    lengthSeconds: string;
    keywords: string[];
    channelId: string;
    shortDescription: string;
    viewCount: string;
    author: string;
  };
}

export class YoutubeAPI extends RESTDataSource {
  userAgent: string;

  constructor() {
    super();
    this.baseURL = "https://www.youtube.com/youtubei/v1";
    this.userAgent = new UserAgent({ deviceCategory: "desktop" }).toString();
  }

  post<T>(url: string, data: object): Promise<T> {
    return super.post(
      `${url}?key=${INNERTUBE_API_KEY}`,
      {
        ...BASE_INNERTUBE_REQUEST,
        ...data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Host: "www.youtube.com",
          "User-Agent": this.userAgent,
        },
      }
    );
  }

  getVideoInfo(videoId: string) {
    return this.post<GetVideoInfoResponse>("/player", { videoId }).then(
      (body) => body
    );
  }
}
