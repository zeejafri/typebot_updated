import React from 'react'
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  Stack,
  Text,
  ModalContent,
  ModalOverlay,
  ModalFooter,
} from '@chakra-ui/react'
import { getGoogleCalendarConsentScreenUrlQuery } from '../queries/consent-urlQuery' // Import your function
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import Link from 'next/link'
import { GoogleLogo } from '@/components/GoogleLogo'

type Props = {
  isOpen: boolean
  typebotId: string
  blockId: string
  onClose: () => void
}

export const GoogleCalendarConnectModal = ({
  typebotId,
  blockId,
  isOpen,
  onClose,
}: Props) => {
  const { workspace } = useWorkspace()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Google Calendar</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          <Text>
            Make sure to check all the permissions so that the integration works
            as expected:
          </Text>
          <Flex>
            <Button
              as={Link}
              leftIcon={<GoogleLogo />}
              data-testid="google"
              isLoading={['loading', 'authenticated'].includes(status)}
              variant="outline"
              href={getGoogleCalendarConsentScreenUrlQuery(
                window.location.href,
                blockId,
                workspace?.id,
                typebotId
              )}
              mx="auto"
            >
              Continue with Google
            </Button>
          </Flex>
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
