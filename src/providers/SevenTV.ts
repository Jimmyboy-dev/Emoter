import { Emote, Badge, User } from "../types";
import { EmoteProvider, ProviderData } from "./EmoteProvider"

export class SevenTV extends EmoteProvider {
  static emoteUrl = (emote: SevenTVEmote) => `https://cdn.7tv.app/emote/${emote.id}/${emote.urls[emote.urls.length - 1][1]}`
  static badgeUrl = (badge: SevenTVBadge) => `https://cdn.7tv.app/emote/${badge.id}/${badge.urls[badge.urls.length - 1][1]}`
  baseUrl: string = "https://api.7tv.app/v2";
  emotes: SevenTVEmote[] = []
  badges: SevenTVBadge[] = []

  constructor() {
    super()
  }
  async getData(channel?: User) {
    let globals = (await this.get("/emotes/global")) as SevenTVGlobalEmotes
    let channels = await this.get(`/users/${channel}/emotes`) as SevenTVChannelEmotes
    this.emotes.push(...globals, ...channels)
    let badges = await this.get(`/badges`, { params: { user_identifier: "login" } }) as { badges: SevenTVBadge[] }
    this.badges.push(...badges.badges)
  }
  async normalizeResponse(channel: string) {
    if (this.badges.length === 0 || this.emotes.length === 0)
      await this.getData(channel)
    return {
      emotes: this.emotes.map((emote) => {
        emote.url = SevenTV.emoteUrl(emote)
        emote.type = "SevenTV";
        return emote
      }), badges: this.badges.map((badge) => {
        badge.url = SevenTV.badgeUrl(badge)
        badge.type = "SevenTV";
        return badge
      })
    }

  }


}

/**
 * A badge object in 7TV. Contains image URLs and a list of all users who have the badge.
 *
 * The list of users depends on the query:
 * > `user_identifier: "object_id" | "twitch_id" | "login"`
 */
export interface SevenTVBadge extends Badge {
  /**
   * 7TV Badge ID
   */
  id: string;
  /**
   * 7TV Badge Name
   * @example "Admin"
   */
  name: string;
  /**
   * 7TV Tooltip in case of Rendering for UI
   * @example "7TV Admin"
   */
  tooltip: string;
  /**
   * 7TV Badge URLs to grab the image url.
   * Url will always be at index [2].
   * @example [["1", "https://cdn.7tv.app/badge/60cd6255a4531e54f76d4bd4/1x", ""], ...]
   */
  urls: [string, string][];
  /**
   * A list of all userIds. The format of the IDs are determined by the query sent to obtain the data.
   *
   * @example
   * ```
   * // user_identifier = "twitch_id" (Twitch User ID)
   * ["24377667", "12345678", ...]
   * ```
   * @example
   * ```
   * //user_identifier = "login" (Twitch Usernames)
   * ["anatoleam", "mizkif", "devjimmyboy", ...]
   * ```
   * @example
   * ```
   * // user_identifier = "object_id" (7tv User ID)
   * ["60c5600515668c9de42e6d69", "3bc5437b814a67920f3dde4b", ...]
   * ```
   */
  users: User[];
};

/**
 * 7TV Emote Object
 */
export interface SevenTVEmote extends Emote {
  /**
   * Unique ID of 7TV Emote.
   */
  id: string;
  /**
   * Name of emote. What users type to display an emote.
   * @example "FeelsDankMan"
   */
  name: string;
  /**
   * Owner of the emote.
   */
  owner: SevenTVUser;
  /**
   * Number corresponding to the global visibility
   */
  visibility: number;
  /**
   * API Docs don't say what this is,
   * most likely a list of strings corresponding to `visibility` property.
   */
  visibility_simple: unknown[];
  /**
   * MIME Type of Emote Asset.
   * Most are served as `image/gif` or `image/png`
   * @example "image/webp"
   */
  mime: string;
  /**
   * Status of emote.
   * Whether emote is approved or not by 7TV Moderators.
   * @example 3
   */
  status: number;
  /**
   * Docs don't say the type of this. I'd guess it's a creator-defined list of strings used for search purposes.
   * @example []
   */
  tags: unknown[];
  /**
   * List of widths with length/index corresponding to urls in #urls.
   * @example [27,41,65,110]
   */
  width: number[];
  /**
   * List of heights with length/index corresponding to urls in #urls.
   * @example [32,48,76,128]
   */
  height: number[];
  /**
   * List of tuples with type `[${Resolution}, ${URL of Emote}]`
   */
  urls: [string, string][];
};
/**
 * List of emotes for a specified Channel
 */
export type SevenTVChannelEmotes = SevenTVEmote[];
/**
 * List of Global Emotes for 7TV.
 */
export type SevenTVGlobalEmotes = SevenTVEmote[];

/**
 * 7TV User Object.
 */
export type SevenTVUser = {
  /**
   * ID of the User in 7TV API.
   */
  id: string;
  /**
   * Twitch ID of the User.
   */
  twitch_id: string;
  /**
   * Twitch Login of the User.
   */
  login: string;
  /**
   * Twitch Display Name of the User.
   */
  display_name: string;
  /**
   * 7TV object describing permissions for this user.
   */
  role: {
    /**
     * Role ID
     */
    id: string;
    /**
     * Role Name.
     */
    name: string;
    /**
     * Position in Role's Userlist
     */
    position: number;
    /**
     * Color of Role.
     */
    color: number;
    /**
     * Number that describes allowed perms of User.
     */
    allowed: number;
    /**
     * Number that describes denied perms of User.
     */
    denied: number;
  };
};
