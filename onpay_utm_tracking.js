(function() {
    // Fungsi mendapatkan parameter dari URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    // AMBIL DATA DARI URL
    var source = getQueryParam('utm_source');       
    var camp   = getQueryParam('utm_campaign');     
    var adset  = getQueryParam('utm_term');         
    var ad     = getQueryParam('utm_content');      

    // NOTA: Kita tak boleh "return" (stop) kat sini walaupun tak ada data,
    // sebab kita masih perlu jalankan kod untuk SOROK field di bawah.

    // GABUNGKAN DATA UNTUK FIELD 3
    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    function cubaIsiBorang() {
        // Cari elemen dalam page
        var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');
        var l2 = document.querySelector('label[for="extra_field_2"]');
        
        var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');
        var l3 = document.querySelector('label[for="extra_field_3"]');

        var borangDiJumpai = false; // Penanda untuk stop loop

        // --- URUSKAN FIELD 2 (SOURCE) ---
        if (f2) {
            // 1. WAJIB SOROK (Tak kira ada UTM atau tak)
            f2.style.display = 'none';
            f2.style.visibility = 'hidden';
            if (l2) l2.style.display = 'none';

            // 2. ISI DATA (Hanya jika ada source)
            if (source) {
                f2.value = source;
            }
            
            borangDiJumpai = true;
        }

        // --- URUSKAN FIELD 3 (GABUNGAN) ---
        if (f3) {
            // 1. WAJIB SOROK (Tak kira ada UTM atau tak)
            f3.style.display = 'none';
            f3.style.visibility = 'hidden';
            if (l3) l3.style.display = 'none';

            // 2. ISI DATA (Hanya jika ada salah satu data kempen)
            // Kita check (camp || adset || ad) supaya tak isi kalau semua kosong
            if (camp || adset || ad) {
                f3.value = dataGabungan;
            }

            borangDiJumpai = true;
        }

        return borangDiJumpai;
    }

    // MEKANISME RETRY (Cari borang selama 10 saat)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        // Kalau borang dah jumpa dan disorok, kita stop interval
        if (cubaIsiBorang()) {
            console.log("UTM Tracker: Borang jumpa & disorok.");
            clearInterval(interval); 
        } else if (percubaan >= 20) {
            console.log("UTM Tracker: Borang tak jumpa (Timeout).");
            clearInterval(interval); // Give up
        }
    }, 500);

})();
