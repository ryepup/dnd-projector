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
    return false;
};

scribe.editPlayer = function(player){
    $('#editPlayer h1').text(player.name);
    $('#initiative2').value(player.initiative);
    if(player.bloodied){
	$('#bloodied').value(true);
    }
};

scribe.playerLi = function(player){
    var li = $('<li/>');
    var a = $('<a href="#editPlayer"/>')
	.text(player.name)
	.click(function(){
		   scribe.editPlayer(player);
	       });
    li.append(a);
    
    if(player.hostile){
	li.addClass('hostile');
    }
    return li;  
};

scribe.addPlayer = function(name, opts){
    var player = {
	name:name,
	damage:0,
	initiative:0,
	bloodied:false,
	hostile:false
    };

    if (opts){
	$.extend(player, opts);	
    }    

    scribe.players.push(player);

    $('.player-list').detach();
    var pl = $('<ul/>').addClass('player-list');
    $.each(scribe.players, function(idx, item){
	       pl.append(scribe.playerLi(item));
	   });
    pl.listview();
    
    $('#playerList').append(pl);
};

scribe.turn = function(){
    var li = $('.player-list li:first').detach();
    $('.player-list').append(li);
};

$(function(){
      $('#turn').click(scribe.turn);
      $('#addAlly').click(function(){ 
			      return scribe.addPlayerFromForm(false);
			  });

      $('#addEnemy').click(function(){ 
			      return scribe.addPlayerFromForm(true);
			  });
      //load up the standard party
      $.each(scribe.standardParty, function(index, name){
		 scribe.addPlayer(name);
	     });

  });
