import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { getAuthenticatedGoogleClient } from '@/lib/googleCalendar'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { setUser } from '@sentry/nextjs'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  setUser({ id: user.id })
  if (req.method === 'GET') {
    const credentialsId = req.query.credentialsId as string | undefined
    if (!credentialsId) return badRequest(res)
    const auth = await getAuthenticatedGoogleClient(user.id, credentialsId)
    if (!auth)
      return res.status(404).send({ message: "Couldn't find credentials in database" })
    const response = await google.calendar({
      version: 'v3',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth: auth.client as any}).calendarList.list({
      maxResults: 100,
    })
    const calendars = response.data.items?.map((calendar) => ({
      id: calendar.id,
      name: calendar.summary,
      timeZone: calendar.timeZone,
    }))
    return res.send({ calendars })
  } else {
    return methodNotAllowed(res)
  }
}

export default handler