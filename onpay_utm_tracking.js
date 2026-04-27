(function() {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    var config = {
        allowedDomains: ["sumbang.ihsananak.org", "sumbang.ihsanku.org", "ihsankorban.com", "daftar.ihsankorban.com", "komunitidakwahtarbiah.org", "onpay.com", "fidyah.ihsanku.org"], 
        debugMode: true, // Set true untuk test kat console
        storageKey: "my_utm_data_v1",
        visitorKey: "returning_visitor_flag" 
    };

    function log(msg) {
        if (config.debugMode) console.log("[UTM V11-GA]: " + msg);
    }

    // 1. SECURITY: CHECK DOMAIN
    var currentHostname = window.location.hostname;
    var isAllowed = config.allowedDomains.some(function(domain) {
        return currentHostname.indexOf(domain) > -1;
    });
    if (!isAllowed) return; 

    // ==========================================
    // 2. LOGIK NEW VS RETURNING (Mirroring GA4)
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
    } else if (savedData && savedData.source) {
        finalData = savedData;
    } else {
        var referrer = document.referrer;
        var domainRef = referrer ? referrer.split('/')[2] : '';
        finalData = {
            source: domainRef ? domainRef.replace('www.', '') + '_organic' : 'direct',
            camp: 'direct_traffic', adset: '', ad: ''
        };
    }

    // Format Data untuk OnPay
    var valueSource = (finalData.source || 'direct') + ' (' + userStatus + ')';
    var valueCombo  = (finalData.camp || '') + ' | ' + (finalData.adset || '') + ' | ' + (finalData.ad || '');

    // ==========================================
    // 4. HANTAR DATA KE GOOGLE ANALYTICS (GA4)
    // ==========================================
    function sendToGA() {
        if (typeof gtag === 'function') {
            gtag('event', 'utm_user_sync', {
                'utm_source_full': valueSource,
                'user_type': userStatus, // Parameter ini anda kena taip manual di GA4
                'campaign_name': finalData.camp
            });
            log("Berjaya hantar ke GA4: " + userStatus);
        } else {
            // Jika gtag belum ready, cuba lagi selepas 1 saat
            setTimeout(sendToGA, 1000);
        }
    }
    sendToGA();

    // ==========================================
    // 5. LOGIK BORANG (ONPAY HIDE & FILL)
    // ==========================================
    function nukearFormGroup(elementID, valueToInsert) {
        var el = document.getElementById(elementID) || document.querySelector('[name="' + elementID + '"]');
        if (el) {
            if (valueToInsert && valueToInsert !== ' | | ') {
                el.value = valueToInsert;
                el.dispatchEvent(new Event('change')); 
                el.dispatchEvent(new Event('input'));  
            }
            // Sorok field supaya user tak pelik nampak data UTM
            var parentGroup = el.closest('.form-group') || el.parentElement.parentElement;
            if (parentGroup) {
                parentGroup.style.display = 'none';
                parentGroup.style.visibility = 'hidden';
                return true; 
            }
        }
        return false;
    }

    // Pantau form sehingga muncul (loop)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        var f2 = nukearFormGroup('extra_field_2', valueSource);
        var f3 = nukearFormGroup('extra_field_3', valueCombo);
        if ((f2 && f3) || percubaan > 30) clearInterval(interval); 
    }, 1000);

})();
