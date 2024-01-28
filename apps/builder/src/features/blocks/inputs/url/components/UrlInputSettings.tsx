import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { UrlInputBlock, Variable } from '@typebot.io/schemas'
import { defaultUrlInputOptions } from '@typebot.io/schemas/features/blocks/inputs/url/constants'
import React from 'react'

type Props = {
  options: UrlInputBlock['options']
  onOptionsChange: (options: UrlInputBlock['options']) => void
}

export const UrlInputSettings = ({ options, onOptionsChange }: Props) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })

  return (
    <Stack spacing={4}>
      <TextInput
        label="Placeholder:"
        defaultValue={
          options?.labels?.placeholder ??
          defaultUrlInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label="Button label:"
        defaultValue={
          options?.labels?.button ?? defaultUrlInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <TextInput
        label="Retry message:"
        defaultValue={
          options?.retryMessageContent ??
          defaultUrlInputOptions.retryMessageContent
        }
        onChange={handleRetryMessageChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
