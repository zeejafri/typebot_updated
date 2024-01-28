import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { GoogleCalendarCredentials } from '@typebot.io/schemas'
import { OAuth2Client } from 'google-auth-library'

export const getAccessToken = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
    })
  )
  .query(async ({ input: { workspaceId, credentialsId }, ctx: { user } }) => {
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
            data: true,
            iv: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const credentials = workspace.credentials[0]
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const decryptedCredentials = (await decrypt(
      credentials.data,
      credentials.iv
    )) as GoogleCalendarCredentials['data']

    const client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/credentials/google-calendar/callback`,
    })

    client.setCredentials(decryptedCredentials)

    return { accessToken: (await client.getAccessToken()).token }
  })
