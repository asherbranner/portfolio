document.addEventListener('DOMContentLoaded', function () {
    cookieconsent.run({
        "notice_banner_type": "headline",
        "consent_type": "express",
        "palette": "dark",
        "language": "en",
        "page_load_consent_levels": ["strictly-necessary", "tracking"],
        "notice_banner_reject_button_hide": false,
        "preferences_center_close_button_hide": false,
        "page_refresh_confirmation_buttons": false,
        "website_name": "noaha.tech",
        /*,"website_privacy_policy_url":"example.com"*/
        "cookie": {
            "name": "cookie_consent_level",
            "samesite": "none",
            "secure": true
        }
    });

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-JRMXMCDZF9', 'auto', {
        cookie_flags: 'max-age=7200; secure=true; samesite=none'
    })
    gtag('config', 'G-0V7JNYGWCC', 'auto', {
        cookie_flags: 'max-age=7200; secure=true; samesite=none'
    })
    gtag('config', 'G-B8SKQ9HHPZ', 'auto', {
        cookie_flags: 'max-age=7200; secure=true; samesite=none'
    })
    gtag('config', 'G-X6LMX9VR0Y', 'auto', {
        cookie_flags: 'max-age=7200; secure=true; samesite=none'
    })
});