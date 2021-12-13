//JAVASCRIPT FILE FOR DETAIL PAGES

//Appelle les fonctions selon le type de l'objet recherché
function detail(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	if(urlParams.has('cheese')){
		loadDetail();
		loadRecipe();
	}
	if (urlParams.has('animal')) {
		detailAnimal();
	}
	if (urlParams.has('recipe')) {
		detailRecipe();
	}
	if(urlParams.has('country')){
		detailCountry();
		loadCountryCheeses();
	}
}

//Recherche les détails d'un fromage
function loadDetail() {
  	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('cheese')) {
		var inputLabel = decodeURIComponent(urlParams.get('cheese'));

		inputLabel = "\""+inputLabel+"\"@en";
		console.log('Detail of cheese:', inputLabel);
	}


	var contenu_requete = `  
								SELECT * WHERE
			{ 
			{
				 select ?f ?a ?n ?thumbnail  sum(if(regex(?c,"A.*O.*C"),1,0)) as ?AOC
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
			OPTIONAL{?f dbp:certification ?c.}
			OPTIONAL{?f dbp:pasteurised ?p}.
			OPTIONAL{?f dbp:pasteurized ?p2}.
			OPTIONAL{?f dbp:source ?s}.
			OPTIONAL{?f dbp:texture ?t}.
			OPTIONAL {?f dbo:thumbnail ?thumbnail}.


			FILTER(langMatches(lang(?n),"EN") && langMatches(lang(?a),"EN") && REGEX(?a ,"[Cc]heese") && ?n=${inputLabel}).
			}
			GROUP BY ?f ?a ?n ?thumbnail
					  
			}
			UNION
			{
			select distinct ?2rn ?2thumbnail
						 where {
			?2f a dbo:Cheese.
			?2f dbo:abstract ?2a.
			?2f rdfs:label ?2n.
			?2r dbo:ingredient ?2f.
			?2r rdfs:label ?2rn
			OPTIONAL {?2r dbo:thumbnail ?2thumbnail}.
			FILTER(langMatches(lang(?2n),"EN") && langMatches(lang(?2rn),"EN") && langMatches(lang(?2a),"EN") && REGEX(?2a ,"[Cc]heese") && ?2n=${inputLabel}).
			}
			}
			UNION
			{

			select distinct ?c2 ?cn 
							where {
				?f1 a dbo:Cheese.
				?f1 dbo:abstract ?a2.
				?f1 rdfs:label ?n1.
				
					{
					{?f1 dbo:country ?c2}UNION
				{?f1 dbp:country ?c2}
				?c2 rdfs:label ?cn.
					FILTER(langMatches(lang(?cn),"EN"))
					}UNION{
					{?f1 dbo:country ?c2}UNION
				{?f1 dbp:country ?c2}
					FILTER(langMatches(lang(?c2),"EN"))
					}
				FILTER(langMatches(lang(?n1),"EN") && langMatches(lang(?a2),"EN") && REGEX(?a2 ,"[Cc]heese") && ?n1=${inputLabel}).
				}

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
            showDetails(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Affiche les détails d'un fromage
function showDetails(data) {
	console.log('Detail from https://dbpedia.org/:', data);

	var s = ` <img id="img-detail" src="ressources/defaultImg.png" onerror = "this.onerror=null;this.src='ressources/defaultImg.png';" alt="Image" >
			<p class="det-col1">Country: </p>
			<p class="det-col2" id="country">-</p>
			<p class="det-col1">Certification: </p>
			<p class="det-col2" id="certification">-</p>
			<p class="det-col1">Pasteurized: </p>
			<p class="det-col2" id="pasteurized">-</p>
			<p class="det-col1">Texture: </p>
			<p class="det-col2" id="texture">-</p>
			<p class="det-col1">Milk Source: </p>
			<p class="det-col2" id="milk">-</p>
	`
	document.getElementById("detail-block-right").innerHTML = s;
	var certification = "";
	var milk = "";
	var pasteurized = "";
	var texture = "";
	var country = "";
	
	data.results.bindings.forEach((cheese) => {

		
		if (cheese.AOC && cheese.AOC.value == 1) {
			certification += "AOC, ";
		}
		if (cheese.AOP && cheese.AOP.value == 1) {
			certification += "AOP, ";
		}
		if (cheese.PDO && cheese.PDO.value == 1) {
			certification += "PDO, ";
		}
		if (cheese.DOC && cheese.DOC.value == 1) {
			certification += "DOC, ";
		}

		
		//Valeurs possible de input: Cattle | Water_buffalo | Goat | Sheep | Donkey | Yak | Moose
		////'<p><a href=detail.html?cheese=' + encodeURIComponent(cheese.label.value) + '>More details</a></p>'
		if (cheese.Goat && cheese.Goat.value == 1) {
			milk += "<a href='detail.html?animal=Goat'/>Goat</a>, ";
		}
		if (cheese.Cow && cheese.Cow.value == 1) {
			milk += "<a href='detail.html?animal=Cattle'/>Cow</a>, ";
		}
		if (cheese.Sheep && cheese.Sheep.value == 1) {
			milk += "<a href='detail.html?animal=Sheep'/>Sheep</a>, ";
		}
		if (cheese.Buffalo && cheese.Buffalo.value == 1) {
			milk += "<a href='detail.html?animal=Water_buffalo'/>Buffalo</a>, ";
		}
		if (cheese.Donkeys && cheese.Donkeys.value == 1) {
			milk += "<a href='detail.html?animal=Donkey'/>Donkey</a>, ";
		}
		if (cheese.Yak && cheese.Yak.value == 1) {
			milk += "<a href='detail.html?animal=Yak'/>Yak</a>, ";
		}
		if (cheese.Moose && cheese.Moose.value == 1) {
			milk += "<a href='detail.html?animal=Moose'/>Moose</a>, ";
		}
		

		
		if (cheese.Pasteurized && cheese.Pasteurized.value == 1) {
			pasteurized = "Yes";
		}
		else if(cheese.Pasteurized) {
			pasteurized = "No";
		}else{
			pasteurized = "-";
		}

		
		if(cheese.SFirm && cheese.SFirm.value == 1) {
			texture += "Semi-Firm, ";
		}
		if (cheese.SHard && cheese.SHard.value == 1) {
			texture += "Semi-Hard, ";
		}
		if (cheese.SSoft && cheese.SSoft.value == 1){
			texture += "Semi-Soft, ";
		}
		if (cheese.Firm && cheese.Firm.value == 1) {
			texture += "Firm, ";
		}
		if (cheese.Soft && cheese.Soft.value == 1){
			texture += "Soft, ";
		}
		if (cheese.Hard && cheese.Hard.value == 1) {
			texture += "Hard, ";
		}
		if (cheese.Crumbly && cheese.Crumbly.value == 1) {
			texture += "Crumbly, ";
		}
		if (cheese.Creamy && cheese.Creamy.value == 1) {
			texture += "Creamy, ";
		}
		if (cheese.Dense && cheese.Dense.value == 1) {
			texture += "Dense, ";
		}
		if (cheese.Compact && cheese.Compact.value == 1) {
			texture += "Compact, ";
		}
		if (cheese.Granular && cheese.Granular.value == 1) {
			texture += "Granular, ";
		}
		if (cheese.Moist && cheese.Moist.value == 1) {
			texture += "Moist, ";
		}
		if (cheese.Elastic && cheese.Elastic.value == 1) {
			texture += "Elastic, ";
		}
		if (cheese.Stringy && cheese.Stringy.value == 1) {
			texture += "Stringy, ";
		}
		if (cheese.Smooth && cheese.Smooth.value == 1) {
			texture += "Smooth, ";
		}
		
		
		
		if(cheese.cn){
			country+= "<a href='detail.html?country="+cheese.cn.value+"'/>"+cheese.cn.value+"</a>, ";
		}
	

		if(cheese.n){
			document.getElementById("name").innerHTML = cheese.n.value;
		}
		if(cheese.a){
			document.getElementById("detail-block-left").innerHTML = cheese.a.value;
		}
		if (cheese.thumbnail) {
			document.getElementById("img-detail").src =  cheese.thumbnail.value;
		}
	});
	
	//Remove the last ","
	if (milk == "") {
		milk="-";
	}
	else {
		milk = milk.substring(0, milk.length - 2);
	}
	if (certification == "") {
		certification="-";
	}
	else {
		certification = certification.substring(0, certification.length - 2);
	}
	if (texture=="") {
		texture="-";
	}
	else {
		texture = texture.substring(0, texture.length - 2);
	}
	if (country=="") {
		country="-";
	}else{
		country = country.substring(0, country.length - 2);
	}
		
	document.getElementById("country").innerHTML = country;
	document.getElementById("certification").innerHTML = certification;
	document.getElementById("milk").innerHTML = milk;
	document.getElementById("pasteurized").innerHTML = pasteurized;
	document.getElementById("texture").innerHTML = texture;
}


//Recherche les recettes utilisant le fromage sélectionné
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

//Affiche la liste des recettes sur detail fromage
function showRecipes(data) {
	console.log('Recipes from https://dbpedia.org/:', data);

	let result = "";
	if (data.results.bindings.length != 0) {
		result += "<h2>Recipes : </h2>" ;
	}
	
	result+="<tr class='table-row'>";
	data.results.bindings.forEach((recipe) => {
		result += '<td class="table-cell cell-content" id="' + recipe.recipe_label.value + '">';

		result += '<h3 class="name">' + recipe.recipe_label.value + '</h3>';

		if (recipe.recipe_thumbnail) {
			result += '<p class="thumbnail"><img class="img-result" src="' + recipe.recipe_thumbnail.value + '" alt="' + recipe.recipe_label.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			result += '<p class="thumbnail"><img class="img-result" src="ressources/recipe.png"\" target="_blank"></p>';
		}

		result += '<p><a href=detail.html?recipe=' + encodeURIComponent(recipe.recipe_label.value) + '>More details</a></p>';

		result += '</td>';
	});
	result += "</tr>";

	document.getElementById('bottom').innerHTML = result;
}

//Recherche les détails d'un animal
function detailAnimal(){

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('animal')) {
		var input = decodeURIComponent(urlParams.get('animal'));

		//Valeurs possible de input: Cattle | Water_buffalo | Goat | Sheep | Donkey | Yak | Moose
		console.log('Animal:', input);
	}

	var contenu_requete = `
					select ?label, ?abstract, ?thumbnail
		where{
			dbr:${input} rdfs:label ?label;
			dbo:abstract ?abstract;
			dbo:thumbnail ?thumbnail.
			FILTER(
				langMatches(lang(?abstract),"EN") &&
				langMatches(lang(?label),"EN")
			)
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
            showAnimal(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Affiche les détails d'un animal sur detail animal
function showAnimal(data) {
	console.log("showanimal called");


	data.results.bindings.forEach((animal) => {
		document.getElementById("name").innerHTML = animal.label.value;
		document.getElementById("detail-block-left").innerHTML = animal.abstract.value;
		if (animal.thumbnail) {
			document.getElementById("img-detail").src =  animal.thumbnail.value;
		}
	})

}

//Recherche les détails d'un pays
function detailCountry(){

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('country')) {
		var input = decodeURIComponent(urlParams.get('country'));
		var inputLabel = "\""+input+"\"@en";
		console.log('Country:', inputLabel);
	}

	var contenu_requete = `
					select distinct ?cn ?t ?d ?capitalname
             where {
			?c a dbo:Country.
			?c rdfs:label ?cn.
			?c rdfs:comment ?d.
			?c dbp:capital ?capital.
			?capital rdfs:label ?capitalname.
			OPTIONAL{?c dbo:thumbnail ?t}.
			FILTER(langMatches(lang(?cn),"EN")  &&  langMatches(lang(?d),"EN") && langMatches(lang(?capitalname),"EN") && ?cn=${inputLabel} ).
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
            showDetailCountry(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Affiche les détails d'un pays sur detail country
function showDetailCountry(data) {

	data.results.bindings.forEach((country) => {
		document.getElementById("name").innerHTML = country.cn.value;
		document.getElementById("detail-block-left").innerHTML = country.d.value;
		var colRight="";
		if (country.t) {
			colRight += '<p class="thumbnail"><img class="img-result" src="' + country.t.value + '" alt="' + country.cn.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			colRight += '<p class="thumbnail"><img class="img-result" src="ressources/flag.png"\" target="_blank"></p>';
		}
		colRight+="<p class='det-col2' id='capital'>Capital : "+country.capitalname.value+"</p>";

		document.getElementById("detail-block-right").innerHTML = colRight;

		console.log(colRight);
	})

}

//Recherche des fromages d'un pays
function loadCountryCheeses() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('country')) {
		var inputLabel = decodeURIComponent(urlParams.get('country'));

		inputLabel = "\""+inputLabel+"\"@en";
		console.log('Detail of Country:', inputLabel);
	}

	var contenu_requete = `
				select distinct ?n ?t
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
		OPTIONAL {?f dbo:thumbnail ?t}
		FILTER(langMatches(lang(?cn),"EN") &&langMatches(lang(?n),"EN") && langMatches(lang(?a),"EN") && REGEX(?a ,"[Cc]heese") && ?cn=${inputLabel} ).
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
            showCountryCheeses(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Affiche les pays d'un pays sur detail country
function showCountryCheeses(data) {
	console.log('Recipes from https://dbpedia.org/:', data);


	let result = "<h2>Cheeses : </h2>" ;
	result+="<tr class='table-row'>";
	data.results.bindings.forEach((cheese) => {
		result += '<td class="table-cell cell-content" id="' + cheese.n.value + '">';

		result += '<h3 class="name">' + cheese.n.value + '</h3>';

		if (cheese.t) {
			result += '<p class="thumbnail"><img class="img-result" src="' + cheese.t.value + '" alt="' + cheese.n.value + '" onerror="this.onerror=null; this.src=\'ressources/defaultImg.png\'" target="_blank"></p>';
		}
		else {
			result += '<p class="thumbnail"><img class="img-result" src="ressources/defaultImg.png"\" target="_blank"></p>';
		}
		result += '<p><a href=detail.html?cheese=' + encodeURIComponent(cheese.n.value) + '>More details</a></p>';
		result += '</td>';
	});
	
	result += "</tr>";

	document.getElementById('bottom').innerHTML = result;
}

//Recherche les détails d'une recette
function detailRecipe(){

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('recipe')) {
		var inputLabel = decodeURIComponent(urlParams.get('recipe'));

		input = "\""+inputLabel+"\"@en";
		console.log('Recipe:', inputLabel);
	}


	var contenu_requete = `
							SELECT * WHERE
		{ 
		{
			 select distinct ?rn ?thumbnail ?cn ?an 
					 where {
						  ?r dbo:ingredient [].
						  ?r rdfs:label ?rn.
						  
						  {
						  ?r dbp:country ?c.
						  ?c rdfs:label ?cn.
						  FILTER(langMatches(lang(?cn),"EN") ).
						  }UNION{
						  ?r dbp:country ?cn.
						  FILTER(langMatches(lang(?cn),"EN") ).
						  }
						  OPTIONAL {?r dbo:thumbnail ?thumbnail}.
						  FILTER( langMatches(lang(?rn),"EN") && ?rn=${input} ).
						 ?r dbo:abstract ?an.
						 FILTER(langMatches(lang(?an),"EN")).
				  }
		}
		UNION
		{
		select distinct ?n
					 where {
						  ?if a dbo:Cheese.
						   ?if dbo:abstract ?a.
						   ?if rdfs:label ?n.
						   ?2r dbo:ingredient ?if.
						   ?2r rdfs:label ?2rn.
						   FILTER(langMatches(lang(?n),"EN") && langMatches(lang(?2rn),"EN") &&  langMatches(lang(?a),"EN") && 
						  REGEX(?a ,"[Cc]heese") && ?2rn=${input}).
					}
		}
		UNION
		{
		select distinct ?infn
					 where {
						   ?3r dbo:ingredient ?inf.
						   ?inf rdfs:label ?infn.
						   ?3r rdfs:label ?3rn.
						   filter not exists { ?inf rdf:type dbo:Cheese }
						   FILTER(langMatches(lang(?infn),"EN") && langMatches(lang(?3rn),"EN") &&  ?3rn=${input}).
					}
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
            showRecipe(results);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Affiche les détails d'une recette sur detail recipe
function showRecipe(data) {
	
	console.log(data);
	var s= ` <img id="img-detail" src="ressources/defaultImg.png" onerror = "this.onerror=null;this.src='ressources/defaultImg.png';" alt="Image" >
			<p class="det-col1">Ingredients: </p>
			<p class="det-col2" id="ingredients">-</p>
			`
	var ingredients ="";
	document.getElementById("detail-block-right").innerHTML = s;
	data.results.bindings.forEach((recipe) => {
		if (recipe.rn) {
			document.getElementById("name").innerHTML = recipe.rn.value;
		}
		if(recipe.an){
			document.getElementById("detail-block-left").innerHTML = recipe.an.value;
		}
		if (recipe.thumbnail) {
			document.getElementById("img-detail").src =  recipe.thumbnail.value;
		}
		if(recipe.n){
			ingredients+= "<a href='detail.html?cheese="+recipe.n.value+"'/>"+recipe.n.value+"</a>, ";
		}
		if(recipe.infn){
			ingredients+= recipe.infn.value+", ";
		}
	})
	if (ingredients=="") {
			ingredients="-";
	}else{
		ingredients = ingredients.substring(0, ingredients.length - 2);
	}
	document.getElementById("ingredients").innerHTML =  ingredients;
	

}