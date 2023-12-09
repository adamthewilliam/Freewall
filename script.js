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

    //var textBox = document.querySelector('.rbt-input-main');
    //textBox.value = result.urlToBeArchived;
    //console.log(textBox);
    //console.log(textBox.value);

    //var form = document.querySelector('.search-text-container form');
    //console.log(form);
    //form.submit();
    //var btn = document.querySelector('.hidden-submit-btn');
    //console.log(btn);
    //btn.click();
});


