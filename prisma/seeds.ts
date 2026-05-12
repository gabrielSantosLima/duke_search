import 'dotenv/config'
import {Pool} from 'pg'
import {PrismaPg} from '@prisma/adapter-pg'
import {PrismaClient} from '../generated/prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'
import {pipeline} from '@huggingface/transformers'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

async function main() {
    const mockDir = './prisma/mock'
    const files = await fs.readdir(mockDir)
    const embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
    )

    for (const file of files) {
        if (file.endsWith('.md')) {
            const filePath = path.join(mockDir, file)
            const content = await fs.readFile(filePath, 'utf-8')
            let index = 0
            let isThereContent = index < content.length
            while (isThereContent) {
                const start = index * 500
                const end = start + 500
                const substring = content.slice(start, end)
                const output = await embedder(substring, {
                    pooling: 'mean',
                    normalize: true,
                })
                const embedding = `[${Array.from(output.data).join(',')}]`
                await prisma.$executeRaw`
                    INSERT INTO "document_knowledge" (content, embedding, source_name, page_number)
                    VALUES (${substring}, ${embedding}::vector, ${file}, 0)
                `
                isThereContent = end < content.length
                index++
            }
        }
    }
}
main()
    .then(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
    .catch(async e => {
        console.error(e)
        await prisma.$disconnect()
        await pool.end()
        process.exit(1)
    })
