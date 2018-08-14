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
	var selectSubdivision = document.getElementById('subdivision-select');

	var timer = setInterval(interval,1);

	buttonReset.addEventListener('mousedown', reset);
	buttonTap.addEventListener('mousedown', tap);
	buttonTapStart.addEventListener('mousedown',tapStart);
	buttonStart.addEventListener('mousedown',start);
	buttonStopContinue.addEventListener('mousedown',stopContinue);
	selectSubdivision.addEventListener('change',changeSubdivision);

	var running = false;

	// Tapped BPM
	var _BPM = 120.0;

	// Tapped BPM
	var _MSB = (60 * 1000) / 120;

	// Number of ticks per quarter note (standard is 24, some synths may use 12 or 48)
	var TPQN = 24;

	// my understanding / assumptinon about midi clock is that it doesn't really know about time sigs.  it's 24 ticket per 1/4 note a gogo forever ? maybe?]
	// based on that assumption, we can assign a multiplier to the tap duration and figure out what a 1/4 length is relative to that:

	// var TAPMULT = 0.5; // 0.5 = user is tapping 1/8 notes, maybe music is a halftime feel?  or 7/8 or 3/8 or something
	var TAPMULT = 1; // 1 = user is tapping 1/4 notes
	// var TAPMULT = 1.5; // 1 = user is tapping dotted 1/4 notes, eg: 12/8 or 6/8 time
	// @todo implement this







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
		var _ppqnMS  = _MSB / TPQN; // MS per 1/Nth quarternote tick

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

	function changeSubdivision(e) {
		TAPMULT = parseFloat(e.srcElement.value);
	}

	// messages:
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

	// tap start button
	function tapStart(e) {
		_tap();
		_start();
		_updateDisplay();
	}

	// press button start
	function start(e) {
		_start();
		_updateDisplay();
	}

	function stopContinue(e) {
		_stopContinue();
		_updateDisplay();
	}

	function reset(e) {
		// _reset();

		partyPals = [];
		thent = false;

		_updateDisplay();
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

		// 1-1 = 1/4 note tap 1/1.5 = tapping a dotted quarter. .. i think maybe
		avg = avg * (1 / TAPMULT);

		console.log(avg);
		console.log(partyPals);

		_BPM = (60 * 1000) / avg;
		_MSB = avg;

		console.log(_MSB);
		console.log(_BPM);

		thent = now;

	}

	function _updateDisplay() {
		bpm.innerHTML = _BPM.toFixed(2);
		buttonStopContinue.innerHTML = !running ? "CONTINUE" : "STOP";
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
