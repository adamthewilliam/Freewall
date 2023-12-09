chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "OpenArchiveId",
        title: "Open in Archive",
        type: "normal",
        contexts: ['link']
    });
});

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

// Open a new search tab when the user clicks a context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectedLinkUrl = info.linkUrl;
    const newUrl = new URL(`https://archive.org/`);

    const tabIndex = tab.index + 1

    chrome.tabs.create({ url: newUrl.href, index: tabIndex });
    chrome.storage.session.set({urlToBeArchived: selectedLinkUrl}).then(() => {
        console.log("Url:" + selectedLinkUrl + "to archive has been stored.");
    })
});

// Listens for tab creation, once the tab is created we listen
// for the update and check whether the tab is fully loaded. 
// To clean up remove the onUpdated listener
chrome.tabs.onCreated.addListener(function onCreateListener(tab) {
    chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
        if (info.status === 'complete' && tabId === tab.id) {
            chrome.tabs.onUpdated.removeListener(listener);
                chrome.scripting.executeScript({
                        target : {tabId : tab.id},
                        files : [ "script.js" ],
                })
                .then(() => console.log("script injected"));
        }
    });
    chrome.tabs.onUpdated.removeListener(onCreateListener);
});


