import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { Text } from '@chakra-ui/react'
import { RatingInputBlock } from '@typebot.io/schemas'
import { defaultRatingInputOptions } from '@typebot.io/schemas/features/blocks/inputs/rating/constants'

type Props = {
  variableId?: string
  block: RatingInputBlock
}

export const RatingInputContent = ({ variableId, block }: Props) =>
  variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text noOfLines={1} pr="6">
      Rate from {block.options?.buttonType === 'Icons' ? 1 : 0} to{' '}
      {block.options?.length ?? defaultRatingInputOptions.length}
    </Text>
  )
