import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isNotDefined, isNotEmpty } from '@typebot.io/lib'
import { startChatQuery } from '@/queries/startChatQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromStorage,
  setResultInStorage,
} from '@/utils/storage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import immutableCss from '../assets/immutable.css'
import { InputBlock } from '@typebot.io/schemas'
import { StartFrom } from '@typebot.io/schemas'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'
import { clsx } from 'clsx'

export type BotProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  isPreview?: boolean
  resultId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  startFrom?: StartFrom
}

export const Bot = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >()
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    setIsInitialized(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const typebotIdFromProps =
      typeof props.typebot === 'string' ? props.typebot : undefined
    const isPreview =
      typeof props.typebot !== 'string' || (props.isPreview ?? false)
    const { data, error, response } = await startChatQuery({
      stripeRedirectStatus: urlParams.get('redirect_status') ?? undefined,
      typebot: props.typebot,
      apiHost: props.apiHost,
      isPreview,
      resultId: isNotEmpty(props.resultId)
        ? props.resultId
        : getExistingResultIdFromStorage(typebotIdFromProps),
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
      startFrom: props.startFrom,
    })
    if (error && 'code' in error && typeof error.code === 'string') {
      if (isPreview) {
        return setError(
          new Error('An error occurred while loading the bot.', {
            cause: error.message,
          })
        )
      }
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        return setError(new Error('This bot is now closed.'))
      if (error.code === 'NOT_FOUND')
        return setError(new Error("The bot you're looking for doesn't exist."))
    }

    if (!data) {
      if (error) console.error(error)
      console.error({ data, error, response })
      return setError(new Error("Error! Couldn't initiate the chat."))
    }

    if (data.resultId && typebotIdFromProps)
      setResultInStorage(data.typebot.settings.general?.rememberUser?.storage)(
        typebotIdFromProps,
        data.resultId
      )
    setInitialChatReply(data)
    setCustomCss(data.typebot.theme.customCss ?? '')

    if (data.input?.id && props.onNewInputBlock)
      props.onNewInputBlock(data.input)
    if (data.logs) props.onNewLogs?.(data.logs)
  }

  createEffect(() => {
    if (isNotDefined(props.typebot) || isInitialized()) return
    initializeBot().then()
  })

  createEffect(() => {
    if (isNotDefined(props.typebot) || typeof props.typebot === 'string') return
    setCustomCss(props.typebot.theme.customCss ?? '')
  })

  onCleanup(() => {
    setIsInitialized(false)
  })

  return (
    <>
      <style>{customCss()}</style>
      <style>{immutableCss}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
            class={props.class}
            initialChatReply={{
              ...initialChatReply,
              typebot: {
                ...initialChatReply.typebot,
                settings:
                  typeof props.typebot === 'string'
                    ? initialChatReply.typebot?.settings
                    : props.typebot?.settings,
                theme:
                  typeof props.typebot === 'string'
                    ? initialChatReply.typebot?.theme
                    : props.typebot?.theme,
              },
            }}
            context={{
              apiHost: props.apiHost,
              isPreview:
                typeof props.typebot !== 'string' || (props.isPreview ?? false),
              resultId: initialChatReply.resultId,
              sessionId: initialChatReply.sessionId,
              typebot: initialChatReply.typebot,
            }}
            onNewInputBlock={props.onNewInputBlock}
            onNewLogs={props.onNewLogs}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
          />
        )}
      </Show>
    </>
  )
}

type BotContentProps = {
  initialChatReply: InitialChatReply
  context: BotContext
  class?: string
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

const BotContent = (props: BotContentProps) => {
  let botContainer: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  const injectCustomFont = () => {
    const existingFont = document.getElementById('bot-font')
    if (
      existingFont
        ?.getAttribute('href')
        ?.includes(
          props.initialChatReply.typebot?.theme?.general?.font ??
            defaultTheme.general.font
        )
    )
      return
    const font = document.createElement('link')
    font.href = `https://fonts.bunny.net/css2?family=${
      props.initialChatReply.typebot?.theme?.general?.font ??
      defaultTheme.general.font
    }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`
    font.rel = 'stylesheet'
    font.id = 'bot-font'
    document.head.appendChild(font)
  }

  onMount(() => {
    if (!botContainer) return
    resizeObserver.observe(botContainer)
  })

  createEffect(() => {
    injectCustomFont()
    if (!botContainer) return
    setCssVariablesValue(props.initialChatReply.typebot.theme, botContainer)
  })

  onCleanup(() => {
    if (!botContainer) return
    resizeObserver.unobserve(botContainer)
  })

  return (
    <div
      ref={botContainer}
      class={clsx(
        'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center typebot-container @container',
        props.class
      )}
    >
      <div class="flex w-full h-full justify-center">
        <ConversationContainer
          context={props.context}
          initialChatReply={props.initialChatReply}
          onNewInputBlock={props.onNewInputBlock}
          onAnswer={props.onAnswer}
          onEnd={props.onEnd}
          onNewLogs={props.onNewLogs}
        />
      </div>
      <Show
        when={
          props.initialChatReply.typebot.settings.general?.isBrandingEnabled
        }
      >
        <LiteBadge botContainer={botContainer} />
      </Show>
    </div>
  )
}
