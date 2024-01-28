import { router } from '@/helpers/server/trpc'
import { createCredentials } from './createCredentials'
import { deleteCredentials } from './deleteCredentials'
import { listCredentials } from './listCredentials'

export const forgedCredentialsRouter = router({
  createCredentials,
  listCredentials,
  deleteCredentials,
})
