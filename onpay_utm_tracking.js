(function() {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    var config = {
        allowedDomains: ["sumbang.ihsananak.org", "sumbang.ihsanku.org", "komunitidakwahtarbiah.org, "onpay.com"], // Masukkan domain anda
        debugMode: false, // Tukar 'true' jika nak tengok log di console, 'false' untuk production
        storageKey: "my_utm_data_v1" // Kunci simpanan dalam browser
    };

    function log(msg) {
        if (config.debugMode) console.log("[UTM V8]: " + msg);
    }

    // ==========================================
    // 1. SECURITY: CHECK DOMAIN
    // ==========================================
    var currentHostname = window.location.hostname;
    var isAllowed = config.allowedDomains.some(function(domain) {
        return currentHostname.indexOf(domain) > -1;
    });

    if (!isAllowed) {
        // Jangan log apa-apa supaya hacker tak tahu script ni wujud, just return.
        return; 
    }

    log("Domain sah. Script bermula.");

    // ==========================================
    // 2. LOGIK PENGURUSAN DATA (STICKY UTM)
    // ==========================================
    
    // Helper: Ambil dari URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    // A. Cuba ambil data FRESH dari URL
    var rawData = {
        source: getQueryParam('utm_source'),
        camp: getQueryParam('utm_campaign'),
        term: getQueryParam('utm_term'),
        content: getQueryParam('utm_content')
    };

    // B. Logik Simpanan (Storage)
    var finalData = {};
    var savedData = localStorage.getItem(config.storageKey);
    if (savedData) savedData = JSON.parse(savedData);

    if (rawData.source) {
        // KES 1: Ada UTM baru di URL. Guna yang ini & Update Storage.
        finalData = rawData;
        localStorage.setItem(config.storageKey, JSON.stringify(rawData));
        log("Data baru dikesan & disimpan.");
    } else if (savedData && savedData.source) {
        // KES 2: URL kosong, tapi ada data lama (Sticky).
        finalData = savedData;
        log("Menggunakan data simpanan (Sticky).");
    } else {
        // KES 3: URL kosong, Storage kosong. Check Referrer (Organic).
        var referrer = document.referrer;
        if (referrer) {
            var domainRef = referrer.split('/')[2];
            if (domainRef) {
                finalData = {
                    source: domainRef.replace('www.', '') + '_organic',
                    camp: 'direct_traffic',
                    term: '',
                    content: ''
                };
                log("Data organik dikesan dari: " + domainRef);
            }
        }
    }

    // Format data untuk dimasukkan ke borang
    var valueSource = finalData.source || '';
    var valueCombo  = (finalData.camp || '') + '|' + (finalData.term || '') + '|' + (finalData.content || '');

    // Kalau kosong sangat (direct type-in), mungkin kita tak nak isi apa-apa atau set default
    // valueCombo = valueCombo === '||' ? '' : valueCombo; 

    // ==========================================
    // 3. LOGIK DOM & HIDE (NUCLEAR OPTION)
    // ==========================================
    
    // Fungsi hapuskan parent form-group
    function nukearFormGroup(elementID, valueToInsert) {
        var el = document.getElementById(elementID) || document.querySelector('[name="' + elementID + '"]');

        if (el) {
            // Isi data hanya jika ada value
            if (valueToInsert && valueToInsert !== '||') {
                el.value = valueToInsert;
                el.dispatchEvent(new Event('change')); // Trigger React/Vue change
                el.dispatchEvent(new Event('input'));  // Trigger native input
            }

            // Hide Logic
            var parentGroup = el.closest('.form-group');
            var styles = 'display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; opacity: 0 !important;';

            if (parentGroup) {
                parentGroup.setAttribute('style', styles);
                return true; 
            } else {
                // Fallback traversal
                if (el.parentElement && el.parentElement.parentElement) {
                     el.parentElement.parentElement.setAttribute('style', styles);
                     return true;
                }
            }
        }
        return false;
    }

    // CSS Injection (Backup supaya tak berkelip)
    function injectCSS() {
        var css = `
            .form-group:has(#extra_field_2), .form-group:has(#extra_field_3),
            div:has(> .col-md-7 > #extra_field_2), div:has(> .col-md-7 > #extra_field_3),
            #extra_field_2, #extra_field_3 { display: none !important; }
        `;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.appendChild(document.createTextNode(css));
    }
    try { injectCSS(); } catch(e) {}

    // ==========================================
    // 4. EXECUTION LOOP
    // ==========================================
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        
        var f2_done = nukearFormGroup('extra_field_2', valueSource);
        var f3_done = nukearFormGroup('extra_field_3', valueCombo);

        if (f2_done && f3_done) {
            log("Selesai! Data dimasukkan & Field disorok.");
            clearInterval(interval);
        }

        if (percubaan > 40) clearInterval(interval); // 20 saat timeout

    }, 500);

})();
