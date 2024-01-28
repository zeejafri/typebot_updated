import { createBlock } from '@typebot.io/forge'
import { MessengerLogo } from './logo'
import { auth } from './auth'
import { messengerBaseOptions } from './baseOptions'
import { sendMessageToMessenger } from './actions/sendMessage'

export const messenger = createBlock({
  id: 'messenger',
  name: 'Messenger',
  tags: [],
  LightLogo: MessengerLogo,
  auth,
  options: messengerBaseOptions,
  actions: [sendMessageToMessenger],
})
