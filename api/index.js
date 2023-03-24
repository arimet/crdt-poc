const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const pkg = require('body-parser');


const { raw } = pkg;

let app = express();
var options = {
    inflate: true,
    limit: '100kb',
    type: 'application/octet-stream',
};
app.use(raw(options));

try {
    fs.mkdirSync(path.join(__dirname, 'data'));
} catch (err) {
    if (err.code !== 'EEXIST') {
        console.error(err);
    }
}

app.use(cors());

app.get('/:id', (req, res) => {
    let id = req.params.id;
    let filename = path.join(__dirname, 'data', id);
    fs.stat(filename, (err, stats) => {
        if (err) {
            console.error(err);
            console.error(stats);
            res.status(404).send('Not found');
        } else {
            res.sendFile(filename);
            console.log('GET File OK');
        }
    });
});

app.post('/:id', (req, res) => {
    let id = req.params.id;
    fs.writeFileSync(path.join(__dirname, 'data', id), req.body);
    res.status(200).send('POST FILE OK');
});

const port = 5000;

app.listen(5000, () => {
    console.log('listening on http://localhost:' + port);
});
