(function () {
	'use strict';
	
	let state;
	
	const socket   = io.connect(location.origin);
	const timeElm  = document.getElementById('time');
	const audioElm = document.getElementById('audio');
	const resetBtn = document.getElementById('reset');
	const pauseBtn = document.getElementById('pause');
	const playBtn  = document.getElementById('play');
	let model      = {};
	
	document.body.onclick = () => {
		let d   = document;
		let dd  = d.documentElement;
		let rfs = dd.requestFullscreen || dd.webkitRequestFullScreen || dd.mozRequestFullScreen || dd.msRequestFullscreen;
		let efs = d.exitFullscreen || d.webkitExitFullScreen || d.mozExitFullScreen || d.msExitFullscreen;
		let fe  = d.fullscreenElement || d.webkitFullscreenElement || d.mozFullscreenElement || d.msFullscreenElement;
		
		if (!fe) {
			rfs();
		} else {
			if (efs) {
				efs();
			}
		}
	};
	
	const updateTime = seconds => {
		seconds       = seconds || 0;
		model.seconds = seconds;
		
		let minutes = Math.floor(seconds / 60);
		seconds     = seconds - minutes * 60;
		
		timeElm.innerHTML = `${pad(minutes)}:${pad(seconds)}`;
	};
	
	const audioPlay  = url => {
		if (audioElm) {
			audioElm.src = url;
			audioElm.play();
		}
	};
	const audioStop  = () => {
		if (audioElm) {
			audioElm.pause();
		}
	};
	const pad        = (str, size) => `0${str}`.substr(-2);
	const setSeconds = seconds => updateTime(seconds);
	const onReset    = evt => socket.emit('state', 'OFF');
	const onPause    = evt => socket.emit('state', 'PAUSED');
	const onPlay     = evt => socket.emit('state', 'RUNNING');
	const setState   = state => {
		switch (state) {
			case 'RUNNING':
				if (model.seconds === 0) {
					audioPlay('sounds/start.ogg');
				}
				break;
			case 'END':
				audioPlay('sounds/end.ogg');
				break;
			case 'OFF':
				audioStop();
				break;
		}
		model.state = state;
	};
	const onEnding   = () => {
		audioPlay('sounds/ending.ogg');
	};
	
	socket.on('state', s => setState(s));
	socket.on('seconds', s => setSeconds(s));
	socket.on('ending', () => onEnding());
	
	if (resetBtn) {
		resetBtn.onclick = onReset;
	}
	if (pauseBtn) {
		pauseBtn.onclick = onPause;
	}
	if (playBtn) {
		playBtn.onclick = onPlay;
	}
	
	updateTime(parseInt(timeElm.innerHTML));
}());
