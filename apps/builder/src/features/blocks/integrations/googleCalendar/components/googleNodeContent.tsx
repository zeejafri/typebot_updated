import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { GoogleCalendarBlock } from '@typebot.io/schemas'
import { GoogleCalendarAction } from '@typebot.io/schemas/features/blocks/integrations/googleCalendar/constant'

type Props = {
  options?: GoogleCalendarBlock['options']
}

export const GoogleCalendarNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot()

  return (
    <Stack>
      <Text color={options?.action ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {options?.action ?? 'Configure...'}
      </Text>
      {typebot &&
        options?.action === GoogleCalendarAction.GET_EVENT &&
        <Text>Hello</Text>
      }
    </Stack>
  )
}
