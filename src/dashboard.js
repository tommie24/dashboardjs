/**
 * Krecent Dashboard.js
 **/

/* Dashboard.js v1.5 (C) Krecent Technologies | MIT @license: en.wikipedia.org/wiki/MIT_License.*/

window.wait = function(func, time) {
    window.setTimeout(function() {
        func.call();
    }, time);
};

var Global = {
        content: '#content',
        lastClickedViewBtn: null
    },
    Handler = {
        handleClickEvents: function(e) {
            e.preventDefault;
            var action = $(this).data('action');

            Global.lastClickedActionBtn = $(e.currentTarget);
            Global.lastVisitedURL = $(e.currentTarget).data('href') || Global.lastVisitedURL;

            Actions[action].call(Actions, e);
        },
        handleKeypressEvents: function(e) {
            e.preventDefault;
            var action = $(this).data('key-press');

            Actions[action].call(Actions, e);
        },
        handleViewBtnClick: function(e) {
            e.preventDefault();

            Global.lastClickedViewBtn = $(e.currentTarget);
            Actions.getView(Global.lastClickedViewBtn.data('href'));
        },
        handleRefreshClick: function(e) {
            Dashboard.reload();
        }
    },
    Event = {
        events: ['click', 'keypress', 'mouseover', 'mouseout', 'focusout'],
        init: function() {
            var parent = this;
            parent.events.forEach(function(event, index) {
                parent[event] = {};
                parent[event].bindTo = function(selector, func) {
                    var targets = document.querySelectorAll(selector);

                    targets.forEach(function(element, index) {
                        element.addEventListener(event, func, false);
                    });
                }
            });
        }
    };


var bindClickEvents;

(bindClickEvents = function() {
    var clickableElements = document.querySelectorAll('[data-action]');
    var keypressElements = document.querySelectorAll('[data-key-press]');

    clickableElements.forEach(function(element, index) {
        element.addEventListener('click', Handler.handleClickEvents, false);
    });
    clickableElements.forEach(function(element, index) {
        element.addEventListener('keypress', Handler.handleKeypressEvents, false);
    });
})();

var Dashboard = {
    sanitizeForm: function() {
        serverData = {};
        $('.modal')
            .find('input[type=text], input[type=email], input[type=telephone]')
            .val('')
            .end()
            .find('.close')
            .trigger('click');
    },

    serializeFormData: function(form, ALLOW_EMPTY) {
        var obj = form || document.querySelectorAll('.modal.active form'),
            serverData = new FormData();

        obj.forEach(function(form) {
            var inputs = form.querySelectorAll('input[name], select[name], textarea[name]');

            inputs.forEach(function(input) {
                if (input.getAttribute('type') == 'file') {
                    var name = input.getAttribute('name');

                    input[0].files.forEach(function(i, file) {
                        serverData.append(name, file);
                    });
                } else if (input.value != '' || ALLOW_EMPTY) {
                    if (input.getAttribute('type') == 'checkbox' && !input.checked) {} else {
                        serverData.append(input.getAttribute('name'), input.value);
                    }
                }
            });
        });
        return serverData;
    },

    initDelete: function(e, route) {
        var obj = $(e.target).parents('li').find('.name');

        $('#delete-modal')
            .find('b.text-holder')
            .text(obj.text())
            .end()
            .find('.del')
            .click(function() {
                Dashboard.actionAjax(route, {
                    id: obj.parents('li').data('id')
                }, function() {
                    $('#delete-modal').closeModal();
                }, 'DELETE');
            });
    },
    bindToMany: function(bindTo, e, obj) {
        var bindingTo = !bindTo ? $('#edit-modal') : bindTo,
            selector = 0,
            bindingFrom = $(e.target).parents('li').find('.item-props');

        SelectorObj = Dashboard.serializeFormData(false, false, true);
        SelectorArray = [];

        for (name in SelectorObj) {
            SelectorArray.push(name);
        }
        while (selector < SelectorArray.length) {
            if (obj == 'input') {
                bindingTo.find('[name=' + SelectorArray[selector] + ']')
                    .val(bindingFrom.find('.' + SelectorArray[selector]).text())
                    .siblings('label')
                    .addClass('active');

            } else {
                bindingTo.find(SelectorArray[selector]).text(bindingFrom.find(SelectorArray[selector]).text());
            }
            selector++;
        }
    },
    initUpdate: function(e, route) {
        Dashboard.bindToMany(false, e, 'input');

        $('.done-btn').unbind('click').click(function(evt) {
            var data = Dashboard.serializeFormData(),
                id = $(e.target).parents('li').data('id');

            for (prop in data) {
                if (data[prop] == '') delete data[prop];
            }
            data.id = id;

            Dashboard.actionAjax(route, data, false, 'PUT');
        });
    },
    viewAjax: function(url, serverData, success) {
        $.ajax({
            url: url,
            type: 'get',
            data: serverData,
            success: function(data) {
                success.call({}, data);
            },
            error: function() {
                console.log('oops!');
            }
        });
    },
    actionAjax: function(url, data, successfn, type) {
        $.ajax({
            url: url,
            type: type || 'post',
            data: data || Dashboard.serializeFormData(),
            contentType: false,
            processData: false,
            success: function(response) {
                if (!response.error && response.message) {
                    $('#edit-modal').closeModal();
                    Dashboard.sanitizeForm();

                    Materialize.toast(response.message, 1000, '', function() {
                        Dashboard.reload();
                    });
                }

                if (successfn) successfn.call({}, response);
            },
            error: function() {
                console.log('oops!');
            }
        });
    },
    initCreate: function() {
        var url = $('.edit-modal').find('form').attr('action');
        this.actionAjax(url);
    },
    messageAfter: function(obj, message) {
        $("<p>", {
            text: message,
            class: 'message'
        }).insertAfter(obj);
        console.log(message);
    },

    renderResponse: function(response) {
        $(Global.content).html(response);
        /*	window.history.pushState({}, '', Global.lastVisitedURL);*/

        bindClickEvents();
    },

    reload: function() {
        Global.lastClickedViewBtn.trigger('click');
        $('button.refresh').velocity('callout.flash');
    },

    notify: function(message, time, fn) {
        var nObj = document.querySelector('.notification');

        nObj.querySelector('.msg').innerText = message;
        nObj.classList.add('show');

        wait(function() {
            nObj.classList.remove('show');
            fn.call({}, message);
        }, time);
    },
    options: function(optionsObject) {
        for (option in optionsObject) {
            Global[option] = optionsObject[option];
        }
    }
};

var Utility = {
        search: function(e, selector, textSelector) {

            var q = $(e.target).val();

            if (!this.search.results) this.search.results = {};
            if (this.search.results[q] != null) {
                this.search.results[q].show()
            } else {
                var elements = $(selector);

                elements.hide();
                elements.each(function() {
                    var link = $(selector).find(textSelector),
                        Regex = new RegExp(q, 'i');

                    if (link.text().match(Regex)) {
                        link.parent(selector).addClass('SEARCH_MATCH');
                    } else {
                        link.parent(selector).removeClass('SEARCH_MATCH');
                    }
                });

                this.search.results[q] = $('.SEARCH_MATCH');

                if (this.search.results[q].length === 0) {
                    $('.void-content-message').show();
                } else {
                    this.search.results[q].show();
                    $('.void-content-message').hide();
                }
            }
        },
        upperCaseFirst: function(string) {
            var firstChar = string.charAt(0),
                newString = firstChar.toUpperCase() + string.slice(1);
            return newString;
        },
        setCSRFToken: function() {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
        },
        showPhoto: function(input, target, bytes) {
            var Reader = new FileReader();
            if (input.files && input.files[0]) Reader.readAsDataURL(input.files[0]);
            else console.log('files is empty');

            Reader.onloadend = function() {
                target.attr('src', Reader.result);
                bytes.attr('value', Reader.result);
            }
        }
    },

    Actions = {
        viewBtn: document.querySelectorAll('.view-btn') || document.querySelectorAll(Global.viewBtn),
        getView: function(url) {
            Global.lastVisitedURL = window.location.href + url;

            Dashboard.viewAjax(Global.lastVisitedURL, {}, function(response) {
                Dashboard.renderResponse(response);
            });
        }
    };

Actions.viewBtn.forEach(function(element, index) {
    element.addEventListener('click', Handler.handleViewBtnClick, false);
});

Event.init();
Utility.setCSRFToken();

document.querySelector('.refresh').addEventListener('click', Handler.handleRefreshClick, false);