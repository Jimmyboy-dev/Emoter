declare enum NameProp {
  'name',
  'code',
  'id'
}
export type Emote = {
  [key in NameProp]: string
} & {
  type?: ProviderName
  url: string
}
export interface Badge {
  /**
   * The name of the badge.
   */
  name?: string;
  /**
   * The Provider-given id of the badge.
   */
  id?: string;
  /**
   * The highest quality resolution of the badge.
   */
  url: string;
  /**
   * List of users who have this badge
   */
  users: User[];

  type?: ProviderName
}

export type User = string
export type UserType = "id" | "name"

export type ProviderName = "SevenTV" | "BetterTTV" | "FrankerFZ" | "TwitchTV"