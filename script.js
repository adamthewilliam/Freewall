chrome.storage.session.get(['urlToBeArchived'], function(result) {
    console.log(`Url to be archived is: ${result.urlToBeArchived}`);

    const currentUrl = window.location.href;

    if(currentUrl === "https://web.archive.org/") {
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
    }

    if(currentUrl === "https://archive.ph/") {
        var form = document.querySelector('#submiturl');
        var textBox = form.querySelector('#url');

        textBox.value = result.urlToBeArchived;
        form.requestSubmit();
    }
});