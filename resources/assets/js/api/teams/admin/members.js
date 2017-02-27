import AdminRepository from '../../../data/AdminRepository'
import TeamMember from '../../../entities/TeamMember'

class TeamMembersAdminRepository extends AdminRepository {
  constructor () {
    super('admin/teams/{teamId}/members')
  }

  entityResolver (data) {
    return new TeamMember(data)
  }
}

export default new TeamMembersAdminRepository()
