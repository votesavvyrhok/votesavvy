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
    },
    "openQuestion": {
        "youthVoting": null,
        "proposedIssue": null,
        "yourParticipation": null
    }
};

var issueTable={
    "Crime and Justice": "justice",
    "Welfare":null,
    "Defense and International Affairs":"foreign-policy",
    "Environment":null,
    "Economy":"economy",
    "Healthcare":null,
    "Education":null
};

var removePartyElement = function(anchor){

    parties = document.getElementById(anchor);

    //delet the children of parties first
    while (parties.firstChild) {
        parties.removeChild(parties.firstChild);
    }
}

function addPartyData(topic, anchor) {

    var partyData = ['green', 'liberal'];

    parties = document.getElementById(anchor);
    var dataStance = '<div class="pol-widget" data-stance="canada/';
    var identifier = '-party/';
    var end = '"></div>';

    for (var p in partyData) {
        var paperItem = document.createElement('paper-item');
        var element = document.createElement('div');
        var innertext = dataStance + partyData[p] + identifier + topic + end;
        console.log(innertext);
        element.innerHTML = innertext;
        paperItem.appendChild(element);
        parties.appendChild(paperItem);
    }

}

/* Unhappy about loading this dynamically - we should ask for a method */

function loadPollenize() {
    var oldScript = document.getElementById("pollenize");

    if (oldScript)
        oldScript.remove();

    var headID = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = '//widget.pollenize.org/widget.js';
    newScript.id='pollenize';
    headID.appendChild(newScript);
}

var generalTip = "Tip: From left to right: never to very frequently.";

var questions = {
    "sources": {
        prefix: "How often do you receive political information from the following sources:",
        keyword: " ",
        suffix: " ",
        tips:["Tip: Think specifically about this election period starting August 2015. And remember, this includes both online and offline situations.",
            "From left to right: never to very frequently."]
    },
    "familyFriend": {
        prefix: "If you get political information from ",
        keyword: "Family and Friends",
        suffix: ", how often do you get it via the following channels?",
        tips: [generalTip]
    },
    "politicianParty": {
        prefix: "If you get political information from ",
        keyword: "Politicians or Political Parties",
        suffix: ", how often do you get it via the following channels?",
        tips: [generalTip]
    },
    "traditionalMedia": {
        prefix: "If you get political information from ",
        keyword: "Traditional Media",
        suffix: ", how often do you get it via the following channels?",
        tips: [generalTip]
    },
    "civilSociety": {
        prefix: "If you get political information from ",
        keyword: "Civil Society",
        suffix: " (including charities, nonprofits and grassroots organizations), how often do you get it via the following channels?",
        tips: [generalTip]
    }
};

var evaluations= {
    "sources":[{
        title:"Family and Friends",
        id: "familyFriend"
    }, {
        title: "Politicians, candidates and political parties",
        id: "politicianParty"
    }, {
        title: "Traditional media (e.g. CBC, National Post)",
        id: "traditionalMedia"
    }, {
        title: "Civil society groups (including charities, nonprofits and grassroots organizations)",
        id: "civilSociety"
    }],
    "familyFriend": [{
        title: "Facebook (excluding Facebook Messenger)",
        id: "facebook"
    }, {
        title: "Twitter",
        id: "twitter"
    }, {
        title: "Other social media",
        id: "other"
    }, {
        title: "Face to face conversations",
        id: "facetoface"
    }, {
        title: "Phone and video calls (including Skype and Facetime)",
        id: "phone"
    }, {
        title: "Email",
        id: "email"
    }, {
        title: "Text/SMS/BBM (and other instant messaging like Facebook Messenger)",
        id: "instancemessage"
    }],
    "politicianParty": [{
        title: "Facebook (excluding Facebook Messenger)",
        id: "facebook"
    }, {
        title: "Twitter",
        id: "twitter"
    }, {
        title: "Other social media",
        id: "other"
    }, {
        title: "Website, blog, RSS feed",
        id: "web"
    }, {
        title: "Face to face conversations (e.g. door-to-door canvassing, community events)",
        id: "facetoface"
    }, {
        title: "Phone and video calls (including Skype and Facetime)",
        id: "phone"
    }, {
        title: "Email (e.g. party or candidate newsletters and mailing lists)",
        id: "email"
    }, {
        title: "Text/SMS/BBM (and other instant messaging like Facebook Messenger)",
        id: "instancemessage"
    }],
    "traditionalMedia": [{
        title: "Facebook (excluding Facebook Messenger)",
        id: "facebook"
    }, {
        title: "Twitter",
        id: "twitter"
    }, {
        title: "Other social media",
        id: "other"
    }, {
        title: "News website or RSS feeds (e.g. www.cbc.ca/news or www.nationalpost.com)",
        id: "web"
    }, {
        title: "Email (e.g. Google Alerts)",
        id: "email"
    }, {
        title: "Print media (e.g. paper newspaper, paper magazine)",
        id: "printmedia"
    }, {
        title: "Radio or Podcast",
        id: "radio"
    }, {
        title: "Television",
        id: "television"
    }],
    "civilSociety": [{
        title: "Facebook (excluding Facebook Messenger)",
        id: "facebook"
    }, {
        title: "Twitter",
        id: "twitter"
    }, {
        title: "Other social media",
        id: "other"
    }, {
        title: "Website, blog, RSS feed",
        id: "web"
    }, {
        title: "Face to face conversations (e.g. door-to-door canvassing, community events)",
        id: "facetoface"
    }, {
        title: "Phone and video calls (including Skype and Facetime)",
        id: "phone"
    }, {
        title: "Email (e.g. newsletters and mailing lists)",
        id: "email"
    }, {
        title: "Text/SMS/BBM (and other instant messaging like Facebook Messenger)",
        id: "instancemessage"
    }]
};

var sources = [];

var configureSources = function () {

    for (var key in questions) {
        var formItem = {};

        evaluations[key].forEach(function (eval) {
            //configure the formdata
            formItem[eval.id] = null;

            //configure the sourcedata
            //the id is as <question.key><evaluation.id>
            eval.id = key.concat(eval.id);
        });

        formdata[key] = formItem;

        //configure the sources
        var sourceItem = {
            question: questions[key],
            evaluations: evaluations[key]
        };

        sources.push(sourceItem);
    }
};

var configureSourcesdata=function(){
    configureSources();
};

function getDataForSubcategory(category, subcategory) {

    var element;

    var id;

    //in questions, the id is as <category><subcategory>
    if (category in questions)
        id = category.concat(subcategory);
    else
        id = subcategory;

    element = document.querySelector('#' + id);

    var value;

    if (element) {

        /* For radio buttons */
        if (element.localName === 'paper-radio-group') {
            value = element.selected;
        }

        /* For slider */
        if (element.localName === 'paper-slider') {
            value = element.value;
        }

        /* For checkboxes */
        if (element.localName === 'paper-checkbox') {
            value = element.checked;
        }

        if (element.localName === 'paper-input') {
            if (!element.invalid)
                value = element.value;
            else
                value = "";
        }

        /*for input */
        if (element.localName === 'input') {
            value = element.value;
        }

        if (element.localName === 'select') {
            value = element.value;
        }

        if (subcategory === 'markedLocation') {
            formdata[category][subcategory].lat = element.latitude;
            formdata[category][subcategory].lng = element.longitude;
        } else {
            if (category in formdata) {
                if (subcategory in formdata[category]) {
                    formdata[category][subcategory] = value;
                } else {
                    formdata[category] = value;
                }
            }
        }
        return value;
    }
}

function setDataForSubcategory(category, subcategory) {
    var element;

    var id;

    if (category in questions)
        id = category.concat(subcategory);
    else
        id = subcategory;

    element = document.querySelector('#' + id);

    var value;

    if (!element)
        return;

    if (category in formdata) {
        if (subcategory in formdata[category]) {
            value = formdata[category][subcategory];
        } else {
            value = formdata[category];
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

        if (element.localName === 'paper-input') {
            element.value = value;
        }

        if (element.localName === 'input') {
            element.value = value;
        }

        if (element.localName === 'select') {
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

function formdataOperation(operation, next) {
    for (var category in formdata)
        for (var subcategory in formdata[category]) {
            operation(category, subcategory);
        }
    if (next)
        next();
}

function sendData() {
    var formSubmit = document.querySelector('#formSubmit');
    formSubmit.parms = formdata;
}

var formdataAdjustment = function(){
  //adjust the postcode;
   formdata.personal.postalCode = formdata.personal.postalCode.toUpperCase().replace(/\s+/g, '');

};

var SUBMITTED="submitted";
var INIT="init";
var VALID="valid";
var INVALID="invalid";

var surveystate={
    formdata: null,
    infopack:{
        topic:null,
        postcode:null
    }
};

//keys is an array containing a leave node and its ancestors

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

    // Close drawer after menu item is selected if drawerPanel is narrow

    configureSourcesdata();

    surveystate["formdata"]=INIT;

    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function () {

        var consentCheckbox = document.querySelector("#consentCheckbox");

        var consentButton = document.querySelector('#consentButton');

        var startingTime;
        var endingTime;

        var consent = false;

        consentButton.addEventListener('click', function () {
            if (consentCheckbox.checked) {
                startingTime = new Date();
                var timestamp = formdata.timestamp;
                timestamp.start = startingTime.getFullYear() + "-" + startingTime.getMonth() + "-" + startingTime.getDate() + " " + startingTime.getHours() + ":" + startingTime.getMinutes() + ":" + startingTime.getSeconds();

                consent = true;

            } else {
                var toast = document.querySelector('#toaster');
                toast.show();
            }

        });

        app.onMenuSelect = function () {
            var drawerPanel = document.querySelector('#paperDrawerPanel');
            if (drawerPanel.narrow) {
                drawerPanel.closeDrawer();
            }
        };

        var pages = document.querySelector('iron-pages');

        var surveypage="home";

        var firstpage = "issues";

        var infopackpage = "infopack";

        app.switch = function () {
            pages.selectNext();
        };

        /*
        app.addEventListener('switcher', function (e) {
            app.switch();
        });
        */

        var nextButtons = document.querySelectorAll('paper-fab.nextButton');

        Array.prototype.forEach.call(nextButtons, function (button) {
            button.addEventListener('click', function () {
                if (consent){
                    app.switch();
                    surveypage = pages.selected;
                    if (surveypage === infopackpage){
                        categorySelect.selected = 1;
                    }
                    if (surveypage === firstpage){
                        categorySelect.selected = 0;
                    }
                }
            });
        });

        var categorySelect = document.querySelector('#categoryTab');

        categorySelect.addEventListener('click',function(event){

            window.scrollTo(0,0);

            if (categorySelect.selected == 0){
                if (surveypage == infopackpage)
                {
                    //the infopack is opened after form submission
                    //return to the first page
                    pages.selected = firstpage;
                    surveypage = firstpage;
                }else {
                    pages.selected = surveypage;
                }
            }else
                if (categorySelect.selected == 1)
                   if (surveypage != infopackpage)
                    {
                        openInfoPack();
                        pages.selected = infopackpage;
                    }
        });

        // imports are loaded and elements have been registered
        var screenName = document.querySelector("#screenName");

        app.signinvisible = true;

        var formRetrieveCall = document.querySelector('#formRetrieveCall');

        if (screenName.textContent) {
            app.signinvisible = false;

            //fire the ajax call to retrieve the data stored
            formRetrieveCall.generateRequest();
        }

        formRetrieveCall.addEventListener('response', function (event) {
            if (!event.detail.response) {
                return;
            }

            consentCheckbox.checked = true;

            var storeddata = event.detail.response;

            for (var category in storeddata) {
                for (var subcategory in storeddata[category]) {
                    if ((category in formdata) && (subcategory in formdata[category]))
                            formdata[category][subcategory] = storeddata[category][subcategory];
                    }
            }
            //set up the formdata at the beginning
            formdataOperation(setDataForSubcategory);
            surveystate["formdata"]=SUBMITTED;
        });

        app.sources=sources;

        //initiate the options of the birthDate select
        var birthDay = document.querySelector("#yearOfBirth");

        var years = [null];

        for (var year = 1997; year>= 1910; year--) {
            years.push(year);
        };

        app.set("years", years);

        years.forEach(function (item) {
            var option = document.createElement('option');
            option.textContent = item;
            option.value = item;
            birthDay.appendChild(option);
        });

        var gmap = document.querySelector('google-map');
        //initiate the map location

        gmap.addEventListener('api-load', function (e) {
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

        var formSubmitCall = document.querySelector('#formSubmitCall');

        formSubmitCall.addEventListener('response', function (e) {
            console.log("response from server" + JSON.stringify(e.detail.response));
        });

        var formSubmission = function () {
            //retrieve the data from the form
            formdataOperation(getDataForSubcategory,formdataAdjustment);

            endingTime = new Date();
            formdata.timestamp.end = endingTime.getFullYear() + "-" + endingTime.getMonth() + "-" + endingTime.getDate() + " " +
                endingTime.getHours() + ":" + endingTime.getMinutes() + ":" + endingTime.getSeconds();
            formdata.timestamp.duration = endingTime - startingTime;
            console.log(formdata);
            formSubmitCall.body = JSON.stringify(formdata);
            console.log(formSubmitCall.body);
            surveystate["formdata"]=SUBMITTED;
            formSubmitCall.generateRequest();
        };

        formSubmitCall.addEventListener('response', function (e) {
            console.log("response from server" + JSON.stringify(e.detail.response));
        });

        var getCandidateCall = document.querySelector('#getCandidateCall');

        var getCandidate = function(){

            //get the postal code
            var postcode = getDataForSubcategory("personal","postalCode");

            //build the url of the call
            if (postcode)
            {
                postcode = postcode.toUpperCase().replace(/\s+/g, '');
                app.yourpostcode = postcode;
                getCandidateCall.url="/represent/postcode/".concat(postcode);

                surveystate["infopack"]["postcode"]= VALID;
                //ajax call
                getCandidateCall.generateRequest();
            }else
                surveystate["infopack"]["postcode"]=INVALID;

        };

        getCandidateCall.addEventListener('response', function(event){
            console.log(event.detail.response);
            if (event.detail.response)
                app.candidates=event.detail.response.candidates_centroid;
            else{
                app.attentionVisible = true;
                app.attention="There is an error while retrieving the information of canadidates in your location... Try again!"
            }
        });

        var getPollenizeIssues = function(){
            var yourissue = getDataForSubcategory("issues","selected");

            app.yourissue = yourissue;
            var topic = issueTable[yourissue];
            //remove the elements of partyInfo
            removePartyElement('partyInfo');

            if (!topic)
            {
                surveystate["infopack"]["topic"]=INVALID;
            }else{
                addPartyData(topic, 'partyInfo');
                loadPollenize();
                surveystate["infopack"]["topic"]=VALID;
            }
        }

        var endButton = document.querySelector('#endButton');

        endButton.addEventListener('click', function () {
            formSubmission();
            openInfoPack();
        });

        var openInfoPack = function(){

            app.attentionVisible = false;

            if (surveystate["formdata"]!=SUBMITTED)
            {
                app.attentionVisible = true;
                if (app.signinvisible)
                    app.attention="You may see your voting information after submitting your response!";
                else
                    app.attention="You may see your voting information after you have submitted your response at least once!";
                return;
            }

            getCandidate();
            if (surveystate["infopack"]["postcode"]!=VALID){
                app.attentionVisible = true;
                app.attention = "Your response should have valide location!"
            }

            getPollenizeIssues();
            if (surveystate["infopack"]["topic"]!=VALID){
                app.attentionVisible = true;
                app.attention = "There is no information on your issue temporarily!"
            }

        }
    });

})();