(function() {
    // --- BAHAGIAN 1: CSS INJECTION (NUCLEAR OPTION) ---
    // Kita suntik CSS ni terus ke dalam head website supaya field
    // tu hilang serta-merta walaupun borang belum loading.
    function injectCSS() {
        var css = `
            /* Sorok Input */
            input[name="extra_field_2"], 
            input[name="extra_field_3"],
            #extra_field_2, 
            #extra_field_3 {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Sorok Label yang berkaitan */
            label[for="extra_field_2"], 
            label[for="extra_field_3"] {
                display: none !important;
            }
            
            /* (Optional) Cuba sorok wrapper OnPay jika ada class specific */
            .form-group:has(input[name="extra_field_2"]),
            .form-group:has(input[name="extra_field_3"]) {
                display: none !important;
            }
        `;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }
    }
    
    // Jalankan injection CSS serta merta!
    injectCSS();


    // --- BAHAGIAN 2: LOGIK UTM ---
    
    // Fungsi mendapatkan parameter dari URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    var source = getQueryParam('utm_source');       
    var camp   = getQueryParam('utm_campaign');     
    var adset  = getQueryParam('utm_term');         
    var ad     = getQueryParam('utm_content');      

    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    function cubaIsiBorang() {
        var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');
        var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');
        var borangDiJumpai = false; 

        // Field 2 (Source)
        if (f2) {
            // Kita double confirm sorok guna inline style juga
            f2.style.setProperty('display', 'none', 'important');
            
            // Cari label dia secara manual kalau CSS tak detect
            var l2 = document.querySelector('label[for="extra_field_2"]');
            if (l2) l2.style.setProperty('display', 'none', 'important');

            if (source) f2.value = source;
            borangDiJumpai = true;
        }

        // Field 3 (Gabungan)
        if (f3) {
            f3.style.setProperty('display', 'none', 'important');
            
            var l3 = document.querySelector('label[for="extra_field_3"]');
            if (l3) l3.style.setProperty('display', 'none', 'important');

            if (camp || adset || ad) f3.value = dataGabungan;
            borangDiJumpai = true;
        }

        return borangDiJumpai;
    }

    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        if (cubaIsiBorang()) {
            clearInterval(interval); 
        } else if (percubaan >= 40) { // Kita naikkan had masa ke 20 saat (40x500ms)
            clearInterval(interval); 
        }
    }, 500);

})();
