import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { Select } from '@/components/inputs/Select'
import { HStack, Input } from '@chakra-ui/react'
import { Calendar } from '../types'

type Props = {
  calendars: Calendar[]
  isLoading: boolean
  calendarId?: string
  onSelectCalendarId: (id: string | undefined) => void
}

export const CalendarPicker = ({
  calendars,
  isLoading,
  calendarId,
  onSelectCalendarId,
}: Props) => {
  if (isLoading) return <Input value="Loading..." isDisabled />
  if (!calendars || calendars.length === 0)
    return (
      <HStack>
        <Input value="No calendars found" isDisabled />
        <MoreInfoTooltip>
          Pick a calendar from the dropdown or create a new one in your Google Account
        </MoreInfoTooltip>
      </HStack>
    )
  return (
    <Select
      selectedItem={calendarId}
      items={(calendars ?? []).map((s) => ({ label: s.name, value: s.id }))}
      onSelect={onSelectCalendarId}
      placeholder={'Select the calendar'}
    />
  )
}
