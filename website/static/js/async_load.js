var q_by_type = queue()
    //.defer(d3.json, "data/fullAggregatedData.json")
    .defer(d3.json, "data/foodTypeRecipePerc.json")
    .defer(d3.json, "static/geojson/custom.geoold.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .defer(d3.json, 'data/metadata.json')
    .await(dashboard_by_type);

var q_by_ingredient = queue()
    .defer(d3.json, "data/IngredientRecipePerc.json")
    .defer(d3.json, "static/geojson/custom.geoold.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .defer(d3.json, 'data/metadata.json')
    .await(dashboard_by_ingredient);

var q_by_nutriment = queue()
    .defer(d3.json, "data/fullAggregatedData.json")
    .defer(d3.json, "static/geojson/custom.geoold.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .defer(d3.json, 'data/metadata.json')
    .await(dashboard_by_nutriment);

var defautColor = "#77b5ea";
//var defautColor = "#919191";
var defautColors = ['#DDDDDD', "#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"];
var colors20 = d3.scale.category20b();


function dashboard_by_type(error, init_data, geo_countries, geo_states, metadata) {

    var meta_key = metadata.food_type;

    var map_chart = dc.geoChoroplethChart("#map-chart1");
    var nb_recipes_chart = dc.numberDisplay("#total-recipes1");
    //var ready_in_chart = dc.numberDisplay("#ready_in1");
    var nutriment_chart = dc.rowChart("#resource-type-row-chart1");
    var top_countries_chart = dc.dataTable("#top_country_table1");
    var worst_countries_chart = dc.dataTable("#worst_country_table1");

    insert_graph(
        1,
        init_data,
        geo_countries,
        geo_states,
        meta_key,
        metadata,
        map_chart,
        nb_recipes_chart,
        //ready_in_chart,
        nutriment_chart,
        top_countries_chart,
        worst_countries_chart
    );
}

function dashboard_by_ingredient(error, init_data, geo_countries, geo_states, metadata) {

    var meta_key = metadata.ingredient;

    var map_chart = dc.geoChoroplethChart("#map-chart2");
    var nb_recipes_chart = dc.numberDisplay("#total-recipes2");
    //var ready_in_chart = dc.numberDisplay("#ready_in2");
    var nutriment_chart = dc.rowChart("#resource-type-row-chart2");
    var top_countries_chart = dc.dataTable("#top_country_table2");
    var worst_countries_chart = dc.dataTable("#worst_country_table2");

    insert_graph(
        2,
        init_data,
        geo_countries,
        geo_states,
        meta_key,
        metadata,
        map_chart,
        nb_recipes_chart,
        //ready_in_chart,
        nutriment_chart,
        top_countries_chart,
        worst_countries_chart
    );
}

function dashboard_by_nutriment(error, init_data, geo_countries, geo_states, metadata) {

    var meta_key = metadata.nutriment;

    var map_chart = dc.geoChoroplethChart("#map-chart3");
    var nb_recipes_chart = dc.numberDisplay("#total-recipes3");
    //var ready_in_chart = dc.numberDisplay("#ready_in3");
    var nutriment_chart = dc.rowChart("#resource-type-row-chart3");
    var top_countries_chart = dc.dataTable("#top_country_table3");
    var worst_countries_chart = dc.dataTable("#worst_country_table3");

    insert_graph(
        3,
        init_data,
        geo_countries,
        geo_states,
        meta_key,
        metadata,
        map_chart,
        nb_recipes_chart,
        //ready_in_chart,
        nutriment_chart,
        top_countries_chart,
        worst_countries_chart
    );
}

$(document).ready(function() {
    /* Listeners */
    $('#geo_selection1').on("change", function() {
        q_by_type.await(dashboard_by_type);
    });
    $('#geo_selection2').on("change", function() {
        q_by_ingredient.await(dashboard_by_ingredient);
    });
    $('#geo_selection3').on("change", function() {
        q_by_nutriment.await(dashboard_by_nutriment);
    });
});





$(window).resize(function() {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function() {
        console.log('Resized finished.');
        q_by_type.await(dashboard_by_type);
        q_by_ingredient.await(dashboard_by_ingredient);
        q_by_nutriment.await(dashboard_by_nutriment);
    }, 250);
});

function getGeoType(selector) {
    return d3.select('#geo_selection' + selector + ' input[type="radio"]:checked').property("value");
}

function getWidth(selector) {
    return $("#map_container" + selector).width();
}
