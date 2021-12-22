import axios from "axios";
import { BetterTTV, Chatterino, FrankerFZ, SevenTV, TwitchTV } from ".";
import { EmoteProvider } from "./providers/EmoteProvider";
export class Emoter {

  /**
     * **MUST CALL THIS BEFORE INITIALIZING ANY OTHER EMOTE PROVIDERS**
     * @param clientId 
     * @param clientSecret 
     */
  static async getCreds(clientId?: string, clientSecret?: string) {
    let appToken = await axios.get("https://id.twitch.tv/oauth2/token", {
      params: {
        client_id: clientId || process.env.TWITCH_CLIENT_ID,
        client_secret: clientSecret || process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials"
      }
    })
    axios.defaults.headers.common = {
      "Client-ID": clientId,
      "Authorization": `Bearer ${appToken.data.access_token}`
    }

  }

  channel?: string
  providers: ProviderMap
  rawEmotes: RawEmotes
  emotes: EmoterMap
  badges: BadgeMap
  badgeObj = {}

  constructor() {
    this.emotes = new Map()
    this.badges = new Map()
    this.providers = {
      bttv: new BetterTTV(),
      ffz: new FrankerFZ(),
      chatterino: new Chatterino(),
      stv: new SevenTV(),
      twitch: new TwitchTV()
    }
  }

  async grabEmotes() {
    if (this.channel === undefined) throw new Error("No channel set")
    for (const provider of Object.values(this.providers)) {
      await provider.getData(this.channel)
    }
  }

  setChannel(channel: string) {
    this.channel = channel
  }

  parseMessage(
    message: string,
    options: ParseMsgOptions = { classListEmoteImg: [], classListEmoteSpan: [], classListWords: [] }
  ) {

    let messageArray: string[] = message.split(" ")
    messageArray = [
      `<span class="${options.classListWords.join(" ")}">`,
      ...messageArray.map((w, i, arr) => {
        if (this.emotes.has(w)) {
          let emote: string;
          if (!this.emotes.get(w)) return w
          if (this.emotes.get(w)?.length === 0) return w
          else emote = this.emotes.get(w)?.[0] as string
          if (emote.startsWith("/")) (this.emotes.get(w) as string[])[0] = `https:` + this.emotes.get(w)?.[0]
          return `</span> <span class="${options.classListEmoteSpan.join(" ")}"><img src="${(this.emotes.get(w) as string[])[0]
            }" class="${options.classListEmoteImg.join(" ")}"/></span> <span class="${options.classListWords.join(" ")}">`
        }
        else return w
      }),
      `</span>`,
    ]
    return messageArray.join(" ")
  }

  /**
     * Gets an emote collection for a channel. Here all emotes are stored so you can access all of them
     * without always sending requests to the APIs and caring about undefined values. (If someone is not
     * registered somewhere, there'll just be empty lists here).
     * @param
     */
  async getEmoteCollection(
    channel: string,
    options: EmoteCollectionOptions = { includeGlobal: true, include7tv: false },
  ): Promise<EmoteCollection> {
    const { includeGlobal = true, include7tv = false } = options;
    const bttv = await this.getBetterTTVChannel(channel);
    const ffz = await this.getFFZChannel(channel);
    const stv = include7tv ? await this.getSevenTVChannel(channel) : undefined;
    const bttvGlobal = includeGlobal ? await this.getBetterTTVGlobalEmotes() : undefined;
    const ffzGlobal = includeGlobal ? await this.getFFZGlobalEmotes() : undefined;
    const stvGlobal = includeGlobal ? await this.getSevenTVGlobalEmotes() : undefined;
    const ffzGlobalSets: FFZEmoteSet[] = [];
    if (ffzGlobal !== undefined) {
      for (const set of ffzGlobal.default_sets) {
        const setObj = ffzGlobal.sets[set.toString()];
        if (setObj !== undefined) {
          ffzGlobalSets.push(setObj);
        }
      }
    }
    return {
      bttvChannel: bttv === undefined ? [] : bttv.channelEmotes,
      bttvShared: bttv === undefined ? [] : bttv.sharedEmotes,
      bttvGlobal: bttvGlobal === undefined ? [] : bttvGlobal,
      ffz: ffz === undefined ? [] : Object.values(ffz.sets),
      ffzGlobal: ffzGlobalSets,
      stv: stv === undefined ? [] : stv,
      stvGlobal: stvGlobal === undefined ? [] : stvGlobal,
    };
  }

  async getBadges(user: string): Promise<string[] | undefined> {
    let badges = this.badges.get(user.toLowerCase())
    return badges ?? []
  }
  async loadBadges() {
    if (!this.channel) throw new Error("No channel set")

    let badges: string[] = []
    let _7tvBadges = (await (await fetch("https://api.7tv.app/v2/badges?user_identifier=login")).json()) as {
      badges: {
        id: string
        name: string
        tooltip: string
        urls: [string, string][]
        users: string[]
      }[]
    }
    for (const badge of _7tvBadges.badges) {
      let url = badge.urls[0][1]
      for (const user of badge.users) {
        if (!this.badges.has(user)) {
          this.badges.set(user, [])
        }
        if (!this.badges.get(user)?.includes(url)) this.badges.get(user)?.push(url)
      }
    }

    let ffzBadges = (await (await fetch("https://api.frankerfacez.com/v1/badges")).json()) as {
      badges: {
        id: number
        name: string
        title: string
        slot: number
        color: string
        image: string
        urls: { [resolution: string]: string }
      }[]
      users: { [badgeId: string]: string[] }
    }
    for (const badge of ffzBadges.badges) {
      let url = badge.urls["2"]
      for (const user of ffzBadges.users[badge.id.toString()]) {
        if (!this.badges.has(user)) {
          this.badges.set(user, [])
        }
        this.badges.get(user)?.push(url)
      }
    }
    let bttvBadges = (await (await fetch("https://api.betterttv.net/3/cached/badges")).json()) as {
      name: string
      badge: { description: string; svg: string }
    }[]
    for (const user in bttvBadges) {
      let url = bttvBadges[user].badge.svg
      if (!this.badges.has(user)) {
        this.badges.set(user, [])
      }
      if (!this.badges.get(user)?.includes(url)) this.badges.get(user)?.push(url)
    }
    let chatterinoBadges = (await (await fetch("https://api.chatterino.com/badges")).json()) as {
      badges: { description: string; image1: string; image2: string; image3: string; users: string[] }[]
    }
    for (const badge of chatterinoBadges.badges) {
      let url = badge.image2 || badge.image1
      for (const user of badge.users) {
        if (!this.badges.has(user)) {
          this.badges.set(user, [])
        }
        if (!this.badges.get(user)?.includes(url)) this.badges.get(user)?.push(url)
      }
    }
    let cBadges = await (await fetch(`https://badges.twitch.tv/v1/badges/channels/${this.channel}/display`)).json()
    let ffz = await (
      await fetch(`https://api.frankerfacez.com/v1/_room/id/${encodeURIComponent(this.channel)}`)
    ).json()
    const channelB = new Map<string, { [badgeId: string]: string }>()
    for (let b in cBadges.badge_sets) {
      const bVersions: { [key: string]: any } = {}
      for (let v in cBadges.badge_sets[b].versions) {
        bVersions[v] = cBadges.badge_sets[b].versions[v].image_url_2x
      }

      channelB.set(b, bVersions)
    }
    if (ffz.room.moderator_badge)
      channelB.set("moderator", {
        "1": `https://cdn.frankerfacez.com/room-badge/mod/${ffz.room.id}/4/rounded`,
      })
    if (ffz.room.vip_badge)
      channelB.set("vip", {
        "1": `https://cdn.frankerfacez.com/room-badge/vip/${ffz.room.id}/4`,
      })
    this.channelBadges.set(this.channel, channelB)

  }

  globals: any = {}
  twitchGlobal: Promise<JSON | void> = fetch("https://badges.twitch.tv/v1/badges/global/display")
    .then((res) => res.json())
    .then((v) => {
      this.globals = v
    })
  channelBadges = new Map<string, Map<string, { [badgeId: string]: string }>>()

  async getBadgeURL(badgeObj: { badge: string; badgeId: string }) {
    if (!this.channel) return new Error("No channel set")
    var url = ""
    let badge = badgeObj.badge
    var badgeId = badgeObj.badgeId
    await this.twitchGlobal
    if (this.channelBadges.has(this.channel) && this.channelBadges.get(this.channel)?.has(badge)) {
      url = this.channelBadges.get(this.channel)?.get(badge)?.[badgeId] || "";
    }
    if (this.channelBadges.has(this.channel) && this.channelBadges.get(this.channel)?.has(badge)) {
      url = this.channelBadges.get(this.channel)?.get(badge)?.[badgeId] || ""
    } else if (Object.keys(this.globals.badge_sets).includes(badge)) {
      url =
        this.globals.badge_sets[badge].versions[badgeId]?.image_url_2x || this.globals.badge_sets[badge].versions[0]["image_url_2x"]
    }

    if (url === "") {
      url = Object.keys(this.globals.badge_sets).includes(badge)
        ? this.globals.badge_sets[badge].versions[badgeId]["image_url_2x"]
        : "https://api.iconify.design/mdi:file-question-outline.svg"
    }

    // console.log("URL for Badge: ", url)

    return url
  }
}

export type EmoterMap = Map<string, string[]>
export type BadgeMap = Map<string, string[]>


export type ParseMsgOptions = {
  classListWords: string[]
  classListEmoteSpan: string[]
  classListEmoteImg: string[]
}

export type RawEmotes = {
  ffz: {}
}

export type ProviderMap = {
  [key in "bttv" | "ffz" | "stv" | "chatterino" | "twitch"]: EmoteProvider;
};