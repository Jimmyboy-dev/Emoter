import { Badge, User } from "../types"
import { EmoteProvider } from "./EmoteProvider"

export class Chatterino extends EmoteProvider {
  static badgeUrl(badge: ChatterinoBadge) {
    return badge.image3 || badge.image2 || badge.image1
  }
  baseURL: string = "https://api.chatterino.com"
  badges: ChatterinoBadge[] = []

  constructor() {
    super()
  }

  async getData() {
    let badges = (await this.get("/badges")).badges
    if (badges) {
      this.badges.push(...badges)
    }
  }

  async normalizeResponse() {
    if (this.badges.length === 0)
      await this.getData()
    return {
      badges: this.badges.map(badge => {
        badge.url = Chatterino.badgeUrl(badge);
        return badge
      })
    }

  }
}

export interface ChatterinoBadge extends Badge {
  tooltip: string;
  image1: string
  image2: string
  image3: string
  users: User[]
}