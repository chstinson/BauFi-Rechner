// Simulierte API-Antwort generieren
function generiereSimulierteApiAntwort(daten, provider) {
    // In einer echten Anwendung würde hier die KI-API genutzt
    // Für die Demo generieren wir einen plausiblen Text
    
    const preisProQm = daten.wohnflaeche > 0 ? daten.kaufpreis / daten.wohnflaeche : 0;
    
    // Nach Region differenzierte Preiseinschätzung
    let regionaleEinschaetzung = "durchschnittlich";
    let regionName = "dieser Region";
    
    if (daten.plz) {
        const plzPrefix = daten.plz.substring(0, 1);
        switch (plzPrefix) {
            case '1': regionName = "Berlin"; break;
            case '2': regionName = "Hamburg"; break;
            case '3': regionName = "Niedersachsen"; break;
            case '4': regionName = "Ruhrgebiet"; break;
            case '5': regionName = "Köln/Bonn"; break;
            case '6': regionName = "Frankfurt/Rhein-Main"; break;
            case '7': regionName = "Stuttgart"; break;
            case '8': regionName = "München"; break;
            case '9': regionName = "Nürnberg"; break;
            default: regionName = "dieser Region";
        }
        
        // Preise für die Region einschätzen
        const regionalpreise = {
            '1': 4800, '2': 4500, '3': 2800, '4': 2500, 
            '5': 3600, '6': 4200, '7': 4000, '8': 6500, '9': 3200
        };
        
        const regionalerDurchschnitt = regionalpreise[plzPrefix] || 3500;
        
        if (preisProQm < regionalerDurchschnitt * 0.85) {
            regionaleEinschaetzung = "unter dem Durchschnitt";
        } else if (preisProQm > regionalerDurchschnitt * 1.15) {
            regionaleEinschaetzung = "über dem Durchschnitt";
        }
    }
    
    // Antwort basierend auf Provider anpassen
    let antwort = '';
    
    if (provider === 'openai') {
        antwort = `<div class="p-4 bg-gray-50 border rounded whitespace-pre-line">
# Analyse Ihrer Immobilienfinanzierung

## 1. Standortanalyse
${daten.ort ? `Die Immobilie befindet sich in ${daten.ort}${daten.plz ? ` (PLZ ${daten.plz})` : ''}, einer Region, die als Wohnlage ${regionName === "München" || regionName === "Hamburg" || regionName === "Berlin" ? "stark nachgefragt" : "durchschnittlich nachgefragt"} ist.` : 'Keine Standortangabe vorhanden.'}

Die Immobilienpreise sind in ${regionName} in den letzten Jahren ${regionName === "München" || regionName === "Berlin" || regionName === "Hamburg" || regionName === "Frankfurt/Rhein-Main" ? "stark gestiegen" : "moderat gestiegen"}.

${daten.objekttyp ? `Bei einem ${daten.objekttyp} in dieser Lage ist mittelfristig mit ${regionName === "München" || regionName === "Hamburg" || regionName === "Berlin" ? "stabilen bis steigenden" : "stabilen"} Preisen zu rechnen.` : ''}

## 2. Kaufpreisbewertung
Der Kaufpreis von ${formatCurrency(daten.kaufpreis)} für eine Immobilie mit ${daten.wohnflaeche} m² entspricht einem Quadratmeterpreis von ${formatCurrency(preisProQm)}.

Dieser Preis liegt ${regionaleEinschaetzung} für ${regionName}. ${preisProQm > 4000 ? "Es handelt sich um ein hochpreisiges Segment." : preisProQm > 3000 ? "Es handelt sich um ein mittleres bis gehobenes Preissegment." : "Es handelt sich um ein moderates Preissegment."}

${daten.baujahr ? `Für ein Objekt aus dem Jahr ${daten.baujahr} ist dieser Preis ${new Date().getFullYear() - daten.baujahr > 40 ? "unter Berücksichtigung des Alters zu bewerten" : "angemessen"}.` : ''}

## 3. Finanzierungsstruktur
Die Finanzierungsstruktur basiert auf ${formatCurrency(daten.eigenkapital)} Eigenkapital (${daten.eigenkapitalQuote.toFixed(1)}%) und einer Fremdfinanzierung über ${daten.darlehen.length} Darlehen.

Der durchschnittliche Zinssatz beträgt ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length).toFixed(2)}%, was im aktuellen Marktumfeld ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length) > 3.7 ? "leicht überdurchschnittlich" : (daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length) < 3.0 ? "günstig" : "marktüblich"} ist.

Die monatliche Gesamtbelastung von ${formatCurrency(daten.gesamtRate)} sollte in einem angemessenen Verhältnis zum verfügbaren Haushaltseinkommen stehen (idealerweise nicht mehr als 35-40%).

Der Beleihungsauslauf (LTV) von ${daten.beleihungsauslauf.toFixed(1)}% ist ${daten.beleihungsauslauf > 80 ? "überdurchschnittlich hoch, was zu höheren Zinsen führen kann" : daten.beleihungsauslauf < 60 ? "günstig und führt zu besseren Zinskonditionen" : "im üblichen Rahmen"}.

## 4. Empfehlungen
Basierend auf den vorliegenden Daten ergeben sich folgende Empfehlungen:

${daten.eigenkapitalQuote < 20 ? "- Prüfen Sie, ob Sie mehr Eigenkapital einbringen können, um die Eigenkapitalquote auf mindestens 20% zu erhöhen.\n" : ""}
${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2.5 ? "- Erhöhen Sie die Tilgung auf mindestens 2,5%, um die Gesamtlaufzeit zu verkürzen.\n" : ""}
${daten.beleihungsauslauf > 80 ? "- Verhandeln Sie mit mehreren Banken, um trotz des hohen Beleihungsauslaufs günstige Konditionen zu erhalten.\n" : ""}
${daten.darlehen.some(d => d.zinsbindung < 10) ? "- Prüfen Sie längere Zinsbindungen, um von den aktuell noch vergleichsweise günstigen Zinsen zu profitieren.\n" : ""}
- Vereinbaren Sie eine Sondertilgungsoption, um flexibel auf finanzielle Veränderungen reagieren zu können.
${daten.eigenkapitalQuote < 10 ? "- Prüfen Sie zusätzliche Fördermittel (z.B. KfW) zur Optimierung der Finanzierungsstruktur.\n" : ""}

Insgesamt erscheint die Finanzierung ${daten.eigenkapitalQuote < 15 || daten.beleihungsauslauf > 90 ? "risikoreich und sollte optimiert werden" : daten.eigenkapitalQuote > 25 && daten.beleihungsauslauf < 70 ? "solide strukturiert" : "grundsätzlich machbar, aber mit Optimierungspotenzial"}.
</div>`;
    } else {
        // DeepSeek oder andere Provider
        antwort = `<div class="p-4 bg-gray-50 border rounded whitespace-pre-line">
# Plausibilitätsprüfung Ihrer Baufinanzierung

## Standortanalyse
${daten.ort ? `Standort: ${daten.ort}${daten.plz ? ` (PLZ ${daten.plz})` : ''}` : 'Keine Standortangabe vorhanden.'} 
Region: ${regionName}
Marktentwicklung: ${regionName === "München" || regionName === "Berlin" || regionName === "Hamburg" ? "Stark wachsender Markt" : regionName === "Frankfurt/Rhein-Main" || regionName === "Stuttgart" ? "Wachsender Markt" : "Stabiler Markt"}

## Kaufpreisbewertung
Objekttyp: ${daten.objekttyp || 'Keine Angabe'}
${daten.baujahr ? `Baujahr: ${daten.baujahr}` : ''}
Wohnfläche: ${daten.wohnflaeche} m²
Kaufpreis: ${formatCurrency(daten.kaufpreis)} (${formatCurrency(preisProQm)}/m²)

Der Quadratmeterpreis liegt im Vergleich zum regionalen Durchschnitt ${regionaleEinschaetzung} und ist als ${preisProQm > 4500 ? "sehr hoch" : preisProQm > 3500 ? "gehoben" : preisProQm > 2500 ? "durchschnittlich" : "moderat"} einzustufen.

## Finanzierungsstruktur
Eigenkapital: ${formatCurrency(daten.eigenkapital)} (${daten.eigenkapitalQuote.toFixed(1)}%)
Darlehenssumme: ${formatCurrency(daten.kaufpreis - daten.eigenkapital)}
Durchschnittlicher Zinssatz: ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length).toFixed(2)}%
Durchschnittliche Tilgung: ${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length).toFixed(2)}%
Monatliche Rate: ${formatCurrency(daten.gesamtRate)}
Beleihungsauslauf (LTV): ${daten.beleihungsauslauf.toFixed(1)}%

Die Eigenkapitalquote ist ${daten.eigenkapitalQuote < 10 ? "kritisch niedrig" : daten.eigenkapitalQuote < 20 ? "niedrig" : daten.eigenkapitalQuote > 40 ? "sehr gut" : "angemessen"}.
Der Beleihungsauslauf ist ${daten.beleihungsauslauf > 90 ? "sehr hoch (erhöhtes Risiko)" : daten.beleihungsauslauf > 80 ? "hoch" : daten.beleihungsauslauf < 60 ? "niedrig (günstige Konditionen)" : "normal"}.
Der Zinssatz ist im aktuellen Marktumfeld ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length) > 3.8 ? "überdurchschnittlich" : (daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length) < 3.2 ? "günstig" : "marktüblich"}.
Die Tilgung ist ${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 1.5 ? "zu niedrig" : (daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2.5 ? "niedrig" : (daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) > 4 ? "sehr hoch" : "angemessen"}.

## Risikoanalyse und Empfehlungen

Risikofaktoren:
${daten.eigenkapitalQuote < 15 ? "- Geringe Eigenkapitalquote\n" : ""}
${daten.beleihungsauslauf > 80 ? "- Hoher Beleihungsauslauf\n" : ""}
${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2.0 ? "- Niedrige Tilgungsrate\n" : ""}
${daten.darlehen.some(d => d.zinsbindung < 8) ? "- Kurze Zinsbindung bei einigen Darlehen\n" : ""}

Optimierungspotenzial:
${daten.eigenkapitalQuote < 20 ? "- Eigenkapitalquote erhöhen (Ziel: min. 20%)\n" : ""}
${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2.5 ? "- Tilgungsrate erhöhen (Empfehlung: min. 2,5%)\n" : ""}
${daten.darlehen.some(d => d.zinsbindung < 10) ? "- Längere Zinsbindungen prüfen (Empfehlung: min. 10 Jahre)\n" : ""}
${daten.beleihungsauslauf > 80 ? "- Alternative Angebote einholen, um trotz hohem LTV günstige Konditionen zu erhalten\n" : ""}
- Sondertilgungsoptionen vereinbaren für mehr Flexibilität

Plausibilitätsbewertung: Die Finanzierung ist insgesamt ${daten.eigenkapitalQuote < 15 || daten.beleihungsauslauf > 90 ? "mit höherem Risiko verbunden und sollte überarbeitet werden" : daten.eigenkapitalQuote > 25 && daten.beleihungsauslauf < 70 ? "gut strukturiert und erscheint nachhaltig" : "grundsätzlich tragfähig, weist aber Optimierungspotenzial auf"}.
</div>`;
    }
    
    return antwort;
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

// API-Integration für echte Marktdatenabfragen
// Diese Funktion würde in einer Produktivversion verwendet werden,
// um tatsächliche Marktdaten von externen APIs zu beziehen
async function getExternalMarketData(endpoint, params, apiKey) {
    try {
        // API-Endpunkte Konfiguration
        const API_ENDPOINTS = {
            bodenrichtwerte: "https://api.example.com/bodenrichtwerte",
            immobilienpreise: "https://api.example.com/immobilienpreise",
            zinskonditionen: "https://api.example.com/zinskonditionen"
        };
        
        // Echten API-Aufruf durchführen
        const url = API_ENDPOINTS[endpoint];
        if (!url) throw new Error(`Unbekannter API-Endpunkt: ${endpoint}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Fehler bei API-Abfrage:", error);
        // Fallback auf simulierte Daten im Fehlerfall
        return null;
    }
}// marktdaten-plausibilisierung.js
// Erweitert den BauFi-Rechner um Funktionen zur Plausibilisierung mit Marktdaten

document.addEventListener('DOMContentLoaded', function() {
    // Plausibilisierungsbereich initialisieren
    initPlausibilisierungsUI();
});

// Plausibilisierungs-UI initialisieren
function initPlausibilisierungsUI() {
    // Container erstellen
    const mainContainer = document.querySelector('.container.mx-auto.p-4');
    if (!mainContainer) return;
    
    // Neuen Abschnitt nach dem Ergebnisbereich einfügen
    const plausibilisierungSection = document.createElement('div');
    plausibilisierungSection.className = 'mt-8 bg-white rounded-lg shadow-md p-6';
    plausibilisierungSection.innerHTML = createPlausibilisierungsHTML();
    
    // Nach der Hauptberechnung einfügen
    const rechnerContainer = document.querySelector('.bg-white.rounded-lg.shadow-md.p-6');
    if (rechnerContainer) {
        mainContainer.insertBefore(plausibilisierungSection, rechnerContainer.nextSibling);
    } else {
        mainContainer.appendChild(plausibilisierungSection);
    }
    
    // Event-Listener für Plausibilisierungsfunktionen
    setupPlausibilisierungEvents();
}

// HTML für den Plausibilisierungsbereich
function createPlausibilisierungsHTML() {
    return `
    <h2 class="text-xl font-semibold mb-4">Plausibilisierung mit Marktdaten</h2>
    
    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p class="text-sm text-blue-800">
            Überprüfen Sie Ihre Immobilienfinanzierung anhand aktueller Marktdaten und erhalten Sie eine umfassende Bewertung zur Plausibilität.
        </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="border rounded p-4 hover:shadow-md transition cursor-pointer bg-white" id="api-plausibilisierung">
            <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">Eigene API nutzen</span>
            </div>
            <p class="text-sm text-gray-600">Verwenden Sie Ihren eigenen API-Schlüssel für OpenAI oder DeepSeek, um eine KI-basierte Plausibilitätsprüfung durchzuführen.</p>
        </div>
        
        <div class="border rounded p-4 hover:shadow-md transition cursor-pointer bg-white" id="bodenrichtwert-plausibilisierung">
            <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span class="font-medium">Bodenrichtwerte</span>
            </div>
            <p class="text-sm text-gray-600">Vergleichen Sie den Kaufpreis mit amtlichen Bodenrichtwerten und Immobilienpreisspiegeln.</p>
        </div>
        
        <div class="border rounded p-4 hover:shadow-md transition cursor-pointer bg-white" id="finanzierung-plausibilisierung">
            <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">Finanzierungskonditionen</span>
            </div>
            <p class="text-sm text-gray-600">Überprüfen Sie Ihre Zins- und Tilgungskonditionen im Vergleich zu aktuellen Marktkonditionen.</p>
        </div>
    </div>
    
    <div id="plausibilisierung-container" class="hidden">
        <!-- Container für die jeweilige Plausibilisierungsmethode -->
        
        <!-- API-Plausibilisierung -->
        <div id="api-container" class="hidden">
            <h3 class="text-lg font-semibold mb-2">KI-basierte Plausibilitätsprüfung</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="border rounded p-4 cursor-pointer" id="openai-provider">
                    <div class="flex items-center mb-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/180px-ChatGPT_logo.svg.png" alt="OpenAI Logo" class="h-6 w-6 mr-2">
                        <span class="font-medium">OpenAI (GPT-4)</span>
                    </div>
                    <p class="text-sm text-gray-600">Nutzen Sie GPT-4 für eine detaillierte Analyse Ihrer Baufinanzierung.</p>
                </div>
                
                <div class="border rounded p-4 cursor-pointer" id="deepseek-provider">
                    <div class="flex items-center mb-2">
                        <img src="https://www.deepseek.com/favicon.ico" alt="DeepSeek Logo" class="h-6 w-6 mr-2">
                        <span class="font-medium">DeepSeek</span>
                    </div>
                    <p class="text-sm text-gray-600">DeepSeek's KI bewertet Ihre Immobilienfinanzierung und gibt Empfehlungen.</p>
                </div>
            </div>
            
            <div id="api-key-input" class="mb-4 hidden">
                <label class="block text-sm font-medium mb-1" id="selected-provider-label">API-Schlüssel</label>
                <div class="flex items-center">
                    <input type="password" id="api-key" class="w-full p-2 border rounded" placeholder="Ihr API-Schlüssel">
                    <button id="validate-api-key" class="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Validieren</button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Ihr API-Schlüssel wird nur für diese Anfrage verwendet und nicht gespeichert.</p>
            </div>
            
            <button id="run-api-analysis" class="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition hidden">
                KI-Analyse starten
            </button>
            
            <div id="api-result" class="mt-4 hidden">
                <h4 class="font-medium mb-2">Analyseergebnis</h4>
                <div id="api-result-content" class="p-4 bg-gray-50 border rounded"></div>
            </div>
        </div>
        
        <!-- Bodenrichtwert-Plausibilisierung -->
        <div id="bodenrichtwert-container" class="hidden">
            <h3 class="text-lg font-semibold mb-2">Bodenrichtwert-Analyse</h3>
            
            <div class="mb-4">
                <p class="mb-2">Geben Sie Ihre PLZ ein, um Bodenrichtwerte abzufragen:</p>
                <div class="flex">
                    <input type="text" id="bodenrichtwert-plz" class="w-32 p-2 border rounded" placeholder="PLZ">
                    <button id="check-bodenrichtwert" class="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Prüfen
                    </button>
                </div>
            </div>
            
            <div id="bodenrichtwert-result" class="hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Bodenrichtwert in Ihrer Region</div>
                        <div id="bodenrichtwert-wert" class="text-xl font-bold">-</div>
                    </div>
                    
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Durchschnittlicher m²-Preis</div>
                        <div id="durchschnittspreis" class="text-xl font-bold">-</div>
                    </div>
                    
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Kaufpreis-Bewertung</div>
                        <div id="kaufpreis-bewertung" class="text-xl font-bold">-</div>
                    </div>
                    
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Preistrend (5 Jahre)</div>
                        <div id="preistrend" class="text-xl font-bold">-</div>
                    </div>
                </div>
                
                <div id="bodenrichtwert-bewertung" class="p-4 bg-gray-50 border rounded"></div>
            </div>
        </div>
        
        <!-- Finanzierungskonditionen-Plausibilisierung -->
        <div id="finanzierung-container" class="hidden">
            <h3 class="text-lg font-semibold mb-2">Analyse der Finanzierungskonditionen</h3>
            
            <button id="check-finanzierung" class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Finanzierungskonditionen prüfen
            </button>
            
            <div id="finanzierung-result" class="mt-4 hidden">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Durchschnittlicher Zinssatz</div>
                        <div id="durchschnitt-zins" class="text-xl font-bold">-</div>
                        <div class="text-sm text-gray-500" id="zins-vergleich"></div>
                    </div>
                    
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Empfohlene Tilgung</div>
                        <div id="empfohlene-tilgung" class="text-xl font-bold">-</div>
                        <div class="text-sm text-gray-500" id="tilgung-vergleich"></div>
                    </div>
                    
                    <div class="p-3 bg-white rounded border">
                        <div class="text-sm text-gray-500">Belastbarkeitsquote</div>
                        <div id="belastbarkeit" class="text-xl font-bold">-</div>
                        <div class="text-sm text-gray-500" id="belastbarkeit-hinweis"></div>
                    </div>
                </div>
                
                <div id="finanzierung-bewertung" class="p-4 border rounded"></div>
            </div>
        </div>
    </div>
    `;
}

// Event-Listener für Plausibilisierungsfunktionen
function setupPlausibilisierungEvents() {
    // Klick auf die Plausibilisierungsmethoden
    document.getElementById('api-plausibilisierung').addEventListener('click', () => {
        openPlausibilisierungsTool('api-container');
    });
    
    document.getElementById('bodenrichtwert-plausibilisierung').addEventListener('click', () => {
        openPlausibilisierungsTool('bodenrichtwert-container');
    });
    
    document.getElementById('finanzierung-plausibilisierung').addEventListener('click', () => {
        openPlausibilisierungsTool('finanzierung-container');
    });
    
    // API-Plausibilisierung
    setupApiPlausibilisierung();
    
    // Bodenrichtwert-Plausibilisierung
    document.getElementById('check-bodenrichtwert').addEventListener('click', checkBodenrichtwert);
    
    // Finanzierungskonditionen-Plausibilisierung
    document.getElementById('check-finanzierung').addEventListener('click', checkFinanzierungskonditionen);
}

// Plausibilisierungstool öffnen
function openPlausibilisierungsTool(containerId) {
    // Container anzeigen
    const plausibilisierungContainer = document.getElementById('plausibilisierung-container');
    plausibilisierungContainer.classList.remove('hidden');
    
    // Alle Tool-Container ausblenden
    document.getElementById('api-container').classList.add('hidden');
    document.getElementById('bodenrichtwert-container').classList.add('hidden');
    document.getElementById('finanzierung-container').classList.add('hidden');
    
    // Gewählten Container anzeigen
    document.getElementById(containerId).classList.remove('hidden');
}

// API-Plausibilisierung einrichten
function setupApiPlausibilisierung() {
    let selectedProvider = null;
    
    // Provider-Auswahl
    document.getElementById('openai-provider').addEventListener('click', () => {
        selectProvider('openai');
    });
    
    document.getElementById('deepseek-provider').addEventListener('click', () => {
        selectProvider('deepseek');
    });
    
    // Provider auswählen
    function selectProvider(providerId) {
        selectedProvider = providerId;
        
        // UI aktualisieren
        document.querySelectorAll('#openai-provider, #deepseek-provider').forEach(el => {
            el.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        document.getElementById(`${providerId}-provider`).classList.add('border-blue-500', 'bg-blue-50');
        document.getElementById('selected-provider-label').textContent = 
            providerId === 'openai' ? 'OpenAI API-Schlüssel' : 'DeepSeek API-Schlüssel';
            
        document.getElementById('api-key-input').classList.remove('hidden');
        document.getElementById('run-api-analysis').classList.add('hidden');
    }
    
    // API-Schlüssel validieren
    document.getElementById('validate-api-key').addEventListener('click', validateApiKey);
    
    // API-Analyse starten
    document.getElementById('run-api-analysis').addEventListener('click', runApiAnalysis);
    
    // API-Schlüssel validieren
    async function validateApiKey() {
        if (!selectedProvider) {
            alert('Bitte wählen Sie einen API-Provider aus.');
            return;
        }
        
        const apiKey = document.getElementById('api-key').value.trim();
        if (!apiKey) {
            alert('Bitte geben Sie Ihren API-Schlüssel ein.');
            return;
        }
        
        const validateButton = document.getElementById('validate-api-key');
        validateButton.textContent = 'Prüfe...';
        validateButton.disabled = true;
        
        try {
            // Simulierte API-Validierung (in einer realen Anwendung würde hier eine echte Anfrage gesendet)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // API-Schlüssel als gültig markieren (für Demo-Zwecke)
            const isValid = true;
            
            if (isValid) {
                document.getElementById('api-key').classList.add('border-green-500');
                document.getElementById('run-api-analysis').classList.remove('hidden');
            } else {
                document.getElementById('api-key').classList.add('border-red-500');
                alert('Der API-Schlüssel ist ungültig oder hat nicht die erforderlichen Berechtigungen.');
            }
        } catch (error) {
            console.error('Fehler bei der API-Schlüssel-Validierung:', error);
            alert('Fehler bei der Validierung. Bitte versuchen Sie es erneut.');
        } finally {
            validateButton.textContent = 'Validieren';
            validateButton.disabled = false;
        }
    }
    
    // API-Analyse durchführen
    async function runApiAnalysis() {
        const apiKey = document.getElementById('api-key').value.trim();
        if (!apiKey) {
            alert('Bitte geben Sie einen gültigen API-Schlüssel ein.');
            return;
        }
        
        const analyseButton = document.getElementById('run-api-analysis');
        analyseButton.textContent = 'Analysiere...';
        analyseButton.disabled = true;
        
        try {
            // Daten für die Analyse sammeln
            const analyseDaten = sammleFinanzierungsdaten();
            
            // Simulierte API-Anfrage
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulierte Antwort generieren
            const antwort = generiereSimulierteApiAntwort(analyseDaten, selectedProvider);
            
            // Ergebnis anzeigen
            document.getElementById('api-result').classList.remove('hidden');
            document.getElementById('api-result-content').innerHTML = antwort;
            
            // Zu den Ergebnissen scrollen
            document.getElementById('api-result').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Fehler bei der API-Analyse:', error);
            alert('Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
        } finally {
            analyseButton.textContent = 'KI-Analyse starten';
            analyseButton.disabled = false;
        }
    }
}

// Bodenrichtwert prüfen
async function checkBodenrichtwert() {
    const plz = document.getElementById('bodenrichtwert-plz').value.trim();
    if (!plz) {
        alert('Bitte geben Sie eine Postleitzahl ein.');
        return;
    }
    
    const checkButton = document.getElementById('check-bodenrichtwert');
    checkButton.textContent = 'Prüfe...';
    checkButton.disabled = true;
    
    try {
        // Simulierte API-Anfrage
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulierte Daten generieren
        const bodenrichtwertDaten = generiereSimulierteBodenrichtwertDaten(plz);
        
        // Daten anzeigen
        document.getElementById('bodenrichtwert-result').classList.remove('hidden');
        document.getElementById('bodenrichtwert-wert').textContent = formatCurrency(bodenrichtwertDaten.bodenrichtwert) + '/m²';
        document.getElementById('durchschnittspreis').textContent = formatCurrency(bodenrichtwertDaten.durchschnittspreisQm) + '/m²';
        document.getElementById('kaufpreis-bewertung').textContent = bodenrichtwertDaten.kaufpreisBewertung;
        document.getElementById('preistrend').textContent = `+${bodenrichtwertDaten.preistrend}% p.a.`;
        
        // Bewertungstext anzeigen
        document.getElementById('bodenrichtwert-bewertung').innerHTML = generiereBodenrichtwertBewertung(bodenrichtwertDaten);
        
        // Zu den Ergebnissen scrollen
        document.getElementById('bodenrichtwert-result').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Fehler bei der Bodenrichtwert-Abfrage:', error);
        alert('Fehler bei der Abfrage. Bitte versuchen Sie es erneut.');
    } finally {
        checkButton.textContent = 'Prüfen';
        checkButton.disabled = false;
    }
}

// Finanzierungskonditionen prüfen
async function checkFinanzierungskonditionen() {
    const checkButton = document.getElementById('check-finanzierung');
    checkButton.textContent = 'Prüfe...';
    checkButton.disabled = true;
    
    try {
        // Simulierte API-Anfrage
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Daten für die Analyse sammeln
        const finanzierungsDaten = sammleFinanzierungsdaten();
        
        // Simulierte Marktkonditionen generieren
        const marktkonditionen = generiereSimulierteMarktkonditionen(finanzierungsDaten);
        
        // Daten anzeigen
        document.getElementById('finanzierung-result').classList.remove('hidden');
        document.getElementById('durchschnitt-zins').textContent = marktkonditionen.durchschnittZins + '%';
        document.getElementById('empfohlene-tilgung').textContent = marktkonditionen.empfohleneTilgung + '%';
        document.getElementById('belastbarkeit').textContent = marktkonditionen.belastbarkeitsquote + '%';
        
        // Vergleichstexte anzeigen
        document.getElementById('zins-vergleich').textContent = marktkonditionen.zinsVergleich;
        document.getElementById('tilgung-vergleich').textContent = marktkonditionen.tilgungVergleich;
        document.getElementById('belastbarkeit-hinweis').textContent = marktkonditionen.belastbarkeitHinweis;
        
        // Bewertungstext anzeigen
        document.getElementById('finanzierung-bewertung').innerHTML = generiereFinanzierungsbewertung(marktkonditionen, finanzierungsDaten);
        
        // Farbliche Markierung
        const zinsElement = document.getElementById('durchschnitt-zins');
        const tilgungElement = document.getElementById('empfohlene-tilgung');
        const belastbarkeitElement = document.getElementById('belastbarkeit');
        
        zinsElement.className = marktkonditionen.zinsClass;
        tilgungElement.className = marktkonditionen.tilgungClass;
        belastbarkeitElement.className = marktkonditionen.belastbarkeitClass;
        
        // Zu den Ergebnissen scrollen
        document.getElementById('finanzierung-result').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Fehler bei der Finanzierungskonditionen-Prüfung:', error);
        alert('Fehler bei der Prüfung. Bitte versuchen Sie es erneut.');
    } finally {
        checkButton.textContent = 'Finanzierungskonditionen prüfen';
        checkButton.disabled = false;
    }
}

// Finanzierungsdaten für die Analyse sammeln
function sammleFinanzierungsdaten() {
    // Objektdaten
    const plz = document.getElementById('plz')?.value || '';
    const ort = document.getElementById('ort')?.value || '';
    const objekttyp = document.getElementById('objekttyp')?.value || '';
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value || '0');
    const baujahr = parseFloat(document.getElementById('baujahr')?.value || '0');
    
    // Kostendaten
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value || '0');
    const kaufpreisProQm = wohnflaeche > 0 ? kaufpreis / wohnflaeche : 0;
    
    // Finanzierungsdaten
    const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value || '0');
    const eigenkapitalQuote = eigenkapital > 0 && kaufpreis > 0 ? (eigenkapital / kaufpreis) * 100 : 0;
    
    // Darlehensdaten
    const darlehenContainer = document.getElementById('darlehen-container');
    const darlehenBlocks = darlehenContainer?.querySelectorAll('.darlehen-block') || [];
    
    const darlehen = [];
    darlehenBlocks.forEach((block, index) => {
        const betrag = parseFloat(block.querySelector('.darlehen-betrag')?.value || '0');
        const zins = parseFloat(block.querySelector('.darlehen-zins')?.value || '0');
        const tilgung = parseFloat(block.querySelector('.darlehen-tilgung')?.value || '0');
        const zinsbindung = parseFloat(block.querySelector('.darlehen-zinsbindung')?.value || '0');
        
        const rate = parseFloat(block.querySelector('.darlehen-rate')?.textContent.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        
        darlehen.push({
            nr: index + 1,
            betrag,
            zins,
            tilgung,
            zinsbindung,
            rate
        });
    });
    
    // Gesamtrate
    const gesamtRate = parseFloat(document.getElementById('gesamt-rate')?.textContent.replace(/[^\d,]/g, '').replace(',', '.') || '0');
    
    // Beleihungsauslauf
    const beleihungsauslauf = parseFloat(document.getElementById('beleihungsauslauf')?.textContent.replace(/[^0-9.,]/g, '') || '0');
    
    return {
        plz,
        ort,
        objekttyp,
        wohnflaeche,
        baujahr,
        kaufpreis,
        kaufpreisProQm,
        eigenkapital,
        eigenkapitalQuote,
        darlehen,
        gesamtRate,
        beleihungsauslauf
    };
}
