import {
  KeyValue,
  PublicTypebot,
  ResultValues,
  Typebot,
  Variable,
  Webhook,
  WebhookResponse,
  Block,
} from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import { byId, isEmpty, isWebhookBlock, omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import { initMiddleware, methodNotAllowed, notFound } from '@typebot.io/lib/api'
import { stringify } from 'qs'
import Cors from 'cors'
import prisma from '@typebot.io/lib/prisma'
import { fetchLinkedTypebots } from '@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedTypebots'
import { getPreviouslyLinkedTypebots } from '@typebot.io/bot-engine/blocks/logic/typebotLink/getPreviouslyLinkedTypebots'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { saveErrorLog } from '@typebot.io/bot-engine/logs/saveErrorLog'
import { saveSuccessLog } from '@typebot.io/bot-engine/logs/saveSuccessLog'
import { parseSampleResult } from '@typebot.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import {
  HttpMethod,
  defaultWebhookAttributes,
} from '@typebot.io/schemas/features/blocks/integrations/webhook/constants'
import { getBlockById } from '@typebot.io/lib/getBlockById'
import {
  longReqTimeoutWhitelist,
  longRequestTimeout,
  responseDefaultTimeout,
} from '@typebot.io/bot-engine/blocks/integrations/webhook/executeWebhookBlock'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { resultValues, variables, parentTypebotIds } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues | undefined
      variables: Variable[]
      parentTypebotIds: string[]
    }
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: Webhook[] }) | null
    if (!typebot) return notFound(res)
    const block = typebot.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId))
    if (!block || !isWebhookBlock(block))
      return notFound(res, 'Webhook block not found')
    const webhookId = 'webhookId' in block ? block.webhookId : undefined
    const webhook =
      block.options?.webhook ??
      typebot.webhooks.find((w) => {
        if ('id' in w) return w.id === webhookId
        return false
      })
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const { group } = getBlockById(blockId, typebot.groups)
    const result = await executeWebhook(typebot)({
      webhook,
      variables,
      groupId: group.id,
      resultValues,
      resultId,
      parentTypebotIds,
      isCustomBody: block.options?.isCustomBody,
    })
    return res.status(200).send(result)
  }
  return methodNotAllowed(res)
}

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body)

export const executeWebhook =
  (typebot: Typebot) =>
  async ({
    webhook,
    variables,
    groupId,
    resultValues,
    resultId,
    parentTypebotIds = [],
    isCustomBody,
  }: {
    webhook: Webhook
    variables: Variable[]
    groupId: string
    resultValues?: ResultValues
    resultId?: string
    parentTypebotIds: string[]
    isCustomBody?: boolean
  }): Promise<WebhookResponse> => {
    if (!webhook.url)
      return {
        statusCode: 400,
        data: { message: `Webhook doesn't have url or method` },
      }
    const basicAuth: { username?: string; password?: string } = {}
    const basicAuthHeaderIdx =
      webhook.headers?.findIndex(
        (h) =>
          h.key?.toLowerCase() === 'authorization' &&
          h.value?.toLowerCase()?.includes('basic')
      ) ?? -1
    const isUsernamePasswordBasicAuth =
      basicAuthHeaderIdx !== -1 &&
      webhook.headers?.[basicAuthHeaderIdx].value?.includes(':')
    if (isUsernamePasswordBasicAuth) {
      const [username, password] =
        webhook.headers?.[basicAuthHeaderIdx].value?.slice(6).split(':') ?? []
      basicAuth.username = username
      basicAuth.password = password
      webhook.headers?.splice(basicAuthHeaderIdx, 1)
    }
    const headers = convertKeyValueTableToObject(webhook.headers, variables) as
      | Headers
      | undefined
    const queryParams = stringify(
      convertKeyValueTableToObject(webhook.queryParams, variables)
    )
    const contentType = headers ? headers['Content-Type'] : undefined
    const linkedTypebotsParents = (await fetchLinkedTypebots({
      isPreview: !('typebotId' in typebot),
      typebotIds: parentTypebotIds,
    })) as (Typebot | PublicTypebot)[]
    const linkedTypebotsChildren = await getPreviouslyLinkedTypebots({
      isPreview: !('typebotId' in typebot),
      typebots: [typebot],
    })([])
    const bodyContent = await getBodyContent(typebot, [
      ...linkedTypebotsParents,
      ...linkedTypebotsChildren,
    ])({
      body: webhook.body,
      isCustomBody,
      resultValues,
      groupId,
      variables,
    })
    const { data: body, isJson } =
      bodyContent && webhook.method !== HttpMethod.GET
        ? safeJsonParse(
            parseVariables(variables, {
              isInsideJson: !checkIfBodyIsAVariable(bodyContent),
            })(bodyContent)
          )
        : { data: undefined, isJson: false }

    const url = parseVariables(variables)(
      webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
    )

    const isLongRequest = longReqTimeoutWhitelist.some((whiteListedUrl) =>
      url?.includes(whiteListedUrl)
    )

    const request = {
      url,
      method: (webhook.method ?? defaultWebhookAttributes.method) as Method,
      headers: headers ?? {},
      ...basicAuth,
      json:
        !contentType?.includes('x-www-form-urlencoded') && body && isJson
          ? body
          : undefined,
      form:
        contentType?.includes('x-www-form-urlencoded') && body
          ? body
          : undefined,
      body: body && !isJson ? body : undefined,
      timeout: {
        response: isLongRequest ? longRequestTimeout : responseDefaultTimeout,
      },
    }
    try {
      const response = await got(request.url, omit(request, 'url'))
      await saveSuccessLog({
        resultId,
        message: 'Webhook successfuly executed.',
        details: {
          statusCode: response.statusCode,
          request,
          response: safeJsonParse(response.body).data,
        },
      })
      return {
        statusCode: response.statusCode,
        data: safeJsonParse(response.body).data,
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const response = {
          statusCode: error.response.statusCode,
          data: safeJsonParse(error.response.body as string).data,
        }
        await saveErrorLog({
          resultId,
          message: 'Webhook returned an error',
          details: {
            request,
            response,
          },
        })
        return response
      }
      const response = {
        statusCode: 500,
        data: { message: `Error from Typebot server: ${error}` },
      }
      console.error(error)
      await saveErrorLog({
        resultId,
        message: 'Webhook failed to execute',
        details: {
          request,
          response,
        },
      })
      return response
    }
  }

const getBodyContent =
  (
    typebot: Pick<Typebot | PublicTypebot, 'groups' | 'variables' | 'edges'>,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async ({
    body,
    resultValues,
    groupId,
    variables,
    isCustomBody,
  }: {
    body?: string | null
    resultValues?: ResultValues
    groupId: string
    variables: Variable[]
    isCustomBody?: boolean
  }): Promise<string | undefined> => {
    return body === '{{state}}' || isEmpty(body) || isCustomBody !== true
      ? JSON.stringify(
          resultValues
            ? parseAnswers({
                answers: resultValues.answers.map((answer) => ({
                  key:
                    (answer.variableId
                      ? typebot.variables.find(
                          (variable) => variable.id === answer.variableId
                        )?.name
                      : typebot.groups.find((group) =>
                          group.blocks.find(
                            (block) => block.id === answer.blockId
                          )
                        )?.title) ?? '',
                  value: answer.content,
                })),
                variables: resultValues.variables,
              })
            : await parseSampleResult(typebot, linkedTypebots)(
                groupId,
                variables
              )
        )
      : body ?? undefined
  }

const convertKeyValueTableToObject = (
  keyValues: KeyValue[] | undefined,
  variables: Variable[]
) => {
  if (!keyValues) return
  return keyValues.reduce((object, item) => {
    if (!item.key) return {}
    return {
      ...object,
      [item.key]: parseVariables(variables)(item.value ?? ''),
    }
  }, {})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: string): { data: any; isJson: boolean } => {
  try {
    return { data: JSON.parse(json), isJson: true }
  } catch (err) {
    return { data: json, isJson: false }
  }
}

export default handler
