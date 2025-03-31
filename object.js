// object.js
// Funktionalität für die Objektdaten des BauFi-Rechners

function initObjectData() {
    // Toggle für erweiterte Felder
    const toggleButton = document.getElementById('toggle-detailed-view');
    const detailedFieldsets = document.querySelectorAll('.detailed-object-data');

    if (toggleButton && detailedFieldsets.length > 0) {
        toggleButton.addEventListener('click', function() {
            detailedFieldsets.forEach(fieldset => {
                fieldset.classList.toggle('hidden');
            });

            // Button-Text und Icon ändern
            const icon = toggleButton.querySelector('i');
            if (icon.classList.contains('fa-chevron-down')) {
                toggleButton.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Weniger Details anzeigen';
                toggleButton.classList.remove('bg-gray-200', 'hover:bg-gray-300'); // Standardfarben entfernen
                toggleButton.classList.add('bg-gray-500', 'hover:bg-gray-600', 'text-white'); // Geöffnet-Stil
            } else {
                toggleButton.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>Mehr Objektdetails anzeigen/ausblenden';
                 toggleButton.classList.remove('bg-gray-500', 'hover:bg-gray-600', 'text-white'); // Geöffnet-Stil entfernen
                 toggleButton.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700'); // Standardfarben
            }
        });
    } else {
        console.warn("Toggle button or detailed fields not found.");
    }

    // Nutzungsart-Felder ein-/ausblenden
    const nutzungsartSelect = document.getElementById('nutzungsart');
    const kapitalanlageFields = document.querySelectorAll('.kapitalanlage-field');

    function toggleKapitalanlageFields() {
        const isKapitalanlage = nutzungsartSelect.value === 'Kapitalanlage' || nutzungsartSelect.value === 'Teilweise vermietet';

        kapitalanlageFields.forEach(field => {
            if (isKapitalanlage) {
                field.classList.remove('hidden');
            } else {
                field.classList.add('hidden');
            }
        });
    }

    if (nutzungsartSelect && kapitalanlageFields.length > 0) {
        nutzungsartSelect.addEventListener('change', toggleKapitalanlageFields);
        toggleKapitalanlageFields(); // Initial ausführen
    }

    // --- NEU: Lagekategorie ermitteln ---
    const ermittleLageBtn = document.getElementById('ermittle-lagekategorie-btn');
    if (ermittleLageBtn) {
        ermittleLageBtn.addEventListener('click', ermittleLagekategoriePerKi);
    } else {
         console.warn("Button 'ermittle-lagekategorie-btn' nicht gefunden.");
    }
}

// --- NEU: Funktion zum Ermitteln der Lagekategorie ---
async function ermittleLagekategoriePerKi() {
    const ermittleLageBtn = document.getElementById('ermittle-lagekategorie-btn');
    const lageSelect = document.getElementById('lage');
    const lageStatus = document.getElementById('lage-status');

    if (!ermittleLageBtn || !lageSelect || !lageStatus) {
        console.error("UI-Elemente für Lage-Ermittlung fehlen.");
        return;
    }

    // 1. API-Schlüssel und Provider prüfen
    if (!window.BauFiRechner || !window.BauFiRechner.apiKey || !window.BauFiRechner.apiProvider) {
        lageStatus.textContent = 'Fehler: API nicht konfiguriert.';
        lageStatus.classList.remove('text-green-600');
        lageStatus.classList.add('text-red-600');
        alert("Bitte zuerst im globalen Bereich einen API-Provider wählen und den Schlüssel validieren.");
        document.getElementById('api-global-container')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // 2. Daten sammeln
    const strasse = document.getElementById('strasse')?.value || '';
    const plz = document.getElementById('plz')?.value || '';
    const ort = document.getElementById('ort')?.value || '';
    const bundesland = document.getElementById('bundesland')?.value || '';
    const objekttyp = document.getElementById('objekttyp')?.value || '';
    const wohnflaeche = document.getElementById('wohnflaeche')?.value || '';
    const baujahr = document.getElementById('baujahr')?.value || ''; // Aus erweiterten Details
    const zustand = document.getElementById('zustand')?.value || ''; // Aus erweiterten Details

    if (!plz || !ort || !bundesland) {
        lageStatus.textContent = 'Fehler: PLZ, Ort und Bundesland benötigt.';
        lageStatus.classList.remove('text-green-600');
        lageStatus.classList.add('text-red-600');
        alert("Bitte geben Sie mindestens PLZ, Ort und Bundesland an.");
        return;
    }

    // 3. UI Feedback (Loading)
    ermittleLageBtn.disabled = true;
    ermittleLageBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Ermittle...';
    lageStatus.textContent = 'Lage wird analysiert...';
    lageStatus.classList.remove('text-red-600', 'text-green-600');

    // 4. Prompt erstellen
    const prompt = `
Basierend auf den folgenden Daten für eine Immobilie in Deutschland, beurteile die Lagequalität (Mikro- und Makrolage).
Berücksichtige verfügbare Informationen zu Infrastruktur, Demografie, Kaufkraft und Immobilienmarktentwicklung für die Region.
Gib **nur und ausschließlich** eine der folgenden Kategorien zurück, die am besten passt:
'Sehr gut' (entspricht A+)
'Gut' (entspricht A)
'Mittel' (entspricht B)
'Einfach' (entspricht C)

Daten:
- Adresse: ${strasse}, ${plz} ${ort}, ${bundesland}
- Objekttyp: ${objekttyp}
- Wohnfläche: ${wohnflaeche} m²
- Baujahr: ${baujahr || 'N/A'}
- Zustand: ${zustand || 'N/A'}

Antworte nur mit einer der vier Kategorien (Sehr gut, Gut, Mittel, Einfach). Keine weitere Erklärung.`;

    // 5. API Aufruf (nutzt Funktionen aus analysis.js)
    try {
        const provider = window.BauFiRechner.apiProvider;
        const apiKey = window.BauFiRechner.apiKey;
        let resultText = '';

        console.log(`Starte Lagekategorie-Analyse mit Provider: ${provider}`);

        // Prüfen, ob die API-Funktionen existieren
        if (typeof callOpenAI !== 'function' || typeof callClaude !== 'function' || typeof callDeepSeek !== 'function') {
            throw new Error("API-Aufruffunktionen (callOpenAI etc.) nicht gefunden.");
        }


        switch (provider) {
            case 'openai':
                resultText = await callOpenAI(prompt, apiKey); // Annahme: Funktion gibt Text zurück
                break;
            case 'anthropic':
                resultText = await callClaude(prompt, apiKey); // Annahme: Funktion gibt Text zurück
                break;
            case 'deepseek':
                resultText = await callDeepSeek(prompt, apiKey); // Annahme: Funktion gibt Text zurück
                break;
            default:
                throw new Error("Nicht unterstützter API-Provider: " + provider);
        }

        console.log("Rohantwort von KI:", resultText);

        // 6. Ergebnis verarbeiten
        const cleanedResult = resultText.replace(/<[^>]*>/g, '').replace(/['"]/g, '').trim(); // HTML-Tags und Anführungszeichen entfernen
        const validCategories = ['Sehr gut', 'Gut', 'Mittel', 'Einfach'];
        let foundCategory = null;

        // Prüfen, ob die Antwort einer der Kategorien entspricht (auch Teilstrings prüfen)
        for (const category of validCategories) {
             // Mache einen Case-Insensitive-Check und prüfe, ob die Antwort die Kategorie enthält
            if (cleanedResult.toLowerCase().includes(category.toLowerCase())) {
                 // Nimm die *exakte* Kategorie aus unserer Liste, nicht die evtl. unsaubere KI-Antwort
                 foundCategory = category;
                break;
            }
        }


        if (foundCategory) {
            // Kategorie im Dropdown auswählen
            let optionFound = false;
            for (let option of lageSelect.options) {
                if (option.value === foundCategory) {
                    option.selected = true;
                    optionFound = true;
                    break;
                }
            }
             if(optionFound) {
                lageStatus.textContent = `Lagekategorie auf "${foundCategory}" gesetzt.`;
                lageStatus.classList.add('text-green-600');
                // Trigger change event if needed by other parts of the application
                lageSelect.dispatchEvent(new Event('change'));
             } else {
                 // Sollte nicht passieren, wenn Kategorien übereinstimmen
                throw new Error(`KI-Kategorie "${foundCategory}" nicht im Dropdown gefunden.`);
             }

        } else {
            throw new Error(`KI gab keine gültige Kategorie zurück. Antwort: "${cleanedResult}"`);
        }

    } catch (error) {
        console.error("Fehler bei der Lage-Ermittlung:", error);
        lageStatus.textContent = `Fehler: ${error.message}`;
        lageStatus.classList.add('text-red-600');
        alert(`Fehler bei der Ermittlung der Lagekategorie: ${error.message}`);
    } finally {
        // 7. UI Feedback (Done/Error)
        ermittleLageBtn.disabled = false;
        ermittleLageBtn.innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i> Ermitteln';
        // Statusmeldung nach einiger Zeit ausblenden
        setTimeout(() => {
             if (lageStatus.textContent && !lageStatus.textContent.toLowerCase().includes('fehler')) {
                lageStatus.textContent = ''; // Nur Erfolgsmeldungen löschen
             }
         }, 5000);
    }
}
