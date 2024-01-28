import { z } from 'zod'
import { chatwootBlockSchema } from './chatwoot'
import { googleAnalyticsBlockSchema } from './googleAnalytics'
import { googleSheetsBlockSchemas } from './googleSheets'
import { openAIBlockSchema } from './openai'
import { pixelBlockSchema } from './pixel/schema'
import { sendEmailBlockSchema } from './sendEmail'
import { zemanticAiBlockSchema } from './zemanticAi'
import { zapierBlockSchemas } from './zapier'
import { webhookBlockSchemas } from './webhook'
import { makeComBlockSchemas } from './makeCom'
import { pabblyConnectBlockSchemas } from './pabblyConnect'
import { googleCalendarBlockSchemas } from './googleCalendar'

export const integrationBlockSchemas = {
  v5: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleCalendarBlockSchemas.v5,
    googleSheetsBlockSchemas.v5,
    makeComBlockSchemas.v5,
    openAIBlockSchema,
    pabblyConnectBlockSchemas.v5,
    sendEmailBlockSchema,
    webhookBlockSchemas.v5,
    zapierBlockSchemas.v5,
    pixelBlockSchema,
    zemanticAiBlockSchema,
  ],
  v6: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleCalendarBlockSchemas.v6,
    googleSheetsBlockSchemas.v6,
    makeComBlockSchemas.v6,
    openAIBlockSchema,
    pabblyConnectBlockSchemas.v6,
    sendEmailBlockSchema,
    webhookBlockSchemas.v6,
    zapierBlockSchemas.v6,
    pixelBlockSchema,
    zemanticAiBlockSchema,
  ],
} as const

const integrationBlockV5Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v5,
])

const integrationBlockV6Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v6,
])

const integrationBlockSchema = z.union([
  integrationBlockV5Schema,
  integrationBlockV6Schema,
])

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockV5 = z.infer<typeof integrationBlockV5Schema>
export type IntegrationBlockV6 = z.infer<typeof integrationBlockV6Schema>
