window.LessonGlossary = {
  render(root, gloss) {
    if (!root || !gloss) return;
    const entries = gloss.entries || [];
    if (!Array.isArray(entries) || entries.length === 0) return;
    const wrap = document.createElement("div");
    wrap.className = "card glossary";
    wrap.innerHTML = `<h2>📚 Glossario</h2>`;
    
    entries.forEach(e => {
      const termStrong = document.createElement('strong');
      termStrong.textContent = e.it;
      termStrong.style.display = 'block';
      termStrong.style.marginBottom = '0.5rem';
      wrap.appendChild(termStrong);
      
      const descBox = document.createElement('div');
      descBox.className = 'desc-box';
      const defP = document.createElement('p');
      defP.textContent = e.def_it;
      defP.style.margin = '0';
      descBox.appendChild(defP);
      
      if (e.example_it) {
        const exampleP = document.createElement('p');
        exampleP.style.margin = '0.5rem 0 0 0';
        exampleP.innerHTML = '<strong>Esempio:</strong> ' + e.example_it;
        descBox.appendChild(exampleP);
      }
      
      wrap.appendChild(descBox);
    });
    
    root.appendChild(wrap);
  }
};

