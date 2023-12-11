chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

const initialUrlDestination = "https://archive.ph/";
const finalUrlDestination = "https://web.archive.org/web";

chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "OpenArchiveId",
        title: "Open in Archive",
        type: "normal",
        contexts: ['link']
    });
});

// Entry points to redirecting user
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectedLinkUrl = info.linkUrl;
    handleUserRedirection(selectedLinkUrl, tab.index);
});

chrome.action.onClicked.addListener((tab) => {
    const currentTabUrl = tab.url;
    console.log(currentTabUrl);
    handleUserRedirection(currentTabUrl, tab.index);
});

// Listens for tab creation, once the tab is created we listen
// for the update and check whether the tab is fully loaded. 
// To clean up remove the onUpdated listener
chrome.tabs.onCreated.addListener(function onCreateListener(tab) {
    console.log("Created listener added");
    chrome.tabs.onUpdated.addListener(function listener (tabId, info, onUpdatedTab) {

        console.log("updated listener callback hit");
        console.log("tabId: " + onUpdatedTab.index + " tab.index: " + tab.index);

        if (info.status === 'complete' && tabId === tab.id) {

            let queryOptions = {active: true, lastFocusedWindow: true};
            chrome.tabs.query(queryOptions, ([currentTab]) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                }
                else {
                    if(currentTab.index !== onUpdatedTab.index) {
                            console.log("We are in a different tab and will make a push notification");

                            handleNotification(onUpdatedTab.index);
                            
                            chrome.tabs.onUpdated.removeListener(listener);
                    }
                    else {
                        console.log("We are currently in the same tab. Add value to textbox and submit form");

                        chrome.scripting.executeScript({
                            target : {tabId : onUpdatedTab.id},
                            files : [ "script.js" ],
                        })
                        .then(() => console.log("script injected"));

                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                }
            });
        }
    });
});

function handleUserRedirection(url, tabIndex) {
    console.log(url, tabIndex)

    const newUrl = new URL(initialUrlDestination);

    chrome.tabs.create({ url: newUrl.href, index: tabIndex + 1});
    chrome.storage.session.set({urlToBeArchived: url}).then(() => {
        console.log("Url: " + url + " to archive has been stored.");
    });
}

function handleNotification(idOfTabToMoveTo) {
    console.log("time to make a notification for tab id: " + idOfTabToMoveTo);
    chrome.notifications.create(
        idOfTabToMoveTo.toString(), {
            title: "Completed",
            iconUrl: "icons/icon128.png",
            message: "You have broken the paywall!",
            type: "basic",
            buttons: [
                {
                    title: "Go back"
                }
            ]
        },
        (notificationId) => {
            if (chrome.runtime.lastError) {
                console.log("Error creating notification: " + chrome.runtime.lastError.message);
            } else {
                console.log("Notification created successfully with id: " + notificationId);
            }
        }
    );
}

chrome.notifications.onButtonClicked.addListener((notificationId) => {
    var indexOfTabToMoveTo = Number.parseInt(notificationId)
    chrome.tabs.highlight({tabs: indexOfTabToMoveTo}, () => {
        console.log("Moved back to previous tab after the web page has loaded")
        chrome.notifications.clear(notificationId);
    });
});