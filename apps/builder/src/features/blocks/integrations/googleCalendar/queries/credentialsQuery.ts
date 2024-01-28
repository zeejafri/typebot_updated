import { stringify } from 'qs'
import { sendRequest } from '@typebot.io/lib'

export const createCalendarCredentialQuery = async (code: string) => {
  const queryParams = stringify({ code })
  return sendRequest({
    url: `/api/credentials/google-calendar/callback?${queryParams}`,
    method: 'GET',
  })
}