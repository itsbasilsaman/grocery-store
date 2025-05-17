(function($) {
    $(document).ready(function() {
        // Function to update filter option visibility
        function updateFilterOptionVisibility(selector, availableValues) {
            $(selector).each(function() {
                const checkbox = $(this).find('input[type="checkbox"]');
                const value = checkbox.val();
                
                // Hide/show and disable/enable based on availability
                if (availableValues.has(value)) {
                    $(this).removeClass('disabled-filter');
                    checkbox.prop('disabled', false);
                } else {
                    $(this).addClass('disabled-filter');
                    checkbox.prop('disabled', true);
                    checkbox.prop('checked', false);
                }
            });
        }

        // Function to update filter visibility
        function updateFilterVisibility() {
            // Get all current products
            const products = $('.products .product');
         
            const availableBrands = new Set();
        
            // Collect available brands from current products
            products.each(function() {
                const productClasses = $(this).attr('class').split(' ');
                productClasses.forEach(function(className) {
                    if (className.startsWith('product_brand-')) {
                        availableBrands.add(className.replace('product_brand-', ''));
                    }
                });
            });
        
            // Check if brand filter widget exists
            const brandWidgets = $('.brand-filter-widget');
            
            if (brandWidgets.length > 0) {
                // Update brand filter visibility
                updateFilterOptionVisibility('.brand-filter-widget li', availableBrands);
            }
        }

        // Checkbox change event
        $(".brand-filter-widget input[type='checkbox']").on("change", function() {
            applyBrandFilter();
        });

        // Brand Reset button click event
        $('.brand-filter-buttons .reset-button').on('click', function (e) {
            e.preventDefault();
            // Uncheck all checkboxes
            $(".brand-filter-widget input[type='checkbox']").prop('checked', false);
            var filterUrl = removeQueryStringParameter(window.location.href, 'brand');
            window.location.href = filterUrl;
        });

        // Apply brand filter
        function applyBrandFilter() {
            var selectedBrands = $('input[name="brand[]"]:checked').map(function() {
                return encodeURIComponent(this.value);
            }).get();

            // Remove duplicate brands
            selectedBrands = [...new Set(selectedBrands)];

            var filterUrl = updateQueryStringParameter(window.location.href, 'brand', selectedBrands.join(','));

            // Remove previous brand selection
            if (selectedBrands.length === 0) {
                filterUrl = removeQueryStringParameter(filterUrl, 'brand');
            }

            window.location.href = filterUrl;
        }

        // Helper function to update query string parameter
        function updateQueryStringParameter(url, key, value) {
            var baseUrl = url.split('?')[0];
            var urlParameters = url.split('?')[1];

            if (urlParameters) {
                var urlParams = new URLSearchParams(urlParameters);
                urlParams.set(key, value);
                return baseUrl + '?' + urlParams.toString();
            } else {
                return baseUrl + '?' + key + '=' + value;
            }
        }

        // Helper function to remove query string parameter
        function removeQueryStringParameter(url, key) {
            var urlParts = url.split('?');
            if (urlParts.length >= 2) {
                var prefix = encodeURIComponent(key) + '=';
                var params = urlParts[1].split(/[&;]/g);
                var updatedParams = [];

                for (var i = 0; i < params.length; i++) {
                    var param = params[i];
                    var paramParts = param.split('=');
                    var paramName = decodeURIComponent(paramParts[0]);

                    if (paramName === key) {
                        continue;
                    }

                    updatedParams.push(param);
                }

                url = urlParts[0] + (updatedParams.length > 0 ? '?' + updatedParams.join('&') : '');
            }
            return url;
        }

        // On page load, check checkboxes based on URL parameters
        function initializeBrandFilters() {
            // Get brand parameter from URL
            var urlParams = new URLSearchParams(window.location.search);
            var brandParam = urlParams.get('brand');

            if (brandParam) {
                // Split and decode the brands
                var selectedBrands = decodeURIComponent(brandParam).split(',');

                // Check corresponding checkboxes
                $(".brand-filter-widget input[type='checkbox']").each(function() {
                    if (selectedBrands.includes(this.value)) {
                        $(this).prop('checked', true);
                    }
                });
            }

            // Update filter visibility after initialization
            updateFilterVisibility();
        }

        // Call initialization function on page load
        initializeBrandFilters();

        // Re-run filter visibility on product filter or sorting changes
        $(document).on('filter_products_done', function() {
            updateFilterVisibility();
        });

        // Optional: Add a MutationObserver to handle dynamic content changes
        const productContainer = document.querySelector('.products');
        if (productContainer) {
            const observer = new MutationObserver(function(mutations) {
                updateFilterVisibility();
            });

            observer.observe(productContainer, {
                childList: true,
                subtree: true
            });
        }
    });
})(jQuery);