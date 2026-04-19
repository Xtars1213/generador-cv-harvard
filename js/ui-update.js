/**
 * UI-UPDATE.JS - Versión de Ingeniería Final
 * Maneja plantillas dinámicas, sincronización real-time y formato Harvard.
 */

const PAGE_HEIGHT_LIMIT = 1050;

// 1. PLANTILLAS PARA BLOQUES DINÁMICOS (Formulario)
const templates = {
    experiencia: `
        <div class="dynamic-block">
            <button class="btn-remove" onclick="removeEntry(this)">×</button>
            <div class="input-group full-width"><label>Empresa</label><input type="text" class="val-company" oninput="updateCV()"></div>
            <div class="input-group"><label>Cargo</label><input type="text" class="val-role" oninput="updateCV()"></div>
            <div class="input-group"><label>Periodo</label><input type="text" class="val-date" placeholder="Ene 2024 - Presente" oninput="updateCV()"></div>
            <div class="input-group full-width"><label>Logros Principales</label><textarea class="val-desc" rows="3" oninput="updateCV()"></textarea></div>
        </div>`,
    // BUSCA ESTO EN js/ui-update.js Y REEMPLÁZALO
    educacion: `
    <div class="dynamic-block">
        <button class="btn-remove" onclick="removeEntry(this)">×</button>
        <div class="input-group full-width">
            <label>🏛️ Institución</label>
            <input type="text" class="val-school" placeholder="Universidad de Guayaquil" oninput="updateCV()">
        </div>
        <div class="input-group">
            <label>🎓 Título / Carrera</label>
            <input type="text" class="val-degree" placeholder="Ing. en Sistemas" oninput="updateCV()">
        </div>
        <div class="input-group">
            <label>🏁 Fecha Fin</label>
            <input type="text" class="val-end" placeholder="Dic 2026" oninput="updateCV()">
            <label class="checkbox-container">
                <input type="checkbox" class="val-current" onchange="updateCV()">
                <span>En curso</span>
            </label>
        </div>
        <div class="input-group full-width">
            <label>📝 Detalles / Logros Académicos</label>
            <textarea class="val-edu-desc" rows="2" placeholder="Ej: Especialización en análisis de datos, promedio sobresaliente..." oninput="updateCV()"></textarea>
        </div>
    </div>`,
    idiomas: `
        <div class="dynamic-block" style="grid-template-columns: 1fr 1fr;">
            <button class="btn-remove" onclick="removeEntry(this)">×</button>
            <div class="input-group full-width"><label>🌐 Idioma</label><input type="text" class="val-lang" oninput="updateCV()" placeholder="Ej: Inglés, Francés, Portugués"></div>
            <div class="input-group full-width"><label>Nivel General (Marco CEFR)</label>
                <select class="val-level" onchange="updateCV()">
                    <option value="Nativo / Bilingüe">Nativo / Bilingüe</option>
                    <option value="Avanzado (C2)">Avanzado (C2) – Maestría</option>
                    <option value="Avanzado (C1)">Avanzado (C1) – Eficacia Profesional</option>
                    <option value="Intermedio Alto (B2)">Intermedio Alto (B2)</option>
                    <option value="Intermedio (B1)">Intermedio (B1)</option>
                    <option value="Básico Alto (A2)">Básico Alto (A2)</option>
                    <option value="Básico (A1)">Básico (A1)</option>
                </select>
            </div>
            <div class="input-group"><label>📖 Lectura</label>
                <select class="val-reading" onchange="updateCV()">
                    <option value="">— No especificar —</option>
                    <option value="Nativo">Nativo</option>
                    <option value="C2">C2 – Maestría</option>
                    <option value="C1">C1 – Avanzado</option>
                    <option value="B2">B2 – Int. Alto</option>
                    <option value="B1">B1 – Intermedio</option>
                    <option value="A2">A2 – Básico Alto</option>
                    <option value="A1">A1 – Básico</option>
                </select>
            </div>
            <div class="input-group"><label>✍️ Escritura</label>
                <select class="val-writing" onchange="updateCV()">
                    <option value="">— No especificar —</option>
                    <option value="Nativo">Nativo</option>
                    <option value="C2">C2 – Maestría</option>
                    <option value="C1">C1 – Avanzado</option>
                    <option value="B2">B2 – Int. Alto</option>
                    <option value="B1">B1 – Intermedio</option>
                    <option value="A2">A2 – Básico Alto</option>
                    <option value="A1">A1 – Básico</option>
                </select>
            </div>
            <div class="input-group"><label>🗣️ Oral / Habla</label>
                <select class="val-speaking" onchange="updateCV()">
                    <option value="">— No especificar —</option>
                    <option value="Nativo">Nativo</option>
                    <option value="C2">C2 – Maestría</option>
                    <option value="C1">C1 – Avanzado</option>
                    <option value="B2">B2 – Int. Alto</option>
                    <option value="B1">B1 – Intermedio</option>
                    <option value="A2">A2 – Básico Alto</option>
                    <option value="A1">A1 – Básico</option>
                </select>
            </div>
            <div class="input-group"><label>👂 Comprensión Auditiva</label>
                <select class="val-listening" onchange="updateCV()">
                    <option value="">— No especificar —</option>
                    <option value="Nativo">Nativo</option>
                    <option value="C2">C2 – Maestría</option>
                    <option value="C1">C1 – Avanzado</option>
                    <option value="B2">B2 – Int. Alto</option>
                    <option value="B1">B1 – Intermedio</option>
                    <option value="A2">A2 – Básico Alto</option>
                    <option value="A1">A1 – Básico</option>
                </select>
            </div>
            <div class="input-group full-width"><label>📜 Certificación (opcional)</label><input type="text" class="val-lang-cert" placeholder="Ej: IELTS 7.0, TOEFL 95, Cambridge B2" oninput="updateCV()"></div>
        </div>`,
    certificaciones: `
        <div class="dynamic-block">
            <button class="btn-remove" onclick="removeEntry(this)">×</button>
            <div class="input-group"><label>Certificado</label><input type="text" class="val-cert-name" oninput="updateCV()"></div>
            <div class="input-group"><label>Entidad</label><input type="text" class="val-cert-org" oninput="updateCV()"></div>
            <div class="input-group full-width"><label>Breve descripción</label><textarea class="val-cert-desc" rows="2" oninput="updateCV()"></textarea></div>
        </div>`,
    referencias: `
        <div class="dynamic-block">
            <button class="btn-remove" onclick="removeEntry(this)">×</button>
            <div class="input-group"><label>Nombre</label><input type="text" class="val-ref-name" oninput="updateCV()"></div>
            <div class="input-group"><label>Contacto</label><input type="text" class="val-ref-contact" oninput="updateCV()"></div>
            <div class="input-group full-width"><label>Carta / Recomendación</label><textarea class="val-ref-text" rows="3" oninput="updateCV()"></textarea></div>
        </div>`
};

// 2. FUNCIONES GLOBALES DE CONTROL
window.addEntry = function (section) {
    const container = document.getElementById(`list-${section}`);
    if (container && templates[section]) {
        container.insertAdjacentHTML('beforeend', templates[section]);
        window.updateCV();
    }
};

window.removeEntry = function (btn) {
    btn.parentElement.remove();
    window.updateCV();
};

window.openTab = function (event, tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

// 3. MOTOR DE RENDERIZADO (Sincronización Total)
// Dentro de tu archivo js/ui-update.js

window.updateCV = function () {
    // 1. Datos Personales Centrados (Respetando mayúsculas/minúsculas)
    const name = document.getElementById('in-name')?.value || "Victor Manuel Cuesta Borbor";
    document.getElementById('out-name').innerText = name;

    // 1.1 Titular Adicional
    const title = document.getElementById('in-title')?.value || "";
    const showTitle = document.getElementById('in-show-title')?.checked;
    const outTitle = document.getElementById('out-title');
    if (outTitle) {
        outTitle.innerText = title;
        outTitle.style.display = (title && showTitle) ? 'block' : 'none';
    }

    // Extraemos los contactos por separado
    const loc = document.getElementById('in-location')?.value || "";
    const phone = document.getElementById('in-phone')?.value || "";
    const email = document.getElementById('in-email')?.value || "";
    const linkedin = document.getElementById('in-linkedin')?.value || "";
    const github = document.getElementById('in-github')?.value || "";

    // Toda la info de contacto en UNA sola línea centrada con separadores |
    const allContacts = [loc, phone, email, linkedin, github].filter(v => v.trim() !== "").join(' | ');
    let contactHtml = "";
    if (allContacts) contactHtml = `<span>${allContacts}</span>`;
    document.getElementById('out-contact').innerHTML = contactHtml;

    // 2. Perfil Profesional Justificado (preservar saltos de línea y espacios)
    const summary = document.getElementById('in-summary')?.value || "";
    const outSummary = document.getElementById('out-summary');
    if (outSummary) {
        outSummary.innerHTML = `<p style="white-space: pre-wrap; margin:0; text-align: justify;">${summary}</p>`;
        outSummary.style.whiteSpace = 'pre-wrap';
    }
    document.getElementById('sec-resumen').style.display = summary ? 'block' : 'none';


    // Función Helper para crear viñetas a partir de texto con saltos de línea
    const formatDesc = (text) => {
        if (!text) return "";
        const points = text.split('\n').filter(p => p.trim() !== "");
        if (points.length === 1 && !points[0].includes('•') && !points[0].includes('-')) {
            return `<p>${points[0]}</p>`; // Si es solo un párrafo
        }
        let listHtml = "<ul>";
        points.forEach(p => {
            // Limpiamos viñetas manuales que el usuario haya escrito
            let cleanPoint = p.replace(/^[-•]\s*/, '').trim();
            listHtml += `<li>${cleanPoint}</li>`;
        });
        listHtml += "</ul>";
        return listHtml;
    };

    // C. Educación
    renderList('educacion', b => {
        const school = b.querySelector('.val-school').value;
        const degree = b.querySelector('.val-degree').value;
        const desc = b.querySelector('.val-edu-desc').value;
        const end = b.querySelector('.val-current').checked ? "Presente" : b.querySelector('.val-end').value;

        if (!school && !degree) return "";

        return `
        <div class="cv-item">
            <div class="cv-item-header">
                <span>${school}</span>
                <span>${end}</span>
            </div>
            <div class="cv-item-sub">${degree}</div>
            <div class="cv-item-desc preserve-whitespace">${formatDesc(desc)}</div>
        </div>`;
    });

    // D. Experiencia
    renderList('experiencia', b => {
        const company = b.querySelector('.val-company').value;
        const role = b.querySelector('.val-role').value;
        const date = b.querySelector('.val-date').value;
        const desc = b.querySelector('.val-desc').value;

        if (!company && !role) return "";

        return `
        <div class="cv-item">
            <div class="cv-item-header">
                <span>${company}</span>
                <span>${date}</span>
            </div>
            <div class="cv-item-sub">${role}</div>
            <div class="cv-item-desc preserve-whitespace">${formatDesc(desc)}</div>
        </div>`;
    });

    // E. Habilidades
    const tech = document.getElementById('in-skills-tech')?.value || "";
    const soft = document.getElementById('in-skills-soft')?.value || "";

    const techOut = document.getElementById('out-skills-tech');
    const softOut = document.getElementById('out-skills-soft');
    const skillsSec = document.getElementById('sec-habilidades');

    if (techOut) {
        techOut.innerText = tech;
        techOut.classList.add('preserve-whitespace');
    }
    if (softOut) {
        softOut.innerText = soft;
        softOut.classList.add('preserve-whitespace');
    }

    if (skillsSec) {
        skillsSec.style.display = (tech || soft) ? 'block' : 'none';
        // Ocultar párrafos individuales si están vacíos
        if (techOut) techOut.parentElement.style.display = tech ? 'block' : 'none';
        if (softOut) softOut.parentElement.style.display = soft ? 'block' : 'none';
    }


    // F. Idiomas — con desglose individual de habilidades
    renderList('idiomas', b => {
        const lang     = b.querySelector('.val-lang')?.value || '';
        const level    = b.querySelector('.val-level')?.value || '';
        const reading  = b.querySelector('.val-reading')?.value || '';
        const writing  = b.querySelector('.val-writing')?.value || '';
        const speaking = b.querySelector('.val-speaking')?.value || '';
        const listening= b.querySelector('.val-listening')?.value || '';
        const cert     = b.querySelector('.val-lang-cert')?.value || '';

        if (!lang) return '';

        const skillParts = [
            reading  ? `Lectura: <strong>${reading}</strong>`       : '',
            writing  ? `Escritura: <strong>${writing}</strong>`      : '',
            speaking ? `Oral: <strong>${speaking}</strong>`          : '',
            listening? `Comprensión: <strong>${listening}</strong>`  : '',
        ].filter(s => s !== '');

        let skillLine = skillParts.join(' &nbsp;|&nbsp; ');
        if (cert) skillLine += (skillLine ? ' &nbsp;•&nbsp; ' : '') + `<em>Cert: ${cert}</em>`;

        return `
        <div class="cv-item" style="margin-bottom:6px;">
            <div class="cv-item-header">
                <span><strong>${lang}</strong></span>
                <span>${level}</span>
            </div>
            ${skillLine ? `<div style="font-size:9.5pt; color:#333; margin-top:2px;">${skillLine}</div>` : ''}
        </div>`;
    });

    // G. Certificaciones
    renderList('certificaciones', b => {
        const name = b.querySelector('.val-cert-name').value;
        const org = b.querySelector('.val-cert-org').value;
        const desc = b.querySelector('.val-cert-desc').value;

        if (!name) return "";

        return `
        <div class="cv-item">
            <div class="cv-item-header">
                <span>${name}</span>
                <span>${org}</span>
            </div>
            <div class="cv-item-desc preserve-whitespace">${formatDesc(desc)}</div>
        </div>`;
    });

    // H. Referencias
    renderList('referencias', b => {
        const name = b.querySelector('.val-ref-name').value;
        const contact = b.querySelector('.val-ref-contact').value;
        const text = b.querySelector('.val-ref-text').value;

        if (!name) return "";

        return `
        <div class="cv-item">
            <div class="cv-item-header">
                <span>${name}</span>
                <span>${contact}</span>
            </div>
            <div class="cv-item-desc preserve-whitespace">${formatDesc(text)}</div>
        </div>`;
    });

    // Finalizar: Chequear paginación visual (preview)
    checkPagination();
};

// HELPER: Procesa cada bloque del formulario y lo lleva al CV
function renderList(type, templateFn, isInline = false) {
    const blocks = document.querySelectorAll(`#list-${type} .dynamic-block`);
    const output = document.getElementById(`out-${type}-list`);
    if (!output) return;

    let html = "";
    blocks.forEach(block => {
        html += templateFn(block);
    });

    output.innerHTML = html;
    const section = output.closest('.cv-section');
    if (section) section.style.display = html.trim() === "" ? "none" : "block";
}

function checkPagination() {
    // Indicador visual sutil cuando el CV excede el límite de una hoja A4
    const cvPage = document.getElementById('cv-page');
    if (!cvPage) return;

    const contentHeight = cvPage.scrollHeight;
    // ~1122px = altura de un A4 a 96dpi (297mm). Tolerancia de +20px.
    if (contentHeight > 1140) {
        // Sombra roja suave — profesional, sin bordes punteados
        cvPage.style.outline = "none";
        cvPage.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4), 0 0 0 3px rgba(239,68,68,0.5)";
    } else {
        cvPage.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
    }
}