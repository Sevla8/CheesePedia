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

	var contenuTableau = "<tr>";

	data.head.vars.forEach((v, i) => {
		
		//contenuTableau += "<th>" + v + "</th>";
		index.push(v);
	});

	data.results.bindings.forEach(r => {
	  contenuTableau += "<tr>";

	  index.forEach(v => {

		if (r[v].type === "uri")
		{
		  contenuTableau += 
		  "<td><img src='" + r[v].value + "' target='_blank'></img></td>";
		}
		else {
		  contenuTableau += "<td>" + r[v].value + "</td>";
		}
	  });


	  contenuTableau += "</tr>";
	});


	contenuTableau += "</tr>";

	document.getElementById("resultat").innerHTML = contenuTableau;

}

function detail(){
  location.href = "./detail.html" ;
}

