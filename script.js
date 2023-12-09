
chrome.storage.session.get(['urlToBeArchived'], function(result) {
    console.log('Url to be archived is: ' + result.urlToBeArchived);
    
    var shadowRoot = document.querySelector('app-root').shadowRoot;
    console.log(shadowRoot);

    var routerSlotElement = shadowRoot.querySelector('router-slot');
    console.log(routerSlotElement);

    var homeShadow = routerSlotElement.querySelector('home-page').shadowRoot;
    console.log(homeShadow);

    var containerShadow = homeShadow.querySelector('ia-wayback-search').shadowRoot;
    console.log('Container Shadow' + containerShadow);

    var textBox = containerShadow.querySelector('#url');
    textBox.value = result.urlToBeArchived;

    var form = containerShadow.querySelector('form');
    console.log(form);
    form.requestSubmit();
});


