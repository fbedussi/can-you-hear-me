/*
AUDIO HANDLING
This part is partially copied from the TinyMusic example.
*/

// create the audio context
var ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext,
    // initialize some vars
    sequenceIntro,
    sequence1,
    sequence2,
    sequence3,
    tempo = 136,
    coinTake,
    s_dash,
    // create an array of "note strings" that can be passed to a sequence
    cc = [
        "E5 e",
        "E6 q"
    ],
    lu = [
        "E4 e",
        "E3 q"
    ],
    ee = [
        "E2 q",
        "E5 q"
    ],
    introLoop = [
        '-   e',
        'G4  e',
        'C4  e',
        'F4  e',
        '-   e',
        'F4  e',
        'G4  e',
        'C4  e',
        
        '-   e',
        'C5  e',
        'F4  e',
        'G4  e',
        '-   e',
        'F4  e',
        'C5  e',
        'F4  e',
    ],
    lead = [
        '-   e',
        'G4  e',
        'C4  e',
        'F4  e',
        '-   e',
        'F4  e',
        'G4  e',
        'C4  e',
        
        '-   e',
        'C5  e',
        'F4  e',
        'G4  e',
        '-   e',
        'F4  e',
        'C5  e',
        'F4  e',

        '-   e',
        'F4  e',
        'G4  e',
        'F4  e',
        '-   e',
        'E4  e',
        'C4  e',
        'C4  e',
        
        '-   e',
        'E4 e',
        'F4  e',
        'C4  e',
        '-   e',
        'F4  e',
        'G4  e',
        'F4  e'
    ],
    harmony = [
        'C5  e',
        '-   e',
        'G5  e',
        '-   e',
        'F5  e',
        '-   e',
        'C5  e',
        '-   e',
      
        'F5  e',
        '-   e',
        'C5  e',
        '-   e',
        'G5  e',
        '-   e',
        'F5  e',
        '-   e',

        'E5  e',
        '-   e',
        'G5  e',
        '-   e',
        'C6  e',
        '-   e',
        'F5  e',
        '-   e',
      
        'A5  e',
        '-   e',
        'C5  e',
        '-   e',
        'G5  e',
        '-   e',
        'F5  e',
        '-   e'
      ],
      bass = [
        'C3  e',
        'F2  q',
        '-   e',
      
        'G2  e',
        'F2  q',
        '-   e',
        
        'F2  e',
        'C3  q',
        '-   e',
      
        'C3  e',
        'F2  q',
        '-   e',

        'A2  e',
        'F2  q',
        '-   e',
      
        'C3  e',
        'E2  q',
        '-   e',
        
        'G2  e',
        'F2  q',
        '-   e',
      
        'A2  e',
        'F2  q',
        '-   e'
      ];

// create 2 new sequences (one for lead, one for harmony)
sequenceIntro = new TinyMusic.Sequence(ac, tempo, introLoop);
sequence1 = new TinyMusic.Sequence(ac, tempo, lead);
sequence2 = new TinyMusic.Sequence(ac, tempo, harmony);
sequence3 = new TinyMusic.Sequence( ac, tempo, bass );

coinTake = new TinyMusic.Sequence(ac, 100, cc);
coinTake.loop = false
coinTake.tempo = 300
coinTake.staccato = 0.55;

levelUp = new TinyMusic.Sequence(ac, 100, lu);
levelUp.loop = false
levelUp.tempo = 300
levelUp.staccato = 0.55;

s_dash = new TinyMusic.Sequence(ac, 100, ee);
s_dash.loop = false
s_dash.tempo = 300
s_dash.smoothing = 1;

// set staccato values for maximum coolness
sequenceIntro.staccato = 0.3;
sequence1.staccato = 0.3;
sequence2.staccato = 0.1;
sequence3.staccato = 0.5;

// adjust the levels
setLevels();

/*
  Audio utilities
*/
function coinSound() {
    coinTake.play(ac.currentTime)
}

function levelUpSound() {
    levelUp.play(ac.currentTime)
}

function dashSound() {
    s_dash.play(ac.currentTime)
}

//call this to play the sequences at the desired speed
function playIntro() {
    sequenceIntro.stop();
    sequenceIntro.play(ac.currentTime);
}

function playMainTheme() {
    var now = ac.currentTime;
    sequenceIntro.stop();
    sequence1.stop();
    sequence2.stop();
    sequence3.stop();
    sequence1.play( now );
    sequence2.play( now );
    sequence3.play( now );
}

function setLevels() {
    sequenceIntro.gain.gain.value = 0.2;
    sequence1.gain.gain.value = 0.2;
    sequence2.gain.gain.value = 0.2;
    sequence3.gain.gain.value = 0.15;
    coinTake.gain.gain.value = 0.3;
    levelUp.gain.gain.value = 0.3;
    s_dash.gain.gain.value = 0.3;
    isMuted = false
}

function muteSound() {
    sequenceIntro.gain.gain.value = 0;
    sequence1.gain.gain.value = 0;
    sequence2.gain.gain.value = 0;
    sequence3.gain.gain.value = 0;
    coinTake.gain.gain.value = 0;
    levelUp.gain.gain.value = 0;
    s_dash.gain.gain.value = 0;

    isMuted = true;
}

