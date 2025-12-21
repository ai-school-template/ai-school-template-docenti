window.CuripodEmbed = {
  render(root, curi) {
    if (!root || !curi || !curi.id) return;
    const card = document.createElement("section");
    card.className = "card";
    card.innerHTML = `
      <h2>${curi.title || "Curipod"}</h2>
      <p>${(curi.goals || []).join(" • ")}</p>
      <p>${curi.instructions || ""}</p>
      <div class="embed">
        <iframe src="https://app.curipod.com/${curi.id}" title="Curipod" loading="lazy"></iframe>
      </div>
    `;
    root.appendChild(card);
  }
};

