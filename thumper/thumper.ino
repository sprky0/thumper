
	// this = our loop
	/*
	var timer = setInterval(interval,1);

	/*
	buttonReset.addEventListener('mousedown', reset);
	buttonTap.addEventListener('mousedown', tap);
	buttonTapStart.addEventListener('mousedown',tapStart);
	buttonStart.addEventListener('mousedown',start);
	buttonStopContinue.addEventListener('mousedown',stopContinue);
	selectSubdivision.addEventListener('change',changeSubdivision);
	*/

boolean running = false;

// Tapped BPM
float _BPM = 120.0;

// Tapped BPM
int _MSB = (60 * 1000) / 120;

// Number of ticks per quarter note (standard is 24, some synths may use 12 or 48)
int TPQN = 24;

// my understanding / assumptinon about midi clock is that it doesn't really know about time sigs.  it's 24 ticket per 1/4 note a gogo forever ? maybe?]
// based on that assumption, we can assign a multiplier to the tap duration and figure out what a 1/4 length is relative to that:

// var TAPMULT = 0.5; // 0.5 = user is tapping 1/8 notes, maybe music is a halftime feel?  or 7/8 or 3/8 or something
float TAPMULT = 1; // 1 = user is tapping 1/4 notes
// var TAPMULT = 1.5; // 1 = user is tapping dotted 1/4 notes, eg: 12/8 or 6/8 time
// @todo implement this

int curTick = 0;
int lastTick = 0; // 0-23 (24 ticks / beat)

long thent = 0;
long theni = 0;

int partyPals[4];
int maxPartyPals = 4;
int curPartyPal = 0; // i think we need an interator type thing for array ^
boolean displayState = false;

void setup() {

	// this sets the default BPM etc
	reset();

}

void loop() {
}

void interval() {

	if (!running)
		return;

	long now = millis();
	long diff = now - theni;
	int _halfMSB = _MSB / 2;
	int _ppqnMS  = _MSB / TPQN; // MS per 1/Nth quarternote tick

	// handle display state

	//
	if (diff < _halfMSB && displayState == false) {
		displayState = true;
		// bpm.classList.remove('off')
		// bpm.classList.add('on')
	}

	if (diff > _halfMSB && displayState == true) {
		displayState = false;
		// bpm.classList.add('off');
		// bpm.classList.remove('on');
	}

	if (diff >= _MSB) {
		displayState = true;
		theni = now;
		// bpm.classList.add('on');
		// bpm.classList.remove('off');
	}

	// if a ticks worth of time has elapsed, send the next timecode message
	curTick = (int) diff / _ppqnMS;
	if (curTick != lastTick) {
		_timecode();
		lastTick = curTick;
	}

}

void changeSubdivision() {
	// do something
	// TAPMULT = parseFloat(e.srcElement.value);
}

// messages:
/*
	clock (decimal 248, hex 0xF8)
	start (decimal 250, hex 0xFA)
	continue (decimal 251, hex 0xFB)
	stop (decimal 252, hex 0xFC)
*/

// tap button
void tap() {
	_updateDisplay();
	_tap();
}

// tap start button
void tapStart() {
	_tap();
	_start();
	_updateDisplay();
}

// press button start
void start() {
	_start();
	_updateDisplay();
}

void stopContinue() {
	_stopContinue();
	_updateDisplay();
}

void reset() {

	for (int i = 0; i < maxPartyPals; i++) {
		partyPals[i] = 0;
	}

	thent = 0;

	_updateDisplay();

}

// tap 'event' (from any tempo tapping button)
void _tap() {

	long now = millis();

	// if we never tapped before, we need a start
	if (thent == 0) {
		reset();
		thent = now;
		return;
	}

	long diff = now - thent;

	// if we waited too long, our data is crap, GTFO / start over
	if (diff > (_MSB * 6)) {
		reset();
		thent = now;
		return;
	}

	partyPals[curPartyPal] = diff;
	curPartyPal++;

	// if we are outside the thing we loop and overwrite the earlier puppies
	if (curPartyPal >= maxPartyPals) {
		curPartyPal = 0;
	}

	int avg = 0;
	int avgCount = 0;

	for(int i = 0; i < maxPartyPals; i++) {
		if (partyPals[i] > 0) {
			avg += partyPals[i];
			avgCount++;
		}
	}

	avg = avg / avgCount;

	// 1-1 = 1/4 note tap 1/1.5 = tapping a dotted quarter. .. i think maybe
	avg = avg * (1 / TAPMULT);

	_BPM = (60 * 1000) / avg;
	_MSB = avg;

	thent = now;

}

void _updateDisplay() {
	// bpm.innerHTML = _BPM.toFixed(2);
	// buttonStopContinue.innerHTML = !running ? "CONTINUE" : "STOP";
}

void _stopContinue() {

	running = !running;

	// MIDI HERE:
	// if (!running) MIDI :: send continue (decimal 251, hex 0xFB)
	// else if (running) MIDI :: send stop (decimal 252, hex 0xFC)
	int message = running ? 0xFC : 0xFB;
	_sendMessage(message);

}


// force 'start' command start seq
void _start() {

	// buttonStopContinue.disabled = false;

	if (!running)
		running = true;

	theni = millis();

	// MIDI HERE:
	// MIDI :: send start (decimal 250, hex 0xFA)
	_sendMessage(0xFA);

}

void _timecode() {

	// MIDI HERE:
	// MIDI :: send clock (decimal 248, hex 0xF8)
	_sendMessage(0xF8);

	// clockMessage.innerHTML = ((curTick+"").length < 2 ? '0' : '') + curTick + "/24";
}

/**
 * In actual implementation, serial write to the output pin, for now just log
 */
void _sendMessage(int message) {
	// serial.write(message); ??
}
