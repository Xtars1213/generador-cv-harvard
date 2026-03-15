/**
 * PDF-HANDLER.JS - Versión "Anti-Troleo" (Rollback + Búsqueda Literal)
 */

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

async function processPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let lastY = null;
        for (const item of textContent.items) {
            const currentY = item.transform[5];
            if (lastY !== null && Math.abs(currentY - lastY) > 4) fullText += "\n";
            fullText += item.str + " ";
            lastY = currentY;
        }
        fullText += "\n";
    }

    // Limpiamos espacios extra pero dejamos los saltos de línea vitales
    const cleanText = fullText.replace(/[ \t]+/g, ' ').trim();
    return parseData(cleanText);
}

function parseData(text) {
    // 1. RECUPERAMOS LA EXTRACCIÓN QUE SÍ LEYÓ EL PERFIL
    const getSection = (startRegex, endRegex) => {
        const matchStart = text.match(startRegex);
        if (!matchStart) return "";
        const start = matchStart.index + matchStart[0].length;
        const matchEnd = text.match(endRegex);
        const end = matchEnd ? matchEnd.index : text.length;
        return text.substring(start, end).trim();
    };

    const rawPerfil = getSection(/(?:OBJETIVO|PERFIL)\s+PROFESIONAL/i, /FORMACI[OÓ]N\s+ACAD[EÉ]MICA/i);
    const rawEdu = getSection(/FORMACI[OÓ]N\s+ACAD[EÉ]MICA/i, /EXPERIENCIA\s+LABORAL/i);
    const rawExp = getSection(/EXPERIENCIA\s+LABORAL/i, /HABILIDADES/i);

    // 2. EXTRAER TARJETAS POR BÚSQUEDA LITERAL (Fuerza bruta con indexOf)
    const extractCards = (rawChunk, keywords) => {
        if (!rawChunk) return [];
        let found = [];

        // Buscar dónde está cada palabra clave exactamente
        keywords.forEach(kw => {
            let idx = rawChunk.toUpperCase().indexOf(kw.toUpperCase());
            if (idx !== -1) found.push({ word: kw, index: idx });
        });

        // Ordenar de arriba hacia abajo
        found.sort((a, b) => a.index - b.index);

        let cards = [];
        for (let i = 0; i < found.length; i++) {
            let start = found[i].index;
            let end = found[i + 1] ? found[i + 1].index : rawChunk.length;
            let cardRaw = rawChunk.substring(start, end).trim();

            // Separar en líneas y quitar basura de PDF
            let lines = cardRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l !== '","' && l !== '"');

            let title1 = found[i].word; // El ancla (Ej: Universidad de Guayaquil)

            // Borrar el ancla de la primera línea si quedó pegada
            if (lines[0] && lines[0].toUpperCase().includes(title1.toUpperCase())) {
                lines[0] = lines[0].substring(title1.length).replace(/^-/, '').trim();
                if (lines[0] === "") lines.shift();
            }

            // Buscar fecha donde sea que esté
            let dateRegex = /(?:[a-z]{3}\s\d{4}.*?(?:Presente|\d{4})|\d{4}\s*-\s*\d{4})/i;
            let dateStr = "";
            for (let j = 0; j < lines.length; j++) {
                if (dateRegex.test(lines[j])) {
                    dateStr = lines[j].match(dateRegex)[0];
                    lines[j] = lines[j].replace(dateRegex, '').replace(/,/g, '').trim();
                    if (lines[j] === "") { lines.splice(j, 1); j--; }
                }
            }

            let title2 = lines.length > 0 ? lines.shift() : "";
            let desc = lines.join('\n').replace(/^[-•]\s*/gm, '').trim();

            cards.push({ t1: title1, t2: title2, date: dateStr, desc: desc });
        }
        return cards;
    };

    // Palabras exactas que están en tu PDF
    const eduCards = extractCards(rawEdu, ["Universidad de Guayaquil", "Escuela Superior Politecnica"]);
    const expCards = extractCards(rawExp, ["Bootcamps Espol", "Universidad de Guayaquil", "Freelancer"]);

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    return {
        name: lines[0] || "VICTOR MANUEL CUESTA BORBOR",
        email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "",
        phone: text.match(/\+?[\d\s\-]{7,15}/)?.[0] || "",
        location: "Guayaquil, Ecuador",

        // El perfil que funcionaba perfecto
        summary: rawPerfil.replace(/\n/g, ' ').replace(/\s{2,}/g, ' '),

        // Mapeo directo para main.js
        educaciones: eduCards.map(c => ({
            school: c.t1, degree: c.t2, end: c.date, desc: c.desc, current: c.date.toLowerCase().includes("presente")
        })),
        experiencias: expCards.map(c => ({
            company: c.t1, role: c.t2, date: c.date, desc: c.desc
        }))
    };
}