var currentOrder = Orders[0].id;
var currentOrderId = 0;

function getCurrentId () {
	// watch what order is active
	var orderId = document.querySelector('.active .order_id');
	//console.log(order_id.textContent);
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

function liContent(i) {
	// creating list template and content it
	var parent = document.querySelector('.container .left_section_list ul');
	var li = createElem('li', {},
		createElem('div', {class: "left_section_list_elem"},
			createElem('div', {class: "left_section_list_elem_left"},
				createElem("p", {class: 'order_id'}, 'Order ' + Orders[i].id),
				createElem("p", {class: 'customer'}, Orders[i].OrderInfo.customer),
				createElem("p", {class: 'shippedAt'}, 'Shipped: ' + Orders[i].OrderInfo.shippedAt)
			),
			createElem('div', {class: "left_section_list_elem_right"},
				createElem("p", {class: 'createdAt'}, Orders[i].OrderInfo.createdAt),
				createElem("p", {class: 'status'}, Orders[i].OrderInfo.status)
			)
		));
	parent.appendChild(li);
}

function ordersCount(n) {
	// count quantity  of orders
	var head = document.querySelector('.container .left_header_top .orders_quantity');
	head.textContent = str.format('Orders ({0})', [n]);
}

function shippingInfoContent() {
	var i = currentOrderId;
	
	var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
	elemClear(detailInfo);

	var div1 = createElem('div', {class: 'right-align color-gray'},
		createElem('p', {}, 'Name:'),
		createElem('p', {}, 'Street:'),
		createElem('p', {}, 'ZIP code / City:'),
		createElem('p', {}, 'Region:'),
		createElem('p', {}, 'Country:'));
	var div2 = createElem('div', {},
		createElem('p', {class: 'name'}, Orders[i].ShipTo.name),
		createElem('p', {class: 'street'}, Orders[i].ShipTo.Address),
		createElem('p', {class: 'zip'}, Orders[i].ShipTo.ZIP),
		createElem('p', {class: 'region'}, Orders[i].ShipTo.Region),
		createElem('p', {class: 'country'}, Orders[i].ShipTo.Country));
	
	detailInfo.appendChild(div1);
	detailInfo.appendChild(div2);
}

function customerInfoContent() {
	// fill shipping details content
	var i = currentOrderId;
	
	var detailInfo = document.querySelector('.right_bck_section_shipping .detail-info');
	elemClear(detailInfo);

	div1 = createElem('div', {class: 'right-align color-gray'},
		createElem('p', {}, 'FirstName:'),
		createElem('p', {}, 'LastName:'),
		createElem('p', {}, 'Address:'),
		createElem('p', {}, 'Phone:'),
		createElem('p', {}, 'Email:'));
	div2 = createElem('div', {},
		createElem('p', {class: 'name'}, Orders[i].CustomerInfo.firstName),
		createElem('p', {class: 'lastName'}, Orders[i].CustomerInfo.lastName),
		createElem('p', {class: 'address'}, Orders[i].CustomerInfo.address),
		createElem('p', {class: 'phone'}, Orders[i].CustomerInfo.phone),
		createElem('p', {class: 'email'}, Orders[i].CustomerInfo.email));
	
	detailInfo.appendChild(div1);
	detailInfo.appendChild(div2);
}

function countTotalPrice() {
	// currency to eur
	var i = currentOrderId;
	var rates = {
		byn: 2.31,
		rub: 69.71,
		uah: 31.28,
		usd: 1.2
	};
	var sum = 0;
	var prd = Orders[i].products;
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

function detailsContent() {
	// fill order details content
    var count = document.querySelectorAll('.container .left_section_list li').length;
	ordersCount(count);

	var i = currentOrderId;

	var orderId = document.querySelector('.container .right_bck_section_top_left .order_id');
	orderId.textContent = 'Order ' + Orders[i].id;
	var customer = document.querySelector('.container .right_bck_section_top_left .customer');
	customer.textContent = 'Customer: ' + Orders[i].OrderInfo.customer;
	var createdAt = document.querySelector('.container .right_bck_section_top_left .createdAt');
	createdAt.textContent = 'Ordered: ' + Orders[i].OrderInfo.createdAt;
	var shippedAt = document.querySelector('.container .right_bck_section_top_left .shippedAt');
	shippedAt.textContent = 'Shipped: ' + Orders[i].OrderInfo.shippedAt;

	var totPrice = document.querySelector('.container .right_bck_section_top_right .total_price');
	totPrice.textContent = countTotalPrice();

	var lineTools = document.querySelectorAll('.container .right_bck_section_middle .tools');
	if (lineTools[0].className.match('active')) {
		shippingInfoContent();
	}
	else if (lineTools[1].className.match('active')) {
		customerInfoContent();
	}
	
	clearInput('t_input');

	var tbody = document.querySelector('.container .right_bck_section_table tbody');
	elemClear(tbody);
	var prd = Orders[i].products;
	for(var j=0; j < prd.length; j++) {
		var tr = createElem('tr', {class: 'row'},
			createElem('td', {},
				createElem('div', {},
					createElem('strong', {}, prd[j].name)),
				createElem('div', {}, prd[j].id)),
			createElem('td', {class: 'right-align'},
				createElem('strong', {}, prd[j].price),
				createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency)),
			createElem('td', {class: 'right-align'}, prd[j].quantity),
			createElem('td', {class: 'right-align'},
				createElem('strong', {}, prd[j].totalPrice),
				createElem('span', {class: 'color-gray'}, ' ' + prd[j].currency))
			);
		tbody.appendChild(tr);
	}
	var tname = document.querySelector('.container .right_bck_section_table .tname');
	tname.textContent = str.format('Line Items ({0})', [prd.length]);

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
		if (node.firstElementChild.className == 'icons_customer') {
			customerInfoContent();}
	}
}

function liSearch() {
	var input, filter, ul, li, p, count, j, k, head;
	input = document.getElementById('li_input');
	filter = input.value.toLowerCase();
	ul = document.querySelector('.container .left_section_list ul');
	li = ul.getElementsByTagName('li');
	count = 0;
	k = 0;
	head = document.querySelector('.container .left_header_top .orders_quantity');
	
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
    	if (li[k].style.display == "none") 
    		k++;
    	else {
    		//currentOrderId = k;
    		li[k].classList.add('active');
    		getCurrentId();
    		detailsContent();
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
	            tr[i].style.display = "";
	            count++;
	            break;
	        } else {
	            tr[i].style.display = "none";
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
	//debugger;
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

function main() {
	// content list of orders
	for (var i = 0; i < Orders.length; i++){
		liContent(i);
	}
	// make first li active
	var frsLi = document.querySelector('.container .left_section_list li');
	frsLi.classList.add('active');
	// initial right content
	detailsContent();
	listClickHandle();
	toolBarHandle();
	liRefresh()
}

main();
