//JAVASCRIPT FILE

function search(){
	let searchTxt = document.getElementById("searchTxt").value;
	searchTxt = encodeURIComponent(searchTxt);

	let countryTxt = document.getElementById("countryFilters").value;
	countryTxt = encodeURIComponent(countryTxt);

	location.href = `./results_cheese.html?search=${searchTxt}&country=${countryTxt}` ;
}

function enter(elem){
	if(event.key == 'Enter') {
		searchTxt = document.getElementById("searchTxt").value;
  		location.href = "./results_cheese.html" ;
	}
}

//Affichage de la liste des fromages (inspiré du code moodle)
function searchCheeses() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('search')) {
		var inputLabel = decodeURIComponent(urlParams.get('search'));
		console.log('Search:', inputLabel);
	}
	if (urlParams.has('country')) {
		var inputCountry = decodeURIComponent(urlParams.get('country'));
		console.log('Country:', inputCountry);
	}

	var contenu_requete = "";
	if (inputCountry != "") {
		contenu_requete = `
		SELECT ?label ?thumbnail ?country
		WHERE {
			?cheese a dbo:Cheese ;
					dbo:abstract ?abstract ;
					dbp:country ?country0 ;
					rdfs:label ?label .
			FILTER(
				langMatches(lang(?label),"EN") &&
				langMatches(lang(?abstract),"EN") &&
				REGEX(?abstract ,"cheese", "i") &&
				REGEX(?label, "${inputLabel}", "i") &&
				REGEX(?country0, "${inputCountry}", "i")
			)
			OPTIONAL {
				?cheese dbo:thumbnail ?thumbnail .
			}
			OPTIONAL {
				?country0 rdfs:label ?country_label .
				FILTER(
					langMatches(lang(?country_label), "EN") &&
					REGEX(?country_label, "${inputCountry}", "i")
				)
			}
			BIND(COALESCE(?country_label, ?country0) AS ?country)
		}
		ORDER BY ASC(?label)
		`;
	} else {
		contenu_requete = `
			SELECT ?label ?thumbnail
			WHERE {
				?cheese a dbo:Cheese ;
						dbo:abstract ?abstract ;
						rdfs:label ?label .
				FILTER(
					langMatches(lang(?label),"EN") &&
					langMatches(lang(?abstract),"EN") &&
					REGEX(?abstract ,"cheese", "i") &&
					REGEX(?label, "${inputLabel}", "i")
				)
				OPTIONAL {
					?cheese dbo:thumbnail ?thumbnail .
				}
			}
			ORDER BY ASC(?label)
		`;
	}

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

		if (cheese.thumbnail) {
			result += '<p class="thumbnail"><img class="img-result" src="' + cheese.thumbnail.value + '" alt="' + cheese.label.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			result += '<p class="thumbnail"><img class="img-result" src="ressources/defaultImg.png"\" target="_blank"></p>';
		}



		result += '<p><a href=detail.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>';

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
  var contenu_requete = `select ?f  sum(if(regex(?c,"A.*O.*C"),1,0)) as ?AOC 
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

						 where {
						?f a dbo:Cheese.
						?f dbo:abstract ?a. 
						?f rdfs:label ?n.
						OPTIONAL{?f dbp:aging	?a}.
						OPTIONAL{?f dbp:certification ?c.}
						OPTIONAL{?f dbp:pasteurised ?p}.
						OPTIONAL{?f dbp:pasteurized ?p2}.

						OPTIONAL{?f dbp:source ?s}.
						OPTIONAL{?f dbp:texture ?t}.


						FILTER(langMatches(lang(?n),"EN") && langMatches(lang(?a),"EN") && REGEX(?a ,"[Cc]heese") && ?n="${label}").
						}
						GROUP BY ?f
  `;
  
  
  
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}