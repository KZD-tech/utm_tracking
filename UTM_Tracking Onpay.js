{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 window.onload = function() \{\
    function getQueryParam(p) \{ return new URLSearchParams(window.location.search).get(p); \}\
    var s = getQueryParam('utm_source');\
    var c = getQueryParam('utm_campaign');\
    \
    // Field 2\
    var f2 = document.querySelector('[name="extra_field_2"]') || document.getElementById('extra_field_2');\
    var l2 = document.querySelector('label[for="extra_field_2"]');\
    if (f2) \{\
        f2.style.display = 'none'; f2.style.visibility = 'hidden';\
        if (l2) l2.style.display = 'none';\
        if (s) f2.value = s;\
    \}\
\
    // Field 3\
    var f3 = document.querySelector('[name="extra_field_3"]') || document.getElementById('extra_field_3');\
    var l3 = document.querySelector('label[for="extra_field_3"]');\
    if (f3) \{\
        f3.style.display = 'none'; f3.style.visibility = 'hidden';\
        if (l3) l3.style.display = 'none';\
        if (c) f3.value = c;\
    \}\
\};}