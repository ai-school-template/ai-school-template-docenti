/**
 * Voice Reader - Lettore Vocale per Accessibilità
 * Legge il contenuto della pagina ad alta voce usando Web Speech API
 */

(function() {
  'use strict';
  
  // FIX MINIMO: evita doppia inizializzazione (GitHub/navigation/caching)
  if (window.__VOICE_READER_STARTED__) {
    return;
  }
  window.__VOICE_READER_STARTED__ = true;
  
  const VOICE_AUDIT = true;
  
  // Helper per audit logging
  function auditLog(section, label, el, text, status, reason) {
    if (!VOICE_AUDIT) return;
    
    const prev = (text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    console.log(`[VOICE AUDIT] ${section} | ${label} | ${status}${reason ? ' | ' + reason : ''} | ${prev}`);
  }
  
  // Helper per rimuovere emoji
  function stripEmoji(s) {
    if (!s) return '';
    
    // rimuove emoji e simboli comuni (range Unicode ampio); mantiene lettere/numeri/punteggiatura
    // fallback semplice e compatibile:
    return s
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')   // emoji pictographs
      .replace(/[\u{2600}-\u{27BF}]/gu, '')     // simboli vari
      .replace(/\uFE0F/gu, '')                  // variation selector
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // FIX MINIMO: evita doppio pulsante audio (home studente ha già readPageBtn)
  if (document.getElementById('voiceReaderBtn') || document.getElementById('readPageBtn')) {
    // Se esiste già un pulsante audio, non crearne un altro
    return;
  }
  
  // Crea il pulsante
  const btn = document.createElement('button');
  btn.id = 'voiceReaderBtn';
  btn.className = 'voice-reader-btn';
  btn.setAttribute('aria-label', 'Attiva lettore vocale');
  btn.innerHTML = `
    <span id="voiceIcon">🔊</span>
    <span id="voiceText">Ascolta</span>
  `;
  
  // Aggiungi al body quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(btn);
    });
  } else {
    document.body.appendChild(btn);
  }
  
  const icon = btn.querySelector('#voiceIcon');
  const text = btn.querySelector('#voiceText');
  let synthesis = window.speechSynthesis;
  let utterance = null;
  let isReading = false;
  let voiceRunId = 0;
  let voiceRetryTimer = null;
  let __vrRetryCount = 0;
  let __vrRetryTimer = null;
  
  // Verifica supporto browser
  if (!('speechSynthesis' in window)) {
    btn.style.display = 'none';
    console.warn('⚠️ Speech Synthesis non supportata in questo browser');
    return;
  }
  
  // Gestione click (evita listener duplicati)
  if (btn.dataset.voiceBound === '1') return;
  btn.dataset.voiceBound = '1';
  
  btn.addEventListener('click', function() {
    // Toggle STOP se sta già parlando
    if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      voiceRunId++;  // invalida tutte le callback pendenti
      if (voiceRetryTimer) {
        clearTimeout(voiceRetryTimer);
        voiceRetryTimer = null;
      }
      window.speechSynthesis.cancel();
      btn.dataset.voiceBusy = '0';
      isReading = false;
      btn.classList.remove('reading');
      icon.textContent = '🔊';
      const vt = document.getElementById('voiceText');
      if (vt) vt.textContent = 'Ascolta';
      return;
    }
    
    // Debounce: evita click multipli (solo quando NON stai stoppando)
    if (btn.dataset.voiceBusy === '1') return;
    btn.dataset.voiceBusy = '1';
    
    // Cancella sempre speechSynthesis prima di parlare
    window.speechSynthesis.cancel();
    
    if (isReading) {
      // Ferma la lettura
      isReading = false;
      btn.classList.remove('reading');
      icon.textContent = '🔊';
      text.textContent = 'Ascolta';
      btn.dataset.voiceBusy = '0';
    } else {
      // Avvia la lettura immediatamente (senza RAF/setTimeout per mantenere user gesture)
      const runId = ++voiceRunId;
      
      // Funzione helper per parlare
      function speakText(contentToRead) {
        if (runId !== voiceRunId) return;
        
        if (!contentToRead) {
          alert('Nessun contenuto da leggere su questa pagina.');
          btn.dataset.voiceBusy = '0';
          return;
        }
        
        utterance = new SpeechSynthesisUtterance(contentToRead);
        utterance.lang = 'it-IT';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Selezione voce italiana (solo se disponibile immediatamente, non aspetta voiceschanged)
        const voices = window.speechSynthesis.getVoices() || [];
        let pickedVoice =
          voices.find(v => (v.lang || '').toLowerCase() === 'it-it') ||
          voices.find(v => (v.lang || '').toLowerCase().startsWith('it')) ||
          null;
        
        if (pickedVoice) {
          utterance.voice = pickedVoice;
        }
        // Se voce non disponibile, procede comunque con lang='it-IT' (browser userà default)
        
        utterance.onend = function() {
          if (runId !== voiceRunId) return;
          isReading = false;
          btn.classList.remove('reading');
          icon.textContent = '🔊';
          btn.dataset.voiceBusy = '0';
          const vt = document.getElementById('voiceText');
          if (vt) vt.textContent = 'Ascolta';
        };
        
        utterance.onerror = function(event) {
          if (runId !== voiceRunId) return;
          console.error('Errore lettura vocale:', event);
          isReading = false;
          btn.classList.remove('reading');
          icon.textContent = '🔊';
          btn.dataset.voiceBusy = '0';
          const vt = document.getElementById('voiceText');
          if (vt) vt.textContent = 'Ascolta';
        };
        
        synthesis.speak(utterance);
        isReading = true;
        btn.classList.add('reading');
        icon.textContent = '⏸️';
        const vt = document.getElementById('voiceText');
        if (vt) vt.textContent = 'Stop';
      }
      
      // Raccogli testo immediatamente (senza retry)
      const text = gatherPageContent();
      if (!text || text.trim().length < 40) {
        alert('Nessun contenuto da leggere su questa pagina.');
        btn.dataset.voiceBusy = '0';
        return;
      }
      
      // Chiama speakText immediatamente (dentro user gesture)
      speakText(text);
    }
  });
  
  /**
   * Raccoglie il contenuto testuale della pagina
   */
  function gatherPageContent() {
    // Determina sezione basata su pathname
    function getSection() {
      const pathname = window.location.pathname;
      if (pathname.includes('percorso-tematico')) return 'HOME_LEZIONE';
      if (pathname.includes('pages/lezione')) return 'LEZIONE';
      if (pathname.includes('pages/attivita')) return 'ATTIVITA';
      if (pathname.includes('pages/risorse')) return 'RISORSE';
      if (pathname.includes('pages/valutazione')) return 'VALUTAZIONE';
      if (pathname.includes('pages/info-etica')) return 'INFO_ETICA';
      if (pathname.includes('pages/conclusione-feedback')) return 'CONCLUSIONE_FEEDBACK';
      return 'ALTRO';
    }
    
    // Determina label basata su contesto elemento
    function getLabel(el) {
      if (el.closest('.desc-box')) return 'DESC_BOX';
      if (el.closest('.transcript-body')) return 'TRASCRIZIONE';
      if (el.closest('.card')) return 'CARD';
      const tagName = el.tagName;
      if (tagName && /^H[1-4]$/.test(tagName)) return 'TITOLO';
      return 'TESTO';
    }
    
    // Verifica se è un'etichetta valida (testo breve con parole chiave)
    function isLabelText(text, el) {
      if (!text || text.length >= 50) return false;
      
      // Verifica se contiene parole chiave
      const keywords = /(descrizione|riassunto|trascrizione|obiettivi|glossario)/i;
      if (!keywords.test(text)) return false;
      
      // Verifica se è dentro strong, b, .label, .box-title
      const tagName = el.tagName;
      if (tagName === 'STRONG' || tagName === 'B') return true;
      if (el.matches('.label, .box-title')) return true;
      if (el.closest('strong, b, .label, .box-title')) return true;
      
      return false;
    }
    
    const section = getSection();
    
    // Helper: verifica se elemento è visibile
    function isVisible(el) {
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const op = parseFloat(cs.opacity || '1');
      if (op <= 0) return false;
      // FIX MINIMO: nella pagina lezione non usare getClientRects (su mobile può risultare 0 anche se visibile)
      if (el.closest && el.closest('#lesson-view')) {
        return true;
      }
      if (el.getClientRects().length === 0) return false;
      return true;
    }
    
    // Helper: verifica se elemento deve essere escluso
    function isExcluded(el) {
      // Verifica se è dentro contenitori da escludere
      if (el.closest('#empty-view, .empty-view, [data-empty], .empty-message')) return true;
      // Verifica se è dentro nav, footer
      if (el.closest('nav, footer')) return true;
      // Escludi SOLO header globali (non tutti gli header)
      if (el.closest('header.global-header, header.site-header, #globalHeader, #siteHeader, .topbar')) return true;
      // Verifica se è un link/bottone di navigazione
      if (el.closest('a.btn, button, #backToLessonTop, #backToLesson, .back-link')) return true;
      // Verifica se è l'elemento stesso un link/bottone
      if (el.matches('a.btn, button, #backToLessonTop, #backToLesson, .back-link')) return true;
      return false;
    }
    
    // Scegli root
    const root = document.querySelector('[data-tts-root]') || document.querySelector('main') || document.body;
    
    // Usa TreeWalker sui nodi di testo
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        
        let raw = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
        raw = stripEmoji(raw);
        const label = getLabel(el);
        
        // scarta whitespace (dopo stripEmoji)
        if (!raw || raw.length < 2) {
          auditLog(section, label, el, raw, 'SKIP', 'empty');
          return NodeFilter.FILTER_REJECT;
        }
        
        // scarta se escluso o non visibile (usa funzioni esistenti)
        if (isExcluded(el)) {
          auditLog(section, label, el, raw, 'SKIP', 'excluded');
          return NodeFilter.FILTER_REJECT;
        }
        if (!isVisible(el)) {
          auditLog(section, label, el, raw, 'SKIP', 'notVisible');
          return NodeFilter.FILTER_REJECT;
        }
        
        // scarta testo solo emoji/simboli
        if (!/[A-Za-zÀ-ÿ0-9]/.test(raw)) {
          auditLog(section, label, el, raw, 'SKIP', 'noAlnum');
          return NodeFilter.FILTER_REJECT;
        }
        
        // scarta messaggi empty/non disponibile
        if (/(questa sezione non|non (è|e) disponibile|non ancora stata preparata|contenuto non disponibile)/i.test(raw)) {
          auditLog(section, label, el, raw, 'SKIP', 'emptyMessage');
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    
    // Scorri i nodi e push raw in content, ma evita duplicati consecutivi
    const content = [];
    let last = '';
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const el = node.parentElement;
      const label = getLabel(el);
      let t = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
      t = stripEmoji(t);
      
      // dopo stripEmoji, se vuoto o troppo corto => skip
      if (!t || t.length < 2) {
        auditLog(section, label, el, t, 'SKIP', 'empty');
        continue;
      }
      
      // Verifica se è un'etichetta valida
      const isLabel = isLabelText(t, el);
      
      // Se non è un'etichetta, applica filtro duplicate consecutivo
      if (!isLabel && t === last) {
        auditLog(section, label, el, t, 'SKIP', 'duplicate');
        continue;
      }
      
      last = t;
      content.push(t);
      auditLog(section, label, el, t, 'READ', isLabel ? 'label' : '');
    }
    
    // PASSATA DEDICATA AI CONTENUTI VIDEO
    // Trova blocchi video con selettori robusti
    const transcriptBodies = Array.from(document.querySelectorAll('.transcript-body'));
    const transcriptToggles = Array.from(document.querySelectorAll('.transcript-toggle'));
    const summaryLabels = Array.from(document.querySelectorAll('.desc-box strong, .desc-box b, .desc-box .label'))
      .filter(el => /riassunto/i.test((el.innerText || el.textContent || '')));
    
    // RIASSUNTO: per ogni summaryLabel
    summaryLabels.forEach(summaryLabel => {
      const labelText = stripEmoji((summaryLabel.innerText || summaryLabel.textContent || '').trim());
      if (labelText && labelText.length < 50 && /riassunto/i.test(labelText)) {
        // Aggiungi l'etichetta
        content.push(labelText);
        auditLog(section, 'DESC_BOX', summaryLabel, labelText, 'READ', 'videoSummaryLabel');
        
        // Cerca il testo del riassunto
        let summaryText = null;
        
        // Prima prova: nextElementSibling
        let nextEl = summaryLabel.nextElementSibling;
        if (nextEl && (nextEl.tagName === 'DIV' || nextEl.tagName === 'SPAN' || nextEl.tagName === 'P')) {
          summaryText = stripEmoji((nextEl.innerText || nextEl.textContent || '').trim());
        }
        
        // Se non c'è, cerca dentro lo stesso .desc-box
        if (!summaryText || summaryText.length < 2) {
          const descBox = summaryLabel.closest('.desc-box');
          if (descBox) {
            const candidates = descBox.querySelectorAll('div, span, p');
            for (let candidate of candidates) {
              // Salta se è la label stessa o contiene la label
              if (candidate === summaryLabel || candidate.contains(summaryLabel)) continue;
              
              const candidateText = stripEmoji((candidate.innerText || candidate.textContent || '').trim());
              if (candidateText && candidateText.length >= 2 && candidateText !== labelText) {
                summaryText = candidateText;
                break;
              }
            }
          }
        }
        
        // Aggiungi il testo del riassunto se trovato
        if (summaryText && summaryText.length >= 2) {
          content.push(summaryText);
          auditLog(section, 'DESC_BOX', summaryLabel.parentElement, summaryText, 'READ', 'videoSummaryText');
        }
      }
    });
    
    // TRASCRIZIONE: per ogni transcriptBody
    transcriptBodies.forEach(transcriptBody => {
      // Controllo permissivo SOLO per transcript-body (non usa getClientRects/opacity)
      const cs = window.getComputedStyle(transcriptBody);
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        auditLog(section, 'TRASCRIZIONE', transcriptBody, '', 'SKIP', 'videoTranscriptHidden');
        return;
      }
      
      // Calcola testo una volta sola
      const txt = (transcriptBody.innerText || transcriptBody.textContent || '').replace(/\s+/g, ' ').trim();
      const transcriptText = stripEmoji(txt);
      
      // Considerala "visibile" se ha testo e non è display:none/hidden
      if (!transcriptText || transcriptText.length < 2) {
        auditLog(section, 'TRASCRIZIONE', transcriptBody, '', 'SKIP', 'videoTranscriptEmpty');
        return;
      }
      
      // Aggiungi etichetta "Trascrizione" prima del testo
      content.push('Trascrizione');
      auditLog(section, 'TRASCRIZIONE', transcriptBody, 'Trascrizione', 'READ', 'videoTranscriptLabel');
      
      // Aggiungi il testo completo
      content.push(transcriptText);
      auditLog(section, 'TRASCRIZIONE', transcriptBody, transcriptText, 'READ', 'videoTranscriptText');
    });
    
    // unisci contenuto senza dedup globale (mantiene tutte le etichette)
    const out = content.join('. ').trim();
    return out;
  }
  
  // Ferma la lettura quando si cambia pagina
  window.addEventListener('beforeunload', function() {
    if (isReading) {
      synthesis.cancel();
    }
  });
  
  // Ferma se si preme ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isReading) {
      synthesis.cancel();
      isReading = false;
      btn.classList.remove('reading');
      icon.textContent = '🔊';
      text.textContent = 'Ascolta';
    }
  });
  
})();

