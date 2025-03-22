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
        <tr id="line-${i}" href="#line-${i}">
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

  // 如果URL中有锚点，自动滚动到对应位置
  // if (window.location.hash) {
  //   const element = document.querySelector(window.location.hash);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }
  const lastLine = localStorage.getItem('last_line');
  if (lastLine) {
    location.hash = `#${lastLine}`;
    // const element = document.querySelector(`#line-${lastLine}`);
    // if (element) {
      // element.scrollIntoView({ behavior: 'smooth' });
    // }
  }


  // 跟踪所有可见元素的集合
  const visibleElements = new Set();

  // 添加滚动事件监听
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleElements.add(entry.target);
      } else {
        visibleElements.delete(entry.target);
      }
    });

    if (visibleElements.size > 0) {
      // 转换为数组并找出最小ID
      const minElement = Array.from(visibleElements).reduce((min, current) => {
        const minId = parseInt(min.id.replace('line-', ''));
        const currentId = parseInt(current.id.replace('line-', ''));
        return currentId < minId ? current : min;
      });

      // 更新URL为最小ID的锚点
      history.replaceState(null, null, `#${minElement.id}`);
      localStorage.setItem('last_line', minElement.id);
    }
  }, {
    threshold: 0.5,
    rootMargin: '0px'
  });

  // 为每一行添加观察
  document.querySelectorAll('tr[id^="line-"]').forEach(tr => {
    observer.observe(tr);
  });
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