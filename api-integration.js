// api-integration.js
// Funktionalität für die KI-Integration und das Ein-/Ausklappen des API-Bereichs

document.addEventListener('DOMContentLoaded', function() {
    // API-Bereich initialisieren - explizite Anzeige im DOM
    const apiContent = document.getElementById('api-content');
    if (apiContent) {
        apiContent.style.display = 'block';
    }
    
    // Provider-Auswahl einrichten
    initProviderSelection();
    
    // API-Schlüssel-Validierung (Brücke zu analysis.js)
    initApiKeyValidation();
    
    // Stellen Sie sicher, dass der Toggle-Handler korrekt initialisiert ist
    const apiToggleHeader = document.getElementById('api-toggle-header');
    if (apiToggleHeader) {
        apiToggleHeader.addEventListener('click', function() {
            toggleApiSection();
        });
    }
});

// API-Bereich ein-/ausklappen - explizit als globale Funktion definiert
window.toggleApiSection = function() {
    console.log("Toggle API Section called"); // Debug-Ausgabe
    const content = document.getElementById('api-content');
    const icon = document.getElementById('api-toggle-icon');
    
    if (!content || !icon) {
        console.error("API content or icon element not found");
        return;
    }
    
    // Prüfen des aktuellen Anzeigestatus
    const isHidden = content.style.display === 'none';
    
    // Umschalten des Anzeigestatus
    if (isHidden) {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
    
    console.log("Content display set to: " + content.style.display); // Debug-Ausgabe
};

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
            if (!window.BauFiRechner) {
                window.BauFiRechner = {};
            }
            window.BauFiRechner.apiProvider = this.getAttribute('data-provider');
            
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

// Einfache API-Schlüssel-Validierung (mit strikteren Bedingungen)
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
    
    // Simulierte API-Validierung mit strengeren Prüfungen
    setTimeout(() => {
        // API-Schlüssel validieren (mind. 8 Zeichen und grundlegende Formatprüfung)
        const isValidLength = apiKey.length >= 8;
        let isValidFormat = false;
        
        // Unterschiedliche Formate je nach Provider
        if (window.BauFiRechner.apiProvider === 'openai') {
            // OpenAI API-Keys beginnen mit 'sk-'
            isValidFormat = apiKey.startsWith('sk-');
        } else if (window.BauFiRechner.apiProvider === 'anthropic') {
            // Einfache Formatprüfung für Claude
            isValidFormat = /^[a-zA-Z0-9_-]{20,}$/.test(apiKey);
        } else if (window.BauFiRechner.apiProvider === 'deepseek') {
            // Einfache Formatprüfung für DeepSeek
            isValidFormat = /^[a-zA-Z0-9_.-]{16,}$/.test(apiKey);
        }
        
        const isValid = isValidLength && isValidFormat;
        
        if (isValid) {
            // API-Schlüssel speichern
            if (!window.BauFiRechner) {
                window.BauFiRechner = {};
            }
            window.BauFiRechner.apiKey = apiKey;
            window.BauFiRechner.datenValidiert = true;
            
            showApiStatus(true, 'API-Schlüssel erfolgreich validiert. Plausibilitätsprüfungen und Optimierungsfunktionen sind jetzt verfügbar.');
            
            // KI-Check im Analyse-Tab aktualisieren
            updateKiCheckInAnalyseTab(true);
        } else {
            let errorMsg = 'Ungültiger API-Schlüssel. ';
            if (!isValidLength) {
                errorMsg += 'Der API-Schlüssel muss mindestens 8 Zeichen lang sein. ';
            }
            if (!isValidFormat) {
                errorMsg += 'Das Format entspricht nicht dem erwarteten Muster für ' + getProviderName(window.BauFiRechner.apiProvider) + '. ';
            }
            errorMsg += 'Bitte überprüfen Sie Ihre Eingabe oder wenden Sie sich an den Support.';
            
            showApiStatus(false, errorMsg);
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
