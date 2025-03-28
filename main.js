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
    
    // API-Integration initialisieren
    initAPIIntegration();
    
    // Event-Listener für Navigation zwischen Tabs
    setupNavigationEvents();
    
    // Initialisierung der Module, wenn vorhanden
    if (typeof initObjectData === 'function') initObjectData();
    if (typeof initCostsData === 'function') initCostsData();
    if (typeof initFinancingData === 'function') initFinancingData();
    
    // Datenübergreifende Änderungen überwachen
    observeDataChanges();
    
    // Initialen Status aktualisieren
    if (typeof updateOverview === 'function') updateOverview();
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
                el.classList.remove('bg-white');
                el.classList.remove('border-t');
                el.classList.remove('border-l');
                el.classList.remove('border-r');
                el.classList.remove('border-gray-200');
            });
            
            // Aktiven Tab-Link setzen
            this.classList.add('active');
            this.classList.add('bg-white');
            this.classList.add('border-t');
            this.classList.add('border-l');
            this.classList.add('border-r');
            this.classList.add('border-gray-200');
            
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
            }
        });
    });
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
            document.getElementById('api-global-container').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Rechner zurücksetzen
    const resetCalculatorBtn = document.getElementById('reset-calculator');
    if (resetCalculatorBtn) {
        resetCalculatorBtn.addEventListener('click', function() {
            if (typeof resetCalculator === 'function') {
                resetCalculator();
            } else {
                alert('Zurücksetzen-Funktion nicht verfügbar');
            }
        });
    }
}

// Zu einem Tab navigieren - robuste Implementierung
function navigateToTab(tabId) {
    // Tab aktivieren
    const tabLink = document.querySelector(`.tab-link[data-target="${tabId}"]`);
    if (tabLink) {
        // Manuell das Klick-Event auslösen
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        tabLink.dispatchEvent(event);
    }
}

// Änderungen in Daten beobachten (übergreifend)
function observeDataChanges() {
    // Sicherstellen, dass die Elemente existieren
    const wohnflaecheInput = document.getElementById('wohnflaeche');
    const kaufpreisInput = document.getElementById('kaufpreis');
    
    if (wohnflaecheInput && kaufpreisInput) {
        wohnflaecheInput.addEventListener('input', function() {
            if (typeof updateKaufpreisQm === 'function') updateKaufpreisQm();
            if (typeof updateOverview === 'function') updateOverview();
        });
        
        kaufpreisInput.addEventListener('input', function() {
            if (typeof updateKaufpreisQm === 'function') updateKaufpreisQm();
            if (typeof updateKaufnebenkosten === 'function') updateKaufnebenkosten();
            if (typeof updateGesamtkosten === 'function') updateGesamtkosten();
            if (typeof updateOverview === 'function') updateOverview();
        });
    }
}

// API-Integration - Direkte Implementierung
function initAPIIntegration() {
    // API-Containern und Eingabefeld
    const apiKeySection = document.getElementById('api-key-section');
    const apiProviderLabel = document.getElementById('api-provider-label');
    const globalApiKeyInput = document.getElementById('global-api-key');
    const validateGlobalApiBtn = document.getElementById('validate-global-api');
    
    // Provider-Auswahl
    const openaiProvider = document.getElementById('openai-provider');
    const anthropicProvider = document.getElementById('anthropic-provider');
    const deepseekProvider = document.getElementById('deepseek-provider');
    
    if (openaiProvider) {
        openaiProvider.addEventListener('click', function() {
            selectProvider('openai');
            showApiInputForProvider('OpenAI (GPT-4)');
        });
    }
    
    if (anthropicProvider) {
        anthropicProvider.addEventListener('click', function() {
            selectProvider('anthropic');
            showApiInputForProvider('Claude');
        });
    }
    
    if (deepseekProvider) {
        deepseekProvider.addEventListener('click', function() {
            selectProvider('deepseek');
            showApiInputForProvider('DeepSeek');
        });
    }
    
    // API-Schlüssel validieren
    if (validateGlobalApiBtn) {
        validateGlobalApiBtn.addEventListener('click', function() {
            validateApiKey();
        });
    }
}

// Provider auswählen und API-Eingabefeld anzeigen
function showApiInputForProvider(providerName) {
    const apiKeySection = document.getElementById('api-key-section');
    const apiProviderLabel = document.getElementById('api-provider-label');
    
    if (apiKeySection && apiProviderLabel) {
        // API-Eingabefeld anzeigen und Label aktualisieren
        apiKeySection.classList.remove('hidden');
        apiProviderLabel.textContent = `${providerName} API-Schlüssel`;
        
        // Fokus auf das API-Eingabefeld setzen
        document.getElementById('global-api-key').focus();
    }
}

// Provider auswählen
function selectProvider(providerId) {
    window.BauFiRechner.apiProvider = providerId;
    
    // UI aktualisieren
    document.querySelectorAll('#openai-provider, #anthropic-provider, #deepseek-provider').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    document.getElementById(`${providerId}-provider`).classList.add('border-blue-500', 'bg-blue-50');
}

// API-Key validieren - direkte Implementierung
function validateApiKey() {
    const apiProvider = window.BauFiRechner.apiProvider;
    if (!apiProvider) {
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
    
    // Simulieren einer API-Validierung (für Demo-Zwecke)
    setTimeout(function() {
        // API-Schlüssel speichern
        window.BauFiRechner.apiKey = apiKey;
        
        // Status aktualisieren
        const apiStatus = document.getElementById('api-status');
        if (apiStatus) {
            apiStatus.classList.remove('hidden');
            apiStatus.classList.add('bg-green-50', 'border', 'border-green-500');
            apiStatus.innerHTML = `
                <p class="text-green-700">
                    <i class="fas fa-check-circle mr-2"></i>
                    API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert. Sie können nun die KI-Analysefunktionen nutzen.
                </p>
            `;
        }
        
        // UI in anderen Tabs aktualisieren
        const kiCheckContainer = document.getElementById('ki-check-container');
        if (kiCheckContainer) {
            kiCheckContainer.innerHTML = `
                <p class="text-sm text-green-800">
                    <i class="fas fa-check-circle mr-2"></i>
                    API-Schlüssel für ${getProviderName(apiProvider)} erfolgreich validiert. Sie können die Analyse und Optimierung starten.
                </p>
            `;
            kiCheckContainer.classList.remove('bg-yellow-50', 'border-yellow-200');
            kiCheckContainer.classList.add('bg-green-50', 'border-green-200');
        }
        
        // Analyse-Optionen aktivieren
        const analyseOptionen = document.getElementById('analyse-optionen');
        if (analyseOptionen) {
            const options = analyseOptionen.querySelectorAll('div[id$="-analyse"]');
            options.forEach(option => {
                option.classList.add('bg-white');
                option.addEventListener('click', function(e) {
                    const optionId = e.currentTarget.id;
                    // Analyse starten
                    if (typeof startAnalysis === 'function') {
                        startAnalysis(optionId.replace('-analyse', ''));
                    } else {
                        alert('Analyse-Funktion nicht verfügbar');
                    }
                });
            });
        }
        
        validateButton.textContent = 'Validiert ✓';
        setTimeout(function() {
            validateButton.textContent = 'Validieren';
            validateButton.disabled = false;
        }, 2000);
        
    }, 1000);
}

// Provider-Name abrufen
function getProviderName(providerId) {
    switch(providerId) {
        case 'openai': return 'OpenAI (GPT-4)';
        case 'anthropic': return 'Claude';
        case 'deepseek': return 'DeepSeek';
        default: return 'KI-Provider';
    }
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

// Funktion zum Ein-/Ausklappen des API-Bereichs
// Diese Funktion muss im globalen Bereich definiert sein
function toggleApiSection() {
    const content = document.getElementById('api-content');
    const icon = document.getElementById('api-toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// Ergänzen Sie diese Funktion in Ihrer main.js oder fügen Sie sie am Ende hinzu

// Initialisierung ergänzen
document.addEventListener('DOMContentLoaded', function() {
    // Existierende Initialisierungen...
    
    // API-Toggle initialisieren
    const apiToggleHeader = document.getElementById('api-toggle-header');
    if (apiToggleHeader) {
        apiToggleHeader.addEventListener('click', toggleApiSection);
    }
    
    // Beim Laden der Seite prüfen, ob ein API-Bereich ausgeblendet werden soll
    const apiContent = document.getElementById('api-content');
    const apiToggleIcon = document.getElementById('api-toggle-icon');
    
    // Standardmäßig ausgeklappt
    if (apiContent && !apiContent.style.display) {
        apiContent.style.display = 'block';
        if (apiToggleIcon) {
            apiToggleIcon.classList.remove('fa-chevron-up');
            apiToggleIcon.classList.add('fa-chevron-down');
        }
    }
});
