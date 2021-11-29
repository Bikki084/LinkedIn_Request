Linkedin = {
    config: {
        scrollDelay: 3000,
        actionDelay: 5000,
        // set to -1 for no limit
        maxRequests: -1,
        totalRequestsSent: 0,
        // setting to false to skip adding notes in invites
        addNote: false,
    },
    init: function (data, config) {
        console.info("INFO: script initialized on the page...");
        console.debug("DEBUG: scrolling to bottom in " + config.scrollDelay + " ms");
        setTimeout(() => this.bottomScroll(data, config), config.actionDelay);
    },
    bottomScroll: function (data, config) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        console.debug("DEBUG: scrolling to top in " + config.scrollDelay + " ms");
        setTimeout(() => this.topScroll(data, config), config.scrollDelay);
    },
    topScroll: function (data, config){
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.debug("DEBUG: checking the elements in " + config.scrollDelay + " ms");
        setTimeout(() => this.check(data, config), config.scrollDelay);
    },
   check: function (data, config) {
        var totalRows = this.totalRows(); 
        console.debug("DEBUG: total search results found on page are " + totalRows);
        if (totalRows >= 0) {
            this.compile(data, config);
        } else {
            console.warn("WARN: end of search results!");
        }
    },
    compile: function (data, config) {
        var elements = document.querySelectorAll('button');
        data.pageButtons = [...elements].filter(function (element) {
            return element.textContent.trim() === "Connect";
        });
        if (!data.pageButtons || data.pageButtons.length === 0) {
            console.warn("ERROR: no connect buttons found on page!");
            this.complete(config);

        } else {
            data.pageButtonTotal = data.pageButtons.length;
            console.info("INFO: " + data.pageButtonTotal + " connect buttons found");
            data.pageButtonIndex = 0;
            var names = document.getElementsByClassName("entity-result__title-text");
            names = [...names].filter(function (element) {
                return element.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.textContent.includes("Connect\n");
            });
            data.connectNames = [...names].map(function (element) {
                return element.innerText.split(" ")[0];
            });
            console.debug("DEBUG: starting to send invites in " + config.actionDelay + " ms");
            setTimeout(() => { this.sendInvites(data, config) }, config.actionDelay);
        }
    },
    sendInvites: function (data, config) {
        console.debug("remaining requests " + config.maxRequests);
        if (config.maxRequests == 0){
            console.info("INFO: max requests reached for the script run!");
        } else {
            console.debug('DEBUG: sending invite to ' + (data.pageButtonIndex + 1) + ' out of ' + data.pageButtonTotal);
            var button = data.pageButtons[data.pageButtonIndex];
            button.click();
            if (config.addNote && config.note) {
                console.debug("DEBUG: clicking Add a note in popup, if present, in " + config.actionDelay + " ms");
                setTimeout(() => this.clickAddNote(data, config), config.actionDelay);
            } else {
                console.debug("DEBUG: clicking done in popup, if present, in " + config.actionDelay + " ms");
                setTimeout(() => this.clickDone(data, config), config.actionDelay);
            }
        }
    },
    
    clickDone: function (data, config) {
        var buttons = document.querySelectorAll('button');
        var doneButton = Array.prototype.filter.call(buttons, function (el) {
            return el.textContent.trim() === 'Send';
        });
        // Click the first send button
        if (doneButton && doneButton[0]) {
            console.debug("DEBUG: clicking send button to close popup");
            doneButton[0].click();
        } else {
            console.debug("DEBUG: send button not found, clicking close on the popup in " + config.actionDelay);
        }
        setTimeout(() => this.clickClose(data, config), config.actionDelay);
    },
    clickClose: function (data, config) {
        var closeButton = document.getElementsByClassName('artdeco-modal__dismiss artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary ember-view');
        if (closeButton && closeButton[0]) {
            closeButton[0].click();
        }
        console.info('INFO: invite sent to ' + (data.pageButtonIndex + 1) + ' out of ' + data.pageButtonTotal);
        config.maxRequests--;
        config.totalRequestsSent++;
        if (data.pageButtonIndex === (data.pageButtonTotal - 1)) {
            
            this.complete(config);
        } else {
            data.pageButtonIndex++;
            console.debug("DEBUG: sending next invite in " + config.actionDelay + " ms");
            setTimeout(() => this.sendInvites(data, config), config.actionDelay);
        }
    },
    
    complete: function (config) {
        console.info('INFO: script completed after sending ' + config.totalRequestsSent + ' connection requests');
    },
    totalRows: function () {
        var search_results = document.getElementsByClassName('search-result');
        if (search_results && search_results.length != 0) {
            return search_results.length;

        } else {
            return 0;
        }
    }
}

Linkedin.init({}, Linkedin.config);