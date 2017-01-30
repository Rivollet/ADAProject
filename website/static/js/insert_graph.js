function insert_graph(
    selector,
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
    worst_countries_chart) {

    /* =========================================================================
    Initialize
    ========================================================================= */
    var geo_type = getGeoType(selector);
    var geo_map = null;
    var projection = null;
    var map_bijection = null;
    var geo_metadata = null;

    var width_map = getWidth(selector);
    var height_map = width_map / 1.6;

    /* =========================================================================
    Data mode selection
    ========================================================================= */
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

    var global = null;
    if (typeof init_data.global != "undefined") {
        global = init_data.global['Global aggregation'];
    }

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
        reduce_add_geo(meta_key, global),
        reduce_remove_geo(meta_key, global),
        reduce_init_geo(meta_key, global));
    total_by_geo.order(function(p) {
        return p.final.value;
    });

    var inv_total_by_geo = geo_dim.group().reduce(
        reduce_add_geo(meta_key, global),
        reduce_remove_geo(meta_key, global),
        reduce_init_geo(meta_key, global));
    inv_total_by_geo.order(function(p) {
        return -p.final.value;
    });

    var nb_recipes = nutriment_dim.group().reduceSum(function(d) {
        //console.log(d);
        return d.nbRecipes;
    })
    //var avg_readyInMinutes = ndx.groupAll().reduce(reduce_add_avg('avg_readyInMinutes'), reduce_remove_avg('avg_readyInMinutes'), reduce_init_sum());

    /* CHART 1 ============================================================== */
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
        .label(function(d) {
            return meta_key[d.key].name;
        })
        .xAxis()
        .tickFormat(function(v) {
            return 100 * v + '%';
        })
        .ticks(4);
    nutriment_chart.ordering(function(d) {
        return meta_key[d.key].order
    });

    /* CHART 2 ============================================================== */
    top_countries_chart.dimension(total_by_geo)
        .size(5)
        .group(function(d) {
            return ""
        })
        .columns([{
                label: 'Country',
                format: function(d) {
                    return geo_metadata[d.key].display_name;
                }
            },
            {
                label: 'Value',
                format: function(d) {
                    var format = d3.format(".0%");
                    if (d.value.final.key == null) {
                        return d.value.final.value + " recipes";
                    } else {
                        return format(d.value.final.value);
                    }
                }
            }
        ])
        .order(d3.descending);

    /* CHART 3 ============================================================== */
    worst_countries_chart.dimension(inv_total_by_geo)
        .size(5)
        .group(function(d) {
            return ""
        })
        .columns([{
                label: capitalizeFirstLetter(geo_type),
                format: function(d) {
                    return geo_metadata[d.key].display_name;
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

    /* CHART 4 ============================================================== */
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

    /* CHART 5 ============================================================== */
    nb_recipes_chart
        .dimension(nutriment_dim)
        .formatNumber(d3.format(".3s"))
        .group(nb_recipes);

    dc.renderAll();

};

/* Private function */

function group_filtering(source_group, meta_key) {
    return {
        all: function() {
            return source_group.all().filter(function(d) {
                return meta_key[d.key].nutriment_chart == true;
            });
        }
    };
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
