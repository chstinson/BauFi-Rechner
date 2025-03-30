// main.js
// Hauptskript für den BauFi-Rechner

document.addEventListener('DOMContentLoaded', function() {
    // Direkte Initialisierung - keine Abhängigkeiten von anderen Dateien

    // Globale Variablen
    window.BauFiRechner = {
        apiKey: null,
        apiProvider: null,
        datenValidiert: false,
        currentTab: 'overview'
    };

    // Tab-Navigation initialisieren
    initTabNavigation();

    // --- ENTFERNT --- : Redundante API-Integration Initialisierung hier entfernt.
    // Die Initialisierung erfolgt korrekt über DOMContentLoaded in api-integration.js

    // Event-Listener für Navigation zwischen Tabs
    setupNavigationEvents();

    // Initialisierung der Module, wenn vorhanden
    // Diese sollten idealerweise auch über DOMContentLoaded in ihren jeweiligen Dateien erfolgen,
    // aber wir lassen sie hier vorerst, falls es Abhängigkeiten gibt.
    if (typeof initObjectData === 'function') initObjectData();
    if (typeof initCostsData === 'function') initCostsData();
    if (typeof initFinancingData === 'function') initFinancingData();
    // Die Analyse-Initialisierung sollte idealerweise auch in analysis.js erfolgen
    if (typeof initAnalysis === 'function') initAnalysis();


    // Datenübergreifende Änderungen überwachen
    observeDataChanges();

    // Initialen Status aktualisieren
    if (typeof updateOverview === 'function') updateOverview();

    // --- ENTFERNT --- : Redundanter API-Toggle Event-Listener hier entfernt.
    // Der Listener wird korrekt in api-integration.js hinzugefügt.

    // Beim Laden der Seite prüfen, ob ein API-Bereich initial den richtigen Status hat
    // (Dies wird jetzt auch von api-integration.js übernommen)
    const apiContent = document.getElementById('api-content');
    const apiToggleIcon = document.getElementById('api-toggle-icon');

    // Standardmäßig ausgeklappt (wird in api-integration.js gesetzt)
    if (apiContent && apiContent.style.display !== 'none' && apiToggleIcon) {
        // Sicherstellen, dass das Icon korrekt ist, falls es nicht durch api-integration.js gesetzt wurde
         if (!apiToggleIcon.classList.contains('fa-chevron-down')) {
             apiToggleIcon.classList.remove('fa-chevron-up');
             apiToggleIcon.classList.add('fa-chevron-down');
         }
    } else if (apiContent && apiContent.style.display === 'none' && apiToggleIcon) {
        // Sicherstellen, dass das Icon korrekt ist, falls es eingeklappt ist
        if (!apiToggleIcon.classList.contains('fa-chevron-up')) {
             apiToggleIcon.classList.remove('fa-chevron-down');
             apiToggleIcon.classList.add('fa-chevron-up');
         }
    }
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
    const gotoApiKeyBtn = document.getElementById('goto-api-key');
    if (gotoApiKeyBtn) {
        gotoApiKeyBtn.addEventListener('click', function() {
            // Scrolle zum API-Container
            const apiContainer = document.getElementById('api-global-container');
            if (apiContainer) {
                 apiContainer.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start' // Scrollt zum oberen Rand des Elements
                 });
                 // Optional: API-Bereich aufklappen, falls er zu ist
                 const apiContent = document.getElementById('api-content');
                 if (apiContent && apiContent.style.display === 'none') {
                     if(typeof toggleApiSection === 'function') {
                        toggleApiSection();
                     }
                 }
            }
        });
    }

    // Rechner zurücksetzen
    const resetCalculatorBtn = document.getElementById('reset-calculator');
    if (resetCalculatorBtn) {
        resetCalculatorBtn.addEventListener('click', function() {
            if (confirm("Möchten Sie wirklich alle Eingaben zurücksetzen?")) {
                // Hier eine Funktion aufrufen, die den Reset durchführt
                 // resetCalculator(); // Diese Funktion muss implementiert werden
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
        'grunderwerbsteuer_prozent', 'notar_prozent', 'makler_prozent'
        // Fügen Sie weitere IDs hinzu, falls nötig
    ];

    inputsToObserve.forEach(inputId => {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.addEventListener('input', () => {
                 // Rufen Sie die relevanten Update-Funktionen auf
                 // Diese sollten idealerweise prüfen, ob sie benötigt werden
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
             // Prüfen, ob das Event von einem relevanten Input innerhalb eines Darlehensblocks stammt
             if (event.target.closest('.darlehen-block') && (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT')) {
                  // Update-Funktionen aufrufen, die von Darlehensänderungen abhängen
                  if (typeof updateFinanzierungsSumme === 'function') updateFinanzierungsSumme();
                  if (typeof updateOverview === 'function') updateOverview();
                  // Tilgungsplan muss ggf. auch aktualisiert werden, wenn er sichtbar ist
                  const tilgungsplanContainer = document.getElementById('tilgungsplanContainerAnalyse');
                  if (tilgungsplanContainer && !tilgungsplanContainer.classList.contains('hidden') && typeof updateTilgungsplan === 'function') {
                      updateTilgungsplan();
                  }
             }
         });
          // Beobachte auch Klicks auf "Entfernen"-Buttons
          darlehenContainer.addEventListener('click', (event) => {
              if (event.target.closest('.darlehen-remove')) {
                   // Kurze Verzögerung, damit das Entfernen abgeschlossen ist, bevor aktualisiert wird
                   setTimeout(() => {
                       if (typeof updateFinanzierungsSumme === 'function') updateFinanzierungsSumme();
                       if (typeof updateOverview === 'function') updateOverview();
                           const tilgungsplanContainer = document.getElementById('tilgungsplanContainerAnalyse');
                           if (tilgungsplanContainer && !tilgungsplanContainer.classList.contains('hidden') && typeof updateTilgungsplan === 'function') {
                               updateTilgungsplan();
                           }
                   }, 50); // 50ms Verzögerung
              }
          });
     }

     // Beobachtung für Nutzungsart (relevant für Mietrendite etc.)
     const nutzungsartSelect = document.getElementById('nutzungsart');
     if (nutzungsartSelect) {
         nutzungsartSelect.addEventListener('change', () => {
             if (typeof updateOverview === 'function') updateOverview();
             // Ggf. weitere spezifische Updates für Kapitalanlage-Felder
         });
     }
}


// --- ENTFERNT --- : Redundante API-Integration Funktionen hier entfernt.
// Diese befinden sich jetzt ausschließlich in api-integration.js


// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    // Prüfen, ob der Wert gültig ist
    if (isNaN(value) || value === null) {
        return '-'; // Oder einen anderen Platzhalter zurückgeben
    }
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

// Formatierungsfunktion für Prozentsätze
function formatPercent(value) {
     // Prüfen, ob der Wert gültig ist
     if (isNaN(value) || value === null) {
         return '-'; // Oder einen anderen Platzhalter zurückgeben
     }
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    }).format(value / 100);
}

// --- ENTFERNT --- : Redundante toggleApiSection Funktion hier entfernt.
// Diese befindet sich jetzt ausschließlich in api-integration.js


// Funktion zur Aktualisierung der Übersicht (Beispielimplementierung)
function updateOverview() {
     // Diese Funktion sollte Daten aus allen Bereichen sammeln und im Übersicht-Tab anzeigen
     console.log("Updating overview..."); // Debug-Ausgabe

     // Objektdaten holen
     const objekttyp = document.getElementById('objekttyp')?.value || '-';
     const ort = document.getElementById('ort')?.value || '';
     const plz = document.getElementById('plz')?.value || '';
     const standort = (plz || ort) ? `${plz} ${ort}`.trim() : '-';
     const wohnflaeche = document.getElementById('wohnflaeche')?.value ? document.getElementById('wohnflaeche').value + ' m²' : '-';
     const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;

     // Finanzierungsdaten holen
     const darlehenSumme = parseFloat(document.getElementById('darlehen_summe')?.textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
     const eigenkapital = parseFloat(document.getElementById('eigenkapital')?.value) || 0;
     const rateSumme = parseFloat(document.getElementById('rate_summe')?.textContent.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

     // Zinsbindung (komplexer, da mehrere Darlehen möglich) - hier vereinfacht das erste Darlehen
     const ersteZinsbindung = document.querySelector('#darlehen-1 .darlehen-zinsbindung')?.value;
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
     if (kaufpreis > 0 && darlehenSumme > 0 && rateSumme > 0) {
         const ekQuote = parseFloat(document.getElementById('eigenkapital_quote')?.textContent.replace('%','')) || 0;
         quickAnalysisDiv.innerHTML = `
             <p>Basierend auf Ihren Eingaben finanzieren Sie eine Immobilie für ${formatCurrency(kaufpreis)} mit ${formatCurrency(darlehenSumme)} Darlehensvolumen.</p>
             <p>Ihre monatliche Gesamtbelastung beträgt ${formatCurrency(rateSumme)} bei einer Eigenkapitalquote von ${ekQuote.toFixed(1)}%.</p>
             <p class="${ekQuote < 15 ? 'text-red-600' : 'text-green-600'}">
                 ${ekQuote < 15 ? 'Hinweis: Die Eigenkapitalquote ist relativ niedrig.' : 'Die Eigenkapitalquote scheint solide.'}
             </p>
             <button onclick="navigateToTab('analysis')" class="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition">Zur Detailanalyse</button>
         `;
     } else {
         quickAnalysisDiv.textContent = 'Füllen Sie die Objektdaten und Finanzierungsdetails aus, um eine automatische Analyse zu erhalten.';
     }
 }

 // Sicherstellen, dass alle Initialisierungen nach dem Laden des DOM erfolgen
 // Das ist durch den DOMContentLoaded-Listener am Anfang abgedeckt.
