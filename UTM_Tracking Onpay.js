(function() {
    // Fungsi untuk dapatkan parameter URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }

    var s = getQueryParam('utm_source');
    var c = getQueryParam('utm_campaign');

    // Jika tiada UTM di link, tak perlu buat apa-apa (stop terus)
    if (!s && !c) return;

    // Fungsi: Cuba cari borang dan isi data
    function cubaIsiBorang() {
        console.log("Sedang mencari borang..."); // Untuk debug

        // Cari Field 2 (Source)
        var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');
        var l2 = document.querySelector('label[for="extra_field_2"]');
        
        // Cari Field 3 (Campaign)
        var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');
        var l3 = document.querySelector('label[for="extra_field_3"]');

        var berjaya = false;

        if (f2 && s) {
            f2.value = s;
            f2.style.display = 'none'; f2.style.visibility = 'hidden';
            if (l2) l2.style.display = 'none';
            berjaya = true;
        }

        if (f3 && c) {
            f3.value = c;
            f3.style.display = 'none'; f3.style.visibility = 'hidden';
            if (l3) l3.style.display = 'none';
            berjaya = true;
        }

        return berjaya; // Bagitahu kalau dah jumpa
    }

    // MEKANISME RETRY (PENTING)
    // Script akan cuba cari borang setiap 500ms (setengah saat)
    // Dia akan ulang sebanyak 20 kali (total 10 saat)
    var percubaan = 0;
    var interval = setInterval(function() {
        percubaan++;
        var hasil = cubaIsiBorang();

        if (hasil) {
            console.log("Borang jumpa! Data UTM dimasukkan.");
            clearInterval(interval); // Berhenti mencari
        } else if (percubaan >= 20) {
            console.log("Borang tidak dijumpai selepas 10 saat.");
            clearInterval(interval); // Give up
        }
    }, 500);

})();
