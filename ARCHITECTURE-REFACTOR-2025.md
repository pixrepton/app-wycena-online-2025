# 🏗️ Refaktoryzacja Architektury - Wycena 2025
## Cel: Uporządkowanie i przebudowa aplikacji dla czystej, skalowalnej struktury

---

## 📋 1. Analiza obecnego stanu

**Aplikacja posiada:**
- ✅ 4 tryby wejścia (budowa z projektem, modernizacja, znana moc, pełny kalkulator)
- ✅ Formularz HTML (`heatCalcFormFull`) z dynamicznymi sekcjami
- ✅ JS pliki (`pdfGenerator.js`, `formDataProcessor.js`, `appController.js`)
- ✅ Python Flask backend z AI PDF analyzer (Groq integration)
- ✅ System ZORDON_STATE dla globalnego stanu
- ✅ PHP legacy files (do refaktoryzacji)
- ✅ WordPress plugin architecture

---

## 🎯 2. Definicja granic warstw aplikacji

### **Frontend Layer**
**Odpowiedzialność:** Interfejs użytkownika, formulary, routing UI
- HTML templates i komponenty
- CSS styling (Hetzner-style design)
- JavaScript controllers i event handlers
- State management (ZORDON_STATE)

### **Controllers Layer**
**Odpowiedzialność:** Logika aplikacji, routing, orchestration
- Mode switching logic
- Form validation
- API communication
- State updates

### **Services Layer**
**Odpowiedzialność:** Business logic, external integrations
- PDF generation services
- AI analysis (Groq integration)
- External API proxies (cieplo.app)
- Email sending

### **Backend Layer**
**Odpowiedzialność:** Server-side processing, data persistence
- Flask API endpoints
- File upload handling
- PDF processing
- Database operations (if needed)

### **Templates Layer**
**Odpowiedzialność:** Document templates i content generation
- DOCX templates
- PDF layouts
- Email templates

---

## 📁 3. Nowa struktura katalogów

```
/wycena-2025/
├── frontend/                          # Frontend Layer
│   ├── index.html                     # Main HTML file
│   ├── welcome-screen.html            # Welcome screen component
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css              # Main styles
│   │   │   ├── components.css        # UI components
│   │   │   └── themes/
│   │   │       └── hetzner-style.css # Professional theme
│   │   ├── js/
│   │   │   ├── core/
│   │   │   │   ├── app.js           # Main app initialization
│   │   │   │   ├── state.js         # ZORDON_STATE management
│   │   │   │   └── config.js        # Configuration
│   │   │   ├── components/
│   │   │   │   ├── forms/
│   │   │   │   │   ├── mode1-full.js
│   │   │   │   │   ├── mode2-ai.js
│   │   │   │   │   ├── mode3-modern.js
│   │   │   │   │   └── mode4-power.js
│   │   │   │   ├── ui/
│   │   │   │   │   ├── welcome.js
│   │   │   │   │   ├── tooltips.js
│   │   │   │   │   └── notifications.js
│   │   │   │   └── widgets/
│   │   │   │       ├── floor-renderer.js
│   │   │   │       └── results-display.js
│   │   │   └── utils/
│   │   │       ├── validation.js
│   │   │       ├── formatting.js
│   │   │       └── helpers.js
│   │   └── images/
│   │       └── icons/
│   └── templates/
│       ├── form-sections/           # HTML templates
│       └── modals/
│
├── controllers/                      # Controllers Layer
│   ├── appController.js             # ✅ Main application controller (existing)
│   ├── routeController.js           # Navigation and routing
│   ├── formController.js            # Form handling and validation
│   └── dataController.js            # Data processing and management
│
├── services/                        # Services Layer
│   ├── api/
│   │   ├── client.js               # API client configuration
│   │   ├── endpoints.js            # API endpoint definitions
│   │   └── interceptors.js         # Request/response interceptors
│   ├── pdf/
│   │   ├── generator.js            # PDF generation service
│   │   ├── analyzer.js             # AI PDF analysis client
│   │   └── converter.js            # DOCX to PDF conversion
│   ├── external/
│   │   ├── cieplo-api.js          # cieplo.app integration
│   │   └── email-service.js        # Email sending
│   └── storage/
│       ├── local-storage.js        # Browser storage
│       └── session-storage.js      # Session management
│
├── backend/                         # Backend Layer
│   ├── python/                     # ✅ Current Flask backend
│   │   ├── main.py                 # ✅ Main Flask app (existing)
│   │   ├── run_flask_only.py       # ✅ Simplified startup (existing)
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py       # ✅ API routes (existing)
│   │   │   │   ├── pdf_routes.py   # PDF-specific endpoints
│   │   │   │   └── health.py       # Health check endpoints
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── pdf_analyzer.py # ✅ AI PDF analyzer (existing)
│   │   │   │   ├── document_generator.py
│   │   │   │   └── email_sender.py
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── validators.py   # ✅ Input validation (existing)
│   │   │   │   ├── calculations.py # ✅ Math utilities (existing)
│   │   │   │   └── file_handlers.py
│   │   │   └── config.py           # ✅ Configuration (existing)
│   │   └── requirements.txt
│   └── php/                        # Legacy PHP (to refactor)
│       ├── gen-pdf.php             # ✅ PDF generation (existing)
│       ├── kalkulator.php          # ✅ Calculator logic (existing)
│       └── proxy-cieplo.php        # API proxy
│
├── templates/                       # Templates Layer
│   ├── documents/
│   │   ├── pdf/
│   │   │   ├── offer-template.html
│   │   │   └── report-template.html
│   │   └── docx/
│   │       ├── szablon2.docx       # ✅ Document template (existing)
│   │       └── szablon3.docx
│   ├── email/
│   │   ├── offer-email.html
│   │   └── notification.html
│   └── components/
│       ├── header.html
│       └── footer.html
│
├── config/                          # Configuration
│   ├── development.json
│   ├── production.json
│   └── wordpress-plugin.json       # WordPress integration config
│
├── docs/                           # Documentation
│   ├── api/
│   │   ├── endpoints.md
│   │   └── authentication.md
│   ├── deployment/
│   │   ├── setup.md
│   │   └── wordpress-install.md
│   └── development/
│       ├── getting-started.md
│       └── architecture.md
│
├── tests/                          # Testing
│   ├── unit/
│   │   ├── frontend/
│   │   ├── services/
│   │   └── backend/
│   ├── integration/
│   │   ├── api-tests.js
│   │   └── workflow-tests.js
│   └── e2e/
│       └── user-scenarios.js
│
├── deployment/                     # Deployment
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── wordpress/
│   │   ├── plugin-header.php
│   │   └── activation.php
│   └── scripts/
│       ├── build.sh
│       └── deploy.sh
│
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json                    # Frontend dependencies
├── requirements.txt                # Python dependencies
├── composer.json                   # PHP dependencies (if needed)
└── README-WYCENA2025.md           # ✅ Project documentation (existing)
```

---

## 🔄 4. Dokładny przepływ danych (Data Flow)

### **Scenariusz 1: Mode 2 - AI PDF Analysis**

```
1. 👤 USER ACTION
   └── Wybiera "Budowa z projektem" na welcome screen
   └── Uploada PDF file

2. 🎛️ FRONTEND CONTROLLER
   └── appController.js switchToMode('mode2')
   └── Aktualizuje ZORDON_STATE.currentMode = 'mode2'
   └── Pokazuje mode2-ai.js component

3. 📄 PDF PROCESSING
   └── pdfUploadHandler.js sends file to /api/analyze-pdf
   └── Python backend (pdf_analyzer.py) przetwarza PDF
   └── Groq AI analyzuje dokument i wyciąga dane

4. 🔄 DATA FLOW
   └── AI response → backend validation → ZORDON_STATE update
   └── formController.js przetwarza dane
   └── dataController.js oblicza moc i dobiera pompę

5. 📊 RESULTS & PDF
   └── resultsRenderer.js wyświetla wyniki
   └── pdfGenerator.js tworzy PDF offer
   └── emailSender.js wysyła PDF na email

6. 💾 STATE PERSISTENCE
   └── localStorage saves ZORDON_STATE
   └── URL parameters dla sharing
```

### **Scenariusz 2: Mode 1 - Pełny Kalkulator**

```
1. 👤 USER ACTION
   └── Wybiera "Pełny kalkulator" → 6-step wizard

2. 🎛️ STEP-BY-STEP PROCESSING
   Step 1: Lokalizacja → kod pocztowy validation
   Step 2: Budynek → typ, powierzchnia, kondygnacje
   Step 3: Ogrzewanie → temperatura, system
   Step 4: CWU → zapotrzebowanie, priorytet
   Step 5: Bufor → typ, pojemność
   Step 6: Przegląd → podsumowanie i kalkulacja

3. 🧮 CALCULATION ENGINE
   └── formDataProcessor.js zbiera dane z każdego kroku
   └── cieplo-api.js proxy do cieplo.app dla obliczeń
   └── calculations.py waliduje i przetwarza dane

4. 🎯 RESULT MATCHING
   └── Algorytm doboru pompy na base mocy i parametrów
   └── Pricing calculation z marżami
   └── Equipment recommendations

5. 📄 PDF GENERATION
   └── szablon2.docx template
   └── Data substitution (Python)
   └── DOCX → PDF conversion
   └── Email delivery
```

---

## ✅ 5. Checklist testów

### **Startup Tests**
- [ ] Port 5000 otwiera się bez błędów
- [ ] Wszystkie JS moduły ładują się poprawnie
- [ ] ZORDON_STATE inicjalizuje się z domyślnymi wartościami
- [ ] Welcome screen renderuje się prawidłowo

### **Mode Tests**
- [ ] Mode 1: Pełny kalkulator - wszystkie 6 kroków
- [ ] Mode 2: AI PDF Analysis - upload i analiza działają
- [ ] Mode 3: Modernizacja - kalkulacje na base audytu
- [ ] Mode 4: Znana moc - manual input i validation

### **Data Integrity Tests**
- [ ] ZORDON_STATE zawiera wszystkie wymagane pola
- [ ] Nie brakuje danych: price, kit, calculatedPower
- [ ] Validation działa na każdym kroku
- [ ] Error handling dla API failures

### **PDF Generation Tests**
- [ ] PDF generuje się z poprawnymi danymi
- [ ] Placeholders są zastąpione wartościami
- [ ] Template DOCX format jest zachowany
- [ ] Email attachment działa prawidłowo

### **Integration Tests**
- [ ] cieplo.app API proxy działa
- [ ] Groq AI PDF analysis responds
- [ ] Email sending service functional
- [ ] WordPress plugin compatibility

---

## 🚀 6. Migration Plan

### **Phase 1: Structure Setup** (Week 1)
1. Create new directory structure
2. Move existing files to appropriate folders
3. Update import paths and references
4. Test basic functionality

### **Phase 2: Controllers Refactor** (Week 2)
1. Extract logic from existing JS files to controllers/
2. Implement proper separation of concerns
3. Update ZORDON_STATE management
4. Create service layer abstractions

### **Phase 3: Backend Consolidation** (Week 3)
1. Migrate PHP functionality to Python where possible
2. Standardize API endpoints
3. Implement proper error handling
4. Add comprehensive logging

### **Phase 4: Testing & Documentation** (Week 4)
1. Implement test suite
2. Update documentation
3. Performance optimization
4. WordPress plugin finalization

---

## 📝 7. Files to Move/Update

### **✅ Keep and Enhance**
- `appController.js` → `controllers/appController.js`
- `main.py` → `backend/python/main.py`
- `src/services/pdf_analyzer.py` → `backend/python/src/services/pdf_analyzer.py`
- `README-WYCENA2025.md` → update with new structure

### **🔄 Refactor and Move**
- `pdfGenerator.js` → `services/pdf/generator.js`
- `formDataProcessor.js` → `controllers/formController.js`
- `resultsRenderer.js` → `frontend/assets/js/components/widgets/results-display.js`
- `emailSender.js` → `services/external/email-service.js`

### **🗑️ Legacy to Review**
- `gen-pdf.php` → evaluate if migrate to Python or keep
- `kalkulator.php` → migrate logic to Python backend
- Old CSS files in nieuzywane/ → archive or remove

### **📦 New Files to Create**
- `controllers/routeController.js` - navigation logic
- `services/api/client.js` - centralized API client
- `frontend/assets/js/core/state.js` - ZORDON_STATE management
- `backend/python/src/api/health.py` - health check endpoints

---

**Next Steps:**
1. Review and approve this architecture plan
2. Begin Phase 1 implementation
3. Test each phase thoroughly before proceeding
4. Update documentation continuously

This refactoring will create a maintainable, scalable architecture that separates concerns properly and allows for future enhancements.