import {Router} from 'express'
import multer from 'multer'
import express from 'express'
import fs from 'fs'
import {logger} from '../../logger.ts'
import type {Document} from './entities/document.ts'

const UPLOAD_DIRECTORY = 'tmp'
const upload = multer({dest: UPLOAD_DIRECTORY})
export const documentsRoutes = Router()

documentsRoutes.use('/static', express.static(UPLOAD_DIRECTORY))

documentsRoutes.post('/documents', upload.array('files', 10), (req, res) => {
    const fullBaseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`
    logger.info(`Uploading files: ${req.files}`)

    // No files uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.')
    }
    // Return documents
    const documents = (req.files as Express.Multer.File[]).map<Document>(
        document => {
            return {
                originalName: document.originalname,
                filename: document.filename,
                size: document.size,
                mimetype: document.mimetype,
                url: `${fullBaseUrl}/static/${document.filename}`,
            }
        },
    )
    res.status(200).json({
        message: 'Upload success',
        status: 200,
        files: documents,
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
