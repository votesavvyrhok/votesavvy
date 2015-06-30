/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function (document) {
    'use strict';

    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');

    app.displayInstalledToast = function () {
        document.querySelector('#caching-complete').show();
    };

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function () {
        console.log('Our app is ready to rock!');
    });

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function () {
        // imports are loaded and elements have been registered

        var consentButton = document.querySelector('#consentButton');

        consentButton.addEventListener('click', function () {

            var consentCheckbox = document.querySelector('#consentCheckbox');

            console.log(consentCheckbox.checked);

            if (consentCheckbox.checked) {
                app.switch();
            } else {
                var toast = document.querySelector('#toaster');
                toast.show();
            }
        });

        var issuesButton = document.querySelector('#issuesButton');

        issuesButton.addEventListener('click', function () {

            var cjgroup = document.querySelector('#cjgroup');
            var i = cjgroup.selectedItem;

            app.switch();
        });

        var infoButton = document.querySelector('#informationButton');

        infoButton.addEventListener('click', function () {
            app.switch();
        });

        var encounterButton = document.querySelector('#encounterButton');

        encounterButton.addEventListener('click', function () {
            app.switch();
        });

        var monthsButton = document.querySelector('#monthsButton');

        monthsButton.addEventListener('click', function () {
            app.switch();
        });

        var genderButton = document.querySelector('#genderButton');

        genderButton.addEventListener('click', function () {
            app.switch();
        });

        var employmentButton = document.querySelector('#employmentButton');

        employmentButton.addEventListener('click', function () {
            app.switch();
        });

        var birthButton = document.querySelector('#birthButton');

        birthButton.addEventListener('click', function () {
            app.switch();
        });

        var postcodeButton = document.querySelector('#postcodeButton');

        postcodeButton.addEventListener('click', function () {
            app.switch();
        });

        var emailButton = document.querySelector('#emailButton');

        emailButton.addEventListener('click', function () {
            //            app.switch();
        });

    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onMenuSelect = function () {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    app.switch = function () {
        var pages = document.querySelector('iron-pages');
        pages.selectNext();
    }

    app.addEventListener('switcher', function (e) {
        app.switch();
    })

})(document);

//        var handleConsent = function () {
//            var event = new Event('switcher');
//            // Dispatch the event.
//
//            var app = document.querySelector('#app');
//            app.dispatchEvent(event);
//        }