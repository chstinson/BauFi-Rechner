// financing.js
// Funktionalität für die Finanzierungsstruktur des BauFi-Rechners

function initFinancingData() {
    // Finanzierungsstruktur-Übersicht aktualisieren
    updateFinanzierungsstruktur();
    
    // Eigenkapital berechnen
    initEigenkapitalBerechnung();
    
    // Multi-Darlehen-Funktionalität
    initMultiDarlehenSystem();
    
    // Tilgungsplan-Button
    const showTilgungsplanButton = document.getElementById('showTilgungsplanAnalyse');
    const tilgungsplanContainer = document.getElementById('tilgungsplanContainerAnalyse');
    
    showTilgungsplanButton.addEventListener('click', function() {
        tilgungsplanContainer.classList.toggle('hidden');
        showTilgungsplanButton.innerHTML = tilgungsplanContainer.classList.contains('hidden') 
            ? '<i class="fas fa-table mr-2"></i>Tilgungsplan anzeigen' 
            : '<i class="fas fa-table mr-2"></i>Tilgungsplan ausblenden';
            
        // Tilgungsplan aktualisieren
        updateTilgungsplan();
    });
}

// Finanzierungsstruktur aktualisieren
function updateFinanzierungsstruktur() {
    // Kosten aus dem Kosten-Tab übernehmen
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    const nebenkostenGesamt = parseFloat(document.getElementById('nebenkosten_gesamt').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Zusätzliche Kosten
    const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten').value) || 0;
    const moebelKosten = parseFloat(document.getElementById('moebel_kosten').value) || 0;
    const umzugskosten = parseFloat(document.getElementById('umzugskosten').value) || 0;
    const sonstigeKosten = parseFloat(document.getElementById('sonstige_kosten').value) || 0;
    
    const zusatzkosten = modernisierungskosten + moebelKosten + umzugskosten + sonstigeKosten;
    
    // Gesamtkosten
    const gesamtkosten = kaufpreis + nebenkostenGesamt + zusatzkosten;
    
    // Ausgabe in der Finanzierungsstruktur
    document.getElementById('fs_kaufpreis').textContent = formatCurrency(kaufpreis);
    document.getElementById('fs_kaufnebenkosten').textContent = formatCurrency(nebenkostenGesamt);
    document.getElementById('fs_zusatzkosten').textContent = formatCurrency(zusatzkosten);
    document.getElementById('fs_gesamtkosten').textContent = formatCurrency(gesamtkosten);
    
    // Eigenkapital und Darlehen aktualisieren
    updateEigenkapitalBerechnung();
    updateFinanzierungsSumme();
}

// Eigenkapital-Berechnung initialisieren
function initEigenkapitalBerechnung() {
    const eigenkapitalInput = document.getElementById('eigenkapital');
    const foerdermittelInput = document.getElementById('foerdermittel');
    
    eigenkapitalInput.addEventListener('input', updateEigenkapitalBerechnung);
    foerdermittelInput.addEventListener('input', updateEigenkapitalBerechnung);
}

// Eigenkapital-Berechnung aktualisieren
function updateEigenkapitalBerechnung() {
    // Gesamtkosten
    const gesamtkosten = parseFloat(document.getElementById('fs_gesamtkosten').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Eigenkapital und Fördermittel
    const eigenkapital = parseFloat(document.getElementById('eigenkapital').value) || 0;
    const foerdermittel = parseFloat(document.getElementById('foerdermittel').value) || 0;
    
    // Eigenkapitalquote berechnen
    const eigenkapitalQuote = gesamtkosten > 0 ? (eigenkapital / gesamtkosten) * 100 : 0;
    
    // Zu finanzierender Betrag
    const zuFinanzieren = Math.max(0, gesamtkosten - eigenkapital - foerdermittel);
    
    // Ausgabe
    document.getElementById('eigenkapital_quote').textContent = eigenkapitalQuote.toFixed(1) + '%';
    document.getElementById('zu_finanzieren').textContent = formatCurrency(zuFinanzieren);
    
    // Darlehen anpassen
    adjustDarlehenToFinancing(zuFinanzieren);
}

// Multi-Darlehen-System initialisieren
function initMultiDarlehenSystem() {
    // Darlehen hinzufügen Button
    document.getElementById('add-darlehen').addEventListener('click', addDarlehen);
    
    // Initialisiere das erste Darlehen
    initDarlehenEvents(document.getElementById('darlehen-1'));
}

// Darlehen-Events initialisieren
function initDarlehenEvents(darlehenBlock) {
    // Range-Slider mit Eingabefeld synchronisieren
    setupRangeSync(darlehenBlock, 'darlehen-betrag');
    setupRangeSync(darlehenBlock, 'darlehen-zins');
    setupRangeSync(darlehenBlock, 'darlehen-tilgung');
    setupRangeSync(darlehenBlock, 'darlehen-zinsbindung');
    
    // Rate und Restschuld berechnen
    calculateDarlehenRate(darlehenBlock);
    
    // Entfernen-Button
    const removeButton = darlehenBlock.querySelector('.darlehen-remove');
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            const darlehenContainer = document.getElementById('darlehen-container');
            const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
            
            // Mindestens ein Darlehen behalten
            if (darlehenBlocks.length > 1) {
                darlehenBlocks.forEach(block => {
            const rateElement = block.querySelector('.darlehen-rate');
            if (rateElement && rateElement.textContent !== '-') {
                // Rate aus Format "1.234,56 €" extrahieren
                const rateText = rateElement.textContent;
                const rateValue = parseFloat(rateText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                summe += rateValue;
            }
        });
    }
    
    return summe;
}lehenBlock.remove();
                
                // Darlehen nummerieren
                renameDarlehen();
                
                // Gesamtsumme aktualisieren
                updateFinanzierungsSumme();
            }
        });
    }
    
    // Sondertilgung-Option
    const sondertilgungOption = darlehenBlock.querySelector('.darlehen-sondertilgung-option');
    const sondertilgungDetails = darlehenBlock.querySelector('.darlehen-sondertilgung-details');
    
    if (sondertilgungOption && sondertilgungDetails) {
        sondertilgungOption.addEventListener('change', function() {
            if (this.checked) {
                sondertilgungDetails.classList.remove('hidden');
            } else {
                sondertilgungDetails.classList.add('hidden');
            }
            
            calculateDarlehenRate(darlehenBlock);
        });
        
        // Sondertilgung-Eingabefelder ändern
        const sondertilgungBetrag = darlehenBlock.querySelector('.darlehen-sondertilgung-betrag');
        const sondertilgungRhythmus = darlehenBlock.querySelector('.darlehen-sondertilgung-rhythmus');
        
        if (sondertilgungBetrag && sondertilgungRhythmus) {
            sondertilgungBetrag.addEventListener('input', function() {
                calculateDarlehenRate(darlehenBlock);
            });
            
            sondertilgungRhythmus.addEventListener('change', function() {
                calculateDarlehenRate(darlehenBlock);
            });
        }
    }
}

// Range-Slider mit Eingabefeld synchronisieren
function setupRangeSync(darlehenBlock, fieldName) {
    const slider = darlehenBlock.querySelector(`.${fieldName}-slider`);
    const input = darlehenBlock.querySelector(`.${fieldName}`);
    
    if (slider && input) {
        slider.addEventListener('input', function() {
            input.value = this.value;
            calculateDarlehenRate(darlehenBlock);
        });
        
        input.addEventListener('input', function() {
            slider.value = this.value;
            calculateDarlehenRate(darlehenBlock);
        });
    }
}

// Darlehensrate berechnen
function calculateDarlehenRate(darlehenBlock) {
    const betrag = parseFloat(darlehenBlock.querySelector('.darlehen-betrag').value) || 0;
    const zins = parseFloat(darlehenBlock.querySelector('.darlehen-zins').value) || 0;
    const tilgung = parseFloat(darlehenBlock.querySelector('.darlehen-tilgung').value) || 0;
    const zinsbindung = parseFloat(darlehenBlock.querySelector('.darlehen-zinsbindung').value) || 0;
    
    // Monatliche Rate berechnen (Annuitätendarlehen)
    const jaehrlicheRate = betrag * (zins + tilgung) / 100;
    const monatlicheRate = jaehrlicheRate / 12;
    
    // Sondertilgung berücksichtigen
    let zusatzTilgung = 0;
    const sondertilgungOption = darlehenBlock.querySelector('.darlehen-sondertilgung-option');
    
    if (sondertilgungOption && sondertilgungOption.checked) {
        const sondertilgungBetrag = parseFloat(darlehenBlock.querySelector('.darlehen-sondertilgung-betrag').value) || 0;
        const sondertilgungRhythmus = darlehenBlock.querySelector('.darlehen-sondertilgung-rhythmus').value;
        
        if (sondertilgungRhythmus === 'jaehrlich') {
            zusatzTilgung = sondertilgungBetrag / 12;
        } else if (sondertilgungRhythmus === 'monatlich') {
            zusatzTilgung = sondertilgungBetrag;
        } else if (sondertilgungRhythmus === 'einmalig') {
            zusatzTilgung = sondertilgungBetrag / (zinsbindung * 12);
        }
    }
    
    // Restschuld nach Zinsbindung berechnen
    let restschuld = betrag;
    let zinssumme = 0;
    let tilgungssumme = 0;
    
    for (let monat = 1; monat <= zinsbindung * 12; monat++) {
        const monatsZins = restschuld * (zins / 100 / 12);
        let monatsTilgung = monatlicheRate - monatsZins;
        
        // Sondertilgung hinzufügen
        if (zusatzTilgung > 0) {
            monatsTilgung += zusatzTilgung;
        }
        
        // Nicht mehr tilgen als Restschuld
        monatsTilgung = Math.min(monatsTilgung, restschuld);
        
        zinssumme += monatsZins;
        tilgungssumme += monatsTilgung;
        restschuld -= monatsTilgung;
        
        // Abbruch bei vollständiger Tilgung
        if (restschuld <= 0) {
            restschuld = 0;
            break;
        }
    }
    
    // Ausgabe
    darlehenBlock.querySelector('.darlehen-rate').textContent = formatCurrency(monatlicheRate + zusatzTilgung);
    darlehenBlock.querySelector('.darlehen-restschuld').textContent = formatCurrency(restschuld);
    
    // Finanzierungssumme aktualisieren
    updateFinanzierungsSumme();
}

// Darlehen hinzufügen
function addDarlehen() {
    // Nächste Darlehensnummer ermitteln
    const darlehenContainer = document.getElementById('darlehen-container');
    const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
    const nextNumber = darlehenBlocks.length + 1;
    
    // Zu finanzierender Betrag
    const zuFinanzieren = parseFloat(document.getElementById('zu_finanzieren').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Aktuell finanzierter Betrag
    let finanzierterBetrag = 0;
    darlehenBlocks.forEach(block => {
        finanzierterBetrag += parseFloat(block.querySelector('.darlehen-betrag').value) || 0;
    });
    
    // Differenz für das neue Darlehen
    const newDarlehenBetrag = Math.max(50000, zuFinanzieren - finanzierterBetrag);
    
    // HTML für neues Darlehen erstellen
    const newDarlehenBlock = document.createElement('div');
    newDarlehenBlock.id = `darlehen-${nextNumber}`;
    newDarlehenBlock.className = 'p-4 border rounded mb-4 darlehen-block';
    newDarlehenBlock.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">Darlehen ${nextNumber}</h4>
            <span class="darlehen-remove cursor-pointer text-red-500 hover:text-red-700">
                <i class="fas fa-times-circle"></i>
            </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Darlehensbetrag</label>
                <div class="flex items-center">
                    <input type="range" min="10000" max="1000000" step="10000" value="${newDarlehenBetrag}" 
                        class="w-full mr-4 darlehen-betrag-slider">
                    <input type="number" class="w-32 p-2 border rounded text-right darlehen-betrag" value="${newDarlehenBetrag}">
                    <span class="ml-2">€</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Sollzins</label>
                <div class="flex items-center">
                    <input type="range" min="0.5" max="6" step="0.1" value="3.7" 
                        class="w-full mr-4 darlehen-zins-slider">
                    <input type="number" min="0.5" max="10" step="0.1" value="3.7" 
                        class="w-24 p-2 border rounded text-right darlehen-zins">
                    <span class="ml-2">%</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Anfängliche Tilgung</label>
                <div class="flex items-center">
                    <input type="range" min="1" max="5" step="0.1" value="2.0" 
                        class="w-full mr-4 darlehen-tilgung-slider">
                    <input type="number" min="0.5" max="10" step="0.1" value="2.0" 
                        class="w-24 p-2 border rounded text-right darlehen-tilgung">
                    <span class="ml-2">%</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Zinsbindung</label>
                <div class="flex items-center">
                    <input type="range" min="5" max="30" step="1" value="10" 
                        class="w-full mr-4 darlehen-zinsbindung-slider">
                    <input type="number" min="1" max="30" step="1" value="10" 
                        class="w-24 p-2 border rounded text-right darlehen-zinsbindung">
                    <span class="ml-2">Jahre</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Monatliche Rate</label>
                <div class="p-2 border rounded bg-gray-100 darlehen-rate">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Restschuld nach Zinsbindung</label>
                <div class="p-2 border rounded bg-gray-100 darlehen-restschuld">-</div>
            </div>
        </div>
        
        <div class="mt-2">
            <label class="inline-flex items-center">
                <input type="checkbox" class="darlehen-sondertilgung-option">
                <span class="ml-2 text-sm">Sondertilgung möglich</span>
            </label>
            <div class="mt-2 darlehen-sondertilgung-details hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium mb-1">Höhe der Sondertilgung</label>
                        <div class="flex items-center">
                            <input type="number" class="w-full p-2 border rounded darlehen-sondertilgung-betrag" value="10000">
                            <span class="ml-2">€</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Rhythmus</label>
                        <select class="w-full p-2 border rounded darlehen-sondertilgung-rhythmus">
                            <option value="jaehrlich">Jährlich</option>
                            <option value="monatlich">Monatlich</option>
                            <option value="einmalig">Einmalig</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Neues Darlehen zum Container hinzufügen
    darlehenContainer.appendChild(newDarlehenBlock);
    
    // Event-Listener für neues Darlehen
    initDarlehenEvents(newDarlehenBlock);
    
    // Darlehen nummerieren
    renameDarlehen();
    
    // Rate für neues Darlehen berechnen
    calculateDarlehenRate(newDarlehenBlock);
}

// Darlehen umbenennen (nach Löschung)
function renameDarlehen() {
    const darlehenContainer = document.getElementById('darlehen-container');
    const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
    
    darlehenBlocks.forEach((block, index) => {
        const number = index + 1;
        block.id = `darlehen-${number}`;
        block.querySelector('h4').textContent = `Darlehen ${number}`;
        
        // Entfernen-Button für erstes Darlehen ausblenden, wenn es das einzige ist
        const removeButton = block.querySelector('.darlehen-remove');
        if (removeButton) {
            if (darlehenBlocks.length === 1 && index === 0) {
                removeButton.classList.add('hidden');
            } else {
                removeButton.classList.remove('hidden');
            }
        }
    });
}

// Finanzierungssumme aktualisieren
function updateFinanzierungsSumme() {
    // Darlehenssumme berechnen
    const darlehenSumme = calculateDarlehenSumme();
    
    // Monatliche Rate berechnen
    const rateSumme = calculateRateSumme();
    
    // Beleihungsauslauf berechnen
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    let beleihungsauslauf = 0;
    
    if (kaufpreis > 0) {
        beleihungsauslauf = (darlehenSumme / kaufpreis) * 100;
    }
    
    // Ausgabe
    document.getElementById('darlehen_summe').textContent = formatCurrency(darlehenSumme);
    document.getElementById('rate_summe').textContent = formatCurrency(rateSumme);
    document.getElementById('beleihungsauslauf').textContent = beleihungsauslauf.toFixed(1) + '%';
    
    // Darlehenssumme farblich markieren, wenn sie vom zu finanzierenden Betrag abweicht
    const zuFinanzieren = parseFloat(document.getElementById('zu_finanzieren').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const darlehenSummeElement = document.getElementById('darlehen_summe');
    
    if (Math.abs(darlehenSumme - zuFinanzieren) > 1000) {
        darlehenSummeElement.classList.add('text-red-600');
    } else {
        darlehenSummeElement.classList.remove('text-red-600');
    }
    
    // Übersicht aktualisieren
    updateOverview();
}

// Darlehen an zu finanzierenden Betrag anpassen
function adjustDarlehenToFinancing(zuFinanzieren) {
    const darlehenContainer = document.getElementById('darlehen-container');
    if (!darlehenContainer) return;
    
    const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
    if (darlehenBlocks.length === 0) return;
    
    // Aktuell finanzierter Betrag
    let finanzierterBetrag = 0;
    darlehenBlocks.forEach(block => {
        finanzierterBetrag += parseFloat(block.querySelector('.darlehen-betrag').value) || 0;
    });
    
    // Wenn der Betrag nur leicht abweicht, passen wir das erste Darlehen an
    if (Math.abs(finanzierterBetrag - zuFinanzieren) > 0) {
        const firstDarlehenBlock = darlehenBlocks[0];
        const firstDarlehenBetrag = parseFloat(firstDarlehenBlock.querySelector('.darlehen-betrag').value) || 0;
        
        // Passe den Betrag des ersten Darlehens an
        const newFirstDarlehenBetrag = Math.max(10000, firstDarlehenBetrag + (zuFinanzieren - finanzierterBetrag));
        
        firstDarlehenBlock.querySelector('.darlehen-betrag').value = newFirstDarlehenBetrag;
        firstDarlehenBlock.querySelector('.darlehen-betrag-slider').value = newFirstDarlehenBetrag;
        
        // Rate neu berechnen
        calculateDarlehenRate(firstDarlehenBlock);
    }
}

// Tilgungsplan aktualisieren
function updateTilgungsplan() {
    const tilgungsplanBody = document.getElementById('tilgungsplanBodyAnalyse');
    if (!tilgungsplanBody) return;
    
    // Tilgungsplan leeren
    tilgungsplanBody.innerHTML = '';
    
    // Alle Darlehen sammeln
    const darlehen = [];
    const darlehenBlocks = document.querySelectorAll('.darlehen-block');
    
    darlehenBlocks.forEach((block, index) => {
        const betrag = parseFloat(block.querySelector('.darlehen-betrag').value) || 0;
        const zins = parseFloat(block.querySelector('.darlehen-zins').value) || 0;
        const tilgung = parseFloat(block.querySelector('.darlehen-tilgung').value) || 0;
        
        // Sondertilgung
        let sondertilgungBetrag = 0;
        let sondertilgungRhythmus = 'jaehrlich';
        
        const sondertilgungOption = block.querySelector('.darlehen-sondertilgung-option');
        if (sondertilgungOption && sondertilgungOption.checked) {
            sondertilgungBetrag = parseFloat(block.querySelector('.darlehen-sondertilgung-betrag').value) || 0;
            sondertilgungRhythmus = block.querySelector('.darlehen-sondertilgung-rhythmus').value;
        }
        
        darlehen.push({
            nr: index + 1,
            betrag,
            zins,
            tilgung,
            sondertilgungBetrag,
            sondertilgungRhythmus
        });
    });
    
    // Gesamttilgungsplan berechnen
    const tilgungsplan = calculateGesamtTilgungsplan(darlehen);
    
    // Tilgungsplan anzeigen
    tilgungsplan.forEach(jahr => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="py-2 px-4 border">${jahr.jahr}</td>
            <td class="py-2 px-4 border text-right">${formatCurrency(jahr.restschuld)}</td>
            <td class="py-2 px-4 border text-right">${formatCurrency(jahr.zinsen)}</td>
            <td class="py-2 px-4 border text-right">${formatCurrency(jahr.tilgung)}</td>
        `;
        
        tilgungsplanBody.appendChild(row);
    });
}

// Gesamttilgungsplan berechnen
function calculateGesamtTilgungsplan(darlehen) {
    // Tilgungsplan für bis zu 40 Jahre
    const maxJahre = 40;
    const tilgungsplan = [];
    
    // Anfangszustand
    let restschuld = darlehen.reduce((sum, d) => sum + d.betrag, 0);
    let gesamtZinsen = 0;
    let gesamtTilgung = 0;
    
    for (let jahr = 1; jahr <= maxJahre; jahr++) {
        let jahresZinsen = 0;
        let jahresTilgung = 0;
        let aktuelleRestschuld = restschuld;
        
        // Für jedes Darlehen
        for (const d of darlehen) {
            if (d.betrag <= 0) continue;
            
            // Jahresrate berechnen (Annuität)
            const jahresRate = d.betrag * (d.zins + d.tilgung) / 100;
            
            // Zinsen für das Jahr
            const jahresZinsenDarlehen = d.betrag * d.zins / 100;
            jahresZinsen += jahresZinsenDarlehen;
            
            // Tilgung für das Jahr
            let jahresTilgungDarlehen = jahresRate - jahresZinsenDarlehen;
            
            // Sondertilgung berücksichtigen
            if (d.sondertilgungBetrag > 0) {
                if (d.sondertilgungRhythmus === 'jaehrlich') {
                    jahresTilgungDarlehen += d.sondertilgungBetrag;
                } else if (d.sondertilgungRhythmus === 'monatlich') {
                    jahresTilgungDarlehen += d.sondertilgungBetrag * 12;
                } else if (d.sondertilgungRhythmus === 'einmalig' && jahr === 1) {
                    jahresTilgungDarlehen += d.sondertilgungBetrag;
                }
            }
            
            // Nicht mehr tilgen als Restschuld
            jahresTilgungDarlehen = Math.min(jahresTilgungDarlehen, d.betrag);
            
            jahresTilgung += jahresTilgungDarlehen;
            
            // Darlehen aktualisieren
            d.betrag -= jahresTilgungDarlehen;
        }
        
        // Gesamtwerte aktualisieren
        restschuld -= jahresTilgung;
        gesamtZinsen += jahresZinsen;
        gesamtTilgung += jahresTilgung;
        
        // Jahr zum Tilgungsplan hinzufügen
        tilgungsplan.push({
            jahr,
            restschuld: Math.max(0, restschuld),
            zinsen: gesamtZinsen,
            tilgung: gesamtTilgung
        });
        
        // Abbruch bei vollständiger Tilgung
        if (restschuld <= 0) {
            break;
        }
    }
    
    return tilgungsplan;
}

// Gesamtsumme aller Darlehen berechnen
function calculateDarlehenSumme() {
    let summe = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        
        darlehenBlocks.forEach(block => {
            const betragInput = block.querySelector('.darlehen-betrag');
            if (betragInput) {
                summe += parseFloat(betragInput.value) || 0;
            }
        });
    }
    
    return summe;
}
