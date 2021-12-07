//JAVASCRIPT FILE 

//TEST
function myFunction() {
  document.getElementById("demo").innerHTML = "test";
}

function search(){
  searchTxt = document.getElementById("searchTxt").value;
  location.href = "./results_cheese.html" ;
 
}

//Affichage de la liste des fromages (inspiré du code moodle)
function showAll(){
	
	var contenu_requete = `select ?n,?i where{
		?f a dbo:Cheese.
		?f dbp:name ?n.
		?f dbo:thumbnail ?i.
	}`;

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            afficherResultats(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Affichage des résultats dans un tableau (inspiré du code moodle)
function afficherResultats(data){
	
	var index = [];

	var contenuTableau = "<tr class='table-row'>";

	data.head.vars.forEach((v, i) => {
		
		//contenuTableau += "<th>" + v + "</th>";
		index.push(v);
	});
	var ind = 0;
	data.results.bindings.forEach(r => {
		if (ind % 4 == 0){
			contenuTableau += "<tr class='table-row'>";
		}
	  
	  	console.log(ind % 4);
	  index.forEach(v => {
		if (r[v].type === "uri")
		{
		  contenuTableau += "<img class='img-result' src='" + r[v].value + "' onerror=\"this.onerror=null; this.src='ressources/defaultImg.png'\" target='_blank'></img></div></td>";
		}
		else {
		  contenuTableau += "<td class='table-cell'><div class='cell-content'><p class='cheese-name'>" +r[v].value +"</p>" ;
		}
	  }); 
	  if (ind % 4 == 3){
	  	contenuTableau += "</tr>";
	  }
	  ind = ind + 1;
	});


	contenuTableau += "</tr>";

	document.getElementById("resultat").innerHTML = contenuTableau;

}

function detail(){
  location.href = "./detail.html" ;
}

