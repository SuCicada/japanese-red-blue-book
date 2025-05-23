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
          <td style="width: 5px;">${i}</td>
          <td style="width: 90%;" id="text-${i}">${line}</td>
          <td style="width: 5px;" onclick="playAudio(${i})">
            <span>▶️</span>
          </td>
        </tr>
        `.trim()
  }).join('')}
    </table>
    `

  document.getElementById('content').innerHTML = html;


  // ========================================================
  const lastLine = localStorage.getItem('last_line');
  console.log("lastLine", lastLine);
  if (lastLine && !window.location.hash) {
    location.hash = `#${lastLine}`;
    // const element = document.querySelector(`#line-${lastLine}`);
    // if (element) {
    //   element.scrollIntoView({ behavior: 'smooth' });
    // }
  }
  // 如果URL中有锚点，自动滚动到对应位置
  if (window.location.hash) {
    const element = document.querySelector(window.location.hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
    rootMargin: '0px',
    // root: document.getElementById('content-container')
  });

  // 为每一行添加观察
  document.querySelectorAll('tr[id^="line-"]').forEach(tr => {
    observer.observe(tr);
  });

  registerLinesClickEvent();

})();

export function highlightLine(lineIndex) {
  const line = `#line-${lineIndex}`;
  const tr = document.querySelector(line);
  document.querySelectorAll('tr[id^="line-"]').forEach(trr => {
    if (trr.id !== line) {
      trr.classList.remove('playing');
    }
  });
  tr.classList.toggle('playing');
}

// 为每一行添加点击事件
function registerLinesClickEvent( ) {
  document.querySelectorAll('tr[id^="line-"]').forEach(tr => {
    tr.addEventListener('click', () => {
      const lineIndex = tr.id.replace('line-', '');
      highlightLine(lineIndex);
    });
  });
}


