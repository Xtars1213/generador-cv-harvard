/**
 * MAIN.JS - Versión de Ingeniería Final (Integrada y Persistente)
 * Modificación: Persistencia de bloques dinámicos y blindaje de UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.addEventListener('input', () => {
            if (window.updateCV) window.updateCV();
            updateProgressBar();
            saveData(); // Ahora guarda TODO
        });
    }

    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
        printBtn.onclick = async () => {
            const element = document.getElementById('cv-page');
            const userName = document.getElementById('in-name').value.trim() || "CV";

            // PROBLEMA: html2pdf margin aplica a TODAS las páginas incluyendo la 1ra.
            // El elemento ya tiene padding:25.4mm, sumando doble margen en el top.
            // SOLUCIÓN: quitar temporalmente el padding top/bottom del elemento,
            // y dejar que html2pdf los maneje uniformemente en cada página.
            element.style.paddingTop    = '0';
            element.style.paddingBottom = '0';

            const opt = {
                // left/right = 0: el elemento retiene padding:25.4mm izq/der
                // top/bottom = 25mm: html2pdf los aplica igual en todas las páginas
                margin:   [25, 0, 25, 0],
                filename: `CV_${userName.replace(/\s+/g, '_')}_Harvard.pdf`,
                image:    { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale:           2,
                    useCORS:         true,
                    letterRendering: true,
                    logging:         false
                },
                jsPDF: {
                    unit:        'mm',
                    format:      'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            try {
                await html2pdf().set(opt).from(element).save();
            } finally {
                // Restaurar el padding para que la vista previa quede igual
                element.style.paddingTop    = '';
                element.style.paddingBottom = '';
            }
        };
    }

    const uploadInput = document.getElementById('pdf-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const btnLabel = document.getElementById('file-name-display');
            if (btnLabel) btnLabel.innerText = '⏳ Procesando...';

            try {
                const data = await processPDF(file);
                autoFillForm(data);
                console.log("✅ Importación exitosa");
            } catch (err) {
                console.error("❌ Error real de PDF:", err);
                alert("No pudimos leer el PDF. Asegúrate de que no tenga contraseña o esté dañado.");
            } finally {
                if (btnLabel) btnLabel.innerText = file.name;
            }
        });
    }
});

window.resetForm = function () {
    if (confirm("¿Estás seguro de limpiar todo el CV? Esta acción es irreversible.")) {
        localStorage.removeItem('cvData');
        location.reload();
    }
};

/**
 * Modificación en autoFillForm (js/main.js)
 */
function autoFillForm(data) {
    if (!data) return;

    // 1. Limpiar listas para evitar duplicados
    document.querySelectorAll('.dynamic-list').forEach(l => l.innerHTML = "");

    // 2. Cargar Información Básica [cite: 1, 2]
    const basicFields = {
        'in-name': data.name,
        'in-email': data.email,
        'in-phone': data.phone,
        'in-linkedin': data.linkedin,
        'in-github': data.github,
        'in-location': data.location,
        'in-summary': data.summary,
        'in-title': data.title,
        'in-show-title': data['show-title'],
        'in-skills-tech': data['skills-tech'],
        'in-skills-soft': data['skills-soft']
    };

    for (const [id, val] of Object.entries(basicFields)) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.checked = val === true;
            else if (val !== undefined) el.value = val;
        }
    }

    // 3. Cargar Experiencias
    if (data.experiencias) {
        data.experiencias.forEach(exp => {
            window.addEntry('experiencia');
            const last = document.querySelector('#list-experiencia .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-company').value = exp.company || exp.t1 || "";
                last.querySelector('.val-role').value = exp.role || exp.t2 || "";
                last.querySelector('.val-date').value = exp.date || "";
                last.querySelector('.val-desc').value = exp.desc || "";
            }
        });
    }

    // 4. Cargar Educación
    if (data.educaciones) {
        data.educaciones.forEach(edu => {
            window.addEntry('educacion');
            const last = document.querySelector('#list-educacion .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-school').value = edu.school || edu.t1 || "";
                last.querySelector('.val-degree').value = edu.degree || edu.t2 || "";
                last.querySelector('.val-end').value = edu.end || edu.date || "";
                last.querySelector('.val-edu-desc').value = edu.desc || "";
                if (edu.current && last.querySelector('.val-current')) {
                    last.querySelector('.val-current').checked = true;
                }
            }
        });
    }

    // 5. Cargar Idiomas
    if (data.idiomas) {
        data.idiomas.forEach(lang => {
            window.addEntry('idiomas');
            const last = document.querySelector('#list-idiomas .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-lang').value = lang.lang || lang.t1 || "";
                const levelSel = last.querySelector('.val-level');
                if (levelSel) levelSel.value = lang.level || lang.t2 || "Nativo / Bilinguüe";
                if (lang.reading   && last.querySelector('.val-reading'))   last.querySelector('.val-reading').value   = lang.reading;
                if (lang.writing   && last.querySelector('.val-writing'))   last.querySelector('.val-writing').value   = lang.writing;
                if (lang.speaking  && last.querySelector('.val-speaking'))  last.querySelector('.val-speaking').value  = lang.speaking;
                if (lang.listening && last.querySelector('.val-listening')) last.querySelector('.val-listening').value = lang.listening;
                if (lang.cert      && last.querySelector('.val-lang-cert')) last.querySelector('.val-lang-cert').value = lang.cert;
            }
        });
    }

    // 6. Cargar Certificaciones
    if (data.certificaciones) {
        data.certificaciones.forEach(cert => {
            window.addEntry('certificaciones');
            const last = document.querySelector('#list-certificaciones .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-cert-name').value = cert.name || "";
                last.querySelector('.val-cert-org').value = cert.org || "";
                last.querySelector('.val-cert-desc').value = cert.desc || "";
            }
        });
    }

    // 7. Cargar Referencias
    if (data.referencias) {
        data.referencias.forEach(ref => {
            window.addEntry('referencias');
            const last = document.querySelector('#list-referencias .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-ref-name').value = ref.name || "";
                last.querySelector('.val-ref-contact').value = ref.contact || "";
                last.querySelector('.val-ref-text').value = ref.text || "";
            }
        });
    }

    // Sincronizar vista previa
    if (window.updateCV) window.updateCV();
}

/**
 * Persistencia TOTAL (Ingeniería Final)
 */
function saveData() {
    const data = {
        experiencias: [],
        educaciones: [],
        idiomas: [],
        certificaciones: [],
        referencias: []
    };

    // 1. Guardar campos estáticos (Inputs y Checkboxes)
    document.querySelectorAll('input[id^="in-"], textarea[id^="in-"]').forEach(i => {
        const key = i.id.replace('in-', '');
        data[key] = (i.type === 'checkbox') ? i.checked : i.value;
    });

    // 2. Guardar Experiencias
    document.querySelectorAll('#list-experiencia .dynamic-block').forEach(b => {
        data.experiencias.push({
            company: b.querySelector('.val-company')?.value,
            role: b.querySelector('.val-role')?.value,
            date: b.querySelector('.val-date')?.value,
            desc: b.querySelector('.val-desc')?.value
        });
    });

    // 3. Guardar Educación
    document.querySelectorAll('#list-educacion .dynamic-block').forEach(b => {
        data.educaciones.push({
            school: b.querySelector('.val-school')?.value,
            degree: b.querySelector('.val-degree')?.value,
            end: b.querySelector('.val-end')?.value,
            desc: b.querySelector('.val-edu-desc')?.value,
            current: b.querySelector('.val-current')?.checked
        });
    });

    // 4. Guardar Idiomas
    document.querySelectorAll('#list-idiomas .dynamic-block').forEach(b => {
        data.idiomas.push({
            lang:      b.querySelector('.val-lang')?.value,
            level:     b.querySelector('.val-level')?.value,
            reading:   b.querySelector('.val-reading')?.value,
            writing:   b.querySelector('.val-writing')?.value,
            speaking:  b.querySelector('.val-speaking')?.value,
            listening: b.querySelector('.val-listening')?.value,
            cert:      b.querySelector('.val-lang-cert')?.value,
        });
    });

    // 5. Guardar Certificaciones
    document.querySelectorAll('#list-certificaciones .dynamic-block').forEach(b => {
        data.certificaciones.push({
            name: b.querySelector('.val-cert-name')?.value,
            org: b.querySelector('.val-cert-org')?.value,
            desc: b.querySelector('.val-cert-desc')?.value
        });
    });

    // 6. Guardar Referencias
    document.querySelectorAll('#list-referencias .dynamic-block').forEach(b => {
        data.referencias.push({
            name: b.querySelector('.val-ref-name')?.value,
            contact: b.querySelector('.val-ref-contact')?.value,
            text: b.querySelector('.val-ref-text')?.value
        });
    });

    localStorage.setItem('cvData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('cvData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Pequeño delay para asegurar que los scripts de UI carguen sus templates
            setTimeout(() => autoFillForm(data), 200);
        } catch (e) { console.error("Error al cargar datos."); }
    }
}

function updateProgressBar() {
    const inputs = document.querySelectorAll('input[id^="in-"], textarea[id^="in-"]');
    let filled = 0;
    inputs.forEach(i => { if (i.value.trim() !== "") filled++; });
    const pct = inputs.length > 0 ? Math.round((filled / inputs.length) * 100) : 0;
    const bar = document.getElementById('progress');
    if (bar) bar.style.width = pct + "%";
}