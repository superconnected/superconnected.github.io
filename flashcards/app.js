class FlashcardApp {
  constructor() {
    this.notesOn = new Set();
    this.chords = [];
    this.chordIndex = 0;
    this.timer = null; // individual chord timer
    this.startTime = null; // overall app timer
    this.stats = new Map();

    document.addEventListener('correct', () => {
      this.chordIndex++;
      if (this.chordIndex < this.chords.length) {
        this.writeChord(this.currentChord);
      } else {
        this.end();
      }
    });
  }

  get currentChord() {
    return this.chords[this.chordIndex];
  }

  shuffleChords() {
    // 'random order' algorithm from https://bost.ocks.org/mike/shuffle/compare.html
    const all = Array.from(ALL_CHORDS.keys());
    const random = all.map(Math.random);
    const indices = new Array(all.length)
      .fill(0)
      .map((_, i) => i)
      .sort((a, b) => random[a] - random[b]);
    this.chords = indices.map(i => all[i]);
  }

  handleMIDIMessage(event) {
    const [cmd, noteValue] = event.data;
    if (cmd === NOTE_ON) {
      this.notesOn.add(NOTES.get(noteValue));
      this.checkCurrent();
    } else if (cmd === NOTE_OFF) {
      this.notesOn.delete(NOTES.get(noteValue));
    }
  }

  isPlayingChord(chord) {
    if (!chord) return false;

    const notesInChord = ALL_CHORDS.get(chord);
    if (notesInChord.size !== this.notesOn.size) return false;
    for (const note of notesInChord) if (!this.notesOn.has(note)) return false;
    return true;
  }

  writeChord(chord) {
    this.timer = Date.now();
    document.getElementById('card').innerText = chord;
  }

  flashMessage(message) {
    document.getElementById('message').innerText = message;
    setTimeout(() => {
      document.getElementById('message').innerText = '';
    }, 1000);
  }

  checkCurrent() {
    if (this.isPlayingChord(this.currentChord)) {
      this.stats.set(this.currentChord, Date.now() - this.timer);
      this.flashMessage('success!');
      document.dispatchEvent(new Event('correct'));
    }
  }

  init() {
    this.chordIndex = 0;
    this.shuffleChords();
    this.stats = new Map();
    document.getElementById('start-over-button').style.display = 'none';
    document.getElementById('stats').style.visibility = 'hidden';
  }

  start() {
    this.init();
    this.writeChord(this.currentChord);
    this.startTime = Date.now();
  }

  end() {
    const seconds = (Date.now() - this.startTime) / 1000;
    this.writeChord(`finished in ${seconds} seconds!`);
    document.getElementById('start-over-button').style.display = 'block';

    this.displayStats();
  }

  displayStats() {
    function formatStat(stat) {
      return `<li>${stat[0]}: ${stat[1] / 1000} seconds</li>`;
    }

    const sortedAsc = Array.from(this.stats).sort((a, b) => a[1] - b[1]);

    document.getElementById('fast').innerHTML = sortedAsc.slice(0, 3).map(formatStat).join('');
    document.getElementById('slow').innerHTML = sortedAsc.slice(-3).reverse().map(formatStat).join('');

    document.getElementById('stats').style.visibility = 'visible';
  }
}
