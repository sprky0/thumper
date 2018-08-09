# Thumper

This project is a pipe dream idea I had, to make an Arduino based 'guitar pedal' format box, which
allows the user to tap one or more beats to define a tempo, while also doing some more custom things like
repeatedly sending the midi START (reset) command -- specifically for controlling hardware sequencers.

My reason for wanting to do this is that entry of a dynamically changing BPM in a live setting, without
any sort of master clock can be infuriating and generally sucks.

So far there is nothing particularly good in here -- just a 10 minute proof of concept of how one might do
tap tempo -> BPM, in JS on a standalone HTML page
