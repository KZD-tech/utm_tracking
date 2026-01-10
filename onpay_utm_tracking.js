(function() {
    
    // Fungsi mendapatkan parameter dari URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    // AMBIL DATA DARI URL
    var source = getQueryParam('utm_source');       
    var camp   = getQueryParam('utm_campaign');     
    var adset  = getQueryParam('utm_term');         
    var ad     = getQueryParam('utm_content');      

    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    // Fungsi untuk sorok element DAN bapak dia (container)
    function killElement(elementName) {
        // Cari Input berdasarkan Name atau ID
        var el = document.querySelector('[name="' + elementName + '"]') || document.getElementById(elementName);
        
        if (el) {
            // 1. Masukkan data dulu (kalau ada)
            // Logic: Kalau field 2, masuk source. Kalau field 3, masuk gabungan.
            if (elementName === 'extra_field_2' && source) el.value = source;
            if (elementName === 'extra_field_3' && (camp || adset || ad)) el.value = dataGabungan;

            // 2. TEKNIK SOROK AGRESIF (Traversing Up)
            
            // Level 1: Sorok Input tu sendiri
            el.style.display = 'none';
            el.style.visibility = 'hidden';

            // Level 2: Cari Container terdekat (biasanya .form-group)
            // Kita cari elemen bapa yang ada class "form-group" atau "row"
            var parent = el.closest('.form-group') || el.closest('.row') || el.parentElement.parentElement;
            
            if (parent) {
                parent.style.display = 'none';
                parent.style.visibility = 'hidden';
                parent.style.height = '0';
                parent.style.margin = '0';
                parent.style.padding = '0';
            }
            
            return true; // Berjaya jumpa & sorok
        }
        return false; // Tak jumpa
    }

    // MEKANISME RETRY
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        
        // Cuba bunuh (hide) kedua-dua field
        var f2_done = killElement('extra_field_2');
        var f3_done = killElement('extra_field_3');

        // Kalau dua-dua dah jumpa & disorok, STOP.
        if (f2_done && f3_done) {
            console.log("UTM Tracker: Semua field berjaya disorok.");
            clearInterval(interval); 
        } 
        
        // Timeout lepas 15 saat (30 x 500ms)
        if (percubaan >= 30) {
            clearInterval(interval); 
        }
    }, 500);

})();
