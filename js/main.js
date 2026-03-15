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
        printBtn.onclick = () => {
            const element = document.getElementById('cv-page');
            const userName = document.getElementById('in-name').value.trim() || "Victor_Cuesta";
            const opt = {
                margin: 0,
                filename: `CV_${userName.replace(/\s+/g, '_')}_Harvard.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save();
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
        'in-location': data.location,
        'in-summary': data.summary // Tu "Sobre mí" [cite: 4]
    };

    for (const [id, val] of Object.entries(basicFields)) {
        const el = document.getElementById(id);
        if (el && val) el.value = val;
    }

    // 3. Cargar Experiencias [cite: 13, 24, 28]
    if (data.experiencias) {
        data.experiencias.forEach(exp => {
            window.addEntry('experiencia');
            const last = document.querySelector('#list-experiencia .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-company').value = exp.t1;
                last.querySelector('.val-role').value = exp.t2;
                last.querySelector('.val-date').value = exp.date;
                last.querySelector('.val-desc').value = exp.desc;
            }
        });
    }

    // 4. Cargar Educación [cite: 9, 11]
    if (data.educaciones) {
        data.educaciones.forEach(edu => {
            window.addEntry('educacion');
            const last = document.querySelector('#list-educacion .dynamic-block:last-child');
            if (last) {
                last.querySelector('.val-school').value = edu.t1;
                last.querySelector('.val-degree').value = edu.t2;
                last.querySelector('.val-end').value = edu.date;
                last.querySelector('.val-edu-desc').value = edu.desc;
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
        idiomas: []
    };

    // 1. Guardar campos estáticos
    document.querySelectorAll('input[id^="in-"], textarea[id^="in-"]').forEach(i => {
        data[i.id.replace('in-', '')] = i.value;
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
            lang: b.querySelector('.val-lang')?.value,
            level: b.querySelector('.val-level')?.value
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