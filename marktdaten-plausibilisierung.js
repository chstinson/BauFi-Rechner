// marktdaten-plausibilisierung.js
// Erweitert den BauFi-Rechner um Funktionen zur Plausibilisierung mit echten Marktdaten
// Produktionsversion - erfordert gültigen API-Schlüssel

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
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
    document.getElementById('bodenrichtwert-plausibilisierung').addEventListener('click', () => {
        openPlausibilisierungsTool('bodenrichtwert-container');
    });
    
    document.getElementById('finanzierung-plausibilisierung').addEventListener('click', () => {
        openPlausibilisierungsTool('finanzierung-container');
    });
    
    // Bodenrichtwert-Plausibilisierung
    document.getElementById('check-bodenrichtwert').addEventListener('click', checkBodenrichtwert);
    
    // Finanzierungskonditionen-Plausibilisierung
    document.getElementById('check-finanzierung').addEventListener('click', checkFinanzierungskonditionen);
}

// Plausibilisierungstool öffnen
function openPlausibilisierungsTool(containerId) {
    // Prüfen, ob ein API-Schlüssel vorhanden ist
    if (!checkApiKeyAvailability()) {
        return; // Funktion wird abgebrochen, wenn kein API-Schlüssel verfügbar ist
    }
    
    // Container anzeigen
    const plausibilisierungContainer = document.getElementById('plausibilisierung-container');
    plausibilisierungContainer.classList.remove('hidden');
    
    // Alle Tool-Container ausblenden
    document.getElementById('bodenrichtwert-container').classList.add('hidden');
    document.getElementById('finanzierung-container').classList.add('hidden');
    
    // Gewählten Container anzeigen
    document.getElementById(containerId).classList.remove('hidden');
}

// Bodenrichtwert prüfen
async function checkBodenrichtwert() {
    // API-Schlüssel prüfen
    const apiKey = checkApiKeyAvailability();
    if (!apiKey) return;
    
    const plz = document.getElementById('bodenrichtwert-plz').value.trim();
    if (!plz) {
        alert('Bitte geben Sie eine Postleitzahl ein.');
        return;
    }
    
    const checkButton = document.getElementById('check-bodenrichtwert');
    checkButton.textContent = 'Prüfe...';
    checkButton.disabled = true;
    
    try {
        // Echte API-Anfrage
        const bodenrichtwertDaten = await fetchBodenrichtwertDaten(plz, apiKey);
        
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
        handleApiError(error);
    } finally {
        checkButton.textContent = 'Prüfen';
        checkButton.disabled = false;
    }
}

// Finanzierungskonditionen prüfen
async function checkFinanzierungskonditionen() {
    // API-Schlüssel prüfen
    const apiKey = checkApiKeyAvailability();
    if (!apiKey) return;
    
    const checkButton = document.getElementById('check-finanzierung');
    checkButton.textContent = 'Prüfe...';
    checkButton.disabled = true;
    
    try {
        // Daten für die Analyse sammeln
        const finanzierungsDaten = sammleFinanzierungsdaten();
        
        // Echte API-Anfrage für Marktkonditionen
        const marktkonditionen = await fetchMarktkonditionen(finanzierungsDaten, apiKey);
        
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
        handleApiError(error);
    } finally {
        checkButton.textContent = 'Finanzierungskonditionen prüfen';
        checkButton.disabled = false;
    }
}

// API-Schlüssel-Verfügbarkeit prüfen
function checkApiKeyAvailability() {
    // Prüfen, ob ein globaler API-Schlüssel vorhanden ist
    const apiKey = window.globalApiKey;
    
    if (!apiKey) {
        alert('Bitte validieren Sie zuerst einen API-Schlüssel im Bereich "KI-gestützte Plausibilisierung & Marktdaten".');
        
        // Auto-Scroll zum API-Bereich
        const apiContainer = document.getElementById('api-global-container');
        if (apiContainer) {
            apiContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        return null;
    }
    
    return apiKey;
}

// API-Fehlerbehandlung
function handleApiError(error) {
    // Fehlertyp analysieren
    if (error.status === 401 || error.message.includes('unauthorized') || error.message.includes('invalid key')) {
        // Ungültiger API-Schlüssel
        alert('Der API-Schlüssel ist ungültig oder abgelaufen. Bitte geben Sie einen neuen Schlüssel ein.');
        
        // API-Schlüssel zurücksetzen
        window.globalApiKey = null;
        
        // Zum API-Bereich scrollen
        const apiContainer = document.getElementById('api-global-container');
        if (apiContainer) {
            apiContainer.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (error.status === 429 || error.message.includes('rate limit')) {
        // Rate Limit erreicht
        alert('Sie haben das Anfragelimit für Ihren API-Schlüssel erreicht. Bitte versuchen Sie es später erneut.');
    } else {
        // Allgemeiner Fehler
        alert('Fehler bei der API-Anfrage: ' + (error.message || 'Unbekannter Fehler'));
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
    
    let darlehen = [];
    
    // Wenn neue Multi-Darlehen-Struktur vorhanden ist
    if (darlehenBlocks.length > 0) {
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
    } else {
        // Fallback auf alte Struktur, wenn Multi-Darlehen nicht vorhanden
        const darlehensbetrag = parseFloat(document.getElementById('darlehensbetrag')?.value || '0');
        const zinssatz = parseFloat(document.getElementById('zinssatz')?.value || '0');
        const tilgungssatz = parseFloat(document.getElementById('tilgungssatz')?.value || '0');
        
        // Monatliche Rate aus dem Ergebnisbereich extrahieren
        const monatlicheRateText = document.getElementById('monatlicheRate')?.textContent || '0 €';
        const monatlicheRate = parseFloat(monatlicheRateText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        
        darlehen.push({
            nr: 1,
            betrag: darlehensbetrag,
            zins: zinssatz,
            tilgung: tilgungssatz,
            zinsbindung: 10, // Annahme: 10 Jahre Zinsbindung
            rate: monatlicheRate
        });
    }
    
    // Gesamtrate
    let gesamtRate = 0;
    if (darlehen.length > 0) {
        gesamtRate = darlehen.reduce((sum, d) => sum + d.rate, 0);
    } else {
        const monatlicheRateText = document.getElementById('monatlicheRate')?.textContent || '0 €';
        gesamtRate = parseFloat(monatlicheRateText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }
    
    // Beleihungsauslauf
    let beleihungsauslauf = 0;
    const darlehensSumme = darlehen.reduce((sum, d) => sum + d.betrag, 0);
    
    if (kaufpreis > 0) {
        beleihungsauslauf = (darlehensSumme / kaufpreis) * 100;
    } else {
        // Wenn kein Kaufpreis angegeben ist, nehmen wir an, dass der Darlehensbetrag etwa 80% des Kaufpreises entspricht
        beleihungsauslauf = 80;
    }
    
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

// Echte API-Aufrufe für Bodenrichtwerte
async function fetchBodenrichtwertDaten(plz, apiKey) {
    try {
        // API-Endpunkt für Bodenrichtwerte
        const endpoint = 'https://api.example.com/bodenrichtwerte';
        
        const response = await fetch(`${endpoint}?plz=${plz}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP error! Status: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Bodenrichtwerte:', error);
        throw error;
    }
}

// Echte API-Aufrufe für Marktkonditionen
async function fetchMarktkonditionen(finanzierungsDaten, apiKey) {
    try {
        // API-Endpunkt für Marktkonditionen
        const endpoint = 'https://api.example.com/finanzierungskonditionen';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                beleihungsauslauf: finanzierungsDaten.beleihungsauslauf,
                objekttyp: finanzierungsDaten.objekttyp,
                plz: finanzierungsDaten.plz,
                eigenkapitalQuote: finanzierungsDaten.eigenkapitalQuote
            })
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP error! Status: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fehler beim Abrufen der Marktkonditionen:', error);
        throw error;
    }
}

// Bewertungstext für Bodenrichtwerte generieren
function generiereBodenrichtwertBewertung(daten) {
    // Kaufpreis aus dem Formular
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value || '0');
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value || '0');
    const preisProQm = wohnflaeche > 0 ? kaufpreis / wohnflaeche : 0;
    
    let bewertungsClass = '';
    let bewertungsText = '';
    
    if (preisProQm < daten.preisspanneMin) {
        bewertungsClass = 'bg-green-50 border-green-500 text-green-800';
        bewertungsText = `
            <h4 class="font-medium mb-2 text-green-800">Günstiger als der Marktdurchschnitt</h4>
            <p>Der Kaufpreis von ${formatCurrency(preisProQm)}/m² liegt unter dem durchschnittlichen Preisniveau für vergleichbare Objekte in der Region (${formatCurrency(daten.durchschnittspreisQm)}/m²).</p>
            <p class="mt-2">Mögliche Gründe könnten sein:</p>
            <ul class="list-disc pl-5 mt-1">
                <li>Besonders günstiges Angebot oder Verhandlungserfolg</li>
                <li>Renovierungs- oder Modernisierungsbedarf</li>
                <li>Ungünstige Lage innerhalb des Stadtteils</li>
                <li>Besondere Objekteigenschaften (z.B. ungünstiger Grundriss)</li>
            </ul>
            <p class="mt-2">Prüfen Sie genau, ob versteckte Mängel oder Nachteile die Ursache für den günstigen Preis sein könnten.</p>
        `;
    } else if (preisProQm > daten.preisspanneMax) {
        bewertungsClass = 'bg-red-50 border-red-500 text-red-800';
        bewertungsText = `
            <h4 class="font-medium mb-2 text-red-800">Teurer als der Marktdurchschnitt</h4>
            <p>Der Kaufpreis von ${formatCurrency(preisProQm)}/m² liegt über dem durchschnittlichen Preisniveau für vergleichbare Objekte in der Region (${formatCurrency(daten.durchschnittspreisQm)}/m²).</p>
            <p class="mt-2">Mögliche Gründe könnten sein:</p>
            <ul class="list-disc pl-5 mt-1">
                <li>Überdurchschnittliche Ausstattung oder Qualität</li>
                <li>Besonders gefragte Mikrolage</li>
                <li>Kürzlich durchgeführte Modernisierungen</li>
                <li>Energetisch optimiertes Gebäude</li>
                <li>Besondere Ausstattungsmerkmale (z.B. Smart Home, hochwertige Küche)</li>
            </ul>
            <p class="mt-2">Prüfen Sie, ob die Vorteile des Objekts den höheren Preis rechtfertigen.</p>
        `;
    } else {
        bewertungsClass = 'bg-blue-50 border-blue-500 text-blue-800';
        bewertungsText = `
            <h4 class="font-medium mb-2 text-blue-800">Marktgerechter Preis</h4>
            <p>Der Kaufpreis von ${formatCurrency(preisProQm)}/m² entspricht dem durchschnittlichen Preisniveau für vergleichbare Objekte in der Region (${formatCurrency(daten.durchschnittspreisQm)}/m²).</p>
            <p class="mt-2">Der Preis bewegt sich innerhalb der für diese Region typischen Preisspanne von ${formatCurrency(daten.preisspanneMin)}/m² bis ${formatCurrency(daten.preisspanneMax)}/m².</p>
            <p class="mt-2">Die Immobilienpreise in dieser Region haben sich in den letzten Jahren im Durchschnitt um ${daten.preistrend}% pro Jahr verändert.</p>
        `;
    }
    
    // Zusätzliche Prognose für die Zukunft
    const extraInfo = `
        <div class="mt-4 ${bewertungsClass} p-3 rounded">
            <h4 class="font-medium mb-1">Prognose für Ihre Region</h4>
            <p>Bei einem fortgesetzten Preistrend von ${daten.preistrend}% pro Jahr könnte der Durchschnittspreis in 5 Jahren bei etwa ${formatCurrency(daten.durchschnittspreisQm * Math.pow(1 + daten.preistrend/100, 5))}/m² liegen.</p>
        </div>
    `;
    
    return `<div class="${bewertungsClass} p-4 rounded">${bewertungsText}</div>${extraInfo}`;
}

// Bewertungstext für Finanzierungskonditionen generieren
function generiereFinanzierungsbewertung(marktkonditionen, finanzierungsDaten) {
    // Bewertungsklasse bestimmen
    let bewertungsClass = 'bg-blue-50 border-blue-500 text-blue-800';
    let gesamtBewertung = 'Gute Finanzierungsstruktur';
    let risikoLevel = 'niedrig';
    
    // Risikopunkte berechnen
    let risikoPunkte = 0;
    
    // Zins bewerten
    if (marktkonditionen.durchschnittZinsDerDarlehen > marktkonditionen.durchschnittZins + 0.8) {
        risikoPunkte += 2; // Deutlich zu hohe Zinsen
    } else if (marktkonditionen.durchschnittZinsDerDarlehen > marktkonditionen.durchschnittZins + 0.3) {
        risikoPunkte += 1; // Etwas zu hohe Zinsen
    }
    
    // Tilgung bewerten
    if (marktkonditionen.durchschnittTilgungDerDarlehen < 1.5) {
        risikoPunkte += 3; // Viel zu niedrige Tilgung
    } else if (marktkonditionen.durchschnittTilgungDerDarlehen < 2) {
        risikoPunkte += 2; // Zu niedrige Tilgung
    } else if (marktkonditionen.durchschnittTilgungDerDarlehen < marktkonditionen.empfohleneTilgung - 0.5) {
        risikoPunkte += 1; // Etwas zu niedrige Tilgung
    }
    
    // Belastbarkeit bewerten
    if (marktkonditionen.belastbarkeitsquote > 40) {
        risikoPunkte += 3; // Kritische Belastung
    } else if (marktkonditionen.belastbarkeitsquote > 35) {
        risikoPunkte += 2; // Hohe Belastung
    } else if (marktkonditionen.belastbarkeitsquote > 30) {
        risikoPunkte += 1; // Grenzwertige Belastung
    }
    
    // Beleihungsauslauf bewerten
    if (finanzierungsDaten.beleihungsauslauf > 90) {
        risikoPunkte += 3; // Sehr hoher Beleihungsauslauf
    } else if (finanzierungsDaten.beleihungsauslauf > 80) {
        risikoPunkte += 2; // Hoher Beleihungsauslauf
    } else if (finanzierungsDaten.beleihungsauslauf > 70) {
        risikoPunkte += 1; // Erhöhter Beleihungsauslauf
    }
    
    // Gesamtbewertung basierend auf Risikopunkten
    if (risikoPunkte >= 6) {
        bewertungsClass = 'bg-red-50 border-red-500 text-red-800';
        gesamtBewertung = 'Risikoreiche Finanzierungsstruktur';
        risikoLevel = 'hoch';
    } else if (risikoPunkte >= 3) {
        bewertungsClass = 'bg-yellow-50 border-yellow-500 text-yellow-800';
        gesamtBewertung = 'Finanzierungsstruktur mit Optimierungspotenzial';
        risikoLevel = 'mittel';
    }
    
    // Bewertungstext generieren
    const bewertungsText = `
        <h4 class="font-medium mb-2">${gesamtBewertung}</h4>
        <p>Ihre Finanzierungsstruktur weist ein <strong>${risikoLevel}es Risiko</strong> auf. Die folgenden Aspekte wurden bewertet:</p>
        
        <ul class="list-disc pl-5 mt-2">
            <li>
                <strong>Zinssatz:</strong> 
                ${marktkonditionen.durchschnittZinsDerDarlehen.toFixed(1)}% 
                (${marktkonditionen.zinsVergleich})
            </li>
            <li>
                <strong>Tilgungssatz:</strong> 
                ${marktkonditionen.durchschnittTilgungDerDarlehen.toFixed(1)}% 
                (${marktkonditionen.tilgungVergleich} bei empfohlenen ${marktkonditionen.empfohleneTilgung}%)
            </li>
            <li>
                <strong>Belastbarkeitsquote:</strong> 
                ${marktkonditionen.belastbarkeitsquote}% 
                (${marktkonditionen.belastbarkeitHinweis})
            </li>
            <li>
                <strong>Beleihungsauslauf:</strong> 
                ${finanzierungsDaten.beleihungsauslauf.toFixed(1)}% 
                (${finanzierungsDaten.beleihungsauslauf > 80 ? 'Erhöht' : 'Akzeptabel'})
            </li>
        </ul>
    `;
    
    // Handlungsempfehlungen basierend auf Risikopunkten
    let empfehlungen = '';
    
    if (risikoPunkte > 0) {
        empfehlungen = '<h4 class="font-medium mt-3 mb-2">Handlungsempfehlungen:</h4><ul class="list-disc pl-5">';
        
        if (marktkonditionen.durchschnittZinsDerDarlehen > marktkonditionen.durchschnittZins + 0.3) {
            empfehlungen += `
                <li>Holen Sie weitere Finanzierungsangebote ein, um bessere Zinskonditionen zu erhalten.</li>
            `;
        }
        
        if (marktkonditionen.durchschnittTilgungDerDarlehen < marktkonditionen.empfohleneTilgung - 0.5) {
            empfehlungen += `
                <li>Erhöhen Sie den Tilgungssatz auf mindestens ${Math.max(2, marktkonditionen.empfohleneTilgung - 0.5).toFixed(1)}% um die Gesamtlaufzeit und Zinsbelastung zu reduzieren.</li>
            `;
        }
        
        if (marktkonditionen.belastbarkeitsquote > 35) {
            empfehlungen += `
                <li>Die monatliche Belastung ist im Verhältnis zum angenommenen Einkommen sehr hoch. Erhöhen Sie das Eigenkapital oder reduzieren Sie die Darlehenssumme.</li>
            `;
        }
        
        if (finanzierungsDaten.beleihungsauslauf > 80) {
            empfehlungen += `
                <li>Der Beleihungsauslauf liegt über 80%, was zu höheren Zinsen führt. Versuchen Sie, mehr Eigenkapital einzubringen.</li>
            `;
        }
        
        if (finanzierungsDaten.darlehen.some(d => d.zinsbindung < 10)) {
            empfehlungen += `
                <li>Prüfen Sie, ob eine längere Zinsbindung (mind. 10 Jahre) sinnvoll ist, um sich gegen steigende Zinsen abzusichern.</li>
            `;
        }
        
        empfehlungen += '</ul>';
    }
    
    return `<div class="${bewertungsClass} p-4 rounded">${bewertungsText}${empfehlungen}</div>`;
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

// Fallback-Funktionen für den Fall, dass die API nicht verfügbar ist
// Diese werden nur verwendet, wenn die API-Anfrage fehlschlägt und nach Zustimmung des Nutzers
async function fallbackBodenrichtwertDaten(plz) {
    alert('Die Verbindung zur API konnte nicht hergestellt werden. Es werden Beispieldaten verwendet, die nicht der aktuellen Marktlage entsprechen.');
    
    // Einfache regionale Differenzierung nach PLZ-Bereichen
    const plzPrefix = plz.substring(0, 1);
    let basiswert, plzFaktor;
    
    switch (plzPrefix) {
        case '0': basiswert = 250; plzFaktor = 1.0; break; // Dresden, Leipzig
        case '1': basiswert = 500; plzFaktor = 1.4; break; // Berlin
        case '2': basiswert = 450; plzFaktor = 1.2; break; // Hamburg
        case '3': basiswert = 280; plzFaktor = 0.9; break; // Hannover
        case '4': basiswert = 300; plzFaktor = 0.95; break; // Ruhrgebiet
        case '5': basiswert = 350; plzFaktor = 1.1; break; // Köln, Bonn
        case '6': basiswert = 380; plzFaktor = 1.2; break; // Frankfurt
        case '7': basiswert = 400; plzFaktor = 1.15; break; // Stuttgart
        case '8': basiswert = 600; plzFaktor = 1.5; break; // München
        case '9': basiswert = 320; plzFaktor = 1.0; break; // Nürnberg
        default: basiswert = 300; plzFaktor = 1.0;
    }
    
    // Kaufpreis aus dem Formular
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value || '0');
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value || '0');
    const preisProQm = wohnflaeche > 0 ? kaufpreis / wohnflaeche : 0;
    
    // Beispieldaten mit regionaler Differenzierung
    const durchschnittspreisQm = Math.round(basiswert * plzFaktor * 10);
    
    return {
        bodenrichtwert: Math.round(basiswert),
        durchschnittspreisQm: durchschnittspreisQm,
        preisspanneMin: Math.round(durchschnittspreisQm * 0.85),
        preisspanneMax: Math.round(durchschnittspreisQm * 1.15),
        preistrend: (2 + Math.random() * 3).toFixed(1),
        kaufpreisBewertung: preisProQm < durchschnittspreisQm * 0.9 ? 'Günstig' : 
                            preisProQm > durchschnittspreisQm * 1.1 ? 'Teuer' : 'Marktgerecht'
    };
}

// Fallback für Marktkonditionen
async function fallbackMarktkonditionen(finanzierungsDaten) {
    alert('Die Verbindung zur API konnte nicht hergestellt werden. Es werden Beispieldaten verwendet, die nicht der aktuellen Marktlage entsprechen.');
    
    // Basis-Zinssatz mit Anpassung nach Beleihungsauslauf
    let durchschnittZins = 3.3;
    if (finanzierungsDaten.beleihungsauslauf > 80) {
        durchschnittZins += 0.5;
    } else if (finanzierungsDaten.beleihungsauslauf < 60) {
        durchschnittZins -= 0.2;
    }
    
    const durchschnittZinsDerDarlehen = finanzierungsDaten.darlehen.length > 0 
        ? finanzierungsDaten.darlehen.reduce((sum, d) => sum + d.zins, 0) / finanzierungsDaten.darlehen.length
        : 0;
    
    const durchschnittTilgungDerDarlehen = finanzierungsDaten.darlehen.length > 0 
        ? finanzierungsDaten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / finanzierungsDaten.darlehen.length
        : 0;
    
    // Belastbarkeitsquote (Rate im Verhältnis zum angenommenen Einkommen)
    const angenommenesMonatseinkommenNetto = finanzierungsDaten.gesamtRate * 3;
    const belastbarkeitsquote = (finanzierungsDaten.gesamtRate / angenommenesMonatseinkommenNetto) * 100;
    
    return {
        durchschnittZins: parseFloat(durchschnittZins.toFixed(1)),
        empfohleneTilgung: 3.0,
        belastbarkeitsquote: parseFloat(belastbarkeitsquote.toFixed(1)),
        zinsVergleich: durchschnittZinsDerDarlehen > durchschnittZins + 0.5 ? `${(durchschnittZinsDerDarlehen - durchschnittZins).toFixed(1)}% über Durchschnitt` :
                      durchschnittZinsDerDarlehen < durchschnittZins - 0.5 ? `${(durchschnittZins - durchschnittZinsDerDarlehen).toFixed(1)}% unter Durchschnitt` :
                      'Im Marktdurchschnitt',
        tilgungVergleich: durchschnittTilgungDerDarlehen < 2.0 ? 'Zu niedrig' :
                         durchschnittTilgungDerDarlehen < 3.0 ? 'Etwas niedrig' :
                         durchschnittTilgungDerDarlehen > 4.0 ? 'Sehr gut' : 'Angemessen',
        belastbarkeitHinweis: belastbarkeitsquote > 40 ? 'Kritisch (>40%)' :
                             belastbarkeitsquote > 35 ? 'Grenzwertig (>35%)' :
                             belastbarkeitsquote > 30 ? 'Akzeptabel (>30%)' : 'Gut (<30%)',
        zinsClass: durchschnittZinsDerDarlehen > durchschnittZins + 0.5 ? 'text-xl font-bold text-red-600' :
                  durchschnittZinsDerDarlehen < durchschnittZins - 0.5 ? 'text-xl font-bold text-green-600' :
                  'text-xl font-bold',
        tilgungClass: durchschnittTilgungDerDarlehen < 2.0 ? 'text-xl font-bold text-red-600' :
                     durchschnittTilgungDerDarlehen > 3.0 ? 'text-xl font-bold text-green-600' :
                     'text-xl font-bold',
        belastbarkeitClass: belastbarkeitsquote > 40 ? 'text-xl font-bold text-red-600' :
                           belastbarkeitsquote < 30 ? 'text-xl font-bold text-green-600' :
                           'text-xl font-bold text-yellow-600',
        durchschnittZinsDerDarlehen,
        durchschnittTilgungDerDarlehen
    };
}
