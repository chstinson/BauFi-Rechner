// object.js
// Funktionalität für die Objektdaten des BauFi-Rechners

function initObjectData() {
    // Toggle für erweiterte Felder
    const toggleButton = document.getElementById('toggle-detailed-view');
    const detailedFieldsets = document.querySelectorAll('.detailed-object-data');
    
    toggleButton.addEventListener('click', function() {
        detailedFieldsets.forEach(fieldset => {
            fieldset.classList.toggle('hidden');
        });
        
        // Button-Text und Icon ändern
        if (toggleButton.innerHTML.includes('Mehr')) {
            toggleButton.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Weniger Details anzeigen';
            toggleButton.classList.remove('bg-blue-500');
            toggleButton.classList.add('bg-gray-500');
        } else {
            toggleButton.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>Mehr Details anzeigen';
            toggleButton.classList.remove('bg-gray-500');
            toggleButton.classList.add('bg-blue-500');
        }
    });
    
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
