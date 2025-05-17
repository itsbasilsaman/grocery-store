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
         
            const availableCategories = new Set();
        
            // Collect available categories from current products
            products.each(function() {
                const productClasses = $(this).attr('class').split(' ');
                productClasses.forEach(function(className) {
                    if (className.startsWith('product_cat-')) {
                        availableCategories.add(className.replace('product_cat-', ''));
                    }
                });
            });
        
            // Check if category filter widget exists
            const categoryWidgets = $('.category-filter-widget');
            
            if (categoryWidgets.length > 0) {
                // Update category filter visibility
                updateFilterOptionVisibility('.category-filter-widget li', availableCategories);
            }
        }

        // Checkbox change event
        $(".category-filter-widget input[type='checkbox']").on("change", function() {
            applycategoryFilter();
        });

        // category Reset button click event
        $('.category-filter-buttons .reset-button').on('click', function (e) {
            e.preventDefault();
            // Uncheck all checkboxes
            $(".category-filter-widget input[type='checkbox']").prop('checked', false);
            var filterUrl = removeQueryStringParameter(window.location.href, 'category');
            window.location.href = filterUrl;
        });

        // Apply category filter
        function applycategoryFilter() {
            var selectedcategorys = $('input[name="category[]"]:checked').map(function() {
                return encodeURIComponent(this.value);
            }).get();

            // Remove duplicate categorys
            selectedcategorys = [...new Set(selectedcategorys)];

            var filterUrl = updateQueryStringParameter(window.location.href, 'category', selectedcategorys.join(','));

            // Remove category parameter if no categories are selected
            if (selectedcategorys.length === 0) {
                filterUrl = removeQueryStringParameter(filterUrl, 'category');
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
        function initializeCategoryFilters() {
            // Get category parameter from URL
            var urlParams = new URLSearchParams(window.location.search);
            var categoryParam = urlParams.get('category');

            if (categoryParam) {
                // Split and decode the categories
                var selectedCategories = decodeURIComponent(categoryParam).split(',');

                // Check corresponding checkboxes
                $(".category-filter-widget input[type='checkbox']").each(function() {
                    if (selectedCategories.includes(this.value)) {
                        $(this).prop('checked', true);
                    }
                });
            }

            // Update filter visibility after initialization
            updateFilterVisibility();
        }

        // Call initialization function on page load
        initializeCategoryFilters();

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