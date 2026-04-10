const path = require('path');

const express = require('express');

const app = express();
const rootDir = path.resolve(__dirname, '..');

app.use('/node_modules', express.static(path.join(rootDir, 'node_modules')));
app.use('/static', express.static(path.join(rootDir, 'static')));
app.use('/playground', express.static(path.join(rootDir, 'playground')));

app.get('/', (_req, res) => {
	res.redirect('/playground/');
});

const port = Number(process.env.PLAYGROUND_PORT || 3100);

app.listen(port, () => {
	console.log(`Playground running at http://localhost:${port}/playground/`);
});
