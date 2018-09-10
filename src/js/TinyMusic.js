(function(exports) {
    /*
     * Private stuffz
     */

    var enharmonics = 'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb',
        middleC = 440 * Math.pow(Math.pow(2, 1 / 12), -9),
        numeric = /^[0-9.]+$/,
        octaveOffset = 4,
        space = /\s+/,
        num = /(\d+)/,
        offsets = {};

    // populate the offset lookup (note distance from C, in semitones)
    enharmonics.split('|').forEach(function(val, i) {
        val.split('-').forEach(function(note) {
            offsets[note] = i;
        });
    });

    /*
     * Note class
     *
     * new Note ('A4 q') === 440Hz, quarter note
     * new Note ('- e') === 0Hz (basically a rest), eigth note
     * new Note ('A4 es') === 440Hz, dotted eighth note (eighth + sixteenth)
     * new Note ('A4 0.0125') === 440Hz, 32nd note (or any arbitrary
     * divisor/multiple of 1 beat)
     *
     */

    // create a new Note instance from a string
    function Note(str) {
        var couple = str.split(space);
        // frequency, in Hz
        this.frequency = Note.getFrequency(couple[0]) || 0;
        // duration, as a ratio of 1 beat (quarter note = 1, half note = 0.5, etc.)
        this.duration = Note.getDuration(couple[1]) || 0;
    }

    // convert a note name (e.g. 'A4') to a frequency (e.g. 440.00)
    Note.getFrequency = function(name) {
        var couple = name.split(num),
            distance = offsets[couple[0]],
            octaveDiff = (couple[1] || octaveOffset) - octaveOffset,
            freq = middleC * Math.pow(Math.pow(2, 1 / 12), distance);
        return freq * Math.pow(2, octaveDiff);
    };

    // convert a duration string (e.g. 'q') to a number (e.g. 1)
    // also accepts numeric strings (e.g '0.125')
    // and compund durations (e.g. 'es' for dotted-eight or eighth plus sixteenth)
    Note.getDuration = function(symbol) {
        return numeric.test(symbol) ? parseFloat(symbol) :
            symbol.toLowerCase().split('').reduce(function(prev, curr) {
                return prev + (curr === 'w' ? 4 : curr === 'h' ? 2 :
                    curr === 'q' ? 1 : curr === 'e' ? 0.5 :
                    curr === 's' ? 0.25 : 0);
            }, 0);
    };

    /*
     * Sequence class
     */

    // create a new Sequence
    function Sequence(ac, tempo, arr) {
        this.ac = ac || new AudioContext();
        this.createFxNodes();
        this.tempo = tempo || 120;
        this.loop = true;
        this.smoothing = 0;
        this.staccato = 0;
        this.notes = [];
        this.push.apply(this, arr || []);
    }

    // create gain and EQ nodes, then connect 'em
    Sequence.prototype.createFxNodes = function() {
        var eq = [
                ['bass', 100],
                ['mid', 1000],
                ['treble', 2500]
            ],
            prev = this.gain = this.ac.createGain();
        eq.forEach(function(config, filter) {
            filter = this[config[0]] = this.ac.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = config[1];
            prev.connect(prev = filter);
        }.bind(this));
        prev.connect(this.ac.destination);
        return this;
    };

    // accepts Note instances or strings (e.g. 'A4 e')
    Sequence.prototype.push = function() {
        Array.prototype.forEach.call(arguments, function(note) {
            this.notes.push(note instanceof Note ? note : new Note(note));
        }.bind(this));
        return this;
    };

    // create a custom waveform as opposed to "sawtooth", "triangle", etc
    Sequence.prototype.createCustomWave = function(real, imag) {
        // Allow user to specify only one array and dupe it for imag.
        if (!imag) {
            imag = real;
        }

        // Wave type must be custom to apply period wave.
        this.waveType = 'custom';

        // Reset customWave
        this.customWave = [new Float32Array(real), new Float32Array(imag)];
    };

    // recreate the oscillator node (happens on every play)
    Sequence.prototype.createOscillator = function() {
        this.stop();
        this.osc = this.ac.createOscillator();

        // customWave should be an array of Float32Arrays. The more elements in
        // each Float32Array, the dirtier (saw-like) the wave is
        if (this.customWave) {
            this.osc.setPeriodicWave(
                this.ac.createPeriodicWave.apply(this.ac, this.customWave)
            );
        } else {
            this.osc.type = this.waveType || 'square';
        }

        this.osc.connect(this.gain);
        return this;
    };

    // schedules this.notes[ index ] to play at the given time
    // returns an AudioContext timestamp of when the note will *end*
    Sequence.prototype.scheduleNote = function(index, when) {
        var duration = 60 / this.tempo * this.notes[index].duration,
            cutoff = duration * (1 - (this.staccato || 0));

        this.setFrequency(this.notes[index].frequency, when);

        if (this.smoothing && this.notes[index].frequency) {
            this.slide(index, when, cutoff);
        }

        this.setFrequency(0, when + cutoff);
        return when + duration;
    };

    // get the next note
    Sequence.prototype.getNextNote = function(index) {
        return this.notes[index < this.notes.length - 1 ? index + 1 : 0];
    };

    // how long do we wait before beginning the slide? (in seconds)
    Sequence.prototype.getSlideStartDelay = function(duration) {
        return duration - Math.min(duration, 60 / this.tempo * this.smoothing);
    };

    // slide the note at <index> into the next note at the given time,
    // and apply staccato effect if needed
    Sequence.prototype.slide = function(index, when, cutoff) {
        var next = this.getNextNote(index),
            start = this.getSlideStartDelay(cutoff);
        this.setFrequency(this.notes[index].frequency, when + start);
        this.rampFrequency(next.frequency, when + cutoff);
        return this;
    };

    // set frequency at time
    Sequence.prototype.setFrequency = function(freq, when) {
        this.osc.frequency.setValueAtTime(freq, when);
        return this;
    };

    // ramp to frequency at time
    Sequence.prototype.rampFrequency = function(freq, when) {
        this.osc.frequency.linearRampToValueAtTime(freq, when);
        return this;
    };

    // run through all notes in the sequence and schedule them
    Sequence.prototype.play = function(when) {
        when = typeof when === 'number' ? when : this.ac.currentTime;

        this.createOscillator();
        this.osc.start(when);

        this.notes.forEach(function(note, i) {
            when = this.scheduleNote(i, when);
        }.bind(this));

        this.osc.stop(when);
        this.osc.onended = this.loop ? this.play.bind(this, when) : null;

        return this;
    };

    // stop playback, null out the oscillator, cancel parameter automation
    Sequence.prototype.stop = function() {
        if (this.osc) {
            this.osc.onended = null;
            this.osc.disconnect();
            this.osc = null;
        }
        return this;
    };

    exports.Note = Note;
    exports.Sequence = Sequence;
})(TinyMusic = {});



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
        '- e',
        'G4 e',
        'C4 e',
        'F4 e',
        '-  e',
        'F4 e',
        'G4 e',
        'C4 e',
        
        '- e',
        'C5 e',
        'F4 e',
        'G4 e',
        '- e',
        'F4 e',
        'C5 e',
        'F4 e',
    ],
    lead = [
        '- e',
        'G4 e',
        'C4 e',
        'F4 e',
        '- e',
        'F4 e',
        'G4 e',
        'C4 e',
        
        '- e',
        'C5 e',
        'F4 e',
        'G4 e',
        '- e',
        'F4 e',
        'C5 e',
        'F4 e',

        '- e',
        'F4 e',
        'G4 e',
        'F4 e',
        '- e',
        'E4 e',
        'C4 e',
        'C4 e',
        
        '- e',
        'E4 e',
        'F4 e',
        'C4 e',
        '- e',
        'F4 e',
        'G4 e',
        'F4 e'
    ],
    harmony = [
        'C5 e',
        '- e',
        'G5 e',
        '- e',
        'F5 e',
        '- e',
        'C5 e',
        '- e',
      
        'F5 e',
        '- e',
        'C5 e',
        '- e',
        'G5 e',
        '- e',
        'F5 e',
        '- e',

        'E5 e',
        '- e',
        'G5 e',
        '- e',
        'C6 e',
        '- e',
        'F5 e',
        '- e',
      
        'A5 e',
        '- e',
        'C5 e',
        '- e',
        'G5 e',
        '- e',
        'F5 e',
        '- e'
      ],
      bass = [
        'C3 e',
        'F2 q',
        '- e',
      
        'G2 e',
        'F2 q',
        '- e',
        
        'F2 e',
        'C3 q',
        '-  e',
      
        'C3 e',
        'F2 q',
        '-  e',

        'A2 e',
        'F2 q',
        '-  e',
      
        'C3 e',
        'E2 q',
        '- e',
        
        'G2 e',
        'F2 q',
        '- e',
      
        'A2 e',
        'F2 q',
        '- e'
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
    sequenceIntro.stop();
    [sequence1, sequence2, sequence3].forEach(s => {
        s.stop();
        s.play( ac.currentTime );
    });
}

function setLevels(level) {
    sequenceIntro.gain.gain.value = sequence1.gain.gain.value = sequence2.gain.gain.value = level || 0.2;
    sequence3.gain.gain.value = level || 0.15;
    coinTake.gain.gain.value = levelUp.gain.gain.value = s_dash.gain.gain.value = level || 0.3;
    isMuted = level === 0;
}

function muteSound() {
    setLevels(0);
}
