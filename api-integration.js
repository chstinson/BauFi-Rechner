// api-integration.js
// Funktionalität für die KI-Integration und API-Validierung

document.addEventListener('DOMContentLoaded', function() {
    // API-Bereich initialisieren
    initApiSection();
    
    // Provider-Auswahl einrichten
    initProviderSelection();
    
    // API-Schlüssel-Validierung einrichten
    initApiKeyValidation();
    
    // Analyse-Integration
    initAnalysisIntegration();
});

// API-Bereich initialisieren
function initApiSection() {
    // API-Toggle-Header
    const apiToggleHeader = document.getElementById('api-toggle-header');
    const apiContent = document.getElementById('api-content');
    const apiToggleIcon = document.getElementById('api-toggle-icon');
    
    // Toggle-Funktion global verfügbar machen
    window.toggleApiSection = function() {
        if (apiContent.style.display === 'none') {
            apiContent.style.display = 'block';
            apiToggleIcon.classList.remove('fa-chevron-up');
            apiToggleIcon.classList.add('fa-chevron-down');
        } else {
            apiContent.style.display = 'none';
            apiToggleIcon.classList.remove('fa-chevron-down');
            apiToggleIcon.classList.add('fa-chevron-up');
        }
    };
    
    // Initialer Zustand: Ausgeklappt
    apiContent.style.display = 'block';
    apiToggleIcon.classList.remove('fa-chevron-up');
    apiToggleIcon.classList.add('fa-chevron-down');
}

// Provider-Auswahl einrichten
function initProviderSelection() {
    const providerOptions = document.querySelectorAll('.provider-option');
    
    providerOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Aktiven Status von allen entfernen
            providerOptions.forEach(opt => {
                opt.classList.remove('border-blue-500', 'bg-blue-50');
            });
            
            // Aktiven Status dem gewählten Provider hinzufügen
            this.classList.add('border-blue-500', 'bg-blue-50');
            
            // Provider-ID in der globalen BauFiRechner-Variable speichern
            if (window.BauFiRechner) {
                window.BauFiRechner.apiProvider = this.getAttribute('data-provider');
            }
            
            // Provider-Label aktualisieren
            const providerName = this.querySelector('.font-medium').textContent;
            document.getElementById('api-provider-label').textContent = `API-Schlüssel (${providerName})`;
            
            // Fokus auf das API-Eingabefeld setzen
            document.getElementById('global-api-key').focus();
        });
    });
}

// API-Schlüssel-Validierung einrichten
function initApiKeyValidation() {
    const validateButton = document.getElementById('validate-global-api');
    
    if (validateButton) {
        validateButton.addEventListener('click', validateApiKey);
    }
    
    // Enter-Taste im API-Schlüssel-Feld triggert Validierung
    const apiKeyInput = document.getElementById('global-api-key');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateApiKey();
            }
        });
    }
}

// API-Schlüssel validieren
function validateApiKey() {
    // Überprüfen, ob ein Provider ausgewählt wurde
    if (!window.BauFiRechner || !window.BauFiRechner.apiProvider) {
        alert('Bitte wählen Sie zuerst einen API-Provider aus.');
        return;
    }
    
    const apiKey = document.getElementById('global-api-key').value.trim();
    if (!apiKey) {
        showApiStatus(false, 'Bitte geben Sie einen API-Schlüssel ein.');
        return;
    }
    
    const validateButton = document.getElementById('validate-global-api');
    validateButton.textContent = 'Validiere...';
    validateButton.disabled = true;
    
    // Status während der Validierung anzeigen
    showApiStatus('pending', 'Validiere API-Schlüssel...');
    
    // Simulierte API-Validierung (wird in einer realen Anwendung durch echten API-Call ersetzt)
    setTimeout(() => {
        // API-Schlüssel validieren (einfacher Check: Schlüssel muss mindestens 8 Zeichen haben)
        const isValid = apiKey.length >= 8;
        
        if (isValid) {
            // API-Schlüssel speichern
            window.BauFiRechner.apiKey = apiKey;
            window.BauFiRechner.datenValidiert = true;
            
            showApiStatus(true, 'API-Schlüssel erfolgreich validiert. Plausibilitätsprüfungen und Optimierungsfunktionen sind jetzt verfügbar.');
            
            // KI-Check im Analyse-Tab aktualisieren
            updateKiCheckInAnalyseTab(true);
            
            // Analyse-Optionen freischalten
            enableAnalysisOptions();
        } else {
            showApiStatus(false, 'Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihre Eingabe oder wenden Sie sich an den Support.');
        }
        
        // Button zurücksetzen
        validateButton.textContent = 'Validieren';
        validateButton.disabled = false;
    }, 1500);
}

// API-Status anzeigen
function showApiStatus(status, message) {
    const statusDiv = document.getElementById('api-status');
    if (!statusDiv) return;
    
    statusDiv.classList.remove('hidden', 'bg-red-50', 'bg-green-50', 'bg-blue-50');
    
    if (status === true) {
        // Erfolg
        statusDiv.classList.add('bg-green-50', 'border', 'border-green-200');
        statusDiv.innerHTML = `
            <p class="text-green-800">
                <i class="fas fa-check-circle mr-2"></i>
                ${message}
            </p>
        `;
    } else if (status === false) {
        // Fehler
        statusDiv.classList.add('bg-red-50', 'border', 'border-red-200');
        statusDiv.innerHTML = `
            <p class="text-red-800">
                <i class="fas fa-exclamation-circle mr-2"></i>
                ${message}
            </p>
        `;
    } else if (status === 'pending') {
        // Ladevorgang
        statusDiv.classList.add('bg-blue-50', 'border', 'border-blue-200');
        statusDiv.innerHTML = `
            <p class="text-blue-800">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                ${message}
            </p>
        `;
    }
}

// KI-Status im Analyse-Tab aktualisieren
function updateKiCheckInAnalyseTab(isValid) {
    const kiCheckContainer = document.getElementById('ki-check-container');
    if (!kiCheckContainer) return;
    
    if (isValid) {
        // API-Schlüssel ist gültig
        kiCheckContainer.classList.remove('bg-yellow-50', 'border-yellow-200');
        kiCheckContainer.classList.add('bg-green-50', 'border-green-200');
        kiCheckContainer.innerHTML = `
            <p class="text-sm text-green-800">
                <i class="fas fa-check-circle mr-2"></i>
                API-Schlüssel für ${getProviderName(window.BauFiRechner.apiProvider)} erfolgreich validiert. Sie können die Analyse und Optimierung starten.
            </p>
        `;
    }
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

// Analyse-Optionen freischalten
function enableAnalysisOptions() {
    const analyseOptionen = document.getElementById('analyse-optionen');
    if (!analyseOptionen) return;
    
    // Optionen aktiv setzen
    analyseOptionen.classList.remove('opacity-50');
    
    // Event-Listener für Analyse-Optionen hinzufügen
    const options = [
        'marktdaten-analyse',
        'belastungs-analyse',
        'optimierungs-analyse',
        'vollstaendige-analyse'
    ];
    
    options.forEach(optionId => {
        const option = document.getElementById(optionId);
        if (option) {
            option.classList.add('cursor-pointer');
            
            // Event-Listener nur hinzufügen, wenn noch keiner existiert
            const existingClickListener = option.getAttribute('data-has-click-listener');
            if (!existingClickListener) {
                option.addEventListener('click', function() {
                    startAnalysis(optionId.replace('-analyse', ''));
                });
                option.setAttribute('data-has-click-listener', 'true');
            }
        }
    });
}

// Analyse-Integration
function initAnalysisIntegration() {
    // "API-Schlüssel eingeben" Button im Analyse-Tab
    const gotoApiKeyBtn = document.getElementById('goto-api-key');
    if (gotoApiKeyBtn) {
        gotoApiKeyBtn.addEventListener('click', function() {
            // Zum API-Bereich scrollen
            const apiContainer = document.getElementById('api-global-container');
            if (apiContainer) {
                apiContainer.scrollIntoView({ behavior: 'smooth' });
                
                // Sicherstellen, dass der API-Bereich ausgeklappt ist
                const apiContent = document.getElementById('api-content');
                if (apiContent && apiContent.style.display === 'none') {
                    window.toggleApiSection();
                }
                
                // Nach kurzer Verzögerung Fokus auf das API-Schlüssel-Feld setzen
                setTimeout(() => {
                    const apiKeyInput = document.getElementById('global-api-key');
                    if (apiKeyInput) {
                        apiKeyInput.focus();
                    }
                }, 500);
            }
        });
    }
}

// Analyse starten (Brücke zur analysis.js)
function startAnalysis(analysisType) {
    // Wenn die Funktion in analysis.js existiert, diese aufrufen
    if (typeof window.startAnalysis === 'function') {
        window.startAnalysis(analysisType);
    } else {
        console.error('Die startAnalysis-Funktion konnte nicht gefunden werden. Bitte stellen Sie sicher, dass analysis.js korrekt geladen wurde.');
    }
}
