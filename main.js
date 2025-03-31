// main.js
// Hauptskript für den BauFi-Rechner

document.addEventListener('DOMContentLoaded', function() {
    // Direkte Initialisierung - keine Abhängigkeiten von anderen Dateien

    // Globale Variablen
    window.BauFiRechner = {
        apiKey: null,
        apiProvider: null,
        datenValidiert: false,
        currentTab: 'overview',
        dataCollectionError: null // NEU: Für spezifische Fehlermeldungen
    };

    // Tab-Navigation initialisieren
    initTabNavigation();

    // Event-Listener für Navigation zwischen Tabs
    setupNavigationEvents();

    // Initialisierung der Module, wenn vorhanden
    if (typeof initObjectData === 'function') initObjectData();
    if (typeof initCostsData === 'function') initCostsData();
    if (typeof initFinancingData === 'function') initFinancingData();
    if (typeof initAnalysis === 'function') initAnalysis();


    // Datenübergreifende Änderungen überwachen
    observeDataChanges();

    // Initialen Status aktualisieren
    if (typeof updateOverview === 'function') updateOverview();

    // API-Bereich initialisieren (aus api-integration.js)
});

// Tab-Navigation - Direkte Implementation ohne externe Abhängigkeiten
function initTabNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Aktiven Tab-Link entfernen
            document.querySelectorAll('.tab-link').forEach(el => {
                el.classList.remove('active');
                // Tailwind Klassen für aktiven Tab entfernen (Beispiel, ggf. anpassen)
                 el.classList.remove('bg-white', 'border-gray-200', 'text-blue-600', 'border-b-2', 'border-blue-500');
                 el.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300'); // Standard-Stil
            });

            // Aktiven Tab-Link setzen
            this.classList.add('active');
            this.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
             this.classList.add('bg-white', 'border-gray-200', 'text-blue-600', 'border-b-2', 'border-blue-500'); // Aktiver Stil


            // Alle Tab-Inhalte ausblenden
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Aktuellen Tab-Inhalt einblenden
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');

                // Aktuellen Tab in globaler Variable speichern
                window.BauFiRechner.currentTab = targetId;
            } else {
                console.error("Target content not found for tab:", targetId);
            }
             // Scrollt zum Anfang des Tabs (optional)
             window.scrollTo({ top: targetContent.offsetTop - 150, behavior: 'smooth' }); // 150px Offset für Header/Nav
        });
    });

     // Initial den ersten Tab (oder den im Hash-Fragment) aktivieren
     const initialTab = window.location.hash ? window.location.hash.substring(1) : 'overview';
     const initialTabLink = document.querySelector(`.tab-link[data-target="${initialTab}"]`);
     if (initialTabLink) {
         initialTabLink.click(); // Simuliert einen Klick, um den Tab zu aktivieren
     } else {
         // Fallback: Ersten Tab aktivieren, wenn Hash ungültig ist
         const firstTabLink = document.querySelector('.tab-link');
         if (firstTabLink) {
            firstTabLink.click();
         }
     }
}


// Event-Listener für Navigation zwischen Tabs per Button
function setupNavigationEvents() {
    // Objekt zu Kosten
    const toCoststabBtn = document.getElementById('to-costs-tab');
    if (toCoststabBtn) {
        toCoststabBtn.addEventListener('click', function() {
            navigateToTab('costs');
        });
    }

    // Kosten zu Objekt (zurück)
    const toPropertyTabBtn = document.getElementById('to-property-tab');
    if (toPropertyTabBtn) {
        toPropertyTabBtn.addEventListener('click', function() {
            navigateToTab('property');
        });
    }

    // Kosten zu Finanzierung
    const toFinancingTabBtn = document.getElementById('to-financing-tab');
    if (toFinancingTabBtn) {
        toFinancingTabBtn.addEventListener('click', function() {
            navigateToTab('financing');
        });
    }

    // Finanzierung zu Kosten (zurück)
    const toCoststabBackBtn = document.getElementById('to-costs-tab-back');
    if (toCoststabBackBtn) {
        toCoststabBackBtn.addEventListener('click', function() {
            navigateToTab('costs');
        });
    }

    // Finanzierung zu Analyse
    const toAnalysisTabBtn = document.getElementById('to-analysis-tab');
    if (toAnalysisTabBtn) {
        toAnalysisTabBtn.addEventListener('click', function() {
            navigateToTab('analysis');
        });
    }

    // Analyse zu Finanzierung (zurück)
    const toFinancingTabBackBtn = document.getElementById('to-financing-tab-back');
    if (toFinancingTabBackBtn) {
        toFinancingTabBackBtn.addEventListener('click', function() {
            navigateToTab('financing');
        });
    }

    // API-Schlüssel-Button in der Analyse
    // Wird jetzt dynamisch in resetKiCheckInAnalyseTab (api-integration.js) erstellt und hat onclick
    // const gotoApiKeyBtn = document.getElementById('goto-api-key'); // Nicht mehr statisch

    // Rechner zurücksetzen
    const resetCalculatorBtn = document.getElementById('reset-calculator');
    if (resetCalculatorBtn) {
        resetCalculatorBtn.addEventListener('click', function() {
            if (confirm("Möchten Sie wirklich alle Eingaben zurücksetzen?")) {
                 window.location.reload(); // Einfachste Methode: Seite neu laden
            }
        });
    }
}

// Zu einem Tab navigieren - robuste Implementierung
function navigateToTab(tabId) {
    // Tab aktivieren
    const tabLink = document.querySelector(`.tab-link[data-target="${tabId}"]`);
    if (tabLink) {
        // Manuell das Klick-Event auslösen, um die Logik in initTabNavigation zu nutzen
        tabLink.click();
    } else {
         console.error(`Tab link with target "${tabId}" not found.`);
    }
}

// Änderungen in Daten beobachten (übergreifend)
function observeDataChanges() {
    // Event Listener für relevante Eingabefelder hinzufügen,
    // die Aktualisierungen in mehreren Bereichen auslösen
    const inputsToObserve = [
        'kaufpreis', 'wohnflaeche', 'eigenkapital', 'foerdermittel',
        'modernisierungskosten', 'moebel_kosten', 'umzugskosten', 'sonstige_kosten',
        'grunderwerbsteuer_prozent', 'notar_prozent', 'makler_prozent',
        'objekttyp', 'nutzungsart', 'plz', 'ort', 'bundesland', 'lage', 'baujahr', 'zustand', // Objekt-Felder für Übersicht
        'monatliches-haushaltsnettoeinkommen', 'monatliche-kreditraten', 'anzahl-kinder' // Haushaltsdaten
    ];

    inputsToObserve.forEach(inputId => {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            const eventType = (inputElement.tagName === 'SELECT') ? 'change' : 'input';
            inputElement.addEventListener(eventType, () => {
                 // Rufen Sie die relevanten Update-Funktionen auf
                 if (typeof updateKaufpreisQm === 'function') updateKaufpreisQm();
                 if (typeof updateKaufnebenkosten === 'function') updateKaufnebenkosten();
                 if (typeof updateGesamtkosten === 'function') updateGesamtkosten();
                 if (typeof updateFinanzierungsstruktur === 'function') updateFinanzierungsstruktur(); // Stellt sicher, dass Kostenänderungen die Finanzierung aktualisieren
                 if (typeof updateEigenkapitalBerechnung === 'function') updateEigenkapitalBerechnung(); // Stellt sicher, dass Kostenänderungen die EK-Quote etc. aktualisieren
                 if (typeof updateOverview === 'function') updateOverview();
            });
        }
    });

     // Spezielle Beobachtung für Darlehensänderungen (da sie dynamisch sind)
     const darlehenContainer = document.getElementById('darlehen-container');
     if (darlehenContainer) {
         // Verwende Event Delegation, da Darlehen hinzugefügt/entfernt werden
         darlehenContainer.addEventListener('input', (event) => {
             // Prüfen, ob das Event von einem relevanten Input/Select innerhalb eines Darlehensblocks stammt
             if (event.target.closest('.darlehen-block') && (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT')) {
                  // Update-Funktionen aufrufen, die von Darlehensänderungen abhängen
                  if (typeof updateFinanzierungsSumme === 'function') updateFinanzierungsSumme();
                  if (typeof updateOverview === 'function') updateOverview();
                  // Tilgungsplan muss ggf. auch aktualisiert werden, wenn er sichtbar ist
                  updateTilgungsplanVisibility(); // Nutzt interne Prüfung in financing.js
             }
         });
          // Beobachte auch Checkboxen/Selects (change event)
          darlehenContainer.addEventListener('change', (event) => {
             if (event.target.closest('.darlehen-block') && (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT')) {
                   if (typeof updateFinanzierungsSumme === 'function') updateFinanzierungsSumme();
                   if (typeof updateOverview === 'function') updateOverview();
                    updateTilgungsplanVisibility();
             }
          });
          // Beobachte auch Klicks auf "Entfernen"-Buttons
          darlehenContainer.addEventListener('click', (event) => {
              if (event.target.closest('.darlehen-remove')) {
                   // Kurze Verzögerung, damit das Entfernen abgeschlossen ist, bevor aktualisiert wird
                   setTimeout(() => {
                       if (typeof updateFinanzierungsSumme === 'function') updateFinanzierungsSumme();
                       if (typeof updateOverview === 'function') updateOverview();
                       updateTilgungsplanVisibility();
                   }, 50); // 50ms Verzögerung
              }
          });
     }

     // Beobachtung für Nutzungsart (relevant für Mietrendite etc.)
     const nutzungsartSelect = document.getElementById('nutzungsart');
     if (nutzungsartSelect) {
         nutzungsartSelect.addEventListener('change', () => {
             if (typeof updateOverview === 'function') updateOverview();
             // Ggf. weitere spezifische Updates für Kapitalanlage-Felder in costs.js triggern
              if (typeof initCostsData === 'function') {
                  // Workaround: updateMietrendite wird innerhalb von initCostsData registriert
                  const kaufpreisInput = document.getElementById('kaufpreis');
                  const kaltmieteInput = document.getElementById('kaltmiete');
                  const mietrenditeOutput = document.getElementById('mietrendite');
                   // Prüfen ob die Funktion global verfügbar ist oder direkt aufgerufen werden kann
                   // Wir gehen davon aus, dass die Funktion updateMietrendite durch die EventListener in costs.js getriggert wird,
                   // wenn sich kaufpreis oder kaltmiete ändern. Ein expliziter Aufruf hier ist ggf. nicht nötig oder doppelt.
                   // Wichtig ist, dass die Sichtbarkeit der Felder korrekt gesteuert wird (object.js).
              }
         });
     }
}


// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    // Prüfen, ob der Wert gültig ist
    if (isNaN(value) || value === null || value === undefined) {
        return '-'; // Oder einen anderen Platzhalter zurückgeben
    }
    // Bei sehr kleinen Werten (z.B. Rundungsfehler nahe 0), zeige 0 an
    if (Math.abs(value) < 0.01) {
        value = 0;
    }
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

// Formatierungsfunktion für Prozentsätze
function formatPercent(value) {
     // Prüfen, ob der Wert gültig ist
     if (isNaN(value) || value === null || value === undefined) {
         return '-'; // Oder einen anderen Platzhalter zurückgeben
     }
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    }).format(value / 100);
}


// Funktion zur Aktualisierung der Übersicht (Beispielimplementierung)
function updateOverview() {
     // Diese Funktion sollte Daten aus allen Bereichen sammeln und im Übersicht-Tab anzeigen
     console.log("Updating overview..."); // Debug-Ausgabe

     // Objektdaten holen
     const objekttyp = document.getElementById('objekttyp')?.value || '-';
     const ort = document.getElementById('ort')?.value || '';
     const plz = document.getElementById('plz')?.value || '';
     const standort = (plz || ort) ? `${plz} ${ort}`.trim() : '-';
     let wohnflaecheVal = parseFloat(document.getElementById('wohnflaeche')?.value) || 0;
     const wohnflaeche = wohnflaecheVal > 0 ? wohnflaecheVal + ' m²' : '-';
     const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;

     // Finanzierungsdaten holen (verwende sichere Methoden, die NaN/null handhaben)
     let darlehenSumme = 0;
     const darlehenSummeElement = document.getElementById('darlehen_summe');
     if (darlehenSummeElement) {
        darlehenSumme = parseFloat(darlehenSummeElement.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
     }
     const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value) || 0;
      let rateSumme = 0;
      const rateSummeElement = document.getElementById('rate_summe');
      if (rateSummeElement) {
          rateSumme = parseFloat(rateSummeElement.textContent?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
      }


     // Zinsbindung (komplexer, da mehrere Darlehen möglich) - hier vereinfacht das erste Darlehen
     const ersteZinsbindungInput = document.querySelector('#darlehen-1 .darlehen-zinsbindung');
     const ersteZinsbindung = ersteZinsbindungInput?.value;
     const zinsbindungText = ersteZinsbindung ? ersteZinsbindung + ' Jahre' : '-';

     // Übersicht aktualisieren
     document.getElementById('overview-objekttyp').textContent = objekttyp;
     document.getElementById('overview-standort').textContent = standort;
     document.getElementById('overview-wohnflaeche').textContent = wohnflaeche;
     document.getElementById('overview-kaufpreis').textContent = formatCurrency(kaufpreis);

     document.getElementById('overview-darlehenssumme').textContent = formatCurrency(darlehenSumme);
     document.getElementById('overview-eigenkapital').textContent = formatCurrency(eigenkapital);
     document.getElementById('overview-rate').textContent = formatCurrency(rateSumme);
     document.getElementById('overview-zinsbindung').textContent = zinsbindungText;

     // Schnellanalyse aktualisieren (Beispiel)
     const quickAnalysisDiv = document.getElementById('quick-analysis');
     const gesamtkostenText = document.getElementById('fs_gesamtkosten')?.textContent || '0';
     const gesamtkosten = parseFloat(gesamtkostenText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

     if (kaufpreis > 0 && gesamtkosten > 0 && darlehenSumme > 0 && rateSumme > 0) {
         const ekQuoteVal = (eigenkapital / gesamtkosten) * 100; // EK-Quote hier neu berechnen
         const ekQuote = formatPercent(ekQuoteVal); // Formatieren
         quickAnalysisDiv.innerHTML = `
             <p>Basierend auf Ihren Eingaben finanzieren Sie eine Immobilie für ${formatCurrency(kaufpreis)} (Gesamtkosten: ${formatCurrency(gesamtkosten)}) mit ${formatCurrency(darlehenSumme)} Darlehensvolumen.</p>
             <p>Ihre monatliche Gesamtbelastung beträgt ${formatCurrency(rateSumme)} bei einer Eigenkapitalquote von ca. ${ekQuote}.</p>
             <p class="${ekQuoteVal < 15 ? 'text-red-600 font-semibold' : 'text-green-600'}">
                 ${ekQuoteVal < 15 ? '<i class="fas fa-exclamation-triangle mr-1"></i> Hinweis: Die Eigenkapitalquote ist relativ niedrig.' : '<i class="fas fa-check-circle mr-1"></i> Die Eigenkapitalquote scheint solide.'}
             </p>
             <button onclick="navigateToTab('analysis')" class="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition">Zur Detailanalyse</button>
         `;
     } else {
         quickAnalysisDiv.textContent = 'Füllen Sie die Objektdaten, Kosten und Finanzierungsdetails aus, um eine automatische Schnellanalyse zu erhalten.';
     }
 }

 // Sicherstellen, dass alle Initialisierungen nach dem Laden des DOM erfolgen
 // Das ist durch den DOMContentLoaded-Listener am Anfang abgedeckt.
