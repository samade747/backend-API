import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import fs from 'fs';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 5000;
const cloud_name = process.env.cloud_name;
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/my-uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send('Hello samad world');
});

app.post('/api/upload', upload.single('mern1'), async (req, res) => {
    try {
        // Check if req.file exists and if it has a non-empty buffer
        if (!req.file || req.file.size === 0) {
            throw new Error('No file uploaded or file is empty');
        }

        const result = await new Promise((resolve, reject) => {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(req.file.buffer);

            const streamm = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'my-uploads',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            bufferStream.pipe(streamm);
        });

        console.log(result, "==>> result");
        res.send(result);
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(400).send(error.message); // Sending 400 status for client-side error
    }
});