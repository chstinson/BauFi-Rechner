// api-integration.js - neue zusammengeführte Datei
document.addEventListener('DOMContentLoaded', function() {
    // Prüfen, ob bereits ein API-Container existiert, um Duplizierung zu vermeiden
    if (document.getElementById('api-global-container')) return;
    
    // Container für globale API-Integration erstellen
    const mainContainer = document.querySelector('.container.mx-auto.p-4');
    if (!mainContainer) return;
    
    // Container am Ende der Seite einfügen, bevor der Footer kommt
    const footer = document.querySelector('.mt-6.text-sm.text-gray-500.text-center');
    
    const apiContainer = document.createElement('div');
    apiContainer.id = 'api-global-container';
    apiContainer.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
    apiContainer.innerHTML = createApiIntegrationHTML();
    
    if (footer) {
        mainContainer.insertBefore(apiContainer, footer);
    } else {
        mainContainer.appendChild(apiContainer);
    }
    
    // Event Listener für die API-Integration
    setupApiEventListeners();
    
    // Alte API-Container entfernen, falls vorhanden
    const duplicateContainers = document.querySelectorAll('.ki-plausibilisierung');
    duplicateContainers.forEach(container => {
        if (container.id !== 'api-global-container') {
            container.remove();
        }
    });
});

// HTML für die globale API-Integration
function createApiIntegrationHTML() {
    return `
    <h2 class="text-xl font-semibold mb-4">KI-gestützte Plausibilisierung & Marktdaten</h2>
    
    <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p class="text-sm text-blue-800">
            Geben Sie Ihren API-Schlüssel ein, um Zugriff auf fortschrittliche Plausibilitätsprüfungen und Marktdaten zu erhalten. Ihr Schlüssel wird nur für diese Sitzung verwendet und nicht gespeichert.
        </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="border rounded p-4 cursor-pointer" id="openai-provider">
            <div class="flex items-center mb-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/180px-ChatGPT_logo.svg.png" alt="OpenAI Logo" class="h-6 w-6 mr-2">
                <span class="font-medium">OpenAI (GPT-4)</span>
            </div>
            <p class="text-sm text-gray-600">Nutzen Sie GPT-4 für detaillierte Analysen Ihrer Baufinanzierung und Marktdaten.</p>
        </div>
        
        <div class="border rounded p-4 cursor-pointer" id="deepseek-provider">
            <div class="flex items-center mb-2">
                <img src="https://www.deepseek.com/favicon.ico" alt="DeepSeek Logo" class="h-6 w-6 mr-2">
                <span class="font-medium">DeepSeek</span>
            </div>
            <p class="text-sm text-gray-600">DeepSeek's KI bewertet Ihre Immobilienfinanzierung und vergleicht sie mit aktuellen Marktdaten.</p>
        </div>
    </div>
    
    <div id="api-key-section" class="mb-4">
        <label class="block text-sm font-medium mb-1" id="api-provider-label">API-Schlüssel</label>
        <div class="flex items-center">
            <input type="password" id="global-api-key" class="w-full p-2 border rounded" placeholder="Ihren API-Schlüssel eingeben">
            <button id="validate-global-api" class="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Validieren</button>
        </div>
        <p class="text-xs text-gray-500 mt-1">Ihr API-Schlüssel wird nur für diese Anfragen verwendet und nicht gespeichert.</p>
    </div>
    
    <div id="api-actions" class="grid grid-cols-1 md:grid-cols-3 gap-4 hidden">
        <button id="analyze-financial" class="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Finanzierungsanalyse
        </button>
        <button id="analyze-market" class="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Marktdaten abrufen
        </button>
        <button id="analyze-complete" class="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Vollständige Plausibilisierung
        </button>
    </div>
    
    <div id="api-results" class="mt-6 hidden">
        <h3 class="text-lg font-semibold mb-2">Analyseergebnisse</h3>
        <div id="api-results-content" class="p-4 bg-gray-50 border rounded"></div>
    </div>
    `;
}

// Event Listener für die API-Integration
function setupApiEventListeners() {
    let selectedProvider = null;
    
    // Provider-Auswahl
    document.getElementById('openai-provider').addEventListener('click', () => {
        selectProvider('openai');
    });
    
    document.getElementById('deepseek-provider').addEventListener('click', () => {
        selectProvider('deepseek');
    });
    
    // API-Schlüssel validieren
    document.getElementById('validate-global-api').addEventListener('click', validateGlobalApiKey);
    
    // Analysebuttons
    document.getElementById('analyze-financial').addEventListener('click', () => runAnalysis('financial'));
    document.getElementById('analyze-market').addEventListener('click', () => runAnalysis('market'));
    document.getElementById('analyze-complete').addEventListener('click', () => runAnalysis('complete'));
    
    // Provider auswählen
    function selectProvider(providerId) {
        selectedProvider = providerId;
        
        // UI aktualisieren
        document.querySelectorAll('#openai-provider, #deepseek-provider').forEach(el => {
            el.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        document.getElementById(`${providerId}-provider`).classList.add('border-blue-500', 'bg-blue-50');
        document.getElementById('api-provider-label').textContent = 
            providerId === 'openai' ? 'OpenAI API-Schlüssel' : 'DeepSeek API-Schlüssel';
    }
    
    // API-Schlüssel validieren
    async function validateGlobalApiKey() {
        if (!selectedProvider) {
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
            // Simulierte API-Validierung (in einer realen Anwendung würde hier eine echte Anfrage gesendet)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // API-Schlüssel als gültig markieren (für Demo-Zwecke)
            const isValid = true;
            
            if (isValid) {
                document.getElementById('global-api-key').classList.add('border-green-500');
                document.getElementById('api-actions').classList.remove('hidden');
                
                // Globalen API-Schlüssel für andere Komponenten verfügbar machen
                window.globalApiKey = apiKey;
                window.globalApiProvider = selectedProvider;
                
                // Event auslösen, damit andere Komponenten informiert werden
                const event = new CustomEvent('apiKeyValidated', { 
                    detail: { apiKey, provider: selectedProvider }
                });
                document.dispatchEvent(event);
            } else {
                document.getElementById('global-api-key').classList.add('border-red-500');
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
    
    // Analyse durchführen
    async function runAnalysis(type) {
        const apiKey = window.globalApiKey;
        const provider = window.globalApiProvider;
        
        if (!apiKey || !provider) {
            alert('Bitte validieren Sie zuerst einen API-Schlüssel.');
            return;
        }
        
        const analyzeButton = document.getElementById(`analyze-${type}`);
        const originalText = analyzeButton.textContent;
        analyzeButton.textContent = 'Analysiere...';
        analyzeButton.disabled = true;
        
        try {
            // Daten sammeln
            const finanzierungsDaten = sammleFinanzierungsdaten();
            
            // Je nach Analysetyp unterschiedlichen Endpunkt ansprechen
            let result = '';
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            switch(type) {
                case 'financial':
                    result = await simulateFinancialAnalysis(finanzierungsDaten, provider);
                    break;
                case 'market':
                    result = await simulateMarketAnalysis(finanzierungsDaten, provider);
                    break;
                case 'complete':
                    result = await simulateCompleteAnalysis(finanzierungsDaten, provider);
                    break;
            }
            
            // Ergebnis anzeigen
            document.getElementById('api-results').classList.remove('hidden');
            document.getElementById('api-results-content').innerHTML = result;
            
            // Zu den Ergebnissen scrollen
            document.getElementById('api-results').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Fehler bei der Analyse:', error);
            alert('Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
        } finally {
            analyzeButton.textContent = originalText;
            analyzeButton.disabled = false;
        }
    }
}

// Hilfsfunktionen für die Simulation verschiedener Analysen
// In einer realen Anwendung würden hier echte API-Aufrufe stehen
async function simulateFinancialAnalysis(daten, provider) {
    // Hier würde eine echte API-Anfrage an OpenAI oder DeepSeek stehen
    
    const preisProQm = daten.wohnflaeche > 0 ? daten.kaufpreis / daten.wohnflaeche : 0;
    
    const ergebnis = `
    <div class="p-4 bg-gray-50 border rounded whitespace-pre-line">
    <h3 class="font-semibold mb-2">Finanzierungsanalyse</h3>
    
    <p>Bei einem Kaufpreis von ${formatCurrency(daten.kaufpreis)} für eine Immobilie mit ${daten.wohnflaeche} m² (${formatCurrency(preisProQm)}/m²) und einer Finanzierung mit ${daten.darlehen.length} Darlehen:</p>
    
    <ul class="mt-2 list-disc pl-5">
        <li>Eigenkapitalquote: ${daten.eigenkapitalQuote.toFixed(1)}% - ${daten.eigenkapitalQuote < 20 ? "Erhöhung empfohlen (Ziel: mind. 20%)" : "Solide Eigenkapitalbasis"}</li>
        <li>Durchschnittlicher Zinssatz: ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length).toFixed(2)}% - ${(daten.darlehen.reduce((sum, d) => sum + d.zins, 0) / daten.darlehen.length) > 3.7 ? "Etwas überdurchschnittlich für aktuelle Marktkonditionen" : "Marktüblich"}</li>
        <li>Durchschnittliche Tilgung: ${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length).toFixed(2)}% - ${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2 ? "Zu niedrig, Erhöhung empfohlen" : "Angemessen"}</li>
        <li>Monatliche Gesamtrate: ${formatCurrency(daten.gesamtRate)}</li>
        <li>Beleihungsauslauf (LTV): ${daten.beleihungsauslauf.toFixed(1)}% - ${daten.beleihungsauslauf > 80 ? "Erhöht (kann zu höheren Zinsen führen)" : "Im akzeptablen Bereich"}</li>
    </ul>
    
    <p class="mt-2">Ihre Finanzierungsstruktur ist insgesamt ${daten.eigenkapitalQuote < 15 || daten.beleihungsauslauf > 90 ? "risikobehaftet und sollte optimiert werden" : daten.eigenkapitalQuote > 25 && daten.beleihungsauslauf < 70 ? "solide und nachhaltig aufgestellt" : "grundsätzlich tragfähig, weist aber Optimierungspotenzial auf"}.</p>
    </div>
    `;
    
    return ergebnis;
}

async function simulateMarketAnalysis(daten, provider) {
    // In einer echten Anwendung würde hier eine Marktdaten-API abgefragt werden
    
    // Regionale Faktoren nach PLZ simulieren
    const plzPrefix = daten.plz ? daten.plz.substring(0, 1) : '0';
    
    // Grobe regionale Unterschiede basierend auf der ersten Ziffer der PLZ
    let regionName = "Deutschland";
    let basiswert = 3500;
    let preistrend = 3.2;
    
    switch (plzPrefix) {
        case '0': regionName = "Dresden/Leipzig"; basiswert = 2800; preistrend = 4.5; break;
        case '1': regionName = "Berlin"; basiswert = 4800; preistrend = 3.9; break;
        case '2': regionName = "Hamburg"; basiswert = 4500; preistrend = 3.2; break;
        case '3': regionName = "Hannover"; basiswert = 2800; preistrend = 2.8; break;
        case '4': regionName = "Ruhrgebiet"; basiswert = 2500; preistrend = 2.5; break;
        case '5': regionName = "Köln/Bonn"; basiswert = 3600; preistrend = 3.0; break;
        case '6': regionName = "Frankfurt"; basiswert = 4200; preistrend = 3.3; break;
        case '7': regionName = "Stuttgart"; basiswert = 4000; preistrend = 3.1; break;
        case '8': regionName = "München"; basiswert = 6500; preistrend = 4.2; break;
        case '9': regionName = "Nürnberg"; basiswert = 3200; preistrend = 2.9; break;
    }
    
    const aktuellerDurchschnittspreis = basiswert;
    const preisProQm = daten.wohnflaeche > 0 ? daten.kaufpreis / daten.wohnflaeche : 0;
    
    let preisbewertung = "marktüblich";
    if (preisProQm < aktuellerDurchschnittspreis * 0.85) {
        preisbewertung = "deutlich unter Marktniveau - potenziell günstiger Kauf";
    } else if (preisProQm < aktuellerDurchschnittspreis * 0.95) {
        preisbewertung = "leicht unter Marktniveau";
    } else if (preisProQm > aktuellerDurchschnittspreis * 1.15) {
        preisbewertung = "deutlich über Marktniveau - mögliche Überbewertung prüfen";
    } else if (preisProQm > aktuellerDurchschnittspreis * 1.05) {
        preisbewertung = "leicht über Marktniveau";
    }
    
    const ergebnis = `
    <div class="p-4 bg-gray-50 border rounded whitespace-pre-line">
    <h3 class="font-semibold mb-2">Marktdatenanalyse für ${regionName}</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="p-3 bg-white rounded border">
            <div class="text-sm text-gray-500">Durchschnittspreis in der Region</div>
            <div class="text-xl font-bold">${formatCurrency(aktuellerDurchschnittspreis)}/m²</div>
        </div>
        
        <div class="p-3 bg-white rounded border">
            <div class="text-sm text-gray-500">Ihr Kaufpreis</div>
            <div class="text-xl font-bold">${formatCurrency(preisProQm)}/m²</div>
        </div>
        
        <div class="p-3 bg-white rounded border">
            <div class="text-sm text-gray-500">Preistrend (5 Jahre)</div>
            <div class="text-xl font-bold">+${preistrend.toFixed(1)}% p.a.</div>
        </div>
        
        <div class="p-3 bg-white rounded border">
            <div class="text-sm text-gray-500">Preisbewertung</div>
            <div class="text-xl font-bold">${preisbewertung}</div>
        </div>
    </div>
    
    <p>Bei der aktuellen Preisentwicklung von ${preistrend.toFixed(1)}% pro Jahr könnte der durchschnittliche Quadratmeterpreis in 5 Jahren bei ca. ${formatCurrency(aktuellerDurchschnittspreis * Math.pow(1 + preistrend/100, 5))}/m² liegen.</p>
    
    <p class="mt-2">Basierend auf Ihrer PLZ ${daten.plz} und dem Objekttyp "${daten.objekttyp}" ist Ihr Kaufpreis ${preisbewertung}.</p>
    </div>
    `;
    
    return ergebnis;
}

async function simulateCompleteAnalysis(daten, provider) {
    // In einer echten Anwendung würde hier eine KI-basierte Komplettanalyse durchgeführt
    
    // Beide Einzelanalysen kombinieren
    const financialAnalysis = await simulateFinancialAnalysis(daten, provider);
    const marketAnalysis = await simulateMarketAnalysis(daten, provider);
    
    const ergebnis = `
    <div class="p-4 bg-gray-50 border rounded whitespace-pre-line">
    <h3 class="font-semibold mb-4">Vollständige Plausibilitätsprüfung</h3>
    
    <h4 class="font-medium mt-2 mb-2">Marktdatenanalyse</h4>
    ${marketAnalysis.replace('<div class="p-4 bg-gray-50 border rounded whitespace-pre-line">', '').replace('</div>', '')}
    
    <h4 class="font-medium mt-4 mb-2">Finanzierungsanalyse</h4>
    ${financialAnalysis.replace('<div class="p-4 bg-gray-50 border rounded whitespace-pre-line">', '').replace('</div>', '')}
    
    <h4 class="font-medium mt-4 mb-2">Gesamtbewertung</h4>
    <p>Basierend auf der Analyse der Marktdaten und Ihrer Finanzierungsstruktur ergibt sich folgendes Gesamtbild:</p>
    
    <div class="mt-2 p-3 ${daten.eigenkapitalQuote < 15 || daten.beleihungsauslauf > 90 ? "bg-red-50 border-red-500 text-red-800" : daten.eigenkapitalQuote > 25 && daten.beleihungsauslauf < 70 ? "bg-green-50 border-green-500 text-green-800" : "bg-yellow-50 border-yellow-500 text-yellow-800"} border rounded">
        Die Immobilienfinanzierung ist insgesamt als <strong>${daten.eigenkapitalQuote < 15 || daten.beleihungsauslauf > 90 ? "risikobehaftet" : daten.eigenkapitalQuote > 25 && daten.beleihungsauslauf < 70 ? "solide" : "akzeptabel mit Optimierungspotenzial"}</strong> zu bewerten.
        
        ${daten.eigenkapitalQuote < 20 ? "<p class='mt-1'>Erhöhen Sie nach Möglichkeit Ihr Eigenkapital auf mindestens 20%.</p>" : ""}
        ${(daten.darlehen.reduce((sum, d) => sum + d.tilgung, 0) / daten.darlehen.length) < 2 ? "<p class='mt-1'>Eine höhere anfängliche Tilgung (mind. 2,5%) ist dringend zu empfehlen.</p>" : ""}
        ${daten.beleihungsauslauf > 80 ? "<p class='mt-1'>Der hohe Beleihungsauslauf erhöht Zinskosten und Risiken - versuchen Sie, diesen zu reduzieren.</p>" : ""}
    </div>
    </div>
    `;
    
    return ergebnis;
}

// Finanzierungsdaten aus UI-Elementen sammeln
function sammleFinanzierungsdaten() {
    // Objektdaten
    const plz = document.getElementById('plz')?.value || '';
    const ort = document.getElementById('ort')?.value || '';
    const objekttyp = document.getElementById('objekttyp')?.value || '';
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value || '0');
    
    // Finanzierung
    const darlehensbetrag = parseFloat(document.getElementById('darlehensbetrag')?.value || '0');
    const zinssatz = parseFloat(document.getElementById('zinssatz')?.value || '0');
    const tilgungssatz = parseFloat(document.getElementById('tilgungssatz')?.value || '0');
    
    // Annahmen für Werte, die in der Basis-Version nicht vorhanden sind
    const kaufpreis = darlehensbetrag * 1.2; // Annahme: Darlehensbetrag ist 80% des Kaufpreises
    const eigenkapital = kaufpreis - darlehensbetrag;
    const eigenkapitalQuote = (eigenkapital / kaufpreis) * 100;
    
    // Holen der monatlichen Rate aus dem UI
    const monatlicheRateElement = document.getElementById('monatlicheRate');
    let gesamtRate = 0;
    if (monatlicheRateElement) {
        const rateText = monatlicheRateElement.textContent;
        gesamtRate = parseFloat(rateText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }
    
    // Darlehen als Array bereitstellen
    const darlehen = [{
        nr: 1,
        betrag: darlehensbetrag,
        zins: zinssatz,
        tilgung: tilgungssatz,
        zinsbindung: 10, // Annahme
        rate: gesamtRate
    }];
    
    // Beleihungsauslauf (LTV)
    const beleihungsauslauf = (darlehensbetrag / kaufpreis) * 100;
    
    return {
        plz,
        ort,
        objekttyp,
        wohnflaeche,
        kaufpreis,
        eigenkapital,
        eigenkapitalQuote,
        darlehen,
        gesamtRate,
        beleihungsauslauf
    };
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
