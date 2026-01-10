(function() {
    // Fungsi mendapatkan parameter dari URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    // AMBIL DATA DARI URL (Standard Format)
    var source = getQueryParam('utm_source');       // cth: facebook
    var camp   = getQueryParam('utm_campaign');     // cth: PromoRaya
    var adset  = getQueryParam('utm_term');         // cth: Broad_Audience (term = adset)
    var ad     = getQueryParam('utm_content');      // cth: Video_Testimoni (content = ad name)

    // Jika tiada sebarang data UTM, stop.
    if (!source && !camp) return;

    // GABUNGKAN DATA UNTUK FIELD 3
    // Format: Campaign | Adset | Ad
    // Kita guna "|| ''" supaya kalau data kosong, dia tak tulis "null", dia jadi kosong je.
    var dataGabungan = (camp || '') + '|' + (adset || '') + '|' + (ad || '');

    // Debugging (Boleh tengok di Console browser)
    console.log("Data untuk Field 3: " + dataGabungan);

    function cubaIsiBorang() {
        // --- FIELD 2: SOURCE (Wajib ada untuk tahu traffic dari mana) ---
        var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');
        var l2 = document.querySelector('label[for="extra_field_2"]');
        
        // --- FIELD 3: KEMPEN | ADSET | AD ---
        var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');
        var l3 = document.querySelector('label[for="extra_field_3"]');

        var berjaya = false;

        // Isi Field 2 (Source)
        if (f2 && source) {
            f2.value = source;
            f2.style.display = 'none'; f2.style.visibility = 'hidden';
            if (l2) l2.style.display = 'none';
            berjaya = true;
        }

        // Isi Field 3 (Gabungan 3 Data)
        if (f3) {
            f3.value = dataGabungan; // Masukkan data yang dah digabung tadi
            f3.style.display = 'none'; f3.style.visibility = 'hidden';
            if (l3) l3.style.display = 'none';
            berjaya = true;
        }

        return berjaya;
    }

    // MEKANISME RETRY (Cari borang selama 10 saat)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        if (cubaIsiBorang()) {
            clearInterval(interval); // Stop bila jumpa
        } else if (percubaan >= 20) {
            clearInterval(interval); // Give up
        }
    }, 500);

})();
