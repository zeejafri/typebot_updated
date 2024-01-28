import { FileIcon } from '@/components/icons'
import { trpc } from '@/lib/trpc'
import { Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { GoogleCalendarLogo } from './googleCalendarLogo'
import { isDefined } from '@typebot.io/lib'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

type Props = {
  calendarId?: string
  credentialsId: string
  workspaceId: string
  onCalendarIdSelect: (calendarId: string) => void
}

export const GoogleCalendarPicker = ({
  calendarId,
  workspaceId,
  credentialsId,
  onCalendarIdSelect,
}: Props) => {
  const [isPickerInitialized, setIsPickerInitialized] = useState(false)

  const { data } = trpc.calendar.getAccessToken.useQuery({
    workspaceId,
    credentialsId,
  })
  const { data: calendarData, status } =
    trpc.calendar.getCalendarEvents.useQuery(
      {
        workspaceId,
        credentialsId,
        calendarId: calendarId as string,
      },
      { enabled: !!calendarId }
    )

    useEffect(() => {
        loadScript('gapi', 'https://apis.google.com/js/api.js', () => {
          if (window.gapi && typeof window.gapi.load === 'function') {
            window.gapi.load('picker', () => {
              setIsPickerInitialized(true);
            });
          } else {
            console.error('Failed to load Google API library');
          }
        });
      }, []);

  const loadScript = (
    id: string,
    src: string,
    callback: { (): void; (): void; (): void }
  ) => {
    const existingScript = document.getElementById(id)
    if (existingScript) {
      callback()
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.id = id
    script.src = src
    script.onload = () => {
      callback()
    }
    script.onerror = () => {
      throw new Error(`Error loading ${src}`)
    }
    document.getElementsByTagName('head')[0].appendChild(script)
  }

  const handleOpenPicker = () => {
    if (!data) return
    if (!isPickerInitialized) throw new Error('Google Picker not inited')

    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.View(window.google.picker.ViewId.CALENDAR)
      )
      .setOAuthToken(data.accessToken)
      .setDeveloperKey(process.env.GOOGLE_CALENDAR_API)
      .setCallback(pickerCallback)
      .build()

    picker.setVisible(true)
  }

  const pickerCallback = (data: { action: string; docs: { id: string }[] }) => {
    if (data.action !== 'picked') return
    const calendarId = data.docs[0].id
    if (!calendarId) return
    onCalendarIdSelect(calendarId)
  }

  if (calendarData && calendarData.name !== '')
    return (
      <Flex justifyContent="space-between">
        <HStack spacing={2}>
          <GoogleCalendarLogo />
          <Text fontWeight="semibold">Calendar</Text>
        </HStack>
        <IconButton
          size="sm"
          icon={<FileIcon />}
          onClick={handleOpenPicker}
          isLoading={!isPickerInitialized}
          aria-label={''}
        />
      </Flex>
    )
  return (
    <Button
      onClick={handleOpenPicker}
      isLoading={
        !isPickerInitialized || (isDefined(calendarId) && status === 'loading')
      }
    >
      Pick a calendar
    </Button>
  )
}
