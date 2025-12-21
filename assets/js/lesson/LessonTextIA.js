window.LessonTextIA = {
  render(root, data) {
    if (!root || !data) return;
    const card = document.createElement("div");
    card.className = "card";
    
    const title = document.createElement('h2');
    title.innerHTML = `📝 ${data.titolo || "Contenuto della Lezione"}`;
    if (data.etichettaIA) {
      const badge = document.createElement('span');
      badge.className = 'badge-ia';
      badge.textContent = '[IA]';
      title.appendChild(badge);
    }
    card.appendChild(title);
    
    const descBox = document.createElement('div');
    descBox.className = 'desc-box';
    
    if (Array.isArray(data.paragrafi)) {
      data.paragrafi.forEach(p => {
        const pEl = document.createElement('p');
        pEl.textContent = p;
        pEl.style.margin = '0 0 1rem 0';
        descBox.appendChild(pEl);
      });
    }
    
    if (Array.isArray(data.fonti) && data.fonti.length) {
      const fontiTitle = document.createElement('h3');
      fontiTitle.textContent = 'Fonti';
      fontiTitle.style.marginTop = '1rem';
      fontiTitle.style.marginBottom = '0.5rem';
      descBox.appendChild(fontiTitle);
      const fontiList = document.createElement('ul');
      data.fonti.forEach(f => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = f;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = f;
        li.appendChild(a);
        fontiList.appendChild(li);
      });
      descBox.appendChild(fontiList);
    }
    
    if (data.etichettaIA && data.registroIA) {
      const details = document.createElement('details');
      details.style.marginTop = '1rem';
      const summary = document.createElement('summary');
      summary.textContent = 'Registro [IA] — trasparenza';
      details.appendChild(summary);
      const ul = document.createElement('ul');
      ul.innerHTML = `
        <li><strong>Strumento:</strong> ${data.registroIA.strumento || "-"}</li>
        <li><strong>Scopo:</strong> ${data.registroIA.scopo || "-"}</li>
        <li><strong>Output:</strong> ${data.registroIA.output || "-"}</li>
        <li><strong>Verifica docente:</strong> ${data.registroIA.verifica || "-"}</li>
      `;
      details.appendChild(ul);
      descBox.appendChild(details);
    }
    
    card.appendChild(descBox);
    root.appendChild(card);
  }
};

