window.__ModuleLoader__.load({
  id: '@whale-desk/dsh-companion',
  factory: () => ({
    inject: [],
    apply(ctx) {
      const old = document.getElementById('whale-companion-entry');
      if (old) old.remove();
      const host = document.createElement('div'); host.id = 'whale-companion-entry'; host.dataset.dshPlugin = 'whale-companion';
      const root = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = ':host{position:fixed;right:24px;bottom:226px;z-index:999;font-family:system-ui}button,a{font:13px system-ui;border:1px solid #dbc5d7;background:#fff8f4;color:#855f80;border-radius:14px;padding:10px 13px;cursor:pointer;text-decoration:none;display:inline-block;box-shadow:0 4px 18px #71546d15}button:focus-visible,a:focus-visible{outline:2px solid #ad8aa9;outline-offset:3px}.box{background:#fffcf9;border:1px solid #e4d4df;border-radius:18px;padding:18px;width:260px;box-shadow:0 12px 40px #74617226;margin-bottom:10px;color:#71556e;font-size:12px}input{box-sizing:border-box;width:100%;padding:9px;margin:9px 0;border:1px solid #ddccda;border-radius:9px}p{line-height:1.7}[hidden]{display:none}'; root.append(style);
      const box = document.createElement('div'); box.className = 'box'; box.hidden = true;
      const title = document.createElement('strong'); title.textContent = '鲸伴 · 把温柔带在身边';
      const copy = document.createElement('p'); copy.textContent = '填入你的鲸伴服务地址，在独立陪伴窗口中聊天。手机使用同一个地址配对。';
      const input = document.createElement('input'); input.type = 'url'; input.setAttribute('aria-label', '鲸伴服务地址'); input.value = localStorage.getItem('whale-companion-url') || 'http://127.0.0.1:4318';
      const link = document.createElement('a'); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = '打开陪伴小屋 ↗';
      const error = document.createElement('p'); error.setAttribute('role','alert');
      function validate() {
        try {
          const url = new URL(input.value.trim());
          if (url.username || url.password || url.search || url.hash || url.pathname !== '/' || !(url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(url.hostname)))) throw new Error();
          link.href = url.origin; error.textContent = ''; return url.origin;
        } catch { link.removeAttribute('href'); error.textContent = '请填写 HTTPS 根地址；本地可以使用 http://127.0.0.1:4318。'; }
      }
      input.addEventListener('input', validate);
      link.addEventListener('click', event => { const url = validate(); if (!url) event.preventDefault(); else localStorage.setItem('whale-companion-url', url); });
      validate(); box.append(title,copy,input,link,error);
      const button = document.createElement('button'); button.textContent = '✧ 鲸伴'; button.setAttribute('aria-expanded','false'); button.onclick = () => { box.hidden = !box.hidden; button.setAttribute('aria-expanded', String(!box.hidden)); };
      root.append(box,button); document.body.append(host);
      ctx.effect(() => () => host.remove());
    }
  })
});
