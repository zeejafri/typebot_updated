import { Flex, FormLabel, Stack, Switch, useDisclosure } from '@chakra-ui/react'
import { Background, Theme } from '@typebot.io/schemas'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { FontSelector } from './FontSelector'
import { LockTag } from '@/features/billing/components/LockTag'
import { Plan } from '@typebot.io/prisma'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { useTranslate } from '@tolgee/react'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  isBrandingEnabled: boolean
  generalTheme: Theme['general']
  onGeneralThemeChange: (general: Theme['general']) => void
  onBrandingChange: (isBrandingEnabled: boolean) => void
}

export const GeneralSettings = ({
  isBrandingEnabled,
  generalTheme,
  onGeneralThemeChange,
  onBrandingChange,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  const isWorkspaceFreePlan = isFreePlan(workspace)

  const handleSelectFont = (font: string) =>
    onGeneralThemeChange({ ...generalTheme, font })

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background })

  const updateBranding = () => {
    if (isBrandingEnabled && isWorkspaceFreePlan) return
    onBrandingChange(!isBrandingEnabled)
  }

  return (
    <Stack spacing={6}>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.brand')}
      />
      <Flex
        justifyContent="space-between"
        align="center"
        onClick={isWorkspaceFreePlan ? onOpen : undefined}
      >
        <FormLabel htmlFor="branding" mb="0" cursor="pointer">
          Show Typebot brand{' '}
          {isWorkspaceFreePlan && <LockTag plan={Plan.STARTER} />}
        </FormLabel>
        <Switch
          id="branding"
          isChecked={isBrandingEnabled}
          onChange={updateBranding}
        />
      </Flex>
      <FontSelector
        activeFont={generalTheme?.font ?? defaultTheme.general.font}
        onSelectFont={handleSelectFont}
      />
      <BackgroundSelector
        background={generalTheme?.background ?? defaultTheme.general.background}
        onBackgroundChange={handleBackgroundChange}
      />
    </Stack>
  )
}
