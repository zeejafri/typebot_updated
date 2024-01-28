import { router } from '@/helpers/server/trpc'
import { getAccessToken } from './getAccessToken'
import { getCalendarEvents } from './getCalendar'

export const googleCalendarRouter = router({
  getAccessToken,
  getCalendarEvents,
})
