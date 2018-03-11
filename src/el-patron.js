(function() {
    var PLOMO_LOWER = 'dar plomo';
    var PLOMO_UPPER = 'Dar Plomo';
    var originalWords = {
        'en': [{
            original: 'remove',
            replacement: PLOMO_LOWER
        }, {
            original: 'Remove',
            replacement: PLOMO_UPPER
        }, {
            original: 'delete',
            replacement: PLOMO_LOWER
        }, {
            original: 'Delete',
            replacement: PLOMO_UPPER
        }],
        'es': [{
            original: 'borrar',
            replacement: PLOMO_LOWER
        }, {
            original: 'Borrar',
            replacement: PLOMO_UPPER
        }, {
            original: 'eliminar',
            replacement: PLOMO_LOWER
        }, {
            original: 'Eliminar',
            replacement: PLOMO_UPPER
        }]
    };

    var IGNORED_ELEMENTS = new RegExp('input|textarea', 'gi');
    var textValidationRegex = getTextValidationRegex();

    walk(document.body);

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                walk(mutation.target);
            } else if (mutation.target.nodeType === 3) {
                handleText(mutation.target);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        attributes: false,
        characterData: true,
        subtree: true
    });

    function walk(node) {
        // I stole this function from here:
        // http://is.gd/mwZp7E

        var child, next;

        if (node.tagName && IGNORED_ELEMENTS.test(node.tagName)) {
            return;
        }

        switch(node.nodeType) {
            case 1:  // Element
            case 9:  // Document
            case 11: // Document fragment
                child = node.firstChild;
                while(child) {
                    next = child.nextSibling;
                    walk(child);
                    child = next;
                }
                break;
            case 3: // Text node
                handleText(node);
                break;
        }
    }

    function handleText(textNode) {
        var text = textNode.nodeValue;
        if (!text || !text.trim() || !textValidationRegex.test(text)) { return; }

        for(var lang in originalWords) {
            originalWords[lang].forEach(function(word) {
                var pattern = new RegExp('\\b' + word['original'] + '\\b(?![áéíóúÁÉÍÓÚ])', 'g');
                text = text.replace(pattern, word['replacement']);
            });
        }

        textNode.nodeValue = text;
    }

    function getTextValidationRegex() {
        var allWords = [];
        for(var lang in originalWords) {
            allWords = allWords.concat(originalWords[lang].map(function(word) { return word.original; }));
        }

        var pattern = '(' + allWords.join('|') + ')';
        return new RegExp(pattern, 'g');
    }
})();

