import { EmoteProvider, ProviderData } from "./EmoteProvider"

export class BetterTTV extends EmoteProvider {

  baseURL: string = "https://api.betterttv.net/3"
  badges: [] = []
  emotes: [] = []
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
 * The data the better twitch tv API gives for a twitch channel
 */
export type BetterTTVChannel = {
  /**
   * UUID used by BetterTTV for this channel
   */
  id: string;
  /**
   * A list of names of accounts marked as bots in this channel.
   */
  bots: string[];
  /**
   * A list of emotes that were created by this channel's owner and uploaded to BetterTTV
   */
  channelEmotes: BetterTTVChannelEmote[];
  /**
   * A list of emotes that are not uploaded by this channel's owner but are available on this channel.
   */
  sharedEmotes: BetterTTVSharedEmote[];
};

/**
 * One emote from BetterTTV
 */
export type BetterTTVEmote = {
  /**
   * A UUID used to identify this emote
   */
  id: string;
  /**
   * The text in chat that trigger this emote to show up
   */
  code: string;
  /**
   * The type of the image.
   */
  imageType: "png" | "gif";
};

/**
 * One channel emote from BetterTTV
 */
export type BetterTTVChannelEmote = BetterTTVEmote & {
  /**
   * UUID of the user who created this emote. Pretty useless as it seems to be
   * always the same id that is also available in BetterTTVChannel
   */
  userId: string;
};

/**
 * One shared emote from BetterTTV
 */
export type BetterTTVSharedEmote = BetterTTVEmote & {
  /**
   * The user who created this emote
   */
  user: BetterTTVUser;
};

/**
 * A BetterTTV user
 */
export type BetterTTVUser = {
  /**
   * UUID used by BetterTTV for this user
   */
  id: string;
  /**
   * The login name of this user
   */
  name: string;
  /**
   * The display name (name with capitalisation) of this user
   */
  displayName: string;
  /**
   * This seems to be the helix id of the user.
   */
  providerId: string;
};