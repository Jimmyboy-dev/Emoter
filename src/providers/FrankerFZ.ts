import { EmoteProvider, ProviderData } from "./EmoteProvider"

export class FrankerFZ extends EmoteProvider {
  baseUrl: string = "https://api.frankerfacez.com/v1";
  badges: [] = []
  emotes: [] = []
  constructor() {
    super()
  }
  async getData(channel?: string) {
    throw new Error("Method not implemented.");
  }
  async normalizeResponse(channel?: string): Promise<ProviderData> {
    if (this.badges.length === 0 || this.emotes.length === 0)
      await this.getData(channel)
    throw new Error("Method not implemented.");
  }
}

/**
 * A FFZ URL is always only a part of a URL. Use getURL() to get a complete URL.
 */
export type FFZUrl = string;

/**
 * A channel in the FrankerFaceZ API
 */
export type FFZChannel = {
  /**
   * Generic information about the channel
   */
  room: FFZRoom;
  /**
   * A record containing emote sets. The key of the record is the id of the emote set.
   */
  sets: Record<string, FFZEmoteSet>;
};

/**
 * Generic information abou a FFZ channel.
 */
export type FFZRoom = {
  /**
   * The helix id of the user
   */
  twitch_id: number;
  /**
   * The login name of the user
   */
  id: string;
  /**
   * I can not really say what this is and it seems to be false in most cases.
   */
  is_group: boolean;
  /**
   * The display name (name with capitalisation) of the user
   */
  display_name: string;
  /**
   * The custom moderator badge url.
   */
  moderatorBadge: string | null;
  // If anyone can tell what the next four are, please extend the type definition.
  // They were always null or empty for the channels I tested it with
  mod_urls: unknown;
  user_badges: Record<string, unknown>;
  user_badge_ids: Record<string, unknown>;
  css: unknown;
};

/**
 * A set of FFZ emotes
 */
export type FFZEmoteSet = {
  /**
   * The id of the emote set.
   */
  id: number;
  /**
   * The title of the emote set.
   */
  title: string;
  // If anyone can tell what the next two are, please extend the type definition.
  // They were always null or empty for the channels I tested it with
  icon: unknown;
  css: unknown;
  emoticons: FFZEmote[];
};

/**
 * One FFZ emote
 */
export type FFZEmote = {
  /**
   * The id of the emote
   */
  id: number;
  /**
   * The code used in chat to display this emote
   */
  name: string;
  // Whatever this means. There are different resolutions anyways.
  width: number;
  height: number;
  public: boolean;
  offset: unknown;
  margins: unknown;
  css: unknown;
  owner: FFZUser;
  status: number;
  usage_count: number;
  // The next two are date strings
  created_at: string;
  last_updated: string;
  /**
   * URLS of the emote. The key is the resolution, which is always a number string.
   */
  urls: Record<string, FFZUrl>;
};

/**
 * A FFZ user
 */
export type FFZUser = {
  /**
   * The login name of the user
   */
  name: string;
  /**
   * The display name (name with capitalisation) of the user
   */
  display_name: string;
};

/**
 * Global emotes from FFZ
 */
export type FFZGlobalEmotes = {
  /**
   * Contains the ids of sets that everyone can use.
   */
  default_sets: number[];
  /**
   * The global emote sets. The key of the record is the id of the emote set.
   */
  sets: Record<string, FFZEmoteSet>;
};