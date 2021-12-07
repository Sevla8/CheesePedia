//JAVASCRIPT FILE

//TEST
function myFunction() {
  document.getElementById("demo").innerHTML = "test";
}

function search(){
  let searchTxt = document.getElementById("searchTxt").value;
  searchTxt = encodeURIComponent(searchTxt);
  location.href = `./results_cheese.html?search=${searchTxt}` ;
}

function searchCheeses() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('search')) {
		var input = decodeURIComponent(urlParams.get('search'));
		console.log('Search:', input);
	}

	let contenu_requete = `
		SELECT ?label ?thumbnail ?country
		GROUP_CONCAT(DISTINCT ?texture; SEPARATOR=", ") as ?textures
		GROUP_CONCAT(DISTINCT ?s; SEPARATOR=", ") AS ?sources
		WHERE { # we don't accept cheeses without label, thumbnail or abstract
			?cheese a dbo:Cheese ;
					rdfs:label ?label ;
					dbo:thumbnail ?thumbnail ;
					dbo:abstract ?abstract .
			FILTER(
				langMatches(lang(?label), "EN") &&
				langMatches(lang(?abstract), "EN") &&
				REGEX(?label, "${input}", "i") &&
				REGEX(?abstract ,"cheese", "i")
			)
			optional { # some cheeses don't have a country informed
				?cheese dbp:country ?country0 .
				optional { # somecountries are dbo:Country, some others are xsd:string
					?country0 rdfs:label ?country_label .
					FILTER(langMatches(lang(?country_label), "EN"))
				}
				BIND(COALESCE(?country_label, ?country0) AS ?country)
			}
			optional { # some cheeses don't have a source informed
				?cheese dbp:source ?source .
				optional { # some sources are dbo:Animal (or else), some others are xsd:string
					?source rdfs:label ?source_label .
					FILTER(langMatches(lang(?source_label), "EN"))
				}
				BIND(COALESCE(?source_label, ?source) AS ?s)
			}
			optional { # some cheeses don't have a texture informed
				?cheese dbp:texture ?texture .
				FILTER(langMatches(lang(?texture), "EN"))
			}
		}
		ORDER BY ASC(?label)
	`;

	// Encodage de l'URL à transmettre à DBPedia
	let url_base = "http://dbpedia.org/sparql";
	let url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

	// Requête HTTP et affichage des résultats
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var results = JSON.parse(this.responseText);
			afficherResultats(results);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

//Affichage de la liste des fromages (inspiré du code moodle)
function showAll(){

	var contenu_requete = `select ?label ?thumbnail where {
	?cheese a dbo:Cheese.
	?cheese dbo:abstract ?abstract.
	?cheese rdfs:label ?label.
	FILTER(langMatches(lang(?label),"EN")).
	FILTER(langMatches(lang(?abstract),"EN") && REGEX(?abstract ,"[Cc]heese")).
	OPTIONAL{?cheese dbo:thumbnail ?thumbnail.}
	}ORDER BY ASC(?label)`;

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
	console.log('Results from https://dbpedia.org/:', data);

	let i = 0;

	let result = "<tr class='table-row'>";
	data.results.bindings.forEach((cheese) => {
		result += '<td class="table-cell cell-content" id="' + cheese.label.value + '">';

		result += '<h3 class="name">' + cheese.label.value + '</h3>';

		if (cheese.country) result += '<p class="country"><em>Country: </em>' + cheese.country.value + '</p>';

		if(cheese.sources){
			result += '<p class="source"><em>Source: </em><ul>';
			let sources = cheese.sources.value.split(', ');
			sources.forEach((source) => {
				if (source) result += '<li>' + capitalizeFirstLetter(source) + '</li>';
			});
			result += '</ul></p>';
		}
		
		if(cheese.texture){
			result += '<p class="texture"><em>Texture: </em><ul>';
			let textures = cheese.textures.value.split(', ');
			textures.forEach((texture) => {
				if (texture) result += '<li>' + capitalizeFirstLetter(texture) + '</li>';
			});
			result += '</ul></p>';
		}
		
		if(cheese.thumbnail){
			result += '<p class="thumbnail"><img class="img-result" src="' + cheese.thumbnail.value + '" alt="' + cheese.label.value + ' onerror=\"this.onerror=null; this.src="ressources/defaultImg.png"\" target="_blank"></p>';
		}

		

		result += '<p><a href=index.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>';

		result += '</td>';

		++i;

		if (i == 4) {
		result += "</r><tr class='table-row'>";
		i = 0;
		}
	});
	result += "</tr>";

	document.getElementById("resultat").innerHTML = result;

}

// if (cheese[v].type === "uri")
// {
// contenuTableau += "<img class='img-result' src='" + cheese[v].value + "' onerror=\"this.onerror=null; this.src='ressources/defaultImg.png'\" target='_blank'></img></div></td>";
// }
// else {
// contenuTableau += "<td class='table-cell'><div class='cell-content'><p class='cheese-name'>" +cheese[v].value +"</p>" ;
// }

function detail(){
  location.href = "./detail.html" ;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}