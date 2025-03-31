// api-integration.js
// Funktionalität für die KI-Integration, Provider-Auswahl, Key-Validierung (Trigger) und UI-Updates

document.addEventListener('DOMContentLoaded', function() {
    // API-Bereich initialisieren (kann initial eingeklappt sein)
    const apiContent = document.getElementById('api-content');
    const apiToggleHeader = document.getElementById('api-toggle-header');
    const apiToggleIcon = document.getElementById('api-toggle-icon');

     // Default: Einklappen, wenn nicht anders im HTML definiert
     if (apiContent && apiToggleIcon) {
         const startCollapsed = true; // Hier steuern, ob initial eingeklappt
         if (startCollapsed) {
            apiContent.style.display = 'none';
            apiToggleIcon.classList.remove('fa-chevron-down');
            apiToggleIcon.classList.add('fa-chevron-up');
         } else {
            apiContent.style.display = 'block';
            apiToggleIcon.classList.remove('fa-chevron-up');
            apiToggleIcon.classList.add('fa-chevron-down');
         }
     }


    // Provider-Auswahl einrichten
    initProviderSelection();

    // API-Schlüssel-Validierung aus analysis.js anstoßen
    initApiKeyValidationTrigger();

    // Toggle-Handler für API-Bereich
    if (apiToggleHeader) {
        apiToggleHeader.removeAttribute('onclick'); // Entfernen falls im HTML vorhanden
        apiToggleHeader.addEventListener('click', toggleApiSection);
    } else {
        console.warn("API Toggle Header nicht gefunden.");
    }
});

// API-Bereich ein-/ausklappen
function toggleApiSection() {
    console.log("Toggle API Section called"); // Debug
    const content = document.getElementById('api-content');
    const icon = document.getElementById('api-toggle-icon');

    if (!content || !icon) {
        console.error("API content or icon element not found");
        return;
    }

    const isHidden = content.style.display === 'none';

    if (isHidden) {
        content.style.display = 'block'; // Aufklappen
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        content.style.display = 'none'; // Einklappen
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
    console.log("API Content display toggled to: " + content.style.display); // Debug
}

// Provider-Auswahl einrichten
function initProviderSelection() {
    const providerOptions = document.querySelectorAll('.provider-option');
    const apiKeyInput = document.getElementById('global-api-key');
    const providerLabel = document.getElementById('api-provider-label');
    const apiStatusDiv = document.getElementById('api-status');

    providerOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Bereits aktiven Provider deselektieren
            const currentActive = document.querySelector('.provider-option.border-blue-500');
            if(currentActive) {
                 currentActive.classList.remove('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-300'); // Styling entfernen
            }


            // Gewählten Provider aktivieren
            this.classList.add('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-300'); // Klares aktives Styling

            // Provider-ID speichern (stellt sicher, dass BauFiRechner existiert)
            window.BauFiRechner = window.BauFiRechner || {};
            window.BauFiRechner.apiProvider = this.getAttribute('data-provider');

             // Provider-Label aktualisieren
             const providerName = getProviderName(window.BauFiRechner.apiProvider); // Verwende Hilfsfunktion
            if (providerLabel) providerLabel.textContent = `API-Schlüssel (${providerName})`;

            // Fokus auf API-Eingabefeld
            if (apiKeyInput) apiKeyInput.focus();

            // Alten API-Status löschen bei Providerwechsel
            if (apiStatusDiv) {
                apiStatusDiv.classList.add('hidden');
                apiStatusDiv.innerHTML = '';
            }
             // Alten gespeicherten Key löschen, da Provider gewechselt wurde
             window.BauFiRechner.apiKey = null;
             // Analyse-Tab UI zurücksetzen
             resetKiCheckInAnalyseTab();
             if(typeof disableAnalysisOptions === 'function') disableAnalysisOptions();

        });
    });
}


// API-Schlüssel Validierungs-TRIGGER einrichten (ruft Funktion in analysis.js)
function initApiKeyValidationTrigger() {
    const validateButton = document.getElementById('validate-global-api');
    const apiKeyInput = document.getElementById('global-api-key');

    if (validateButton && typeof validateGlobalApiKey === 'function') {
        validateButton.addEventListener('click', validateGlobalApiKey); // Direkter Aufruf der Funktion aus analysis.js
    } else {
         console.error("Validierungsbutton oder Funktion 'validateGlobalApiKey' nicht gefunden.");
    }

    if (apiKeyInput && typeof validateGlobalApiKey === 'function') {
        apiKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateGlobalApiKey(); // Auch bei Enter auslösen
            }
        });
    } else {
         console.error("API-Key-Input oder Funktion 'validateGlobalApiKey' nicht gefunden.");
    }
}


// Hilfsfunktion zur Anzeige des API-Status (wird von analysis.js aufgerufen)
function showApiStatus(status, message) {
    const statusDiv = document.getElementById('api-status');
    if (!statusDiv) return;

    let bgColor = 'bg-gray-50';
    let borderColor = 'border-gray-200';
    let textColor = 'text-gray-800';
    let icon = '<i class="fas fa-info-circle mr-2"></i>';

    statusDiv.classList.remove('hidden', 'bg-red-50', 'bg-green-50', 'bg-blue-50', 'bg-gray-50', 'border', 'border-red-200', 'border-green-200', 'border-blue-200', 'border-gray-200');

    if (status === true) { // Erfolg
        bgColor = 'bg-green-50';
        borderColor = 'border-green-200';
        textColor = 'text-green-800';
        icon = '<i class="fas fa-check-circle mr-2"></i>';
    } else if (status === false) { // Fehler / Ungültig
        bgColor = 'bg-red-50';
        borderColor = 'border-red-200';
        textColor = 'text-red-800';
        icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
    } else if (status === 'pending') { // Ladevorgang
        bgColor = 'bg-blue-50';
        borderColor = 'border-blue-200';
        textColor = 'text-blue-800';
        icon = '<i class="fas fa-spinner fa-spin mr-2"></i>';
    } else if (status === 'error') { // Anderer Fehler (z.B. UI)
         bgColor = 'bg-yellow-50';
         borderColor = 'border-yellow-300';
         textColor = 'text-yellow-800';
         icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
    }

    statusDiv.classList.add(bgColor, 'border', borderColor, 'p-3', 'rounded', 'mt-2');
    statusDiv.innerHTML = `<p class="${textColor} text-sm">${icon}${message}</p>`;
    statusDiv.classList.remove('hidden'); // Sicherstellen, dass es sichtbar ist
}

// Hilfsfunktion zur Aktualisierung des KI-Status im Analyse-Tab (wird von analysis.js aufgerufen)
function updateKiCheckInAnalyseTab(isValid, providerId) {
    const kiCheckContainer = document.getElementById('ki-check-container');
    if (!kiCheckContainer) return;

    const providerName = getProviderName(providerId);

    if (isValid) {
        kiCheckContainer.classList.remove('bg-yellow-50', 'border-yellow-200', 'bg-red-50', 'border-red-200');
        kiCheckContainer.classList.add('bg-green-50', 'border', 'border-green-200', 'p-4', 'rounded');
        kiCheckContainer.innerHTML = `
            <p class="text-sm text-green-800">
                <i class="fas fa-check-circle mr-2"></i>
                API-Schlüssel für ${providerName} erfolgreich validiert. Die Analyseoptionen sind nun verfügbar.
            </p>
        `;
    } else {
        // Wird durch resetKiCheckInAnalyseTab gehandhabt
    }
}

// Hilfsfunktion zum Zurücksetzen des KI-Status im Analyse-Tab
function resetKiCheckInAnalyseTab() {
    const kiCheckContainer = document.getElementById('ki-check-container');
    if (!kiCheckContainer) return;

    kiCheckContainer.classList.remove('bg-green-50', 'border-green-200', 'bg-red-50', 'border-red-200');
    kiCheckContainer.classList.add('bg-yellow-50', 'border', 'border-yellow-200', 'p-4', 'rounded');
    kiCheckContainer.innerHTML = `
        <p class="text-sm text-yellow-800">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Bitte wählen Sie einen API-Provider und validieren Sie Ihren API-Schlüssel, um die Analysefunktionen zu nutzen.
        </p>
        <button id="goto-api-key" onclick="document.getElementById('api-global-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('global-api-key')?.focus();" class="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
            Zum API-Bereich
        </button>
    `;
     // Stelle sicher, dass der Button-Listener neu angehängt wird (falls er entfernt wurde)
     const gotoBtn = kiCheckContainer.querySelector('#goto-api-key');
     // Da der Button neu erstellt wird, verwenden wir hier onclick, oder fügen den Listener in main.js via Delegation hinzu.
     // Der obige onclick ist die einfachste Variante hier.
}


// Hilfsfunktion zum Abrufen des Provider-Namens (kann auch in analysis.js sein)
function getProviderName(providerId) {
    switch (providerId) {
        case 'openai': return 'OpenAI (GPT-4)';
        case 'anthropic': return 'Claude (Opus/Haiku)';
        case 'deepseek': return 'DeepSeek';
        default: return 'API Provider';
    }
}
