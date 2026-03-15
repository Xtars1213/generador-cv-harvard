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
        <div class="dynamic-block" style="grid-template-columns: 1fr 1fr auto;">
            <div class="input-group"><label>Idioma</label><input type="text" class="val-lang" oninput="updateCV()"></div>
            <div class="input-group"><label>Nivel</label>
                <select class="val-level" onchange="updateCV()">
                    <option value="Nativo">Nativo</option>
                    <option value="Avanzado (C1/C2)">Avanzado</option>
                    <option value="Intermedio (B1/B2)">Intermedio</option>
                    <option value="Básico (A1/A2)">Básico</option>
                </select>
            </div>
            <button class="btn-remove" style="position:relative; top:20px; right:0" onclick="removeEntry(this)">×</button>
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
    document.getElementById('out-name').innerText = name; // Quitamos el .toUpperCase()

    // Extraemos los contactos por separado
    const loc = document.getElementById('in-location')?.value || "";
    const phone = document.getElementById('in-phone')?.value || "";
    const email = document.getElementById('in-email')?.value || "";
    const linkedin = document.getElementById('in-linkedin')?.value || "";

    // Unimos los primeros 3 con la barra |
    const line1 = [loc, phone, email].filter(v => v.trim() !== "").join(' | ');

    // Armamos el HTML con el salto de línea para el LinkedIn
    let contactHtml = "";
    if (line1) contactHtml += `<span>${line1}</span>`;
    if (linkedin) contactHtml += `<br><span>${linkedin}</span>`;

    document.getElementById('out-contact').innerHTML = contactHtml;

    // 2. Perfil Profesional Justificado
    const summary = document.getElementById('in-summary')?.value || "";
    document.getElementById('out-summary').innerHTML = `<p style="text-align: justify; margin: 0;">${summary}</p>`;
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
            <div class="cv-item-desc">${formatDesc(desc)}</div>
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
            <div class="cv-item-desc">${formatDesc(desc)}</div>
        </div>`;
    });

    // E. Habilidades (En línea, como en el PDF)
    const tech = document.getElementById('in-skills-tech')?.value || "";
    const soft = document.getElementById('in-skills-soft')?.value || "";

    let skillsHtml = "";
    if (tech) skillsHtml += `<p><strong>Técnicas:</strong> ${tech}</p>`;
    if (soft) skillsHtml += `<p><strong>Blandas:</strong> ${soft}</p>`;

    const skillsSec = document.getElementById('sec-habilidades');
    if (skillsSec) {
        document.getElementById('sec-habilidades').querySelector('.cv-item-desc').innerHTML = skillsHtml;
        skillsSec.style.display = (tech || soft) ? 'block' : 'none';
    }

    // F. Idiomas
    renderList('idiomas', b => `<span style="margin-right: 15px;">• <strong>${b.querySelector('.val-lang').value}:</strong> ${b.querySelector('.val-level').value}</span>`, true);
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
    const body = document.querySelector('.cv-body');
    if (body && body.scrollHeight > PAGE_HEIGHT_LIMIT) {
        if (!document.getElementById('page-2')) {
            const nextPage = document.createElement('div');
            nextPage.id = 'page-2';
            nextPage.className = 'a4-page';
            nextPage.innerHTML = `<div class="cv-body"><section class="cv-section"><h4>CONTINUACIÓN</h4><div id="out-overflow"></div></section></div>`;
            document.querySelector('.preview-area').appendChild(nextPage);
        }
    }
}