import { GoogleCalendarCreateEventOptions } from '@typebot.io/schemas'
import { google, calendar_v3 } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedGoogleClient} from '@/lib/google-calendar'
import { hasValue} from '@typebot.io/lib'
import {
    badRequest,
  } from '@typebot.io/lib/api'
import { saveSuccessLog } from '@typebot.io/bot-engine/logs/saveSuccessLog'
import { saveErrorLog } from '@typebot.io/bot-engine/logs/saveErrorLog'

const insertEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const calendarId = req.query.calendarId as string
  const { resultId, credentialsId, event } =
    req.body as GoogleCalendarCreateEventOptions & {
      resultId?: string
      event: calendar_v3.Schema$Event
    }
  if (!hasValue(credentialsId)) return badRequest(res)
  const auth = await getAuthenticatedGoogleClient(credentialsId)
  if (!auth)
    return res.status(404).send("Couldn't find credentials in database")

  const calendar = google.calendar({ version: 'v3', auth: auth as never})
  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    })
    await saveSuccessLog({ resultId, message: 'Successfully inserted event' })
    return res.send({ message: 'Success', event: response.data })
  } catch (err) {
    await saveErrorLog({
      resultId,
      message: "Couldn't insert event",
      details: err,
    })
    res.status(500).send(err)
    return
  }
}

export default insertEvent