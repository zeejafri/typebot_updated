import { Stack, Flex, Text } from '@chakra-ui/react'
import { ContainerColors } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  guestBubbles: ContainerColors | undefined
  onGuestBubblesChange: (hostBubbles: ContainerColors | undefined) => void
}

export const GuestBubbles = ({ guestBubbles, onGuestBubblesChange }: Props) => {
  const updateBackground = (backgroundColor: string) =>
    onGuestBubblesChange({ ...guestBubbles, backgroundColor })

  const updateText = (color: string) =>
    onGuestBubblesChange({ ...guestBubbles, color })

  return (
    <Stack data-testid="guest-bubbles-theme">
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          value={
            guestBubbles?.backgroundColor ??
            defaultTheme.chat.guestBubbles.backgroundColor
          }
          onColorChange={updateBackground}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker
          value={guestBubbles?.color ?? defaultTheme.chat.guestBubbles.color}
          onColorChange={updateText}
        />
      </Flex>
    </Stack>
  )
}
