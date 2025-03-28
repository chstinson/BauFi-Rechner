document.addEventListener('DOMContentLoaded', function() {
    // DOM-Elemente referenzieren
    const darlehensbetragsInput = document.getElementById('darlehensbetrag');
    const darlehensbetragsValue = document.getElementById('darlehensbetragsValue');
    const zinssatzInput = document.getElementById('zinssatz');
    const zinssatzValue = document.getElementById('zinssatzValue');
    const tilgungssatzInput = document.getElementById('tilgungssatz');
    const tilgungssatzValue = document.getElementById('tilgungssatzValue');
    const laufzeitInput = document.getElementById('laufzeit');
    const laufzeitValue = document.getElementById('laufzeitValue');
    const sondertilgungInput = document.getElementById('sondertilgung');
    const sondertilgungValue = document.getElementById('sondertilgungValue');
    const sondertilgungJaehrlichInput = document.getElementById('sondertilgungJaehrlich');
    
    const monatlicheRateElement = document.getElementById('monatlicheRate');
    const berechneteJahreElement = document.getElementById('berechneteJahre');
    const gesamtkostenElement = document.getElementById('gesamtkosten');
    const gesamtzinsenElement = document.getElementById('gesamtzinsen');
    const restschuldElement = document.getElementById('restschuld');
    
    const showTilgungsplanButton = document.getElementById('showTilgungsplan');
    const tilgungsplanContainer = document.getElementById('tilgungsplanContainer');
    const tilgungsplanBody = document.getElementById('tilgungsplanBody');
    
    // Formatierungsfunktionen
    function formatCurrency(value) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    
    function formatNumber(value, digits = 2) {
        return new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(value);
    }
    
    // Initialisieren der Anzeige und setzen der Event-Listener
    updateInputValues();
    berechneFinanzierung();
    
    darlehensbetragsInput.addEventListener('input', handleInputChange);
    zinssatzInput.addEventListener('input', handleInputChange);
    tilgungssatzInput.addEventListener('input', handleInputChange);
    laufzeitInput.addEventListener('input', handleInputChange);
    sondertilgungInput.addEventListener('input', handleInputChange);
    sondertilgungJaehrlichInput.addEventListener('change', berechneFinanzierung);
    
    showTilgungsplanButton.addEventListener('click', function() {
        tilgungsplanContainer.classList.toggle('hidden');
        showTilgungsplanButton.textContent = tilgungsplanContainer.classList.contains('hidden') 
            ? 'Tilgungsplan anzeigen' 
            : 'Tilgungsplan ausblenden';
    });
    
    function handleInputChange(e) {
        updateInputValues();
        berechneFinanzierung();
    }
    
    function updateInputValues() {
        darlehensbetragsValue.textContent = formatCurrency(darlehensbetragsInput.value);
        zinssatzValue.textContent = zinssatzInput.value + '%';
        tilgungssatzValue.textContent = tilgungssatzInput.value + '%';
        laufzeitValue.textContent = laufzeitInput.value === '0' ? 'Auto' : laufzeitInput.value + ' Jahre';
        sondertilgungValue.textContent = formatCurrency(sondertilgungInput.value);
    }
    
    function berechneFinanzierung() {
        // Eingabewerte lesen
        const darlehensbetrag = parseFloat(darlehensbetragsInput.value);
        const zinssatz = parseFloat(zinssatzInput.value);
        const tilgungssatz = parseFloat(tilgungssatzInput.value);
        const laufzeit = parseInt(laufzeitInput.value);
        const sondertilgung = parseFloat(sondertilgungInput.value);
        const sondertilgungJaehrlich = sondertilgungJaehrlichInput.checked;
        
        // Umrechnung von Prozent in Dezimalzahlen
        const zinsJaehrlich = zinssatz / 100;
        const tilgungJaehrlich = tilgungssatz / 100;
        
        // Monatliche Rate berechnen (Annuitätendarlehen)
        const monatlicherZins = zinsJaehrlich / 12;
        const annuitaetJaehrlich = darlehensbetrag * (zinsJaehrlich + tilgungJaehrlich);
        const monatlicherRate = annuitaetJaehrlich / 12;
        
        // Tilgungsplan berechnen
        let restDarlehen = darlehensbetrag;
        let gesamtZinsen = 0;
        let gesamtTilgung = 0;
        let jahre = 0;
        let monate = 0;
        const plan = [];
        
        let berechnungsLaufzeit = laufzeit > 0 ? laufzeit * 12 : 1200; // Maximal 100 Jahre
        
        for (let monat = 1; monat <= berechnungsLaufzeit && restDarlehen > 0; monat++) {
            // Monatliche Zinsen
            const monatlicheZinsen = restDarlehen * monatlicherZins;
            
            // Monatliche Tilgung (Rate - Zinsen)
            let monatlicheTilgung = monatlicherRate - monatlicheZinsen;
            
            // Sondertilgung berücksichtigen
            if (sondertilgung > 0) {
                if (sondertilgungJaehrlich && monat % 12 === 0) {
                    monatlicheTilgung += sondertilgung;
                } else if (!sondertilgungJaehrlich) {
                    monatlicheTilgung += sondertilgung / 12;
                }
            }
            
            // Nicht mehr tilgen als Restschuld
            monatlicheTilgung = Math.min(monatlicheTilgung, restDarlehen);
            
            // Restschuld aktualisieren
            restDarlehen -= monatlicheTilgung;
            
            // Summen aktualisieren
            gesamtZinsen += monatlicheZinsen;
            gesamtTilgung += monatlicheTilgung;
            
            // Zeitraum aktualisieren
            monate++;
            if (monate % 12 === 0) {
                jahre++;
                
                // Jährlichen Eintrag zum Tilgungsplan hinzufügen
                plan.push({
                    jahr: jahre,
                    restschuld: restDarlehen,
                    gezahlteZinsen: gesamtZinsen,
                    gezahlteTilgung: gesamtTilgung
                });
            }
            
            // Abbruch bei nahezu vollständiger Tilgung
            if (restDarlehen < 0.01) {
                restDarlehen = 0;
                break;
            }
        }
        
        // Ergebnisse anzeigen
        monatlicheRateElement.textContent = formatCurrency(monatlicherRate);
        berechneteJahreElement.textContent = formatNumber(jahre + (monate % 12) / 12, 1) + ' Jahre';
        gesamtkostenElement.textContent = formatCurrency(darlehensbetrag + gesamtZinsen);
        gesamtzinsenElement.textContent = 'Davon Zinsen: ' + formatCurrency(gesamtZinsen);
        restschuldElement.textContent = formatCurrency(restDarlehen);
        
        // Tilgungsplan erstellen
        tilgungsplanBody.innerHTML = '';
        plan.forEach(eintrag => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-2 px-4 border">${eintrag.jahr}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(eintrag.restschuld)}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(eintrag.gezahlteZinsen)}</td>
                <td class="py-2 px-4 border text-right">${formatCurrency(eintrag.gezahlteTilgung)}</td>
            `;
            
            tilgungsplanBody.appendChild(row);
        });
    }
});
