import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BubbleBlock,
  BubbleBlockContent,
  Block,
  BlockWithOptions,
  TextBubbleBlock,
  BlockV6,
} from '@typebot.io/schemas'
import {
  isBubbleBlock,
  isDefined,
  isInputBlock,
  isTextBubbleBlock,
} from '@typebot.io/lib'
import { BlockNodeContent } from './BlockNodeContent'
import { BlockSettings, SettingsPopoverContent } from './SettingsPopoverContent'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'
import { useRouter } from 'next/router'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'
import { ContextMenu } from '@/components/ContextMenu'
import { TextBubbleEditor } from '@/features/blocks/bubbles/textBubble/components/TextBubbleEditor'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  NodePosition,
  useBlockDnd,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { hasDefaultConnector } from '@/features/typebot/helpers/hasDefaultConnector'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { TargetEndpoint } from '../../endpoints/TargetEndpoint'
import { SettingsModal } from './SettingsModal'
import { TElement } from '@udecode/plate-common'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onMouseDown,
}: {
  block: BlockV6
  isConnectable: boolean
  indices: { blockIndex: number; groupIndex: number }
  onMouseDown?: (blockNodePosition: NodePosition, block: BlockV6) => void
}) => {
  const bg = useColorModeValue('gray.50', 'gray.850')
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const { pathname, query } = useRouter()
  const {
    setConnectingIds,
    connectingIds,
    openedBlockId,
    setOpenedBlockId,
    setFocusedGroupId,
    previewingEdge,
    isReadOnly,
    previewingBlock,
  } = useGraph()
  const { mouseOverBlock, setMouseOverBlock } = useBlockDnd()
  const { typebot, updateBlock } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPopoverOpened, setIsPopoverOpened] = useState(
    openedBlockId === block.id
  )
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleBlock(block) && (block.content?.richText?.length ?? 0) === 0
  )
  const blockRef = useRef<HTMLDivElement | null>(null)

  const isPreviewing =
    isConnecting ||
    previewingEdge?.to.blockId === block.id ||
    previewingBlock?.id === block.id

  const groupId = typebot?.groups[indices.groupIndex].id

  const onDrag = (position: NodePosition) => {
    if (!onMouseDown) return
    onMouseDown(position, block)
  }

  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onMouseDown,
  })

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (query.blockId?.toString() === block.id) setOpenedBlockId(block.id)
  }, [block.id, query, setOpenedBlockId])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === groupId &&
        connectingIds?.target?.blockId === block.id
    )
  }, [connectingIds, block.id, groupId])

  const handleModalClose = () => {
    updateBlock(indices, { ...block })
    onModalClose()
  }

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverBlock?.id !== block.id && blockRef.current)
      setMouseOverBlock({ id: block.id, element: blockRef.current })
    if (connectingIds && groupId)
      setConnectingIds({
        ...connectingIds,
        target: { groupId, blockId: block.id },
      })
  }

  const handleMouseLeave = () => {
    if (mouseOverBlock) setMouseOverBlock(undefined)
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      })
  }

  const handleCloseEditor = (content: TElement[]) => {
    const updatedBlock = { ...block, content: { richText: content } }
    updateBlock(indices, updatedBlock)
    setIsEditing(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    setFocusedGroupId(groupId)
    e.stopPropagation()
    if (isTextBubbleBlock(block) && !isReadOnly) setIsEditing(true)
    setOpenedBlockId(block.id)
  }

  const handleExpandClick = () => {
    setOpenedBlockId(undefined)
    onModalOpen()
  }

  const handleBlockUpdate = (updates: Partial<Block>) =>
    updateBlock(indices, { ...block, ...updates })

  const handleContentChange = (content: BubbleBlockContent) =>
    updateBlock(indices, { ...block, content } as Block)

  useEffect(() => {
    setIsPopoverOpened(openedBlockId === block.id)
  }, [block.id, openedBlockId])

  useEffect(() => {
    if (!blockRef.current) return
    const blockElement = blockRef.current
    blockElement.addEventListener('pointerdown', (e) => e.stopPropagation())

    return () => {
      blockElement.removeEventListener('pointerdown', (e) =>
        e.stopPropagation()
      )
    }
  }, [])

  const hasIcomingEdge = typebot?.edges.some((edge) => {
    return edge.to.blockId === block.id
  })

  return isEditing && isTextBubbleBlock(block) ? (
    <TextBubbleEditor
      id={block.id}
      initialValue={block.content?.richText ?? []}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <BlockNodeContextMenu indices={indices} />}
    >
      {(ref, isContextMenuOpened) => (
        <Popover
          placement="left"
          isLazy
          isOpen={isPopoverOpened}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Flex
              pos="relative"
              ref={setMultipleRefs([ref, blockRef])}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              data-testid={`block ${block.id}`}
              w="full"
              className="prevent-group-drag"
            >
              <HStack
                flex="1"
                userSelect="none"
                p="3"
                borderWidth={
                  isContextMenuOpened || isPreviewing ? '2px' : '1px'
                }
                borderColor={
                  isContextMenuOpened || isPreviewing
                    ? previewingBorderColor
                    : borderColor
                }
                margin={isContextMenuOpened || isPreviewing ? '-1px' : 0}
                rounded="lg"
                cursor={'pointer'}
                bg={bg}
                align="flex-start"
                w="full"
                transition="border-color 0.2s"
              >
                <BlockIcon type={block.type} mt=".25rem" />
                {typebot?.groups[indices.groupIndex].id && (
                  <BlockNodeContent
                    block={block}
                    indices={indices}
                    groupId={typebot.groups[indices.groupIndex].id}
                  />
                )}
                {(hasIcomingEdge || isDefined(connectingIds)) && (
                  <TargetEndpoint
                    pos="absolute"
                    left="-34px"
                    top="16px"
                    blockId={block.id}
                    groupId={groupId}
                  />
                )}
                {(isConnectable ||
                  (pathname.endsWith('analytics') && isInputBlock(block))) &&
                  hasDefaultConnector(block) &&
                  groupId &&
                  block.type !== LogicBlockType.JUMP && (
                    <BlockSourceEndpoint
                      source={{
                        blockId: block.id,
                      }}
                      groupId={groupId}
                      pos="absolute"
                      right="-34px"
                      bottom="10px"
                      isHidden={!isConnectable}
                    />
                  )}
              </HStack>
            </Flex>
          </PopoverTrigger>
          {hasSettingsPopover(block) && (
            <>
              <SettingsPopoverContent
                block={block}
                groupId={groupId}
                onExpandClick={handleExpandClick}
                onBlockChange={handleBlockUpdate}
              />
              <ParentModalProvider>
                <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
                  <BlockSettings
                    block={block}
                    groupId={groupId}
                    onBlockChange={handleBlockUpdate}
                  />
                </SettingsModal>
              </ParentModalProvider>
            </>
          )}
          {typebot && isMediaBubbleBlock(block) && (
            <MediaBubblePopoverContent
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                blockId: block.id,
              }}
              block={block}
              onContentChange={handleContentChange}
            />
          )}
        </Popover>
      )}
    </ContextMenu>
  )
}

const hasSettingsPopover = (block: BlockV6): block is BlockWithOptions =>
  !isBubbleBlock(block) && block.type !== LogicBlockType.CONDITION

const isMediaBubbleBlock = (
  block: BlockV6
): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block)
