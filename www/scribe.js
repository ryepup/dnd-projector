var scribe = {
    init:function(){
	scribe.playerTable = $('tbody');
	var makeOrder = function(query, url){
	    $(query).click(function(){
			       scribe.getPlayers(url);
			   });
	};
	makeOrder('#turn', 'turn.json');
	makeOrder('#sort', 'sort.json');
	makeOrder('#reset', 'reset.json');
	$('#add-hostiles')
	    .click(function(){
		       var name = prompt('Name?');
		       var init = prompt('Initiative bonus?');
		       var n = prompt('How many?', '1');
		       scribe.getPlayers('add-hostiles.json',
					{name:name,
					 init:init,
					 n:n
					});
		   });
	scribe.getPlayers();
    },
    getPlayers:function(jsonUrl, data){
	$.ajax({
		   url:jsonUrl||"players.json", 
		   dataType:"json", 
		   success:scribe.renderPlayers,
		   data:data
	       });
    },
    renderPlayers:function(players){
	var pt = scribe.playerTable;
	pt.empty();
	$(players).each(function(idx, p){
			    pt.append(scribe.makePlayer(p)); 
			});
    },
    makePlayer:function(player){
	var prow = $('<tr>').attr('id', 'p'+player.id);
	var makeCell = function(label){
	    var cell = $('<button>');
	    cell.text(label);
	    prow.append($('<td>').append(cell));
	    return cell;
	};

	var playerEditBtn = function(text, label, param, defaultValue){
	    makeCell(text)
		.click(function(){
			   var value = prompt(label, defaultValue || text);
			   if(value){
			       var data = { id:player.id };
			       data[param] = value;
			       scribe.getPlayers('player.json', 
						 data);
			   }
		       });
	    
	};
	playerEditBtn(player.name, 'New name', 'name');
	playerEditBtn(player.initiative, 'New initiative', 
		      'initiative');
	playerEditBtn(player.damage, 'New damage', 'damage', 1);

	makeCell(player.bloodiedP ? "Bloody" : "OK")
	    .click(function(){
		       scribe.getPlayers('player.json', 
					 {id:player.id,
					  bloodyp:true});
		   });
	makeCell('KILL HIM')
	    .click(function(){
		       scribe.getPlayers('kill.json', 
					 {id:player.id});
		   });

	makeCell('move up')
	    .click(function(){
		       scribe.getPlayers('move-up.json', 
					 {id:player.id});
		   });

	return prow;
    }
};

$(document).ready(function(){
		      scribe.init();
		  });