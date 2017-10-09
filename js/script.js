var currentOrder = null;
var currentOrderId = null;
var Orders;
var apiOrders = 'http://localhost:3000/api/Orders';
var apiCurrentOrder = 'http://localhost:3000/api/Orders/{0}';
var apiOrderProducts = 'http://localhost:3000/api/OrderProducts';
var apiProduct = 'http://localhost:3000/api/Orders/{0}/products';

function getCurrentId () {
	// watch what order is active
	var orderId = document.querySelector('.active .order_id');
	//console.log(orderId.textContent);
	if (!orderId) return null;
	else {
		orderId = orderId.textContent;

		currentOrder = String(orderId.match(/\d+/));

		for ( var i = 0; i < Orders.length; i++) {
			if (Orders[i].id == currentOrder) {
				currentOrderId = i;
				break;
			}
		}
	}
}

function Utils() {
}
Utils.prototype.format = function(content, arr)
{
	// to use string format
   for (var i=0; i < arr.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arr[i]);
   }
   return content;
};

var str = new Utils();

function createElem(name, attributes ) {
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
	for ( var i = 2;i < arguments.length; i++ ) {
		var val = arguments[i];
		if ( typeof val == 'string' ) { val = document.createTextNode( val ) };
		el.appendChild( val );
	}
	return el;
}

function elemClear(elem) {
	// remove element children
	while (elem.firstChild) {
    	elem.removeChild(elem.firstChild);
	}
}

function formatDate(strDate) {
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

}

function liContent(order) {
	// creating list template and content it
	var parent = document.querySelector('.container .left_section_list ul');
	var li = createElem('li', {},
		createElem('div', {class: "left_section_list_elem"},
			createElem('div', {class: "left_section_list_elem_left"},
				createElem("p", {class: 'order_id'}, 'Order ' + order.id),
				createElem("p", {class: 'customer'}, order.summary.customer),
				createElem("p", {class: 'shippedAt'}, 'Shipped: ' + formatDate(order.summary.shippedAt))
			),
			createElem('div', {class: "left_section_list_elem_right"},
				createElem("p", {class: 'createdAt'}, formatDate(order.summary.createdAt)),
				createElem("p", {class: 'status'}, order.summary.status)
			)
		));
	parent.appendChild(li);
}

function ordersCount(n) {
	// count quantity  of orders
	var head = document.querySelector('.container .left_header_top .orders_quantity');
	head.textContent = str.format('Orders ({0})', [n]);
}

function toEditClick() {
    var i = currentOrderId;

    var toolTitle = document.querySelector('.right_bck_section_shipping');
    var editIcon = document.querySelector('.right_bck_section_shipping .icons_edit');
    var saveIcon = document.querySelector('.right_bck_section_shipping .icons_save');
    var cancelIcon = document.querySelector('.right_bck_section_shipping .icons_cancel');
    editIcon.classList.add('hidden');
    saveIcon.classList.remove('hidden');
    cancelIcon.classList.remove('hidden');

    var editableContent = document.querySelector('.right_bck_section_shipping .editable_content');
    for (var j=0; j<editableContent.children.length; j++) {
    editableContent.children[j].classList.add('hidden');}

    var editableForm = document.querySelector('.right_bck_section_shipping .editable_form');
    editableForm.classList.remove('hidden');

    var form = createElem('form', {action: '', id: 'form_edit', method: 'put'},
		createElem('input', {type: 'text', name: 'name', value: Orders[i].shipTo.name}),
        createElem('br', {}),
        createElem('input', {type: 'text', name: 'address', value: Orders[i].shipTo.address}),
        createElem('br', {}),
        createElem('input', {type: 'text', name: 'ZIP', value: Orders[i].shipTo.ZIP}),
        createElem('br', {}),
        createElem('input', {type: 'text', name: 'region', value: Orders[i].shipTo.region}),
        createElem('br', {}),
        createElem('input', {type: 'text', name: 'country', value: Orders[i].shipTo.country}),
        createElem('br', {}));

    editableForm.appendChild(form);
}

function toCancelClick() {
    var editIcon = document.querySelector('.right_bck_section_shipping .icons_edit');
    var saveIcon = document.querySelector('.right_bck_section_shipping .icons_save');
    var cancelIcon = document.querySelector('.right_bck_section_shipping .icons_cancel');
    editIcon.classList.remove('hidden');
    saveIcon.classList.add('hidden');
    cancelIcon.classList.add('hidden');

    var editableForm = document.querySelector('.right_bck_section_shipping .editable_form');
    elemClear(editableForm);
    editableForm.classList.add('hidden');

    var editableContent = document.querySelector('.right_bck_section_shipping .editable_content');
    for (var i=0; i<editableContent.children.length; i++) {
        editableContent.children[i].classList.remove('hidden');}
}

function getFormValues(formInputs) {
    var values = {};

    for (var j=0; j<formInputs.length; j++) {
        input = formInputs[j];
        if (!input.value) input.classList.add('red');
        else {
            input.classList.remove('red');
            if (input.name) values[input.name] = input.value;
        }
    }
    console.log(values);
    return values;
}

function toSaveClick() {
    var i = currentOrderId;
    var formInputs = document.querySelectorAll('.right_bck_section_shipping input');
	var values = getFormValues(formInputs);

    if (Object.keys(values).length === 5) {
		var sendBody = JSON.stringify({shipTo: values});
		var url = str.format(apiCurrentOrder, [currentOrder]);
        sendRequest('PUT', url, sendBody)
            .then(function(result) {
                Orders[i] = result;
                toCancelClick();
                shippingInfoContent();
            })
	}
}

function shippingInfoContent() {
	// ship to
	var i = currentOrderId;
	if (i == null) return;
	var parent = document.querySelector('.right_bck_section_shipping');
	var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
	if (toolTitle) elemClear(toolTitle);

	var content = createElem('div', {class: 'tool_title'},
        createElem('p', {}, 'Shipping address'),
        createElem('span', {class: 'icons_edit', onclick: 'toEditClick()', title: 'Edit'}),
        createElem('span', {class: 'icons_save hidden', onclick: 'toSaveClick()', title: 'Save'}),
    	createElem('span', {class: 'icons_cancel hidden', onclick: 'toCancelClick()', title: 'Cancel'}));
    parent.prepend(content);

	var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
	elemClear(detailInfo);

	var div1 = createElem('div', {class: 'static_content right-align color-gray'},
		createElem('p', {}, 'Name:'),
		createElem('p', {}, 'Street:'),
		createElem('p', {}, 'ZIP code / City:'),
		createElem('p', {}, 'Region:'),
		createElem('p', {}, 'Country:'));
	var div2 = createElem('div', {class: 'editable_content'},
		createElem('p', {class: 'name'}, Orders[i].shipTo.name),
		createElem('p', {class: 'street'}, Orders[i].shipTo.address),
		createElem('p', {class: 'ZIP'}, Orders[i].shipTo.ZIP),
		createElem('p', {class: 'region'}, Orders[i].shipTo.region),
		createElem('p', {class: 'country'}, Orders[i].shipTo.country));
	var div3 = createElem('div', {class: 'editable_form hidden'});
	
	detailInfo.appendChild(div1);
	detailInfo.appendChild(div2);
    detailInfo.appendChild(div3);
}

function customerInfoContent() {
	// fill shipping details content
	var i = currentOrderId;
    if (i == null) return;
    var parent = document.querySelector('.right_bck_section_shipping');
    var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
    if (toolTitle) elemClear(toolTitle);

    var content = createElem('div', {class: 'tool_title'},
        createElem('p', {}, 'Customer Info'));
    parent.prepend(content);

    var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
    elemClear(detailInfo);

	var div1 = createElem('div', {class: 'right-align color-gray'},
		createElem('p', {}, 'FirstName:'),
		createElem('p', {}, 'LastName:'),
		createElem('p', {}, 'Address:'),
		createElem('p', {}, 'Phone:'),
		createElem('p', {}, 'Email:'));
	var div2 = createElem('div', {},
		createElem('p', {class: 'name'}, Orders[i].customerInfo.firstName),
		createElem('p', {class: 'lastName'}, Orders[i].customerInfo.lastName),
		createElem('p', {class: 'address'}, Orders[i].customerInfo.address),
		createElem('p', {class: 'phone'}, Orders[i].customerInfo.phone),
		createElem('p', {class: 'email'}, Orders[i].customerInfo.email));
	
	detailInfo.appendChild(div1);
	detailInfo.appendChild(div2);
}

function getMapContent() {
    var i = currentOrderId;
    if (i == null) return;
    var parent = document.querySelector('.right_bck_section_shipping');
    var toolTitle = document.querySelector('.right_bck_section_shipping .tool_title');
    if (toolTitle) elemClear(toolTitle);

    var content = createElem('div', {class: 'tool_title'},
        createElem('p', {}, 'Shipped To'));
    parent.prepend(content);

    var street = Orders[i].shipTo.address.split(' ').join('+');
    var region = Orders[i].shipTo.region;
    var ref = str.format('https://maps.googleapis.com/maps/api/staticmap?size=300x300&markers={0},{1}&zoom=15', [street, region]);

    var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
    elemClear(detailInfo);
    var img = createElem('img', {src: ref, id: 'map'});
    detailInfo.appendChild(img);

}

function countTotalPrice(prd) {
	// currency to eur
	var rates = {
		byn: 0.43,
		rub: 0.015,
		uah: 0.032,
		usd: 0.84
	};
	var sum = 0;
	for (var j=0; j<prd.length; j++) {
		if (prd[j].currency == 'EUR') sum += +prd[j].totalPrice;
		else {
			sum += rates[prd[j].currency.toLowerCase()] * +prd[j].totalPrice;
		}
	}
	return sum.toFixed(2);
}

function clearInput(elemId){
	var input = document.getElementById(elemId);
	input.value = '';
}

function clearSortArrows() {
	// remove arrows in head table rows
	tr = document.querySelectorAll(".container .right_bck_section_table .triangle");
    for (var j=0; j<tr.length; j++) {
  		tr[j].innerHTML = ' ';
  	}
}

function showModalForm(head) {
    var modal = document.getElementById('myModal');
    var header = document.querySelector('.modal .modal_header p');
    header.textContent = head;

    var span = document.querySelector('.modal .modal_header .close');
    modal.classList.remove('hidden');
    // close form
    span.addEventListener("click", function() {
        modal.classList.add('hidden');
    });
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
}

function submitNewOrder() {
    var modal = document.getElementById('myModal');
    var formInputs = document.querySelectorAll('.modal input');
    var values = {summary: {}, shipTo: {}, customerInfo: {}};
    var count = 0;

    for (var j=0; j<formInputs.length; j++) {
        input = formInputs[j];
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
        var sendBody = JSON.stringify(values);
        sendRequest('POST', apiOrders, sendBody)
            .then(function() {
                modal.classList.add('hidden');
                return sendRequest('GET', apiOrders, null)
            })
            .then(function(result) {
                Orders = result;
                var parent = document.querySelector('.container .left_section_list ul');
                elemClear(parent);
                for (var i = 0; i < Orders.length;  i++) {
                    liContent(Orders[i]);
                }

                currentOrderId = Orders.length-1;
                var li = document.querySelectorAll('.container .left_section_list li');
                li[li.length-1].classList.add('active');
                getCurrentId();
                detailsContent();
            })
    }
}

function toDeleteOrderClick() {
    //var i = currentOrderId;
    var url = str.format(apiCurrentOrder, [currentOrder]);
    sendRequest('DELETE', url, null)
        .then(function() {
            return sendRequest('GET', apiOrders, null);
		})
        .then(function(result) {
            Orders = result;
            var parent = document.querySelector('.container .left_section_list ul');
            elemClear(parent);
            for (var j = 0; j < Orders.length;  j++) {
                liContent(Orders[j]);
            }
            currentOrder = null;
            currentOrderId = null;
            detailsContent();
        });
}

function toAddOrderClick() {
    showModalForm('New Order');
    var modalBody = document.querySelector('.modal .modal_body');
    elemClear(modalBody);
    var form = createElem('form', {action: '', onsubmit: "submitNewOrder(this.name);return false;", id: 'form_', method: 'post'},
        createElem('label', {}, 'Customer:'),
        createElem('input', {type: 'text', name: 'customer', value: 'Witcher'}),
        createElem('br', {}),
        createElem('label', {}, 'Created At:'),
        createElem('input', {type: 'text', name: 'createdAt', value: '05.09.2017'}),
        createElem('br', {}),
        createElem('label', {}, 'Shipped At:'),
        createElem('input', {type: 'text', name: 'shippedAt', value: '10.09.2017'}),
        createElem('br', {}),
        createElem('label', {}, 'Status:'),
        createElem('input', {type: 'text', name: 'status', value: 'In time'}),
        createElem('br', {}),
        createElem('br', {}),
        createElem('p', {}, 'Ship To'),
        createElem('label', {}, 'Name:'),
        createElem('input', {type: 'text', name: 'name', value: 'Jenifer'}),
        createElem('br', {}),
        createElem('label', {}, 'Street:'),
        createElem('input', {type: 'text', name: 'address', value: 'Staravilienski trakt 41'}),
        createElem('br', {}),
        createElem('label', {}, 'ZIP code:'),
        createElem('input', {type: 'text', name: 'ZIP', value: '220053'}),
        createElem('br', {}),
        createElem('label', {}, 'Region:'),
        createElem('input', {type: 'text', name: 'region', value: 'Minsk'}),
        createElem('br', {}),
        createElem('label', {}, 'Country:'),
        createElem('input', {type: 'text', name: 'country', value: 'Belarus'}),
        createElem('br', {}),
        createElem('br', {}),
        createElem('p', {}, 'Customer Info'),
        createElem('label', {}, 'FirstName:'),
        createElem('input', {type: 'text', name: 'firstName', value: 'Geralt'}),
        createElem('br', {}),
        createElem('label', {}, 'LastName:'),
        createElem('input', {type: 'text', name: 'lastName', value: 'Wolf School'}),
        createElem('br', {}),
        createElem('label', {}, 'Address:'),
        createElem('input', {type: 'text', name: 'address', value: 'Rivia'}),
        createElem('br', {}),
        createElem('label', {}, 'Phone:'),
        createElem('input', {type: 'text', name: 'phone', value: '123445'}),
        createElem('br', {}),
        createElem('label', {}, 'Email:'),
        createElem('input', {type: 'text', name: 'email', value: 'kill_monsters@fast.com'}),
        createElem('br', {}),
        createElem('br', {}),
        createElem('input', {type: 'submit', value: 'Add'}));

    modalBody.appendChild(form);
}


function submitNewProduct() {
    var i = currentOrderId;
    var modal = document.getElementById('myModal');
	var formInputs = document.querySelectorAll('.modal input');
    var values = getFormValues(formInputs);
    values['orderId'] = currentOrder;
    if (Object.keys(values).length === 6) {
        var sendBody = JSON.stringify(values);
        sendRequest('POST', apiOrderProducts, sendBody)
            .then(function() {
                modal.classList.add('hidden');
                clearSortArrows();
				return sendRequest('GET', str.format(apiProduct, [currentOrder]), null)
            })
            .then(function(products) {
                productsContent(products);
            })
    }
}

function toAddProductClick() {
    showModalForm('New Product');
    var modalBody = document.querySelector('.modal .modal_body');
    elemClear(modalBody);
    var form = createElem('form', {action: '', onsubmit: "submitNewProduct(this.name);return false;", id: 'form_add_product', method: 'post'},
        createElem('label', {}, 'Product Name:'),
        createElem('input', {type: 'text', name: 'name'}),
        createElem('br', {}),
        createElem('label', {}, 'Unit Price:'),
        createElem('input', {type: 'text', name: 'price'}),
        createElem('br', {}),
        createElem('label', {}, 'Currency:'),
        createElem('input', {type: 'text', name: 'currency'}),
        createElem('br', {}),
        createElem('label', {}, 'Quantity:'),
        createElem('input', {type: 'text', name: 'quantity'}),
        createElem('br', {}),
        createElem('label', {}, 'Total Price:'),
        createElem('input', {type: 'text', name: 'totalPrice'}),
        createElem('br', {}),
		createElem('input', {type: 'submit', value: 'Add'}));

	modalBody.appendChild(form);
}

function deleteProductHandle() {
    var table = document.querySelector('.container .right_bck_section_table tbody');
    var productId;

    table.addEventListener("click", function(event) {
        //var i = currentOrderId;
        var target = event.target;
        while (target != this) {
            if (target.className == 'icons_remove_product') {

                productId = target.parentNode.parentNode.querySelector('.product_id').textContent;
                url = apiOrderProducts + str.format('/{0}', [productId]);
				sendRequest('DELETE', url, null)
                    .then(function() {
                        return sendRequest('GET', str.format(apiProduct, [currentOrder]), null)
                    })
                    .then(function(products) {
                        productsContent(products);
                    });
                return;
            }
            target = target.parentNode;
        }
    });
}

function productsContent(prd) {
    clearInput('t_input');

    var tbody = document.querySelector('.container .right_bck_section_table tbody');
    elemClear(tbody);
    for(var j=0; j < prd.length; j++) {
        var tr = createElem('tr', {class: 'row'},
            createElem('td', {},
                createElem('div', {},
                    createElem('strong', {}, prd[j].name)),
                createElem('div', {class: 'product_id'}, String(prd[j].id))),
            createElem('td', {class: 'right-align'},
                createElem('strong', {}, String(prd[j].price)),
                createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency)),
            createElem('td', {class: 'right-align'}, String(prd[j].quantity)),
            createElem('td', {class: 'right-align'},
                createElem('strong', {}, String(prd[j].totalPrice)),
                createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency)),
            createElem('td', {class: 'remove_cell'},
                createElem('div', {class: 'icons_remove_product', title: 'Remove Product'}))
        );
        tbody.appendChild(tr);
    }
    var tname = document.querySelector('.container .right_bck_section_table .tname');
    tname.textContent = str.format('Line Items ({0})', [prd.length]);

    var totPrice = document.querySelector('.container .right_bck_section_top_right .total_price');
    totPrice.textContent = countTotalPrice(prd);
}

function detailsContent() {
	// fill order details content

    var count = document.querySelectorAll('.container .left_section_list li').length;
	ordersCount(count);

	var i = currentOrderId;

    var orderDetail = document.querySelector('.right_bck_section_top');
    elemClear(orderDetail);

	if (i == null) {
        var img = createElem('div', {class: 'notFoundImg'});
            //createElem('span', {class: 'notFoundImg'}));
        orderDetail.appendChild(img);
        var shippingDetail = document.querySelector('.right_bck_section_shipping .detail-info');
        elemClear(shippingDetail);
        var tname = document.querySelector('.container .right_bck_section_table .tname');
        tname.textContent = 'Line Items (0)';
        var tbody = document.querySelector('.container .right_bck_section_table tbody');
        elemClear(tbody);
		return;
	}

	var div1 = createElem('div', {class: 'right_bck_section_top_left'},
		createElem('p', {class: 'order_id'}, 'Order ' + Orders[i].id),
        createElem('p', {class: 'customer'}, 'Customer: ' + Orders[i].summary.customer),
        createElem('p', {class: 'createdAt'}, 'Ordered: ' + formatDate(Orders[i].summary.createdAt)),
        createElem('p', {class: 'shippedAt'}, 'Shipped: ' + formatDate(Orders[i].summary.shippedAt)));
    var div2 = createElem('div', {class: 'right_bck_section_top_right'},
        createElem('p', {class: 'total_price'}, '0.00'),
        createElem('p', {}, 'EUR'));
    orderDetail.appendChild(div1);
    orderDetail.appendChild(div2);

	var lineTools = document.querySelectorAll('.container .right_bck_section_middle .tools');
	if (lineTools[0].className.match('active')) {
		shippingInfoContent();
	}
    else if (lineTools[1].className.match('active')) {
        getMapContent();
    }
	else if (lineTools[2].className.match('active')) {
		customerInfoContent();
	}

    sendRequest('GET', str.format(apiProduct, [currentOrder]), null)
        .then(function(products) {
            productsContent(products);
        })
}

function listClickHandle() {
    var ul = document.querySelector('.container .left_section_list ul');
    var li = ul.getElementsByTagName('li');
    var selectedLi;

    ul.addEventListener("click", function(event) {
        var target = event.target;
        while (target != this) {
            if (target.tagName == 'LI') {
                for (i = 0; i < li.length; i++) {
                    li[i].classList.remove('active');}
                makeActiveLi(target);
                getCurrentId();
                //console.log('click', currentOrderId+1);
                detailsContent();
                clearSortArrows();
                return;
            }
            target = target.parentNode;
        }
    });
    function makeActiveLi(node) {
        if (selectedLi) {
            selectedLi.classList.remove('active');
        }
        selectedLi = node;
        selectedLi.classList.add('active');
    }
}

function toolBarHandle () {
	var toolBar = document.querySelector('.container .right_bck_section_middle');
	var selectedLine;

	toolBar.addEventListener("click", function(event) {
		var target = event.target;
		while (target != this) {
			if (target.className == 'tools') {
				var lineTool = document.querySelector('.container .right_bck_section_middle .tools');
				lineTool.classList.remove('active');
				makeActiveLine(target);
				changeDetailInfo(target);
				return;
			}
			target = target.parentNode;
		}
	});
	function makeActiveLine(node) {
		if (selectedLine) {
	    selectedLine.classList.remove('active');
	  	}
	  	selectedLine = node;
	  	selectedLine.classList.add('active');
	}
	function changeDetailInfo(node) {
		if (node.firstElementChild.className == 'icons_car') {
			shippingInfoContent();}
        if (node.firstElementChild.className == 'icons_map') {
            getMapContent();}
		if (node.firstElementChild.className == 'icons_customer') {
			customerInfoContent();}
	}
}

function liSearch() {
	var input, filter, ul, li, p, count, j, k;
	input = document.getElementById('li_input');
	filter = input.value.toLowerCase();
	ul = document.querySelector('.container .left_section_list ul');
	li = ul.getElementsByTagName('li');
	count = 0;
	k = 0;
	
	// Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        p = li[i].getElementsByTagName("p");
        li[i].classList.remove('active');
        for (j = 0; j < p.length; j++) {
	        if (p[j].innerHTML.toLowerCase().indexOf(filter) > -1) {
	            li[i].classList.remove('hidden');
	            count++;
	            break;
	        } else {
	            li[i].classList.add('hidden');
	        } 
        }    
    }
    if (count == 0) {
        ordersCount(count);
	}
    // make first visible element of the list visible
    while (count>0 && k<li.length){
    	if (li[k].className == "hidden")
    		k++;
    	else {
    		//currentOrderId = k;
    		li[k].classList.add('active');
    		getCurrentId(Orders);
    		detailsContent(Orders);
            ordersCount(count);
    		break;
    	}
    }    
}

function tableSearch() {
	var input, filter, tbody, tr, td, tname, count, j;
	input = document.getElementById('t_input');
	filter = input.value.toLowerCase();
	tbody = document.querySelector('.container .right_bck_section_table tbody');
	tr = tbody.getElementsByTagName('tr');
	tname = document.querySelector('.container .right_bck_section_table .tname');
	count = 0;
	// Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
    	td = tr[i].getElementsByTagName("td");
    	for (j = 0; j < td.length; j++) {
	        if (td[j].textContent.toLowerCase().indexOf(filter) > -1) {
	            tr[i].classList.remove('hidden');
	            count++;
	            break;
	        } else {
	            tr[i].classList.add('hidden');
	        }
	    }
    }
    tname.textContent = str.format('Line Items ({0})', [count]);
}

function liRefresh() {
	var btn = document.getElementById('li_refresh');
	var li = document.querySelectorAll('.container .left_section_list li');
	btn.onclick = function() {
		clearInput('li_input');
		for (i = 0; i < li.length; i++) {
            li[i].classList.remove('hidden');
			li[i].classList.remove('active');
		}
		li[0].classList.add('active');
		getCurrentId();
    	detailsContent();
	}
}

function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, tr, dir, switchcount = 0;
  table = document.getElementById("product_table");
  clearSortArrows();
  tr = document.querySelectorAll(".container .right_bck_section_table .triangle")[n];
  
  switching = true;
  dir = "asc";
  while (switching) {
    switching = false;
    rows = table.getElementsByTagName("TR");
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if(n == 0) {
	      if (dir == "asc") {
	        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
	          shouldSwitch= true;
	          break;
	        }
	      } else if (dir == "desc") {
	        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
	          shouldSwitch= true;
	          break;
	        }
	      }
	  	}
	  	else if (n == 2) {
            x = +x.innerHTML;
            y = +y.innerHTML;
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
	  	else{
            x = +x.firstChild.innerHTML;
            y = +y.firstChild.innerHTML;
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
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
      tr.innerHTML = ' &#9650;';
      if (dir == "desc") {
      	tr.innerHTML = ' &#9660;';
      }
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function sendRequest(method, url, body) {
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
}



function main() {
    sendRequest('GET', apiOrders, null)
        .then(function(result) {
            console.log('parse ', result);
			Orders = result;
            for (var i = 0; i < Orders.length;  i++) {
                liContent(Orders[i]);
            }
            // make first li active
            currentOrderId = 0;
            var frsLi = document.querySelector('.container .left_section_list li');
            frsLi.classList.add('active');
            getCurrentId();

            detailsContent();
            listClickHandle();
            toolBarHandle();
            liRefresh();
            deleteProductHandle();

        })
        .catch(function(error) {
            if (error != null) {
                console.log("Failed to fetch api URL: " + error);
            }
        });

}

main();
