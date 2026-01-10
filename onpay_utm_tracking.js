(function() {
    console.log("UTM Script V5: Bermula...");

    // 1. AMBIL DATA DARI URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    var source = getQueryParam('utm_source');       
    var camp   = getQueryParam('utm_campaign');     
    var adset  = getQueryParam('utm_term');         
    var ad     = getQueryParam('utm_content');      

    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    // 2. FUNGSI CSS INJECTION (Untuk hilangkan Label & Input serta-merta)
    function injectCSS() {
        var css = `
            /* Sorok Input dan Label secara agresif */
            #extra_field_2, #extra_field_3,
            input[name="extra_field_2"], input[name="extra_field_3"],
            label[for="extra_field_2"], label[for="extra_field_3"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.appendChild(document.createTextNode(css));
    }
    injectCSS();

    // 3. FUNGSI JS: CARI DAN SOROK "PARENT" (FORM-GROUP)
    function uruskanField(fieldID, valueToInsert) {
        var el = document.getElementById(fieldID) || document.querySelector('[name="' + fieldID + '"]');

        if (el) {
            // A. Masukkan Data (Jika ada)
            if (valueToInsert) {
                el.value = valueToInsert;
                // Trigger event 'change' supaya sistem borang tahu ada data masuk
                el.dispatchEvent(new Event('change')); 
            }

            // B. Cari BAPA (form-group) dan sorokkan
            // Berdasarkan screenshot: Input > Div(col-md-7) > Div(form-group)
            var parent = el.closest('.form-group'); 
            
            if (parent) {
                parent.style.display = 'none';
                parent.style.visibility = 'hidden';
                parent.style.height = '0px';
                parent.style.margin = '0px';
                parent.style.padding = '0px'; // Kemaskan ruang kosong
                return true; // Berjaya jumpa & sorok
            }
        }
        return false;
    }

    // 4. LOOP CHECKER (Jalankan berulang kali sampai jumpa borang)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        
        // Cuba proses Field 2 & 3
        var f2_done = uruskanField('extra_field_2', source);
        var f3_done = uruskanField('extra_field_3', dataGabungan);

        // Kalau dah berjaya sorok dua-dua, atau dah cuba 50 kali (25 saat), stop.
        if ((f2_done && f3_done) || percubaan > 50) {
            if(f2_done && f3_done) console.log("UTM Script: Berjaya sorok semua field.");
            clearInterval(interval);
        }

    }, 500); // Check setiap setengah saat

})();
