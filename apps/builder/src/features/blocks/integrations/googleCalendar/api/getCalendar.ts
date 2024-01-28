import { calendar } from '@googleapis/calendar'
import { getAuthenticatedGoogleClient } from '@typebot.io/lib/google'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import prisma from '@typebot.io/lib/prisma'

export const getCalendarEvents = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
      calendarId: z.string(),
    })
  )
  .query(
    async ({
      input: { workspaceId, credentialsId, calendarId },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          members: true,
          credentials: {
            where: {
              id: credentialsId,
            },
            select: {
              id: true,
              data: true,
              iv: true,
            },
          },
        },
      })
      if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })

        if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })

      const credentials = workspace.credentials[0]
      if (!credentials)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Credentials not found',
        })

      const client = await getAuthenticatedGoogleClient(credentials.id)

      if (!client)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Google client could not be initialized',
        })

        try {
          const calendarEvents = await calendar({ version: 'v3', auth: client as never }).events.list({
            calendarId,
            maxResults: 100,
          })
          return { name:  calendarEvents.data.items }
        }
        catch (e) {
          return { name: 'No Calendar' }
        }
    }
  )
