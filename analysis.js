// analysis.js
// Produktionsversion mit echter API-Integration für KI-Plausibilisierung des BauFi-Rechners

function initAnalysis() {
    // Event Listener für Haushaltsdaten-Inputs (optional, falls Validierung live erfolgen soll)
    // document.getElementById('monatliches-haushaltsnettoeinkommen')?.addEventListener('input', validateHaushaltsdaten);
    // document.getElementById('monatliche-kreditraten')?.addEventListener('input', validateHaushaltsdaten);

    // Analyse-Optionen Event-Listener initial deaktiviert, bis API-Key valide ist
    disableAnalysisOptions(); // Startet deaktiviert
    document.getElementById('marktdaten-analyse')?.addEventListener('click', () => startAnalysis('marktdaten'));
    document.getElementById('belastungs-analyse')?.addEventListener('click', () => startAnalysis('belastung'));
    document.getElementById('optimierungs-analyse')?.addEventListener('click', () => startAnalysis('optimierung'));
    document.getElementById('vollstaendige-analyse')?.addEventListener('click', () => startAnalysis('vollstaendig'));

    // Neue Analyse Button
    document.getElementById('neue-analyse')?.addEventListener('click', resetAnalysis);
}

// Analyse starten
async function startAnalysis(analyseTyp) {
    // Alten Fehlerstatus löschen
    const apiStatusDiv = document.getElementById('api-status');
    if (apiStatusDiv && !apiStatusDiv.classList.contains('hidden')) {
        const isValidationError = apiStatusDiv.innerHTML.includes('validiert') || apiStatusDiv.innerHTML.includes('ungültig');
        if (!isValidationError) {
             apiStatusDiv.classList.add('hidden');
             apiStatusDiv.innerHTML = '';
        }
    }
    window.BauFiRechner.dataCollectionError = null;

    // API-Schlüssel prüfen
    if (!window.BauFiRechner || !window.BauFiRechner.apiKey || !window.BauFiRechner.apiProvider) {
        if(typeof showApiStatus === 'function') {
             showApiStatus('error', 'Kein gültiger API-Schlüssel oder Provider ausgewählt. Bitte zuerst im API-Bereich validieren.');
        }
        document.getElementById('api-global-container')?.scrollIntoView({ behavior: 'smooth' });
        resetAnalysis();
        return;
    }

    // Analysedaten sammeln (inkl. Haushaltsdaten und Validierung)
    const analyseDaten = collectAnalysisData();

    if (!analyseDaten) {
         const errorMessage = window.BauFiRechner.dataCollectionError || 'Unbekannter Fehler beim Sammeln der Analysedaten. Bitte Eingaben prüfen.';
         if(typeof showApiStatus === 'function') {
             showApiStatus('error', `Analyse nicht möglich: ${errorMessage}`);
         }
         // Scroll zum Haushaltsdaten-Abschnitt, falls der Fehler das Einkommen betrifft
         if (errorMessage.toLowerCase().includes('haushaltsnettoeinkommen')) {
            document.getElementById('monatliches-haushaltsnettoeinkommen')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.getElementById('monatliches-haushaltsnettoeinkommen')?.focus();
         }
         return;
    }

    // Container anzeigen und Titel setzen
    const ergebnisContainer = document.getElementById('analyse-ergebnis-container');
    const optionenContainer = document.getElementById('analyse-optionen');
    const inhaltDiv = document.getElementById('analyse-inhalt');
    const titelElement = document.getElementById('analyse-titel');

    if (!ergebnisContainer || !optionenContainer || !inhaltDiv || !titelElement) return;

    ergebnisContainer.classList.remove('hidden');
    optionenContainer.classList.add('hidden');

    let analyseTitelText = "Analyseergebnis";
    switch (analyseTyp) {
        case 'marktdaten': analyseTitelText = "Marktdatenanalyse"; break;
        case 'belastung': analyseTitelText = "Belastbarkeitsanalyse"; break;
        case 'optimierung': analyseTitelText = "Optimierungsvorschläge"; break;
        case 'vollstaendig': analyseTitelText = "Vollständige Analyse"; break;
    }
    titelElement.textContent = analyseTitelText;

    // Loading-Anzeige
    inhaltDiv.innerHTML = `
        <div class="flex justify-center items-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span class="ml-4 text-gray-600">Analyse wird durchgeführt...</span>
        </div>
    `;

    try {
        const provider = window.BauFiRechner.apiProvider;
        const apiKey = window.BauFiRechner.apiKey;
        const analysisResult = await performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey);
        inhaltDiv.innerHTML = analysisResult;

    } catch (error) {
        console.error("Fehler bei der API-Analyse:", error);
        inhaltDiv.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded">
                <h3 class="font-medium text-red-800 mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>Fehler bei der Analyse</h3>
                <p class="text-sm text-red-700">Bei der Verarbeitung Ihrer Anfrage über ${getProviderName(window.BauFiRechner.apiProvider)} ist ein Fehler aufgetreten:</p>
                <p class="mt-2 p-2 bg-white border rounded font-mono text-sm text-red-600">${error.message || "Unbekannter Fehler bei der API-Anfrage"}</p>
                <button onclick="startAnalysis('${analyseTyp}')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
                    <i class="fas fa-redo mr-2"></i>Erneut versuchen
                </button>
                 <button onclick="resetAnalysis()" class="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Zurück zur Auswahl
                </button>
            </div>
        `;
    }
}

// Echte API-Analyse durchführen
async function performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey) {
    const prompt = createAnalysisPrompt(analyseTyp, analyseDaten);
    let resultHtml;
    console.log(`Starte API-Analyse mit Provider: ${provider}`);

    switch (provider) {
        case 'openai': resultHtml = await callOpenAI(prompt, apiKey); break;
        case 'anthropic': resultHtml = await callClaude(prompt, apiKey); break;
        case 'deepseek': resultHtml = await callDeepSeek(prompt, apiKey); break;
        default: throw new Error("Nicht unterstützter API-Provider: " + provider);
    }
    console.log(`API-Analyse abgeschlossen.`);
    return resultHtml;
}

// --- API Call Functions (OpenAI, Claude, DeepSeek) ---
// (Keine Änderungen hier notwendig, bleiben global)
async function callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o', // Oder gpt-4
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Fehler beim Parsen der OpenAI-Fehlermeldung.' } }));
        console.error('OpenAI API Error:', response.status, response.statusText, errorData);
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}${errorData.error ? ' - ' + (errorData.error.message || JSON.stringify(errorData.error)) : ''}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Ungültige Antwort von OpenAI:', data);
        throw new Error('Ungültige oder leere Antwort von OpenAI erhalten.');
    }
    return data.choices[0].message.content;
}

async function callClaude(prompt, apiKey) {
     const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            messages: [
                { role: 'user', content: prompt }
            ],
            system: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.',
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ type: 'error', error: { message: 'Fehler beim Parsen der Claude-Fehlermeldung.' }}));
        console.error('Claude API Error:', response.status, response.statusText, errorData);
        const errorMessage = errorData?.error?.message || errorData?.detail || JSON.stringify(errorData);
        throw new Error(`Claude API Error: ${response.status} ${response.statusText}${errorMessage ? ' - ' + errorMessage : ''}`);
    }

    const data = await response.json();
    if (!data.content || data.content.length === 0 || !data.content[0].text) {
         console.error('Ungültige Antwort von Claude:', data);
         throw new Error('Ungültige oder leere Antwort von Claude erhalten.');
     }
    return data.content[0].text;
}

async function callDeepSeek(prompt, apiKey) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Fehler beim Parsen der DeepSeek-Fehlermeldung.' } }));
        console.error('DeepSeek API Error:', response.status, response.statusText, errorData);
        throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText}${errorData.error ? ' - ' + (errorData.error.message || JSON.stringify(errorData.error)) : ''}`);
    }

    const data = await response.json();
     if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Ungültige Antwort von DeepSeek:', data);
        throw new Error('Ungültige oder leere Antwort von DeepSeek erhalten.');
    }
    return data.choices[0].message.content;
}


// --- API Key Validation Logic ---
// (Keine Änderungen hier notwendig)
async function validateGlobalApiKey() {
    const apiProvider = window.BauFiRechner?.apiProvider;
    const apiKeyInput = document.getElementById('global-api-key');
    const validateButton = document.getElementById('validate-global-api');

    if (!apiProvider || !apiKeyInput || !validateButton) {
        console.error("Fehlende Elemente für API-Validierung");
        if(typeof showApiStatus === 'function') showApiStatus('error', 'Interner Fehler: UI-Elemente nicht gefunden.');
        return;
    }

    const apiKey = apiKeyInput.value.trim();

    if (!apiProvider) {
         if(typeof showApiStatus === 'function') showApiStatus('error', 'Bitte wählen Sie zuerst einen API-Provider aus.');
        return;
    }
    if (!apiKey) {
        if(typeof showApiStatus === 'function') showApiStatus('error', 'Bitte geben Sie Ihren API-Schlüssel ein.');
        return;
    }

    validateButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Prüfe...';
    validateButton.disabled = true;
    if(typeof showApiStatus === 'function') showApiStatus('pending', `Validiere API-Schlüssel für ${getProviderName(apiProvider)}...`);
     window.BauFiRechner.apiKey = null;

    try {
        let isValid = false;
        console.log(`Starte Validierung für ${apiProvider}`);
        switch (apiProvider) {
            case 'openai': isValid = await validateOpenAIKey(apiKey); break;
            case 'anthropic': isValid = await validateClaudeKey(apiKey); break;
            case 'deepseek': isValid = await validateDeepSeekKey(apiKey); break;
            default: throw new Error("Nicht unterstützter API-Provider für Validierung");
        }
        console.log(`Validierungsergebnis für ${apiProvider}: ${isValid}`);

        if (isValid) {
            window.BauFiRechner.apiKey = apiKey;
            if(typeof showApiStatus === 'function') showApiStatus(true, `API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert.`);
            if(typeof updateKiCheckInAnalyseTab === 'function') updateKiCheckInAnalyseTab(true, apiProvider);
            enableAnalysisOptions();
        } else {
            if(typeof showApiStatus === 'function') showApiStatus(false, `Der API-Schlüssel für ${getProviderName(apiProvider)} scheint ungültig zu sein. Bitte prüfen.`);
            if(typeof resetKiCheckInAnalyseTab === 'function') resetKiCheckInAnalyseTab();
            disableAnalysisOptions();
        }
    } catch (error) {
        console.error('Fehler bei der API-Validierung:', error);
        if(typeof showApiStatus === 'function') showApiStatus(false, `Fehler bei der API-Validierung (${getProviderName(apiProvider)}): ${error.message || "Unbekannter Fehler"}`);
         if(typeof resetKiCheckInAnalyseTab === 'function') resetKiCheckInAnalyseTab();
        disableAnalysisOptions();
    } finally {
        validateButton.innerHTML = '<i class="fas fa-check mr-1"></i> Validieren';
        validateButton.disabled = false;
    }
}
async function validateOpenAIKey(apiKey) { /* ... unverändert ... */ }
async function validateClaudeKey(apiKey) { /* ... unverändert ... */ }
async function validateDeepSeekKey(apiKey) { /* ... unverändert ... */ }


// --- Helper Functions ---

// Analysedaten sammeln - JETZT MIT HAUSHALTSDATEN
function collectAnalysisData() {
    console.log("Sammle Analysedaten...");
    window.BauFiRechner.dataCollectionError = null;
    try {
        // Daten lesen (Objekt, Kosten, Finanzierung)
        const objekttyp = document.getElementById('objekttyp')?.value || 'N/A';
        const nutzungsart = document.getElementById('nutzungsart')?.value || 'N/A';
        const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value) || 0;
        const grundstuecksflaeche = parseFloat(document.getElementById('grundstuecksflaeche')?.value) || 0;
        const plz = document.getElementById('plz')?.value || 'N/A';
        const ort = document.getElementById('ort')?.value || 'N/A';
        const bundesland = document.getElementById('bundesland')?.value || 'N/A';
        const lage = document.getElementById('lage')?.value || 'N/A';
        const baujahr = parseFloat(document.getElementById('baujahr')?.value) || 0;
        const zustand = document.getElementById('zustand')?.value || 'N/A';

        const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;
        const kaufpreisQm = (wohnflaeche > 0 && kaufpreis > 0) ? kaufpreis / wohnflaeche : 0;
        const grunderwerbsteuer = parseFloat(document.getElementById('grunderwerbsteuer_prozent')?.value) || 0;
        const notar = parseFloat(document.getElementById('notar_prozent')?.value) || 0;
        const makler = parseFloat(document.getElementById('makler_prozent')?.value) || 0;
        const nebenkostenGesamt = parseFloat(document.getElementById('nebenkosten_gesamt')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten')?.value) || 0;

        const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value) || 0;
        const gesamtkosten = parseFloat(document.getElementById('fs_gesamtkosten')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        const eigenkapitalQuote = (gesamtkosten > 0) ? (eigenkapital / gesamtkosten) * 100 : 0;
        const foerdermittel = parseFloat(document.getElementById('foerdermittel')?.value) || 0;
        const zuFinanzieren = parseFloat(document.getElementById('zu_finanzieren')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

        const darlehen = [];
        let darlehenSumme = 0;
        let rateSumme = 0;
        const darlehenBlocks = document.querySelectorAll('.darlehen-block');
        darlehenBlocks.forEach((block, index) => {
            const darlehensBetrag = parseFloat(block.querySelector('.darlehen-betrag')?.value) || 0;
             if (darlehensBetrag <= 0) return;

            const zins = parseFloat(block.querySelector('.darlehen-zins')?.value) || 0;
            const tilgung = parseFloat(block.querySelector('.darlehen-tilgung')?.value) || 0;
            const zinsbindung = parseFloat(block.querySelector('.darlehen-zinsbindung')?.value) || 0;
            const restschuld = parseFloat(block.querySelector('.darlehen-restschuld')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
            const uiRateText = block.querySelector('.darlehen-rate')?.textContent || '0';
            const uiRate = parseFloat(uiRateText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

            let sondertilgung = { aktiv: false, betrag: 0, rhythmus: 'jaehrlich' };
            const sondertilgungOption = block.querySelector('.darlehen-sondertilgung-option');
            if (sondertilgungOption && sondertilgungOption.checked) {
                 sondertilgung.aktiv = true;
                 sondertilgung.betrag = parseFloat(block.querySelector('.darlehen-sondertilgung-betrag')?.value) || 0;
                 sondertilgung.rhythmus = block.querySelector('.darlehen-sondertilgung-rhythmus')?.value || 'jaehrlich';
             }

             darlehen.push({
                nr: index + 1, betrag: darlehensBetrag, zins, tilgung, zinsbindung,
                rate: uiRate, restschuld, sondertilgung
             });
             darlehenSumme += darlehensBetrag;
             rateSumme += uiRate;
        });
        const beleihungsauslauf = (kaufpreis > 0) ? (darlehenSumme / kaufpreis) * 100 : 0;

        // Haushaltsdaten lesen
        const haushaltsnettoeinkommen = parseFloat(document.getElementById('monatliches-haushaltsnettoeinkommen')?.value) || 0;
        const kreditraten = parseFloat(document.getElementById('monatliche-kreditraten')?.value) || 0; // Default 0 ist ok
        const anzahlKinder = parseInt(document.getElementById('anzahl-kinder')?.value) || 0; // Default 0 ist ok

        // Validierung
        const errors = [];
        if (!kaufpreis || kaufpreis <= 0) errors.push("Kaufpreis (Kosten-Tab)");
        if (!wohnflaeche || wohnflaeche <= 0) errors.push("Wohnfläche (Objekt-Tab)");
        if (!gesamtkosten || gesamtkosten <= 0) errors.push("Gesamtkosten (Berechnung fehlgeschlagen?)");
        if (darlehen.length === 0) errors.push("Keine Darlehen (Finanzierung-Tab)");
        if (darlehen.length > 0 && (!darlehenSumme || darlehenSumme <= 0)) errors.push("Darlehenssumme ist 0 (Finanzierung-Tab)");
        if (darlehen.length > 0 && (!rateSumme || rateSumme <= 0)) errors.push("Monatliche Rate ist 0 (Finanzierung-Tab)");
        if (plz === 'N/A' || ort === 'N/A' || bundesland === 'N/A' || bundesland === "") errors.push("Standort (PLZ, Ort, Bundesland im Objekt-Tab)");
        if (!haushaltsnettoeinkommen || haushaltsnettoeinkommen <= 0) errors.push("Monatl. Haushaltsnettoeinkommen (Analyse-Tab)");

        if (errors.length > 0) {
            const errorMsg = `Fehlende oder ungültige Kerndaten: ${errors.join(', ')}.`;
            console.error("Datenvalidierungsfehler für Analyse:", errorMsg);
            window.BauFiRechner.dataCollectionError = errorMsg;
            return null;
        }

        // Datenobjekt zurückgeben
        console.log("Analysedaten erfolgreich gesammelt.");
        return {
            objektdaten: { objekttyp, nutzungsart, wohnflaeche, grundstuecksflaeche, plz, ort, bundesland, lage, baujahr, zustand },
            kostendaten: { kaufpreis, kaufpreisQm, grunderwerbsteuer, notar, makler, nebenkostenGesamt, modernisierungskosten },
            finanzierungsdaten: { eigenkapital, eigenkapitalQuote: eigenkapitalQuote, foerdermittel, zuFinanzieren, darlehen, darlehenSumme, rateSumme, beleihungsauslauf },
            belastungsdaten: { haushaltsnettoeinkommen, kreditraten, anzahlKinder, hinweis: "Haushaltsdaten vom Nutzer eingegeben." }
        };

    } catch (error) {
        console.error("Unerwarteter Fehler beim Sammeln der Analysedaten:", error);
        window.BauFiRechner.dataCollectionError = `Interner Fehler beim Daten sammeln: ${error.message || 'Unbekannt'}`;
        return null;
    }
}

// Prompt für die jeweilige Analyse erstellen - MIT ECHTEN HAUSHALTSDATEN
function createAnalysisPrompt(analyseTyp, analyseDaten) {
    const _formatCurrency = typeof formatCurrency === 'function' ? formatCurrency : value => `${(value || 0).toFixed(2)} €`;

    // Basisinformationen
    const allgemeineInfo = `
Ich benötige eine detaillierte Analyse für eine Baufinanzierung in Deutschland mit folgenden Daten. Bitte antworte ausschließlich in formatiertem HTML mit Tailwind CSS Klassen.

**Allgemeine Projektübersicht:**
*   Kaufpreis: ${_formatCurrency(analyseDaten.kostendaten.kaufpreis)}
*   Gesamtkosten (inkl. Nebenkosten & Zusatzkosten): ${_formatCurrency(analyseDaten.finanzierungsdaten.eigenkapital + analyseDaten.finanzierungsdaten.zuFinanzieren)}
*   Eigenkapital: ${_formatCurrency(analyseDaten.finanzierungsdaten.eigenkapital)} (${analyseDaten.finanzierungsdaten.eigenkapitalQuote.toFixed(1)}%)
*   Darlehenssumme gesamt: ${_formatCurrency(analyseDaten.finanzierungsdaten.darlehenSumme)}
*   Monatliche Rate gesamt (neue BauFi): ${_formatCurrency(analyseDaten.finanzierungsdaten.rateSumme)}
*   Beleihungsauslauf (LTV): ${analyseDaten.finanzierungsdaten.beleihungsauslauf.toFixed(1)}%

**Objektdaten:**
*   Typ: ${analyseDaten.objektdaten.objekttyp} | Nutzung: ${analyseDaten.objektdaten.nutzungsart}
*   Standort: ${analyseDaten.objektdaten.plz} ${analyseDaten.objektdaten.ort} (${analyseDaten.objektdaten.bundesland}) | Lage: ${analyseDaten.objektdaten.lage}
*   Größe: ${analyseDaten.objektdaten.wohnflaeche} m² Wohnfläche | ${analyseDaten.objektdaten.grundstuecksflaeche} m² Grundstück
*   Kaufpreis/m²: ${_formatCurrency(analyseDaten.kostendaten.kaufpreisQm)}
*   Baujahr: ${analyseDaten.objektdaten.baujahr || 'N/A'} | Zustand: ${analyseDaten.objektdaten.zustand || 'N/A'}

**Kostendetails:**
*   Kaufnebenkosten: ${_formatCurrency(analyseDaten.kostendaten.nebenkostenGesamt)} (GrESt: ${analyseDaten.kostendaten.grunderwerbsteuer}%, Notar/GB: ${analyseDaten.kostendaten.notar}%, Makler: ${analyseDaten.kostendaten.makler}%)
*   Zusätzl. Kosten (Modernisierung etc.): ${_formatCurrency(analyseDaten.kostendaten.modernisierungskosten)}
*   Fördermittel: ${_formatCurrency(analyseDaten.finanzierungsdaten.foerdermittel)}
`;
    // Darlehensinformationen
    let darlehenInfo = "\n**Finanzierungsbausteine (Darlehen):**\n";
     if (analyseDaten.finanzierungsdaten.darlehen.length > 0) {
        darlehenInfo += '<div class="space-y-3">';
        analyseDaten.finanzierungsdaten.darlehen.forEach(d => {
            darlehenInfo += `
<div class="p-3 border rounded bg-gray-50">
    <h4 class="font-medium text-sm mb-1">Darlehen ${d.nr}</h4>
    Betrag: ${_formatCurrency(d.betrag)} | Zins: ${d.zins.toFixed(2)}% | Anf. Tilgung: ${d.tilgung.toFixed(2)}%<br>
    Zinsbindung: ${d.zinsbindung} Jahre | Monatliche Rate (lt. UI): ${_formatCurrency(d.rate)}<br>
    Restschuld (n. Zinsb.): ${_formatCurrency(d.restschuld)}<br>
    Sondertilgung: ${d.sondertilgung.aktiv ? `Ja (${_formatCurrency(d.sondertilgung.betrag)} ${d.sondertilgung.rhythmus})` : 'Nein'}
</div>
`;
        });
        darlehenInfo += '</div>';
    } else {
        darlehenInfo += "<p>Keine Darlehensdaten vorhanden.</p>";
    }

    // Haushaltsdaten
    const haushaltsdatenInfo = `
**Haushaltsdaten (vom Nutzer angegeben):**
*   Monatliches Haushaltsnettoeinkommen: ${_formatCurrency(analyseDaten.belastungsdaten.haushaltsnettoeinkommen)}
*   Monatliche sonstige Kreditraten (bestehend): ${_formatCurrency(analyseDaten.belastungsdaten.kreditraten)}
*   Anzahl Kinder im Haushalt: ${analyseDaten.belastungsdaten.anzahlKinder}
`;

    let spezifischeAnweisung = "\n**Analyseauftrag:**\n";
    switch (analyseTyp) {
        case 'marktdaten':
             spezifischeAnweisung += `
Bitte führe eine **Marktdatenanalyse** für die oben beschriebene Immobilie durch. Bewerte:
1.  Angemessenheit des Kaufpreises und des Preises pro Quadratmeter im regionalen Vergleich (PLZ/Ort). Nutze aktuelle Vergleichsdaten, soweit verfügbar.
2.  Berücksichtigung von Lage (${analyseDaten.objektdaten.lage}), Zustand (${analyseDaten.objektdaten.zustand}) und Baujahr (${analyseDaten.objektdaten.baujahr}) bei der Preiseinschätzung.
3.  Kurze Einschätzung zur potenziellen Wertentwicklung am Standort (basierend auf Makrolage-Trends).
Gib eine klare Einschätzung (z.B. günstig, marktgerecht, leicht überteuert, teuer) mit Begründung in HTML mit Tailwind-Klassen. Die Haushaltsdaten sind für diese Analyse nachrangig.`;
            break;
        case 'belastung':
            spezifischeAnweisung += `
Bitte führe eine **Belastbarkeitsanalyse** durch, basierend auf den oben genannten **Haushaltsdaten**. Bewerte:
1.  Die Belastungsquote: Berechne das Verhältnis der neuen monatlichen BauFi-Rate (${_formatCurrency(analyseDaten.finanzierungsdaten.rateSumme)}) zum angegebenen Haushaltsnettoeinkommen (${_formatCurrency(analyseDaten.belastungsdaten.haushaltsnettoeinkommen)}).
2.  Das frei verfügbare Einkommen: Berechne das Nettoeinkommen abzüglich der neuen BauFi-Rate, der bestehenden Kreditraten (${_formatCurrency(analyseDaten.belastungsdaten.kreditraten)}) und einer realistischen Lebenshaltungskostenpauschale (berücksichtige die ${analyseDaten.belastungsdaten.anzahlKinder} Kinder und schätze Nebenkosten für die Immobilie, ca. 3-4€/m² Wohnfläche). Stelle das Ergebnis klar dar.
3.  Risiken: Bewerte das Zinsänderungsrisiko (Restschulden nach Zinsbindung) und den Puffer für Unvorhergesehenes basierend auf dem verfügbaren Einkommen.
4.  Gesamteinschätzung: Gib eine Einschätzung zur Tragfähigkeit (z.B. komfortabel, gut tragfähig, angespannt, kritisch) unter Berücksichtigung aller Faktoren.
Formatiere die Antwort in HTML mit Tailwind-Klassen.`;
            break;
        case 'optimierung':
            spezifischeAnweisung += `
Bitte gib **konkrete Optimierungsvorschläge** für diese Finanzierungsstruktur, unter Berücksichtigung der oben genannten **Haushaltsdaten**. Analysiere insbesondere:
1.  Potenzial bei Eigenkapitalquote (${analyseDaten.finanzierungsdaten.eigenkapitalQuote.toFixed(1)}%) und Beleihungsauslauf (${analyseDaten.finanzierungsdaten.beleihungsauslauf.toFixed(1)}%).
2.  Möglichkeiten bei der Darlehensstruktur (Zinssätze, Tilgungshöhen im Kontext der Belastung, Zinsbindungsfristen im Mix). Gibt es ggf. bessere Alternativen, um die Belastung zu steuern oder schneller zu tilgen?
3.  Sinnhaftigkeit und Einsatz der Sondertilgungsoptionen (Empfehlung basierend auf finanziellem Spielraum aus den Haushaltsdaten).
4.  Gibt es offensichtliche Lücken, Nachteile oder Risiken in der aktuellen Struktur?
Formuliere klare Handlungsempfehlungen in HTML mit Tailwind-Klassen.`;
            break;
        case 'vollstaendig':
            spezifischeAnweisung += `
Bitte führe eine **vollständige Plausibilitätsprüfung und Analyse** durch, basierend auf **allen** oben genannten Daten (Objekt, Kosten, Finanzierung, Haushalt). Die Analyse soll umfassen:
1.  **Markteinschätzung:** Ist der Kaufpreis realistisch für die Lage/Objekt?
2.  **Belastbarkeit:** Ist die Rate tragfähig? Berechne die Belastungsquote und schätze das frei verfügbare Einkommen nach Krediten/Lebenshaltungskosten/Nebenkosten.
3.  **Struktur:** Sind Zinsen, Tilgung, Zinsbindung(en) sinnvoll gewählt? Gibt es strukturelle Risiken (Restschulden, Zinsänderung)?
4.  **Optimierungspotenzial:** Wo gibt es konkrete Verbesserungsmöglichkeiten (EK, Rate, Tilgung, Laufzeit, Sondertilgung)?
5.  **Gesamtbewertung:** Eine zusammenfassende Einschätzung (z.B. solide und gut geplant, gut mit Optimierungspotenzial, tendenziell riskant, kritisch) und eine kurze Risikoeinstufung (niedrig, mittel, hoch).
Formatiere die gesamte Antwort als umfassenden Bericht in HTML mit Tailwind-Klassen (nutze h3, h4, p, ul/li).`;
            break;
    }

    // Füge alle Teile zusammen
    return allgemeineInfo + darlehenInfo + haushaltsdatenInfo + spezifischeAnweisung + "\n\nFormatiere deine gesamte Antwort als HTML mit Tailwind CSS Klassen.";
}


// Analyse-Optionen aktivieren/deaktivieren
// (Keine Änderungen hier notwendig)
function enableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    const lageButton = document.getElementById('ermittle-lagekategorie-btn');
    if (analyseOptionen) {
        analyseOptionen.querySelectorAll('div[id$="-analyse"]').forEach(option => {
            option.classList.remove('opacity-50', 'cursor-not-allowed');
            option.classList.add('cursor-pointer', 'hover:shadow-md');
        });
    }
    if (lageButton) {
        lageButton.disabled = false;
        lageButton.title = 'Lagekategorie mit KI ermitteln';
    }
}
function disableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    const lageButton = document.getElementById('ermittle-lagekategorie-btn');
    if (analyseOptionen) {
        analyseOptionen.querySelectorAll('div[id$="-analyse"]').forEach(option => {
            option.classList.add('opacity-50', 'cursor-not-allowed');
            option.classList.remove('cursor-pointer', 'hover:shadow-md');
        });
    }
    if (lageButton) {
         lageButton.disabled = true;
         lageButton.title = 'API-Schlüssel benötigt';
    }
    resetAnalysis();
}

// Analyse zurücksetzen (UI-Teil)
// (Keine Änderungen hier notwendig)
function resetAnalysis() {
    const ergebnisContainer = document.getElementById('analyse-ergebnis-container');
    const optionenContainer = document.getElementById('analyse-optionen');
     if (!ergebnisContainer || !optionenContainer) return;

    ergebnisContainer.classList.add('hidden');
    optionenContainer.classList.remove('hidden');
     document.getElementById('analyse-inhalt').innerHTML = '';
}

// Provider-Name abrufen (Hilfsfunktion, definiert in api-integration.js)
// Formatierungsfunktion für Währungsbeträge (Hilfsfunktion, definiert in main.js)
