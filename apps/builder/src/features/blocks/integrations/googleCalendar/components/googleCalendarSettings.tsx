import React, { useMemo } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import {
  GoogleCalendarBlock,
  GoogleCalendarAppointBuilderOptions,
} from '@typebot.io/schemas'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useCalendars } from '../hooks/useCalendar'
import { GoogleCalendarConnectModal } from './googleConnectModel'
import { Stack } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { GoogleCalendarPicker } from './CalendarRetrieval'
import { CalendarPicker } from './CalendarPicker'
import { DayWithTimeSlots, DayWithTimeSlotsStack } from './Schedule'
import { GoogleCalendarAction } from '@typebot.io/schemas/features/blocks/integrations/googleCalendar/constant'
import { isDefined } from '@udecode/plate-common'
import { DropdownList } from '@/components/DropdownList'
import { Calendar } from '../types'

type Props = {
  options: GoogleCalendarBlock['options']
  onOptionsChange: (options: GoogleCalendarBlock['options']) => void
  blockId: string
}

export const GoogleCalendarSettings = ({
  options,
  onOptionsChange,
  blockId,
}: Props) => {
  const { workspace } = useWorkspace()
  const { typebot } = useTypebot()
  const { save } = useTypebot()
  const { calendars, mutate } = useCalendars({
    credentialsId: options?.credentialsId,
    calendarId: options?.calendarId,
    onError: (error) => {
      console.error(error)
    },
  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const calendar = useMemo(
    () => calendars?.find((calendar) => calendar.id === options?.calendarId),
    [calendars, options?.calendarId]
  )
  const handleCredentialsIdChange = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })

    // Refetch the calendars
    mutate()
  }

  const handleGoogleCalendarIdChange = (calendarId: string | undefined) =>
    onOptionsChange({ ...options, calendarId })
  const handleCalendarIdChange = (calendarId: string | undefined) =>
    onOptionsChange({ ...options, calendarId })

  const handleCreateNewClick = async () => {
    await save()
    onOpen()
  }
  const handleActionChange = (action: GoogleCalendarAction) =>
    onOptionsChange({
      credentialsId: options?.credentialsId,
      calendarId: options?.calendarId,
      action,
    })

  return (
    <Stack spacing={4}>
      {workspace && (
        <CredentialsDropdown
          type="google calendar"
          workspaceId={workspace.id}
          currentCredentialsId={options?.credentialsId}
          onCredentialsSelect={handleCredentialsIdChange}
          onCreateNewClick={handleCreateNewClick}
          credentialsName="Calendar Account"
        />
      )}
      {typebot && (
        <GoogleCalendarConnectModal
          typebotId={typebot.id}
          blockId={blockId}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      {options?.credentialsId && workspace && (
        <GoogleCalendarPicker
          calendarId={options?.calendarId}
          credentialsId={options?.credentialsId}
          workspaceId={workspace.id}
          onCalendarIdSelect={handleGoogleCalendarIdChange}
        />
      )}
      {options?.credentialsId && workspace && (
        <CalendarPicker
          calendars={calendars ?? []}
          isLoading={!calendars}
          calendarId={options?.calendarId}
          onSelectCalendarId={handleCalendarIdChange}
        />
      )}
      {options?.credentialsId && (
        isDefined(options?.calendarId) && (
      <DropdownList
        currentItem={'action' in options ? options?.action : undefined}
        onItemSelect={handleActionChange}
        items={Object.values(GoogleCalendarAction)}
        placeholder="Select an operation"
      />
        )
      )}
      {options?.action && (
        <ActionOptions
          options={options}
          calendar={calendar}
          onOptionsChange={onOptionsChange}
        />
      )}
      <DayWithTimeSlotsStack
        item={{ day: 'Monday', freeTimeSlots: [] }}
        onItemChange={(newItem) => console.log(newItem)}
      />
    </Stack>
  )
}

const ActionOptions = ({
  options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calendar,
  onOptionsChange,
}: {
  options: GoogleCalendarBlock['options']
  calendar?: Calendar
  onOptionsChange: (options: GoogleCalendarBlock['options']) => void
}) => {
  // ... other code

  const handleBuilderScheduleChange = (
    index: number,
    newItem: DayWithTimeSlots
  ) => {
    const newOptions = { ...options } as GoogleCalendarAppointBuilderOptions
    if (!newOptions.builder) {
      newOptions.builder = { name: '', schedule: [] }
    }
    if (!newOptions.builder.schedule) {
      newOptions.builder.schedule = []
    }
    newOptions.builder.schedule[index] = newItem
    onOptionsChange(newOptions)
  }

  switch (options?.action) {
    case GoogleCalendarAction.APPOINT_BUILDER:
      return (
        <>
          {(
            options as GoogleCalendarAppointBuilderOptions
          )?.builder?.schedule.map((item, index) => (
            <DayWithTimeSlotsStack
              key={index}
              item={item}
              onItemChange={(newItem) =>
                handleBuilderScheduleChange(index, newItem)
              }
            />
          ))}
        </>
      )
    // ... other cases
  }
}
