/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/


var formdata = {
    "token": "hash",
    "timestamp": "YYYY-MM-DD'T'HH-MM-SS",
    "issues": {
        "Justice": null,
        "Health": null,
        "Welfare": null,
        "Immigration": null,
        "Economy": null,
        "Environment": null,
        "Other": null,
        "Education": null,
        "Defence": null
    },
    "sources": {
        "Television": null,
        "Radio": null,
        "Newspaper": null,
        "Social": null,
        "Online": null,
        "Family": null,
        "Political": null,
        "Elected": null
    },
    "activity": {
        "face": null,
        "message": null,
        "social": null,
        "petition": null,
        "protest": null,
        "volunteerPolitical": null,
        "donatePolitical": null,
        "volunteerCharity": null,
        "donateCharity": null
    },
    "interest": {
        "interest": null
    },
    "personal": {
        "gender": null,
        "birthDate": "YYYY-MM-DD",
        "postalCode": "A1A1A1",
        "twitter": "",
        "email": "",
        "work": null,
        "other": ""
    }
};



function setFormDataValue(category, subcategory) {

    var element = document.querySelector('#' + subcategory);
    var value;

    if (element) {

        /* For radio buttons */
        if (element.selected) {
            value = parseInt(element.selected);
        }

        /* For slider */
        if (element.value) {
            value = element.value;
        }

        /* For checkboxes */
        if (element.checked) {
            value = element.checked;
        }

        if (category) {
            if (subcategory) {
                formdata[category][subcategory] = value;
            } else {
                formdata[category] = value;
            }
        }
    }
}

function getDataForCategory(category) {
    for (var key in formdata[category]) {
        setFormDataValue(category, key);
    }
}

function sendData() {
    var formSubmit = document.querySelector('#formSubmit');
    formSubmit.parms = formdata;
}


(function () {
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

            if (consentCheckbox.checked) {
                app.switch();
            } else {
                var toast = document.querySelector('#toaster');
                toast.show();
            }
        });

        var issuesButton = document.querySelector('#issuesButton');

        issuesButton.addEventListener('click', function () {
            getDataForCategory("issues");
            app.switch();
        });

        var interestButton = document.querySelector('#interestButton');

        interestButton.addEventListener('click', function () {
            getDataForCategory("interest");
            app.switch();
        });

        var sourcesButton = document.querySelector('#sourcesButton');

        sourcesButton.addEventListener('click', function () {
            getDataForCategory("sources");
            app.switch();
        });

        var activityButton = document.querySelector('#activityButton');

        activityButton.addEventListener('click', function () {
            getDataForCategory("activity");
            app.switch();
        });

        var personalButton = document.querySelector('#personalButton');

        personalButton.addEventListener('click', function () {
            /* birthdate */
            /* postcode */
            setFormDataValue("personal", "gender");
            app.switch();
        });

        var workButton = document.querySelector('#workButton');

        workButton.addEventListener('click', function () {
            setFormDataValue("personal", "work");
            app.switch();
        });

        var formSubmit = document.querySelector('#formSubmit');

        formSubmit.addEventListener('response', function (e) {
            console.log("response from server" + JSON.stringify(e.detail.response));
            app.switch();
        })
        var emailButton = document.querySelector('#emailButton');

        emailButton.addEventListener('click', function () {
            formdata.timestamp = Date.now();
            console.log(formdata);
            formSubmit.body = JSON.stringify(formdata);
            console.log(formSubmit.body);
            formSubmit.generateRequest();
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

})();