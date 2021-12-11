//JAVASCRIPT FILE FOR CHEESE SEARCH

// Obtention de la liste des fromages
function searchCheeses() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('search')) {
		var inputLabel = decodeURIComponent(urlParams.get('search'));
		console.log('Search:', inputLabel);
	}
	if (urlParams.has('certification')) {
		var inputCertification = decodeURIComponent(urlParams.get('certification'));
		console.log('Certification:', inputCertification);
	}
	if (urlParams.has('country')) {
		var inputCountry = decodeURIComponent(urlParams.get('country'));
		console.log('Country:', inputCountry);
	}
	if (urlParams.has('texture')) {
		var inputTexture = decodeURIComponent(urlParams.get('texture'));
		console.log('Texture:', inputTexture);
	}
	if (urlParams.has('source')) {
		var inputSource = decodeURIComponent(urlParams.get('source'));
		console.log('Source:', inputSource);
	}
	if (urlParams.has('pasteurized')) {
		var inputPasteurized = decodeURIComponent(urlParams.get('pasteurized'));
		console.log('Pasteurized:', inputPasteurized);
	}

	var contenu_requete = `
		SELECT ?label ?thumbnail
		WHERE {
			?cheese a dbo:Cheese ;
					dbo:abstract ?abstract ;
					rdfs:label ?label .
			FILTER(
				langMatches(lang(?label), "EN") &&
				langMatches(lang(?abstract), "EN") &&
				REGEX(?abstract ,"cheese", "i") &&
				REGEX(?label, "${inputLabel}", "i")
			)
	`;
	if (inputCertification != "") {
		contenu_requete += `
			?cheese dbp:certification ?certification .
			FILTER(
				REGEX(?certification, "${inputCertification}", "i")
			)
		`;
	}
	if (inputCountry != "") {
		contenu_requete += `
			?cheese dbp:country ?country .
			FILTER(
				REGEX(?country, "${inputCountry}", "i")
			)
		`;
	}
	if (inputTexture != "") {
		contenu_requete += `
			?cheese dbp:texture ?texture .
			FILTER(
				REGEX(?texture, "${inputTexture}", "i")
			)
		`;
	}
	if (inputSource != "") {
		contenu_requete += `
			?cheese dbp:source ?source .
			FILTER(
				REGEX(?source, "${inputSource}", "i")
			)
		`;
	}
	if (inputPasteurized != "") {
		contenu_requete += `
			{
				?cheese dbp:pasteurized ?pasteu1 .
				FILTER(
					REGEX(?pasteu1, "${inputPasteurized}|often|frequently|possibly|depends", "i")
				)
			}
			UNION
			{
				?cheese dbp:pasteurised ?pasteu2 .
				FILTER(
					REGEX(?pasteu2, "${inputPasteurized}|often|frequently|possibly|depends", "i")
				)

			}
		`;
	}
	contenu_requete += `
			OPTIONAL {
				?cheese dbo:thumbnail ?thumbnail .
			}
		}
		GROUP BY ?label ?thumbnail
		ORDER BY ASC(?label)
	`;

	console.log('Request:', contenu_requete);

    // Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            showResults(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Affichage des résultats dans un tableau
function showResults(data) {
	console.log('Results from https://dbpedia.org/:', data);

	let i = 0;

	let result = "<tr class='table-row'>";
	data.results.bindings.forEach((cheese) => {
		result += '<td class="table-cell cell-content" id="' + cheese.label.value + '">';

		result += '<a class="caseLink" href=detail.html?cheese=' + encodeURIComponent(cheese.label.value) + '><h3 class="name">' + cheese.label.value + '</h3>';

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

		if (cheese.thumbnail) {
			result += '<p class="thumbnail"><img class="img-result" src="' + cheese.thumbnail.value + '" alt="' + cheese.label.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			result += '<p class="thumbnail"><img class="img-result" src="ressources/defaultImg.png"\" target="_blank"></p>';
		}

		result += '<p><a href=detail.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>';

		result += '</a></td>';

		++i;

		if (i == 4) {
			result += "</r><tr class='table-row'>";
			i = 0;
		}
	});
	result += "</tr>";

	document.getElementById("resultat").innerHTML = result;

}

//Mise en forme de la première lettre en majuscule
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}