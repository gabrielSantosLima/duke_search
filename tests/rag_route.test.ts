import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:3333'
const PAPER_PATH = path.join(__dirname, 'fixtures', 'attention_excerpt.txt')
const PAPER_NAME = 'attention_excerpt.txt'

interface UploadResponse {
    message: string
    status: number
    files: unknown[]
    dataset: {sourceName: string; chunks: number}[]
}

interface ChatResponse {
    answer: string
}

const waitForServer = async (timeoutMs = 60_000): Promise<void> => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${BASE_URL}/documents`)
            if (response.ok) {
                return
            }
        } catch {
            // server not ready yet
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    throw new Error(`API server not reachable at ${BASE_URL}.`)
}

describe('RAG route', () => {
    let upload: UploadResponse

    beforeAll(async () => {
        await waitForServer()

        const fileBuffer = fs.readFileSync(PAPER_PATH)
        const form = new FormData()
        form.append(
            'files',
            new Blob([fileBuffer], {type: 'text/plain'}),
            PAPER_NAME,
        )

        const response = await fetch(`${BASE_URL}/documents`, {
            method: 'POST',
            body: form,
        })

        expect(response.ok).toBe(true)
        upload = (await response.json()) as UploadResponse
    })

    it('uploads the paper as a document', () => {
        expect(upload.message).toBe('Upload success')
        expect(upload.files.length).toBeGreaterThan(0)
        expect(upload.dataset.length).toBeGreaterThan(0)
        const first = upload.dataset[0]
        expect(first?.sourceName).toBe(PAPER_NAME)
    })

    it('answers a question about the paper using RAG', async () => {
        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: {
                    content:
                        'What is the Transformer architecture? Explain self-attention.',
                },
            }),
        })

        expect(response.ok).toBe(true)
        const body = (await response.json()) as ChatResponse
        expect(typeof body.answer).toBe('string')
        expect(body.answer.length).toBeGreaterThan(0)
    }, 60_000)

    it(
        'lists registered files using the list_files skill',
        async () => {
            const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    message: {
                        content:
                            'What documents are available in the database? List them.',
                    },
                }),
            })

            expect(response.ok).toBe(true)
            const body = (await response.json()) as ChatResponse
            expect(typeof body.answer).toBe('string')
            expect(body.answer.length).toBeGreaterThan(0)
            expect(body.answer.toLowerCase()).toContain(
                PAPER_NAME.replace('.txt', '').toLowerCase(),
            )
        },
        60_000,
    )
})
