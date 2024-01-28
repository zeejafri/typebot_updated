import { Stack, Text } from '@chakra-ui/react'
import { isDefined } from '@typebot.io/lib'
import {
  ResultWithAnswers,
  ResultHeaderCell,
  VariableWithValue,
  Answer,
} from '@typebot.io/schemas'
import { FileLinks } from '../components/FileLinks'
import { TableData } from '../types'
import { convertDateToReadable } from './convertDateToReadable'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

export const convertResultsToTableData = (
  results: ResultWithAnswers[] | undefined,
  headerCells: ResultHeaderCell[]
): TableData[] =>
  (results ?? []).map((result) => ({
    id: { plainText: result.id },
    date: {
      plainText: convertDateToReadable(result.createdAt),
    },
    ...[...result.answers, ...result.variables].reduce<{
      [key: string]: { element?: JSX.Element; plainText: string }
    }>((tableData, answerOrVariable) => {
      if ('groupId' in answerOrVariable) {
        const answer = answerOrVariable satisfies Answer
        const header = answer.variableId
          ? headerCells.find((headerCell) =>
              headerCell.variableIds?.includes(answer.variableId as string)
            )
          : headerCells.find((headerCell) =>
              headerCell.blocks?.some((block) => block.id === answer.blockId)
            )
        if (!header || !header.blocks || !header.blockType) return tableData
        const variableValue = result.variables.find(
          (variable) => variable.id === answer.variableId
        )?.value
        const content = variableValue ?? answer.content
        return {
          ...tableData,
          [header.id]: parseCellContent(content, header.blockType),
        }
      }
      const variable = answerOrVariable satisfies VariableWithValue
      if (variable.value === null) return tableData
      const headerId = headerCells.find((headerCell) =>
        headerCell.variableIds?.includes(variable.id)
      )?.id
      if (!headerId) return tableData
      if (isDefined(tableData[headerId])) return tableData
      return {
        ...tableData,
        [headerId]: parseCellContent(variable.value),
      }
    }, {}),
  }))

const parseCellContent = (
  content: VariableWithValue['value'],
  blockType?: InputBlockType
): { element?: JSX.Element; plainText: string } => {
  if (!content) return { element: undefined, plainText: '' }
  if (Array.isArray(content))
    return {
      element: (
        <Stack spacing={2}>
          {content.map((item, idx) => (
            <Text key={idx}>
              {idx + 1}. {item}
            </Text>
          ))}
        </Stack>
      ),
      plainText: content.join(', '),
    }
  return blockType === InputBlockType.FILE
    ? { element: <FileLinks fileNamesStr={content} />, plainText: content }
    : { plainText: content.toString() }
}
