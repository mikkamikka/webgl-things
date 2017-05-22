/**
 * Created by mika on 22.05.2017.
 */

var js_txt;
var highlight;

function loadJS(file) {
    var content;
    var client = new XMLHttpRequest();
    client.open('GET', file);
    client.onreadystatechange = function() {
        if(client.readyState === 4)
        {
            if(client.status === 200 || client.status == 0)
            {
                js_txt = client.responseText;
                eval(js_txt);
                console.log("highlight.js reloaded");
            }
        }
    }
    client.send(null);
}

function reloadHighlightFile() {

    loadJS("js/highlight.js");

}
reloadHighlightFile();

function getURIbyMeshId( mesh_id ){

    for ( var i = 0; i < highlight.length; i++ ) {
        var groupIds = highlight[i].mesh_id;
        for ( var j = 0; j < groupIds.length; j++ ) {
            if ( mesh_id === groupIds[j] ) return highlight[i].uri;
        }
    }
    return "";
}

function getMeshGroupByMeshId( mesh_id ) {
    for ( var i = 0; i < highlight.length; i++ ) {
        var groupIds = highlight[i].mesh_id;
        for ( var j = 0; j < groupIds.length; j++ ) {
            if ( mesh_id === groupIds[j] ) return groupIds;
        }
    }
    return [];
}