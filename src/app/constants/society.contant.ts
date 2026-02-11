import { SocietyRoles } from "../types"

export const adminManagerRoles: string[] = [
    SocietyRoles.manager,
    SocietyRoles.societyadmin
]

export const ownerMemberTenanRoles: string[] = [
    SocietyRoles.member,
    SocietyRoles.owner,
    SocietyRoles.tenant
]