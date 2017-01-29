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
    var geo_metadata = null;

    var width_map = getWidth();
    var height_map = getWidth() / 1.5;
    var meta_key = metadata.nutriment;


    /* ===========================================================================
    Data mode selection
    =========================================================================== */
    if (geo_type === "country") {
        geo_map = geo_countries;
        data = init_data['per_country'];
        geo_metadata = metadata.country;
        projection = d3.geo.mercator().scale((width_map) / (2 * Math.PI)).translate([width_map / 2, height_map / 1.6]);
        map_bijection = function(d) {
            return d.properties.wb_a3;
        };
    } else if (geo_type === "state") {
        geo_map = geo_states;
        data = init_data['per_region'];
        geo_metadata = metadata.region;
        projection = d3.geo.albersUsa().scale(width_map).translate([width_map / 2, height_map / 2]);
        map_bijection = function(d) {
            return d.id;
        };
    }

    /* ===========================================================================
    Data dimension
    =========================================================================== */
    melt_data = melt(data, ['geo_identifier', 'geo_name', 'geo_country_in_base', 'nbRecipes', 'database_name'], 'key', 'value');

    var ndx = crossfilter(melt_data);
    var global = init_data.global['Global aggregation'];

    var geo_dim = ndx.dimension(function(d) {
        return d['geo_identifier'];
    });
    var nutriment_dim = ndx.dimension(function(d) {
        return d['key'];
    });

    var filter = 'avg_nutrition_calories_amount';

    var key_group = nutriment_dim.group().reduce(
        reduce_add_wavg(global),
        reduce_remove_wavg(global),
        reduce_init_wavg());

    var key_filtered_group = group_filtering(key_group, meta_key);


    var total_by_geo = geo_dim.group().reduce(
        reduce_add_geo(metadata, global),
        reduce_remove_geo(metadata, global),
        reduce_init_geo(metadata, global));
    total_by_geo.order(function(p) {
        return p.final.value;
    });

    var key_filtered_group = group_filtering(key_group, meta_key);


    var nb_recipes = geo_dim.groupAll().reduce(reduce_add_sum(), reduce_remove_sum(), reduce_init_sum());
    var avg_readyInMinutes = ndx.groupAll().reduce(reduce_add_avg('avg_readyInMinutes'), reduce_remove_avg('avg_readyInMinutes'), reduce_init_sum());


    //var total_max = total_by_geo.top(1)[0].value.avg;
    var total_max = 400;
    //console.log(total_by_geo.all())
    //console.log(geo_dim);

    //console.log(total_by_geo.size())

    /* ===========================================================================
    Charts
    =========================================================================== */
    var map_chart = dc.geoChoroplethChart("#map-chart");
    var nb_recipes_chart = dc.numberDisplay("#total-recipes");
    var ready_in_chart = dc.numberDisplay("#ready_in");
    var nutriment_chart = dc.rowChart("#resource-type-row-chart");
    var top_countries_chart = dc.dataTable("#top_country_table");

    var defautColors = ['#DDDDDD', "#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"];
    var defautColor = "#0089FF";
    var colors20 = d3.scale.category20b();

    console.log(map_chart)

    //console.log(nutriment_chart);


    nutriment_chart
        .width(width_map)
        .height(height_map)
        .elasticX(true)
        .dimension(nutriment_dim)
        .group(key_filtered_group)
        .addFilterHandler(function(filters, filter) {
            filters.length = 0; // empty the array
            filters.push(filter);
            return filters;
        })
        .valueAccessor(function(d) {
            return d.value.pourcentage;
        })
        .colors(function(d) {
            return colors20(meta_key[d].order)
        })
        .label(get_nutriment_name(meta_key))
        .xAxis()
        .tickFormat(function(v) {
            return 100 * v + '%';
        })
        .ticks(4);
    nutriment_chart.ordering(function(d) {
        return meta_key[d.key].order
    });


    nb_recipes_chart
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function(d) {
            return d.sum_value;
        })
        .group(total_by_geo)


    ready_in_chart.formatNumber(d3.format(".3s"))
        .valueAccessor(function(d) {
            return d.avg;
        })
        .group(avg_readyInMinutes)

    top_countries_chart.dimension(total_by_geo)
        .size(5)
        .group(function(d) {
            return ""
        })
        .columns([{
                label: 'Country',
                format: function(d) {
                    return geo_metadata[d.key].display_name;
                    //return d.key;
                }
            },
            {
                label: 'Value',
                format: function(d) {
                    var format = d3.format(".0%");
                    if (d.value.final.key == null) {
                        return d.value.final.value;
                    } else {
                        return format(d.value.final.value);
                    }
                }
            }
        ])
        .order(d3.descending);


    map_chart.width(width_map).height(height_map)
        .dimension(geo_dim)
        .group(total_by_geo)
        //.colorDomain([10, 50000])
        //.colorDomain([total_by_geo.top(Infinity)[[total_by_geo.size() - 1]].value.final.value, total_by_geo.top(1)[0].value.final.value])
        .colors(defautColors)
        //.colors(["#FFEDED", "#FFD5D5", "#FFBEBE", "#FFA6A6", "#FF8F8F", "#FF7777", "#FF6060", "#FF4848", "#FF3030", "#FF1919"])
        .valueAccessor(function(d) {
            if (d.value.final.key == null) {
                return 1;
            } else {
                return d.value.final.value;
            }
        })
        .overlayGeoJson(geo_map.features, geo_type, map_bijection)
        .projection(projection)
        .title(function(d) {

            if (typeof geo_metadata[d.key] == "undefined") {
                return "";
            } else {
                return geo_metadata[d.key].display_name;
            }
        });

    map_chart.on("preRender", function(chart) {

        key = total_by_geo.all()[0].value.final.key;
        if (key == null) {
            color = defautColor;
            chart.colors(create_range_color(color));
            chart.colorDomain([0, 1]);
        } else {
            color = colors20(meta_key[key].order)
            chart.colors(create_range_color(color));
            chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
        }

    });
    map_chart.on("preRedraw", function(chart) {

        key = total_by_geo.all()[0].value.final.key;
        if (key == null) {
            color = defautColor;
            chart.colors(create_range_color(color));
            chart.colorDomain([0, 1]);
        } else {
            color = colors20(meta_key[key].order)
            chart.colors(create_range_color(color));
            chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
        }
    });


    dc.renderAll();

};


/* Private function */
function getGeoType() {
    return d3.select('#geo_selection input[type="radio"]:checked').property("value");
}

function getWidth() {
    return $("#map_container").width();
}

function group_filtering(source_group, meta_key) {
    return {
        all: function() {
            return source_group.all().filter(function(d) {
                return meta_key[d.key].nutriment_chart == true;
            });
        }
    };
}

function get_nutriment_name(meta_key) {
    return function(d) {
        return meta_key[d.key].name;
    }
}

function create_range_color(color) {
    var c = [];
    color2 = d3.rgb(color)
    grey = (0.2125 * color2.r + 0.7154 * color2.g + 0.0721 * color2.b) / 3;
    var i = 0;
    grey = (0.2125 * color2.r + 0.7154 * color2.g + 0.0721 * color2.b) / 3;
    while (grey > 50 && i < 10) {
        //color2 = d3.rgb(color2).darker(1);
        color2.r -= 10;
        color2.g -= 10;
        color2.b -= 10;
        grey = (color2.r + color2.g + color2.b) / 3;
        i++;
    }
    range = d3.scale.linear().domain([1, 10])
        .range([d3.rgb("#DDDDDD"), d3.rgb(color2)]);

    for (i = 0; i < 10; i++) {
        c.push(range(i));
    }
    return c;
}
