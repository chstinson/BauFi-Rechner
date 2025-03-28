// detaillierte-objektdaten.js
// Erweitert den BauFi-Rechner um detaillierte Objektdaten-Eingaben

document.addEventListener('DOMContentLoaded', function() {
    // Container für erweiterte Objektdaten erstellen und einfügen
    initDetailedObjectForm();
});

// Detaillierte Objektdaten-Eingabemaske initialisieren
function initDetailedObjectForm() {
    // Bestehenden Container finden
    const standortContainer = document.querySelector('.mb-6 h2.text-xl:contains("Standortdaten")');
    
    // Falls der Container noch nicht existiert oder eine andere Struktur hat
    if (!standortContainer) {
        // Alternativ: Wir fügen ein neues Element am Anfang des Hauptcontainers ein
        const mainContainer = document.querySelector('.bg-white.rounded-lg.shadow-md.p-6');
        if (!mainContainer) return;
        
        const detailedObjectSection = document.createElement('div');
        detailedObjectSection.className = 'mb-6';
        detailedObjectSection.innerHTML = createDetailedObjectHTML();
        
        // Am Anfang einfügen
        mainContainer.insertBefore(detailedObjectSection, mainContainer.firstChild);
    } else {
        // Bestehenden Container ersetzen
        const parentElement = standortContainer.parentNode;
        const detailedObjectSection = document.createElement('div');
        detailedObjectSection.className = 'mb-6';
        detailedObjectSection.innerHTML = createDetailedObjectHTML();
        
        parentElement.replaceWith(detailedObjectSection);
    }
    
    // Event Listener für die erweiterten Eingabefelder
    setupEventListeners();
    
    // Toggle für erweiterte Ansicht
    const toggleButton = document.getElementById('toggle-detailed-view');
    const detailedFieldsets = document.querySelectorAll('.detailed-object-data');
    
    toggleButton.addEventListener('click', function() {
        detailedFieldsets.forEach(fieldset => {
            fieldset.classList.toggle('hidden');
        });
        
        // Button-Text ändern
        if (toggleButton.textContent.includes('Mehr')) {
            toggleButton.textContent = 'Weniger Details anzeigen';
            toggleButton.classList.remove('bg-blue-500');
            toggleButton.classList.add('bg-gray-500');
        } else {
            toggleButton.textContent = 'Mehr Details anzeigen';
            toggleButton.classList.remove('bg-gray-500');
            toggleButton.classList.add('bg-blue-500');
        }
    });
}

// HTML für die detaillierte Objektdaten-Eingabemaske
function createDetailedObjectHTML() {
    return `
    <h2 class="text-xl font-semibold mb-4">Objektdaten</h2>
    
    <!-- Basis-Objektdaten -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="block text-sm font-medium mb-1">Objekttyp</label>
            <select id="objekttyp" class="w-full p-2 border rounded">
                <option value="Einfamilienhaus">Einfamilienhaus</option>
                <option value="Doppelhaushälfte">Doppelhaushälfte</option>
                <option value="Reihenhaus">Reihenhaus</option>
                <option value="Eigentumswohnung">Eigentumswohnung</option>
                <option value="Mehrfamilienhaus">Mehrfamilienhaus</option>
                <option value="Grundstück">Grundstück</option>
            </select>
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-1">Nutzungsart</label>
            <select id="nutzungsart" class="w-full p-2 border rounded">
                <option value="Eigennutzung">Eigennutzung</option>
                <option value="Kapitalanlage">Kapitalanlage</option>
                <option value="Teilweise vermietet">Teilweise vermietet</option>
            </select>
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-1">Wohnfläche in m²</label>
            <input type="number" id="wohnflaeche" class="w-full p-2 border rounded" value="120">
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-1">Grundstücksfläche in m²</label>
            <input type="number" id="grundstuecksflaeche" class="w-full p-2 border rounded" value="500">
        </div>
    </div>
    
    <!-- Standortdaten -->
    <fieldset class="mb-4 p-4 border rounded">
        <legend class="font-medium px-2">Standort</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Straße & Hausnummer</label>
                <input type="text" id="strasse" class="w-full p-2 border rounded" placeholder="Musterstr. 123">
            </div>
            
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-sm font-medium mb-1">PLZ</label>
                    <input type="text" id="plz" class="w-full p-2 border rounded" placeholder="12345">
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Ort</label>
                    <input type="text" id="ort" class="w-full p-2 border rounded" placeholder="Musterstadt">
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Bundesland</label>
                <select id="bundesland" class="w-full p-2 border rounded">
                    <option value="">Bitte wählen...</option>
                    <option value="Baden-Württemberg">Baden-Württemberg</option>
                    <option value="Bayern">Bayern</option>
                    <option value="Berlin">Berlin</option>
                    <option value="Brandenburg">Brandenburg</option>
                    <option value="Bremen">Bremen</option>
                    <option value="Hamburg">Hamburg</option>
                    <option value="Hessen">Hessen</option>
                    <option value="Mecklenburg-Vorpommern">Mecklenburg-Vorpommern</option>
                    <option value="Niedersachsen">Niedersachsen</option>
                    <option value="Nordrhein-Westfalen">Nordrhein-Westfalen</option>
                    <option value="Rheinland-Pfalz">Rheinland-Pfalz</option>
                    <option value="Saarland">Saarland</option>
                    <option value="Sachsen">Sachsen</option>
                    <option value="Sachsen-Anhalt">Sachsen-Anhalt</option>
                    <option value="Schleswig-Holstein">Schleswig-Holstein</option>
                    <option value="Thüringen">Thüringen</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Lagekategorie</label>
                <select id="lage" class="w-full p-2 border rounded">
                    <option value="Sehr gut">Sehr gute Lage</option>
                    <option value="Gut" selected>Gute Lage</option>
                    <option value="Mittel">Mittlere Lage</option>
                    <option value="Einfach">Einfache Lage</option>
                </select>
            </div>
        </div>
    </fieldset>
    
    <!-- Toggle für erweiterte Felder -->
    <button id="toggle-detailed-view" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-full">
        Mehr Details anzeigen
    </button>
    
    <!-- Detaillierte Objektdaten (initial versteckt) -->
    <fieldset class="mb-4 p-4 border rounded detailed-object-data hidden">
        <legend class="font-medium px-2">Objektdetails</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Baujahr</label>
                <input type="number" id="baujahr" class="w-full p-2 border rounded" placeholder="1980">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Zustand</label>
                <select id="zustand" class="w-full p-2 border rounded">
                    <option value="Neubau">Neubau</option>
                    <option value="Neuwertig">Neuwertig</option>
                    <option value="Modernisiert">Modernisiert</option>
                    <option value="Gepflegt">Gepflegt</option>
                    <option value="Renovierungsbedürftig">Renovierungsbedürftig</option>
                    <option value="Sanierungsbedürftig">Sanierungsbedürftig</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Anzahl Zimmer</label>
                <input type="number" id="zimmer" class="w-full p-2 border rounded" placeholder="4" min="1" step="0.5">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Energieeffizienzklasse</label>
                <select id="energieeffizienzklasse" class="w-full p-2 border rounded">
                    <option value="">Keine Angabe</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="H">H</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Heizungsart</label>
                <select id="heizungsart" class="w-full p-2 border rounded">
                    <option value="">Bitte wählen...</option>
                    <option value="Gas">Gas</option>
                    <option value="Öl">Öl</option>
                    <option value="Fernwärme">Fernwärme</option>
                    <option value="Wärmepumpe">Wärmepumpe</option>
                    <option value="Pellets">Pellets</option>
                    <option value="Sonstige">Sonstige</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Letzte Modernisierung</label>
                <input type="number" id="letzte_modernisierung" class="w-full p-2 border rounded" placeholder="2010">
            </div>
        </div>
    </fieldset>
    
    <!-- Preisdaten (initial versteckt) -->
    <fieldset class="mb-4 p-4 border rounded detailed-object-data hidden">
        <legend class="font-medium px-2">Preisdaten</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Kaufpreis</label>
                <div class="flex items-center">
                    <input type="number" id="kaufpreis" class="w-full p-2 border rounded" placeholder="450000">
                    <span class="ml-2">€</span>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Kaufpreis pro m²</label>
                <div class="p-2 border rounded bg-gray-100" id="kaufpreis_qm">-</div>
            </div>
            
            <div class="kapitalanlage-field hidden">
                <label class="block text-sm font-medium mb-1">Monatliche Kaltmiete</label>
                <div class="flex items-center">
                    <input type="number" id="kaltmiete" class="w-full p-2 border rounded" placeholder="1200">
                    <span class="ml-2">€</span>
                </div>
            </div>
            
            <div class="kapitalanlage-field hidden">
                <label class="block text-sm font-medium mb-1">Mietrendite</label>
                <div class="p-2 border rounded bg-gray-100" id="mietrendite">-</div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Nebenkosten Kauf</label>
                <div class="flex items-center">
                    <input type="number" id="nebenkosten_prozent" class="w-20 p-2 border rounded" value="13.5">
                    <span class="ml-2 mr-4">%</span>
                    <div class="p-2 border rounded bg-gray-100 flex-grow" id="nebenkosten_absolut">-</div>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Modernisierungskosten</label>
                <div class="flex items-center">
                    <input type="number" id="modernisierungskosten" class="w-full p-2 border rounded" placeholder="0">
                    <span class="ml-2">€</span>
                </div>
            </div>
        </div>
    </fieldset>
    `;
}

// Event Listener für die Eingabefelder
function setupEventListeners() {
    // Kaufpreis pro m² berechnen
    const kaufpreisInput = document.getElementById('kaufpreis');
    const wohnflaecheInput = document.getElementById('wohnflaeche');
    const kaufpreisQmOutput = document.getElementById('kaufpreis_qm');
    
    function updateKaufpreisQm() {
        const kaufpreis = parseFloat(kaufpreisInput.value);
        const wohnflaeche = parseFloat(wohnflaecheInput.value);
        
        if (kaufpreis && wohnflaeche) {
            const preisProQm = kaufpreis / wohnflaeche;
            kaufpreisQmOutput.textContent = formatCurrency(preisProQm);
        } else {
            kaufpreisQmOutput.textContent = '-';
        }
    }
    
    if (kaufpreisInput && wohnflaecheInput && kaufpreisQmOutput) {
        kaufpreisInput.addEventListener('input', updateKaufpreisQm);
        wohnflaecheInput.addEventListener('input', updateKaufpreisQm);
    }
    
    // Nebenkosten absolut berechnen
    const nebenkostenProzentInput = document.getElementById('nebenkosten_prozent');
    const nebenkostenAbsolutOutput = document.getElementById('nebenkosten_absolut');
    
    function updateNebenkostenAbsolut() {
        const kaufpreis = parseFloat(kaufpreisInput.value);
        const nebenkostenProzent = parseFloat(nebenkostenProzentInput.value);
        
        if (kaufpreis && nebenkostenProzent) {
            const nebenkostenAbsolut = kaufpreis * (nebenkostenProzent / 100);
            nebenkostenAbsolutOutput.textContent = formatCurrency(nebenkostenAbsolut);
        } else {
            nebenkostenAbsolutOutput.textContent = '-';
        }
    }
    
    if (kaufpreisInput && nebenkostenProzentInput && nebenkostenAbsolutOutput) {
        kaufpreisInput.addEventListener('input', updateNebenkostenAbsolut);
        nebenkostenProzentInput.addEventListener('input', updateNebenkostenAbsolut);
    }
    
    // Mietrendite berechnen
    const kaltmieteInput = document.getElementById('kaltmiete');
    const mietrenditeOutput = document.getElementById('mietrendite');
    
    function updateMietrendite() {
        const kaufpreis = parseFloat(kaufpreisInput.value);
        const kaltmiete = parseFloat(kaltmieteInput.value);
        
        if (kaufpreis && kaltmiete) {
            const jahresmiete = kaltmiete * 12;
            const rendite = (jahresmiete / kaufpreis) * 100;
            mietrenditeOutput.textContent = rendite.toFixed(2) + '%';
        } else {
            mietrenditeOutput.textContent = '-';
        }
    }
    
    if (kaufpreisInput && kaltmieteInput && mietrenditeOutput) {
        kaufpreisInput.addEventListener('input', updateMietrendite);
        kaltmieteInput.addEventListener('input', updateMietrendite);
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
    
    if (nutzungsartSelect) {
        nutzungsartSelect.addEventListener('change', toggleKapitalanlageFields);
        toggleKapitalanlageFields(); // Initial ausführen
    }
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
