import { playAudio,playingAudio } from './audio';
import { highlightLine } from './main';
const playButton = document.getElementById('playButton');

async function autoPlay(index, hashIndex) {
  if (!isValid(index)) {
    startAutoPlay = false;
    return;
  }

  const element = document.querySelector(`#line-${hashIndex}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    // element.classList.add('playing');
  }
  
  highlightLine(index);
  const audio = await playAudio(index);
  audio.onended = () => {
    element.classList.remove('playing');
    if (!startAutoPlay) {
      return;
    }
    const nextIndex = Number(index) + 1;
    const nextHashIndex = Number(hashIndex) + 1;
    autoPlay(nextIndex, nextHashIndex);
  };
}

function isValid(index) {
  const element = document.querySelector(`#line-${index}`);
  if (element) {
    return true;
  }
  playButton.classList.remove('playing');
  return false;
}

function getHashIndex() {
  const currentLine = window.location.hash.replace('#', '');
  return currentLine.split('-')[1]
}

function getLineIndex() {
  const playingLines = Array.from(document.querySelectorAll('tr[id^="line-"]'))
    .filter(tr => tr.classList.contains('playing'))
  if (playingLines.length > 0) {
    return playingLines[0].id.replace('line-', '');
  }

  return getHashIndex();
}

let startAutoPlay = false;
playButton.addEventListener('click', async () => {
  console.log('playButton clicked');
  startAutoPlay = !startAutoPlay

  playButton.classList.toggle('playing');
  if (startAutoPlay) {
    const index = getLineIndex();
    const hashIndex = getHashIndex();
    autoPlay(index, hashIndex);

  } else {
    playingAudio.pause();
  }
});

