//JAVASCRIPT FILE

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('cheese')) {
	searchCheese(decodeURIComponent(urlParams.get('cheese')));
	console.log('Cheese:', decodeURIComponent(urlParams.get('cheese')));
}

// Search a cheese by its label
function search() {
	let input = document.getElementById("searchInput").value;
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
	data.results.bindings.forEach((cheese) => {
		result += '<div id="' + cheese.label.value + '">';

		result += '<h3 class="name">' + cheese.label.value + '</h3>';

		if (cheese.country) result += '<p class="country"><em>Country: </em>' + cheese.country.value + '</p>';

		result += '<p class="source"><em>Source: </em><ul>';
		let sources = cheese.sources.value.split(', ');
		sources.forEach((source) => {
			if (source) result += '<li>' + capitalizeFirstLetter(source) + '</li>';
		});
		result += '</ul></p>';

		result += '<p class="texture"><em>Texture: </em><ul>';
		let textures = cheese.textures.value.split(', ');
		textures.forEach((texture) => {
			if (texture) result += '<li>' + capitalizeFirstLetter(texture) + '</li>';
		});
		result += '</ul></p>';

		result += '<p class="thumbnail"><img src="' + cheese.thumbnail.value + '" alt="' + cheese.label.value + '"></p>';

		result += '<p><a href=index.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>';

		result += '</div>';
	});
	result += "</div>";

	document.getElementById("results").innerHTML = result;
}

// Search a cheese by its label
function searchCheese(label) {
	let contenu_requete = `
		SELECT ?label ?thumbnail ?country
		GROUP_CONCAT(DISTINCT ?texture; SEPARATOR=", ") as ?textures
		GROUP_CONCAT(DISTINCT ?s; SEPARATOR=", ") AS ?sources
		GROUP_CONCAT(DISTINCT ?certification; SEPARATOR="|") as ?certifications
		GROUP_CONCAT(DISTINCT ?pasteurized; SEPARATOR="|") as ?pasteurizeds
		GROUP_CONCAT(DISTINCT ?aging; SEPARATOR="|") as ?agings
		WHERE { # we don't accept cheeses without label, name, thumbnail, country or abstract
			?cheese a dbo:Cheese ;
					rdfs:label ?label ;
					dbo:thumbnail ?thumbnail ;
					dbp:country ?country0 ;
					dbo:abstract ?abstract .
			FILTER(
				langMatches(lang(?label), "EN") &&
				langMatches(lang(?abstract), "EN") &&
				xsd:string(?label) = "${label}" &&
				REGEX(?abstract ,"cheese", "i")
			)
			optional { # somecountries are dbo:Country, some others are xsd:string
				?country0 rdfs:label ?country_label .
				FILTER(langMatches(lang(?country_label), "EN"))
			}
			BIND(COALESCE(?country_label, ?country0) AS ?country)
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
			optional { # some cheeses don't have an aging informed
				?cheese dbp:aging ?aging .
				FILTER(langMatches(lang(?aging), "EN"))
			}
			optional { # some cheeses don't have a certification informed
				?cheese dbp:certification ?certification .
				FILTER(langMatches(lang(?certification), "EN"))
			}
			optional {
				?cheese dbp:pasteurized ?pasteurized .
				FILTER(langMatches(lang(?pasteurized), "EN"))
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
	data.results.bindings.forEach((cheese) => {
		result += '<div id="' + cheese.label.value + '">';

		result += '<h3 class="name">' + cheese.label.value + '</h3>';

		result += '<p class="country"><em>Country: </em>' + cheese.country.value + '</p>';

		result += '<p class="source"><em>Source: </em><ul>';
		let sources = cheese.sources.value.split(', ');
		sources.forEach((source) => {
			if (source) result += '<li>' + capitalizeFirstLetter(source) + '</li>';
		});
		result += '</ul></p>';

		result += '<p class="texture"><em>Texture: </em><ul>';
		let textures = cheese.textures.value.split(', ');
		textures.forEach((texture) => {
			if (texture) result += '<li>' + capitalizeFirstLetter(texture) + '</li>';
		});
		result += '</ul></p>';

		result += '<p class="thumbnail"><img src="' + cheese.thumbnail.value + '" alt="' + cheese.label.value + '"></p>';

		result += '<p class="certification"><em>Certification: </em><ul>';
		let certifications = cheese.certifications.value.split('|');
		certifications.forEach((certification) => {
			if (certification) result += '<li>' + capitalizeFirstLetter(certification) + '</li>';
		});
		result += '</ul></p>';

		result += '<p class="pasteurized"><em>Pasteurized: </em><ul>';
		let pasteurizeds = cheese.pasteurizeds.value.split('|');
		pasteurizeds.forEach((pasteurized) => {
			if (pasteurized) result += '<li>' + capitalizeFirstLetter(pasteurized) + '</li>';
		});
		result += '</ul></p>';

		result += '</div>';
	});
	result += "</div>";

	document.getElementById("results").innerHTML = result;
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

//Affichage de la liste des fromages (inspiré du code moodle)
function showAll() {

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
	xmlhttp.onreadystatechange = function () {
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

function detail() {
	location.href = "./detail.html";
}
