import axios from "axios";
import { EmoteProvider, ProviderData } from "./EmoteProvider"

export class TwitchTV extends EmoteProvider {

  baseUrl: string = "https://api.twitch.tv/helix";
  user: { id: string, login: string, display_name: string }
  badges: [] = []
  emotes: [] = []

  constructor() {
    super()
  }

  getData(channel?: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async normalizeResponse(channel?: string): Promise<ProviderData> {
    if (this.badges.length === 0 || this.emotes.length === 0)
      await this.getData(channel)
    throw new Error("Method not implemented.");
  }
}
