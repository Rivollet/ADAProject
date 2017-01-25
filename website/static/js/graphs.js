var q = queue()
    .defer(d3.json, "data/fullAggregatedData.json")
    .defer(d3.json, "static/geojson/custom.geo.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .await(makeGraphs);

/* Listeners */
d3.select('#geo_selection').on("change", function() {
    q.await(makeGraphs);
});

$(window).resize(function() {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function() {
        console.log('Resized finished.');
        q.await(makeGraphs);
    }, 250);
});

/* Charts */
function makeGraphs(error, init_data, geo_countries, geo_states) {

    /* ===========================================================================
    Initialize
    =========================================================================== */
    var geo_type = getGeoType();
    var geo_map = null;
    var projection = null;
    var map_bijection = null;

    var width_map = getWidth();
    var height_map = getWidth() / 1.8;


    /* ===========================================================================
    Data mode selection
    =========================================================================== */
    if (geo_type === "country") {
        geo_map = geo_countries;
        data = init_data['per_country'];
        projection = d3.geo.mercator().scale((width_map) / (2 * Math.PI)).translate([width_map / 2, height_map / 2]);
        map_bijection = function(d) {
            return d.properties.wb_a3;
        };
    } else if (geo_type === "state") {
        geo_map = geo_states;
        data = init_data['per_state'];
        projection = d3.geo.albersUsa().scale(width_map).translate([width_map / 2, height_map / 2]);
        map_bijection = function(d) {
            return d.properties.name;
        };
    }

    /* ===========================================================================
    Data dimension
    =========================================================================== */
    melt_data = melt(data, ['geo_identifier', 'geo_name', 'geo_country_in_base', 'nbRecipes', 'database_name'], 'key', 'value');
    //console.log(melt_data);
    //var ndx = crossfilter(data);
    var ndx = crossfilter(melt_data);

    var geo_dim = ndx.dimension(function(d) {
        return d['geo_identifier'];
    });
    var key_dim = ndx.dimension(function(d) {
        return d['key'];
    });

    var filter = 'avg_nutrition_calories_amount';

    var key_group = key_dim.group().reduceSum(function(d) {
        //console.log(d);
        return d['value'];
    });
    var total_by_geo = geo_dim.group().reduce(
        reduceAddWeightedAvg2(filter, 'nbRecipes'),
        reduceRemoveWeightedAvg2(filter, 'nbRecipes'),
        reduceInitWeightedAvg2).order(function(d) {
        //console.log(d)
        return d.avg;
    });

    //console.log(totalAmountByState.all());
    //console.log(key_group.all());


    var avg_calories = ndx.groupAll().reduce(
        reduceAddWeightedAvg('avg_nutrition_calories_amount', 'nbRecipes'),
        reduceRemoveWeightedAvg('avg_nutrition_calories_amount', 'nbRecipes'),
        reduceInitWeightedAvg);

    var total_max = total_by_geo.top(1)[0].value.avg;
    //var total_min = total_by_geo.bottom(1)[0].value.avg;
    //console.log(total_max);

    /* ===========================================================================
    Charts
    =========================================================================== */
    var usChart = dc.geoChoroplethChart("#us-chart");
    var totalCalories = dc.numberDisplay("#total-donations-nd");
    var nutriment = dc.rowChart("#resource-type-row-chart");

    nutriment
        .width(width_map)
        .height(height_map)
        .dimension(key_dim)
        .group(key_group)
        .xAxis().ticks(4);

    totalCalories
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d) {
            return d.avg;
        })
        .group(avg_calories)
        .formatNumber(d3.format(".3s"));

    usChart.width(width_map).height(height_map)
        .dimension(geo_dim)
        .group(total_by_geo)
        .colors(['#DDDDDD', "#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        //.colors(["#FFEDED", "#FFD5D5", "#FFBEBE", "#FFA6A6", "#FF8F8F", "#FF7777", "#FF6060", "#FF4848", "#FF3030", "#FF1919"])
        .colorDomain([0, total_max])
        .colorAccessor(function(d, i) {
            console.log(d);
            console.log(i);
            return d;
        })
        .valueAccessor(function(d) {
            return d.value.avg;
        })
        .overlayGeoJson(geo_map["features"], geo_type, map_bijection)
        .projection(projection)
        .title(function(p) {
            return "State: " + p["key"] +
                "\n" +
                "Total: " + Math.round(p["value"]) + " $";
        })

    dc.renderAll();

};


/* Private function */
function getGeoType() {
    return d3.select('#geo_selection input[type="radio"]:checked').property("value");
}

function getWidth() {
    return $("#map_container").width();
}
