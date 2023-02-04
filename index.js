const express = require('express');
const fs = require('fs');
const app = express();

if(!fs.existsSync(__dirname + '/videos'))
    fs.mkdirSync(__dirname + '/videos');

app.get('/', (req, res) => {
    res.send('200 OK');
})

app.get('/stream/:id/vid.mp4', (req, res) => {
    let path = 'videos/'+req.params.id+'.mp4';

    fs.stat(path, (err, stat) => {
        if(err !== null && err.code === 'ENOENT')
            return res.sendStatus(404);

        let fileSize = stat.size
        let range = req.headers.range

        if(range){
            let parts = range.replace(/bytes=/, "").split("-");
            let start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
            let chunksize = (end-start)+1;
            let file = fs.createReadStream(path, {start, end});
            let head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            
            res.writeHead(206, head);
            file.pipe(res);
        } else{
            let head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        }
    });
})

app.listen(162)