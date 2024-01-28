import { stringify } from 'qs'

export const getGoogleCalendarConsentScreenUrlQuery = (
  redirectUrl: string,
  blockId: string,
  workspaceId?: string,
  typebotId?: string
) => {
  const queryParams = stringify({
    redirectUrl,
    blockId,
    workspaceId,
    typebotId,
  })
  return `/api/credentials/google-calendar/consent-url?${queryParams}`
}