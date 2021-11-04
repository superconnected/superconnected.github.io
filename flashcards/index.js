const app = new FlashcardApp();

function onMIDISuccess(midiAccess) {
  app.flashMessage('ready!');
  app.start();
  midiAccess.inputs.forEach(entry => {
    entry.onmidimessage = app.handleMIDIMessage.bind(app);
  });
}

function onMIDIFailure(msg) {
  console.error('Failed to get MIDI access: ', msg);
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function restart() {
  app.start();
}
