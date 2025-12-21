window.LessonVideo = {
  render(root, video) {
    if (!root || !video) return;
    
    // Normalizza: array o oggetto singolo
    const videos = Array.isArray(video) ? video : [video];
    
    // Filtra solo video validi (con source e enabled !== false)
    const validVideos = videos.filter(v => v && (v.enabled !== false) && v.source);
    if (!validVideos.length) return;
    
    // Cerca o crea la card "🎥 Video"
    let card = Array.from(root.querySelectorAll('div.card.media')).find(s => 
      s.querySelector('h2')?.textContent.includes('🎥')
    );
    if (!card) {
      card = document.createElement("div");
      card.className = "card media";
      card.innerHTML = '<h2>🎥 Video</h2>';
      root.appendChild(card);
    }
    
    validVideos.forEach(v => {
      if (!v || !v.source) return;
      
      // Estrai ID YouTube se presente
      let youtubeId = null;
      if (v.source) {
        const url = v.source;
        if (url.includes('youtu.be/')) {
          youtubeId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
          const match = url.match(/[?&]v=([^&]+)/);
          youtubeId = match ? match[1] : null;
        } else if (url.includes('youtube.com/embed/')) {
          youtubeId = url.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
        }
      }
      
      // Estrai fileId Drive se presente
      let driveFileId = null;
      if (v.source) {
        const url = v.source;
        if (url.includes('drive.google.com/file/d/')) {
          driveFileId = url.split('drive.google.com/file/d/')[1]?.split('/')[0]?.split('?')[0];
        } else if (url.includes('drive.google.com/open?id=')) {
          driveFileId = url.split('drive.google.com/open?id=')[1]?.split('&')[0];
        }
      }
      
      // Determina thumbnail
      let thumbnailSrc = null;
      if (youtubeId) {
        thumbnailSrc = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      } else if (driveFileId) {
        thumbnailSrc = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1200`;
      }
      
      // Crea desc-box
      const descBox = document.createElement('div');
      descBox.className = 'desc-box';
      
      // Anteprima video
      if (thumbnailSrc) {
        const img = document.createElement('img');
        img.src = thumbnailSrc;
        img.alt = v.title || "Video";
        img.style.cssText = 'display: block; margin: 0 auto 0.75rem; width: 100%; max-width: 520px; border-radius: 8px; aspect-ratio: 16/9; object-fit: cover;';
        descBox.appendChild(img);
      }
      
      // Pulsante
      if (v.source) {
        const btn = document.createElement('a');
        btn.href = v.source;
        btn.target = '_blank';
        btn.rel = 'noopener';
        btn.className = 'btn';
        btn.style.cssText = 'display: inline-block; margin-bottom: 1rem;';
        btn.textContent = '🎬 Apri video';
        descBox.appendChild(btn);
      }
      
      // Riassunto
      if (v.transcriptSummary) {
        const summaryLabel = document.createElement('strong');
        summaryLabel.textContent = 'Riassunto:';
        summaryLabel.style.display = 'block';
        summaryLabel.style.marginTop = '0.25rem';
        descBox.appendChild(summaryLabel);
        const summaryText = document.createElement('div');
        summaryText.textContent = v.transcriptSummary;
        summaryText.style.marginTop = '0.25rem';
        descBox.appendChild(summaryText);
      }
      
      // Trascrizione (toggle stile Risorse)
      if (v.transcript) {
        const toggle = document.createElement('div');
        toggle.className = 'transcript-toggle';
        toggle.textContent = '📝 ▸ Trascrizione';
        toggle.style.marginTop = '0.75rem';
        
        const transcriptBody = document.createElement('div');
        transcriptBody.className = 'transcript-body';
        transcriptBody.textContent = v.transcript;
        transcriptBody.style.display = 'none';
        
        toggle.addEventListener('click', () => {
          if (transcriptBody.style.display === 'none' || !transcriptBody.style.display) {
            transcriptBody.style.display = 'block';
            toggle.textContent = '📝 ▾ Trascrizione';
          } else {
            transcriptBody.style.display = 'none';
            toggle.textContent = '📝 ▸ Trascrizione';
          }
        });
        
        descBox.appendChild(toggle);
        descBox.appendChild(transcriptBody);
      }
      
      card.appendChild(descBox);
    });
  }
};

