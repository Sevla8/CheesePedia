//JAVASCRIPT FILE

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('id')) {
	searchCheese(urlParams.get('id'));
}

// Search a cheese by its name
function search() {
	let input = document.getElementById("searchInput").value;
	let contenu_requete = `
		SELECT ?name, ?country, ?source, ?texture, ?image, ?wikiPageID
		WHERE {
			?cheese a dbo:Cheese ;
					dbp:name ?name ;
					dbo:thumbnail ?image ;
					dbp:country ?country ;
					dbp:source ?source ;
					dbp:texture ?texture ;
					dbo:abstract ?abstract ;
					dbo:wikiPageID ?wikiPageID .
			FILTER(
				langMatches(lang(?name),"EN") &&
				REGEX(?name, "${input}", "i") &&
				langMatches(lang(?abstract),"EN") &&
				REGEX(?abstract ,"cheese", "i")
			)
		}
		ORDER BY ASC(?name)
	`;

	// Encodage de l'URL à transmettre à DBPedia
    let url_base = "http://dbpedia.org/sparql";
    let url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

	// Requête HTTP et affichage des résultats
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            displayResults(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Display the results
function displayResults(data) {
	console.log('Results from https://dbpedia.org/:', data);

	let result = "<div>";

	data.results.bindings.forEach((it) => {
		result += '<div id="' + it.wikiPageID.value + '">';
		result += '<h3 class="name">' + it.name.value + '</h3>';
		result += '<p class="country"><em>Country: </em>' + parse(it.country.value) + '</p>';
		result += '<p class="source"><em>Source: </em>' + parse(it.source.value) + '</p>';
		result += '<p class="texture"><em>Texture: </em>' + parse(it.texture.value) + '</p>';
		result += '<p class="image"><img src="' + it.image.value + '" alt="' + it.name.value + '"></p>';
		result += '<p><a href=index.html?id=' + it.wikiPageID.value + '>More details</a></p>';
		result += '</div>';
	});

	document.getElementById("results").innerHTML = result;
}

// Search a cheese by its wikiPageID
function searchCheese(cheese) {
	let contenu_requete = `
		SELECT *
		WHERE {
			?cheese a dbo:Cheese ;
					dbp:name ?name ;
					dbo:thumbnail ?image ;
					dbp:country ?country ;
					dbp:source ?source ;
					dbp:texture ?texture ;
					dbo:abstract ?abstract ;
					dbo:wikiPageID ?wikiPageID .
			FILTER(
				?wikiPageID = ${cheese} &&
				langMatches(lang(?name),"EN") &&
				langMatches(lang(?abstract),"EN") &&
				REGEX(?abstract ,"cheese", "i")
			)
			optional {
				?cheese dbo:pasteurised ?pasteurised ;
						dbp:aging ?aging ;
						dbp:certification ?certification ;
						dbp:regiontown ?regiontown .
				FILTER(
					langMatches(lang(?certification),"EN") &&
					langMatches(lang(?pasteurised),"EN") &&
					langMatches(lang(?regiontown),"EN")
				)
			}
		}
		ORDER BY ASC(?name)
	`;

	// Encodage de l'URL à transmettre à DBPedia
    let url_base = "http://dbpedia.org/sparql";
    let url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

	// Requête HTTP et affichage des résultats
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            displayCheese(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Display the cheese
function displayCheese(data) {
	console.log('Results from https://dbpedia.org/:', data);

	let result = "<div>";

	data.results.bindings.forEach((it) => {
		result += '<div id="' + it.wikiPageID.value + '">';
		result += '<h3 class="name">' + it.name.value + '</h3>';
		result += '<p class="country"><em>Country: </em>' + parse(it.country.value) + '</p>';
		result += '<p class="source"><em>Source: </em>' + parse(it.source.value) + '</p>';
		result += '<p class="texture"><em>Texture: </em>' + parse(it.texture.value) + '</p>';
		result += '<p class="image"><img src="' + it.image.value + '" alt="' + it.name.value + '"></p>';
		if (it.pasteurised) result += '<p class="pasteurised"><em>Pasteurised: </em>' + it.pasteurised.value + '</p>';
		if (it.certification) result += '<p class="certification"><em>Certification: </em>' + it.certification.value + '</p>';
		if (it.value) result += '<p class="aging"><em>Aging: </em>' + it.aging.value + '</p>';
		result += '</div>';
	});

	document.getElementById("results").innerHTML = result;
}

// Parse text
function parse(text) {
	if (text.includes('/')) {
		text = text.substring(text.lastIndexOf('/') + 1);
	}
	text = text.replace(/_/g, ' ');
	return text;
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

function detail(){
  location.href = "./detail.html" ;
}

