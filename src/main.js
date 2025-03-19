(async () => {
  const response = await fetch('1000.md');
  if (!response.ok) {
    throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const yaml = jsyaml.load(text);
  console.log(yaml);

  const html = `
    <table border="1">
      ${yaml.map((line, i) => {
    i = i + 1;
    return `
        <tr id="line-${i}">
          <td style="width: 100px;">${i}</td>
          <td style="width: 100px;">
            <span onclick="playAudio(${i})">▶️</span>
          </td>
          <td id="text-${i}">${line}</td>
        </tr>
        `.trim()
  }).join('')}
    </table>
    `

  document.getElementById('content').innerHTML = html;
})();

const audioMap = new Map();
const audio = new Audio();

async function playAudio(i) {
  const text = document.getElementById(`text-${i}`).textContent;
  const tts_engine = 'lain_style_bert_vits2';
  // const tts_engine = 'lain_so_vits_svc';
  let audioUrl
  if (audioMap.has(i)) {
    audioUrl = audioMap.get(i);
  } else {

    try {
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
      audioUrl = URL.createObjectURL(blob);

    } catch (error) {
      console.error('播放出错:', error);
      alert('音频播放失败');
    }
  }
  audioMap.set(i, audioUrl);
  audio.src = audioUrl;
  audio.currentTime = 0;
  audio.play();
}
window.playAudio = playAudio;