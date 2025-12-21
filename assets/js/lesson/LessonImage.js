window.LessonImage = {
  render(root, images) {
    if (!root || !Array.isArray(images) || !images.length) return;
    const wrap = document.createElement("div");
    wrap.className = "card media";
    wrap.innerHTML = `<h2>🖼️ Immagini</h2>`;
    
    images.forEach(img => {
      const descBox = document.createElement('div');
      descBox.className = 'desc-box';
      
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || "";
      imgEl.style.display = 'block';
      imgEl.style.margin = '0 auto 0.75rem';
      imgEl.style.maxWidth = '520px';
      imgEl.style.width = '100%';
      imgEl.style.borderRadius = '8px';
      descBox.appendChild(imgEl);
      
      if (img.alt && img.alt.trim()) {
        const descP = document.createElement('p');
        descP.style.margin = '0';
        descP.innerHTML = '<strong>Descrizione:</strong> ' + img.alt.trim();
        descBox.appendChild(descP);
      }
      
      wrap.appendChild(descBox);
    });
    
    root.appendChild(wrap);
  }
};

