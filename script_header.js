//JAVASCRIPT FILE FOR THE HEADER : SEARCH AND FILTERS

// Appuyer sur ENTER pour rechercher
document.addEventListener('keypress', (event) => {
	var name = event.key;
	if (name == 'Enter') {
		search();
	}
}, false);

// Affiche les filtres déjà sélectionnés
if (sessionStorage.getItem("search") != "" && document.getElementById("searchTxt")) document.getElementById("searchTxt").value = sessionStorage.getItem("search");
if (sessionStorage.getItem("certification") != "") document.getElementById("certificationFilters").value = sessionStorage.getItem("certification");
if (sessionStorage.getItem("country") != "")document.getElementById("countryFilters").value = (sessionStorage.getItem("country")).replaceAll("_"," ");
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
	countryTxt = countryTxt.replaceAll("%20","_");
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

//Recherche de tous les pays produisant du fromage
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

//Ajout des pays au filtre
function parseCountries(data) {
	var s = "";
	//<option value="Cambridge">

	data.results.bindings.forEach((country) => {
		s += "<option value=\""+country.cn.value+"\">";
	});
	document.getElementById("countryname").innerHTML = s;

}