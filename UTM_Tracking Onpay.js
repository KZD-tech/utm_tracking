window.onload = function() {
    // 1. Fungsi Dapatkan Parameter URL
    function getQueryParam(p) { return new URLSearchParams(window.location.search).get(p); }
    var s = getQueryParam('utm_source');
    var c = getQueryParam('utm_campaign');
    
    // 2. Uruskan extra_field_2 (Source)
    var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');
    var l2 = document.querySelector('label[for="extra_field_2"]');
    if (f2) {
        f2.style.display = 'none'; f2.style.visibility = 'hidden';
        if (l2) l2.style.display = 'none';
        if (s) f2.value = s;
    }

    // 3. Uruskan extra_field_3 (Campaign)
    var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');
    var l3 = document.querySelector('label[for="extra_field_3"]');
    if (f3) {
        f3.style.display = 'none'; f3.style.visibility = 'hidden';
        if (l3) l3.style.display = 'none';
        if (c) f3.value = c;
    }
};
