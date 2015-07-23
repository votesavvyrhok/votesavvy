/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/


var formdata = {
    "timestamp": {
        "start": null,
        "end": null,
        "duration": null
    },
    "issues": {
        "selected": ''
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
        "yearOfBirth": null,
        "postalCode": null,
        "markedLocation": {
            "lat": null,
            "lng": null
        },
        "twitter": null,
        "email": null,
        "other": null
    },
    "work": {
        "fullTime": null,
        "partTime": null,
        "unemployed": null,
        "disabled": null,
        "undergradStudent": null,
        "mastersStudent": null,
        "phdStudent": null,
        "collegeStudentApprentice": null,
        "home": null,
        "retired": null,
        "undisclosed": null
    }
};

function getDataForSubcategory(category, subcategory) {

    var element = document.querySelector('#' + subcategory);
    var value;

    if (element) {

        /* For radio buttons */
        if (element.localName === 'paper-radio-group') {
            value = element.selected;
        }

        /* For slider */
        if (element.localName === 'paper-slider') {
            value = element.value ;
        }

        /* For checkboxes */
        if (element.localName === 'paper-checkbox') {
            value = element.checked;
        }

        /*for input */
        if (element.localName === 'input') {
            value = element.value;
        }

        if (element.localName === 'select'){
            value = element.value;
        }

        if (subcategory === 'markedLocation') {
            category[subcategory].lat = element.latitude;
            category[subcategory].lng = element.longitude;
        } else {
            if (category) {
                if (subcategory) {
                    category[subcategory] = value;
                } else {
                    category = value;
                }
            }
        }
    }
}

function setDataForSubcategory(category, subcategory) {
    var element = document.querySelector('#' + subcategory);
    var value;

    if (!element)
        return;

    if (category) {
        if (subcategory) {
            value = category[subcategory];
        } else {
            value = category;
        }
    }

    if (element && value) {

        /* For radio buttons */
        if (element.localName === 'paper-radio-group') {
            element.selected = value;
        }

        /* For slider */
        if (element.localName === 'paper-slider') {
            element.value = value;
        }

        /* For checkboxes */
        if (element.localName === 'paper-checkbox') {
            element.checked = value;
        }

        /*for input */
        if (element.localName === 'input') {
            element.value = value;
        }

        if (element.localName === 'select'){
            element.value = value;
        }

        if (element.localName === 'google-map-marker') {
            if (value) {
                if (value.lat)
                    element.latitude = value.lat;
                if (value.lng)
                    element.longitude = value.lng;
            }
        }
    }
}

function formdataOperation(operation) {
    for (var category in formdata)
        for (var subcategory in formdata[category]) {
            operation(formdata[category], subcategory);
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
        var screenName = document.querySelector("#screenName");

        app.signinvisible = true;

        var formRetrieve = document.querySelector('#formRetrieve');

        if (screenName.textContent) {
            app.signinvisible = false;

            //fire the ajax call to retrieve the data stored
            formRetrieve.generateRequest();
        }

        var consentCheckbox = document.querySelector("#consentCheckbox");

        formRetrieve.addEventListener('response', function (event) {
            if (event.detail.response) {
                consentCheckbox.checked = true;

                var storeddata = event.detail.response;

                for (var category in storeddata) {
                    for (var subcategory in storeddata[category]) {
                        formdata[category][subcategory] = storeddata[category][subcategory];
                    }
                }
            }
        });

        var consentButton = document.querySelector('#consentButton');

        var startingTime;
        var endingTime;

        consentButton.addEventListener('click', function () {

            if (consentCheckbox.checked) {

                startingTime = new Date();

                var timestamp = formdata.timestamp;

                timestamp.start = startingTime.getFullYear() + "-" + startingTime.getMonth() + "-" + startingTime.getDate() + " " + startingTime.getHours() + ":" + startingTime.getMinutes() + ":" + startingTime.getSeconds();

                //set up the formdata at the beginning
                formdataOperation(setDataForSubcategory);

                app.switch();
            } else {
                var toast = document.querySelector('#toaster');
                toast.show();
            }
        });

        var issuesButton = document.querySelector('#issuesButton');

        issuesButton.addEventListener('click', function () {

            app.switch();
        });

        var interestButton = document.querySelector('#interestButton');

        interestButton.addEventListener('click', function () {

            app.switch();
        });

        var sourcesButton = document.querySelector('#sourcesButton');

        sourcesButton.addEventListener('click', function () {

            app.switch();
        });

        var activityButton = document.querySelector('#activityButton');

        activityButton.addEventListener('click', function () {

            app.switch();
        });

        var personalButton = document.querySelector('#personalButton');

        personalButton.addEventListener('click', function () {

            app.switch();
        });

        //initiate the options of the birthDate select
        var birthDay = document.querySelector("#yearOfBirth");

        var years = [];

        for (var year = 1987; year < 1997; year++) {
            years[year - 1987] = year;
        };

        app.set("years", years);

        console.log("app.years " + app.years);

        years.forEach(function (item) {
            var option = document.createElement('option');
            option.textContent = item;
            option.value = item;
            birthDay.appendChild(option);
        });

        var workButton = document.querySelector('#workButton');

        workButton.addEventListener('click', function () {

            app.switch();
        });

        var gmap = document.querySelector('google-map');
        //initiate the map location

       gmap.addEventListener('api-load', function(e) {
            app.lat = 45.387372;
            app.lng = -75.695090;

            navigator.geolocation.getCurrentPosition(function (position) {
                var location = position.coords;

                app.lat = location.latitude;

                app.lng = location.longitude;

                console.log(location);

            });
        });

        gmap.addEventListener('google-map-ready', function () {

            gmap.clickEvents = true;

            gmap._clickEventsChanged();

        });

        gmap.addEventListener('google-map-click', function (event) {
            var location;
            console.log(event);

            app.markerlat = event.detail.latLng.lat();

            app.markerlng = event.detail.latLng.lng();

            console.log(app.markerlat + "," + app.markerlng);

        });


        var formSubmit = document.querySelector('#formSubmit');

        formSubmit.addEventListener('response', function (e) {
            console.log("response from server" + JSON.stringify(e.detail.response));
            app.switch();
        });

        var email=document.querySelector("#email");

        email.addEventListener('blur', function(event) {
            if(email.validity.typeMismatch) {
                document.querySelector('#emailErr').innerHTML="Please enter a valid eMail address";
                email.value="";
            }else{
                document.querySelector('#emailErr').innerHTML="";
            }
        });

        var emailButton = document.querySelector('#emailButton');

        emailButton.addEventListener('click', function () {

            //retrieve the data from the form
            formdataOperation(getDataForSubcategory);

            endingTime = new Date();

            formdata.timestamp.end = endingTime.getFullYear() + "-" + endingTime.getMonth() + "-" + endingTime.getDate() + " " +
                endingTime.getHours() + ":" + endingTime.getMinutes() + ":" + endingTime.getSeconds();

            formdata.timestamp.duration = endingTime - startingTime;

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
    };

    app.addEventListener('switcher', function (e) {
        app.switch();
    });

})();