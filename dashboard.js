var globals = {};

var Dashboard = {
    initDelete: function (e, route) {
        var obj = $(e.target).parents('li').find('.name');

        $('#delete-modal')
            .find('b.text-holder')
            .text(obj.text())
            .end()
            .find('.del')
            .click(function () {
                Dashboard.actionAjax(route, {
                    id: obj.parents('li').data('id')
                }, function () {}, 'DELETE');
            });
    },

    bindToMany: function (bindTo, e, obj) {
        var bindingTo = !bindTo ? $('#edit-modal') : bindTo,
            selector = 0,
            bindingFrom = $(e.target).parents('li').find('.item-props');

        SelectorObj = serializeFormData();
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

    initUpdate: function (e, route) {
        $('.done-btn').unbind('click').click(function (evt) {
            var data = serializeFormData(),
                id = $(e.target).parents('li').data('id');

            for (prop in data) {
                if (data[prop] == '') delete data[prop];
            }
            data.id = id;

            Dashboard.actionAjax(route, data, function (response) {
                bindActionEvent();
                Materialize.toast(response.message, 4000);
            }, 'PUT');
        });
    },

    actionAjax: function (url, data, successfn, type, multipart) {
        if (multipart === true) {
            $.ajax({
                url: url,
                type: 'post',
                contentType: false,
                processData: false,
                data: data || serializeFormData(),
                success: function (response) {
                    $('#edit-modal').closeModal();
                    Materialize.toast(response.message, 1000, '', function () {
                        reload();
                    });
                    successfn.call({}, response);
                },
                error: function () {
                    console.log('oops!');
                }
            });
        } else {
            $.ajax({
                url: url,
                type: type || 'post',
                data: data || serializeFormData(),
                success: function (response) {
                    $('#edit-modal').closeModal();

                    Materialize.toast(response.message, 1000, '', function () {
                        reload();
                    });
                    successfn.call({}, response);
                },
                error: function () {
                    console.log('oops!');
                }
            });
        }
    },
    messageAfter: function (obj, message) {
        $("<p>", {
            text: message,
            class: 'message'
        }).insertAfter(obj);
        console.log(message);
    }
};


function sanitizeForm() {
    serverData = {};
    $('.ui.modal').find('input[type=text], input[type=email], input[type=telephone]').val('').end().find('.close').trigger('click');
}

function serializeFormData(form) {
    var obj = form || $('#edit-modal'),
        inputs = obj.find('input[name], select[name]'),
        serverData = new FormData();

    inputs.each(function (index) {
        if ($(this).attr('type') == 'file') {
            var name = $(this).attr('name');
            
            $.each($(this)[0].files, function (i, file) {
                serverData.append(name, file);
            });
        } else {
            serverData.append($(this).attr('name'), $(this).val());
        }
    });
    return serverData;
}

$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

var contents = $('section.wrapper section.content'),
    Actions = {
        viewBtn: $('ul.side-nav.fixed a.view-btn'),
        getView: function (url) {
            (function () {
                $('.loader .mover').velocity({
                    width: '100%'
                }, {
                    easing: 'easeOutQuint',
                    duration: 1000,
                    complete: function () {
                        //do something after full loading

                        $(this).velocity({
                            opacity: 0
                        });
                    }
                });
            })();
            viewAjax(url, {}, function (data) {
                contents.html(data);

                $('.modal-trigger').leanModal();
                $('.collapsible').collapsible();
                $('select').material_select();

                bindActionEvent();
            });
        }
    };

function upperCaseFirst(string) {
    var firstChar = string.charAt(0),
        newString = firstChar.toUpperCase() + string.slice(1);
    return newString;
}

function reload() {
    globals.lastClickedViewBtn.trigger('click');
}

function bindActionEvent() {
    $('[data-action]').click(function (e) {
        var splited = $(this).data('action').split('.', 3);
        var action = splited[0],
            target = splited[1];

        console.log(action + upperCaseFirst(target));
        globals.lastClickedActionBtn = $(e.target);

        Actions[action + upperCaseFirst(target)].call(Actions, e);
    });
}

window.viewAjax = function (url, serverData, success) {
    $.ajax({
        url: url,
        type: 'get',
        data: serverData,
        success: function (data) {
            success.call({}, data);
        },
        error: function () {
            console.log('oops!');
        }
    });
};



$(document).ready(function () {
    function wait(func, time) {
        window.setTimeout(function () {
            func.call();
        }, time);
    }

    Actions.viewBtn.click(function (e) {
        $('.ui.dimmer.modals.page.transition').remove();
        $('body').removeClass('dimmable scrolling');
        e.preventDefault();
        Actions.getView($(this).attr('href'));

        globals.lastClickedViewBtn = $(this);
    }).first().trigger('click');

    $('body').on('click', '.add-comp-btn', function (e) {
        e.stopPropagation();
    });


    var preview = $('#preview');

    function showPhoto(input, target, bytes) {
        var Reader = new FileReader();
        if (input.files && input.files[0]) Reader.readAsDataURL(input.files[0]);
        else console.log('files is empty');

        Reader.onloadend = function () {
            target.attr('src', Reader.result);
            bytes.attr('value', Reader.result);
        }
    }

    $('body').on('change', '#image', function (e) {
        console.log('selected');
        showPhoto(e.target, $('#preview'), $('#image_file'));
    });
})