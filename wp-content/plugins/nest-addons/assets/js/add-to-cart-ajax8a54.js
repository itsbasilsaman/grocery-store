(function ($) {
    "use strict";
    jQuery(function($) {
        // Simple product ajax add to cart
        $(document).on('click', 'a.ajax_add_to_cart', function(e){
            // Only proceed if it's a simple product
            if (!$(this).hasClass('product_type_simple')) {
                return;
            }

            e.preventDefault();
            var $thisbutton = $(this);
            var formData = new FormData();
            formData.append('add-to-cart', $thisbutton.attr('data-product_id'));
            $( document.body ).trigger('adding_to_cart', [ $thisbutton, formData ]);
            
            $.ajax({
                url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'ace_add_to_cart'),
                data: formData,
                security: nest_cart_action_nonce.nonce,
                type: 'POST',
                processData: false,
                contentType: false,
                complete: function(response) {
                    response = response.responseJSON;
                    if (!response) return;
                    
                    if (response.error && response.product_url) {
                        window.location = response.product_url;
                        return;
                    }
                    
                    if (wc_add_to_cart_params.cart_redirect_after_add === 'yes') {
                        window.location = wc_add_to_cart_params.cart_url;
                        return;
                    }
                    
                    $( document.body ).trigger('added_to_cart', [ response.fragments, response.cart_hash, $thisbutton ]);
                    $(response.fragments.notices_html).appendTo('.cart_notice').delay(200).fadeOut(5000, function(){
                        $(this).remove();
                    });
                    
                    $('.cartnotice_close').on('click', function(){
                        $(this).closest('.woocommerce-message, .woocommerce-error').remove();
                    });
                },
                dataType: 'json'
            });
        });
    });

    // Simple and Variable products add to cart
    jQuery(document).ready(function () {
        $('.product-type-simple form.cart, .product-type-variable form.cart').on('submit', function(e) {
            var $form = $(this);
            var $submitButton = $(document.activeElement);
            
            // Don't interfere with buy now button
            if ($submitButton.hasClass('wpcbn-btn-single')) {
                return true;
            }
            
            e.preventDefault();
            
            var formData = new FormData($form[0]);
            formData.append('add-to-cart', $form.find('[name=add-to-cart]').val());
            
            $.ajax({
                url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'ace_add_to_cart'),
                data: formData,
                security: nest_cart_action_nonce.nonce,
                type: 'POST',
                processData: false,
                contentType: false,
                complete: function(response) {
                    response = response.responseJSON;
                    if (!response) return;
                    
                    if (response.error && response.product_url) {
                        window.location = response.product_url;
                        return;
                    }
                    
                    if (wc_add_to_cart_params.cart_redirect_after_add === 'yes') {
                        window.location = wc_add_to_cart_params.cart_url;
                        return;
                    }
                    
                    var $thisbutton = $form.find('.single_add_to_cart_button:not(.wpcbn-btn-single)');
                    $( document.body ).trigger('added_to_cart', [ response.fragments, response.cart_hash, $thisbutton ]);
                    
                    $('.woocommerce-error, .woocommerce-message, .woocommerce-info').remove();
                    
                    $(response.fragments.notices_html).appendTo('.cart_notice').delay(200).fadeOut(5000);
                    $('.woocommerce-message, .woocommerce-error').each(function() {
                        if (!$(this).find('.cartnotice_close').length) {
                            $(this).append('<div class="cartnotice_close"><i class="fas fa-times"></i></div>');
                        }
                    });
                    
                    $('.cartnotice_close').on('click', function(){
                        $(this).closest('.woocommerce-message, .woocommerce-error').remove();
                    });
                }
            });
        });
    });
}(jQuery));