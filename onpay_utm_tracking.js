(function() {
    console.log("UTM V6: Target Parent Form-Group");

    // 1. FUNGSI AMBIL PARAMETER URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    var source = getQueryParam('utm_source');       
    var camp   = getQueryParam('utm_campaign');     
    var adset  = getQueryParam('utm_term');         
    var ad     = getQueryParam('utm_content');      

    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    // 2. FUNGSI KHAS: CARI DAN HAPUSKAN FORM-GROUP (WRAPPER)
    function nukearFormGroup(elementID, valueToInsert) {
        // Cari input dulu
        var el = document.getElementById(elementID) || document.querySelector('[name="' + elementID + '"]');

        if (el) {
            // A. Masukkan data (jika ada)
            if (valueToInsert) {
                el.value = valueToInsert;
                el.dispatchEvent(new Event('change')); // Bagitahu sistem data dah masuk
            }

            // B. TEKNIK TRAVERSAL (Panjat naik ke atas)
            // Kita guna 'closest' untuk cari bapa terdekat yang ada class 'form-group'
            var parentGroup = el.closest('.form-group');

            if (parentGroup) {
                // HAPUSKAN PARENT TERUS!
                // Kita guna setAttribute style supaya ia override semua CSS lain
                parentGroup.setAttribute('style', 'display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; opacity: 0 !important;');
                
                return true; // Misi berjaya
            } else {
                // Fallback: Kalau tak jumpa class form-group, kita cuba naik 2 level (parent -> parent)
                // Sebab struktur dalam screenshot: Input -> Div(col-md-7) -> Div(form-group)
                if (el.parentElement && el.parentElement.parentElement) {
                     el.parentElement.parentElement.style.display = 'none';
                     return true;
                }
            }
        }
        return false;
    }

    // 3. FUNGSI CSS BACKUP (Incase JS lambat load)
    function injectCSS() {
        var css = `
            /* Target specifically wrapper form-group yang ada extra_field */
            .form-group:has(#extra_field_2),
            .form-group:has(#extra_field_3),
            div:has(> .col-md-7 > #extra_field_2), 
            div:has(> .col-md-7 > #extra_field_3) {
                display: none !important;
            }
        `;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.appendChild(document.createTextNode(css));
    }
    // Cuba jalankan CSS injection (browser moden shj support :has)
    try { injectCSS(); } catch(e) {}

    // 4. LOOP CHECKER (Jalankan sampai jumpa)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        
        // Cuba hapuskan wrapper
        var f2_done = nukearFormGroup('extra_field_2', source);
        var f3_done = nukearFormGroup('extra_field_3', dataGabungan);

        // Kalau dah berjaya dua-dua, STOP.
        if (f2_done && f3_done) {
            console.log("UTM V6: Semua wrapper form-group berjaya dihapuskan.");
            clearInterval(interval);
        }

        // Timeout 20 saat
        if (percubaan > 40) clearInterval(interval);

    }, 500);

})();
