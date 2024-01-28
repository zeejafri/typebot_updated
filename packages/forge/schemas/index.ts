// Do not edit this file manually
import { messenger } from '@typebot.io/messenger-block'
import { chatNode } from '@typebot.io/chat-node-block'
import { calCom } from '@typebot.io/cal-com-block'
import { zemanticAi } from '@typebot.io/zemantic-ai-block'
import { openAIBlock } from '@typebot.io/openai-block'
import {
  BlockDefinition,
  parseBlockCredentials,
  parseBlockSchema,
} from '@typebot.io/forge'
import { enabledBlocks } from '@typebot.io/forge-repository'
import { z } from '@typebot.io/forge/zod'

export const forgedBlocks = [
  openAIBlock,
  zemanticAi,
  calCom,
  chatNode,
  messenger,
] as BlockDefinition<(typeof enabledBlocks)[number], any, any>[]

export type ForgedBlockDefinition = (typeof forgedBlocks)[number]

export const forgedBlockSchemas = forgedBlocks.map(parseBlockSchema)
export type ForgedBlock = z.infer<(typeof forgedBlockSchemas)[number]>

export const forgedCredentialsSchemas = forgedBlocks
  .filter((b) => b.auth)
  .map(parseBlockCredentials)
