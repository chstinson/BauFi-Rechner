// finanzierungsstruktur.js
// Erweitert den BauFi-Rechner um detaillierte Finanzierungsstruktur und mehrere Darlehen

document.addEventListener('DOMContentLoaded', function() {
    // Container für erweiterte Finanzierungsstruktur erstellen und einfügen
    initFinanzierungsstruktur();
});

// Detaillierte Finanzierungsstruktur initialisieren
function initFinanzierungsstruktur() {
    // Bestehenden Container finden
    const darlehensdatenContainer = document.querySelector('.mb-6 h2.text-xl:contains("Darlehensdaten")');
    
    // Falls der Container noch nicht existiert oder eine andere Struktur hat
    if (!darlehensdatenContainer) {
        // Alternativ: Wir suchen nach dem Objektdaten-Container
        const objektdatenContainer = document.querySelector('.mb-6 h2.text-xl:contains("Objektdaten")');
        if (!objektdatenContainer) return;
        
        const finanzierungsSection = document.createElement('div');
        finanzierungsSection.className = 'mb-6';
        finanzierungsSection.innerHTML = createFinanzierungsstrukturHTML();
        
        // Nach Objektdaten einfügen
        if (objektdatenContainer.parentNode.nextSibling) {
            objektdatenContainer.parentNode.parentNode.insertBefore(finanzierungsSection, objektdatenContainer.parentNode.nextSibling);
        } else {
            objektdatenContainer.parentNode.parentNode.appendChild(finanzierungsSection);
        }
    } else {
        // Bestehenden Container ersetzen
        const parentElement = darlehensdatenContainer.parentNode;
        const finanzierungsSection = document.createElement('div');
        finanzierungsSection.className = 'mb-6';
        finanzierungsSection.innerHTML = createFinanzierungsstrukturHTML();
        
        parentElement.replaceWith(finanzierungsSection);
    }
    
    // Event Listener für die erweiterten Eingabefelder
    setupFinanzierungEventListeners();
    
    // Multi-Darlehen-Funktionalität
    initMultiDarlehenSystem();
    
    // Initiale Berechnung
    updateGesamtkostenUebersicht();
    updateEigenkapitalBerechnung();
    updateDarlehenBerechnung(1);
}

// HTML für die detaillierte Finanzierungsstruktur
function createFinanzierungsstrukturHTML() {
    return `
    <h2 class="text-xl font-semibold mb-4">Finanzierungsstruktur</h2>
    
    <!-- Gesamtkosten Übersicht -->
    <fieldset class="mb-4 p-4 border rounded">
        <legend class="font-medium px-2">Gesamtkosten</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Kaufpreis</label>
                <div class="p-2 border rounded bg-gray-100" id="gs_kaufpreis">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Kaufnebenkosten</label>
                <div class="p-2 border rounded bg-gray-100" id="gs_kaufnebenkosten">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Modernisierungskosten</label>
                <div class="p-2 border rounded bg-gray-100" id="gs_modernisierungskosten">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Gesamtkosten</label>
                <div class="p-2 border rounded bg-gray-100 font-semibold" id="gs_gesamtkosten">-</div>
            </div>
        </div>
    </fieldset>
    
    <!-- Eigenkapital Eingabe -->
    <fieldset class="mb-4 p-4 border rounded">
        <legend class="font-medium px-2">Eigenkapital</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Eigenkapital</label>
                <div class="flex items-center">
                    <input type="number" id="eigenkapital" class="w-full p-2 border rounded" placeholder="100000">
                    <span class="ml-2">€</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Eigenkapitalquote</label>
                <div class="p-2 border rounded bg-gray-100" id="eigenkapital_quote">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Fördermittel (KfW, etc.)</label>
                <div class="flex items-center">
                    <input type="number" id="foerdermittel" class="w-full p-2 border rounded" placeholder="0">
                    <span class="ml-2">€</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Zu finanzierender Betrag</label>
                <div class="p-2 border rounded bg-gray-100 font-semibold" id="zu_finanzieren">-</div>
            </div>
        </div>
    </fieldset>
    
    <!-- Multi-Darlehen-System -->
    <div class="mb-4">
        <h3 class="font-medium mb-2">Finanzierungsbausteine</h3>
        <div id="darlehen-container">
            <!-- Hier werden die Darlehen eingefügt -->
            <div id="darlehen-1" class="p-4 border rounded mb-4 darlehen-block">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-medium">Darlehen 1</h4>
                    <span class="darlehen-remove hidden cursor-pointer text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Darlehensbetrag</label>
                        <div class="flex items-center">
                            <input type="range" min="10000" max="1000000" step="10000" value="300000" 
                                   class="w-full mr-4 darlehen-betrag-slider">
                            <input type="number" class="w-32 p-2 border rounded text-right darlehen-betrag" value="300000">
                            <span class="ml-2">€</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Sollzins</label>
                        <div class="flex items-center">
                            <input type="range" min="0.5" max="6" step="0.1" value="3.5" 
                                   class="w-full mr-4 darlehen-zins-slider">
                            <input type="number" min="0.5" max="10" step="0.1" value="3.5" 
                                   class="w-24 p-2 border rounded text-right darlehen-zins">
                            <span class="ml-2">%</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Anfängliche Tilgung</label>
                        <div class="flex items-center">
                            <input type="range" min="1" max="5" step="0.1" value="2.0" 
                                   class="w-full mr-4 darlehen-tilgung-slider">
                            <input type="number" min="0.5" max="10" step="0.1" value="2.0" 
                                   class="w-24 p-2 border rounded text-right darlehen-tilgung">
                            <span class="ml-2">%</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Zinsbindung</label>
                        <div class="flex items-center">
                            <input type="range" min="5" max="30" step="1" value="10" 
                                   class="w-full mr-4 darlehen-zinsbindung-slider">
                            <input type="number" min="1" max="30" step="1" value="10" 
                                   class="w-24 p-2 border rounded text-right darlehen-zinsbindung">
                            <span class="ml-2">Jahre</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Monatliche Rate</label>
                        <div class="p-2 border rounded bg-gray-100 darlehen-rate">-</div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Restschuld nach Zinsbindung</label>
                        <div class="p-2 border rounded bg-gray-100 darlehen-restschuld">-</div>
                    </div>
                </div>
                
                <div class="mt-2">
                    <label class="inline-flex items-center">
                        <input type="checkbox" class="darlehen-sondertilgung-option">
                        <span class="ml-2 text-sm">Sondertilgung möglich</span>
                    </label>
                    <div class="mt-2 darlehen-sondertilgung-details hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label class="block text-sm font-medium mb-1">Höhe der Sondertilgung</label>
                                <div class="flex items-center">
                                    <input type="number" class="w-full p-2 border rounded darlehen-sondertilgung-betrag" value="10000">
                                    <span class="ml-2">€</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Rhythmus</label>
                                <select class="w-full p-2 border rounded darlehen-sondertilgung-rhythmus">
                                    <option value="jaehrlich">Jährlich</option>
                                    <option value="monatlich">Monatlich</option>
                                    <option value="einmalig">Einmalig</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
