(function(){

	// indicators
	var bpm = document.getElementById('bpm');
	var clockMessage = document.getElementById('clock-message');

	// interface
	var buttonTap = document.getElementById('tap');
	var buttonTapStart = document.getElementById('tap-start');
	var buttonStart = document.getElementById('start');
	var buttonStopContinue = document.getElementById('stop-continue');
	var timer = setInterval(interval,1);

	buttonTap.addEventListener('click', tap);
	buttonTapStart.addEventListener('click',tapStart);
	buttonStart.addEventListener('click',start);
	buttonStopContinue.addEventListener('click',stopContinue);

	var running = false;

	var _BPM = 120.0;
	var _MSB = (60 * 1000) / 120;

	var lastTick = 0; // 0-23 (24 ticks / beat)

	var thent = 0;
	var theni = 0;

	var partyPals = [];
	var maxPartyPals = 8;
	var displayState = false;
	var iter = 0;

	function interval() {

		if (!running)
			return;

		var now = new Date().getTime();
		var diff = now - theni;
		var _halfMSB = _MSB / 2;
		var _ppqnMS  = _MSB / 24;

		// handle display state

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
		var curTick = parseInt( diff / _ppqnMS );
		if (curTick !== lastTick) {
			clockMessage.innerHTML = curTick + "/24";
			_timecode();
			lastTick = curTick;
		}

	}

	function _updateDisplay() {
		bpm.innerHTML = _BPM.toFixed(2);
		buttonStopContinue.innerHTML = !running ? "CONTINUE" : "STOP";
	}

	function _timecode() {
		// send midi timecode message
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
		if (diff > (_MSB * 2)) {
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

	// force 'start' command start seq
	function _start() {

		buttonStopContinue.disabled = false;

		if (!running)
			running = true;

		theni = new Date().getTime();
	}

	function stopContinue(e) {
		running = !running;
		_updateDisplay();
	}

})();
