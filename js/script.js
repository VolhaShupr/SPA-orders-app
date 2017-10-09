/**
 * Utils class to use string format
 * @constructor
 */
function Utils() {
}

/**
 * Method Converts the value of objects to strings based on the formats specified and inserts them into another string.
 * @param {string} content initial string
 * @param {Array} arr list of values
 * @example Utils.format("someValue is {0} and anotherValue is {1}", [someValue, anotherValue])
 * @returns {string} formatted string
 */
Utils.prototype.format = function(content, arr) {
    for (var i=0; i < arr.length; i++) {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arr[i]);
    }
    return content;
};
var str = new Utils();

/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 * @constructor
 */
function Model() {
    /**
     * Order's id in JSON
     * @type {Number}
     */
    this.currentOrder = null;

    /**
     * Order's serial number in list of Orders
     * @type {Number}
     */
    this.currentOrderId = null;

    /**
     * list of orders data
     * @type {Object}
     */
    this.orders = null;

    /**
     * Number of orders
     * @type {number}
     */
    this.ordersCount = null;

    /**
     * Number of products
     * @type {number}
     */
    this.productsCount = null;

    /**
     * Current order products.
     * @type {Object}
     * @private
     */
    var _products = null;

    /**
     * Filtered order products.
     * @type {Object}
     * @private
     */
    var _filteredProducts = null;

    /**
     * URL for getting or posting orders data from service.
     * @type {string}
     * @private
     */
    var _apiOrders = 'http://localhost:3000/api/Orders';

    /**
     * URL for getting details of current order from service.
     * @type {string}
     * @private
     */
    var _apiCurrentOrder = 'http://localhost:3000/api/Orders/{0}';

    /**
     * URL for posting product to current order from service.
     * @type {string}
     * @private
     */
    var _apiOrderProducts = 'http://localhost:3000/api/OrderProducts';

    /**
     * URL for getting products of current order from service.
     * @type {string}
     * @private
     */
    var _apiProduct = 'http://localhost:3000/api/Orders/{0}/products';

    /**
     * Fetch the all orders.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.fetchAllOrders = function() {
        return this
            .sendRequest('GET', _apiOrders, null)
            .then(function(ordersData) {
                this.currentOrderId = 0;
                this.currentOrder = ordersData[0].id;
                this.orders = ordersData;
                this.ordersCount = ordersData.length;
                return ordersData;
            })
            .catch(function(error) {
                if (error != null) {
                    console.log("Failed to fetch api URL: " + error);
                }
            });
    };

    /**
     * Fetch products of current order.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.fetchOrderProducts = function() {
        //console.log(str.format(_apiProduct, [currentOrder]));
        return this
            .sendRequest('GET', str.format(_apiProduct, [currentOrder]), null)
            .then(function(prod) {
                _products = prod;
                this.productsCount = prod.length;
                return prod;
            })
    };

    /**
     * Modify shipping info.
     * @param {string} sendBody new sipping address.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.editShippingAddress = function(sendBody) {
        var url = str.format(_apiCurrentOrder, [currentOrder]);
        return this
            .sendRequest('PUT', url, sendBody)
            .then(function (result) {
                //console.log(currentOrderId);
                this.orders[currentOrderId] = result;
            });
    };

    /**
     * Post new product.
     * @param {string} sendBody new product.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.postNewProduct = function(sendBody) {
        return this
            .sendRequest('POST', _apiOrderProducts, sendBody);
    };

    /**
     * Delete product
     * @param {string} productId the product Id.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.deleteProduct = function(productId) {
        var url = _apiOrderProducts + str.format('/{0}', [productId]);
        return this
            .sendRequest('DELETE', url, null);
    };

    /**
     * Post new order.
     * @param {string) sendBody new order.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.postNewOrder = function(sendBody) {
        return this
            .sendRequest('POST', _apiOrders, sendBody);
    };

    /**
     * Delete current order.
     * @returns {Promise} the promise object will be resolved once the Order object gets loaded.
     * @public
     */
    this.deleteOrder = function() {
        var url = str.format(_apiCurrentOrder, [currentOrder]);
        return this
            .sendRequest('DELETE', url, null);
    };

    /**
     * Common method which "promisifies" the XHR calls.
     * @param {string} method methods of query to server.
     * @param {string} url the URL address to fetch.
     * @param {string} body body of query to server, can take null value.
     * @return {Promise} the promise object will be resolved once XHR gets loaded/failed.
     * @public
     */
    this.sendRequest = function(method, url, body) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open(method, url, true);
            req.setRequestHeader("Content-type", "application/json", "charset=utf-8");
            req.addEventListener("load", function () {
                if (req.status < 400) {
                    resolve(JSON.parse(req.responseText));
                } else {
                    reject(new Error("Request failed: " + req.statusText));
                }
            });

            req.addEventListener("error", function () {
                reject(new Error("Network error"));
            });
            req.send(body);
        });
    };

    /**
     * Count total price of all products of current order.
     * @returns {string} total price.
     * @public
     */
    this.countTotalPrice = function() {
        // other currency to eur
        if (!_products) return;
        var baseCurrency = 'eur';
        var rates = {
            byn: 0.43,
            rub: 0.015,
            uah: 0.032,
            usd: 0.84
        };
        var sum = 0;
        for (var j=0; j<_products.length; j++) {
            if (_products[j].currency.toLowerCase() === baseCurrency) sum += +_products[j].totalPrice;
            else {
                sum += rates[_products[j].currency.toLowerCase()] * +_products[j].totalPrice;
            }
        }
        return sum.toFixed(2);
    };

    /**
     * Implement search feature in product table with user input.
     * @param {string} filter string of user input.
     * @returns {Object} filter list of filtered products and its length.
     * @public
     */
    this.searchProducts = function(filter) {
        //if (!_products) return;
        var n = 0;
        var filtered = [];
        _products.forEach(function(product) {
            for (var key in product) {
                if ((key !== 'orderId') && (product[key].toString().toLowerCase().indexOf(filter) > -1)) {
                    filtered.push(product);
                    n++;
                    break;
                }
            }
        });
        _filteredProducts = filtered;
        return {filteredProducts: filtered, count: n};
    };

    /**
     * Swap two elements in array.
     * @param {number} a index of the first element.
     * @param {number} b index of the second element.
     * @param {Array} arr list of elements.
     * @returns {Array} arr array with changed elements.
     * @private
     */
    this._exchangeTwoElements = function(a, b, arr) {
        if (arr[a] && arr[b]) {
            var c = arr[a];
            arr[a] = arr[b];
            arr[b] = c
        }
        return arr;
    };

    /**
     * Implement sorting of product table.
     * @param {number} n index of column to sort
     * @returns {Object} products list of sorted products and its length.
     * @public
     */
    this.sortProducts = function(n) {
        var that = this;
        var products, dir, fields, field, switching, shouldSwitch, switchcount = 0, x, y, i;
        if (_filteredProducts) {products = _filteredProducts;}
        else {products = _products;}

        dir = 'asc';
        fields = {0: 'name',
                    1: 'price',
                    2: 'quantity',
                    3: 'totalPrice'};
        field = fields[n];
        switching = true;

        while (switching) {
            switching = false;
            for (i=0; i<products.length-1; i++) {
                shouldSwitch = false;
                x = products[i][field];
                y = products[i+1][field];
                if (n == 0) {
                    if (dir == 'asc') {
                        if (x.toLowerCase() > y.toLowerCase()) {
                            shouldSwitch= true;
                            break;
                        }
                    } else if (dir == "desc") {
                        if (x.toLowerCase() < y.toLowerCase()) {
                            shouldSwitch= true;
                            break;
                        }
                    }
                } else {
                    x = +x;
                    y = +y;
                    if (dir == "asc") {
                        if (x > y) {
                            shouldSwitch= true;
                            break;
                        }
                    } else if (dir == "desc") {
                        if (x < y) {
                            shouldSwitch= true;
                            break;
                        }
                    }
                }
            }
            if (shouldSwitch) {
                that._exchangeTwoElements(i, i+1, products);
                switching = true;
                switchcount ++;
            } else {
                if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }

        return {sorted: products, direction: dir};
    };


    /**
     * Implement search feature in orders list with user input.
     * @param {string} filter string of user input.
     * @returns {Object} filtered list of filtered orders  and its length.
     * @public
     */
    this.searchOrders = function(filter) {
        var n = 0;
        var filtered = [];
        orders.forEach(function(order) {
            if (order['id'].toString().toLowerCase().indexOf(filter) > -1) {
                filtered.push(order);
                n++;
            } else {
                for (var key in order['summary']) {
                    if ((key !== 'currency') && (key !== 'totalPrice') && (order['summary'][key].toString().toLowerCase().indexOf(filter) > -1)) {
                        filtered.push(order);
                        n++;
                        break;
                    }
                }
            }
        });

        if (!n) {
            this.currentOrderId = null;
            this.currentOrder=null;
        } else {
            for (var i = 0; i < orders.length; i++) {
                if (orders[i]['id'] === filtered[0]['id']) {
                    this.currentOrderId = i;
                    this.currentOrder = filtered[0]['id'];
                }
            }
        }

        return {filteredOrders: filtered, count: n};
    };

    /**
     * Push object state to history.
     * @param {boolean} isActive whether bookmark is active
     * @public
     */
    this.setOrderState = function(isActive) {
        var state = {};
        if (isActive) {
            state['currOrder'] = currentOrder;
        } else {
            state = null;
        }
        history.pushState(state, "");
    };

    /**
     * Get bookmarked order in history state.
     * @returns {number} index of current order.
     * @public
     */
    this.getOrderState = function() {
        var that = this;
        var currentState = history.state;
        if (!currentState) {
            return 0;
        }
        this.currentOrder = currentState['currOrder'];
        var isOrder = false;
        orders.forEach(function(order, i) {
            if (order['id'] == that.currentOrder) {
                that.currentOrderId = i;
                isOrder = true;
            }
        });
        if (isOrder) {
            return this.currentOrderId;
        } else {
            this.currentOrder = null;
            this.currentOrderId = null;
            return this.currentOrderId;

        }
    };

}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
function View() {
    /**
     * Create DOM elements.
     * @param {string} name the name of HTML tag.
     * @param attributes names of attributes as class, id etc. and text content(optional).
     * @returns {HTMLElementt} the DOM element.
     * @public
     */
    this.createElem = function(name, attributes ) {
        // for creating dom fragments
        var el = document.createElement( name );
        if ( typeof attributes == 'object' ) {
            for ( var i in attributes ) {
                el.setAttribute( i, attributes[i] );

                if ( i.toLowerCase() == 'class' ) {
                    el.className = attributes[i]; // for IE compatibility

                } else if ( i.toLowerCase() == 'style' ) {
                    el.style.cssText = attributes[i]; // for IE compatibility
                }
            }
        }
        for ( var j = 2;j < arguments.length; j++ ) {
            var val = arguments[j];
            if ( typeof val == 'string' ) { val = document.createTextNode( val ) }
            el.appendChild( val );
        }
        return el;
    };

    /**
     * Remove children nodes of DOM elements.
     * @param {HTMLElement} elem DOM element.
     * @returns {View} self object.
     * @public
     */
    this.clearElement = function(elem) {
        // remove element children
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        return this;
    };

    /**
     * Format date string from ISO to date string as dd.mm.yy.
     * @param {string} strDate date string
     * @returns {string} date string in "dd.mm.yy" format.
     * @public
     */
    this.formatDate = function (strDate) {
        if (strDate.length > 10) {
            var d = new Date(strDate);
            var dd = d.getDate();
            if (dd < 10) dd = '0' + dd;

            var mm = d.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;
            var yy = d.getFullYear();
            strDate = dd + '.' + mm + '.' + yy;
        }
        return strDate;
    };

    /**
     * Display quantity of orders.
     * @param {number} n quantity of orders.
     * @returns {View} self object.
     * @public
     */
    this.displayOrdersCount = function(n) {
        n = n || 0;
        var head = document.querySelector('.container .left_header_top .orders_quantity');
        head.textContent = str.format('Orders ({0})', [n]);
        return this;
    };

    /**
     * Clear form input.
     * @param {string} elemId the value of HTML element's id.
     * @returns {View} self object.
     * @public
     */
    this.clearInput = function(elemId){
        var input = document.getElementById(elemId);
        input.value = '';
        return this;
    };

    /**
     * Remove arrows in header row of products table which indicate about sorting of the column.
     * @returns {View} self object.
     * @public
     */
    this.clearSortArrows = function() {
        var tr = document.querySelectorAll(".container .right_bck_section_table .triangle");
        for (var j=0; j<tr.length; j++) {
            tr[j].innerHTML = ' ';
        }
        return this;
    };

    /**
     * Get current order id and serial number.
     * @param {Array} orders
     * @returns {object} object of current order id and serial number and their values.
     * @public
     */
    this.getCurrentId = function(orders) {
        // watch what order is active
        var result = {};
        var orderId = document.querySelector('.active .order_id');
        if (!orderId) return null;
        else {
            orderId = orderId.textContent;

            var currentOrder = String(orderId.match(/\d+/));
            result['currentOrder'] = currentOrder;

            for ( var i = 0; i < orders.length; i++) {
                if (orders[i].id == currentOrder) {
                    result['currentOrderId'] = i;
                    break;
                }
            }
        }
        return result;
    };

    /**
     * Add to current order element css class 'active'.
     * @param {number} currentOrderId serial number of current order.
     * @returns {View} self object.
     * @public
     */
    this.makeOrderActive = function(currentOrderId) {
        var li = document.querySelectorAll('.container .left_section_list li');
        for (var i = 0; i < li.length; i++) {
            if (i === currentOrderId) {
                li[i].classList.add('active');
            } else{
                li[i].classList.remove('active');
            }
        }
        return this;
    };

    /**
     * Fill shipping address content.
     * @param {object} order the current order date.
     * @returns {View} self object.
     */
    this.fillShippingInfo = function(order) {
        // ship to
        if (order == null) return;
        var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
        toolTitle.firstElementChild.textContent = 'Shipping address';
        var editButton = this.getEditButton();
        editButton.classList.remove('hidden');

        var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
        this.clearElement(detailInfo);

        var div1 = this.createElem('div', {class: 'static_content right-align color-gray'},
            this.createElem('p', {}, 'Name:'),
            this.createElem('p', {}, 'Street:'),
            this.createElem('p', {}, 'ZIP code / City:'),
            this.createElem('p', {}, 'Region:'),
            this.createElem('p', {}, 'Country:'));
        var div2 = this.createElem('div', {class: 'editable_content'},
            this.createElem('p', {class: 'name'}, order.shipTo.name),
            this.createElem('p', {class: 'street'}, order.shipTo.address),
            this.createElem('p', {class: 'ZIP'}, order.shipTo.ZIP),
            this.createElem('p', {class: 'region'}, order.shipTo.region),
            this.createElem('p', {class: 'country'}, order.shipTo.country));
        var div3 = this.createElem('div', {class: 'editable_form hidden'});

        detailInfo.appendChild(div1);
        detailInfo.appendChild(div2);
        detailInfo.appendChild(div3);
        return this;
    };

    /**
     * Get map and display it.
     * @param {object} order the current order date.
     * @returns {View} self object.
     */
    this.fillMapTab = function(order) {
        if (order == null) return;
        var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
        toolTitle.firstElementChild.textContent = 'Shipped To';
        var editIcon = this.getEditButton();
        var saveIcon = this.getSaveButton();
        var cancelIcon = this.getCancelButton();
        editIcon.classList.add('hidden');
        saveIcon.classList.add('hidden');
        cancelIcon.classList.add('hidden');

        var street = order.shipTo.address.split(' ').join('+');
        var region = order.shipTo.region;
        // mykey= AIzaSyAnS2JNj0Z09lPPqaptwot6A0TZIGGrtps&
        // key=AIzaSyDf5vt3tOVDp7DBnZtoHp1sKN1Zum0m_84&
        var ref = str.format('https://maps.googleapis.com/maps/api/staticmap?key= AIzaSyAnS2JNj0Z09lPPqaptwot6A0TZIGGrtps&size=300x300&markers={0},{1}&zoom=15', [street, region]);

        var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
        this.clearElement(detailInfo);
        var img = this.createElem('img', {src: ref, id: 'map'});
        detailInfo.appendChild(img);
        return this;
    };

    /**
     * Fill customer info content.
     * @param {object} order the current order date.
     * @returns {View} self object.
     */
    this.fillCustomerInfo = function(order) {
        // fill shipping details content
        if (order == null) return;
        var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
        toolTitle.firstElementChild.textContent = 'Customer Info';
        var editIcon = this.getEditButton();
        var saveIcon = this.getSaveButton();
        var cancelIcon = this.getCancelButton();
        editIcon.classList.add('hidden');
        saveIcon.classList.add('hidden');
        cancelIcon.classList.add('hidden');

        var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
        this.clearElement(detailInfo);

        var div1 = this.createElem('div', {class: 'right-align color-gray'},
            this.createElem('p', {}, 'FirstName:'),
            this.createElem('p', {}, 'LastName:'),
            this.createElem('p', {}, 'Address:'),
            this.createElem('p', {}, 'Phone:'),
            this.createElem('p', {}, 'Email:'));
        var div2 = this.createElem('div', {},
            this.createElem('p', {class: 'name'}, order.customerInfo.firstName),
            this.createElem('p', {class: 'lastName'}, order.customerInfo.lastName),
            this.createElem('p', {class: 'address'}, order.customerInfo.address),
            this.createElem('p', {class: 'phone'}, order.customerInfo.phone),
            this.createElem('p', {class: 'email'}, order.customerInfo.email));

        detailInfo.appendChild(div1);
        detailInfo.appendChild(div2);
        return this;
    };

    /**
     * Display not found image.
     * @returns {View} self object.
     */
    this.fillNotFoundImg = function() {
        var orderDetail = document.querySelector('.right_bck_section_top');
        this.clearElement(orderDetail);
        var img = this.createElem('div', {class: 'notFoundImg'});
        orderDetail.appendChild(img);
        var shippingDetail = document.querySelector('.right_bck_section_shipping .detail-info');
        this.clearElement(shippingDetail);
        var tname = document.querySelector('.container .right_bck_section_table .tname');
        tname.textContent = 'Line Items (0)';
        var tbody = document.querySelector('.container .right_bck_section_table tbody');
        this.clearElement(tbody);
        return this;
    };

    /**
     * Fill list of orders.
     * @param {Array} ordersData list of orders
     * @param {number} count number of orders
     * @param {boolean} clearFilter clear or not filter input
     * @return {View} self object.
     */
    this.fillOrdersList = function(ordersData, count, clearFilter) {
        // creating list template and content it
        var parent = document.querySelector('.container .left_section_list ul');
        this.clearElement(parent);
        if (clearFilter) {
            this.clearInput('li_input');
        }

        for (var i = 0; i < ordersData.length;  i++) {
            var order = ordersData[i];
            var li = this.createElem('li', {},
                this.createElem('div', {class: "left_section_list_elem"},
                    this.createElem('div', {class: "left_section_list_elem_left"},
                        this.createElem("p", {class: 'order_id'}, 'Order ' + order.id),
                        this.createElem("p", {class: 'customer'}, order.summary.customer),
                        this.createElem("p", {class: 'shippedAt'}, 'Shipped: ' + this.formatDate(order.summary.shippedAt))
                    ),
                    this.createElem('div', {class: "left_section_list_elem_right"},
                        this.createElem("p", {class: 'createdAt'}, this.formatDate(order.summary.createdAt)),
                        this.createElem("p", {class: 'status'}, order.summary.status)
                    )
                ));
            parent.appendChild(li);
        }

        //var count = document.querySelectorAll('.container .left_section_list li').length;
        this.displayOrdersCount(count);

        return this;
    };

    /**
     * Fill current order details.
     * @param {object} order the current order data.
     * @returns {View} self object.
     */
    this.fillOrderDetails = function(order) {
        var orderDetail = document.querySelector('.right_bck_section_top');
        this.clearElement(orderDetail);

        if (order == null) {
            this.fillNotFoundImg();
            console.log(this);
            return this;
        }

        var div1 = this.createElem('div', {class: 'right_bck_section_top_left'},
            this.createElem('p', {class: 'order_id'}, 'Order ' + order.id),
            this.createElem('p', {class: 'customer'}, 'Customer: ' + order.summary.customer),
            this.createElem('p', {class: 'createdAt'}, 'Ordered: ' + this.formatDate(order.summary.createdAt)),
            this.createElem('p', {class: 'shippedAt'}, 'Shipped: ' + this.formatDate(order.summary.shippedAt)));
        var div2 = this.createElem('div', {class: 'right_bck_section_top_right'},
            this.createElem('p', {class: 'total_price'}, '0.00'),
            this.createElem('p', {}, 'EUR'));
        orderDetail.appendChild(div1);
        orderDetail.appendChild(div2);

        var lineTools = document.querySelectorAll('.container .right_bck_section_middle .tools');
        if (lineTools[0].className.match('active')) {
            this.fillShippingInfo(order);
        }
        else if (lineTools[1].className.match('active')) {
            this.fillMapTab(order);
        }
        else if (lineTools[2].className.match('active')) {
            this.fillCustomerInfo(order);
        }
        return this;
    };

    /**
     * Fill current order products table.
     * @param {Array} prd list of products.
     * @param {string} totalPrice all products total price.
     * @param {number} count number of products.
     * @param {boolean} clearSearchInput clear or not filter input.
     * @returns {View} self object.
     */
    this.fillProductsTable = function(prd, totalPrice, count, clearSearchInput) {
        if (!prd) return;
        if (clearSearchInput) {
            this.clearInput('t_input');
        }

        var tbody = document.querySelector('.container .right_bck_section_table tbody');
        this.clearElement(tbody);
        for(var j=0; j < prd.length; j++) {
            var tr = this.createElem('tr', {class: 'row'},
                this.createElem('td', {},
                    this.createElem('div', {},
                        this.createElem('strong', {}, prd[j].name)),
                    this.createElem('div', {class: 'product_id'}, String(prd[j].id))),
                this.createElem('td', {class: 'right-align'},
                    this.createElem('strong', {}, String(prd[j].price)),
                    this.createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency)),
                this.createElem('td', {class: 'right-align'}, String(prd[j].quantity)),
                this.createElem('td', {class: 'right-align'},
                    this.createElem('strong', {}, String(prd[j].totalPrice)),
                    this.createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency)),
                this.createElem('td', {class: 'remove_cell'},
                    this.createElem('div', {class: 'icons_remove_product', title: 'Remove Product'}))
            );
            tbody.appendChild(tr);
        }
        var tname = document.querySelector('.container .right_bck_section_table .tname');
        tname.textContent = str.format('Line Items ({0})', [count]);

        var totPrice = document.querySelector('.container .right_bck_section_top_right .total_price');
        totPrice.textContent = totalPrice;
        return this;
    };

    /**
     * Returns the order search input.
     * @returns {HTMLElement} the input element.
     * @public
     */
    this.getOrderSearchInput = function() {
        return document.querySelector('#li_input');
    };

    /**
     * Returns the order refresh button.
     * @returns {HTMLElement} the input element.
     * @public
     */
    this.getOrderRefreshButton = function() {
        return document.querySelector('#li_refresh');
    };

    /**
     * Returns the product search input.
     * @returns {HTMLElement} the input element.
     * @public
     */
    this.getProductSearchInput = function() {
        return document.querySelector('#t_input');
    };

    /**
     * Returns the header of product table.
     * @returns {HTMLElement} the tr element.
     * @public
     */
    this.getProductTableHeader = function() {
        return document.querySelector('.container .right_bck_section_table .thead');
    };

    /**
     * Returns the orders list.
     * @returns {HTMLElement} the ul element.
     * @public
     */
    this.getOrdersList = function() {
        return document.querySelector('.container .left_section_list ul');
    };

    /**
     * Returns the tool bar.
     * @returns {HTMLElement} the div element.
     * @public
     */
    this.getToolBar = function() {
        return document.querySelector('.container .right_bck_section_middle');
    };

    /**
     * Returns the edit button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getEditButton = function() {
        return document.querySelector('.right_bck_section_shipping .icons_edit');
    };

    /**
     * Returns the save button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getSaveButton = function() {
        return document.querySelector('.right_bck_section_shipping .icons_save');
    };

    /**
     * Returns the cancel button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getCancelButton = function() {
        return document.querySelector('.right_bck_section_shipping .icons_cancel');
    };


    /**
     * Returns the add product button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getAddProductButton = function() {
        return document.querySelector('#add_product');
    };

    /**
     * Returns the modal window.
     * @returns {HTMLElement} the div element.
     * @public
     */
    this.getModalWindow = function() {
       return document.getElementById('myModal');
    };


    /**
     * Returns the close modal button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getCloseModalButton = function() {
        return document.querySelector('.modal .modal_header .close');
    };

    /**
     * Returns the new product dialog form.
     * @returns {HTMLElement} the button element.
     * @public
     */
    this.getNewProductForm = function() {
        return document.querySelector('#submit_product_form');
    };

    /**
     * Returns the table body element.
     * @returns {HTMLElement} the tbody element.
     * @public
     */
    this.getProductTableBody = function() {
        return document.querySelector('.container .right_bck_section_table tbody');
    };

    /**
     * Returns the add order button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getAddOrderButton = function() {
        return document.querySelector('#add_order');
    };

    /**
     * Returns the  new order dialog form.
     * @returns {HTMLElement} the button element.
     * @public
     */
    this.getNewOrderForm = function() {
        return document.querySelector('#submit_order_form');
    };

    /**
     * Returns the delete order button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getDeleteOrderButton = function() {
        return document.querySelector('#delete_order');
    };

    /**
     * Returns the bookmark order button.
     * @returns {HTMLElement} the span element.
     * @public
     */
    this.getBookmarkOrderButton = function() {
        return document.querySelector('#bookmark');
    };

    /**
     * Add to element css class 'hidden'.
     * @param {HTMLElement} elem HTML element.
     * @return {View} self object.
     * @public
     */
    this.makeElementHidden = function(elem) {
        elem.classList.add('hidden');
        return this;
    };

    /**
     * Return index of pressed column header to sorting products.
     * @param {HTMLElement} target chosen element.
     * @returns {number} n index of column to sorting.
     * @public
     */
    this.getSortedColumnNumber = function(target) {
        var th = document.querySelectorAll(".container .right_bck_section_table thead th");
        for (var k = 0; k<th.length; k++) {
            if (th[k].textContent === target.textContent) {
                return k;
            }
        }
    };

    /**
     * Show sort arrows.
     * @param {string} dir direction of sorting
     * @param {number} n index of column to sorting
     * @returns {View} self object.
     * @public
     */
    this.showSortArrows = function(dir, n) {
        this.clearSortArrows();
        var tr = document.querySelectorAll(".container .right_bck_section_table .triangle")[n];
        if (dir === 'asc') {
            tr.innerHTML = ' &#9650;';
        } else if (dir === 'desc') {
            tr.innerHTML = ' &#9660;';
        }
        return this;
    };

    /**
     * Set order current when it was clicked.
     * @param {HTMLElement} target chosen element.
     * @returns {View} self object.
     * @public
     */
    this.makeClickedOrderActive = function(target) {
        var li = document.querySelectorAll('.container .left_section_list li');
        var selectedLi;

        while (target != this) {
            if (target.tagName == 'LI') {
                for (var i = 0; i < li.length; i++) {
                    li[i].classList.remove('active');}
                makeActiveLi(target);
                this.clearSortArrows();
                return;
            }
            target = target.parentNode;
        }

        function makeActiveLi(node) {
            if (selectedLi) {
                selectedLi.classList.remove('active');
            }
            selectedLi = node;
            selectedLi.classList.add('active');
        }
        return this;
    };

    /**
     * Switch between toolBar tabs.
     * @param {object} order the current order date.
     * @param {HTMLElement} target chosen element.
     * @returns {View} self object.
     * @public
     */
    this.displayActiveTab = function(target, order) {
        var that = this;
        var lineTool = document.querySelectorAll('.container .right_bck_section_middle .tools');
        var selectedLine;

        while (target != this && target !== null) {
            if (target.className == 'tools') {
                for (var i = 0; i < lineTool.length; i++) {
                    lineTool[i].classList.remove('active');}
                makeActiveLine(target);
                changeDetailInfo(target);
                return;
            }
            target = target.parentNode;
        }

        function makeActiveLine(node) {
            if (selectedLine) {
                selectedLine.classList.remove('active');
            }
            selectedLine = node;
            selectedLine.classList.add('active');
        }
        function changeDetailInfo(node) {
            if (node.firstElementChild.className == 'icons_car') {
                that.fillShippingInfo(order);
            }
            if (node.firstElementChild.className == 'icons_map') {
                that.fillMapTab(order);}
            if (node.firstElementChild.className == 'icons_customer') {
                that.fillCustomerInfo(order);}
        }
        return this;
    };

    /**
     * Get values from input in ShipTo form.
     * @param {HTMLElement} formInputs the input elements.
     * @returns {object} values from input.
     * @public
     */
    this.getShipFormValues = function(formInputs) {
        var values = {};

        for (var j=0; j<formInputs.length; j++) {
            var input = formInputs[j];
            if (!input.value) input.classList.add('red');
            else {
                input.classList.remove('red');
                if (input.name) values[input.name] = input.value;
            }
        }
        return values;
    };

    /**
     * Create input form when edit button was clicked.
     * @param {object} order the current order.
     * @returns {View} self object.
     * @public
     */
    this.displayShipEditForm = function(order) {
        var editIcon = this.getEditButton();
        var saveIcon = this.getSaveButton();
        var cancelIcon = this.getCancelButton();
        editIcon.classList.add('hidden');
        saveIcon.classList.remove('hidden');
        cancelIcon.classList.remove('hidden');

        var editableContent = document.querySelector('.right_bck_section_shipping .editable_content');
        for (var j=0; j<editableContent.children.length; j++) {
            editableContent.children[j].classList.add('hidden');}

        var editableForm = document.querySelector('.right_bck_section_shipping .editable_form');
        editableForm.classList.remove('hidden');

        var form = this.createElem('form', {action: '', id: 'form_edit', method: 'put'},
            this.createElem('input', {type: 'text', name: 'name', value: order.shipTo.name}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'text', name: 'address', value: order.shipTo.address}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'text', name: 'ZIP', value: order.shipTo.ZIP}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'text', name: 'region', value: order.shipTo.region}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'text', name: 'country', value: order.shipTo.country}),
            this.createElem('br', {}));

        editableForm.appendChild(form);
        return this;
    };

    /**
     * Cancel input shipping form.
     * @returns {View} self object.
     * @public
     */
    this.hideShipEditForm = function() {
        var editIcon = document.querySelector('.right_bck_section_shipping .icons_edit');
        var saveIcon = document.querySelector('.right_bck_section_shipping .icons_save');
        var cancelIcon = document.querySelector('.right_bck_section_shipping .icons_cancel');
        editIcon.classList.remove('hidden');
        saveIcon.classList.add('hidden');
        cancelIcon.classList.add('hidden');

        var editableForm = document.querySelector('.right_bck_section_shipping .editable_form');
        this.clearElement(editableForm);
        editableForm.classList.add('hidden');

        var editableContent = document.querySelector('.right_bck_section_shipping .editable_content');
        for (var i=0; i<editableContent.children.length; i++) {
            editableContent.children[i].classList.remove('hidden');}
        return this;
    };

    /**
     * Get values of shipping input form.
     * @returns {object} JSON object.
     * @public
     */
    this.getShippingInputValues = function() {
        var formInputs = document.querySelectorAll('.right_bck_section_shipping input');
        var values = this.getShipFormValues(formInputs);
        if (Object.keys(values).length === 5) {
            return JSON.stringify({shipTo: values});
        }
    };

    /**
     * Show modal window.
     * @param {string} head the header of modal box.
     * @returns {View} self object.
     * @public
     */
    this.showModalForm = function(head) {
        var modal = this.getModalWindow();
        var header = document.querySelector('.modal .modal_header p');
        header.textContent = head;
        modal.classList.remove('hidden');
        return this;
    };

    /**
     * Fill form in modal window for adding new product.
     * @returns {View} self object.
     * @public
     */
    this.renderNewProductForm = function() {
        this.showModalForm('New Product');
        var modalBody = document.querySelector('.modal .modal_body');
        this.clearElement(modalBody);
        var form = this.createElem('form', {action: '', id: "submit_product_form",
                onsubmit: "return false;", method: 'post'},
            this.createElem('label', {}, 'Product Name:'),
            this.createElem('input', {type: 'text', name: 'name'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Unit Price:'),
            this.createElem('input', {type: 'text', name: 'price'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Currency:'),
            this.createElem('input', {type: 'text', name: 'currency'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Quantity:'),
            this.createElem('input', {type: 'text', name: 'quantity'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Total Price:'),
            this.createElem('input', {type: 'text', name: 'totalPrice'}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'submit', value: 'Add', id: 'submit_product_button'}));

        modalBody.appendChild(form);
        return this;
    };

    /**
     * Get values from input in NewProduct form.
     * @param {HTMLElement} formInputs the input elements.
     * @returns {object} values from input.
     * @public
     */
    this.getNewProductFormValues = function(formInputs) {
        var values = {};
        var needNumberFields=['price', 'quantity', 'totalPrice'];
        for (var j=0; j<formInputs.length; j++) {
            var input = formInputs[j];
            if ((!input.value) || (needNumberFields.indexOf(input.name) !== -1 && isNaN(input.value))) {
                input.classList.add('red');
            }
            else {
                input.classList.remove('red');
                if (input.name) values[input.name] = input.value;
            }
        }
        return values;
    };

    /**
     * Get values from input form of new product adding.
     * @returns {object} JSON object.
     * @public
     */
    this.getProductInputValues = function() {
        var modal = this.getModalWindow();
        var formInputs = document.querySelectorAll('.modal input');
        var values = this.getNewProductFormValues(formInputs);

        if (Object.keys(values).length === 5) {

            if (isNaN(values['price']) || isNaN(values['quantity']) || isNaN(values['totalPrice'])) {
                console.log('gghj');
            }
            values['orderId'] = currentOrder;
            return JSON.stringify(values);
        }
    };

    /**
     * Fill form in modal for adding new order.
     * @returns {View} self object.
     * @public
     */
    this.renderNewOrderForm  = function() {
        this.showModalForm('New Order');
        var modalBody = document.querySelector('.modal .modal_body');
        this.clearElement(modalBody);
        var form = this.createElem('form', {action: '', onsubmit: "return false;", id: 'submit_order_form', method: 'post'},
            this.createElem('label', {}, 'Customer:'),
            this.createElem('input', {type: 'text', name: 'customer', value: 'Witcher'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Created At:'),
            this.createElem('input', {type: 'text', name: 'createdAt', value: '05.09.2017'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Shipped At:'),
            this.createElem('input', {type: 'text', name: 'shippedAt', value: '10.09.2017'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Status:'),
            this.createElem('input', {type: 'text', name: 'status', value: 'In time'}),
            this.createElem('br', {}),
            this.createElem('br', {}),
            this.createElem('p', {}, 'Ship To'),
            this.createElem('label', {}, 'Name:'),
            this.createElem('input', {type: 'text', name: 'name', value: 'Jenifer'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Street:'),
            this.createElem('input', {type: 'text', name: 'address', value: 'Staravilienski trakt 41'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'ZIP code:'),
            this.createElem('input', {type: 'text', name: 'ZIP', value: '220053'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Region:'),
            this.createElem('input', {type: 'text', name: 'region', value: 'Minsk'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Country:'),
            this.createElem('input', {type: 'text', name: 'country', value: 'Belarus'}),
            this.createElem('br', {}),
            this.createElem('br', {}),
            this.createElem('p', {}, 'Customer Info'),
            this.createElem('label', {}, 'FirstName:'),
            this.createElem('input', {type: 'text', name: 'firstName', value: 'Geralt'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'LastName:'),
            this.createElem('input', {type: 'text', name: 'lastName', value: 'Wolf School'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Address:'),
            this.createElem('input', {type: 'text', name: 'address', value: 'Rivia'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Phone:'),
            this.createElem('input', {type: 'text', name: 'phone', value: '123445'}),
            this.createElem('br', {}),
            this.createElem('label', {}, 'Email:'),
            this.createElem('input', {type: 'text', name: 'email', value: 'kill_monsters@fast.com'}),
            this.createElem('br', {}),
            this.createElem('br', {}),
            this.createElem('input', {type: 'submit', value: 'Add', id: 'submit_order_button'}));

        modalBody.appendChild(form);
        return this;
    };

    /**
     * Get values from input form of new order adding.
     * @returns {object} JSON object.
     * @public
     */
    this.getOrderInputValues = function() {
        var modal = document.getElementById('myModal');
        var formInputs = document.querySelectorAll('.modal input');
        var values = {summary: {}, shipTo: {}, customerInfo: {}};
        var count = 0;

        for (var j=0; j<formInputs.length; j++) {
            var input = formInputs[j];
            if (!input.value) input.classList.add('red');
            else {
                input.classList.remove('red');
                if (input.name) {
                    if (j>=0 && j<4) {
                        values.summary[input.name] = input.value;
                        count +=1;
                    } else if (j>=4 && j<9) {
                        values.shipTo[input.name] = input.value;
                        count +=1;
                    } else {
                        values.customerInfo[input.name] = input.value;
                        count +=1;
                    }
                }
            }
        }
        if (count === 14) {
            return JSON.stringify(values);
        }
    };

    /**
     * Display active bookmark button.
     * @returns {boolean} isActive whether bookmark button is active.
     */
    this.makeBookmarkButtonActive = function() {
        var bookmark = this.getBookmarkOrderButton();
        var isActive = false;
        if (bookmark.className === 'icons_bookmark') {
            bookmark.classList.remove('icons_bookmark');
            bookmark.classList.add('icons_bookmark_active');
            isActive = true;
        } else {
            bookmark.classList.remove('icons_bookmark_active');
            bookmark.classList.add('icons_bookmark');
        }
        return isActive;
    };

    /**
     * Make bookmark buttons not active.
     * @param {number} idBookmarkOrder id of bookmarked order.
     * @param {number} idCurrentOrder id of current order.
     * @returns {View} self object.
     */
    this.removeBookmarkButtonActive = function(idBookmarkOrder, idCurrentOrder) {
        var bookmark = this.getBookmarkOrderButton();
        if (idBookmarkOrder === idCurrentOrder) {
            bookmark.classList.remove('icons_bookmark');
            bookmark.classList.add('icons_bookmark_active');
        } else{
            bookmark.classList.remove('icons_bookmark_active');
            bookmark.classList.add('icons_bookmark');
        }
        return this;
    };


}

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 * @param {View} view view instance.
 * @param {Model} model model instance.
 * @constructor
 */
function Controller(view, model) {
    var that = this;
    currentOrderId = model.currentOrderId;
    currentOrder = model.currentOrder;
    orders = model.orders;
    ordersCount = model.ordersCount;
    productsCount = model.productsCount;
    var totalPrice = null;
    var bookmarkedOrder = null;

    /**
     * Initialize controller.
     * @public
     */
    this.init = function() {
        this._onLoadPage();
        var orderSearchInput = view.getOrderSearchInput();
        var orderRefreshButton = view.getOrderRefreshButton();
        var productSearchInput = view.getProductSearchInput();
        var productTableHeader = view.getProductTableHeader();
        var ordersList = view.getOrdersList();
        var toolBar = view.getToolBar();
        var editButton = view.getEditButton();
        var saveButton = view.getSaveButton();
        var cancelButton = view.getCancelButton();
        var addProductButton = view.getAddProductButton();
        var closeModalButton = view.getCloseModalButton();
        var productTableBody = view.getProductTableBody();
        var addOrderButton = view.getAddOrderButton();
        var deleteOrderButton = view.getDeleteOrderButton();
        var bookmarkOrderButton = view.getBookmarkOrderButton();

        orderSearchInput.addEventListener("keyup", this._onSearchOrderKeyup);
        orderRefreshButton.addEventListener("click", this._onRefreshOrderClick);
        productSearchInput.addEventListener("keyup", this._onSearchProductKeyup);
        productTableHeader.addEventListener("click", this._onSortProductClick);
        ordersList.addEventListener("click", this._onOrderClick);
        toolBar.addEventListener("click", this._onToolBarClick);
        editButton.addEventListener("click", this._onEditButtonClick);
        saveButton.addEventListener("click", this._onSaveShipButtonClick);
        cancelButton.addEventListener("click", this._onCancelButtonClick);
        addProductButton.addEventListener("click", this._onAddProductButtonClick);
        closeModalButton.addEventListener("click", this._onCloseModalButtonClick);
        window.addEventListener("click", this._onCloseModalSpaceClick);
        productTableBody.addEventListener("click", this._onRemoveProductButtonClick);
        addOrderButton.addEventListener("click", this._onAddOrderButtonClick);
        deleteOrderButton.addEventListener("click", this._onDeleteOrderButtonClick);
        bookmarkOrderButton.addEventListener("click", this._onBookmarkOrderButtonClick);
    };

    /**
     * Get and display date on load page.
     * @private
     */
    this._onLoadPage = function() {
        model.fetchAllOrders()
            .then (function (ordersData) {
                view.fillOrdersList(ordersData, ordersCount, true);
                currentOrderId = model.getOrderState();
                currentOrder = model.currentOrder;
                bookmarkedOrder = currentOrder;
                if (currentOrder === null) {

                    view.fillOrdersList(ordersData, ordersCount, true);
                    that._updateOrderDetails(ordersData);
                    return;
                }
                if (currentOrderId > 0) {
                    view.makeBookmarkButtonActive();
                }
                view.makeOrderActive(currentOrderId);
                view.fillOrderDetails(ordersData[currentOrderId]);

                return model.fetchOrderProducts()
            })
            .then(function(products) {
                totalPrice = model.countTotalPrice();
                view.fillProductsTable(products, totalPrice, productsCount, true);
            })
    };

    /**
     *
     * @param {object} orders the current order date.
     * @private
     */
    this._updateOrderDetails = function(orders) {
        var res = view.getCurrentId(orders);
        if (res) {
            currentOrder = res['currentOrder'];
            currentOrderId = res['currentOrderId'];
        } else {
            currentOrder = null;
            currentOrderId = null;
            view.fillNotFoundImg();
        }
        if (currentOrder !== null) {
            view.fillOrderDetails(orders[currentOrderId]);
            model.fetchOrderProducts()
                .then(function (products) {
                    totalPrice = model.countTotalPrice();
                    view.fillProductsTable(products, totalPrice, productsCount, true);
                })
        }
    };

    /**
     * Input from keyboard for orders searching event handler.
     * @listens keyup
     * @private
     */
    this._onSearchOrderKeyup = function() {
        var filter = view.getOrderSearchInput().value.toLowerCase();
        var result = model.searchOrders(filter);
        view.fillOrdersList(result['filteredOrders'], result['count'], false);
        view.makeOrderActive(0);
        that._updateOrderDetails(result['filteredOrders']);
    };

    /**
     * Refresh list of orders button click event handler.
     * @listens click
     * @private
     */
    this._onRefreshOrderClick = function() {
        that._onLoadPage();
        view.clearSortArrows();
    };

    /**
     * Input from keyboard for orders searching event handler.
     * @listens keyup
     * @private
     */
    this._onSearchProductKeyup = function() {
        var filter = view.getProductSearchInput().value.toLowerCase();
        var result = model.searchProducts(filter);
        view.fillProductsTable(result['filteredProducts'], totalPrice, result['count'], false);
    };

    /**
     * Header of products table click event handler.
     * @listens click
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onSortProductClick = function(e) {
        var target = e.target;
        var n = view.getSortedColumnNumber(target);
        var result = model.sortProducts(n);
        view.fillProductsTable(result['sorted'], totalPrice, productsCount, false);
        view.showSortArrows(result['direction'], n);
    };

    /**
     * Header of products table click event handler.
     * @listens click
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onOrderClick = function(e) {
        var target = e.target;
        view.makeClickedOrderActive(target);
        that._updateOrderDetails(orders);
        view.removeBookmarkButtonActive(bookmarkedOrder, currentOrder);
    };

    /**
     * Tool bar buttons click event handler.
     * @listens click
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onToolBarClick = function(e) {
        var target = e.target;
        view.displayActiveTab(target, orders[currentOrderId]);
    };

    /**
     * Edit shipping address button click event handler.
     * @listens click
     * @private
     */
    this._onEditButtonClick = function() {
        view.displayShipEditForm(orders[currentOrderId]);
    };

    /**
     * Save shipping address button click event handler.
     * @listens click
     * @private
     */
    this._onSaveShipButtonClick = function() {
        var sendBody = view.getShippingInputValues();
        if (sendBody) {
            model.editShippingAddress(sendBody)
                .then(function () {
                    view.hideShipEditForm();
                    view.fillShippingInfo(orders[currentOrderId]);
                })
        }
    };

    /**
     * Cancel shipping address changes button click event handler.
     * @listens click
     * @private
     */
    this._onCancelButtonClick = function() {
        view.hideShipEditForm();
    };

    /**
     * Add new product button click event handler.
     * @listens click
     * @private
     */
    this._onAddProductButtonClick = function() {
        view.renderNewProductForm();
        var newProductForm = view.getNewProductForm();
        newProductForm.addEventListener("click", that._onSubmitProductButtonClick);
        newProductForm.addEventListener("keyup", that._onProductInputTabPress);
    };

    /**
     * TAB press event handler.
     * @listens keyup TAB
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onProductInputTabPress = function(e) {
        if (e.keyCode == 9) {
            view.getProductInputValues();
        }
    };

    /**
     * Close modal window button click event handler.
     * @listens click
     * @private
     */
    this._onCloseModalButtonClick = function() {
        var modal = view.getModalWindow();
        view.makeElementHidden(modal);
    };

    /**
     * Space around modal window click event handler.
     * @listens click
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onCloseModalSpaceClick = function(e) {
        var modal = view.getModalWindow();
        if (e.target == modal) {
        view.makeElementHidden(modal);}
    };

    /**
     * Submit new product button click event handler.
     * @listens click
     * @private
     */
    this._onSubmitProductButtonClick = function() {
        var modal = view.getModalWindow();
        var sendBody = view.getProductInputValues();
        if (sendBody) {
            model.postNewProduct(sendBody)
                .then(function () {
                    view.makeElementHidden(modal);
                    view.clearSortArrows();
                    return model.fetchOrderProducts()
                })
                .then(function (products) {
                    totalPrice = model.countTotalPrice();
                    view.fillProductsTable(products, totalPrice, productsCount, true);
                })
        }
    };

    /**
     * Remove product button click event handler.
     * @listens click
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onRemoveProductButtonClick = function(e) {
        var table = view.getProductTableBody();
        var target = e.target;
        var productId;
        while (target != table) {
            if (target.className == 'icons_remove_product') {
                productId = target.parentNode.parentNode.querySelector('.product_id').textContent;
                model.deleteProduct(productId)
                    .then(function() {
                        return model.fetchOrderProducts()
                    })
                    .then(function (products) {
                        totalPrice = model.countTotalPrice();
                        view.fillProductsTable(products, totalPrice, productsCount, true);
                    });
                return;
            }
            target = target.parentNode;
        }
    };

    /**
     * Add new order button click event handler.
     * @listens click
     * @private
     */
    this._onAddOrderButtonClick = function() {
        view.renderNewOrderForm();
        var newOrderForm = view.getNewOrderForm();
        newOrderForm.addEventListener("click", that._onSubmitOrderButtonClick);
        newOrderForm.addEventListener("keyup", that._onOrderInputTabPress);
    };

    /**
     * TAB press event handler.
     * @listens keyup TAB
     * @param {Event} e the DOM event object.
     * @private
     */
    this._onOrderInputTabPress = function(e) {
        if (e.keyCode == 9) {
            view.getOrderInputValues();
        }
    };

    /**
     * Submit new order button click event handler.
     * @listens click
     * @private
     */
    this._onSubmitOrderButtonClick = function() {
        var modal = view.getModalWindow();
        var sendBody = view.getOrderInputValues();
        if (sendBody) {
            model.postNewOrder(sendBody)
                .then(function () {
                    view.makeElementHidden(modal);
                    return model.fetchAllOrders()
                })
                .then(function () {
                    that._onLoadPage();
                })
        }
    };

    /**
     * Delete current order button click event handler.
     * @listens click
     * @private
     */
    this._onDeleteOrderButtonClick = function() {
        model.deleteOrder()
            .then(function () {
                return model.fetchAllOrders()
            })
            .then(function (result) {
                view.fillOrdersList(result, ordersCount, true);
                that._updateOrderDetails(result);
                view.removeBookmarkButtonActive(bookmarkedOrder, currentOrder);
            })
    };

    /**
     * Bookmark button click event handler.
     * @private
     */
    this._onBookmarkOrderButtonClick = function() {
        bookmarkedOrder = currentOrder;
        var isActive = view.makeBookmarkButtonActive();
        model.setOrderState(isActive);
    };

}

(new Controller(new View, new Model)).init();