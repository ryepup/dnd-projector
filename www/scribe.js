scribe = {players:[]};

scribe.standardParty = ["Ryepup", "Ammonia", "Ecthellion", "Tibbar", "Jack"];

scribe.formatTime = function(sec){
    seconds = sec % 60;
    mins = Math.floor((sec % 3600) / 60);
    hours = Math.floor(sec/3600);

    if (seconds < 10) seconds = '0'+seconds;
    if (mins < 10) mins = '0'+mins;

    if(hours > 0){
	return hours + ":" + mins + 'm';
    }else{
	return mins + ':' + seconds + 's';
    }
};

scribe.addPlayerFromForm = function(hostile){
    var frm = $('#addPlayerForm').serializeArray();
    var opts = {
	hostile:hostile
    };

    $.each(frm, function(idx, item){
	       opts[item.name] = item.value;
	   });
    scribe.addPlayer(null, opts);
    //notify
    alert('done!');
};

scribe.addPlayer = function(name, opts){
    var player = {
	name:name,
	damage:0,
	initiative:0,
	dom:$('<li/>'),
	hostile:false
    };

    if (opts){
	$.extend(player, opts);	
    }

    player.dom
	.text(player.name)
	.addClass('arrow')
	.click(function(){
		   $('#playerDetail .toolbar h1').text(player.name);
		   scribe.jqt.goTo('#playerDetail', 'slideleft');
	       });

    scribe.players.push(player);
    $('#playerList').append(player.dom);
    
};

scribe.jqt = $.jQTouch({
			   icon: 'jqtouch.png',
			   statusBar: 'black-translucent',
			   preloadImages: [
			       'themes/jqt/img/chevron_white.png',
			       'themes/jqt/img/bg_row_select.gif',
			       'themes/jqt/img/back_button_clicked.png',
			       'themes/jqt/img/button_clicked.png'
			   ]
		       });

$(function(){
      $('#addAlly').click(function(){ 
			      scribe.addPlayerFromForm(false);
			  });

      $('#addEnemy').click(function(){ 
			      scribe.addPlayerFromForm(true);
			  });
      //load up the standard party
      $.each(scribe.standardParty, function(index, name){
		 scribe.addPlayer(name);
	     });
  });
