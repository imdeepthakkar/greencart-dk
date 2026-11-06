// GreenCart DK - Frontend Application logic (Multilingual)

document.addEventListener("DOMContentLoaded", () => {
    // API client handles
    const API_BASE = ""; // Relative routes make it Vercel-compatible out-of-the-box
    
    // Translation Dictionary
    const TRANSLATIONS = {
        da: {
            placeholder: "Indtast postnummer (f.eks. 2730)...",
            searchBtn: "Søg",
            apiStatus: "Salling API Live",
            supermarkets: "Supermarkeder",
            storesFound: "fundet",
            foodWasteDeals: "Madspild Tilbud",
            selectStore: "Vælg en butik",
            activeStoreAddress: "Adresse",
            noStores: "Ingen butikker",
            noStoresMsg: "Der blev ikke fundet nogen butikker med aktive madspildsvarer her.",
            loadingStores: "Søger efter butikker i {zip}...",
            loadingTitle: "Henter butikker...",
            dealsAvailable: "tilbud tilgængelige",
            noDeals: "Ingen aktive tilbud",
            noDealsMsg: "Denne butik har i øjeblikket ikke registreret nogle nedsatte varer. Tjek igen senere!",
            noStoreSelected: "Ingen butik valgt",
            noStoreSelectedMsg: "Vælg en butik fra listen til venstre for at se deres aktuelle madspildsvarer og rabatter.",
            assistantTitle: "GreenCart Assistent",
            assistantWelcome: "Hej! Jeg er din <strong>GreenCart Assistent</strong>.<br><br>Spørg mig om tilbud eller find butikker. Prøv f.eks. at skrive:",
            assistantSuggest1: "Find madspild i 2730",
            assistantSuggest2: "Har Netto nogle tilbud?",
            quickReply1: "Madspild i 2730",
            quickReply2: "Netto tilbud",
            quickReply3: "føtex butikker",
            chatInputPlaceholder: "Spørg om madspild eller butikker...",
            stock: "Lager",
            lowStock: "Få tilbage!",
            errorLoading: "Fejl under søgning",
            errorLoadingMsg: "Det var ikke muligt at forbinde til serveren. Kontroller venligst at backend-serveren kører.",
            brandAll: "Alle",
            foodAll: "Alle",
            foodVegan: "Vegansk",
            foodVeg: "Vegetarisk",
            foodNonVeg: "Kød & Fisk",
            noDealsFiltered: "Ingen tilbud fundet",
            noDealsFilteredMsg: "Der er ingen tilbud i denne butik, som matcher det valgte kostfilter."
        },
        en: {
            placeholder: "Enter ZIP code (e.g. 2730)...",
            searchBtn: "Search",
            apiStatus: "Salling API Live",
            supermarkets: "Supermarkets",
            storesFound: "found",
            foodWasteDeals: "Food Waste Deals",
            selectStore: "Select a store",
            activeStoreAddress: "Address",
            noStores: "No Stores",
            noStoresMsg: "No stores with active food waste clearance deals were found here.",
            loadingStores: "Searching for stores in {zip}...",
            loadingTitle: "Loading stores...",
            dealsAvailable: "deals available",
            noDeals: "No active deals",
            noDealsMsg: "This store currently has no registered clearance items. Check back later!",
            noStoreSelected: "No store selected",
            noStoreSelectedMsg: "Select a store from the list on the left to view their current clearance products and discounts.",
            assistantTitle: "GreenCart Assistant",
            assistantWelcome: "Hi! I am your <strong>GreenCart Assistant</strong>.<br><br>Ask me about deals or find stores. For example, try typing:",
            assistantSuggest1: "Find food waste in 2730",
            assistantSuggest2: "Does Netto have any deals?",
            quickReply1: "Food waste in 2730",
            quickReply2: "Netto deals",
            quickReply3: "føtex stores",
            chatInputPlaceholder: "Ask about food waste or stores...",
            stock: "Stock",
            lowStock: "Low stock!",
            errorLoading: "Search error",
            errorLoadingMsg: "Could not connect to the server. Please verify the backend server is running.",
            brandAll: "All",
            foodAll: "All",
            foodVegan: "Vegan",
            foodVeg: "Vegetarian",
            foodNonVeg: "Non-Veg",
            noDealsFiltered: "No deals found",
            noDealsFilteredMsg: "No clearance items in this store match your selected food filter."
        }
    };

    // DOM Elements
    const zipForm = document.getElementById("zip-form");
    const zipInput = document.getElementById("zip-input");
    const storesList = document.getElementById("stores-list");
    const storesCount = document.getElementById("stores-count");
    const clearancesGrid = document.getElementById("clearances-grid");
    const clearanceCount = document.getElementById("clearance-count");
    const activeStoreInfo = document.getElementById("active-store-info");
    const activeStoreName = document.getElementById("active-store-name");
    const activeStoreAddress = document.getElementById("active-store-address");
    const activeStoreBrand = document.getElementById("active-store-brand");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    const filterChips = document.querySelectorAll(".filter-chip");
    const replyChips = document.querySelectorAll(".reply-chip");
    
    // Food Preference DOM Elements
    const foodPreferenceFilters = document.getElementById("food-preference-filters");
    const foodFilterChips = document.querySelectorAll(".food-filter-chip");
    
    // Lang selector DOM Elements
    const langBtnDa = document.getElementById("lang-da");
    const langBtnEn = document.getElementById("lang-en");

    // State Variables
    let currentStores = [];
    let currentBrandFilter = "all";
    let currentFoodFilter = "all";
    let selectedStoreId = null;
    let currentLang = "da";

    // Category Icon Mapper
    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes("mejeri") || cat.includes("dairy") || cat.includes("ost") || cat.includes("cheese")) return "fa-cheese";
        if (cat.includes("brød") || cat.includes("kage") || cat.includes("bakery") || cat.includes("bread")) return "fa-bread-slice";
        if (cat.includes("kød") || cat.includes("bacon") || cat.includes("meat") || cat.includes("pålæg")) return "fa-bacon";
        if (cat.includes("frugt") || cat.includes("grønt") || cat.includes("fruit") || cat.includes("veg") || cat.includes("salat")) return "fa-apple-whole";
        if (cat.includes("fisk") || cat.includes("skaldyr") || cat.includes("fish") || cat.includes("seafood")) return "fa-fish";
        if (cat.includes("drik") || cat.includes("soda") || cat.includes("juice") || cat.includes("øl") || cat.includes("beer")) return "fa-bottle-water";
        if (cat.includes("kaffe") || cat.includes("te") || cat.includes("coffee") || cat.includes("tea")) return "fa-mug-hot";
        return "fa-bag-shopping";
    };

    // Helper to clean top-level department name from category path
    const cleanCategoryPath = (path) => {
        if (!path) return "";
        const parts = path.split(">").map(p => p.trim());
        return parts.length > 1 ? parts.slice(1).join(" > ") : path;
    };

    // Classify product food type: 'vegan', 'veg' (vegetarian), or 'non-veg'
    const classifyProduct = (product) => {
        const desc = (product.description || "").toLowerCase();
        const catDa = cleanCategoryPath(product.categories.da || "").toLowerCase();
        const catEn = cleanCategoryPath(product.categories.en || "").toLowerCase();
        
        // Comprehensive Non-Veg Keywords (Meat, Fish, Poultry, Seafood, Game, Butcher terms)
        const nonVegKeywords = [
            // Danish Meat / Poultry / Butcher
            "kød", "okse", "svine", "gris", "kylling", "bacon", "skinke", "pøl", "salami", "leverpostej", 
            "pålæg", "hakket", "fars", "bryst", "vinge", "lår", "filet", "strimler", "kødboller", 
            "frikadeller", "medister", "kotelet", "bøf", "steak", "ribeye", "entrecote", "culotte", 
            "højreb", "flæsk", "mørbrad", "slagter", "vildt", "hjort", "dyrekød", "lam", "kalkun", 
            "and", "ande", "ænder", "gås", "gæs", "due", "fasan", "rensdyr", "roastbeef", "hamburgerryg", 
            "rullepølse", "spegepølse", "spegepøl", "grillbakke", "kamben", "ribben", "spareribs", 
            "kamsteg", "svinekam", "nakkekam", "skank", "frikadelle", "kødbolle",
            
            // Danish Fish / Seafood
            "fisk", "laks", "torsk", "rødspætte", "reje", "rejer", "musling", "muslinger", "hummer", 
            "skaldyr", "krabbe", "makrel", "sild", "tun", "ørred", "hellefisk", "sej", "kuller", 
            "havtaske", "blæksprutte", "calamari", "østers", "rogn", "kaviar",
            
            // English Meat / Poultry / Fish / Seafood
            "meat", "beef", "pork", "chicken", "poultry", "ham", "sausage", "pepperoni", "turkey", 
            "lamb", "duck", "goose", "pheasant", "venison", "veal", "chops", "minced", "patty", 
            "meatball", "meatballs", "butcher", "charcuterie", "pastrami", "prosciutto", "pancetta",
            "fish", "salmon", "cod", "plaice", "shrimp", "shrimps", "prawn", "prawns", "mussel", 
            "mussels", "lobster", "seafood", "crab", "mackerel", "herring", "tuna", "trout", 
            "squid", "octopus", "oysters", "caviar", "anchovy", "anchovies", "sardine", "sardines", 
            "halibut"
        ];
        
        // Comprehensive Vegetarian Keywords (Dairy, Eggs, Honey, and Gelatin)
        const dairyEggKeywords = [
            // Danish Dairy / Eggs / Honey
            "mælk", "ost", "smør", "fløde", "æg", "yoghurt", "skyr", "smørbart", "kærgården", "creme", 
            "kvark", "hytteost", "parmesan", "mozzarella", "cheddar", "feta", "mascarpone", "ricotta", 
            "honning", "gelatine", "husblas", "bivoks", "carmine", "karmin", "valle",
            
            // English Dairy / Eggs / Honey
            "milk", "cheese", "butter", "cream", "egg", "eggs", "yoghurt", "yogurt", "whey", "casein", 
            "laktose", "lactose", "buttermilk", "honey", "gelatin", "gelatine", "beeswax", "cochineal", 
            "shellac"
        ];

        // Plant-based alternatives indicators to prevent false positives on meat-free/dairy-free substitutes
        const alternativeKeywords = [
            "vegansk", "vegan", "vegetarisk", "vegetarian", "kødfri", "plantebaseret", "plantebaserede",
            "plant-based", "planti", "naturli'", "mælkefri", "dairy-free", "meat-free"
        ];

        // Helper to match keyword avoiding false positive substring matches
        const matchesKeyword = (text, keyword, isEnglish = false) => {
            if (isEnglish && keyword === "and") {
                return false;
            }
            const wholeWordKeywords = ["and", "lam", "bov", "tun", "ost", "æg"];
            if (wholeWordKeywords.includes(keyword)) {
                // Escape special characters and match as whole word or suffix (e.g. landand, berberiand)
                const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`\\b\\w*${escaped}\\b`, 'i');
                return regex.test(text);
            }
            return text.includes(keyword);
        };

        const isAlternative = alternativeKeywords.some(keyword =>
            desc.includes(keyword) || catDa.includes(keyword) || catEn.includes(keyword)
        );

        // Check if it matches any non-veg keywords (unless it is explicitly a meat-free alternative)
        let isNonVeg = false;
        if (!isAlternative) {
            isNonVeg = nonVegKeywords.some(keyword => 
                matchesKeyword(desc, keyword, false) || 
                matchesKeyword(catDa, keyword, false) || 
                matchesKeyword(catEn, keyword, true)
            );
        }
        if (isNonVeg) return "non-veg";

        // Check if it contains dairy or egg (so it is Veg, not Vegan)
        const isDairyEgg = dairyEggKeywords.some(keyword => 
            matchesKeyword(desc, keyword, false) || 
            matchesKeyword(catDa, keyword, false) || 
            matchesKeyword(catEn, keyword, true)
        );
        if (isDairyEgg) return "veg";

        // Otherwise it is plant-based / vegan
        return "vegan";
    };

    // Load Stores from API
    const loadStores = async (zip = "2730") => {
        const t = TRANSLATIONS[currentLang];
        storesList.innerHTML = `
            <div class="loading-placeholder">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>${t.loadingStores.replace("{zip}", zip)}</p>
            </div>
        `;

        try {
            const res = await fetch(`${API_BASE}api/stores?zip=${zip}`);
            if (!res.ok) throw new Error("Kunne ikke hente butikker.");
            
            const data = await res.json();
            currentStores = data;
            renderStores();
        } catch (err) {
            console.error(err);
            storesList.innerHTML = `
                <div class="grid-empty-state">
                    <i class="fa-solid fa-circle-exclamation" style="color: #ef4444;"></i>
                    <h3>${t.errorLoading}</h3>
                    <p>${t.errorLoadingMsg}</p>
                </div>
            `;
        }
    };

    // Render Stores in Left Panel
    const renderStores = () => {
        const t = TRANSLATIONS[currentLang];
        
        // Filter by brand
        let filtered = currentStores;
        if (currentBrandFilter !== "all") {
            filtered = currentStores.filter(s => s.store.brand.toLowerCase() === currentBrandFilter);
        }

        storesCount.textContent = `${filtered.length} ${t.storesFound}`;

        if (filtered.length === 0) {
            storesList.innerHTML = `
                <div class="grid-empty-state">
                    <i class="fa-solid fa-store-slash"></i>
                    <h3>${t.noStores}</h3>
                    <p>${t.noStoresMsg}</p>
                </div>
            `;
            return;
        }

        storesList.innerHTML = "";
        filtered.forEach(item => {
            const s = item.store;
            const itemCount = item.clearances.length;
            
            const card = document.createElement("div");
            card.className = `store-card ${selectedStoreId === s.id ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="store-card-header">
                    <h3>${s.name}</h3>
                    <span class="store-brand-pill brand-${s.brand.toLowerCase()}">${s.brand}</span>
                </div>
                <p>${s.address.street}</p>
                <div class="store-card-footer">
                    <span>${s.address.city}</span>
                    <span class="clearance-badge">${itemCount} ${currentLang === 'da' ? 'varer' : 'items'}</span>
                </div>
            `;

            card.addEventListener("click", () => {
                // Highlight card
                document.querySelectorAll(".store-card").forEach(el => el.classList.remove("selected"));
                card.classList.add("selected");
                
                // Set state
                selectedStoreId = s.id;
                
                // Show clearances
                showStoreClearances(item);

                // Mobile view UX: Smooth scroll down to clearances list when store is selected
                if (window.innerWidth <= 768) {
                    const clearancesPanel = document.querySelector(".clearances-panel");
                    if (clearancesPanel) {
                        clearancesPanel.scrollIntoView({ behavior: "smooth" });
                    }
                }
            });

            storesList.appendChild(card);
        });
    };

    // Display store clearances in Center Panel
    const showStoreClearances = (storeClearanceData) => {
        const t = TRANSLATIONS[currentLang];
        if (!storeClearanceData) {
            clearanceCount.textContent = t.selectStore;
            clearancesGrid.innerHTML = `
                <div class="grid-empty-state">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <h3>${t.noStoreSelected}</h3>
                    <p>${t.noStoreSelectedMsg}</p>
                </div>
            `;
            activeStoreInfo.style.display = "none";
            foodPreferenceFilters.style.display = "none";
            return;
        }

        const s = storeClearanceData.store;
        const clearances = storeClearanceData.clearances;

        // Render Active Store header
        activeStoreInfo.style.display = "flex";
        activeStoreName.textContent = s.name;
        activeStoreAddress.innerHTML = `<i class="fa-solid fa-map-pin"></i> ${s.address.street}, ${s.address.zip} ${s.address.city}`;
        activeStoreBrand.textContent = s.brand;
        activeStoreBrand.className = `store-brand-pill brand-${s.brand.toLowerCase()}`;

        if (clearances.length === 0) {
            clearanceCount.textContent = `0 ${t.dealsAvailable}`;
            clearancesGrid.innerHTML = `
                <div class="grid-empty-state">
                    <i class="fa-solid fa-circle-info"></i>
                    <h3>${t.noDeals}</h3>
                    <p>${t.noDealsMsg}</p>
                </div>
            `;
            foodPreferenceFilters.style.display = "none";
            return;
        }

        // Show food filters since we have clearances
        foodPreferenceFilters.style.display = "flex";

        // Calculate counts for each preference filter
        let allCount = clearances.length;
        let veganCount = 0;
        let vegCount = 0;
        let nonVegCount = 0;

        clearances.forEach(c => {
            const type = classifyProduct(c.product);
            if (type === "vegan") {
                veganCount++;
                vegCount++;
            } else if (type === "veg") {
                vegCount++;
            } else if (type === "non-veg") {
                nonVegCount++;
            }
        });

        // Update filter chip labels with counts dynamically
        document.querySelector('[data-pref="all"]').innerHTML = `${t.foodAll} (${allCount})`;
        document.querySelector('[data-pref="vegan"]').innerHTML = `<i class="fa-solid fa-seedling"></i> ${t.foodVegan} (${veganCount})`;
        document.querySelector('[data-pref="veg"]').innerHTML = `<i class="fa-solid fa-carrot"></i> ${t.foodVeg} (${vegCount})`;
        document.querySelector('[data-pref="non-veg"]').innerHTML = `<i class="fa-solid fa-drumstick-bite"></i> ${t.foodNonVeg} (${nonVegCount})`;

        // Filter clearances by food preference
        let filteredClearances = clearances;
        if (currentFoodFilter !== "all") {
            filteredClearances = clearances.filter(c => {
                const type = classifyProduct(c.product);
                if (currentFoodFilter === "vegan") return type === "vegan";
                if (currentFoodFilter === "veg") return type === "vegan" || type === "veg";
                if (currentFoodFilter === "non-veg") return type === "non-veg";
                return true;
            });
        }

        clearanceCount.textContent = `${filteredClearances.length} ${t.dealsAvailable}`;

        if (filteredClearances.length === 0) {
            clearancesGrid.innerHTML = `
                <div class="grid-empty-state">
                    <i class="fa-solid fa-filter"></i>
                    <h3>${t.noDealsFiltered}</h3>
                    <p>${t.noDealsFilteredMsg}</p>
                </div>
            `;
            return;
        }

        clearancesGrid.innerHTML = "";
        filteredClearances.forEach(c => {
            const newPrice = c.offer.newPrice.toFixed(2);
            const originalPrice = c.offer.originalPrice.toFixed(2);
            const discountPct = c.offer.percentDiscount;
            const category = c.product.categories.da || c.product.categories.en || "Fødevare";
            const description = c.product.description;
            const stock = c.offer.stock;
            const unit = c.offer.stockUnit;
            const imageUrl = c.product.image;
            const icon = getCategoryIcon(category);

            const card = document.createElement("div");
            card.className = "product-card";
            
            // Classify product preference for badge
            const pref = classifyProduct(c.product);
            let prefBadge = "";
            if (pref === "vegan") {
                prefBadge = `<span class="pref-badge pref-vegan"><i class="fa-solid fa-seedling"></i> ${t.foodVegan}</span>`;
            } else if (pref === "veg") {
                prefBadge = `<span class="pref-badge pref-veg"><i class="fa-solid fa-carrot"></i> ${t.foodVeg}</span>`;
            } else if (pref === "non-veg") {
                prefBadge = `<span class="pref-badge pref-non-veg"><i class="fa-solid fa-drumstick-bite"></i> ${t.foodNonVeg}</span>`;
            }

            // Build the image area. If imageUrl is present, render img with an onerror fallback to the placeholder icon.
            let imageHTML = "";
            if (imageUrl) {
                imageHTML = `
                    <div class="product-image-container">
                        <img src="${imageUrl}" alt="${description}" class="product-img" onerror="this.style.display='none';">
                        <div class="product-image-placeholder">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                    </div>
                `;
            } else {
                imageHTML = `
                    <div class="product-image-container">
                        <div class="product-image-placeholder">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <span class="discount-tag">-${Math.round(discountPct)}%</span>
                ${imageHTML}
                <div class="product-info">
                    <div class="product-meta-row">
                        <span class="category">${category}</span>
                        ${prefBadge}
                    </div>
                    <h4>${description}</h4>
                </div>
                <div class="price-box">
                    <span class="new-price">${newPrice} kr.</span>
                    <span class="old-price">${originalPrice} kr.</span>
                </div>
                <div class="product-stock ${stock <= 2 ? 'stock-warning' : ''}">
                    <i class="fa-solid fa-cubes"></i>
                    <span>${t.stock}: ${stock} ${unit} ${stock <= 2 ? `(${t.lowStock})` : ''}</span>
                </div>
            `;
            clearancesGrid.appendChild(card);
        });
    };

    // Chatbot send handler
    const sendChatMessage = async (text) => {
        if (!text.trim()) return;

        // Append user bubble
        appendMessage(text, "user");
        chatInput.value = "";
        
        // Append typing indicator
        const typingEl = appendTypingIndicator();
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch(`${API_BASE}api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, lang: currentLang })
            });

            // Remove typing indicator
            typingEl.remove();

            if (!res.ok) throw new Error();
            const data = await res.json();

            // Append agent response
            appendMessage(data.response, "agent");
            
            // If the agent responded with a filtered clearance list, apply it!
            if (data.type === "clearance_list" && data.data && data.data.length > 0) {
                currentStores = data.data;
                renderStores();
                // Select first store automatically
                if (currentStores.length > 0) {
                    selectedStoreId = currentStores[0].store.id;
                    showStoreClearances(currentStores[0]);
                    // Highlight the first store card in left list
                    setTimeout(() => {
                        const firstCard = storesList.querySelector(".store-card");
                        if (firstCard) firstCard.classList.add("selected");
                    }, 50);
                }
            }
        } catch (err) {
            typingEl.remove();
            const errorText = currentLang === 'da' ? 'Forbindelsesfejl til assistent.' : 'Error connecting to assistant.';
            appendMessage(errorText, "agent");
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Append Chat Bubble
    const appendMessage = (text, sender) => {
        const msg = document.createElement("div");
        msg.className = `message ${sender}-message`;
        
        // Render markdown-like bold text and suggestion links
        let htmlContent = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        msg.innerHTML = `<div class="msg-bubble">${htmlContent}</div>`;
        
        // Add click listener for suggested queries in bubbles
        msg.querySelectorAll(".chat-suggest-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                sendChatMessage(link.textContent);
            });
        });

        chatMessages.appendChild(msg);
    };

    // Append Typing Indicator
    const appendTypingIndicator = () => {
        const indicator = document.createElement("div");
        indicator.className = "message agent-message typing-container";
        indicator.innerHTML = `
            <div class="msg-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        return indicator;
    };

    // Switch Application Language
    const switchLanguage = (lang) => {
        if (lang === currentLang) return;
        currentLang = lang;
        const t = TRANSLATIONS[lang];

        // Toggle button states
        if (lang === "da") {
            langBtnDa.classList.add("active");
            langBtnEn.classList.remove("active");
        } else {
            langBtnEn.classList.add("active");
            langBtnDa.classList.remove("active");
        }

        // 1. Update Header Input
        zipInput.placeholder = t.placeholder;
        zipForm.querySelector(".search-btn span").textContent = t.searchBtn;

        // 2. Update Panels Titles
        document.querySelector(".stores-panel .panel-header h2").innerHTML = `<i class="fa-solid fa-store"></i> ${t.supermarkets}`;
        document.querySelector(".clearances-panel .panel-header h2").innerHTML = `<i class="fa-solid fa-tags"></i> ${t.foodWasteDeals}`;
        document.querySelector(".chatbot-panel .panel-header h2").innerHTML = `<i class="fa-solid fa-robot"></i> ${t.assistantTitle}`;

        // 3. Update Brand Chip
        document.querySelector('[data-brand="all"]').innerHTML = t.brandAll;

        // Update Food Chips
        document.querySelector('[data-pref="all"]').innerHTML = t.foodAll;
        document.querySelector('[data-pref="vegan"]').innerHTML = `<i class="fa-solid fa-seedling"></i> ${t.foodVegan}`;
        document.querySelector('[data-pref="veg"]').innerHTML = `<i class="fa-solid fa-carrot"></i> ${t.foodVeg}`;
        document.querySelector('[data-pref="non-veg"]').innerHTML = `<i class="fa-solid fa-drumstick-bite"></i> ${t.foodNonVeg}`;

        // 4. Update Chat input
        chatInput.placeholder = t.chatInputPlaceholder;

        // 5. Update Quick Reply Chips
        replyChips[0].textContent = t.quickReply1;
        replyChips[1].textContent = t.quickReply2;
        replyChips[2].textContent = t.quickReply3;

        // 6. Update Welcome Bubble (if chat is fresh)
        const chatBubbles = chatMessages.querySelectorAll(".message");
        if (chatBubbles.length === 1 && chatBubbles[0].classList.contains("agent-message")) {
            chatBubbles[0].querySelector(".msg-bubble").innerHTML = `
                ${t.assistantWelcome}
                <ul>
                    <li><a href="#" class="chat-suggest-link">${t.assistantSuggest1}</a></li>
                    <li><a href="#" class="chat-suggest-link">${t.assistantSuggest2}</a></li>
                </ul>
            `;
            // Re-bind listeners on new suggest links
            chatBubbles[0].querySelectorAll(".chat-suggest-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    sendChatMessage(link.textContent);
                });
            });
        }

        // 7. Re-render dynamic panels to reflect new language
        renderStores();
        if (selectedStoreId) {
            const activeStoreData = currentStores.find(item => item.store.id === selectedStoreId);
            showStoreClearances(activeStoreData);
        } else {
            showStoreClearances(null);
        }
    };

    // EVENT LISTENERS

    // Language Toggle Click
    langBtnDa.addEventListener("click", () => switchLanguage("da"));
    langBtnEn.addEventListener("click", () => switchLanguage("en"));

    // ZIP Form submit
    zipForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = zipInput.value.trim();
        if (/^\d{4}$/.test(val)) {
            loadStores(val);
        } else {
            const errMsg = currentLang === 'da' ? "Venligst indtast et gyldigt 4-cifret dansk postnummer." : "Please enter a valid 4-digit Danish postal code.";
            alert(errMsg);
        }
    });

    // Brand filters
    filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            
            currentBrandFilter = chip.getAttribute("data-brand");
            renderStores();
        });
    });

    // Food preference filters
    foodFilterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            foodFilterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            
            currentFoodFilter = chip.getAttribute("data-pref");
            
            if (selectedStoreId) {
                const activeStoreData = currentStores.find(item => item.store.id === selectedStoreId);
                showStoreClearances(activeStoreData);
            }
        });
    });

    // Chat form submit
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        sendChatMessage(text);
    });

    // Quick reply chips
    replyChips.forEach(chip => {
        chip.addEventListener("click", () => {
            sendChatMessage(chip.textContent);
        });
    });

    // INITIAL LOAD
    loadStores("2730"); // Load default stores near Herlev
});
