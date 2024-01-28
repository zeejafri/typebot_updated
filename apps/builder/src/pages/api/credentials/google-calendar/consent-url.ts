//import { env } from '@typebot.io/env'
import { OAuth2Client } from 'google-auth-library'
import { NextApiRequest, NextApiResponse } from 'next'

export const googleCalendarScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.readonly',
  
  
]

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/credentials/google-calendar/callback`
    )
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleCalendarScopes,
      prompt: 'consent',
      state: Buffer.from(JSON.stringify(req.query)).toString('base64'),
    })
    res.status(301).redirect(url)
  }
}

export default handler