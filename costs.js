// costs.js
// Funktionalität für die Kostendaten des BauFi-Rechners

function initCostsData() {
    // Kaufnebenkosten berechnen
    initKaufnebenkosten();
    
    // Kaufpreis pro m² berechnen
    const kaufpreisInput = document.getElementById('kaufpreis');
    const wohnflaecheInput = document.getElementById('wohnflaeche');
    const kaufpreisQmOutput = document.getElementById('kaufpreis_qm');
    
    function updateKaufpreisQm() {
        const kaufpreis = parseFloat(kaufpreisInput.value);
        const wohnflaeche = parseFloat(wohnflaecheInput.value);
        
        if (kaufpreis && wohnflaeche) {
            const preisProQm = kaufpreis / wohnflaeche;
            kaufpreisQmOutput.textContent = formatCurrency(preisProQm);
        } else {
            kaufpreisQmOutput.textContent = '-';
        }
    }
    
    if (kaufpreisInput && wohnflaecheInput && kaufpreisQmOutput) {
        kaufpreisInput.addEventListener('input', () => {
            updateKaufpreisQm();
            updateKaufnebenkosten();
            updateGesamtkosten();
        });
        wohnflaecheInput.addEventListener('input', updateKaufpreisQm);
    }
    
    // Mietrendite berechnen
    const kaltmieteInput = document.getElementById('kaltmiete');
    const mietrenditeOutput = document.getElementById('mietrendite');
    
    function updateMietrendite() {
        const kaufpreis = parseFloat(kaufpreisInput.value);
        const kaltmiete = parseFloat(kaltmieteInput.value);
        
        if (kaufpreis && kaltmiete) {
            const jahresmiete = kaltmiete * 12;
            const rendite = (jahresmiete / kaufpreis) * 100;
            mietrenditeOutput.textContent = rendite.toFixed(2) + '%';
        } else {
            mietrenditeOutput.textContent = '-';
        }
    }
    
    if (kaufpreisInput && kaltmieteInput && mietrenditeOutput) {
        kaufpreisInput.addEventListener('input', updateMietrendite);
        kaltmieteInput.addEventListener('input', updateMietrendite);
    }
    
    // Zusätzliche Kosten-Event-Listener
    const zusatzKostenInputs = [
        document.getElementById('modernisierungskosten'),
        document.getElementById('moebel_kosten'),
        document.getElementById('umzugskosten'),
        document.getElementById('sonstige_kosten')
    ];
    
    zusatzKostenInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateGesamtkosten);
        }
    });
    
    // Initial ausführen
    updateKaufpreisQm();
    updateMietrendite();
    updateGesamtkosten();
}

// Kaufnebenkosten initialisieren
function initKaufnebenkosten() {
    const kaufpreisInput = document.getElementById('kaufpreis');
    
    // Grunderwerbsteuer berechnen
    const grunderwerbsteuerProzentInput = document.getElementById('grunderwerbsteuer_prozent');
    const grunderwerbsteuerAbsolutOutput = document.getElementById('grunderwerbsteuer_absolut');
    
    grunderwerbsteuerProzentInput.addEventListener('input', updateKaufnebenkosten);
    
    // Notar & Grundbuch berechnen
    const notarProzentInput = document.getElementById('notar_prozent');
    const notarAbsolutOutput = document.getElementById('notar_absolut');
    
    notarProzentInput.addEventListener('input', updateKaufnebenkosten);
    
    // Maklergebühr berechnen
    const maklerProzentInput = document.getElementById('makler_prozent');
    const maklerAbsolutOutput = document.getElementById('makler_absolut');
    
    maklerProzentInput.addEventListener('input', updateKaufnebenkosten);
}

// Kaufnebenkosten aktualisieren
function updateKaufnebenkosten() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    
    // Grunderwerbsteuer
    const grunderwerbsteuerProzent = parseFloat(document.getElementById('grunderwerbsteuer_prozent').value) || 0;
    const grunderwerbsteuerAbsolut = kaufpreis * (grunderwerbsteuerProzent / 100);
    
    document.getElementById('grunderwerbsteuer_absolut').textContent = formatCurrency(grunderwerbsteuerAbsolut);
    
    // Notar & Grundbuch
    const notarProzent = parseFloat(document.getElementById('notar_prozent').value) || 0;
    const notarAbsolut = kaufpreis * (notarProzent / 100);
    
    document.getElementById('notar_absolut').textContent = formatCurrency(notarAbsolut);
    
    // Maklergebühr
    const maklerProzent = parseFloat(document.getElementById('makler_prozent').value) || 0;
    const maklerAbsolut = kaufpreis * (maklerProzent / 100);
    
    document.getElementById('makler_absolut').textContent = formatCurrency(maklerAbsolut);
    
    // Gesamte Nebenkosten
    const nebenkostenGesamt = grunderwerbsteuerAbsolut + notarAbsolut + maklerAbsolut;
    
    document.getElementById('nebenkosten_gesamt').textContent = formatCurrency(nebenkostenGesamt);
    
    // Aktualisiere die Gesamtkosten
    updateGesamtkosten();
}

// Gesamtkosten aktualisieren
function updateGesamtkosten() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    
    // Kaufnebenkosten
    const nebenkostenGesamt = parseFloat(document.getElementById('nebenkosten_gesamt').textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    
    // Zusätzliche Kosten
    const modernisierungskosten = parseFloat(document.getElementById('modernisierungskosten').value) || 0;
    const moebelKosten = parseFloat(document.getElementById('moebel_kosten').value) || 0;
    const umzugskosten = parseFloat(document.getElementById('umzugskosten').value) || 0;
    const sonstigeKosten = parseFloat(document.getElementById('sonstige_kosten').value) || 0;
    
    const zusatzkosten = modernisierungskosten + moebelKosten + umzugskosten + sonstigeKosten;
    
    // Gesamtkosten
    const gesamtkosten = kaufpreis + nebenkostenGesamt + zusatzkosten;
    
    // Ausgabe
    document.getElementById('gesamtkosten_kaufpreis').textContent = formatCurrency(kaufpreis);
    document.getElementById('gesamtkosten_nebenkosten').textContent = formatCurrency(nebenkostenGesamt);
    document.getElementById('gesamtkosten_zusatzkosten').textContent = formatCurrency(zusatzkosten);
    document.getElementById('gesamtkosten_gesamt').textContent = formatCurrency(gesamtkosten);
    
    // Auch Finanzierungsstruktur aktualisieren, wenn vorhanden
    updateFinanzierungsstruktur();
}
