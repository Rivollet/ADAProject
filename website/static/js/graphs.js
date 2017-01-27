var q = queue()
    .defer(d3.json, "data/fullAggregatedData.json")
    .defer(d3.json, "static/geojson/custom.geoold.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .defer(d3.json, 'data/metadata.json')
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
function makeGraphs(error, init_data, geo_countries, geo_states, metadata) {

    /* ===========================================================================
    Initialize
    =========================================================================== */
    var geo_type = getGeoType();
    var geo_map = null;
    var projection = null;
    var map_bijection = null;

    var width_map = getWidth();
    var height_map = getWidth() / 1.5;


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
        data = init_data['per_region'];
        projection = d3.geo.albersUsa().scale(width_map).translate([width_map / 2, height_map / 2]);
        map_bijection = function(d) {
            return d.id;
        };
    }

    /* ===========================================================================
    Data dimension
    =========================================================================== */
    melt_data = melt(data, ['geo_identifier', 'geo_name', 'geo_country_in_base', 'nbRecipes', 'database_name'], 'key', 'value');
    //console.log(melt_data);
    //var ndx = crossfilter(data);
    var ndx = crossfilter(melt_data);
    var global = init_data.global['Global aggregation'];

    var geo_dim = ndx.dimension(function(d) {
        return d['geo_identifier'];
    });
    var nutriment_dim = ndx.dimension(function(d) {
        return d['key'];
    });
    //nutriment_dim.filterFunction(nutriment_filter_dim(metadata));
    var filter = 'avg_nutrition_calories_amount';

    /*var key_group = nutriment_dim.group().reduceSum(function(d) {
        return d['value'];
    });*/
    var key_group = nutriment_dim.group().reduce(
        reduce_add_wavg(global),
        reduce_remove_wavg(global),
        reduce_init_wavg());

    var key_filtered_group = group_filtering(key_group, metadata);
    //console.log(key_group.all());
    var total_by_geo = geo_dim.group().reduce(
        reduceAddWeightedAvg(filter, 'nbRecipes'),
        reduceRemoveWeightedAvg(filter, 'nbRecipes'),
        reduceInitWeightedAvg()).order(function(d) {
        //console.log(d)
        return d.avg;
    });

    //var key_filtered_group = group_filtering(key_group, metadata);
    //console.log(key_filtered_group);


    var nb_recipes = ndx.groupAll().reduce(reduce_add_sum(), reduce_remove_sum(), reduce_init_sum());
    var avg_readyInMinutes = ndx.groupAll().reduce(reduce_add_avg('avg_readyInMinutes'), reduce_remove_avg('avg_readyInMinutes'), reduce_init_sum());

    var total_max = total_by_geo.top(1)[0].value.avg;

    /* ===========================================================================
    Charts
    =========================================================================== */
    var mapChart = dc.geoChoroplethChart("#us-chart");
    var totalRecipes = dc.numberDisplay("#total-recipes");
    var readyIn = dc.numberDisplay("#ready_in");
    var nutriment = dc.rowChart("#resource-type-row-chart");

    nutriment
        .width(width_map)
        .height(height_map)
        .elasticX(true)
        .dimension(nutriment_dim)
        .group(key_filtered_group)
        .valueAccessor(function(d) {
            return d.value.pourcentage;
        })
        .label(get_nutriment_name(metadata))
        .xAxis()
        .tickFormat(function(v) {
            return 100 * v + '%';
        })
        .ticks(4);

    totalRecipes
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function(d) {
            return d.sum_value;
        })
        .group(nb_recipes)

    readyIn.formatNumber(d3.format(".3s"))
        .valueAccessor(function(d) {
            return d.avg;
        })
        .group(avg_readyInMinutes)

    mapChart.width(width_map).height(height_map)
        .dimension(geo_dim)
        .group(total_by_geo)
        .colors(['#DDDDDD', "#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        //.colors(["#FFEDED", "#FFD5D5", "#FFBEBE", "#FFA6A6", "#FF8F8F", "#FF7777", "#FF6060", "#FF4848", "#FF3030", "#FF1919"])
        .colorDomain([0, total_max])
        .valueAccessor(function(d) {
            return d.value.avg;
        })
        .overlayGeoJson(geo_map["features"], geo_type, map_bijection)
        .projection(projection);

    dc.renderAll();

};


/* Private function */
function getGeoType() {
    return d3.select('#geo_selection input[type="radio"]:checked').property("value");
}

function getWidth() {
    return $("#map_container").width();
}

function group_filtering(source_group, metadata) {
    return {
        all: function() {
            return source_group.all().filter(function(d) {
                return metadata.nutriment[d.key].nutriment_chart == true;
            });
        }
    };
}

function get_nutriment_name(metadata) {
    return function(d) {
        return metadata.nutriment[d.key].name;
    }
}
