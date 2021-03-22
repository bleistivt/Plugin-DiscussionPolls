jQuery(document).ready(($) => {
    // Get strings from definitions
    const ResultString = gdn.definition('DP_ShowResults');
    const FormString = gdn.definition('DP_ShowForm');
    const ConfirmString = gdn.definition('DP_ConfirmDelete');

    // hijack the results click
    $('#DP_Results a').click(function(event) {
        event.preventDefault();

        if ($(this).html() === ResultString) {
            const btn = this;
            // Load from ajax if they don't exist
            if ($('.DP_ResultsForm').length === 0) {
                // Load Results from ajax
                $.ajax({
                    url: $(btn).attr('href'),
                    global: false,
                    type: 'GET',
                    data: 'DeliveryType=VIEW',
                    dataType: 'json',
                    beforeSend() {
                        // add a spinner
                        $(btn).after('<span class="DP_Spinner TinyProgress">&nbsp;</span>');
                    },
                    success({html}) {
                        $('.DP_AnswerForm').after(html);
                        $('.DP_ResultsForm').hide();

                        // Repeated here to account for slow hosts
                        $('.DP_AnswerForm').fadeOut('slow', () => {
                            $('.DP_ResultsForm').fadeIn('slow', () => {
                                // Change tool mode
                                $(btn).html(FormString);
                            });
                        });
                    },
                    complete() {
                        $('.DP_Spinner').remove();
                    }
                });
            }
            else {
                // Bring results to front
                $('.DP_AnswerForm').fadeOut('slow', () => {
                    $('.DP_ResultsForm').fadeIn('slow', () => {
                        // Change tool mode
                        $(btn).html(FormString);
                    });
                });
            }
        }
        else {
            // Bring poll form to front
            $('.DP_ResultsForm').fadeOut('slow', () => {
                $('.DP_AnswerForm').fadeIn('slow');
            });

            // Change tool mode
            $(this).html(ResultString);
        }
    });

    // hijack the submission click
    $('.DP_AnswerForm form').submit(function(event) {
        event.preventDefault();
        // Load the result from ajax
        $.ajax({
            url: $(this).attr('action'),
            global: false,
            type: $(this).attr('method'),
            data: $(this).serialize() + '&DeliveryType=VIEW',
            dataType: 'json',
            beforeSend() {
                // add a spinner
                $('.DP_AnswerForm .Buttons').append('<span class="DP_Spinner TinyProgress">&nbsp;</span>');
            },
            success({type, html}) {
                switch (type) {
                    case 'Full Poll':
                        // Remove the old results form
                        if ($('.DP_ResultsForm').length !== 0) {
                            $('.DP_ResultsForm').remove();
                        }
                        // Insert the new results
                        $('.DP_AnswerForm').after(html);
                        $('.DP_ResultsForm').hide();

                        // Remove the answer form after some sweet sweet animation
                        $('.DP_AnswerForm').fadeOut('slow', () => {
                            $('.DP_ResultsForm').fadeIn('slow', () => {
                                $('.DP_AnswerForm').remove();
                            });
                        });

                        // update tools
                        $('#DP_Results').slideUp();
                        break;
                    default:
                    case 'Partial Poll':
                        gdn.informMessage(html);
                        break;
                }
            },
            complete() {
                $('.DP_Spinner').remove();
            }
        });
    });

    // hijack the delete click
    $('#DP_Remove a').popup({
        confirm: true,
        confirmText: ConfirmString,
        followConfirm: false,
        afterConfirm(json, sender) {
            // Remove all poll tools and forms
            $('.DP_AnswerForm').slideUp('slow', function() {
                $(this).remove();
            });
            $('.DP_ResultsForm').slideUp('slow', function() {
                $(this).remove();
            });
            $('#DP_Tools').slideUp('slow', function() {
                $(this).remove();
            });
        }
    });
});
