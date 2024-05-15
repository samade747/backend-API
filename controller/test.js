import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream'
import fs from 'fs'


cloudinary.config({
    cloud_name: 'dsyxipnmh',
    api_key: '162236837726177',
    api_secret: '3dYb2weXz9LCZSRMghuCHfCQ-yc'
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/my-uploads')
    },
    filename: function (req, file, cb) {
        // console.log(file, "===>> file")
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

// const storage = multer.memoryStorage() //memory main store kareyga

const upload = multer({ storage: storage })

// const upload = multer({ dest: './public/data/uploads/' })

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})
app.post('/', upload.single('profile'), async (req, res) => {
    // console.log(req.body, "==>> yeh hai body")
    console.log(req.file, "==>> yeh hai file")


    // const result = await new Promise((resolve, reject) => {
    //     const bufferStream = new stream.PassThrough();
    //     bufferStream.end(req.file.buffer);

    //     const streamm = cloudinary.uploader.upload_stream(
    //         {
    //             resource_type: 'auto',
    //             folder: 'haroonPicture',
    //         },
    //         (error, result) => {
    //             if (error) reject(error);
    //             else resolve(result);
    //         }
    //     );

    //     // Pipe the bufferStream into the cloudinary upload stream
    //     bufferStream.pipe(streamm);
    // });

    // console.log(result, "==>> result")

    // res.send(result)




    //cloudinary ya kisi bhi cloud per file transfer

    cloudinary.uploader.upload(req.file.path,
        { public_id: req.file.filename },
        function (error, result) {
            console.log(result, "===>>> result")
            console.log(error, "===>> error")
            fs.unlink(req.file.path,
                (err => {
                    if (err) console.log(err);
                    else {
                        console.log("\nDeleted file: example_file.txt");

                        // Get the files in current directory
                        // after deletion
                        // getFilesInDirectory();
                    }
                }));

            res.send(result)
        });



    //file delete from server
    // res.send('main hun post ki api')
})
app.get('/about', (req, res) => {
    res.send('Hello About')
})

app.listen('3000', () => {
    console.log('Haan bhaee server chal raha hai 3000')
})