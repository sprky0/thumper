# Thumper

This project is a pipe dream idea I had, to make an Arduino based 'guitar pedal' format box, which
allows the user to tap one or more beats to define a tempo, while also doing some more custom things like
repeatedly sending the midi START (reset) command -- specifically for controlling hardware sequencers.

My reason for wanting to do this is that entry of a dynamically changing BPM in a live setting, without
any sort of master clock can be infuriating and generally sucks.

So far there is nothing particularly good in here -- just a 10 minute proof of concept of how one might do
tap tempo -> BPM, in JS on a standalone HTML page

## Updates to myself

- Ported JS to C to make an arduino project thumper/ check it out
- MIDI library here https://github.com/FortySevenEffects/arduino_midi_library/
- Do we need a midi library?  is serial ok?  ok whatever etc
		- more research
		- need to debounce inputs and stuff
		- maybe have a rotary encoder for tempo
		- need a library for some LCD i bought
			- this one: https://www.amazon.com/gp/product/B078J6452J
			- maybe can use this library? https://github.com/avishorp/TM1637
