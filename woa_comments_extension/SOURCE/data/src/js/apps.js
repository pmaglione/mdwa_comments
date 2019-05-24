function simulateWebAugmentation(){
	var news = document.getElementsByClassName('elementList'); //document.getElementsByClassName('tdest2 left');

	for (var i = 0; i < news.length; i++) {
		news[i].style.position = 'relative';

		var controls = document.createElement("div");
	        controls.className = "property-item-cog";
	    var cog = document.createElement("button");
	        cog.className = "woa-augmenter-icon";
	        controls.appendChild(cog);
	        cog.onclick = function(evt){
	        	try{
		        	var popup = document.createElement("div");
				    	popup.className = "popup";
				    	popup.style.width = "285px";
				    	popup.style.height = "56px";

					var list = document.createElement('div');
						list.className = "list";

					var item01 = document.createElement('div');
						item01.className = 'list-item';
					var span01 = document.createElement('span');
						span01.innerHTML = "Show description from Amazon";
						item01.appendChild(span01);

					var item02 = document.createElement('div');
						item02.className = 'list-item';
					var span02 = document.createElement('span');
						span02.innerHTML = "See what people say on Twitter";
						item02.appendChild(span02);

						list.appendChild(item01);
						list.appendChild(item02);

					    popup.appendChild(list);
					    this.parentElement.appendChild(popup);
				}catch(err){console.log(err)}
	        }

		news[i].appendChild(controls);
	};
}
simulateWebAugmentation();