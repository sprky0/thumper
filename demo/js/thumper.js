(function(){

	// indicators
	var bpm = document.getElementById('bpm');
	var clockMessage = document.getElementById('clock-message');

	// interface
	var buttonTap = document.getElementById('tap');
	var buttonTapStart = document.getElementById('tap-start');
	var buttonStart = document.getElementById('start');
	var buttonStopContinue = document.getElementById('stop-continue');
	var buttonReset = document.getElementById('reset');

	var timer = setInterval(interval,1);


	buttonReset.addEventListener('mousedown', reset);
	buttonTap.addEventListener('mousedown', tap);
	buttonTapStart.addEventListener('mousedown',tapStart);
	buttonStart.addEventListener('mousedown',start);
	buttonStopContinue.addEventListener('mousedown',stopContinue);

	var running = false;

	var _BPM = 120.0;
	var _MSB = (60 * 1000) / 120;

	var curTick = 0;
	var lastTick = 0; // 0-23 (24 ticks / beat)

	var thent = 0;
	var theni = 0;

	var partyPals = [];
	var maxPartyPals = 4;
	var displayState = false;
	var iter = 0;

	function interval() {

		if (!running)
			return;

		var now = new Date().getTime();
		var diff = now - theni;
		var _halfMSB = _MSB / 2;
		var _ppqnMS  = _MSB / 24; // MS per 1/24th quarternote tick

		// handle display state

		//
		if (diff < _halfMSB && displayState == false) {
			displayState = true;
			bpm.classList.remove('off')
			bpm.classList.add('on')
		}

		if (diff > _halfMSB && displayState == true) {
			displayState = false;
			bpm.classList.add('off');
			bpm.classList.remove('on');
		}

		if (diff >= _MSB) {
			displayState = true;
			theni = now;
			bpm.classList.add('on');
			bpm.classList.remove('off');
			iter++;
		}

		// if a ticks worth of time has elapsed, send the next timecode message
		curTick = parseInt( diff / _ppqnMS );
		if (curTick !== lastTick) {
			_timecode();
			lastTick = curTick;
		}

	}

	function _updateDisplay() {
		bpm.innerHTML = _BPM.toFixed(2);
		buttonStopContinue.innerHTML = !running ? "CONTINUE" : "STOP";
	}

	// messages:
	// start
	// stop
	// continue

	/*
		clock (decimal 248, hex 0xF8)
		start (decimal 250, hex 0xFA)
		continue (decimal 251, hex 0xFB)
		stop (decimal 252, hex 0xFC)
	*/

	// tap button
	function tap(e) {
		_updateDisplay();
		_tap();
	}

	// tap 'event' (from any tempo tapping button)
	function _tap() {

		var now = new Date().getTime();

		// if we never tapped before, we need a start
		if (!thent) {
			partyPals = [];
			thent = now;
			return;
		}

		var diff = now - thent;

		// if we waited too long, our data is crap, GTFO / start over
		if (diff > (_MSB * 6)) {
			partyPals = [];
			thent = now;
			return;
		}

		partyPals.push(diff);

		while (partyPals.length > maxPartyPals) {
			partyPals.shift();
		}

		var avg = 0;

		for(var i = 0; i < partyPals.length; i++) {
			avg += partyPals[i];
		}

		avg = avg / partyPals.length;

		console.log(avg);
		console.log(partyPals);

		_BPM = (60 * 1000) / avg;
		_MSB = avg;

		console.log(_MSB);
		console.log(_BPM);

		thent = now;

	}

	// tap start button
	function tapStart() {
		_tap();
		_start();
		_updateDisplay();
	}

	// press button start
	function start() {
		_start();
		_updateDisplay();
	}

	function stopContinue(e) {
		_stopContinue();
		_updateDisplay();
	}

	function reset() {
		// _reset();

		partyPals = [];
		thent = false;

		_updateDisplay();
	}


	function _stopContinue() {

		running = !running;

		// MIDI HERE:
		// if (!running) MIDI :: send continue (decimal 251, hex 0xFB)
		// else if (running) MIDI :: send stop (decimal 252, hex 0xFC)
	}


	// force 'start' command start seq
	function _start() {

		buttonStopContinue.disabled = false;

		if (!running)
			running = true;

		theni = new Date().getTime();

		// MIDI HERE:
		// MIDI :: send start (decimal 250, hex 0xFA)
	}

	function _timecode() {

		// MIDI HERE:
		// MIDI :: send clock (decimal 248, hex 0xF8)

		clockMessage.innerHTML = ((curTick+"").length < 2 ? '0' : '') + curTick + "/24";
	}


})();
