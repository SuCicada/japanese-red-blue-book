
const audioMap = new Map();
export let playingAudio 
async function getAudioUrl(i, text) {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_AUDIO_URL) {
    // Request the audio URL from the server
    const audioUrl = `${import.meta.env.VITE_AUDIO_URL_BASE}${i}.mp3`;
    // return audioUrl;
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        return audioUrl;
      }
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
    }
  } else {
    const payload = {
      tts_engine: import.meta.env.VITE_TTS_ENGINE,
      text,
      front_tts: import.meta.env.VITE_FRONT_TTS
    }
    const params = new URLSearchParams(payload).toString();
    const url = `${import.meta.env.VITE_TTS_API_URL}?${params}`

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('音频加载失败');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

export async function playAudio(i) {
  console.log("playAudio", i);
  const text = document.getElementById(`text-${i}`).textContent;
  // let audioUrl
  let audio = audioMap.get(i);
  if (!audio) {
    audio = new Audio(await getAudioUrl(i, text));
    // audio.src = await getAudioUrl(i, text);
    audioMap.set(i, audio);
  }

  if (playingAudio) {
    if (playingAudio.src !== audio.src) {
      playingAudio.pause();
    } else {
      audio.load();
    }
  }
  playingAudio = audio;
  audio.currentTime = 0;
  audio.play();
  // playingAudio.src = audio.src;
  // playingAudio.load();
  // playingAudio.play();
  // console.log("audio", audio);
  // audio.currentTime = 0;
  // audio.play();
  return audio
}
window.playAudio = playAudio;