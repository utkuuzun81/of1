import { ROLES } from './constants';
export const canSee = (role, allowed=[]) => allowed.includes(role);
