// main.js
// Hauptskript für den BauFi-Rechner

document.addEventListener('DOMContentLoaded', function() {
    // Globale Variablen
    window.BauFiRechner = {
        apiKey: null,
        apiProvider: null,
        datenValidiert: false,
        currentTab: 'overview'
    };
    
    // Tab-Navigation initialisieren
    initTabNavigation();
    
    // API-Integration initialisieren
    initAPIIntegration();
    
    // Event-Listener für Navigation zwischen Tabs
    setupNavigationEvents();
    
    // Initialisierung der Module
    initObjectData();
    initCostsData();
    initFinancingData();
    initAnalysis();
    
    // Datenübergreifende Änderungen überwachen
    observeDataChanges();
    
    // Initialen Status aktualisieren
    updateOverview();
});

// Tab-Navigation
function initTabNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Aktiven Tab-Link entfernen
            document.querySelectorAll('.tab-link').forEach(el => {
                el.classList.remove('active');
                el.classList.remove('bg-white');
                el.classList.remove('border-t');
                el.classList.remove('border-l');
                el.classList.remove('border-r');
                el.classList.remove('border-gray-200');
            });
            
            // Aktiven Tab-Link setzen
            link.classList.add('active');
            link.classList.add('bg-white');
            link.classList.add('border-t');
            link.classList.add('border-l');
            link.classList.add('border-r');
            link.classList.add('border-gray-200');
            
            // Alle Tab-Inhalte ausblenden
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Aktuellen Tab-Inhalt einblenden
            const targetId = link.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            targetContent.classList.remove('hidden');
            
            // Aktuellen Tab in globaler Variable speichern
            window.BauFiRechner.currentTab = targetId;
        });
    });
}

// Event-Listener für Navigation zwischen Tabs per Button
function setupNavigationEvents() {
    // Objekt zu Kosten
    document.getElementById('to-costs-tab').addEventListener('click', () => {
        navigateToTab('costs');
    });
    
    // Kosten zu Objekt (zurück)
    document.getElementById('to-property-tab').addEventListener('click', () => {
        navigateToTab('property');
    });
    
    // Kosten zu Finanzierung
    document.getElementById('to-financing-tab').addEventListener('click', () => {
        navigateToTab('financing');
    });
    
    // Finanzierung zu Kosten (zurück)
    document.getElementById('to-costs-tab-back').addEventListener('click', () => {
        navigateToTab('costs');
    });
    
    // Finanzierung zu Analyse
    document.getElementById('to-analysis-tab').addEventListener('click', () => {
        navigateToTab('analysis');
    });
    
    // Analyse zu Finanzierung (zurück)
    document.getElementById('to-financing-tab-back').addEventListener('click', () => {
        navigateToTab('financing');
    });
    
    // API-Schlüssel-Button in der Analyse
    document.getElementById('goto-api-key').addEventListener('click', () => {
        // Scrolle zum API-Container
        document.getElementById('api-global-container').scrollIntoView({
            behavior: 'smooth'
        });
    });
    
    // Rechner zurücksetzen
    document.getElementById('reset-calculator').addEventListener('click', resetCalculator);
}

// Zu einem Tab navigieren
function navigateToTab(tabId) {
    // Tab aktivieren
    const tabLink = document.querySelector(`.tab-link[data-target="${tabId}"]`);
    if (tabLink) {
        tabLink.click();
    }
}

// Änderungen in Daten beobachten (übergreifend)
function observeDataChanges() {
    // Wohnfläche aktualisiert Kaufpreis pro m²
    const wohnflaecheInput = document.getElementById('wohnflaeche');
    const kaufpreisInput = document.getElementById('kaufpreis');
    
    if (wohnflaecheInput && kaufpreisInput) {
        wohnflaecheInput.addEventListener('input', () => {
            updateKaufpreisQm();
            updateOverview();
        });
        
        kaufpreisInput.addEventListener('input', () => {
            updateKaufpreisQm();
            updateKaufnebenkosten();
            updateGesamtkosten();
            updateOverview();
        });
    }
}

// Kaufpreis pro m² berechnen
function updateKaufpreisQm() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche').value) || 0;
    const kaufpreisQmOutput = document.getElementById('kaufpreis_qm');
    
    if (kaufpreis && wohnflaeche) {
        const preisProQm = kaufpreis / wohnflaeche;
        kaufpreisQmOutput.textContent = formatCurrency(preisProQm);
    } else {
        kaufpreisQmOutput.textContent = '-';
    }
}

// Übersicht aktualisieren
function updateOverview() {
    // Objektdaten
    document.getElementById('overview-objekttyp').textContent = document.getElementById('objekttyp').value || '-';
    
    const plz = document.getElementById('plz').value || '';
    const ort = document.getElementById('ort').value || '';
    document.getElementById('overview-standort').textContent = plz && ort ? `${plz} ${ort}` : '-';
    
    const wohnflaeche = document.getElementById('wohnflaeche').value || '';
    document.getElementById('overview-wohnflaeche').textContent = wohnflaeche ? `${wohnflaeche} m²` : '-';
    
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    document.getElementById('overview-kaufpreis').textContent = kaufpreis ? formatCurrency(kaufpreis) : '-';
    
    // Finanzierungsdaten
    const darlehenSumme = calculateDarlehenSumme();
    document.getElementById('overview-darlehenssumme').textContent = darlehenSumme > 0 ? formatCurrency(darlehenSumme) : '-';
    
    const eigenkapital = parseFloat(document.getElementById('eigenkapital').value) || 0;
    document.getElementById('overview-eigenkapital').textContent = eigenkapital > 0 ? formatCurrency(eigenkapital) : '-';
    
    // Monatliche Rate aus der Finanzierung
    const rateSumme = calculateRateSumme();
    document.getElementById('overview-rate').textContent = rateSumme > 0 ? formatCurrency(rateSumme) : '-';
    
    // Zinsbindung (Durchschnitt der Darlehen)
    const zinsbindungAvg = calculateAverageZinsbindung();
    document.getElementById('overview-zinsbindung').textContent = zinsbindungAvg > 0 ? `${zinsbindungAvg} Jahre` : '-';
    
    // Schnellanalyse aktualisieren
    updateQuickAnalysis();
}

// Schnellanalyse aktualisieren
function updateQuickAnalysis() {
    const quickAnalysisElement = document.getElementById('quick-analysis');
    
    // Prüfen, ob genug Daten für eine Schnellanalyse vorhanden sind
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    const eigenkapital = parseFloat(document.getElementById('eigenkapital').value) || 0;
    const darlehenSumme = calculateDarlehenSumme();
    
    if (kaufpreis > 0 && darlehenSumme > 0) {
        // Berechnung der Eigenkapitalquote
        const eigenkapitalQuote = (eigenkapital / kaufpreis) * 100;
        
        // Berechnung des Beleihungsauslaufs
        const beleihungsauslauf = (darlehenSumme / kaufpreis) * 100;
        
        // Durchschnittlicher Zinssatz
        const avgZins = calculateAverageZins();
        
        // Durchschnittliche Tilgung
        const avgTilgung = calculateAverageTilgung();
        
        // Schnellanalyse-Text erstellen
        let analyseText = '<div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">';
        
        // Eigenkapitalquote bewerten
        analyseText += `<div><span class="font-medium">Eigenkapitalquote:</span> ${eigenkapitalQuote.toFixed(1)}%`;
        if (eigenkapitalQuote < 10) {
            analyseText += ' <span class="text-red-600">(sehr niedrig)</span>';
        } else if (eigenkapitalQuote < 20) {
            analyseText += ' <span class="text-yellow-600">(niedrig)</span>';
        } else if (eigenkapitalQuote > 40) {
            analyseText += ' <span class="text-green-600">(sehr gut)</span>';
        } else {
            analyseText += ' <span class="text-green-600">(gut)</span>';
        }
        analyseText += '</div>';
        
        // Beleihungsauslauf bewerten
        analyseText += `<div><span class="font-medium">Beleihungsauslauf:</span> ${beleihungsauslauf.toFixed(1)}%`;
        if (beleihungsauslauf > 90) {
            analyseText += ' <span class="text-red-600">(sehr hoch)</span>';
        } else if (beleihungsauslauf > 80) {
            analyseText += ' <span class="text-yellow-600">(hoch)</span>';
        } else {
            analyseText += ' <span class="text-green-600">(gut)</span>';
        }
        analyseText += '</div>';
        
        // Zinssatz bewerten
        if (avgZins > 0) {
            analyseText += `<div><span class="font-medium">Zinssatz:</span> ${avgZins.toFixed(2)}%`;
            if (avgZins > 4.5) {
                analyseText += ' <span class="text-red-600">(hoch)</span>';
            } else if (avgZins > 3.8) {
                analyseText += ' <span class="text-yellow-600">(etwas erhöht)</span>';
            } else {
                analyseText += ' <span class="text-green-600">(marktüblich)</span>';
            }
            analyseText += '</div>';
        }
        
        // Tilgung bewerten
        if (avgTilgung > 0) {
            analyseText += `<div><span class="font-medium">Tilgung:</span> ${avgTilgung.toFixed(2)}%`;
            if (avgTilgung < 1.5) {
                analyseText += ' <span class="text-red-600">(sehr niedrig)</span>';
            } else if (avgTilgung < 2.5) {
                analyseText += ' <span class="text-yellow-600">(niedrig)</span>';
            } else {
                analyseText += ' <span class="text-green-600">(gut)</span>';
            }
            analyseText += '</div>';
        }
        
        analyseText += '</div>';
        
        // Gesamtbewertung
        analyseText += '<p class="font-medium">Gesamtbewertung: ';
        
        let riskScore = 0;
        
        // Risikofaktoren
        if (eigenkapitalQuote < 10) riskScore += 2;
        else if (eigenkapitalQuote < 20) riskScore += 1;
        
        if (beleihungsauslauf > 90) riskScore += 2;
        else if (beleihungsauslauf > 80) riskScore += 1;
        
        if (avgZins > 4.5) riskScore += 2;
        else if (avgZins > 3.8) riskScore += 1;
        
        if (avgTilgung < 1.5) riskScore += 2;
        else if (avgTilgung < 2.5) riskScore += 1;
        
        // Bewertung basierend auf Risikopunkten
        if (riskScore >= 6) {
            analyseText += '<span class="text-red-600">Risikoreiche Finanzierung</span>';
        } else if (riskScore >= 3) {
            analyseText += '<span class="text-yellow-600">Finanzierung mit Optimierungspotenzial</span>';
        } else {
            analyseText += '<span class="text-green-600">Solide Finanzierungsstruktur</span>';
        }
        
        analyseText += '</p>';
        
        quickAnalysisElement.innerHTML = analyseText;
    } else {
        quickAnalysisElement.innerHTML = 'Füllen Sie die Objektdaten und Finanzierungsdetails aus, um eine automatische Analyse zu erhalten.';
    }
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

// Gesamtsumme aller monatlichen Raten berechnen
function calculateRateSumme() {
    let summe = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        
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
}

// Durchschnittliche Zinsbindung berechnen
function calculateAverageZinsbindung() {
    let summe = 0;
    let count = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        
        darlehenBlocks.forEach(block => {
            const zinsbindungInput = block.querySelector('.darlehen-zinsbindung');
            if (zinsbindungInput && parseFloat(zinsbindungInput.value) > 0) {
                summe += parseFloat(zinsbindungInput.value) || 0;
                count++;
            }
        });
    }
    
    return count > 0 ? Math.round(summe / count) : 0;
}

// Durchschnittlichen Zinssatz berechnen
function calculateAverageZins() {
    let gewichteteSumme = 0;
    let darlehensSumme = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        
        darlehenBlocks.forEach(block => {
            const betragInput = block.querySelector('.darlehen-betrag');
            const zinsInput = block.querySelector('.darlehen-zins');
            
            if (betragInput && zinsInput) {
                const betrag = parseFloat(betragInput.value) || 0;
                const zins = parseFloat(zinsInput.value) || 0;
                
                gewichteteSumme += betrag * zins;
                darlehensSumme += betrag;
            }
        });
    }
    
    return darlehensSumme > 0 ? gewichteteSumme / darlehensSumme : 0;
}

// Durchschnittliche Tilgung berechnen
function calculateAverageTilgung() {
    let gewichteteSumme = 0;
    let darlehensSumme = 0;
    const darlehenContainer = document.getElementById('darlehen-container');
    
    if (darlehenContainer) {
        const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
        
        darlehenBlocks.forEach(block => {
            const betragInput = block.querySelector('.darlehen-betrag');
            const tilgungInput = block.querySelector('.darlehen-tilgung');
            
            if (betragInput && tilgungInput) {
                const betrag = parseFloat(betragInput.value) || 0;
                const tilgung = parseFloat(tilgungInput.value) || 0;
                
                gewichteteSumme += betrag * tilgung;
                darlehensSumme += betrag;
            }
        });
    }
    
    return darlehensSumme > 0 ? gewichteteSumme / darlehensSumme : 0;
}

// Rechner zurücksetzen
function resetCalculator() {
    if (confirm('Möchten Sie wirklich alle eingegebenen Daten zurücksetzen?')) {
        // Formularfelder zurücksetzen
        document.querySelectorAll('input[type="text"], input[type="number"], select').forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = input.defaultValue || '';
            }
        });
        
        // Range-Slider zurücksetzen
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.value = slider.defaultValue || 0;
        });
        
        // Checkboxen zurücksetzen
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Berechnete Werte zurücksetzen
        document.querySelectorAll('[id$="_qm"], [id$="_absolut"], [id$="_quote"], [id$="summe"], [id$="gesamt"]').forEach(element => {
            element.textContent = '-';
        });
        
        // Zurück zum Übersichtsfenster
        navigateToTab('overview');
        
        // Alle Darlehen bis auf das erste löschen
        const darlehenContainer = document.getElementById('darlehen-container');
        if (darlehenContainer) {
            const darlehenBlocks = darlehenContainer.querySelectorAll('.darlehen-block');
            
            // Alle außer dem ersten Block entfernen
            for (let i = 1; i < darlehenBlocks.length; i++) {
                darlehenBlocks[i].remove();
            }
            
            // Ersten Block auf Standardwerte zurücksetzen
            if (darlehenBlocks.length > 0) {
                const firstBlock = darlehenBlocks[0];
                
                firstBlock.querySelector('.darlehen-betrag').value = '300000';
                firstBlock.querySelector('.darlehen-betrag-slider').value = '300000';
                firstBlock.querySelector('.darlehen-zins').value = '3.5';
                firstBlock.querySelector('.darlehen-zins-slider').value = '3.5';
                firstBlock.querySelector('.darlehen-tilgung').value = '2.0';
                firstBlock.querySelector('.darlehen-tilgung-slider').value = '2.0';
                firstBlock.querySelector('.darlehen-zinsbindung').value = '10';
                firstBlock.querySelector('.darlehen-zinsbindung-slider').value = '10';
                
                const rateElement = firstBlock.querySelector('.darlehen-rate');
                if (rateElement) rateElement.textContent = '-';
                
                const restschuldElement = firstBlock.querySelector('.darlehen-restschuld');
                if (restschuldElement) restschuldElement.textContent = '-';
            }
        }
        
        // Übersicht aktualisieren
        updateOverview();
        
        alert('Der Rechner wurde zurückgesetzt.');
    }
}

// API-Integration
function initAPIIntegration() {
    // Provider-Auswahl
    document.getElementById('openai-provider').addEventListener('click', () => {
        selectProvider('openai');
    });
    
    document.getElementById('anthropic-provider').addEventListener('click', () => {
        selectProvider('anthropic');
    });
    
    document.getElementById('deepseek-provider').addEventListener('click', () => {
        selectProvider('deepseek');
    });
    
    // API-Schlüssel validieren
    document.getElementById('validate-global-api').addEventListener('click', () => {
        // Diese Funktion ruft die validateGlobalApiKey-Funktion aus analysis.js auf
        // Da wir keinen direkten Import haben, prüfen wir zuerst, ob die Funktion existiert
        if (typeof validateGlobalApiKey === 'function') {
            validateGlobalApiKey();
        } else {
            console.error('validateGlobalApiKey ist nicht definiert. Bitte stellen Sie sicher, dass analysis.js vor main.js geladen wird.');
            alert('Fehler bei der API-Validierung. Bitte laden Sie die Seite neu.');
        }
    });
}

// Provider auswählen
function selectProvider(providerId) {
    window.BauFiRechner.apiProvider = providerId;
    
    // UI aktualisieren
    document.querySelectorAll('#openai-provider, #anthropic-provider, #deepseek-provider').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    document.getElementById(`${providerId}-provider`).classList.add('border-blue-500', 'bg-blue-50');
    
    let providerLabel = 'API-Schlüssel';
    if (providerId === 'openai') {
        providerLabel = 'OpenAI API-Schlüssel';
    } else if (providerId === 'anthropic') {
        providerLabel = 'Claude API-Schlüssel';
    } else if (providerId === 'deepseek') {
        providerLabel = 'DeepSeek API-Schlüssel';
    }
    
    document.getElementById('api-provider-label').textContent = providerLabel;
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

// Formatierungsfunktion für Prozentsätze
function formatPercent(value) {
    return new Intl.NumberFormat('de-DE', { 
        style: 'percent', 
        minimumFractionDigits: 1,
        maximumFractionDigits: 2 
    }).format(value / 100);
}
