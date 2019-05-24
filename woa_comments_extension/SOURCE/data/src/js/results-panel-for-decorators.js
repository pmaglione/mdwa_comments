function ContentManager(){}
ContentManager.prototype.createHeader = function(title){

	var nav = document.createElement("nav");
		nav.className = "navbar navbar-inverse navbar-fixed-top";
		nav.setAttribute("role", "navigation");

	var container = document.createElement("div");
		container.className = "container-fluid";

	var header = document.createElement("div");
		header.className = "navbar-header";
		
	var closeBtn = document.createElement("btn");
		closeBtn.setAttribute("type","button");
		closeBtn.className = "navbar-toggle glyphicon glyphicon-remove";
		closeBtn.style["display"] = "block";
		closeBtn.style["position"] = "relative";
		closeBtn.style["float"] = "left";
		closeBtn.style["color"] = "#f1f1f1";
		closeBtn.onclick = function(){ addon.port.emit("closeResultsPanelForDecorator"); }

	var aTitle = document.createElement("a");
		aTitle.innerHTML = title;
		aTitle.setAttribute("href","#");
		aTitle.className = "navbar-brand";

	header.appendChild(closeBtn);
	header.appendChild(aTitle);
	container.appendChild(header);
	nav.appendChild(container);
	document.body.appendChild(nav);
}
ContentManager.prototype.listTweets = function(data, emptyMessage){

	var container = document.createElement("div");
		container.style["padding-top"] = "50px;"

	if(data.length && data.length > 0){
	    for (var i = 0; i < data.length; i++) {

			var tweetPanel = document.createElement('div');
				tweetPanel.className = "panel panel-default";

			var panelBody = document.createElement('div');
				panelBody.className = "panel-body row";
				tweetPanel.appendChild(panelBody);

			var panelIcon = document.createElement('div');
				panelIcon.className = "col-md-1";
				panelBody.appendChild(panelIcon);
			var icon = document.createElement("i");
				icon.className = data[i].icon;
				icon.style["font-size"] = "3em";
				panelIcon.appendChild(icon);

			var panelTweet = document.createElement('div');
				panelTweet.className = "col-md-11";
				panelBody.appendChild(panelTweet);
			var tweetAuthor = document.createElement('a');
				tweetAuthor.innerHTML = data[i].title;
				tweetAuthor.className = "csa-highlighted-element";
				panelTweet.appendChild(tweetAuthor);
			var tweetMessage = document.createElement('div');
				tweetMessage.innerHTML = data[i].message;
				tweetMessage.className = "clearfix";
				panelTweet.appendChild(tweetMessage);
			container.appendChild(tweetPanel);
		}
	}else{ container.appendChild(document.createTextNode(emptyMessage)); }

	document.body.appendChild(container);
}
ContentManager.prototype.listMovies = function(list, emptyMessage){ 

	var container = document.createElement("div");
		container.style["padding-top"] = "50px;";
	document.body.appendChild(container);

	var row = document.createElement("div");
		row.className = "row";
		row.style.display = "flex"; 
		row.style['flex-wrap'] = "wrap";
	container.appendChild(row);

	if(list.length && list.length > 0){
		for (var i = 0; i < list.length; i++) {
			if(list[i].thumbnail){
				row.appendChild(this.createMovie(list[i]));
			}
		}
	}else{ container.appendChild(document.createTextNode(emptyMessage)); }
}
ContentManager.prototype.createMovie = function(data){ 

	var col = document.createElement("div");
		col.className = "col-sm-4";

	var thumbnail = document.createElement("div");
		thumbnail.className = "thumbnail";
		thumbnail.woaLink = data.link;
		/*thumbnail.onclick = function(evt){
			window.open(this.woaLink, '_blank');
			evt.stopPropagation(); evt.preventDefault();
		}*/
		thumbnail.style["min-height"] = "150px";
	col.appendChild(thumbnail); 

	var video = document.createElement("iframe");
	video.width="100%";
	video.height="200";
	video.setAttribute("src", data.link);
	console.log(data.link);
	thumbnail.appendChild(video);

	var caption = document.createElement("div");
		caption.className = "caption";
	thumbnail.appendChild(caption); 

	var title = document.createElement("h5");
		title.innerHTML = data.title;
	caption.appendChild(title); 

	return col;
}


var cm = new ContentManager();
addon.port.on("listTweetsInPanel", function(data){ // list={title,list,emptyMessage}

    document.body.innerHTML = "";
    cm.createHeader(data.title);
    cm.listTweets(data.list, data.emptyMessage);
});
addon.port.on("listVideosInPanel", function(data){ //list = {title, link, thumbnail, icon}

    document.body.innerHTML = "";
    cm.createHeader(data.title);
    cm.listMovies(data.list, data.emptyMessage);
});