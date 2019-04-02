var headerBar;

function initOnce () {
    // check if element exists yet
    headerBar = document.querySelector('body > div > header');
    if (headerBar) {
        // element exists, remove the event listeners so we don't run this twice
        document.removeEventListener('DOMNodeInserted', initOnce);
        document.removeEventListener('DOMContentLoaded', initOnce);

        // send a message to the background script to enable the page action
        chrome.runtime.sendMessage('enable_page_action', function () {});

        // The options fetch is slow.  On the first run, let's disable the dark header.
        // This may cause flicker for dark-header uses, but white to black flicker is less noticeable.
        // Suggested here: https://github.com/DennisSnijder/MakeGithubGreatAgain/issues/48#issuecomment-280831397
        // Unfortunately this doesn't work right now because the black styling isn't actually on header-dark.
        headerBar.classList.add('header-dark');
    }
    applyStyle();
}

// event listeners
document.addEventListener('DOMNodeInserted', initOnce);
document.addEventListener('DOMContentLoaded', initOnce);

// listen for messages from the background script to update
chrome.runtime.onMessage.addListener(function (message, sender, callback) {
    if (message === 'apply_style') {
        applyStyle();
    }
});

function applyStyle () {
    chrome.storage.sync.get({
        enabled: true,
        originalHeader: true,
        shortHeader: true,
        shortSearchBox: true,
        originalColors: true,
    }, function (options) {
        resetClasses();
        if (options.enabled) {
            setClasses(options);
        }
    });
}

function resetClasses () {
    headerBar.classList.remove('great-header');
    headerBar.classList.add('header-dark');
    headerBar.classList.remove('short-header');
    headerBar.classList.remove('short-search-box');
    document.querySelector('body').classList.remove('great-again');
}

function setClasses (options) {
    if (options.originalHeader && headerBar) {
        headerBar.classList.remove('header-dark');
        headerBar.classList.add('great-header');
    }
    if (options.shortHeader && headerBar) {
        headerBar.classList.add('short-header');
    }
    if (options.shortSearchBox && headerBar) {
        headerBar.classList.add('short-search-box');
    }
    if (options.originalColors) {
        document.querySelector('body').classList.add('great-again');
    }
}
