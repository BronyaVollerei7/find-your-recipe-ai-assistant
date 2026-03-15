let lang = 'id', isDark = true
let lastChatReply = '', lastImgReply = ''

const T = {
  id: {
    heroTitle: 'Masak apa hari ini,<br><em>chef?</em>',
    heroSub: 'Ketik bahan yang ada — atau foto makananmu',
    emptyTxt: 'Ceritakan bahan yang kamu punya<br>dan kami siapkan resepnya',
    inputPh: 'Contoh: ayam, bawang putih, tomat, keju…',
    sendBtn: 'Cari →', imgBtn: 'Analisa →',
    imgPh: 'Tanya opsional — "ini makanan apa?" atau biarkan kosong…',
    dropStrong: 'Klik atau seret foto ke sini',
    dropSub: 'Foto makanan atau bahan — AI identifikasi & buat resepnya',
    resultStamp: 'Hasil Analisa Foto',
    pdfBarLabel: 'Resep siap — unduh sebagai PDF dengan timeline memasak',
    imgPdfLabel: 'Hasil siap — unduh sebagai PDF dengan timeline memasak',
    chatMeta: 'Menghubungi dapur AI',
    imgMeta: 'AI menganalisa bahan & hidangan',
    pdfMeta: 'Menyusun PDF…',
    chatPhrases: ['Meramu resep terbaik…','Menimbang bumbu rahasia…','Bertanya pada chef AI…','Menyusun langkah memasak…','Hampir siap disajikan…'],
    imgPhrases: ['Memindai gambar…','Mengenali bahan & hidangan…','Menyusun resep dari foto…','Menyelesaikan resep…'],
    pdfPhrases: ['Menyiapkan layout PDF…','Menyusun timeline memasak…','Menambahkan detail resep…','Hampir selesai…'],
    youLabel: 'Kamu', aiLabel: '✦ Resep AI',
    errMsg: 'Gagal terhubung ke server.', errPdf: 'Gagal membuat PDF.',
  },
  en: {
    heroTitle: "What's cooking today,<br><em>chef?</em>",
    heroSub: 'Type your ingredients — or upload a photo',
    emptyTxt: "Tell us what ingredients you have<br>and we'll find you a recipe",
    inputPh: 'e.g. chicken, garlic, tomatoes, cheese…',
    sendBtn: 'Search →', imgBtn: 'Analyse →',
    imgPh: 'Optional question — "what food is this?" or leave empty…',
    dropStrong: 'Click or drag a photo here',
    dropSub: 'Photo of food or ingredients — AI identifies & creates recipe',
    resultStamp: 'Photo Analysis Result',
    pdfBarLabel: 'Recipe ready — download as PDF with cooking timeline',
    imgPdfLabel: 'Result ready — download as PDF with cooking timeline',
    chatMeta: 'Connecting to AI kitchen',
    imgMeta: 'AI is analysing food & ingredients',
    pdfMeta: 'Building PDF…',
    chatPhrases: ['Crafting the best recipe…','Weighing secret spices…','Asking the AI chef…','Organising cooking steps…','Almost ready to serve…'],
    imgPhrases: ['Scanning image…','Recognising ingredients & dishes…','Building recipe from photo…','Finishing the recipe…'],
    pdfPhrases: ['Preparing PDF layout…','Arranging cooking timeline…','Adding recipe details…','Almost done…'],
    youLabel: 'You', aiLabel: '✦ AI Recipe',
    errMsg: 'Could not connect to server.', errPdf: 'Failed to generate PDF.',
  }
}
const t = k => T[lang][k] || T.id[k]

function setLang(l, btn) {
  lang = l
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  applyStrings()
}

function applyStrings() {
  document.getElementById('heroTitle').innerHTML = t('heroTitle')
  document.getElementById('heroSub').textContent = t('heroSub')
  document.getElementById('emptyTxt').innerHTML = t('emptyTxt')
  document.getElementById('messageInput').placeholder = t('inputPh')
  document.getElementById('sendBtn').textContent = t('sendBtn')
  document.getElementById('imagePrompt').placeholder = t('imgPh')
  document.getElementById('imgBtn').textContent = t('imgBtn')
  document.getElementById('dropStrong').textContent = t('dropStrong')
  document.getElementById('dropSub').textContent = t('dropSub')
  document.getElementById('resultStampTxt').textContent = t('resultStamp')
  document.getElementById('pdfBarLabel').textContent = t('pdfBarLabel')
  document.getElementById('imgPdfLabel').textContent = t('imgPdfLabel')
  document.querySelectorAll('.chip').forEach(c => c.textContent = lang === 'en' ? c.dataset.en : c.dataset.id)
  document.querySelectorAll('.tab-btn').forEach(b => b.textContent = lang === 'en' ? b.dataset.en : b.dataset.id)
}

function toggleTheme() {
  isDark = !isDark
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️'
}

function switchTab(name, el) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
  el.classList.add('active')
  document.getElementById('panel-' + name).classList.add('active')
}

function fillChip(el) {
  document.getElementById('messageInput').value = el.textContent.trim()
  document.getElementById('messageInput').focus()
}

function renderMD(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<h2>$1</h2>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

function rotatePhrases(phraseId, metaId, phrasesKey, metaKey) {
  const el = document.getElementById(phraseId)
  const mel = document.getElementById(metaId)
  const phrases = t(phrasesKey)
  if (mel) mel.textContent = t(metaKey)
  let i = 0
  el.textContent = phrases[0]
  return setInterval(() => {
    i = (i + 1) % phrases.length
    el.textContent = phrases[i]
  }, 2700)
}

async function sendMessage() {
  const input = document.getElementById('messageInput')
  const history = document.getElementById('chatHistory')
  const loading = document.getElementById('chatLoading')
  const sendBtn = document.getElementById('sendBtn')
  const msg = input.value.trim()
  if (!msg) return

  const empty = document.getElementById('emptyState')
  if (empty) empty.remove()

  const userRow = document.createElement('div')
  userRow.className = 'msg-row user'
  userRow.innerHTML = `<div class="msg-label">${t('youLabel')}</div><div class="bubble">${msg}</div>`
  history.appendChild(userRow)

  input.value = ''
  sendBtn.disabled = true
  loading.classList.add('show')
  document.getElementById('chatPdfBar').classList.remove('show')
  history.scrollTop = history.scrollHeight

  const timer = rotatePhrases('chatPhrase', 'chatMeta', 'chatPhrases', 'chatMeta')
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, lang })
    })
    const data = await res.json()
    clearInterval(timer)
    lastChatReply = data.reply || data.error || ''
    const aiRow = document.createElement('div')
    aiRow.className = 'msg-row ai'
    aiRow.innerHTML = `<div class="msg-label">${t('aiLabel')}</div><div class="bubble"><div class="md">${renderMD(lastChatReply || t('errMsg'))}</div></div>`
    history.appendChild(aiRow)
    if (lastChatReply) document.getElementById('chatPdfBar').classList.add('show')
  } catch {
    clearInterval(timer)
    const errRow = document.createElement('div')
    errRow.className = 'msg-row ai'
    errRow.innerHTML = `<div class="msg-label">Error</div><div class="bubble">${t('errMsg')}</div>`
    history.appendChild(errRow)
  }

  loading.classList.remove('show')
  sendBtn.disabled = false
  history.scrollTop = history.scrollHeight
}

let selectedFile = null

function handleFileSelect(e) {
  const f = e.target.files[0]
  if (f) setPreview(f)
}
function handleDragOver(e) {
  e.preventDefault()
  document.getElementById('dropZone').classList.add('drag-over')
}
function handleDragLeave() {
  document.getElementById('dropZone').classList.remove('drag-over')
}
function handleDrop(e) {
  e.preventDefault()
  document.getElementById('dropZone').classList.remove('drag-over')
  const f = e.dataTransfer.files[0]
  if (f && f.type.startsWith('image/')) setPreview(f)
}
function setPreview(file) {
  selectedFile = file
  const r = new FileReader()
  r.onload = e => {
    document.getElementById('previewImg').src = e.target.result
    document.getElementById('previewWrap').style.display = 'block'
    document.getElementById('dropZone').style.display = 'none'
    document.getElementById('imgResult').style.display = 'none'
    document.getElementById('imgPdfBar').classList.remove('show')
  }
  r.readAsDataURL(file)
}
function clearImage() {
  selectedFile = null
  document.getElementById('previewWrap').style.display = 'none'
  document.getElementById('dropZone').style.display = 'block'
  document.getElementById('imageFile').value = ''
  document.getElementById('imgResult').style.display = 'none'
  document.getElementById('imgPdfBar').classList.remove('show')
}

async function analyzeImage() {
  if (!selectedFile) {
    alert(lang === 'id' ? 'Pilih foto dulu!' : 'Please select a photo first!')
    return
  }
  const prompt = document.getElementById('imagePrompt').value.trim()
  const loading = document.getElementById('imgLoading')
  const result = document.getElementById('imgResult')
  const imgBtn = document.getElementById('imgBtn')

  imgBtn.disabled = true
  loading.classList.add('show')
  result.style.display = 'none'
  document.getElementById('imgPdfBar').classList.remove('show')

  const timer = rotatePhrases('imgPhrase', 'imgMeta', 'imgPhrases', 'imgMeta')
  try {
    const fd = new FormData()
    fd.append('image', selectedFile)
    fd.append('lang', lang)
    if (prompt) fd.append('prompt', prompt)
    const res = await fetch('/api/image-recipe', { method: 'POST', body: fd })
    const data = await res.json()
    clearInterval(timer)
    lastImgReply = data.result || data.error || ''
    document.getElementById('imgResultContent').innerHTML = renderMD(lastImgReply || t('errMsg'))
    result.style.display = 'block'
    if (lastImgReply) document.getElementById('imgPdfBar').classList.add('show')
  } catch {
    clearInterval(timer)
    document.getElementById('imgResultContent').innerHTML = t('errMsg')
    result.style.display = 'block'
  }

  loading.classList.remove('show')
  imgBtn.disabled = false
}

async function exportPdf(source) {
  const recipeText = source === 'chat' ? lastChatReply : lastImgReply
  const btnId  = source === 'chat' ? 'chatPdfBtn' : 'imgPdfBtn'
  const loadId = source === 'chat' ? 'chatLoading' : 'imgLoading'
  const phrId  = source === 'chat' ? 'chatPhrase'  : 'imgPhrase'
  const metaId = source === 'chat' ? 'chatMeta'    : 'imgMeta'

  const btn     = document.getElementById(btnId)
  const loading = document.getElementById(loadId)
  btn.disabled = true
  loading.classList.add('show')
  const timer = rotatePhrases(phrId, metaId, 'pdfPhrases', 'pdfMeta')

  try {
    const res = await fetch('/api/parse-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeText, lang })
    })
    const recipe = await res.json()
    clearInterval(timer)
    buildPdf(recipe)
  } catch {
    clearInterval(timer)
    alert(t('errPdf'))
  }

  loading.classList.remove('show')
  btn.disabled = false
}

function buildPdf(r) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, ml = 20, mr = 20, cw = W - ml - mr
  let y = 20

  const GOLD    = [168, 118, 42]
  const DARK    = [26, 26, 22]
  const MID     = [90, 85, 72]
  const STEP_BG = [250, 245, 235]
  const LINE    = [220, 210, 195]

  const stripMD = s => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/^#{1,3} /gm, '')

  const setFont = (style, size, color) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(...(color || DARK))
  }
  const drawLine = (x1, y1, x2, y2, color, w = 0.3) => {
    doc.setDrawColor(...(color || LINE))
    doc.setLineWidth(w)
    doc.line(x1, y1, x2, y2)
  }
  const drawRect = (x, yy, w, h, color) => {
    doc.setFillColor(...color)
    doc.rect(x, yy, w, h, 'F')
  }
  const wrapText = (txt, maxW, fontSize) => {
    doc.setFontSize(fontSize)
    return doc.splitTextToSize(txt, maxW)
  }
  const checkPage = (needed = 10) => {
    if (y + needed > 280) { doc.addPage(); y = 20 }
  }

  setFont('bold', 22, GOLD)
  doc.text(stripMD(r.title || 'Recipe'), ml, y); y += 8

  setFont('normal', 10, MID)
  doc.text(stripMD(r.subtitle || 'Find Your Recipe'), ml, y); y += 6

  drawLine(ml, y, W - mr, y, GOLD, 0.6); y += 8

  const metas = []
  if (r.total_time) metas.push([lang === 'id' ? 'TOTAL WAKTU' : 'TOTAL TIME', r.total_time])
  if (r.servings)   metas.push([lang === 'id' ? 'PORSI'       : 'SERVINGS',   r.servings])
  if (r.difficulty) metas.push([lang === 'id' ? 'TINGKAT'     : 'LEVEL',      r.difficulty])

  if (metas.length) {
    const bw = cw / metas.length
    drawRect(ml, y, cw, 16, STEP_BG)
    metas.forEach(([label, val], i) => {
      const bx = ml + i * bw
      setFont('normal', 7, MID);  doc.text(label, bx + 5, y + 5)
      setFont('bold',   10, DARK); doc.text(val,   bx + 5, y + 12)
    })
    y += 22
  }

  checkPage(16)
  setFont('bold', 8, GOLD)
  doc.text(lang === 'id' ? 'BAHAN-BAHAN' : 'INGREDIENTS', ml, y); y += 6

  ;(r.ingredients || []).forEach(ing => {
    checkPage(7)
    setFont('normal', 9, DARK)
    const lines = wrapText(`• ${stripMD(ing)}`, cw - 4, 9)
    doc.text(lines, ml + 2, y)
    y += lines.length * 5
  })
  y += 4

  drawLine(ml, y, W - mr, y, LINE, 0.3); y += 6

  setFont('bold', 8, GOLD)
  doc.text(lang === 'id' ? 'LANGKAH MEMASAK' : 'COOKING STEPS', ml, y); y += 6

  ;(r.steps || []).forEach((step, i) => {
    const stepLines = wrapText(stripMD(step.text), cw - 18, 9)
    const rowH = stepLines.length * 5 + (step.time ? 10 : 4) + 8
    checkPage(rowH)

    const bg = i % 2 === 0 ? [255, 255, 255] : STEP_BG
    drawRect(ml, y, cw, rowH, bg)

    setFont('bold', 14, GOLD)
    doc.text(String(i + 1), ml + 4, y + 8)

    setFont('normal', 9, DARK)
    doc.text(stepLines, ml + 14, y + 7)

    if (step.time) {
      const ty = y + stepLines.length * 5 + 5
      setFont('bold', 8, MID)
      doc.text(`[ ${step.time} ]`, ml + 14, ty)
    }

    drawLine(ml, y + rowH, W - mr, y + rowH, LINE, 0.25)
    y += rowH
  })


  if (r.tips && r.tips.length) {
    y += 6; checkPage(14)
    setFont('bold', 8, GOLD)
    doc.text(lang === 'id' ? 'TIPS & CATATAN' : 'TIPS & NOTES', ml, y); y += 6
    r.tips.forEach(tip => {
      checkPage(7)
      setFont('normal', 9, DARK)
      const lines = wrapText(`- ${stripMD(tip)}`, cw - 4, 9)
      doc.text(lines, ml + 2, y)
      y += lines.length * 5
    })
  }

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    drawLine(ml, 285, W - mr, 285, GOLD, 0.4)
    setFont('normal', 7, MID)
    doc.text('Find Your Recipe — AI Cooking Assistant', W / 2, 290, { align: 'center' })
    if (pages > 1) doc.text(`${p} / ${pages}`, W - mr, 290, { align: 'right' })
  }

  doc.save(`recipe-${Date.now()}.pdf`)
}


applyStrings()