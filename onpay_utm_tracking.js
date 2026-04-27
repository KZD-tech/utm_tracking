(function() {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    var config = {
        allowedDomains: ["sumbang.ihsananak.org", "sumbang.ihsanku.org", "ihsankorban.com", "daftar.ihsankorban.com", "komunitidakwahtarbiah.org", "onpay.com", "fidyah.ihsanku.org"], 
        debugMode: false, 
        storageKey: "my_utm_data_v1",
        visitorKey: "returning_visitor_flag" // Kunci untuk kesan user lama
    };

    function log(msg) {
        if (config.debugMode) console.log("[UTM V10-GA]: " + msg);
    }

    // 1. SECURITY: CHECK DOMAIN
    var currentHostname = window.location.hostname;
    var isAllowed = config.allowedDomains.some(function(domain) {
        return currentHostname.indexOf(domain) > -1;
    });

    if (!isAllowed) return; 

    // ==========================================
    // 2. LOGIK NEW VS RETURNING
    // ==========================================
    var userStatus = "New";
    if (localStorage.getItem(config.visitorKey)) {
        userStatus = "Returning";
    } else {
        localStorage.setItem(config.visitorKey, "true");
    }

    // ==========================================
    // 3. LOGIK PENGURUSAN DATA (STICKY UTM)
    // ==========================================
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    var rawData = {
        source: getQueryParam('utm_source'),   
        camp:   getQueryParam('utm_campaign'), 
        adset:  getQueryParam('utm_content'),  
        ad:     getQueryParam('utm_term')      
    };

    var finalData = {};
    var savedData = localStorage.getItem(config.storageKey);
    if (savedData) savedData = JSON.parse(savedData);

    if (rawData.source) {
        finalData = rawData;
        localStorage.setItem(config.storageKey, JSON.stringify(rawData));
        log("Data baru dikesan.");
    } else if (savedData && savedData.source) {
        finalData = savedData;
        log("Guna data Sticky.");
    } else {
        var referrer = document.referrer;
        if (referrer) {
            var domainRef = referrer.split('/')[2];
            if (domainRef) {
                finalData = {
                    source: (domainRef.replace('www.', '') || 'direct') + '_organic',
                    camp: 'direct_traffic',
                    adset: '',
                    ad: ''
                };
            }
        }
    }

    // Tambah Status User ke dalam data
    var valueSource = (finalData.source || 'direct') + ' (' + userStatus + ')';
    var valueCombo  = (finalData.camp || '') + ' | ' + (finalData.adset || '') + ' | ' + (finalData.ad || '');

    // ==========================================
    // 4. HANTAR DATA KE GOOGLE ANALYTICS (GA4)
    // ==========================================
    if (typeof gtag === 'function') {
        gtag('event', 'utm_tracking_data', {
            'utm_source_custom': valueSource,
            'utm_campaign_custom': finalData.camp,
            'user_type': userStatus,
            'full_utm_string': valueCombo
        });
        log("Data dihantar ke GA4.");
    } else {
        log("GA4 (gtag) tidak dijumpai.");
    }

    // ==========================================
    // 5. LOGIK DOM & HIDE
    // ==========================================
    function nukearFormGroup(elementID, valueToInsert) {
        var el = document.getElementById(elementID) || document.querySelector('[name="' + elementID + '"]');
        if (el) {
            if (valueToInsert && valueToInsert !== ' | | ') {
                el.value = valueToInsert;
                el.dispatchEvent(new Event('change')); 
                el.dispatchEvent(new Event('input'));  
            }
            var parentGroup = el.closest('.form-group');
            var styles = 'display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; opacity: 0 !important;';
            if (parentGroup) {
                parentGroup.setAttribute('style', styles);
                return true; 
            }
        }
        return false;
    }

    // CSS Injection 
    try {
        var css = '.form-group:has(#extra_field_2), .form-group:has(#extra_field_3), #extra_field_2, #extra_field_3 { display: none !important; }';
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    } catch(e) {}

    // Execution Loop
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        var f2_done = nukearFormGroup('extra_field_2', valueSource);
        var f3_done = nukearFormGroup('extra_field_3', valueCombo);
        if ((f2_done && f3_done) || percubaan > 40) clearInterval(interval); 
    }, 500);

})();
