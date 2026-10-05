(function() {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    var config = {
        allowedDomains: ["sumbang.ihsananak.org", "sumbang.ihsanku.org", "ihsankorban.com", "daftar.ihsankorban.com", "komunitidakwahtarbiah.org", "onpay.com", "fidyah.ihsanku.org", "donate.syriacare.org.my"],
        debugMode: true, // Set true untuk test kat console
        storageKey: "my_utm_data_v1",
        clickIdKey: "my_clickid_v1",
        clickIdTTL: 90 * 24 * 60 * 60 * 1000, // 90 hari (ikut window gclid)
        visitorKey: "returning_visitor_flag",
        fields: {
            source: "extra_field_2",
            combo:  "extra_field_3",
            clickId: "extra_field_1" // Tambahan #1 di OnPay
        }
    };

    function log(msg) {
        if (config.debugMode) console.log("[UTM V12-GA]: " + msg);
    }

    // 1. SECURITY: CHECK DOMAIN
    var currentHostname = window.location.hostname;
    var isAllowed = config.allowedDomains.some(function(domain) {
        return currentHostname.indexOf(domain) > -1;
    });
    if (!isAllowed) return;

    // Helper: safe localStorage
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function lsJSON(k) { try { return JSON.parse(lsGet(k)); } catch (e) { return null; } }
    function getCookie(name) {
        var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : '';
    }

    // ==========================================
    // 2. LOGIK NEW VS RETURNING (Mirroring GA4)
    // ==========================================
    var userStatus = "New";
    if (lsGet(config.visitorKey)) {
        userStatus = "Returning";
    } else {
        lsSet(config.visitorKey, "true");
    }

    // ==========================================
    // 3. LOGIK PENGURUSAN DATA (STICKY UTM + CLICK ID)
    // ==========================================
    var params = new URLSearchParams(window.location.search);
    function getQueryParam(p) { return params.get(p); }

    var rawData = {
        source: getQueryParam('utm_source'),
        camp:   getQueryParam('utm_campaign'),
        adset:  getQueryParam('utm_content'),
        ad:     getQueryParam('utm_term')
    };

    var rawClick = {
        gclid:  getQueryParam('gclid')  || '',
        gbraid: getQueryParam('gbraid') || '', // Google Ads iOS (app)
        wbraid: getQueryParam('wbraid') || '', // Google Ads iOS (web)
        fbclid: getQueryParam('fbclid') || '',
        ts:     Date.now()
    };
    var hasGoogleClick = !!(rawClick.gclid || rawClick.gbraid || rawClick.wbraid);
    var hasNewClick = !!(hasGoogleClick || rawClick.fbclid);

    // --- Click ID (last-click: touch baru overwrite) ---
    var clickData;
    if (hasNewClick || rawData.source) {
        clickData = rawClick;
        lsSet(config.clickIdKey, JSON.stringify(rawClick));
    } else {
        var savedClick = lsJSON(config.clickIdKey);
        clickData = (savedClick && (Date.now() - savedClick.ts) < config.clickIdTTL)
            ? savedClick
            : { gclid: '', gbraid: '', wbraid: '', fbclid: '' };
    }

    // Bina fbc format Meta (fb.1.<timestamp_ms>.<fbclid>) untuk upload CAPI/Offline
    // Utamakan cookie _fbc Meta Pixel; kalau tiada, bina dari fbclid + timestamp klik.
    var fbcCookie = getCookie('_fbc');
    if (fbcCookie && (!clickData.fbclid || fbcCookie.indexOf(clickData.fbclid) > -1)) {
        clickData.fbc = fbcCookie;
        if (!clickData.fbclid) clickData.fbclid = fbcCookie.split('.').slice(3).join('.');
    } else if (clickData.fbclid) {
        clickData.fbc = 'fb.1.' + (clickData.ts || Date.now()) + '.' + clickData.fbclid;
    }

    // --- UTM ---
    var finalData = {};
    var savedData = lsJSON(config.storageKey);

    if (rawData.source) {
        finalData = rawData;
        lsSet(config.storageKey, JSON.stringify(rawData));
    } else if (hasNewClick) {
        // Ada click ID tapi tiada UTM (cth: Google auto-tagging sahaja)
        finalData = {
            source: hasGoogleClick ? 'google_cpc' : 'facebook_paid',
            camp: '(no_utm)', adset: '', ad: ''
        };
        lsSet(config.storageKey, JSON.stringify(finalData));
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
    var valueSource  = (finalData.source || 'direct') + ' (' + userStatus + ')';
    var valueCombo   = (finalData.camp || '') + ' | ' + (finalData.adset || '') + ' | ' + (finalData.ad || '');
    // Hanya masukkan ID yang wujud, cth: "gclid:xxx | fbc:fb.1.1759630000000.yyy"
    var valueClickId = ['gclid', 'gbraid', 'wbraid', 'fbc']
        .filter(function(k) { return clickData[k]; })
        .map(function(k) { return k + ':' + clickData[k]; })
        .join(' | ');

    log("Click ID: " + (valueClickId || "(tiada)"));

    // ==========================================
    // 4. HANTAR DATA KE GOOGLE ANALYTICS (GA4)
    // ==========================================
    // Page OnPay load GA4 melalui GTM, jadi window.gtag mungkin tiada.
    // gtag ada -> hantar terus. Tiada -> push ke dataLayer (perlu GA4 Event tag di GTM).
    var gaPayload = {
        'utm_source_full': valueSource,
        'user_type': userStatus,          // Daftar sebagai custom dimension di GA4
        'campaign_name': finalData.camp,
        'has_gclid': (clickData.gclid || clickData.gbraid || clickData.wbraid) ? 'yes' : 'no',
        'has_fbclid': clickData.fbclid ? 'yes' : 'no'
    };
    var gaTries = 0;
    function sendToGA() {
        if (typeof gtag === 'function') {
            gtag('event', 'utm_user_sync', gaPayload);
            log("Berjaya hantar ke GA4 (gtag): " + userStatus);
        } else if (++gaTries < 5) {
            setTimeout(sendToGA, 1000);
        } else {
            window.dataLayer = window.dataLayer || [];
            var dl = { event: 'utm_user_sync' };
            for (var k in gaPayload) dl[k] = gaPayload[k];
            window.dataLayer.push(dl);
            log("gtag tiada, push ke dataLayer: utm_user_sync");
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
        var f2 = nukearFormGroup(config.fields.source, valueSource);
        var f3 = nukearFormGroup(config.fields.combo, valueCombo);
        var f4 = nukearFormGroup(config.fields.clickId, valueClickId);
        if ((f2 && f3 && f4) || percubaan > 30) clearInterval(interval);
    }, 1000);

})();
