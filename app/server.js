'use strict';

const path    = require('path');
const express = require('express');
const app     = express();
const server  = require('http').Server(app);
const io      = require('socket.io')(server);
const port    = 8080;
const sockets = [];

const MAX_SECONDS = 70;
//const MAX_SECONDS = 1200; // 20min
let model         = {
	seconds : 0,
	state   : 'OFF'
};

const getPageModel = () => model;

const setState = state => {
	switch (state) {
		case 'OFF':
			model.seconds = 0;
			sendToAll('seconds', model.seconds);
			break;
	}
	
	model.state = state;
	
	sendToAll('state', model.state);
};

const tick = () => {
	if (model.state === 'RUNNING') {
		model.seconds++;
		
		if (model.seconds === MAX_SECONDS) {
			setState('END');
		}
		if (model.seconds === MAX_SECONDS - 60) {
			sendToAll('ending');
		}
		
		sendToAll('seconds', model.seconds);
	}
};

const sendToAll = (id, data) => {
	sockets.forEach(s => s.emit(id, data));
};

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

server.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/', (req, res) => res.render('index', getPageModel()));
app.get('/master', (req, res) => res.render('master', getPageModel()));
app.get('/admin', (req, res) => res.render('admin'));
app.get('*', (req, res) => res.redirect('/'));

setInterval(tick, 1000);

io.on('connection', socket => {
	sockets.push(socket);
	
	socket.on('state', state => setState(state));
});
