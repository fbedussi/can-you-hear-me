/*
AUDIO HANDLING
This part is partially copied from the TinyMusic example.
*/

// create the audio context
var ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext,
    // initialize some vars
    sequence1,
    sequence2,
    coinTake,
    die,
    jjump,
    s_dash,
    change_p,
    // create an array of "note strings" that can be passed to a sequence
    cc = [
        "E5 e",
        "E6 q"
    ],
    jj = [
        "E4 e",
        "E3 q"
    ],
    cp = [
        "B3 e",
        "D4b e",
        "D4 e",
        "E4 e"
    ],
    dd = [
        "E0 e",
        "F0 e",
        "E0 h",
    ],
    ee = [
        "E2 q",
        "E5 q"
    ],
    lead = [
        'D3  q',
        '-   h',
        'D3  q',
    
        'A2  q',
        '-   h',
        'A2  q',
    
        'A1b e',
        'B0 e',
        'E1 e',
        'D2 e',
        'D3 e',
        'A1 e',
        'D3 e',
    ],
    harmony = [
        '-   e',
        'D4  e',
        'C4  e',
        'D4  e',
        'Bb3 e',
        'C4  e',
        'A3  e',
        'Bb3 e',
    
        'G3  e',
        'A3  e',
        'Bb3 e',
        'A3  e',
        'G3  e',
        'A3  e',
        'F3  q',
    
        '-   e',
        'D4  s',
        'C4  s',
        'D4  e',
        'Bb3 e',
        'C4  e',
        'Bb3 e',
        'A3  e',
        'Bb3 e',
    
        'G3  e',
        'A3  e',
        'Bb3 e',
        'A3  e',
        'G3  s',
        'A3  s',
        'G3  e',
        'F3  q'

    ],

    // create 2 new sequences (one for lead, one for harmony)
    sequence1 = new TinyMusic.Sequence(ac, 100, lead);
sequence2 = new TinyMusic.Sequence(ac, 100, harmony);
coinTake = new TinyMusic.Sequence(ac, 100, cc);
coinTake.loop = false
coinTake.tempo = 300
coinTake.staccato = 0.55;

die = new TinyMusic.Sequence(ac, 100, dd);
die.loop = false
die.tempo = 300
die.staccato = 0.55;

jjump = new TinyMusic.Sequence(ac, 100, jj);
jjump.loop = false
jjump.tempo = 300
jjump.smoothing = 1;

s_dash = new TinyMusic.Sequence(ac, 100, ee);
s_dash.loop = false
s_dash.tempo = 300
s_dash.smoothing = 1;

change_p = new TinyMusic.Sequence(ac, 100, cp);
change_p.loop = false
change_p.tempo = 300

// set staccato values for maximum coolness
sequence1.staccato = 0.55;
sequence2.staccato = 0.55;

// adjust the levels
sequence1.gain.gain.value = 0.1;
sequence2.gain.gain.value = 0.05
coinTake.gain.gain.value = 0.1;
die.gain.gain.value = 0.2;
jjump.gain.gain.value = 0.1;
s_dash.gain.gain.value = 0.1;
change_p.gain.gain.value = 0.1;

/*
  Audio utilities
*/
function coinSound() {
    coinTake.play(ac.currentTime)
}

function dieSound() {
    die.play(ac.currentTime)
}

function jumpSound() {
    jjump.play(ac.currentTime)
}

function dashSound() {
    s_dash.play(ac.currentTime)
}

function soundChange() {
    change_p.play(ac.currentTime)
}

//call this to play the sequences at the desired speed
function playAt(speed) {
    sequence1.stop();
    sequence2.stop();
    sequence1.tempo = speed
    sequence2.tempo = speed
    sequence1.play(ac.currentTime);
    sequence2.play(ac.currentTime);
}

isMuted = false

function muteMusic() {
    if (isMuted == true) {
        sequence1.gain.gain.value = 0.1;
        sequence2.gain.gain.value = 0.05
        coinTake.gain.gain.value = 0.1;
        die.gain.gain.value = 0.2;
        jjump.gain.gain.value = 0.1;
        s_dash.gain.gain.value = 0.1;
        change_p.gain.gain.value = 0.1;
        isMuted = false
    } else {
        sequence1.gain.gain.value = 0
        sequence2.gain.gain.value = 0
        coinTake.gain.gain.value = 0
        die.gain.gain.value = 0
        jjump.gain.gain.value = 0
        s_dash.gain.gain.value = 0
        change_p.gain.gain.value = 0
        isMuted = true
    }


}