import { z } from 'zod'
import { IntegrationBlockType } from '../constants'
import { blockBaseSchema, credentialsBaseSchema } from '../../shared'
import { GoogleCalendarAction } from './constant'

// Base options for Google Calendar
const googleCalendarOptionsBaseSchema = z.object({
  credentialsId: z.string().optional(),
  calendarId: z.string().optional(),
  schedule: z.array(z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    freeTimeSlots: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
  })).optional(),
});

// Options for appointing a builder in Google Calendar
const googleCalendarAppointBuilderOptionsSchema =
  googleCalendarOptionsBaseSchema.extend({
    action: z.enum([GoogleCalendarAction.APPOINT_BUILDER]),
    builder: z.object({
      name: z.string(),
      schedule: z.array(z.object({
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        freeTimeSlots: z.array(z.object({
          start: z.string(),
          end: z.string(),
        })),
      })),
    }).optional(),
  });

// Options for creating an event in Google Calendar
const googleCalendarCreateEventOptionsSchema =
  googleCalendarOptionsBaseSchema.extend({
    action: z.enum([GoogleCalendarAction.CREATE_EVENT]),
    event: z.object({
      summary: z.string(),
      location: z.string().optional(),
      description: z.string().optional(),
      start: z.object({
        dateTime: z.string(),
        timeZone: z.string().optional(),
      }),
      end: z.object({
        dateTime: z.string(),
        timeZone: z.string().optional(),
      }),
    }),
  })

const initialGoogleCalendarOptionsSchema =
  googleCalendarOptionsBaseSchema.merge(
    z.object({
      action: z.undefined(),
    })
  )

// Options for getting an event in Google Calendar
const googleCalendarGetEventOptionsSchema = googleCalendarOptionsBaseSchema
  .merge(
    z.object({
      action: z.enum([GoogleCalendarAction.GET_EVENT]),
      eventId: z.string(), 
    })
  );

const googleCalendarGetOptionsSchemas = {
  v5: googleCalendarGetEventOptionsSchema,
  v6: googleCalendarGetEventOptionsSchema.omit({
    eventId: true,
  }),
}

const googleCalendarGetOptionsSchema = z.union([
  googleCalendarGetOptionsSchemas.v5,
  googleCalendarGetOptionsSchemas.v6,
])

export const googleCalendarOptionsSchemas = {
  v5: z.discriminatedUnion('action', [
    googleCalendarGetOptionsSchemas.v5,
    initialGoogleCalendarOptionsSchema,
    googleCalendarAppointBuilderOptionsSchema,
    googleCalendarCreateEventOptionsSchema,
  ]),
  v6: z.discriminatedUnion('action', [
    googleCalendarGetOptionsSchemas.v6,
    initialGoogleCalendarOptionsSchema,
    googleCalendarAppointBuilderOptionsSchema,
    googleCalendarCreateEventOptionsSchema,
  ]),
}

// Google Calendar block schema
export const googleCalendarBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.GOOGLE_CALENDAR]),
    options: googleCalendarOptionsSchemas.v5.optional(),
  })
)

export const googleCalendarBlockSchemas = {
  v5: googleCalendarBlockV5Schema,
  v6: googleCalendarBlockV5Schema.merge(
    z.object({
      options: googleCalendarOptionsSchemas.v6.optional(),
    })
  ),
}

export const googleCalendarBlockSchema = z.union([
  googleCalendarBlockSchemas.v5,
  googleCalendarBlockSchemas.v6,
])

export const googleCalendarCredentialsSchema = z
  .object({
    type: z.literal('google calendar'),
    data: z.object({
      refresh_token: z.string().nullish(),
      expiry_date: z.number().nullish(),
      access_token: z.string().nullish(),
      token_type: z.string().nullish(),
      id_token: z.string().nullish(),
      scope: z.string().optional(),
    }),
  })
  .merge(credentialsBaseSchema)

export type GoogleCalendarBlock = z.infer<typeof googleCalendarBlockSchema>
export type GoogleCalendarOptionsBase = z.infer<
  typeof googleCalendarOptionsBaseSchema
>
export type GoogleCalendarCreateEventOptions = z.infer<
  typeof googleCalendarCreateEventOptionsSchema
>
export type GoogleCalendarAppointBuilderOptions = z.infer<
  typeof googleCalendarAppointBuilderOptionsSchema
>
export type GoogleCalendarGetEventOptions = z.infer<
  typeof googleCalendarGetEventOptionsSchema
>
export type GoogleCalendarCredentials = z.infer<
  typeof googleCalendarCredentialsSchema
>
export type GoogleCalendarGEtOptons = z.infer<
  typeof googleCalendarGetOptionsSchema
>

export type GoogleCalendarBlockV5 = z.infer<
  typeof googleCalendarBlockSchemas.v5
>
export type GoogleCalendarBlockV6 = z.infer<
  typeof googleCalendarBlockSchemas.v6
>
export type GoogleCalendarGetOptionV6 = z.infer<
  typeof googleCalendarGetOptionsSchemas.v6
>
