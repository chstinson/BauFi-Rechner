// analysis.js
// Funktionalität für die Analyse und KI-Plausibilisierung des BauFi-Rechners

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
function startAnalysis(analyseTyp) {
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
    
    // KI-Provider und API-Schlüssel aus globalen Variablen
    const provider = window.BauFiRechner.apiProvider;
    const apiKey = window.BauFiRechner.apiKey;
    
    // Simulierte Analyse (mit Verzögerung)
    setTimeout(() => {
        generateAnalysisResult(analyseTyp, analyseDaten, provider);
    }, 1500);
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
    const eigenkapitalQuote = parseFloat(document.getElementById('eigenkapital_quote').textContent) || 0;
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
    const beleihungsauslauf = parseFloat(document.getElementById('beleihungsauslauf').textContent) || 0;
    
    // Für Belastungsanalyse (fiktiv)
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

// Analyse-Ergebnis generieren
function generateAnalysisResult(analyseTyp, analyseDaten, provider) {
    // In einer echten Implementierung würde hier ein API-Aufruf an den KI-Provider erfolgen
    // Für diese Demo simulieren wir verschiedene Analysetypen
    
    let ergebnis = '';
    
    switch(analyseTyp) {
        case 'marktdaten':
            ergebnis = generateMarktdatenAnalyse(analyseDaten);
            break;
        case 'belastung':
            ergebnis = generateBelastungsAnalyse(analyseDaten);
            break;
        case 'optimierung':
            ergebnis = generateOptimierungsAnalyse(analyseDaten, provider);
            break;
        case 'vollstaendig':
            ergebnis = generateVollstaendigeAnalyse(analyseDaten, provider);
            break;
    }
    
    // Ergebnis anzeigen
    document.getElementById('analyse-inhalt').innerHTML = ergebnis;
}

// Marktdatenanalyse generieren
function generateMarktdatenAnalyse(analyseDaten) {
    const plzPrefix = analyseDaten.objektdaten.plz ? analyseDaten.objektdaten.plz.substring(0, 1) : '0';
    
    // Simulierte regionale Immobilienmarktdaten basierend auf PLZ
    let regionName = "Deutschland";
    let durchschnittsPreis = 3500;
    let preistrend = 3.2;
    
    // Grobe regionale Unterschiede basierend auf der ersten Ziffer der PLZ
    switch (plzPrefix) {
        case '0': regionName = "Dresden/Leipzig"; durchschnittsPreis = 2800; preistrend = 4.5; break;
        case '1': regionName = "Berlin"; durchschnittsPreis = 4800; preistrend = 3.9; break;
        case '2': regionName = "Hamburg"; durchschnittsPreis = 4500; preistrend = 3.2; break;
        case '3': regionName = "Hannover"; durchschnittsPreis = 2800; preistrend = 2.8; break;
        case '4': regionName = "Ruhrgebiet"; durchschnittsPreis = 2500; preistrend = 2.5; break;
        case '5': regionName = "Köln/Bonn"; durchschnittsPreis = 3600; preistrend = 3.0; break;
        case '6': regionName = "Frankfurt"; durchschnittsPreis = 4200; preistrend = 3.3; break;
        case '7': regionName = "Stuttgart"; durchschnittsPreis = 4000; preistrend = 3.1; break;
        case '8': regionName = "München"; durchschnittsPreis = 6500; preistrend = 4.2; break;
        case '9': regionName = "Nürnberg"; durchschnittsPreis = 3200; preistrend = 2.9; break;
    }
    
    // Preisbewertung
    const preisProQm = analyseDaten.kostendaten.kaufpreisQm;
    let preisbewertung = "marktüblich";
    let preisClass = "text-blue-600";
    
    if (preisProQm < durchschnittsPreis * 0.85) {
        preisbewertung = "deutlich unter Marktniveau - potenziell günstiger Kauf";
        preisClass = "text-green-600";
    } else if (preisProQm < durchschnittsPreis * 0.95) {
        preisbewertung = "leicht unter Marktniveau";
        preisClass = "text-green-600";
    } else if (preisProQm > durchschnittsPreis * 1.15) {
        preisbewertung = "deutlich über Marktniveau - mögliche Überbewertung prüfen";
        preisClass = "text-red-600";
    } else if (preisProQm > durchschnittsPreis * 1.05) {
        preisbewertung = "leicht über Marktniveau";
        preisClass = "text-yellow-600";
    }
    
    // HTML für die Marktdatenanalyse
    return `
    <div class="p-4 bg-white border rounded">
        <h3 class="font-semibold mb-3">Marktdatenanalyse für Region ${regionName}</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Durchschnittspreis in der Region</div>
                <div class="text-xl font-bold">${formatCurrency(durchschnittsPreis)}/m²</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Ihr Kaufpreis</div>
                <div class="text-xl font-bold ${preisClass}">${formatCurrency(preisProQm)}/m²</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Preistrend (5 Jahre)</div>
                <div class="text-xl font-bold">+${preistrend.toFixed(1)}% p.a.</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Preisbewertung</div>
                <div class="text-xl font-bold ${preisClass}">${preisbewertung}</div>
            </div>
        </div>
        
        <div class="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
            <h4 class="font-medium mb-2">Preisentwicklung</h4>
            <p>Bei der aktuellen Preisentwicklung von ${preistrend.toFixed(1)}% pro Jahr könnte der durchschnittliche Quadratmeterpreis in 5 Jahren bei ca. ${formatCurrency(durchschnittsPreis * Math.pow(1 + preistrend/100, 5))}/m² liegen.</p>
        </div>
        
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 class="font-medium mb-2">Hinweis</h4>
            <p>Diese Analyse basiert auf anonymisierten, regionalen Durchschnittswerten und kann von der tatsächlichen Situation in Ihrer spezifischen Mikrolage abweichen. Für eine genauere Einschätzung empfehlen wir die Konsultation eines lokalen Immobilienexperten.</p>
        </div>
    </div>
    `;
}

// Belastungsanalyse generieren
function generateBelastungsAnalyse(analyseDaten) {
    const rateSumme = analyseDaten.finanzierungsdaten.rateSumme;
    const monatlichesNettoeinkommen = analyseDaten.belastungsdaten.monatlichesNettoeinkommen;
    const monatlicheWohnkosten = analyseDaten.belastungsdaten.monatlicheWohnkosten;
    
    // Belastungsquote berechnen
    const belastungsquote = (monatlicheWohnkosten / monatlichesNettoeinkommen) * 100;
    
    // Bewertung der Belastungsquote
    let belastungsBewertung = "angemessen";
    let belastungsClass = "text-green-600";
    
    if (belastungsquote > 40) {
        belastungsBewertung = "kritisch";
        belastungsClass = "text-red-600";
    } else if (belastungsquote > 35) {
        belastungsBewertung = "hoch";
        belastungsClass = "text-yellow-600";
    } else if (belastungsquote > 30) {
        belastungsBewertung = "erhöht";
        belastungsClass = "text-yellow-600";
    }
    
    // HTML für die Belastungsanalyse
    return `
    <div class="p-4 bg-white border rounded">
        <h3 class="font-semibold mb-3">Belastbarkeitsanalyse</h3>
        
        <div class="p-4 mb-4 border border-blue-200 rounded bg-blue-50">
            <p class="text-sm text-blue-800">
                <i class="fas fa-info-circle mr-2"></i>
                Um eine genauere Analyse zu ermöglichen, empfehlen wir die Eingabe Ihres tatsächlichen monatlichen Nettoeinkommens und Ihrer sonstigen monatlichen Belastungen. Für diese Demo wurde ein Nettoeinkommen basierend auf Ihrer monatlichen Rate geschätzt.
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Geschätztes Nettoeinkommen</div>
                <div class="text-xl font-bold">${formatCurrency(monatlichesNettoeinkommen)}/Monat</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Monatliche Rate</div>
                <div class="text-xl font-bold">${formatCurrency(rateSumme)}/Monat</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Geschätzte Wohnkosten inkl. Nebenkosten</div>
                <div class="text-xl font-bold">${formatCurrency(monatlicheWohnkosten)}/Monat</div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded border">
                <div class="text-sm text-gray-500">Belastungsquote</div>
                <div class="text-xl font-bold ${belastungsClass}">${belastungsquote.toFixed(1)}% (${belastungsBewertung})</div>
            </div>
        </div>
        
        <div class="p-4 ${belastungsquote > 40 ? 'bg-red-50 border-red-200' : belastungsquote > 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded mb-4">
            <h4 class="font-medium mb-2">Bewertung</h4>
            
            ${belastungsquote > 40 ? `
                <p class="mb-2">Die monatliche Belastung ist mit ${belastungsquote.toFixed(1)}% des Nettoeinkommens <strong>kritisch hoch</strong>. In der Finanzierungsberatung gilt eine Belastung von über 40% als riskant, da wenig finanzieller Spielraum für unvorhergesehene Ausgaben oder Einkommensausfälle bleibt.</p>
                <p>Empfehlung: Prüfen Sie die Möglichkeit, die monatliche Rate zu reduzieren, mehr Eigenkapital einzubringen oder eine günstigere Immobilie zu wählen.</p>
            ` : belastungsquote > 35 ? `
                <p class="mb-2">Die monatliche Belastung ist mit ${belastungsquote.toFixed(1)}% des Nettoeinkommens <strong>hoch</strong>. Grundsätzlich gilt eine Belastung von 35-40% als obere Grenze dessen, was langfristig tragbar ist.</p>
                <p>Empfehlung: Überprüfen Sie Ihre sonstigen finanziellen Verpflichtungen und stellen Sie sicher, dass Sie ausreichende Rücklagen für unvorhergesehene Ausgaben haben.</p>
            ` : belastungsquote > 30 ? `
                <p class="mb-2">Die monatliche Belastung ist mit ${belastungsquote.toFixed(1)}% des Nettoeinkommens <strong>moderat erhöht</strong>, aber noch im Rahmen dessen, was als tragbar gilt.</p>
                <p>Empfehlung: Achten Sie auf eine ausreichende Rücklage für Reparaturen und Modernisierungen sowie unvorhergesehene Kosten.</p>
            ` : `
                <p class="mb-2">Die monatliche Belastung ist mit ${belastungsquote.toFixed(1)}% des Nettoeinkommens <strong>angemessen</strong>. Die Finanzierung erscheint aus Sicht der monatlichen Belastung nachhaltig tragbar.</p>
                <p>Empfehlung: Prüfen Sie, ob Sie eventuell eine höhere Tilgung wählen könnten, um die Gesamtlaufzeit der Finanzierung zu verkürzen.</p>
            `}
        </div>
        
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 class="font-medium mb-2">Hinweis zur Genauigkeit</h4>
            <p>Diese Analyse basiert auf geschätzten Werten. Für eine genaue Belastbarkeitsanalyse sind weitere Informationen wie Ihr tatsächliches Nettoeinkommen, sonstige finanzielle Verpflichtungen und geplante größere Ausgaben relevant.</p>
        </div>
    </div>
    `;
}

// Optimierungsanalyse generieren
function generateOptimierungsAnalyse(analyseDaten, provider) {
    const eigenkapitalQuote = analyseDaten.finanzierungsdaten.eigenkapitalQuote;
    const beleihungsauslauf = analyseDaten.finanzierungsdaten.beleihungsauslauf;
    const darlehen = analyseDaten.finanzierungsdaten.darlehen;
    
    // Durchschnittliche Zinsen und Tilgungen berechnen
    const avgZins = darlehen.reduce((sum, d) => sum + d.zins * d.betrag, 0) / analyseDaten.finanzierungsdaten.darlehenSumme;
    const avgTilgung = darlehen.reduce((sum, d) => sum + d.tilgung * d.betrag, 0) / analyseDaten.finanzierungsdaten.darlehenSumme;
    
    // HTML für die Optimierungsanalyse
    let html = `
    <div class="p-4 bg-white border rounded">
        <h3 class="font-semibold mb-3">Optimierungsvorschläge für Ihre Baufinanzierung</h3>
        
        <div class="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
            <p class="text-sm text-blue-800 mb-2">
                <i class="fas fa-robot mr-2"></i>
                <strong>${getProviderName(provider)} KI-Analyse</strong> basierend auf Ihren Finanzierungsdaten
            </p>
            <p class="text-sm text-blue-800">
                Diese Analyse identifiziert Optimierungspotenziale in Ihrer Finanzierungsstruktur und gibt konkrete Handlungsempfehlungen.
            </p>
        </div>
        
        <div class="mb-6">
            <h4 class="font-medium mb-3">Erkannte Optimierungspotenziale</h4>
            
            <div class="space-y-4">
    `;
    
    // Eigenkapital-Optimierung
    if (eigenkapitalQuote < 20) {
        html += `
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <h5 class="font-medium text-yellow-800">Eigenkapitalquote erhöhen</h5>
                    <p class="text-sm">Ihre Eigenkapitalquote beträgt ${eigenkapitalQuote.toFixed(1)}%. Eine Quote von mindestens 20% ist empfehlenswert, um bessere Zinskonditionen zu erhalten und finanzielle Risiken zu reduzieren.</p>
                </div>
        `;
    }
    
    // Beleihungsauslauf-Optimierung
    if (beleihungsauslauf > 80) {
        html += `
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <h5 class="font-medium text-yellow-800">Beleihungsauslauf reduzieren</h5>
                    <p class="text-sm">Ihr Beleihungsauslauf beträgt ${beleihungsauslauf.toFixed(1)}%. Ein Wert über 80% führt oft zu Zinsaufschlägen. Versuchen Sie, mehr Eigenkapital einzubringen oder prüfen Sie die Möglichkeit einer Aufteilung in erstrangige und nachrangige Finanzierung.</p>
                </div>
        `;
    }
    
    // Tilgung-Optimierung
    if (avgTilgung < 2) {
        html += `
                <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <h5 class="font-medium text-red-800">Tilgung erhöhen</h5>
                    <p class="text-sm">Ihre durchschnittliche Tilgung beträgt ${avgTilgung.toFixed(2)}%. Dies ist sehr niedrig und führt zu einer langen Finanzierungsdauer. Eine anfängliche Tilgung von mindestens 2-3% ist empfehlenswert.</p>
                </div>
        `;
    } else if (avgTilgung < 3) {
        html += `
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <h5 class="font-medium text-yellow-800">Tilgung erhöhen</h5>
                    <p class="text-sm">Ihre durchschnittliche Tilgung beträgt ${avgTilgung.toFixed(2)}%. Prüfen Sie, ob eine höhere Tilgung für Sie möglich ist, um die Gesamtlaufzeit zu verkürzen.</p>
                </div>
        `;
    }
    
    // Zinssatz-Optimierung
    if (avgZins > 4) {
        html += `
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <h5 class="font-medium text-yellow-800">Zinssatz optimieren</h5>
                    <p class="text-sm">Ihr durchschnittlicher Zinssatz beträgt ${avgZins.toFixed(2)}%. Dies liegt über dem aktuellen Marktdurchschnitt. Prüfen Sie alternative Angebote oder verhandeln Sie mit Ihrer Bank.</p>
                </div>
        `;
    }
    
    // Zinsbindung-Optimierung
    const kurzbinderCount = darlehen.filter(d => d.zinsbindung < 10).length;
    if (kurzbinderCount > 0) {
        html += `
                <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <h5 class="font-medium text-yellow-800">Zinsbindung prüfen</h5>
                    <p class="text-sm">Sie haben ${kurzbinderCount} Darlehen mit einer Zinsbindung unter 10 Jahren. Angesichts der aktuellen Zinsentwicklung könnte eine längere Zinsbindung vorteilhaft sein.</p>
                </div>
        `;
    }
