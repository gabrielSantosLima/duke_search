import {FunctionTool} from '@google/adk'
import {z} from 'zod'
import {ListRegisteredFilesUseCase} from '../../document/features/list_registered_files_use_case.ts'
import {PrismaClient} from '../../../../generated/prisma/client.ts'
import {PrismaPg} from '@prisma/adapter-pg'
import {Pool} from 'pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})
const listFilesUseCase = new ListRegisteredFilesUseCase(prisma)

export const listFilesTool = new FunctionTool({
    name: 'list_files',
    description:
        'Lists all registered files in the database with their filename and chunk count.',
    parameters: z.object({}),
    execute: async () => {
        const files = await listFilesUseCase.execute()
        return {files}
    },
})
