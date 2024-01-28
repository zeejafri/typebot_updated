import { useEffect } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { customTheme } from '@/lib/theme'
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import '@/assets/styles/routerProgressBar.css'
import '@/assets/styles/plate.css'
import '@/assets/styles/resultsTable.css'
import '@/assets/styles/custom.css'
import '@/assets/styles/md.css'
import { UserProvider } from '@/features/account/UserProvider'
import { useRouter } from 'next/router'
import { SupportBubble } from '@/components/SupportBubble'
import { toTitleCase } from '@typebot.io/lib'
import { Plan } from '@typebot.io/prisma'
import { trpc } from '@/lib/trpc'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { TypebotProvider } from '@/features/editor/providers/TypebotProvider'
import { WorkspaceProvider } from '@/features/workspace/WorkspaceProvider'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { initPostHogIfEnabled } from '@/features/telemetry/posthog'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import { tolgee } from '@/lib/tolgee'

initPostHogIfEnabled()

const { ToastContainer, toast } = createStandaloneToast(customTheme)

const App = ({ Component, pageProps }: AppProps) => {
  useRouterProgressBar()
  const { query, pathname, locale } = useRouter()
  const ssrTolgee = useTolgeeSSR(tolgee, locale)

  useEffect(() => {
    if (pathname.endsWith('/edit') || pathname.endsWith('/analytics')) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('disable-scroll-x-behavior')
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('disable-scroll-x-behavior')
    }
  }, [pathname])

  useEffect(() => {
    const newPlan = query.stripe?.toString()
    if (newPlan === Plan.STARTER || newPlan === Plan.PRO)
      toast({
        position: 'top-right',
        status: 'success',
        title: 'Upgrade success!',
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      })
  }, [query.stripe])

  const typebotId = query.typebotId?.toString()

  return (
    <>
      <ToastContainer />
      <TolgeeProvider tolgee={ssrTolgee}>
        <ChakraProvider theme={customTheme}>
          <SessionProvider session={pageProps.session}>
            <UserProvider>
              <TypebotProvider typebotId={typebotId}>
                <WorkspaceProvider typebotId={typebotId}>
                  <Component {...pageProps} />
                  {!pathname.endsWith('edit') && isCloudProdInstance() && (
                    <SupportBubble />
                  )}
                  <NewVersionPopup />
                </WorkspaceProvider>
              </TypebotProvider>
            </UserProvider>
          </SessionProvider>
        </ChakraProvider>
      </TolgeeProvider>
    </>
  )
}

export default trpc.withTRPC(App)
