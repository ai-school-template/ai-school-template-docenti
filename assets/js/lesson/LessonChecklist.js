window.LessonChecklist = {
  render(root, data) {
    const state = Object.assign({
      altTextOk:false, videoTranscriptOk:false, videoSummaryOk:false, iaLabelOk:false, copyrightOk:false, privacyOk:false, biasOk:false
    }, data.checklist || {});
    const cfg = [
      ["altTextOk","Immagini con ALT-text descrittivo"],
      ["videoTranscriptOk","Trascrizione completa per tutti i video"],
      ["videoSummaryOk","Riassunto 'In breve' per tutti i video"],
      ["iaLabelOk","Etichetta [IA] + Registro [IA] se usata IA"],
      ["copyrightOk","Fonti/licenze verificate"],
      ["privacyOk","Nessun dato personale di studenti nei prompt/media"],
      ["biasOk","Controllo bias/linguaggio inclusivo"]
    ];
    const sec = document.createElement("section");
    sec.className = "card lesson-checklist";
    sec.innerHTML = `<h2>Checklist Accessibilità/Etica</h2>` + cfg.map(([key,label]) => `
      <label class="item">
        <input type="checkbox" data-key="${key}" ${state[key] ? "checked":""}>
        <span>${label}</span>
      </label>`).join("");
    root.innerHTML = "";
    root.appendChild(sec);

    sec.addEventListener("change", e => {
      if (e.target && e.target.dataset.key) {
        state[e.target.dataset.key] = !!e.target.checked;
        document.dispatchEvent(new CustomEvent("lesson-checklist-change",{ detail: state }));
      }
    });
    return state;
  }
};

