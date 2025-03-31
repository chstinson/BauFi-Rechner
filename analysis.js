// analysis.js
// Produktionsversion mit echter API-Integration für KI-Plausibilisierung des BauFi-Rechners

function initAnalysis() {
    // Analyse-Optionen Event-Listener initial deaktiviert, bis API-Key valide ist
    disableAnalysisOptions(); // Startet deaktiviert
    document.getElementById('marktdaten-analyse')?.addEventListener('click', () => startAnalysis('marktdaten'));
    document.getElementById('belastungs-analyse')?.addEventListener('click', () => startAnalysis('belastung'));
    document.getElementById('optimierungs-analyse')?.addEventListener('click', () => startAnalysis('optimierung'));
    document.getElementById('vollstaendige-analyse')?.addEventListener('click', () => startAnalysis('vollstaendig'));

    // Neue Analyse Button
    document.getElementById('neue-analyse')?.addEventListener('click', resetAnalysis);

    // Hinweis: Die API-Validierung selbst wird durch initApiKeyValidation in api-integration.js ausgelöst
}

// Analyse starten
async function startAnalysis(analyseTyp) {
    // Erneut prüfen, ob API-Schlüssel und Provider vorhanden sind
    if (!window.BauFiRechner || !window.BauFiRechner.apiKey || !window.BauFiRechner.apiProvider) {
        showApiStatus('error', 'Kein gültiger API-Schlüssel oder Provider ausgewählt. Bitte zuerst im API-Bereich validieren.');
        // Scroll zum API-Bereich
        document.getElementById('api-global-container')?.scrollIntoView({ behavior: 'smooth' });
        resetAnalysis(); // Optionen ausblenden etc.
        return;
    }

    // Analysedaten sammeln
    const analyseDaten = collectAnalysisData();
    if (!analyseDaten) {
         showApiStatus('error', 'Fehler beim Sammeln der Analysedaten. Bitte Eingaben prüfen.');
         return;
    }

    // Container anzeigen und Titel setzen
    const ergebnisContainer = document.getElementById('analyse-ergebnis-container');
    const optionenContainer = document.getElementById('analyse-optionen');
    const inhaltDiv = document.getElementById('analyse-inhalt');
    const titelElement = document.getElementById('analyse-titel');

    if (!ergebnisContainer || !optionenContainer || !inhaltDiv || !titelElement) return; // Stellen sicher, dass Elemente existieren

    ergebnisContainer.classList.remove('hidden');
    optionenContainer.classList.add('hidden');

    // Titel je nach Analysetyp setzen
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
        // KI-Provider und API-Schlüssel aus globalen Variablen
        const provider = window.BauFiRechner.apiProvider;
        const apiKey = window.BauFiRechner.apiKey;

        // Echte API-Analyse durchführen
        const analysisResult = await performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey);

        // Ergebnis anzeigen (HTML von API)
        inhaltDiv.innerHTML = analysisResult; // Vorsicht: Direkte HTML-Injection von API birgt Risiken, wenn API kompromittiert wird. Ggf. Sanitization nötig.

    } catch (error) {
        console.error("Fehler bei der API-Analyse:", error);

        // Fehlermeldung anzeigen
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
         // Wir können hier nicht direkt einen EventListener hinzufügen, da der Button gerade erst erstellt wurde.
         // Daher verwenden wir onclick im HTML oder nutzen Event Delegation auf #analyse-inhalt.
    }
}

// Echte API-Analyse durchführen
async function performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey) {
    // Prompt basierend auf Analysetyp erstellen
    const prompt = createAnalysisPrompt(analyseTyp, analyseDaten);

    // API-Anfrage je nach Provider
    let resultHtml;

    console.log(`Starte API-Analyse mit Provider: ${provider}`); // Debugging

    switch (provider) {
        case 'openai':
            resultHtml = await callOpenAI(prompt, apiKey);
            break;
        case 'anthropic':
            resultHtml = await callClaude(prompt, apiKey);
            break;
        case 'deepseek':
            resultHtml = await callDeepSeek(prompt, apiKey);
            break;
        default:
            console.error("Nicht unterstützter API-Provider:", provider);
            throw new Error("Nicht unterstützter API-Provider: " + provider);
    }

    // Einfache Bereinigung (optional, grundlegend)
    // resultHtml = resultHtml.replace(/<script.*?>.*?<\/script>/gis, ''); // Entfernt script tags

    console.log(`API-Analyse abgeschlossen.`); // Debugging
    return resultHtml;
}

// --- API Call Functions (OpenAI, Claude, DeepSeek) ---
// WICHTIG: Diese Funktionen sind jetzt global, damit object.js sie nutzen kann.
// (Keine Änderungen hier gegenüber deinem Code, aber stelle sicher, dass die Endpunkte aktuell sind)
async function callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4', // Oder ein anderes verfügbares Modell wie gpt-4-turbo
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5, // Ggf. niedriger für Kategorisierung
            max_tokens: 4000 // Maximal erlaubte Tokens prüfen
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
    // Gibt den reinen Text oder HTML zurück, je nach Prompt
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
            model: 'claude-3-opus-20240229', // Prüfe verfügbare Modelle
            messages: [
                { role: 'user', content: prompt }
            ],
            system: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.',
            max_tokens: 4000 // Prüfe max_tokens für Claude Modelle
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ type: 'error', error: { message: 'Fehler beim Parsen der Claude-Fehlermeldung.' }}));
        console.error('Claude API Error:', response.status, response.statusText, errorData);
        // Claude's Fehlerstruktur kann anders sein
        const errorMessage = errorData?.error?.message || errorData?.detail || JSON.stringify(errorData);
        throw new Error(`Claude API Error: ${response.status} ${response.statusText}${errorMessage ? ' - ' + errorMessage : ''}`);
    }

    const data = await response.json();
    if (!data.content || data.content.length === 0 || !data.content[0].text) {
         console.error('Ungültige Antwort von Claude:', data);
         throw new Error('Ungültige oder leere Antwort von Claude erhalten.');
     }
    // Gibt den reinen Text oder HTML zurück, je nach Prompt
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
            model: 'deepseek-chat', // Oder anderes Modell
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung in Deutschland. Analysiere die übermittelten Daten und gib fundierte, strukturierte Antworten ausschließlich in gut formatiertem HTML zurück. Verwende ausschließlich Tailwind CSS Klassen (z.B. class="text-xl font-bold mb-2", class="p-4 border rounded bg-gray-50") für das Styling. Erzeuge Abschnitte mit Überschriften (h3, h4), Absätze (p), Listen (ul/ol/li) und ggf. Tabellen (table/thead/tbody/tr/th/td mit Tailwind Klassen). Fasse dich prägnant, aber informativ. Wenn du nur nach einer Kategorie gefragt wirst (Sehr gut, Gut, Mittel, Einfach), antworte NUR mit dieser Kategorie ohne HTML.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5, // Ggf. niedriger für Kategorisierung
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
    // Gibt den reinen Text oder HTML zurück, je nach Prompt
    return data.choices[0].message.content;
}


// --- API Key Validation Logic ---

// Hauptfunktion zur Validierung, aufgerufen durch api-integration.js
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

    validateButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Prüfe...'; // Loading-Icon
    validateButton.disabled = true;
    if(typeof showApiStatus === 'function') showApiStatus('pending', `Validiere API-Schlüssel für ${getProviderName(apiProvider)}...`);
     window.BauFiRechner.apiKey = null; // Schlüssel vor Prüfung zurücksetzen

    try {
        let isValid = false;
        console.log(`Starte Validierung für ${apiProvider}`); // Debugging

        // Provider-spezifische Validierung
        switch (apiProvider) {
            case 'openai': isValid = await validateOpenAIKey(apiKey); break;
            case 'anthropic': isValid = await validateClaudeKey(apiKey); break;
            case 'deepseek': isValid = await validateDeepSeekKey(apiKey); break;
            default: throw new Error("Nicht unterstützter API-Provider für Validierung");
        }

        console.log(`Validierungsergebnis für ${apiProvider}: ${isValid}`); // Debugging

        if (isValid) {
            // API-Schlüssel speichern (nur bei Erfolg!)
            window.BauFiRechner.apiKey = apiKey;
            // Status aktualisieren
             if(typeof showApiStatus === 'function') showApiStatus(true, `API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert.`);
            // UI im Analyse-Tab aktualisieren (direkt oder über api-integration.js)
            if(typeof updateKiCheckInAnalyseTab === 'function') updateKiCheckInAnalyseTab(true, apiProvider); // Pass provider for name
            enableAnalysisOptions(); // Analyseoptionen UND Lage-Button jetzt freischalten
        } else {
            // Status aktualisieren für ungültigen Key
             if(typeof showApiStatus === 'function') showApiStatus(false, `Der API-Schlüssel für ${getProviderName(apiProvider)} scheint ungültig zu sein. Bitte prüfen.`);
            // UI im Analyse-Tab zurücksetzen
             if(typeof resetKiCheckInAnalyseTab === 'function') resetKiCheckInAnalyseTab();
            disableAnalysisOptions(); // Analyseoptionen UND Lage-Button wieder sperren
        }
    } catch (error) {
        console.error('Fehler bei der API-Validierung:', error);
        // Status aktualisieren für Fehler (Netzwerk etc.)
        if(typeof showApiStatus === 'function') showApiStatus(false, `Fehler bei der API-Validierung (${getProviderName(apiProvider)}): ${error.message || "Unbekannter Fehler"}`);
         // UI im Analyse-Tab zurücksetzen
         if(typeof resetKiCheckInAnalyseTab === 'function') resetKiCheckInAnalyseTab();
        disableAnalysisOptions();
    } finally {
        validateButton.innerHTML = '<i class="fas fa-check mr-1"></i> Validieren'; // Restore original icon/text
        validateButton.disabled = false;
         // Status-Nachricht nach kurzer Zeit ausblenden? Optional.
         // setTimeout(() => { document.getElementById('api-status')?.classList.add('hidden'); }, 5000);
    }
}

// --- Provider Specific Key Validation Functions ---

async function validateOpenAIKey(apiKey) {
    try {
        // Versuche eine günstige API-Anfrage, z.B. Modelle auflisten
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
         console.log('OpenAI validation response status:', response.status);
        return response.ok; // Status 2xx bedeutet gültiger Key (meistens)
    } catch (error) {
        // Netzwerkfehler etc.
        console.error('OpenAI Validierungs-Netzwerkfehler:', error);
        throw error; // Fehler weitergeben, um im Haupt-Try/Catch behandelt zu werden
    }
}

async function validateClaudeKey(apiKey) {
    try {
        // Sende eine minimale Anfrage, die Autorisierung erfordert
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01' // Wichtig!
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Schnellstes & günstiges Modell für Validierung
                max_tokens: 1, // Nur minimale Antwort benötigt
                messages: [{ role: 'user', content: '.' }] // Minimale Nachricht
            })
        });
         console.log('Claude validation response status:', response.status);
         // Claude gibt bei ungültigem Key oft 401 oder 403 zurück
         // 400 Bad Request kann auch vorkommen bei Key-Formatproblemen o.ä.
         if (response.status === 401 || response.status === 403) return false;
         // 429 Too Many Requests würde auf einen gültigen Key hindeuten (Quota erschöpft) -> true
         if (response.status === 429) return true;
        return response.ok; // Andere 2xx oder z.B. 400 könnten auch Probleme sein, aber wir werten erstmal `ok`
     } catch (error) {
        console.error('Claude Validierungs-Netzwerkfehler:', error);
         throw error;
     }
}

async function validateDeepSeekKey(apiKey) {
    try {
        // Ähnlich wie OpenAI, Modelle auflisten versuchen
        const response = await fetch('https://api.deepseek.com/v1/models', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        console.log('DeepSeek validation response status:', response.status);
        return response.ok;
    } catch (error) {
        console.error('DeepSeek Validierungs-Netzwerkfehler:', error);
        throw error;
    }
}

// --- Helper Functions ---

// Analysedaten sammeln
function collectAnalysisData() {
    try {
        // Objektdaten
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

        // Kostendaten
        const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;
        const kaufpreisQm = (wohnflaeche > 0 && kaufpreis > 0) ? kaufpreis / wohnflaeche : 0;
        const grunderwerbsteuer = parseFloat(document.getElementById('grunderwerbsteuer_prozent')?.value) || 0;
        const notar = parseFloat(document.getElementById('notar_prozent')?.value) || 0;
        const makler = parseFloat(document.getElementById('makler_prozent')?.value) || 0;
        const nebenkostenGesamt = parseFloat(document.getElementById('nebenkosten_gesamt')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten')?.value) || 0;

        // Finanzierungsdaten
        const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value) || 0;
        const gesamtkosten = parseFloat(document.getElementById('fs_gesamtkosten')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        const eigenkapitalQuote = (gesamtkosten > 0) ? (eigenkapital / gesamtkosten) * 100 : 0; // Sicherer berechnen
        const foerdermittel = parseFloat(document.getElementById('foerdermittel')?.value) || 0;
        const zuFinanzieren = parseFloat(document.getElementById('zu_finanzieren')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

        // Darlehensdaten
        const darlehen = [];
        const darlehenBlocks = document.querySelectorAll('.darlehen-block');
        darlehenBlocks.forEach((block, index) => {
            const darlehensBetrag = parseFloat(block.querySelector('.darlehen-betrag')?.value) || 0;
            const zins = parseFloat(block.querySelector('.darlehen-zins')?.value) || 0;
            const tilgung = parseFloat(block.querySelector('.darlehen-tilgung')?.value) || 0;
            const zinsbindung = parseFloat(block.querySelector('.darlehen-zinsbindung')?.value) || 0;
            // Berechne Rate hier neu für Konsistenz? Oder verlasse dich auf UI? Besser neu berechnen.
            const jaehrlicheRate = darlehensBetrag * (zins + tilgung) / 100;
            let monatlicheRate = jaehrlicheRate / 12;
            const restschuld = parseFloat(block.querySelector('.darlehen-restschuld')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0; // Nehmen UI-Wert

            // Sondertilgung
            let sondertilgung = { aktiv: false, betrag: 0, rhythmus: 'jaehrlich' };
            const sondertilgungOption = block.querySelector('.darlehen-sondertilgung-option');
            if (sondertilgungOption && sondertilgungOption.checked) {
                 sondertilgung.aktiv = true;
                 sondertilgung.betrag = parseFloat(block.querySelector('.darlehen-sondertilgung-betrag')?.value) || 0;
                 sondertilgung.rhythmus = block.querySelector('.darlehen-sondertilgung-rhythmus')?.value || 'jaehrlich';
                 // Passe Rate ggf. an, falls Sondertilgung monatlich/einmalig die effektive Rate ändert (komplex) - Lassen wir für den Prompt vorerst die Basisrate.
             }

             if (darlehensBetrag > 0) { // Nur hinzufügen, wenn Betrag > 0
                 darlehen.push({
                    nr: index + 1,
                    betrag: darlehensBetrag, zins, tilgung, zinsbindung,
                    rate: monatlicheRate, // Annuitätenrate (ohne ST für Prompt erstmal)
                    restschuld, // Aus UI
                    sondertilgung
                 });
             }
        });

        // Gesamtsummen
        const darlehenSumme = darlehen.reduce((sum, d) => sum + d.betrag, 0); // Sicherer berechnen
        const rateSumme = parseFloat(document.getElementById('rate_summe')?.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0; // Aus UI, inkl. Sondertilgung
        const beleihungsauslauf = (kaufpreis > 0) ? (darlehenSumme / kaufpreis) * 100 : 0; // Sicherer berechnen

        // Annahmen für Belastungsanalyse (einfach)
        // WICHTIG: Diese sollten idealerweise Eingabefelder sein!
        const wohnflaecheValue = parseFloat(analyseDaten.objektdaten.wohnflaeche) || 100; // Fallback-Wohnfläche
        const monatlichesNettoeinkommen = rateSumme > 0 ? rateSumme * 3 : 3000; // Beispielhafte Annahme oder Mindestwert
        const monatlicheNebenkosten = (wohnflaecheValue * 3.5) / 12; // Grobe Annahme für lfd. NK (ca. 3.5€/m²/Monat)
        const monatlicheWohnkosten = rateSumme + monatlicheNebenkosten;

        return {
            objektdaten: { objekttyp, nutzungsart, wohnflaeche, grundstuecksflaeche, plz, ort, bundesland, lage, baujahr, zustand },
            kostendaten: { kaufpreis, kaufpreisQm, grunderwerbsteuer, notar, makler, nebenkostenGesamt, modernisierungskosten },
            finanzierungsdaten: { eigenkapital, eigenkapitalQuote: eigenkapitalQuote, foerdermittel, zuFinanzieren, darlehen, darlehenSumme, rateSumme, beleihungsauslauf },
            belastungsdaten: { monatlichesNettoeinkommen, monatlicheWohnkosten, hinweis: "Annahmen für Nettoeinkommen und Wohnnebenkosten!" }
        };
    } catch (error) {
        console.error("Fehler beim Sammeln der Analysedaten:", error);
        return null; // Signalisiert Fehler
    }
}

// Prompt für die jeweilige Analyse erstellen
function createAnalysisPrompt(analyseTyp, analyseDaten) {
    // Formatierungsfunktion lokal oder aus globalem Scope
    const _formatCurrency = typeof formatCurrency === 'function' ? formatCurrency : value => `${(value || 0).toFixed(2)} €`;

    const allgemeineInfo = `
Ich benötige eine detaillierte Analyse für eine Baufinanzierung in Deutschland mit folgenden Daten. Bitte antworte ausschließlich in formatiertem HTML mit Tailwind CSS Klassen.

**Allgemeine Projektübersicht:**
*   Kaufpreis: ${_formatCurrency(analyseDaten.kostendaten.kaufpreis)}
*   Gesamtkosten (inkl. Nebenkosten & Zusatzkosten): ${_formatCurrency(analyseDaten.finanzierungsdaten.eigenkapital + analyseDaten.finanzierungsdaten.zuFinanzieren)}
*   Eigenkapital: ${_formatCurrency(analyseDaten.finanzierungsdaten.eigenkapital)} (${analyseDaten.finanzierungsdaten.eigenkapitalQuote.toFixed(1)}%)
*   Darlehenssumme gesamt: ${_formatCurrency(analyseDaten.finanzierungsdaten.darlehenSumme)}
*   Monatliche Rate gesamt: ${_formatCurrency(analyseDaten.finanzierungsdaten.rateSumme)}
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

    let darlehenInfo = "\n**Finanzierungsbausteine (Darlehen):**\n";
    if (analyseDaten.finanzierungsdaten.darlehen.length > 0) {
        darlehenInfo += '<div class="space-y-3">'; // Verwende div anstelle von ul/li für mehr Flexibilität
        analyseDaten.finanzierungsdaten.darlehen.forEach(d => {
            darlehenInfo += `
<div class="p-3 border rounded bg-gray-50">
    <h4 class="font-medium text-sm mb-1">Darlehen ${d.nr}</h4>
    Betrag: ${_formatCurrency(d.betrag)} | Zins: ${d.zins.toFixed(2)}% | Tilgung: ${d.tilgung.toFixed(2)}%<br>
    Zinsbindung: ${d.zinsbindung} Jahre | Monatliche Rate (Annuität): ${_formatCurrency(d.rate)}<br>
    Restschuld (nach Zinsbindung): ${_formatCurrency(d.restschuld)}<br>
    Sondertilgung: ${d.sondertilgung.aktiv ? `Ja (${_formatCurrency(d.sondertilgung.betrag)} ${d.sondertilgung.rhythmus})` : 'Nein'}
</div>
`;
        });
        darlehenInfo += '</div>';
    } else {
        darlehenInfo += "<p>Keine Darlehensdaten vorhanden.</p>";
    }


    let spezifischeAnweisung = "\n**Analyseauftrag:**\n";
    switch (analyseTyp) {
        case 'marktdaten':
            spezifischeAnweisung += `
Bitte führe eine **Marktdatenanalyse** für die oben beschriebene Immobilie durch. Bewerte:
1.  Angemessenheit des Kaufpreises und des Preises pro Quadratmeter im regionalen Vergleich (PLZ/Ort). Nutze aktuelle Vergleichsdaten, soweit verfügbar.
2.  Berücksichtigung von Lage (${analyseDaten.objektdaten.lage}), Zustand (${analyseDaten.objektdaten.zustand}) und Baujahr (${analyseDaten.objektdaten.baujahr}) bei der Preiseinschätzung.
3.  Kurze Einschätzung zur potenziellen Wertentwicklung am Standort (basierend auf Makrolage-Trends).
Gib eine klare Einschätzung (z.B. günstig, marktgerecht, leicht überteuert, teuer) mit Begründung in HTML mit Tailwind-Klassen.`;
            break;
        case 'belastung':
            spezifischeAnweisung += `
Bitte führe eine **Belastbarkeitsanalyse** durch. Nutze die folgenden *angenommenen* Haushaltsdaten:
*   *Annahme:* Monatliches Haushaltsnettoeinkommen: ca. **${_formatCurrency(analyseDaten.belastungsdaten.monatlichesNettoeinkommen)}**
*   *Annahme:* Geschätzte monatliche Wohnnebenkosten (ohne Rate): ca. **${_formatCurrency(analyseDaten.belastungsdaten.monatlicheWohnkosten - analyseDaten.finanzierungsdaten.rateSumme)}**

Bewerte auf dieser Basis:
1.  Die Höhe der monatlichen Gesamtbelastung (Rate: ${_formatCurrency(analyseDaten.finanzierungsdaten.rateSumme)}) im Verhältnis zum angenommenen Einkommen (Quote berechnen).
2.  Die geschätzten gesamten monatlichen Wohnkosten (Rate + angenommene Nebenkosten) von ca. **${_formatCurrency(analyseDaten.belastungsdaten.monatlicheWohnkosten)}**.
3.  Risiken (insbesondere Zinsänderungsrisiko nach Zinsbindung, Puffer für Unvorhergesehenes).
4.  Eine Einschätzung, ob die Finanzierung tragfähig erscheint (z.B. komfortabel, gut tragfähig, angespannt, kritisch). Weise explizit auf die verwendeten Annahmen hin!
Formatiere die Antwort in HTML mit Tailwind-Klassen.`;
            break;
        case 'optimierung':
            spezifischeAnweisung += `
Bitte gib **konkrete Optimierungsvorschläge** für diese Finanzierungsstruktur. Analysiere insbesondere:
1.  Potenzial bei Eigenkapitalquote (${analyseDaten.finanzierungsdaten.eigenkapitalQuote.toFixed(1)}%) und Beleihungsauslauf (${analyseDaten.finanzierungsdaten.beleihungsauslauf.toFixed(1)}%).
2.  Möglichkeiten bei der Darlehensstruktur (Zinssätze, Tilgungshöhen, Zinsbindungsfristen im Mix). Gibt es ggf. bessere Alternativen?
3.  Sinnhaftigkeit und Einsatz der Sondertilgungsoptionen im Detail (Rhythmus, Höhe).
4.  Gibt es offensichtliche Lücken, Nachteile oder Risiken in der aktuellen Struktur?
Formuliere klare Handlungsempfehlungen in HTML mit Tailwind-Klassen.`;
            break;
        case 'vollstaendig':
            spezifischeAnweisung += `
Bitte führe eine **vollständige Plausibilitätsprüfung und Analyse** durch. Nutze die *angenommenen* Haushaltsdaten für die Belastbarkeit (Nettoeinkommen: ca. ${_formatCurrency(analyseDaten.belastungsdaten.monatlichesNettoeinkommen)}). Die Analyse soll umfassen:
1.  **Markteinschätzung:** Ist der Kaufpreis realistisch für die Lage/Objekt?
2.  **Belastbarkeit:** Ist die Rate unter den Annahmen tragfähig? Welche Quote ergibt sich?
3.  **Struktur:** Sind Zinsen, Tilgung, Zinsbindung(en) sinnvoll gewählt? Gibt es strukturelle Risiken (z.B. hohe Restschulden, kurze Bindungen)?
4.  **Optimierungspotenzial:** Wo gibt es konkrete Verbesserungsmöglichkeiten (EK, Rate, Tilgung, Laufzeit, Sondertilgung)?
5.  **Gesamtbewertung:** Eine zusammenfassende Einschätzung (z.B. solide und gut geplant, gut mit Optimierungspotenzial, tendenziell riskant, kritisch) und eine kurze Risikoeinstufung (niedrig, mittel, hoch).
Formatiere die gesamte Antwort als umfassenden Bericht in HTML mit Tailwind-Klassen (nutze h3, h4, p, ul/li).`;
            break;
    }

    return allgemeineInfo + darlehenInfo + spezifischeAnweisung + "\n\nFormatiere deine gesamte Antwort als HTML mit Tailwind CSS Klassen.";
}


// Analyse-Optionen aktivieren/deaktivieren
function enableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    const lageButton = document.getElementById('ermittle-lagekategorie-btn');

    // Analyse-Kacheln aktivieren
    if (analyseOptionen) {
        analyseOptionen.querySelectorAll('div[id$="-analyse"]').forEach(option => {
            option.classList.remove('opacity-50', 'cursor-not-allowed');
            option.classList.add('cursor-pointer', 'hover:shadow-md');
        });
    }
    // Lage-Button aktivieren
    if (lageButton) {
        lageButton.disabled = false;
        lageButton.title = 'Lagekategorie mit KI ermitteln'; // Tooltip aktualisieren
    }
}

function disableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    const lageButton = document.getElementById('ermittle-lagekategorie-btn');

    // Analyse-Kacheln deaktivieren
    if (analyseOptionen) {
        analyseOptionen.querySelectorAll('div[id$="-analyse"]').forEach(option => {
            option.classList.add('opacity-50', 'cursor-not-allowed');
            option.classList.remove('cursor-pointer', 'hover:shadow-md');
        });
    }
    // Lage-Button deaktivieren
    if (lageButton) {
         lageButton.disabled = true;
         lageButton.title = 'API-Schlüssel benötigt'; // Tooltip aktualisieren
    }
    // Reset Analysis View (optional, aber sinnvoll)
    resetAnalysis();
}

// Analyse zurücksetzen (UI-Teil)
function resetAnalysis() {
    const ergebnisContainer = document.getElementById('analyse-ergebnis-container');
    const optionenContainer = document.getElementById('analyse-optionen');
     if (!ergebnisContainer || !optionenContainer) return;

    ergebnisContainer.classList.add('hidden');
    optionenContainer.classList.remove('hidden');
     document.getElementById('analyse-inhalt').innerHTML = ''; // Inhalt leeren
     // Deaktiviere Optionen wieder, falls kein gültiger Key (neu) gesetzt ist
     // wird jetzt durch disableAnalysisOptions() erledigt, wenn nötig
}

// Provider-Name abrufen (Hilfsfunktion)
// Definition aus api-integration.js wird hier vorausgesetzt oder muss hierhin kopiert werden:
/*
function getProviderName(providerId) {
    switch(providerId) {
        case 'openai': return 'OpenAI (GPT-4)';
        case 'anthropic': return 'Claude';
        case 'deepseek': return 'DeepSeek';
        default: return 'KI-Provider';
    }
}
*/

// Formatierungsfunktion für Währungsbeträge (Hilfsfunktion)
// Definition aus main.js wird hier vorausgesetzt oder muss hierhin kopiert werden:
/*
function formatCurrency(value) {
     if (isNaN(value) || value === null) { return '-'; }
     return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
*/
