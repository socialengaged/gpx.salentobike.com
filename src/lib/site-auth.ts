/** Password for accessing the public site (not admin). */
export const SITE_ACCESS_PASSWORD = 'salentoFriends';

export const SITE_ACCESS_COOKIE = 'site_auth';

export function isSiteAccessGranted(cookieValue: string | undefined): boolean {
  return cookieValue === SITE_ACCESS_PASSWORD;
}
