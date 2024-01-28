import { z } from 'zod'
import { stripeCredentialsSchema } from './blocks/inputs/payment/schema'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schema'
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import { whatsAppCredentialsSchema } from './whatsapp'
import { zemanticAiCredentialsSchema } from './blocks'
import { openAICredentialsSchema } from './blocks/integrations/openai'
import { googleCalendarCredentialsSchema } from './blocks/integrations/googleCalendar/schema'

export const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  openAICredentialsSchema,
  whatsAppCredentialsSchema,
  zemanticAiCredentialsSchema,
  googleCalendarCredentialsSchema,
])

export type Credentials = z.infer<typeof credentialsSchema>
