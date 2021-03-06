import { profileRoute } from '../router/routes'
import Entity from './Entity'
import Team from './Team'

/**
 * @property {String} name
 */
export default class User extends Entity {
  constructor (data) {
    super(data)

    this.name = data.name
    this.md5 = data.md5
    this.created_from_now = data.created_from_now

    if (data.teams) {
      this.teams = data.teams.map(team => new Team(team))
    }
  }

  /**
   * Gets route to show user profile page
   * @returns {{params: {id: Number}}}
   */
  get profileRoute () { return {...profileRoute, params: {id: this.id}} }
}
