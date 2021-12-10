//JAVASCRIPT FILE

// Appuyer sur ENTER pour rechercher
document.addEventListener('keypress', (event) => {
	var name = event.key;
	if (name == 'Enter') {
		search();
	}
}, false);

// Affiche les filtres déjà sélectionnés
if (sessionStorage.getItem("search") != "") document.getElementById("searchTxt").value = sessionStorage.getItem("search");
if (sessionStorage.getItem("certification") != "") document.getElementById("certificationFilters").value = sessionStorage.getItem("certification");
if (sessionStorage.getItem("country") != "")document.getElementById("countryFilters").value = sessionStorage.getItem("country");
if (sessionStorage.getItem("texture") != "") document.getElementById("textureFilters").value = sessionStorage.getItem("texture");
if (sessionStorage.getItem("source") != "") document.getElementById("sourceFilters").value = sessionStorage.getItem("source");
if (sessionStorage.getItem("pasteurized") != "") document.getElementById("pasteurizedFilters").value = sessionStorage.getItem("pasteurized");

// Construit la l'URL de la page
function search() {
	let searchTxt = document.getElementById("searchTxt").value;
	searchTxt = encodeURIComponent(searchTxt);
	sessionStorage.setItem("search", searchTxt);

	let certificationTxt = document.getElementById("certificationFilters").value;
	certificationTxt = encodeURIComponent(certificationTxt);
	sessionStorage.setItem("certification", certificationTxt);

	let countryTxt = document.getElementById("countryFilters").value;
	countryTxt = encodeURIComponent(countryTxt);
	sessionStorage.setItem("country", countryTxt);

	let textureTxt = document.getElementById("textureFilters").value;
	textureTxt = encodeURIComponent(textureTxt);
	sessionStorage.setItem("texture", textureTxt);

	let sourceTxt = document.getElementById("sourceFilters").value;
	sourceTxt = encodeURIComponent(sourceTxt);
	sessionStorage.setItem("source", sourceTxt);

	let pasteurizedTxt = document.getElementById("pasteurizedFilters").value;
	pasteurizedTxt = encodeURIComponent(pasteurizedTxt);
	sessionStorage.setItem("pasteurized", pasteurizedTxt);

	location.href = `./results_cheese.html?search=${searchTxt}&certification=${certificationTxt}&country=${countryTxt}&texture=${textureTxt}&source=${sourceTxt}&pasteurized=${pasteurizedTxt}`;
}

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

		//result += '<p><a href=detail.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>';

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

function loadDetail() {
  	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('cheese')) {
		var inputLabel = decodeURIComponent(urlParams.get('cheese'));

		inputLabel = "\""+inputLabel+"\"@en";
		console.log('Detail of cheese:', inputLabel);
	}

	var contenu_requete = `
		select ?f ?a ?n ?thumbnail
		sum(if(regex(?c,"A.*O.*C"),1,0)) AS ?AOC
		sum(if(regex(?c,"AOP"),1,0)) as ?AOP
		sum(if(regex(?c,"P.*D.*O"),1,0)) as ?PDO
		sum(if(regex(?c,"D.*O.*C"),1,0)) as ?DOC
		sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Ff]irm"),1,0)) as ?SFirm
		sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Ha]ard"),1,0)) as ?SHard
		sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Ss]oft"),1,0)) as ?SSoft
		sum(if(regex(?t,"[Ff]irm"),1,0))-sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Ff]irm"),1,0)) as ?Firm
		sum(if(regex(?t,"[Ss]oft"),1,0))-sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Ss]oft"),1,0)) as ?Soft
		sum(if(regex(?t,"[Hh]ard"),1,0))-sum(if(regex(?t,"([Ss]emi|[Mm]edium).?[Hh]ard"),1,0)) as ?Hard
		sum(if(regex(?t,"[Cc]rumbly"),1,0)) as ?Crumbly
		sum(if(regex(?t,"[Cc]ream"),1,0)) as ?Creamy
		sum(if(regex(?t,"[Dd]ense"),1,0)) as ?Dense
		sum(if(regex(?t,"[Cc]ompact"),1,0)) as ?Compact
		sum(if(regex(?t,"[Gg]ranular"),1,0)) as ?Granular
		sum(if(regex(?t,"[Mm]oist"),1,0)) as ?Moist
		sum(if(regex(?t,"[Ee]lastic"),1,0)) as ?Elastic
		sum(if(regex(?t,"[Ss]tringy"),1,0)) as ?Stringy
		sum(if(regex(?t,"[Ss]mooth"),1,0)) as ?Smooth
		sum(if(regex(?s,"[Gg]oat"),1,0)) as ?Goat
		sum(if(regex(?s,"[Cc]ow|[Cc]attle"),1,0)) as ?Cow
		sum(if(regex(?s,"[Ss]heep|[Ee]we"),1,0)) as ?Sheep
		sum(if(regex(?s,"[Bb]uffalo|[Cc]arabao"),1,0)) as ?Buffalo
		sum(if(regex(?s,"[Dd]onkey"),1,0)) as ?Donkeys
		sum(if(regex(?s,"[Yy]ak"),1,0)) as ?Yak
		sum(if(regex(?s,"[Mm]oose"),1,0)) as ?Moose
		sum(if(regex(?p,"([Yy]es|[Oo]ften|[Ff]requently|[Pp]ossibly|[Dd]epends)"),1,0))+sum(if(regex(?p2,"([Yy]es|[Oo]ften|[Ff]requently|[Pp]ossibly|[Dd]epends)"),1,0)) as ?Pasteurized
		WHERE {
			?f a dbo:Cheese.
			?f dbo:abstract ?a.
			?f rdfs:label ?n.
			OPTIONAL{?f dbp:certification ?c.}
			OPTIONAL{?f dbp:pasteurised ?p}.
			OPTIONAL{?f dbp:pasteurized ?p2}.
			OPTIONAL{?f dbp:source ?s}.
			OPTIONAL{?f dbp:texture ?t}.
			OPTIONAL {?f dbo:thumbnail ?thumbnail}.

			FILTER(
				langMatches(lang(?n),"EN") &&
				langMatches(lang(?a),"EN") &&
				REGEX(?a ,"[Cc]heese") &&
				?n=${inputLabel}
			).
		}
		GROUP BY ?f ?a ?n ?thumbnail
	`;

	// Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            showDetails(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

	loadRecipe();
}

function loadRecipe() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('cheese')) {
		var inputLabel = decodeURIComponent(urlParams.get('cheese'));

		inputLabel = "\""+inputLabel+"\"@en";
		console.log('Detail of cheese:', inputLabel);
	}

	var contenu_requete = `
		SELECT DISTINCT ?recipe_label ?recipe_thumbnail
		WHERE {
			?cheese a dbo:Cheese;
					dbo:abstract ?abstract;
					rdfs:label ?cheese_label.
			?recipe dbo:ingredient ?cheese;
					rdfs:label ?recipe_label.
			FILTER(
				langMatches(lang(?cheese_label), "EN") &&
				langMatches(lang(?recipe_label), "EN") &&
				langMatches(lang(?abstract), "EN") &&
				REGEX(?abstract , "cheese", "i") &&
				?cheese_label = ${inputLabel}
			)
			OPTIONAL {
				?recipe dbo:thumbnail ?recipe_thumbnail .
			}
		}
	`;

	// Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            showRecipes(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function showRecipes(data) {
	console.log('Recipes from https://dbpedia.org/:', data);

	let result = "<tr class='table-row'>";
	data.results.bindings.forEach((recipe) => {
		result += '<td class="table-cell cell-content" id="' + recipe.recipe_label.value + '">';

		result += '<h3 class="name">' + recipe.recipe_label.value + '</h3>';

		if (recipe.recipe_thumbnail) {
			result += '<p class="thumbnail"><img class="img-result" src="' + recipe.recipe_thumbnail.value + '" alt="' + recipe.recipe_label.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			result += '<p class="thumbnail"><img class="img-result" src="ressources/recipe.png"\" target="_blank"></p>';
		}

		// result += '<p><a href=detail.html?cheese=' + encodeURIComponent(recipe.recipe_label.value) + '>More details</a></p>';

		result += '</td>';
	});
	result += "</tr>";

	document.getElementById('recipes').innerHTML = result;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function showDetails(data) {
	console.log('Detail from https://dbpedia.org/:', data);

	data.results.bindings.forEach((cheese) => {

		var certification = "";
		if (cheese.AOC.value == 1) {
			certification += "AOC, ";
		}
		if (cheese.AOP.value == 1) {
			certification += "AOP, ";
		}
		if (cheese.PDO.value == 1) {
			certification += "PDO, ";
		}
		if (cheese.DOC.value == 1) {
			certification += "DOC, ";
		}
		if (certification == "") {
			certification="-";
		}
		else {
			certification = certification.substring(0, certification.length - 2);
		}

		var milk = "";
		if (cheese.Goat.value == 1) {
			milk += "Goat, ";
		}
		if (cheese.Cow.value == 1) {
			milk += "Cow, ";
		}
		if (cheese.Sheep.value == 1) {
			milk += "Sheep, ";
		}
		if (cheese.Buffalo.value == 1) {
			milk += "Buffalo, ";
		}
		if (cheese.Donkeys.value == 1) {
			milk += "Donkeys, ";
		}
		if (cheese.Yak.value == 1) {
			milk += "Yak, ";
		}
		if (cheese.Moose.value == 1) {
			milk += "Moose, ";
		}
		if (milk == "") {
			milk="-";
		}
		else {
			milk = milk.substring(0, milk.length - 2);
		}

		var pasteurized = ""
		if (cheese.Pasteurized.value == 1) {
			pasteurized = "Yes";
		}
		else {
			pasteurized = "No";
		}

		var texture = "";
		if(cheese.SFirm.value == 1) {
			texture += "Semi-Firm, ";
		}
		if (cheese.SHard.value == 1) {
			texture += "Semi-Hard, ";
		}
		if (cheese.SSoft.value == 1){
			texture += "Semi-Soft, ";
		}
		if (cheese.Firm.value == 1) {
			texture += "Firm, ";
		}
		if (cheese.Soft.value == 1){
			texture += "Soft, ";
		}
		if (cheese.Hard.value == 1) {
			texture += "Hard, ";
		}
		if (cheese.Crumbly.value == 1) {
			texture += "Crumbly, ";
		}
		if (cheese.Creamy.value == 1) {
			texture += "Creamy, ";
		}
		if (cheese.Dense.value == 1) {
			texture += "Dense, ";
		}
		if (cheese.Compact.value == 1) {
			texture += "Compact, ";
		}
		if (cheese.Granular.value == 1) {
			texture += "Granular, ";
		}
		if (cheese.Moist.value == 1) {
			texture += "Moist, ";
		}
		if (cheese.Elastic.value == 1) {
			texture += "Elastic, ";
		}
		if (cheese.Stringy.value == 1) {
			texture += "Stringy, ";
		}
		if (cheese.Smooth.value == 1) {
			texture += "Smooth, ";
		}
		if (texture=="") {
			texture="-";
		}
		else {
			texture = texture.substring(0, texture.length - 2);
		}

		document.getElementById("certification").innerHTML = certification;
		document.getElementById("milk").innerHTML = milk;
		document.getElementById("pasteurized").innerHTML = pasteurized;
		document.getElementById("texture").innerHTML = texture;
		document.getElementById("name").innerHTML = cheese.n.value;
		document.getElementById("detail-block-left").innerHTML = cheese.a.value;
		if (cheese.thumbnail) {
			document.getElementById("img-detail").src =  cheese.thumbnail.value;
		}
	});
}

function loadCountry() {

  	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('cheese')) {
		var inputLabel = decodeURIComponent(urlParams.get('cheese'));

		inputLabel = "\""+inputLabel+"\"@en";
		console.log('Country of cheese:', inputLabel);
	}

	var contenu_requete = `
			select distinct ?cn
					where {
		?f a dbo:Cheese.
		?f dbo:abstract ?a.
		?f rdfs:label ?n.
		{?f dbo:country ?c}UNION
		{?f dbp:country ?c}
		?c rdfs:label ?cn.

		FILTER(langMatches(lang(?n),"EN") && langMatches(lang(?a),"EN")  && langMatches(lang(?cn),"EN") && REGEX(?a ,"[Cc]heese") && ?n=${inputLabel}).
		}
	`;

	// Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            showCountries(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

}

function showCountries(data) {
	console.log('Detail from https://dbpedia.org/:', data);
	var country = "";

	data.results.bindings.forEach((cheese) => {

		if(cheese.cn){
			country += cheese.cn.value+", ";
		}
	});

	if (country=="") {
			country="-";
	}else{
		country = country.substring(0, country.length - 2);
	}

	console.log(country)
	document.getElementById("country").innerHTML = country;

}

function addCountryFilter(){
	
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	var contenu_requete = `
					select distinct ?cn 
					 where {
		?c a dbo:Country.
		?f a dbo:Cheese.
		?f dbo:abstract ?a. 
		?f rdfs:label ?n.
		?c rdfs:label ?cn.
		{
		?f dbp:country ?c.
		}UNION{
		?f dbp:country ?cn.
		}
		FILTER(langMatches(lang(?cn),"EN") &&langMatches(lang(?n),"EN") && langMatches(lang(?a),"EN") && REGEX(?a ,"[Cc]heese") ).
		}
	`;

	// Encodage de l'URL à transmettre à DBPedia
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // Requête HTTP et affichage des résultats
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText);
            parseCountries(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
	
}

function parseCountries(data) {
	var s = "";
	//<option value="Cambridge">

	data.results.bindings.forEach((country) => {
		s += "<option value=\""+country.cn.value+"\">";
	});
	document.getElementById("countryname").innerHTML = s;
	
}



