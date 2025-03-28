// analysis.js
// Produktionsversion mit echter API-Integration für KI-Plausibilisierung des BauFi-Rechners

function initAnalysis() {
    // Analyse-Optionen Event-Listener
    document.getElementById('marktdaten-analyse').addEventListener('click', () => startAnalysis('marktdaten'));
    document.getElementById('belastungs-analyse').addEventListener('click', () => startAnalysis('belastung'));
    document.getElementById('optimierungs-analyse').addEventListener('click', () => startAnalysis('optimierung'));
    document.getElementById('vollstaendige-analyse').addEventListener('click', () => startAnalysis('vollstaendig'));
    
    // Neue Analyse Button
    document.getElementById('neue-analyse').addEventListener('click', resetAnalysis);
}

// Analyse starten
async function startAnalysis(analyseTyp) {
    // Prüfen, ob ein API-Schlüssel vorhanden ist
    if (!window.BauFiRechner.apiKey) {
        alert('Bitte validieren Sie zuerst einen API-Schlüssel im Bereich "KI-gestützte Plausibilisierung & Marktdaten".');
        
        // Auto-Scroll zum API-Bereich
        document.getElementById('api-global-container').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Analysedaten sammeln
    const analyseDaten = collectAnalysisData();
    
    // Container anzeigen und Titel setzen
    document.getElementById('analyse-ergebnis-container').classList.remove('hidden');
    document.getElementById('analyse-optionen').classList.add('hidden');
    
    // Titel je nach Analysetyp setzen
    let analyseTitel = "Analyseergebnis";
    switch(analyseTyp) {
        case 'marktdaten':
            analyseTitel = "Marktdatenanalyse";
            break;
        case 'belastung':
            analyseTitel = "Belastbarkeitsanalyse";
            break;
        case 'optimierung':
            analyseTitel = "Optimierungsvorschläge";
            break;
        case 'vollstaendig':
            analyseTitel = "Vollständige Analyse";
            break;
    }
    
    document.getElementById('analyse-titel').textContent = analyseTitel;
    
    // Loading-Anzeige
    document.getElementById('analyse-inhalt').innerHTML = `
        <div class="flex justify-center items-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span class="ml-4">Analyse wird durchgeführt...</span>
        </div>
    `;
    
    try {
        // KI-Provider und API-Schlüssel aus globalen Variablen
        const provider = window.BauFiRechner.apiProvider;
        const apiKey = window.BauFiRechner.apiKey;
        
        // Echte API-Analyse durchführen
        const analysisResult = await performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey);
        
        // Ergebnis anzeigen
        document.getElementById('analyse-inhalt').innerHTML = analysisResult;
    } catch (error) {
        console.error("Fehler bei der API-Analyse:", error);
        
        // Fehlermeldung anzeigen
        document.getElementById('analyse-inhalt').innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded">
                <h3 class="font-medium text-red-800 mb-2">Fehler bei der Analyse</h3>
                <p>Bei der Verarbeitung Ihrer Anfrage ist ein Fehler aufgetreten:</p>
                <p class="mt-2 p-2 bg-white border rounded font-mono text-sm">${error.message || "Unbekannter Fehler bei der API-Anfrage"}</p>
                <button id="retry-analysis" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    <i class="fas fa-redo mr-2"></i>Erneut versuchen
                </button>
            </div>
        `;
        
        // Event-Listener für Retry-Button
        document.getElementById('retry-analysis').addEventListener('click', () => {
            startAnalysis(analyseTyp);
        });
    }
}

// Echte API-Analyse durchführen
async function performApiAnalysis(analyseTyp, analyseDaten, provider, apiKey) {
    // Prompt basierend auf Analysetyp erstellen
    const prompt = createAnalysisPrompt(analyseTyp, analyseDaten);
    
    // API-Anfrage je nach Provider
    let result;
    
    switch(provider) {
        case 'openai':
            result = await callOpenAI(prompt, apiKey);
            break;
        case 'anthropic':
            result = await callClaude(prompt, apiKey);
            break;
        case 'deepseek':
            result = await callDeepSeek(prompt, apiKey);
            break;
        default:
            throw new Error("Nicht unterstützter API-Provider: " + provider);
    }
    
    return result;
}

// OpenAI GPT API aufrufen
async function callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung und analysierst Baufinanzierungen. Gib Antworten in gut formatiertem HTML mit CSS-Klassen im Tailwind CSS Format zurück. Verwende div, h3, p, ul, li, table und andere HTML-Elemente, um eine schöne Ausgabe zu erzeugen.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}${errorData ? ' - ' + JSON.stringify(errorData.error) : ''}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Claude API aufrufen
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
            system: 'Du bist ein Experte für Immobilienfinanzierung und analysierst Baufinanzierungen. Gib Antworten in gut formatiertem HTML mit CSS-Klassen im Tailwind CSS Format zurück. Verwende div, h3, p, ul, li, table und andere HTML-Elemente, um eine schöne Ausgabe zu erzeugen.',
            max_tokens: 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Claude API Error: ${response.status} ${response.statusText}${errorData ? ' - ' + JSON.stringify(errorData) : ''}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
}

// DeepSeek API aufrufen
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
                { role: 'system', content: 'Du bist ein Experte für Immobilienfinanzierung und analysierst Baufinanzierungen. Gib Antworten in gut formatiertem HTML mit CSS-Klassen im Tailwind CSS Format zurück. Verwende div, h3, p, ul, li, table und andere HTML-Elemente, um eine schöne Ausgabe zu erzeugen.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText}${errorData ? ' - ' + JSON.stringify(errorData) : ''}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// API-Schlüssel validieren - echte Implementierung
async function validateGlobalApiKey() {
    const apiProvider = window.BauFiRechner.apiProvider;
    if (!apiProvider) {
        alert('Bitte wählen Sie einen API-Provider aus.');
        return;
    }
    
    const apiKey = document.getElementById('global-api-key').value.trim();
    if (!apiKey) {
        alert('Bitte geben Sie Ihren API-Schlüssel ein.');
        return;
    }
    
    const validateButton = document.getElementById('validate-global-api');
    validateButton.textContent = 'Prüfe...';
    validateButton.disabled = true;
    
    try {
        let isValid = false;
        
        // Provider-spezifische Validierung
        switch(apiProvider) {
            case 'openai':
                isValid = await validateOpenAIKey(apiKey);
                break;
            case 'anthropic':
                isValid = await validateClaudeKey(apiKey);
                break;
            case 'deepseek':
                isValid = await validateDeepSeekKey(apiKey);
                break;
            default:
                throw new Error("Nicht unterstützter API-Provider");
        }
        
        if (isValid) {
            // API-Schlüssel speichern
            window.BauFiRechner.apiKey = apiKey;
            
            // Status aktualisieren
            document.getElementById('api-status').classList.remove('hidden');
            document.getElementById('api-status').classList.add('bg-green-50', 'border', 'border-green-500');
            document.getElementById('api-status').innerHTML = `
                <p class="text-green-700">
                    <i class="fas fa-check-circle mr-2"></i>
                    API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert. Sie können nun die KI-Analysefunktionen nutzen.
                </p>
            `;
            
            // UI in anderen Tabs aktualisieren
            document.getElementById('ki-check-container').innerHTML = `
                <p class="text-sm text-green-800">
                    <i class="fas fa-check-circle mr-2"></i>
                    API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert. Sie können die Analyse und Optimierung starten.
                </p>
            `;
            document.getElementById('ki-check-container').classList.remove('bg-yellow-50', 'border-yellow-200');
            document.getElementById('ki-check-container').classList.add('bg-green-50', 'border-green-200');
            
            // Enable analysis options
            enableAnalysisOptions();
        } else {
            document.getElementById('api-status').classList.remove('hidden');
            document.getElementById('api-status').classList.add('bg-red-50', 'border', 'border-red-500');
            document.getElementById('api-status').innerHTML = `
                <p class="text-red-700">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Der API-Schlüssel konnte nicht validiert werden. Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.
                </p>
            `;
        }
    } catch (error) {
        console.error('Fehler bei der API-Validierung:', error);
        
        document.getElementById('api-status').classList.remove('hidden');
        document.getElementById('api-status').classList.add('bg-red-50', 'border', 'border-red-500');
        document.getElementById('api-status').innerHTML = `
            <p class="text-red-700">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Fehler bei der API-Validierung: ${error.message || "Unbekannter Fehler"}
            </p>
        `;
    } finally {
        validateButton.textContent = 'Validieren';
        validateButton.disabled = false;
    }
}

// OpenAI API-Schlüssel validieren
async function validateOpenAIKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('OpenAI Validierungsfehler:', error);
        return false;
    }
}

// Claude API-Schlüssel validieren
async function validateClaudeKey(apiKey) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 10,
                messages: [
                    { role: 'user', content: 'API key validation test' }
                ]
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Claude Validierungsfehler:', error);
        return false;
    }
}

// DeepSeek API-Schlüssel validieren
async function validateDeepSeekKey(apiKey) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('DeepSeek Validierungsfehler:', error);
        return false;
    }
}

// Analysedaten sammeln
function collectAnalysisData() {
    // Objektdaten
    const objekttyp = document.getElementById('objekttyp').value;
    const nutzungsart = document.getElementById('nutzungsart').value;
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche').value) || 0;
    const grundstuecksflaeche = parseFloat(document.getElementById('grundstuecksflaeche').value) || 0;
    const plz = document.getElementById('plz').value;
    const ort = document.getElementById('ort').value;
    const bundesland = document.getElementById('bundesland').value;
    const lage = document.getElementById('lage').value;
    const baujahr = parseFloat(document.getElementById('baujahr').value) || 0;
    const zustand = document.getElementById('zustand')?.value || '';
    
    // Kostendaten
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    const kaufpreisQm = wohnflaeche > 0 ? kaufpreis / wohnflaeche : 0;
    const grunderwerbsteuer = parseFloat(document.getElementById('grunderwerbsteuer_prozent').value) || 0;
    const notar = parseFloat(document.getElementById('notar_prozent').value) || 0;
    const makler = parseFloat(document.getElementById('makler_prozent').value) || 0;
    const nebenkostenGesamt = parseFloat(document.getElementById('nebenkosten_gesamt').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten').value) || 0;
    
    // Finanzierungsdaten
    const eigenkapital = parseFloat(document.getElementById('eigenkapital').value) || 0;
    const eigenkapitalQuote = parseFloat(document.getElementById('eigenkapital_quote').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const foerdermittel = parseFloat(document.getElementById('foerdermittel').value) || 0;
    const zuFinanzieren = parseFloat(document.getElementById('zu_finanzieren').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Darlehensdaten
    const darlehen = [];
    const darlehenBlocks = document.querySelectorAll('.darlehen-block');
    
    darlehenBlocks.forEach((block, index) => {
        const darlehensBetrag = parseFloat(block.querySelector('.darlehen-betrag').value) || 0;
        const zins = parseFloat(block.querySelector('.darlehen-zins').value) || 0;
        const tilgung = parseFloat(block.querySelector('.darlehen-tilgung').value) || 0;
        const zinsbindung = parseFloat(block.querySelector('.darlehen-zinsbindung').value) || 0;
        const rate = parseFloat(block.querySelector('.darlehen-rate').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        const restschuld = parseFloat(block.querySelector('.darlehen-restschuld').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        
        // Sondertilgung
        let sondertilgung = {
            aktiv: false,
            betrag: 0,
            rhythmus: 'jaehrlich'
        };
        
        const sondertilgungOption = block.querySelector('.darlehen-sondertilgung-option');
        if (sondertilgungOption && sondertilgungOption.checked) {
            sondertilgung.aktiv = true;
            sondertilgung.betrag = parseFloat(block.querySelector('.darlehen-sondertilgung-betrag').value) || 0;
            sondertilgung.rhythmus = block.querySelector('.darlehen-sondertilgung-rhythmus').value;
        }
        
        darlehen.push({
            nr: index + 1,
            betrag: darlehensBetrag,
            zins,
            tilgung,
            zinsbindung,
            rate,
            restschuld,
            sondertilgung
        });
    });
    
    // Gesamtsummen
    const darlehenSumme = parseFloat(document.getElementById('darlehen_summe').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const rateSumme = parseFloat(document.getElementById('rate_summe').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const beleihungsauslauf = parseFloat(document.getElementById('beleihungsauslauf').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Für Belastungsanalyse (konservative Schätzung)
    const monatlichesNettoeinkommen = rateSumme * 3; // Annahme: Rate ist ca. 1/3 des Nettoeinkommens
    const monatlicheWohnkosten = rateSumme * 1.3; // Annahme: Nebenkosten sind ca. 30% der Rate
    
    return {
        objektdaten: {
            objekttyp,
            nutzungsart,
            wohnflaeche,
            grundstuecksflaeche,
            plz,
            ort,
            bundesland,
            lage,
            baujahr,
            zustand
        },
        kostendaten: {
            kaufpreis,
            kaufpreisQm,
            grunderwerbsteuer,
            notar,
            makler,
            nebenkostenGesamt,
            modernisierungskosten
        },
        finanzierungsdaten: {
            eigenkapital,
            eigenkapitalQuote,
            foerdermittel,
            zuFinanzieren,
            darlehen,
            darlehenSumme,
            rateSumme,
            beleihungsauslauf
        },
        belastungsdaten: {
            monatlichesNettoeinkommen,
            monatlicheWohnkosten
        }
    };
}

// Prompt für die jeweilige Analyse erstellen
function createAnalysisPrompt(analyseTyp, analyseDaten) {
    const allgemeineInfo = `
Ich benötige eine detaillierte Analyse einer Baufinanzierung mit folgenden Daten:

## Objektdaten
- Objekttyp: ${analyseDaten.objektdaten.objekttyp}
- Nutzungsart: ${analyseDaten.objektdaten.nutzungsart}
- Wohnfläche: ${analyseDaten.objektdaten.wohnflaeche} m²
- Grundstücksfläche: ${analyseDaten.objektdaten.grundstuecksflaeche} m²
- PLZ/Ort: ${analyseDaten.objektdaten.plz} ${analyseDaten.objektdaten.ort}
- Bundesland: ${analyseDaten.objektdaten.bundesland}
- Lage: ${analyseDaten.objektdaten.lage}
${analyseDaten.objektdaten.baujahr ? `- Baujahr: ${analyseDaten.objektdaten.baujahr}` : ''}
${analyseDaten.objektdaten.zustand ? `- Zustand: ${analyseDaten.objektdaten.zustand}` : ''}

## Kostendaten
- Kaufpreis: ${formatCurrency(analyseDaten.kostendaten.kaufpreis)}
- Kaufpreis pro m²: ${formatCurrency(analyseDaten.kostendaten.kaufpreisQm)}
- Grunderwerbsteuer: ${analyseDaten.kostendaten.grunderwerbsteuer}%
- Notar & Grundbuch: ${analyseDaten.kostendaten.notar}%
- Maklergebühr: ${analyseDaten.kostendaten.makler}%
- Kaufnebenkosten gesamt: ${formatCurrency(analyseDaten.kostendaten.nebenkostenGesamt)}
- Modernisierungskosten: ${formatCurrency(analyseDaten.kostendaten.modernisierungskosten)}

## Finanzierungsdaten
- Eigenkapital: ${formatCurrency(analyseDaten.finanzierungsdaten.eigenkapital)}
- Eigenkapitalquote: ${analyseDaten.finanzierungsdaten.eigenkapitalQuote.toFixed(1)}%
- Fördermittel: ${formatCurrency(analyseDaten.finanzierungsdaten.foerdermittel)}
- Zu finanzierender Betrag: ${formatCurrency(analyseDaten.finanzierungsdaten.zuFinanzieren)}
- Beleihungsauslauf: ${analyseDaten.finanzierungsdaten.beleihungsauslauf.toFixed(1)}%
`;

    // Darlehensdaten hinzufügen
    let darlehenInfo = "\n## Darlehen\n";
    analyseDaten.finanzierungsdaten.darlehen.forEach(darlehen => {
        darlehenInfo += `
### Darlehen ${darlehen.nr}
- Betrag: ${formatCurrency(darlehen.betrag)}
- Zins: ${darlehen.zins.toFixed(2)}%
- Tilgung: ${darlehen.tilgung.toFixed(2)}%
- Zinsbindung: ${darlehen.zinsbindung} Jahre
- Monatliche Rate: ${formatCurrency(darlehen.rate)}
- Restschuld nach Zinsbindung: ${formatCurrency(darlehen.restschuld)}
- Sondertilgung: ${darlehen.sondertilgung.aktiv ? `Ja, ${formatCurrency(darlehen.sondertilgung.betrag)} (${darlehen.sondertilgung.rhythmus})` : 'Nein'}
`;
    });

    let spezifischeAnweisung = "";
    
    switch(analyseTyp) {
        case 'marktdaten':
            spezifischeAnweisung = `
Führe eine detaillierte Marktdatenanalyse für die oben beschriebene Immobilie durch. Bewerte insbesondere:
1. Die Relation des Kaufpreises zum aktuellen Marktdurchschnitt in der Region
2. Den Kaufpreis pro Quadratmeter im Vergleich zu ähnlichen Objekten
3. Die aktuelle und prognostizierte Preisentwicklung für diesen Standort
4. Die Angemessenheit des Kaufpreises unter Berücksichtigung von Lage, Objekttyp und Zustand

Formatiere deine Antwort als HTML mit Tailwind CSS-Klassen. Verwende div-Container, Tabellen, Listenelemente und farbige Hervorhebungen (grün für positive, gelb für neutrale und rot für kritische Bewertungen).
`;
            break;
            
        case 'belastung':
            spezifischeAnweisung = `
Führe eine Belastbarkeitsanalyse für die oben beschriebene Finanzierung durch. Bewerte insbesondere:
1. Das Verhältnis der monatlichen Rate zum angenommenen Nettoeinkommen
2. Die Nachhaltigkeit der monatlichen Belastung über die Laufzeit
3. Risikofaktoren und Belastungsspitzen
4. Empfehlungen für eine solide und tragfähige Finanzierung

Nimm für diese Analyse an, dass das monatliche Nettoeinkommen bei ${formatCurrency(analyseDaten.belastungsdaten.monatlichesNettoeinkommen)} liegt und die gesamten monatlichen Wohnkosten (inkl. Nebenkosten) bei ${formatCurrency(analyseDaten.belastungsdaten.monatlicheWohnkosten)}.

Formatiere deine Antwort als HTML mit Tailwind CSS-Klassen. Verwende div-Container, Tabellen, Listenelemente und farbige Hervorhebungen (grün für positive, gelb für neutrale und rot für kritische Bewertungen).
`;
            break;
            
        case 'optimierung':
            spezifischeAnweisung = `
Erstelle detaillierte Optimierungsvorschläge für die oben beschriebene Baufinanzierung. Analysiere:
1. Die Eigenkapitalquote und mögliche Verbesserungen
2. Die Darlehensstruktur (Zinsen, Tilgung, Zinsbindung)
3. Sondertilgungsoptionen und deren optimale Nutzung
4. Finanzierungsalternativen und Optimierungspotenziale
5. Konkrete, umsetzbare Handlungsempfehlungen

Formatiere deine Antwort als HTML mit Tailwind CSS-Klassen. Verwende div-Container, Tabellen, Listenelemente und farbige Hervorhebungen. Gib klare, konkrete Handlungsanweisungen und erkläre die Vorteile jeder Optimierung.
`;
            break;
            
        case 'vollstaendig':
            spezifischeAnweisung = `
Führe eine vollständige Analyse und Plausibilitätsprüfung der oben beschriebenen Baufinanzierung durch. Diese sollte folgende Aspekte umfassen:
1. Marktdatenanalyse: Bewertung des Kaufpreises im Vergleich zum Markt
2. Belastbarkeitsanalyse: Nachhaltigkeit der monatlichen Raten
3. Risikoanalyse: Identifikation und Bewertung von Risikofaktoren
4. Optimierungsvorschläge: Konkrete Handlungsempfehlungen
5. Gesamtbewertung: Einstufung der Finanzierung (z.B. risikoarm, solide, optimierungsbedürftig, kritisch)

Gib eine Risikobewertung auf einer Skala von niedrig, mittel bis hoch.

Formatiere deine Antwort als HTML mit Tailwind CSS-Klassen. Strukturiere die Analyse in Abschnitte und verwende Tabellen, Listen und farbige Hervorhebungen. Die Ausgabe sollte professionell und leicht verständlich sein.
`;
            break;
    }
    
    return allgemeineInfo + darlehenInfo + spezifischeAnweisung;
}

// Analyse-Optionen aktivieren
function enableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    const analyseOptions = analyseOptionen.querySelectorAll('div');
    
    analyseOptions.forEach(option => {
        option.classList.add('bg-white');
        option.addEventListener('click', handleAnalysisOptionClick);
    });
}

// Analyse-Option Click-Handler
function handleAnalysisOptionClick(e) {
    const optionId = e.currentTarget.id;
    
    // Analyse starten
    startAnalysis(optionId.replace('-analyse', ''));
}

// Analyse zurücksetzen
function resetAnalysis() {
    document.getElementById('analyse-ergebnis-container').classList.add('hidden');
    document.getElementById('analyse-optionen').classList.remove('hidden');
}

// Provider-Name abrufen
function getProviderName(providerId) {
    switch(providerId) {
        case 'openai': return 'OpenAI (GPT-4)';
        case 'anthropic': return 'Claude';
        case 'deepseek': return 'DeepSeek';
        default: return 'KI-Provider';
    }
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
