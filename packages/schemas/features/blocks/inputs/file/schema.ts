import { z } from 'zod'
import { optionBaseSchema, blockBaseSchema } from '../../shared'
import { InputBlockType } from '../constants'

const fileInputOptionsV5Schema = optionBaseSchema.merge(
  z.object({
    isRequired: z.boolean().optional(),
    isMultipleAllowed: z.boolean().optional(),
    labels: z
      .object({
        placeholder: z.string().optional(),
        button: z.string().optional(),
        clear: z.string().optional(),
        skip: z.string().optional(),
      })
      .optional(),
    sizeLimit: z.number().optional(),
  })
)

const fileInputOptionsSchemas = {
  v5: fileInputOptionsV5Schema,
  v6: fileInputOptionsV5Schema.omit({
    sizeLimit: true,
  }),
} as const

const fileInputBlockV5Schema = blockBaseSchema.merge(
  z.object({
    type: z.literal(InputBlockType.FILE),
    options: fileInputOptionsSchemas.v5.optional(),
  })
)

export const fileInputBlockSchemas = {
  v5: fileInputBlockV5Schema,
  v6: fileInputBlockV5Schema.merge(
    z.object({
      options: fileInputOptionsSchemas.v6.optional(),
    })
  ),
}

const fileInputBlockSchema = z.union([
  fileInputBlockSchemas.v5,
  fileInputBlockSchemas.v6,
])

export type FileInputBlock = z.infer<typeof fileInputBlockSchema>
export type FileInputBlockV6 = z.infer<typeof fileInputBlockSchemas.v6>
