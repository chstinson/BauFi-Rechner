// financing.js
// Funktionalität für die Finanzierungsstruktur des BauFi-Rechners

function initFinancingData() {
    // Finanzierungsstruktur-Übersicht aktualisieren
    updateFinanzierungsstruktur(); // Ruft intern updateEigenkapitalBerechnung und updateFinanzierungsSumme auf

    // Eigenkapital berechnen - Event Listener
    initEigenkapitalBerechnungListeners(); // Nur Listener hinzufügen

    // Multi-Darlehen-Funktionalität
    initMultiDarlehenSystem();

    // Tilgungsplan-Button
    const showTilgungsplanButton = document.getElementById('showTilgungsplanAnalyse');
    const tilgungsplanContainer = document.getElementById('tilgungsplanContainerAnalyse');

    if (showTilgungsplanButton && tilgungsplanContainer) {
        showTilgungsplanButton.addEventListener('click', function() {
            const isHidden = tilgungsplanContainer.classList.toggle('hidden');
            showTilgungsplanButton.innerHTML = isHidden
                ? '<i class="fas fa-table mr-2"></i>Tilgungsplan anzeigen'
                : '<i class="fas fa-table mr-2"></i>Tilgungsplan ausblenden';

            // Tilgungsplan nur aktualisieren, wenn er angezeigt wird
            if (!isHidden) {
                updateTilgungsplan();
            }
        });
    } else {
         console.warn("Tilgungsplan Button oder Container nicht gefunden.");
    }
}

// Finanzierungsstruktur aktualisieren
function updateFinanzierungsstruktur() {
    console.log("updateFinanzierungsstruktur aufgerufen"); // Debug
    // Kosten aus dem Kosten-Tab übernehmen (verwende sichere Selektoren)
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;
    const nebenkostenGesamtText = document.getElementById('nebenkosten_gesamt')?.textContent || '0';
    const nebenkostenGesamt = parseFloat(nebenkostenGesamtText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    // Zusätzliche Kosten
    const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten')?.value) || 0;
    const moebelKosten = parseFloat(document.getElementById('moebel_kosten')?.value) || 0;
    const umzugskosten = parseFloat(document.getElementById('umzugskosten')?.value) || 0;
    const sonstigeKosten = parseFloat(document.getElementById('sonstige_kosten')?.value) || 0;

    const zusatzkosten = modernisierungskosten + moebelKosten + umzugskosten + sonstigeKosten;

    // Gesamtkosten
    const gesamtkosten = kaufpreis + nebenkostenGesamt + zusatzkosten;

    // Ausgabe in der Finanzierungsstruktur
    document.getElementById('fs_kaufpreis').textContent = formatCurrency(kaufpreis);
    document.getElementById('fs_kaufnebenkosten').textContent = formatCurrency(nebenkostenGesamt);
    document.getElementById('fs_zusatzkosten').textContent = formatCurrency(zusatzkosten);
    document.getElementById('fs_gesamtkosten').textContent = formatCurrency(gesamtkosten);

    // Eigenkapital und Darlehen aktualisieren (Kettenaufruf)
    updateEigenkapitalBerechnung(); // Aktualisiert EK und zuFinanzieren
    // updateFinanzierungsSumme() wird am Ende von updateEigenkapitalBerechnung getriggert (via adjustDarlehen..) oder calculateDarlehenRate
}

// Eigenkapital-Berechnung - Nur Listener hinzufügen
function initEigenkapitalBerechnungListeners() {
    const eigenkapitalInput = document.getElementById('eigenkapital');
    const foerdermittelInput = document.getElementById('foerdermittel');

    if (eigenkapitalInput) eigenkapitalInput.addEventListener('input', updateEigenkapitalBerechnung);
    if (foerdermittelInput) foerdermittelInput.addEventListener('input', updateEigenkapitalBerechnung);
}

// Eigenkapital-Berechnung aktualisieren
function updateEigenkapitalBerechnung() {
    console.log("updateEigenkapitalBerechnung aufgerufen"); // Debug
    // Gesamtkosten sicher aus dem bereits aktualisierten Feld lesen
    const gesamtkostenText = document.getElementById('fs_gesamtkosten')?.textContent || '0';
    const gesamtkosten = parseFloat(gesamtkostenText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    // Eigenkapital und Fördermittel
    const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value) || 0;
    const foerdermittel = parseFloat(document.getElementById('foerdermittel')?.value) || 0;

    // Eigenkapitalquote berechnen
    const eigenkapitalQuote = gesamtkosten > 0 ? (eigenkapital / gesamtkosten) * 100 : 0;

    // Zu finanzierender Betrag
    const zuFinanzieren = Math.max(0, gesamtkosten - eigenkapital - foerdermittel);

    // Ausgabe
    document.getElementById('eigenkapital_quote').textContent = formatPercent(eigenkapitalQuote); // Verwende Formatierungsfunktion
    document.getElementById('zu_finanzieren').textContent = formatCurrency(zuFinanzieren);

    // **ENTFERNT/AUSKOMMENTIERT**: Automatische Anpassung des ersten Darlehens ist oft unerwünscht.
    // adjustDarlehenToFinancing(zuFinanzieren);

    // Finanzierungssumme trotzdem aktualisieren, um ggf. Abweichungen (rote Farbe) anzuzeigen
     updateFinanzierungsSumme();
}

// Multi-Darlehen-System initialisieren
function initMultiDarlehenSystem() {
    // Darlehen hinzufügen Button
    const addBtn = document.getElementById('add-darlehen');
    if(addBtn) {
        addBtn.addEventListener('click', addDarlehen);
    }

    // Initialisiere Event-Listener für das/die bereits vorhandene(n) Darlehen
     const initialBlocks = document.querySelectorAll('#darlehen-container .darlehen-block');
     if(initialBlocks.length > 0) {
        initialBlocks.forEach(initDarlehenEvents);
        // Sicherstellen, dass das erste Darlehen berechnet wird
        calculateDarlehenRate(initialBlocks[0]);
        renameDarlehen(); // Stellt sicher, dass Nummerierung und Remove-Button korrekt sind
     } else {
        // Optional: Wenn kein Darlehen initial da ist, automatisch eins hinzufügen?
        // addDarlehen();
        console.log("Kein initiales Darlehen gefunden.");
     }
}

// Darlehen-Events initialisieren für einen spezifischen Block
function initDarlehenEvents(darlehenBlock) {
    if (!darlehenBlock) return;

    // Range-Slider mit Eingabefeld synchronisieren (pro Darlehen)
    setupRangeSync(darlehenBlock, 'darlehen-betrag');
    setupRangeSync(darlehenBlock, 'darlehen-zins');
    setupRangeSync(darlehenBlock, 'darlehen-tilgung');
    setupRangeSync(darlehenBlock, 'darlehen-zinsbindung');

    // WICHTIG: Bei Änderung eines dieser Werte die Rate *dieses* Darlehens neu berechnen
    const inputs = darlehenBlock.querySelectorAll('.darlehen-betrag, .darlehen-zins, .darlehen-tilgung, .darlehen-zinsbindung, .darlehen-sondertilgung-betrag');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculateDarlehenRate(darlehenBlock));
    });
    const selects = darlehenBlock.querySelectorAll('.darlehen-sondertilgung-rhythmus');
     selects.forEach(select => {
         select.addEventListener('change', () => calculateDarlehenRate(darlehenBlock));
     });

    // Entfernen-Button
    const removeButton = darlehenBlock.querySelector('.darlehen-remove');
    if (removeButton) {
         // Sicherstellen, dass der Listener nicht mehrfach hinzugefügt wird (falls re-init)
         removeButton.replaceWith(removeButton.cloneNode(true)); // Ersetzt durch Klon -> alte Listener weg
         const newRemoveButton = darlehenBlock.querySelector('.darlehen-remove'); // Klon neu selektieren
         newRemoveButton.addEventListener('click', function() {
            const darlehenContainer = document.getElementById('darlehen-container');
            const alleDarlehenBlocks = darlehenContainer?.querySelectorAll('.darlehen-block');

            // Nur entfernen, wenn mehr als ein Darlehen vorhanden ist
            if (alleDarlehenBlocks && alleDarlehenBlocks.length > 1) {
                darlehenBlock.remove();
                // Darlehen neu nummerieren und Summen aktualisieren
                renameDarlehen();
                updateFinanzierungsSumme();
                updateTilgungsplanVisibility(); // Ggf. Tilgungsplan neu berechnen
            } else {
                alert("Das letzte verbleibende Darlehen kann nicht entfernt werden.");
            }
        });
    }

    // Sondertilgung-Option Checkbox
    const sondertilgungOption = darlehenBlock.querySelector('.darlehen-sondertilgung-option');
    const sondertilgungDetails = darlehenBlock.querySelector('.darlehen-sondertilgung-details');

    if (sondertilgungOption && sondertilgungDetails) {
        sondertilgungOption.addEventListener('change', function() {
            sondertilgungDetails.classList.toggle('hidden', !this.checked);
            // Rate neu berechnen, wenn Option geändert wird
            calculateDarlehenRate(darlehenBlock);
        });
        // Initialen Zustand setzen
        sondertilgungDetails.classList.toggle('hidden', !sondertilgungOption.checked);

        // Listener für Betrag/Rhythmus (werden oben schon erfasst)
    }
}

// Range-Slider mit Eingabefeld synchronisieren
function setupRangeSync(darlehenBlock, fieldName) {
    const slider = darlehenBlock.querySelector(`.${fieldName}-slider`);
    const input = darlehenBlock.querySelector(`.${fieldName}`);

    if (slider && input) {
         const changeHandler = () => {
            if (event.target === slider) {
                 input.value = slider.value;
             } else {
                 // Sicherstellen, dass der Wert im gültigen Bereich des Sliders liegt
                 const min = parseFloat(slider.min) || 0;
                 const max = parseFloat(slider.max) || 1000000; // Annahme max default
                 let value = parseFloat(input.value) || min;
                 value = Math.max(min, Math.min(max, value));
                 // Den Wert ggf. an den Step anpassen (optional, aber sauberer)
                 const step = parseFloat(slider.step) || 1;
                 value = Math.round(value / step) * step;

                 input.value = value; // Korrigierten Wert zurückschreiben
                 slider.value = value;
             }
            // Rate wird durch separaten Listener auf 'input' bereits aktualisiert
            // calculateDarlehenRate(darlehenBlock); // NICHT hier aufrufen, sonst doppelt
        };

        // 'input' Event für Echtzeit-Feedback vom Slider
        slider.addEventListener('input', changeHandler);
        // 'change' Event für finale Werte von Slider und Input (Enter, Fokusverlust)
        // 'input' auch für das Textfeld, um Slider direkt anzupassen
        input.addEventListener('input', changeHandler);
        input.addEventListener('change', changeHandler); // Falls User Wert ändert und rausklickt

         // Initialwert setzen
         // input.value = slider.value; // Initialwert sollte vom HTML kommen
         slider.value = input.value; // Slider an Input anpassen
    } else {
        console.warn(`Elemente für ${fieldName} in Block ${darlehenBlock.id} nicht gefunden.`);
    }
}


// Darlehensrate und Restschuld BERECHNEN (pro Darlehen)
function calculateDarlehenRate(darlehenBlock) {
     if (!darlehenBlock) return;
     console.log(`calculateDarlehenRate für Block: ${darlehenBlock.id}`); // Debug

    const betrag = parseFloat(darlehenBlock.querySelector('.darlehen-betrag')?.value) || 0;
    const zinsProzent = parseFloat(darlehenBlock.querySelector('.darlehen-zins')?.value) || 0;
    const tilgungProzent = parseFloat(darlehenBlock.querySelector('.darlehen-tilgung')?.value) || 0;
    const zinsbindungJahre = parseFloat(darlehenBlock.querySelector('.darlehen-zinsbindung')?.value) || 0;

    const rateOutput = darlehenBlock.querySelector('.darlehen-rate');
    const restschuldOutput = darlehenBlock.querySelector('.darlehen-restschuld');
     if (!rateOutput || !restschuldOutput) return; // Elemente müssen existieren

    if (betrag === 0 || zinsbindungJahre === 0) {
        rateOutput.textContent = formatCurrency(0);
        restschuldOutput.textContent = formatCurrency(betrag);
        updateFinanzierungsSumme(); // Auch bei 0 aktualisieren
        updateTilgungsplanVisibility();
        return;
    }


    const zinsfaktorMonatlich = zinsProzent / 100 / 12;

    // Monatliche Annuitätenrate berechnen (Formel für Annuitätendarlehen)
    const annuitätRate = betrag * (zinsfaktorMonatlich + (tilgungProzent / 100 / 12));

    // Berücksichtigung der exakten monatlichen Annuitätenformel (optional, aber genauer)
    // q = 1 + zinsfaktorMonatlich
    // annuität = betrag * ( q^n * (q-1) / (q^n - 1) ); // wobei n Gesamtlaufzeit, hier nicht direkt nutzbar
    // -> Daher die Rate über (Zins + Tilgung) als Näherung okay

    // Sondertilgung monatlich / pro Jahr
    let monatlicheSondertilgung = 0;
    const sondertilgungOption = darlehenBlock.querySelector('.darlehen-sondertilgung-option');
    let einmaligeSondertilgungImErstenJahr = 0;

    if (sondertilgungOption && sondertilgungOption.checked) {
        const sondertilgungBetrag = parseFloat(darlehenBlock.querySelector('.darlehen-sondertilgung-betrag')?.value) || 0;
        const sondertilgungRhythmus = darlehenBlock.querySelector('.darlehen-sondertilgung-rhythmus')?.value;

        if (sondertilgungBetrag > 0) {
            if (sondertilgungRhythmus === 'monatlich') {
                monatlicheSondertilgung = sondertilgungBetrag;
            } else if (sondertilgungRhythmus === 'jaehrlich') {
                monatlicheSondertilgung = sondertilgungBetrag / 12; // Auf Monat umlegen für Ratenanzeige & Berechnung
            } else if (sondertilgungRhythmus === 'einmalig') {
                // Wird unten in der Schleife berücksichtigt, aber nicht zur monatlichen Rate addiert
                 einmaligeSondertilgungImErstenJahr = sondertilgungBetrag;
                 // Alternative: auf Monate der Zinsbindung verteilen (wie vorher) - weniger intuitiv
                 // monatlicheSondertilgung = sondertilgungBetrag / (zinsbindungJahre * 12);
            }
        }
    }

    const angezeigteRate = annuitätRate + (monatlicheSondertilgung); // Rate die im UI angezeigt wird
    rateOutput.textContent = formatCurrency(angezeigteRate);


    // Restschuld nach Zinsbindung berechnen (Monat für Monat)
    let aktuelleRestschuld = betrag;
    let restschuld = betrag; // Speicher für das Ergebnis
    const anzahlMonate = zinsbindungJahre * 12;

    if (aktuelleRestschuld > 0) { // Nur rechnen, wenn es was zu rechnen gibt
        for (let monat = 1; monat <= anzahlMonate; monat++) {
            const monatsZins = aktuelleRestschuld * zinsfaktorMonatlich;
            let monatsTilgungAnnuität = annuitätRate - monatsZins;

            // Tatsächliche Tilgung inkl. periodischer Sondertilgungen
            let aktuelleMonatsTilgung = monatsTilgungAnnuität + monatlicheSondertilgung; // Bei jährlicher ST ist diese hier /12

            // Einmalige Sondertilgung im ersten Jahr (z.B. am Ende des 12. Monats)
            if (einmaligeSondertilgungImErstenJahr > 0 && monat === 12) {
                aktuelleMonatsTilgung += einmaligeSondertilgungImErstenJahr;
            }

            // Nicht mehr tilgen als Restschuld (wichtig bei hohen Tilgungen/Sondertilgungen)
            aktuelleMonatsTilgung = Math.min(aktuelleMonatsTilgung, aktuelleRestschuld);

            // Neue Restschuld
            aktuelleRestschuld -= aktuelleMonatsTilgung;

            // Abbruch bei vollständiger Tilgung
            if (aktuelleRestschuld <= 0.01) { // Kleiner Puffer für Rundungsfehler
                aktuelleRestschuld = 0;
                break; // Restschuld ist 0, Schleife beenden
            }
        }
        restschuld = Math.max(0, aktuelleRestschuld); // Sicherstellen, dass es nicht negativ wird
    } else {
         restschuld = 0; // Wenn Startbetrag 0 war
    }


    restschuldOutput.textContent = formatCurrency(restschuld);

    // Nach Berechnung die Gesamtsummen aktualisieren
    updateFinanzierungsSumme();
     // Und Tilgungsplan, falls sichtbar
     updateTilgungsplanVisibility();
}


// Darlehen hinzufügen
function addDarlehen() {
    const darlehenContainer = document.getElementById('darlehen-container');
    if (!darlehenContainer) return;

    // Nächste Darlehensnummer ermitteln
    const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
    const nextNumber = darlehenBlocks.length + 1;

    // Zu finanzierender Betrag als Orientierung
    const zuFinanzierenText = document.getElementById('zu_finanzieren')?.textContent || '0';
    const zuFinanzieren = parseFloat(zuFinanzierenText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    // Aktuell bereits durch Darlehen abgedeckter Betrag
    let finanzierterBetrag = 0;
    darlehenBlocks.forEach(block => {
        finanzierterBetrag += parseFloat(block.querySelector('.darlehen-betrag')?.value) || 0;
    });

    // Vorschlag für das neue Darlehen: die verbleibende Differenz, mind. 50k, max. 1Mio
    const defaultBetrag = 50000; // Standardbetrag für neues Darlehen
    const newDarlehenBetrag = Math.min(1000000, Math.max(defaultBetrag, zuFinanzieren - finanzierterBetrag));
    const initialBetrag = Math.round(newDarlehenBetrag / 10000) * 10000; // Auf 10k runden


    // HTML für neues Darlehen erstellen (Template Literal)
    const newDarlehenHtml = `
        <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">Darlehen ${nextNumber}</h4>
            <span class="darlehen-remove cursor-pointer text-red-500 hover:text-red-700" title="Darlehen ${nextNumber} entfernen">
                <i class="fas fa-times-circle fa-lg"></i>
            </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-betrag">Darlehensbetrag</label>
                <div class="flex items-center">
                    <input type="range" min="10000" max="1000000" step="10000" value="${initialBetrag}"
                        class="w-full mr-4 darlehen-betrag-slider" id="darlehen-${nextNumber}-betrag-slider">
                    <input type="number" min="10000" max="1000000" step="1000" value="${initialBetrag}"
                        class="w-32 p-2 border rounded text-right darlehen-betrag" id="darlehen-${nextNumber}-betrag">
                    <span class="ml-2">€</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-zins">Sollzins</label>
                <div class="flex items-center">
                    <input type="range" min="0.5" max="7" step="0.1" value="3.8"
                        class="w-full mr-4 darlehen-zins-slider" id="darlehen-${nextNumber}-zins-slider">
                    <input type="number" min="0.1" max="10" step="0.01" value="3.8"
                        class="w-24 p-2 border rounded text-right darlehen-zins" id="darlehen-${nextNumber}-zins">
                    <span class="ml-2">%</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-tilgung">Anfängliche Tilgung</label>
                <div class="flex items-center">
                    <input type="range" min="1" max="10" step="0.1" value="2.0"
                        class="w-full mr-4 darlehen-tilgung-slider" id="darlehen-${nextNumber}-tilgung-slider">
                    <input type="number" min="0.5" max="10" step="0.1" value="2.0"
                        class="w-24 p-2 border rounded text-right darlehen-tilgung" id="darlehen-${nextNumber}-tilgung">
                    <span class="ml-2">%</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-zinsbindung">Zinsbindung</label>
                <div class="flex items-center">
                    <input type="range" min="5" max="30" step="1" value="10"
                        class="w-full mr-4 darlehen-zinsbindung-slider" id="darlehen-${nextNumber}-zinsbindung-slider">
                    <input type="number" min="1" max="40" step="1" value="10"
                        class="w-24 p-2 border rounded text-right darlehen-zinsbindung" id="darlehen-${nextNumber}-zinsbindung">
                    <span class="ml-2">Jahre</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Monatliche Rate</label>
                <div class="p-2 border rounded bg-gray-100 darlehen-rate h-10 flex items-center">-</div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Restschuld n. Zinsbindung</label>
                <div class="p-2 border rounded bg-gray-100 darlehen-restschuld h-10 flex items-center">-</div>
            </div>
        </div>

        <div class="mt-4 border-t pt-3">
            <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 darlehen-sondertilgung-option" id="darlehen-${nextNumber}-st-option">
                <span class="ml-2 text-sm">Sondertilgung vereinbaren</span>
            </label>
            <div class="mt-2 darlehen-sondertilgung-details hidden pl-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-st-betrag">Höhe d. Sondertilgung</label>
                        <div class="flex items-center">
                            <input type="number" class="w-full p-2 border rounded darlehen-sondertilgung-betrag" value="10000" min="0" step="100" id="darlehen-${nextNumber}-st-betrag">
                            <span class="ml-2">€</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1" for="darlehen-${nextNumber}-st-rhythmus">Rhythmus</label>
                        <select class="w-full p-2 border rounded darlehen-sondertilgung-rhythmus" id="darlehen-${nextNumber}-st-rhythmus">
                            <option value="jaehrlich">Jährlich</option>
                            <option value="monatlich">Monatlich</option>
                            <option value="einmalig">Einmalig (im 1. Jahr)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Neues Darlehen als Div-Element erstellen und hinzufügen
    const newDarlehenBlock = document.createElement('div');
    newDarlehenBlock.id = `darlehen-${nextNumber}`; // ID setzen
    newDarlehenBlock.className = 'p-4 border rounded mb-4 darlehen-block bg-white shadow-sm'; // Klassen setzen
    newDarlehenBlock.innerHTML = newDarlehenHtml; // Inhalt füllen

    darlehenContainer.appendChild(newDarlehenBlock);

    // Event-Listener für das NEUE Darlehen initialisieren
    initDarlehenEvents(newDarlehenBlock);

    // Alle Darlehen neu nummerieren (visuell und ggf. IDs anpassen)
    renameDarlehen();

    // Rate für das neue Darlehen berechnen und Gesamtsumme aktualisieren
    calculateDarlehenRate(newDarlehenBlock); // löst auch updateFinanzierungsSumme aus
}


// Darlehen umbenennen und Remove-Button-Logik anpassen (nach Löschung/Hinzufügen)
function renameDarlehen() {
    const darlehenContainer = document.getElementById('darlehen-container');
    if (!darlehenContainer) return;
    const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');

    darlehenBlocks.forEach((block, index) => {
        const number = index + 1;
        // Block ID aktualisieren (wichtig für korrekte Referenzen)
         block.id = `darlehen-${number}`;

        // Titel aktualisieren
        const titleElement = block.querySelector('h4');
        if(titleElement) titleElement.textContent = `Darlehen ${number}`;

         // Label "for" Attribute und Input "id" Attribute aktualisieren (optional aber gut für Accessibility)
         block.querySelectorAll('label').forEach(label => {
            const oldFor = label.getAttribute('for');
            if(oldFor) {
                const newFor = oldFor.replace(/darlehen-\d+/, `darlehen-${number}`);
                label.setAttribute('for', newFor);
            }
         });
          block.querySelectorAll('input, select').forEach(input => {
            const oldId = input.getAttribute('id');
             if(oldId) {
                const newId = oldId.replace(/darlehen-\d+/, `darlehen-${number}`);
                 input.setAttribute('id', newId);
             }
          });


        // Entfernen-Button Logik
        const removeButton = block.querySelector('.darlehen-remove');
        if (removeButton) {
            removeButton.title = `Darlehen ${number} entfernen`; // Tooltip aktualisieren
            // Ersten Block: Button ausblenden, wenn er der einzige ist.
            if (darlehenBlocks.length === 1 && index === 0) {
                removeButton.classList.add('hidden');
            } else {
                removeButton.classList.remove('hidden');
            }
        }
    });
}

// Finanzierungssumme (Gesamtdarlehen, Gesamtrate, LTV) aktualisieren
function updateFinanzierungsSumme() {
     console.log("updateFinanzierungsSumme aufgerufen"); // Debug
    // Darlehenssumme und Rate berechnen
    let darlehenSumme = 0;
    let rateSumme = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        darlehenBlocks.forEach(block => {
            darlehenSumme += parseFloat(block.querySelector('.darlehen-betrag')?.value) || 0;
            const rateText = block.querySelector('.darlehen-rate')?.textContent || '0';
            rateSumme += parseFloat(rateText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        });
    }

    // Beleihungsauslauf berechnen
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;
    let beleihungsauslauf = 0;
    if (kaufpreis > 0 && darlehenSumme > 0) {
        beleihungsauslauf = (darlehenSumme / kaufpreis) * 100;
    }

    // Ausgabe
    document.getElementById('darlehen_summe').textContent = formatCurrency(darlehenSumme);
    document.getElementById('rate_summe').textContent = formatCurrency(rateSumme);
    document.getElementById('beleihungsauslauf').textContent = formatPercent(beleihungsauslauf); // Verwende Formatierungsfunktion

    // Darlehenssumme farblich markieren, wenn sie vom zu finanzierenden Betrag abweicht
    const zuFinanzierenText = document.getElementById('zu_finanzieren')?.textContent || '0';
    const zuFinanzieren = parseFloat(zuFinanzierenText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    const darlehenSummeElement = document.getElementById('darlehen_summe');
    const differenceThreshold = 10; // Kleine Toleranz für Rundungsdifferenzen

    if (darlehenSummeElement) {
         if (Math.abs(darlehenSumme - zuFinanzieren) > differenceThreshold) {
             darlehenSummeElement.classList.add('text-red-600', 'font-bold');
             darlehenSummeElement.title = `Abweichung zum Finanzierungsbedarf (${formatCurrency(zuFinanzieren)})`;
         } else {
             darlehenSummeElement.classList.remove('text-red-600', 'font-bold');
             darlehenSummeElement.title = '';
         }
    }

    // Übersicht im ersten Tab aktualisieren (falls Funktion existiert)
    if (typeof updateOverview === 'function') {
        updateOverview();
    }
}

// **AUSKOMMENTIERT**: Funktion zum automatischen Anpassen des Darlehens (oft unerwünscht)
/*
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

    // Nur anpassen, wenn die Differenz signifikant ist UND nur EIN Darlehen existiert? Oder optional?
    // Hier: Passt immer das ERSTE Darlehen an, was problematisch sein kann.
     const differenz = zuFinanzieren - finanzierterBetrag;
     if (Math.abs(differenz) > 1) { // Kleine Toleranz
        const firstDarlehenBlock = darlehenBlocks[0];
         const firstDarlehenInput = firstDarlehenBlock.querySelector('.darlehen-betrag');
         const firstDarlehenSlider = firstDarlehenBlock.querySelector('.darlehen-betrag-slider');
         const alterBetrag = parseFloat(firstDarlehenInput.value) || 0;
         let neuerBetrag = alterBetrag + differenz;

         // Mindest- und Maximalbetrag sicherstellen
         const min = parseFloat(firstDarlehenSlider.min) || 10000;
         const max = parseFloat(firstDarlehenSlider.max) || 1000000;
         neuerBetrag = Math.max(min, Math.min(max, neuerBetrag));
         neuerBetrag = Math.round(neuerBetrag / 1000) * 1000; // Auf Tausender runden

        if (neuerBetrag !== alterBetrag) {
            firstDarlehenInput.value = neuerBetrag;
             firstDarlehenSlider.value = neuerBetrag;
             console.log(`Erstes Darlehen automatisch auf ${formatCurrency(neuerBetrag)} angepasst.`);
            // Rate für dieses Darlehen neu berechnen (löst updateFinanzierungsSumme aus)
             calculateDarlehenRate(firstDarlehenBlock);
         }
     }
}
*/

// Tilgungsplan im Analyse-Tab aktualisieren (wenn sichtbar)
function updateTilgungsplanVisibility() {
    const tilgungsplanContainer = document.getElementById('tilgungsplanContainerAnalyse');
    if (tilgungsplanContainer && !tilgungsplanContainer.classList.contains('hidden')) {
        updateTilgungsplan();
    }
}


// Tilgungsplan berechnen und anzeigen
function updateTilgungsplan() {
    const tilgungsplanBody = document.getElementById('tilgungsplanBodyAnalyse');
    if (!tilgungsplanBody) return;
     console.log("Aktualisiere Tilgungsplan...");

    // Tilgungsplan leeren
    tilgungsplanBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Berechne Tilgungsplan...</td></tr>';

    // Alle Darlehen sammeln
    const darlehensDaten = [];
    const darlehenBlocks = document.querySelectorAll('#darlehen-container .darlehen-block');

    darlehenBlocks.forEach((block, index) => {
        const betrag = parseFloat(block.querySelector('.darlehen-betrag')?.value) || 0;
         if (betrag === 0) return; // Überspringe Darlehen mit 0 Betrag

        const zins = parseFloat(block.querySelector('.darlehen-zins')?.value) || 0;
        const tilgung = parseFloat(block.querySelector('.darlehen-tilgung')?.value) || 0;
        const zinsbindung = parseFloat(block.querySelector('.darlehen-zinsbindung')?.value) || 0;

        let sondertilgungBetrag = 0;
        let sondertilgungRhythmus = 'jaehrlich';
        const sondertilgungOption = block.querySelector('.darlehen-sondertilgung-option');
        if (sondertilgungOption && sondertilgungOption.checked) {
            sondertilgungBetrag = parseFloat(block.querySelector('.darlehen-sondertilgung-betrag')?.value) || 0;
            sondertilgungRhythmus = block.querySelector('.darlehen-sondertilgung-rhythmus')?.value;
        }

        darlehensDaten.push({
            nr: index + 1,
            restschuld: betrag, // Start mit vollem Betrag für die Planberechnung
            zinsProzent: zins,
            tilgungProzent: tilgung,
            zinsbindungJahre: zinsbindung,
            sondertilgungBetrag: sondertilgungBetrag,
            sondertilgungRhythmus: sondertilgungRhythmus
        });
    });

    if (darlehensDaten.length === 0) {
        tilgungsplanBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Keine Darlehen für Tilgungsplan vorhanden.</td></tr>';
        return;
    }

    // Gesamttilgungsplan berechnen
    const { tilgungsplan, maxJahreErreicht, vollGetilgt } = calculateGesamtTilgungsplan(darlehensDaten);

    // Tilgungsplan anzeigen
    tilgungsplanBody.innerHTML = ''; // Leeren für neue Zeilen
    if (tilgungsplan.length > 0) {
        tilgungsplan.forEach(jahr => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 even:bg-gray-100'; // Zebra-Stripes für bessere Lesbarkeit
            row.innerHTML = `
                <td class="py-2 px-4 border text-center">${jahr.jahr}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(jahr.jahresRate)}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(jahr.zinsen)}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(jahr.tilgung)}</td>
                <td class="py-2 px-4 border text-right font-semibold">${formatCurrency(jahr.restschuld)}</td>
            `;
            tilgungsplanBody.appendChild(row);
        });
        if(maxJahreErreicht && !vollGetilgt) {
             const footerRow = document.createElement('tr');
             footerRow.innerHTML = `<td colspan="5" class="p-2 text-center text-sm text-gray-600 bg-yellow-50 border">Tilgungsplan auf ${tilgungsplan.length} Jahre begrenzt. Anschlussfinanzierung erforderlich.</td>`;
             tilgungsplanBody.appendChild(footerRow);
         }
         if (vollGetilgt) {
            const lastYear = tilgungsplan[tilgungsplan.length - 1];
             const footerRow = document.createElement('tr');
             footerRow.innerHTML = `<td colspan="5" class="p-2 text-center text-sm text-green-700 bg-green-50 border">Vollständige Tilgung erreicht im Jahr ${lastYear.jahr}.</td>`;
             tilgungsplanBody.appendChild(footerRow);
         }

    } else {
         tilgungsplanBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Tilgungsplan konnte nicht berechnet werden.</td></tr>';
    }

}

// VEREINFACHTER Gesamttilgungsplan berechnen (Jährlich, begrenzt)
function calculateGesamtTilgungsplan(darlehensDaten) {
    // Begrenzung: Max 15 Jahre oder kürzeste Zinsbindung
     const maxJahreDefault = 15;
     const kürzesteZinsbindung = Math.min(...darlehensDaten.map(d => d.zinsbindungJahre > 0 ? d.zinsbindungJahre : maxJahreDefault));
     const maxJahre = Math.min(maxJahreDefault, kürzesteZinsbindung);

    const tilgungsplan = [];
    let aktuelleDarlehen = JSON.parse(JSON.stringify(darlehensDaten)); // Tiefe Kopie für Berechnung
    let gesamtRestschuld = aktuelleDarlehen.reduce((sum, d) => sum + d.restschuld, 0);
    let maxJahreErreicht = false;
     let vollGetilgt = false;

    console.log(`Berechne Tilgungsplan für max. ${maxJahre} Jahre.`);

    for (let jahr = 1; jahr <= maxJahre; jahr++) {
        let jahresZinsenGesamt = 0;
        let jahresTilgungGesamt = 0;
        let jahresRateGesamt = 0; // Summe aller Annuitäten + ST

         if (gesamtRestschuld <= 0.01) {
             vollGetilgt = true;
            break; // Alles getilgt
        }

        aktuelleDarlehen.forEach(d => {
            if (d.restschuld <= 0.01) return; // Dieses Darlehen ist bereits getilgt

            const zins = d.zinsProzent / 100;
            const tilgung = d.tilgungProzent / 100;
             const annuitätRateJahr = d.restschuld * (zins + tilgung); // Jährliche Annuität für dieses Darlehen

            let jahresSondertilgung = 0;
            if (d.sondertilgungBetrag > 0) {
                if (d.sondertilgungRhythmus === 'jaehrlich') {
                    jahresSondertilgung = d.sondertilgungBetrag;
                } else if (d.sondertilgungRhythmus === 'monatlich') {
                    jahresSondertilgung = d.sondertilgungBetrag * 12;
                } else if (d.sondertilgungRhythmus === 'einmalig' && jahr === 1) {
                    // Wird direkt getilgt, zählt nicht zur laufenden "Rate"
                }
            }
             // Einmalige ST wird extra behandelt
             if (d.sondertilgungRhythmus === 'einmalig' && d.sondertilgungBetrag > 0 && jahr === 1) {
                const einmalTilgung = Math.min(d.sondertilgungBetrag, d.restschuld);
                 d.restschuld -= einmalTilgung;
                 jahresTilgungGesamt += einmalTilgung; // Zählt zur Gesamttilgung
             }

             // Monatliche Berechnung für genauere Jahreswerte
             let monatlicheRestschuld = d.restschuld;
             let zinsenDiesesJahr = 0;
             let tilgungDiesesJahr = 0;
             let rateDiesesJahr = 0;
             const monatsRateAnnuitaet = annuitätRateJahr / 12;
             const monatsZinsFaktor = zins / 12;
             const monatsSonderTilgung = jahresSondertilgung / 12; // Gilt für jährliche & monatliche

             for (let m = 1; m <= 12; m++) {
                 if (monatlicheRestschuld <= 0.01) break;
                 const monatsZinsAnteil = monatlicheRestschuld * monatsZinsFaktor;
                 const monatsTilgungAnnuitaet = monatsRateAnnuitaet - monatsZinsAnteil;
                 let monatsTilgungTotal = monatsTilgungAnnuitaet + monatsSonderTilgung;
                 monatsTilgungTotal = Math.min(monatsTilgungTotal, monatlicheRestschuld); // Nicht mehr als Restschuld tilgen

                 monatlicheRestschuld -= monatsTilgungTotal;
                 zinsenDiesesJahr += monatsZinsAnteil;
                 tilgungDiesesJahr += monatsTilgungTotal;
                 rateDiesesJahr += (monatsZinsAnteil + monatsTilgungTotal); // Tatsächlich gezahlte Rate inkl. ST
            }

             d.restschuld = Math.max(0, monatlicheRestschuld); // Update für nächstes Jahr

             // Gesamtwerte addieren
             jahresZinsenGesamt += zinsenDiesesJahr;
             jahresTilgungGesamt += tilgungDiesesJahr;
             jahresRateGesamt += rateDiesesJahr;

        });

         gesamtRestschuld = aktuelleDarlehen.reduce((sum, d) => sum + d.restschuld, 0);


        tilgungsplan.push({
            jahr,
            jahresRate: jahresRateGesamt,
            zinsen: jahresZinsenGesamt,
            tilgung: jahresTilgungGesamt,
            restschuld: Math.max(0, gesamtRestschuld)
        });

        if (jahr === maxJahre) {
             maxJahreErreicht = true;
              if (gesamtRestschuld > 0.01) {
                 console.log(`Tilgungsplan nach ${maxJahre} Jahren beendet, Restschuld: ${formatCurrency(gesamtRestschuld)}`);
             } else {
                 vollGetilgt = true; // Kann auch im letzten erlaubten Jahr passieren
             }
        }
    } // Ende for-Schleife (Jahre)

    return { tilgungsplan, maxJahreErreicht, vollGetilgt };
}


// Hilfsfunktionen (sollten global oder in main.js verfügbar sein)
// function formatCurrency(value) { ... }
// function formatPercent(value) { ... }
// Siehe main.js für Implementierung oder kopieren Sie sie hierher, falls nötig.
