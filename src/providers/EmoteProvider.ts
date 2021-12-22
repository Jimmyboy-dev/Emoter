import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import { Emote } from ".."
import { Badge, User } from "../types"
/**
 *
 */
export type EmoteProviderOptions = {
  url: string
}
export abstract class EmoteProvider {
  baseUrl: string
  api: AxiosInstance

  constructor(_options?: EmoteProviderOptions) {
    this.api = axios.create({
      baseURL: _options.url || this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
  }
  /**
   * Perform a get request to the provider's API.
   * @param endpoint Endpoint to request. In the form of `/api/v1/endpoint`
   * @param config Axios request config. Can send params or headers if needed.
   * @returns The Emote Provider's response in the form of an Axios response object
   */
  get = (endpoint: string, config: AxiosRequestConfig = {}) =>
    this.api.get(endpoint, config).then(res => res.data).catch((e) => console.error(e))

  abstract getData(channel?: User): Promise<void>

  abstract normalizeResponse(channel?: User): Promise<ProviderData>
}

export type ProviderData = {
  emotes?: Map<string, Emote | string> | Emote[]
  badges?: Badge[]
}
