// ai-plausibility.js
// Nutzerbasierte API-Integration für KI-gestützte Plausibilisierung

document.addEventListener('DOMContentLoaded', function() {
  // KI-Plausibilisierungs-UI erstellen und einfügen
  initAiPlausibilisierungsUI();
});

// Konfiguration der unterstützten KI-Provider
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI (GPT-4)",
    apiUrlBase: "https://api.openai.com/v1",
    defaultModel: "gpt-4",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/180px-ChatGPT_logo.svg.png",
    validateKey: async (apiKey) => {
      try {
        const response = await fetch(`${AI_PROVIDERS.openai.apiUrlBase}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.ok;
      } catch (error) {
        console.error("OpenAI API key validation error:", error);
        return false;
      }
    },
    generatePrompt: (data) => {
      return {
        model: AI_PROVIDERS.openai.defaultModel,
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für Immobilienfinanzierung und Immobilienbewertung. Analysiere die folgenden Daten und gib eine fundierte Einschätzung zur Plausibilität des Immobilienkaufs und der Finanzierung ab. Gib deine Antwort in strukturiertem Format mit Bewertungen und Empfehlungen."
          },
          {
            role: "user",
            content: `Bitte analysiere folgende Baufinanzierung:
            
            Standort: PLZ ${data.plz}, Ort: ${data.ort}
            Objekttyp: ${data.objekttyp}
            Wohnfläche: ${data.wohnflaeche} m²
            Kaufpreis: ${formatCurrency(data.kaufpreis)} (${formatCurrency(data.kaufpreis / data.wohnflaeche)}/m²)
            
            Finanzierung:
            Darlehensbetrag: ${formatCurrency(data.darlehensbetrag)}
            Eigenkapital: ${formatCurrency(data.eigenkapital)} (${(data.eigenkapital / data.kaufpreis * 100).toFixed(1)}%)
            Zinssatz: ${data.zinssatz}%
            Tilgungssatz: ${data.tilgungssatz}%
            Monatliche Rate: ${formatCurrency(data.monatlicheRate)}
            
            Überprüfe, ob der Kaufpreis für diesen Standort angemessen ist, ob die Finanzierungsstruktur solide ist, und gib Empfehlungen.
            
            Strukturiere deine Antwort in folgende Abschnitte:
            1. Standortanalyse
            2. Kaufpreisbewertung
            3. Finanzierungsstruktur
            4. Empfehlungen`
          }
        ]
      };
    },
    callApi: async (apiKey, prompt) => {
      try {
        const response = await fetch(`${AI_PROVIDERS.openai.apiUrlBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prompt)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
      }
    }
  },
  deepseek: {
    name: "DeepSeek",
    apiUrlBase: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    logoUrl: "https://www.deepseek.com/favicon.ico",
    validateKey: async (apiKey) => {
      try {
        const response = await fetch(`${AI_PROVIDERS.deepseek.apiUrlBase}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.ok;
      } catch (error) {
        console.error("DeepSeek API key validation error:", error);
        return false;
      }
    },
    generatePrompt: (data) => {
      return {
        model: AI_PROVIDERS.deepseek.defaultModel,
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für Immobilienfinanzierung und Immobilienbewertung. Analysiere die folgenden Daten und gib eine fundierte Einschätzung zur Plausibilität des Immobilienkaufs und der Finanzierung ab. Gib deine Antwort in strukturiertem Format mit Bewertungen und Empfehlungen."
          },
          {
            role: "user",
            content: `Bitte analysiere folgende Baufinanzierung:
            
            Standort: PLZ ${data.plz}, Ort: ${data.ort}
            Objekttyp: ${data.objekttyp}
            Wohnfläche: ${data.wohnflaeche} m²
            Kaufpreis: ${formatCurrency(data.kaufpreis)} (${formatCurrency(data.kaufpreis / data.wohnflaeche)}/m²)
            
            Finanzierung:
            Darlehensbetrag: ${formatCurrency(data.darlehensbetrag)}
            Eigenkapital: ${formatCurrency(data.eigenkapital)} (${(data.eigenkapital / data.kaufpreis * 100).toFixed(1)}%)
            Zinssatz: ${data.zinssatz}%
            Tilgungssatz: ${data.tilgungssatz}%
            Monatliche Rate: ${formatCurrency(data.monatlicheRate)}
            
            Überprüfe, ob der Kaufpreis für diesen Standort angemessen ist, ob die Finanzierungsstruktur solide ist, und gib Empfehlungen.
            
            Strukturiere deine Antwort in folgende Abschnitte:
            1. Standortanalyse
            2. Kaufpreisbewertung
            3. Finanzierungsstruktur
            4. Empfehlungen`
          }
        ]
      };
    },
    callApi: async (apiKey, prompt) => {
      try {
        const response = await fetch(`${AI_PROVIDERS.deepseek.apiUrlBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prompt)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw error;
      }
    }
  }
};

// Initialisiere die UI für die KI-Plausibilisierung
function initAiPlausibilisierungsUI() {
  // Container erstellen
  const aiSectionContainer = document.createElement('div');
  aiSectionContainer.className = 'mt-8 p-6 bg-white rounded-lg shadow-md';
  aiSectionContainer.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">KI-gestützte Plausibilisierung</h2>
    <p class="mb-4">Nutzen Sie Ihre eigenen API-Schlüssel für eine KI-gestützte Analyse Ihrer Baufinanzierung.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="border rounded p-4 hover:shadow-md transition cursor-pointer" id="openai-provider">
        <div class="flex items-center mb-2">
          <img src="${AI_PROVIDERS.openai.logoUrl}" alt="OpenAI Logo" class="h-6 w-6 mr-2">
          <span class="font-medium">${AI_PROVIDERS.openai.name}</span>
        </div>
        <p class="text-sm text-gray-600">Nutzen Sie GPT-4 für eine detaillierte Analyse Ihrer Baufinanzierung.</p>
      </div>
      
      <div class="border rounded p-4 hover:shadow-md transition cursor-pointer" id="deepseek-provider">
        <div class="flex items-center mb-2">
          <img src="${AI_PROVIDERS.deepseek.logoUrl}" alt="DeepSeek Logo" class="h-6 w-6 mr-2">
          <span class="font-medium">${AI_PROVIDERS.deepseek.name}</span>
        </div>
        <p class="text-sm text-gray-600">DeepSeek's KI bewertet Ihre Immobilienfinanzierung und gibt Empfehlungen.</p>
      </div>
    </div>
    
    <div id="ai-key-input" class="hidden">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" id="selected-provider-label">API-Schlüssel</label>
        <div class="flex items-center">
          <input type="password" id="ai-api-key" class="w-full p-2 border rounded" placeholder="Ihr API-Schlüssel">
          <button id="validate-api-key" class="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Validieren</button>
        </div>
        <p class="text-xs text-gray-500 mt-1">Ihr API-Schlüssel wird nur für diese Anfrage verwendet und nicht gespeichert.</p>
      </div>
      
      <button id="run-ai-analysis" class="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition hidden">
        Plausibilisierung starten
      </button>
    </div>
    
    <div id="ai-analysis-result" class="mt-6 hidden">
      <h3 class="text-lg font-semibold mb-2">Analyseergebnis</h3>
      <div id="ai-analysis-content" class="p-4 bg-gray-50 rounded border whitespace-pre-line"></div>
    </div>
  `;
  
  // Container einfügen (nach dem Hauptrechner)
  const mainContainer = document.querySelector('.container.mx-auto.p-4');
  if (mainContainer) {
    mainContainer.appendChild(aiSectionContainer);
  }
  
  // Event-Listener für Provider-Auswahl
  let selectedProvider = null;
  
  document.getElementById('openai-provider').addEventListener('click', () => {
    selectProvider('openai');
  });
  
  document.getElementById('deepseek-provider').addEventListener('click', () => {
    selectProvider('deepseek');
  });
  
  // Provider auswählen
  function selectProvider(providerId) {
    selectedProvider = providerId;
    
    // UI aktualisieren
    document.querySelectorAll('#openai-provider, #deepseek-provider').forEach(el => {
      el.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    document.getElementById(`${providerId}-provider`).classList.add('border-blue-500', 'bg-blue-50');
    document.getElementById('selected-provider-label').textContent = `${AI_PROVIDERS[providerId].name} API-Schlüssel`;
    document.getElementById('ai-key-input').classList.remove('hidden');
    document.getElementById('run-ai-analysis').classList.add('hidden');
  }
  
  // Event-Listener für API-Schlüssel-Validierung
  document.getElementById('validate-api-key').addEventListener('click', async () => {
    if (!selectedProvider) return;
    
    const apiKeyInput = document.getElementById('ai-api-key');
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      alert('Bitte geben Sie einen API-Schlüssel ein.');
      return;
    }
    
    const validateButton = document.getElementById('validate-api-key');
    validateButton.textContent = 'Prüfe...';
    validateButton.disabled = true;
    
    try {
      const isValid = await AI_PROVIDERS[selectedProvider].validateKey(apiKey);
      
      if (isValid) {
        apiKeyInput.classList.add('border-green-500');
        document.getElementById('run-ai-analysis').classList.remove('hidden');
        alert('API-Schlüssel ist gültig!');
      } else {
        apiKeyInput.classList.add('border-red-500');
        alert('API-Schlüssel ist ungültig oder hat keine ausreichenden Berechtigungen.');
      }
    } catch (error) {
      console.error('Fehler bei der API-Schlüssel-Validierung:', error);
      alert(`Fehler bei der Validierung: ${error.message}`);
    } finally {
      validateButton.textContent = 'Validieren';
      validateButton.disabled = false;
    }
  });
  
  // Event-Listener für KI-Analyse
  document.getElementById('run-ai-analysis').addEventListener('click', async () => {
    if (!selectedProvider) return;
    
    const apiKey = document.getElementById('ai-api-key').value.trim();
    if (!apiKey) {
      alert('Bitte geben Sie einen gültigen API-Schlüssel ein.');
      return;
    }
    
    // Sammle alle benötigten Daten aus dem Baufi-Rechner
    const finanzierungsDaten = collectFinanzierungsDaten();
    
    // Überprüfe, ob alle notwendigen Daten vorhanden sind
    if (!finanzierungsDaten.plz || !finanzierungsDaten.ort) {
      alert('Bitte geben Sie PLZ und Ort im Abschnitt "Standortdaten" ein.');
      return;
    }
    
    // UI-Update: Lade-Zustand
    const analysisButton = document.getElementById('run-ai-analysis');
    analysisButton.textContent = 'Analyse läuft...';
    analysisButton.disabled = true;
    
    try {
      // Erstelle den Prompt für die KI
      const provider = AI_PROVIDERS[selectedProvider];
      const prompt = provider.generatePrompt(finanzierungsDaten);
      
      // API-Aufruf
      const analysisResult = await provider.callApi(apiKey, prompt);
      
      // Ergebnis anzeigen
      const resultContainer = document.getElementById('ai-analysis-content');
      resultContainer.textContent = analysisResult;
      document.getElementById('ai-analysis-result').classList.remove('hidden');
      
      // Zum Ergebnis scrollen
      document.getElementById('ai-analysis-result').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Fehler bei der KI-Analyse:', error);
      alert(`Fehler bei der Analyse: ${error.message}`);
    } finally {
      // UI-Update: Normaler Zustand
      analysisButton.textContent = 'Plausibilisierung starten';
      analysisButton.disabled = false;
    }
  });
}

// Funktion zum Sammeln aller Finanzierungsdaten aus dem UI
function collectFinanzierungsDaten() {
  // Versuche, die Daten aus dem UI zu extrahieren
  const darlehensbetrag = parseFloat(document.getElementById('darlehensbetrag')?.value || '0');
  const zinssatz = parseFloat(document.getElementById('zinssatz')?.value || '0');
  const tilgungssatz = parseFloat(document.getElementById('tilgungssatz')?.value || '0');
  
  // Standortdaten (diese müssten in der gleichen Form wie beim Beispiel oben hinzugefügt werden)
  const plz = document.getElementById('plz')?.value || '';
  const ort = document.getElementById('ort')?.value || '';
  const objekttyp = document.getElementById('objekttyp')?.value || 'Einfamilienhaus';
  const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value || '0');
  
  // Monatliche Rate aus dem Ergebnisbereich extrahieren
  const monatlicheRateElement = document.getElementById('monatlicheRate');
  let monatlicheRate = 0;
  if (monatlicheRateElement) {
    // Parsen der Währungsformatierung (entfernt € und Tausendertrennzeichen)
    const monatlicheRateText = monatlicheRateElement.textContent;
    monatlicheRate = parseFloat(monatlicheRateText.replace(/[^\d,]/g, '').replace(',', '.'));
  }
  
  // Kaufpreis berechnen (angenommen, der Darlehensbetrag ist 80% des Kaufpreises, wenn keine explizite Angabe)
  const kaufpreis = darlehensbetrag / 0.8; // Annahme: 20% Eigenkapital
  const eigenkapital = kaufpreis - darlehensbetrag;
  
  return {
    plz,
    ort,
    objekttyp,
    wohnflaeche,
    kaufpreis,
    darlehensbetrag,
    eigenkapital,
    zinssatz,
    tilgungssatz,
    monatlicheRate
  };
}

// Formatierungsfunktion für Währungsbeträge
function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
