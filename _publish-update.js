#!/usr/bin/env node
/**
 * Publier une mise à jour — onglet 8
 *
 * Usage :  node _publish-update.js
 *
 * Le script :
 *   1. Demande titre, description, points clés dans le terminal
 *   2. Injecte la carte dans index.html (onglet 8)
 *   3. Met à jour updates.xml
 *   4. git add + commit + push
 *   5. GitHub Actions envoie la newsletter automatiquement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const ROOT = __dirname;
const INDEX_PATH = path.join(ROOT, 'index.html');
const XML_PATH = path.join(ROOT, 'updates.xml');

const PENDING_PATH = path.join(ROOT, '_pending-update.json');

// ───── Helpers ─────

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function frDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function buildCard(title, desc, date, points) {
  const items = points.map(p => `                <li>${esc(p)}</li>`).join('\n');
  const ul = points.length ? `\n              <ul>\n${items}\n              </ul>` : '';
  return `            <article class="release-card release-card-featured" data-release-date="${isoDate()}">
              <p class="release-meta"><strong>Publication :</strong> ${esc(date)}</p>
              <h3>${esc(title)} <span class="release-new-pill release-card-badge" hidden>Nouveau</span></h3>
              <p>${esc(desc)}</p>${ul}
            </article>`;
}

function buildRssItem(title, desc) {
  const guid = `release-${isoDate()}-${Math.random().toString(36).slice(2, 7)}`;
  return `    <item>
      <title>${esc(title)}</title>
      <link>index.html#content-08-01</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <description>${esc(desc)}</description>
    </item>`;
}

// ───── File patches ─────

function patchIndex(card) {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const marker = '<div class="release-feed">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('Marqueur release-feed introuvable dans index.html');
  const before = html.slice(0, idx + marker.length);
  const after = html.slice(idx + marker.length);
  fs.writeFileSync(INDEX_PATH, before + '\n' + card + '\n' + after, 'utf8');
}

function patchXml(rssItem) {
  const xml = fs.readFileSync(XML_PATH, 'utf8');
  const itemIdx = xml.indexOf('<item>');
  let patched;
  if (itemIdx === -1) {
    const endChan = xml.lastIndexOf('</channel>');
    if (endChan === -1) throw new Error('Format updates.xml invalide');
    patched = xml.slice(0, endChan) + '\n' + rssItem + '\n  ' + xml.slice(endChan);
  } else {
    patched = xml.slice(0, itemIdx) + rssItem + '\n\n    ' + xml.slice(itemIdx);
  }
  fs.writeFileSync(XML_PATH, patched, 'utf8');
}

function gitPush(title) {
  const msg = `[Guide] Mise à jour : ${title}`;
  execSync('git add index.html updates.xml', { cwd: ROOT, stdio: 'inherit' });
  execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
}

// ───── Interactive prompts ─────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  let title, desc, date, points;

  // ── Check for _pending-update.json (from admin panel) ──
  if (fs.existsSync(PENDING_PATH)) {
    console.log('');
    console.log('  📄 Fichier _pending-update.json détecté !');
    try {
      const data = JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8'));
      title  = (data.title || '').trim();
      desc   = (data.description || '').trim();
      date   = (data.date || '').trim() || frDate();
      points = Array.isArray(data.points) ? data.points.filter(p => p && p.trim()) : [];
      if (!title || !desc) throw new Error('Titre ou description manquant dans le fichier.');
      console.log(`  Titre : ${title}`);
      console.log(`  Description : ${desc}`);
      console.log(`  Date : ${date}`);
      if (points.length) points.forEach(p => console.log(`    • ${p}`));
      // Delete the pending file after reading
      fs.unlinkSync(PENDING_PATH);
      console.log('  ✓ Fichier lu et supprimé.');
    } catch (e) {
      console.error('  ✗ Erreur lecture _pending-update.json : ' + e.message);
      console.log('  Passage en mode interactif…');
      title = null;
    }
  }

  // ── Interactive mode (no pending file or read error) ──
  if (!title) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log('   PUBLIER UNE MISE À JOUR (onglet 8)');
    console.log('══════════════════════════════════════════════');
    console.log('');

    title = (await ask(rl, '  Titre : ')).trim();
    if (!title) { console.log('  ✗ Titre obligatoire. Abandon.'); rl.close(); return; }

    desc = (await ask(rl, '  Description : ')).trim();
    if (!desc) { console.log('  ✗ Description obligatoire. Abandon.'); rl.close(); return; }

    const dateDefault = frDate();
    const dateInput = (await ask(rl, `  Date [${dateDefault}] : `)).trim();
    date = dateInput || dateDefault;

    console.log('  Points clés (un par ligne, ligne vide pour terminer) :');
    points = [];
    while (true) {
      const pt = (await ask(rl, '    • ')).trim();
      if (!pt) break;
      points.push(pt);
    }

    rl.close();
  }

  console.log('');
  console.log('  ➜ Injection dans index.html…');
  patchIndex(buildCard(title, desc, date, points));
  console.log('  ✓ index.html mis à jour');

  console.log('  ➜ Injection dans updates.xml…');
  patchXml(buildRssItem(title, desc));
  console.log('  ✓ updates.xml mis à jour');

  console.log('  ➜ Git commit + push…');
  try {
    gitPush(title);
    console.log('');
    console.log('  ══════════════════════════════════════════');
    console.log('  ✓ PUBLIÉ — La newsletter part automatiquement.');
    console.log('  ══════════════════════════════════════════');
    console.log('');
  } catch (e) {
    console.error('  ✗ Erreur git : ' + e.message);
    console.log('  Les fichiers sont modifiés localement. Vous pouvez push manuellement.');
  }
}

main();
