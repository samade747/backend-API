// Import required modules
import express from 'express'; // Importing Express.js framework
import multer from 'multer'; // Importing multer for handling file uploads
import { v2 as cloudinary } from 'cloudinary'; // Importing Cloudinary for cloud storage
import stream from 'stream'; // Importing stream module for streaming data
import fs from 'fs'; // Importing fs module for file system operations
import dotenv from 'dotenv'; // Importing dotenv for environment variables

// Create an Express application
const app = express();

// Load environment variables from .env file
dotenv.config();

// Use JSON middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Define the port number for the server to listen on
const PORT = process.env.PORT || 5000;

// Retrieve Cloudinary configuration from environment variables
const cloud_name = process.env.cloud_name;
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

// Configure Cloudinary using retrieved credentials
cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret
});

// Define storage configuration for multer to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination directory for uploaded files
        cb(null, 'tmp/my-uploads');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

// Create multer middleware with the defined storage configuration
const upload = multer({ storage: storage });

// Define a route for handling GET requests to the root endpoint
app.get('/', (req, res) => {
    // Send a simple response to indicate that the server is running
    res.send('Hello samad world');
});

// Define a route for handling POST requests to upload files
app.post('/api/upload', upload.single('55'), async (req, res) => {
    // Log information about the uploaded file
    console.log(req.file, "==>> yeh hai file");

    try {
        // Upload the file to Cloudinary asynchronously and get the result
        const cloudinaryUploadResult = await new Promise((resolve, reject) => {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(req.file.buffer);

            const streamm = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'uploadfiles'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            bufferStream.pipe(streamm);
        });

        // Log the Cloudinary upload result
        console.log(cloudinaryUploadResult, "==>> result");

        // Delete the uploaded file from the server after successful upload to Cloudinary
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('Deleted file:', req.file.path);
            }
        });

        // Send the Cloudinary upload result back to the client
        res.send(cloudinaryUploadResult);
    } catch (error) {
        // Handle errors that occur during file upload process
        console.error('Error uploading file to Cloudinary:', error);
        // Send an error response to the client
        res.status(500).send('Internal Server Error');
    }
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
