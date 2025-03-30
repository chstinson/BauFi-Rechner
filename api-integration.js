// api-integration.js
// Unterstützung für die KI-Integration und das Ein-/Ausklappen des API-Bereichs
// Diese Datei ergänzt die Funktionalität in analysis.js

document.addEventListener('DOMContentLoaded', function() {
    // API-Bereich initialisieren - nur Ein-/Ausklappfunktion
    initApiToggle();
    
    // Provider-Auswahl einrichten
    initProviderSelection();
    
    // API-Schlüssel-Validierung (Brücke zu analysis.js)
    initApiKeyValidation();
});

// API-Bereich initialisieren (nur Toggle-Funktion)
function initApiToggle() {
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

// API-Schlüssel-Validierung einrichten (Brücke zu analysis.js)
function initApiKeyValidation() {
    const validateButton = document.getElementById('validate-global-api');
    
    if (validateButton) {
        validateButton.addEventListener('click', function() {
            // Wenn die analysis.js-Funktion existiert, verwende diese
            if (typeof validateGlobalApiKey === 'function') {
                validateGlobalApiKey();
            } else {
                // Fallback, falls die Funktion nicht existiert
                simpleValidateApiKey();
            }
        });
    }
    
    // Enter-Taste im API-Schlüssel-Feld triggert Validierung
    const apiKeyInput = document.getElementById('global-api-key');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (typeof validateGlobalApiKey === 'function') {
                    validateGlobalApiKey();
                } else {
                    simpleValidateApiKey();
                }
            }
        });
    }
}

// Einfache API-Schlüssel-Validierung (Fallback)
function simpleValidateApiKey() {
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
    
    // Simulierte API-Validierung (wird normalerweise durch die vollständige Validierung in analysis.js ersetzt)
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
        } else {
            showApiStatus(false, 'Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihre Eingabe oder wenden Sie sich an den Support.');
        }
        
        // Button zurücksetzen
        validateButton.textContent = 'Validieren';
        validateButton.disabled = false;
    }, 1500);
}

// API-Status anzeigen (Hilfsfunktion)
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

// KI-Status im Analyse-Tab aktualisieren (Hilfsfunktion)
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

// Provider-Name abrufen (Hilfsfunktion)
function getProviderName(providerId) {
    switch(providerId) {
        case 'openai': return 'OpenAI (GPT-4)';
        case 'anthropic': return 'Claude';
        case 'deepseek': return 'DeepSeek';
        default: return 'KI-Provider';
    }
}
