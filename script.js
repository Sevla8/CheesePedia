//JAVASCRIPT FILE

function search(){
  let searchTxt = document.getElementById("searchTxt").value;
  searchTxt = encodeURIComponent(searchTxt);
  location.href = `./results_cheese.html?search=${searchTxt}` ;
}

//Affichage de la liste des fromages (inspiré du code moodle)
function searchCheeses() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('search')) {
		var input = decodeURIComponent(urlParams.get('search'));
		console.log('Search:', input);
	}

	var contenu_requete = `
		SELECT ?label ?thumbnail
		WHERE {
			?cheese a dbo:Cheese ;
					dbo:abstract ?abstract ;
					rdfs:label ?label .
			FILTER(
				langMatches(lang(?label),"EN") &&
				langMatches(lang(?abstract),"EN") &&
				REGEX(?abstract ,"cheese", "i") &&
				REGEX(?label, "${input}", "i")
			)
			OPTIONAL {
				?cheese dbo:thumbnail ?thumbnail .
			}
		}
		ORDER BY ASC(?label)
	`;

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

function detail(){
  location.href = "./detail.html" ;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}