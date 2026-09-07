import {Router} from 'express'
import multer from 'multer'
import express from 'express'
import fs from 'fs'
import path from 'path'
import {Pool} from 'pg'
import {PrismaPg} from '@prisma/adapter-pg'
import {PrismaClient} from '../../../generated/prisma/client.ts'
import {logger} from '../../logger.ts'
import type {Document} from './entities/document.ts'
import {GenerateEmbeddingUseCase} from '../chat/features/generate_embedding_use_case.ts'
import {RegisterDocumentInDatasetUseCase} from './features/register_document_in_dataset_use_case.ts'

const UPLOAD_DIRECTORY = 'tmp'
const ALLOWED_EXTENSIONS = new Set(['.md', '.markdown', '.txt'])
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({connectionString})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})
const registerDocumentInDatasetUseCase = new RegisterDocumentInDatasetUseCase(
    prisma,
    new GenerateEmbeddingUseCase(),
)
const upload = multer({
    dest: UPLOAD_DIRECTORY,
    fileFilter: (_, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase()

        if (ALLOWED_EXTENSIONS.has(extension)) {
            return callback(null, true)
        }

        return callback(
            new Error('Only Markdown and plain text files are allowed.'),
        )
    },
})
export const documentsRoutes = Router()

documentsRoutes.use('/static', express.static(UPLOAD_DIRECTORY))

documentsRoutes.post('/documents', (req, res) => {
    upload.array('files', 10)(req, res, async error => {
        if (error) {
            logger.warn(`Document upload rejected: ${error}`)

            return res.status(400).json({
                message: 'Only Markdown and plain text files are allowed.',
                allowedExtensions: Array.from(ALLOWED_EXTENSIONS),
            })
        }

        const fullBaseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`
        logger.info(`Uploading files: ${req.files}`)

        // No files uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files were uploaded.')
        }

        const files = req.files as Express.Multer.File[]

        try {
            const dataset = await registerDocumentInDatasetUseCase.execute(
                files.map(file => ({
                    path: file.path,
                    sourceName: file.originalname,
                    localFilename: file.filename,
                })),
            )

            // Return documents
            const documents = files.map<Document>(document => {
                return {
                    originalName: document.originalname,
                    filename: document.filename,
                    size: document.size,
                    mimetype: document.mimetype,
                    url: `${fullBaseUrl}/static/${document.filename}`,
                }
            })

            return res.status(200).json({
                message: 'Upload success',
                status: 200,
                files: documents,
                dataset,
            })
        } catch (error) {
            logger.error(`Failed to register uploaded documents: ${error}`)

            return res.status(500).json({
                message:
                    'Upload failed while registering documents in dataset.',
            })
        }
    })
})

documentsRoutes.get('/documents', (_, resp) => {
    fs.readdir(UPLOAD_DIRECTORY, (err, files) => {
        if (err) {
            return resp.status(500).send({message: 'Unable to scan files'})
        }
        // Return the array of file names
        resp.json({files: files})
    })
})
