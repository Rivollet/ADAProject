var q = queue()
    .defer(d3.json, "data/data_mock.json")
    .defer(d3.json, "static/geojson/countries.json")
    .defer(d3.json, "static/geojson/us-states.json")
    .await(makeGraphs);

/* Listeners */
d3.select('#geo_selection').on("change", function() {
  q.await(makeGraphs);
});

$(window).resize(function() {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function(){
        console.log('Resized finished.');
        q.await(makeGraphs);
    }, 250);
});

/* Charts */
function makeGraphs(error, data, geo_countries, geo_states) {

  var geo_type = getGeoType();
  var geo_map = null;
  var projection = null

  var width_map = getWidth();
  var height_map = getWidth() / 1.8;


  if (geo_type === "country") {
    geo_map = geo_countries;
    projection = d3.geo.mercator().scale((width_map) / (2 * Math.PI)).translate([width_map / 2, height_map / 2]);
  }
  else if (geo_type === "state") {
    geo_map = geo_states;
    projection = d3.geo.albersUsa().scale(width_map).translate([width_map / 2, height_map / 2]);
  }

  var ndx = crossfilter(data);

  var stateDim = ndx.dimension(function(d) { return d['geo']; });
  console.log(stateDim);
  var totalAmountByState = stateDim.group().reduceSum(function(d) {
		return d["calories"];
	});

  var total = ndx.groupAll().reduceSum(function(d) {return d["calories"];});

  var max_state = totalAmountByState.top(1)[0].value;
  console.log(ndx.size())


  var usChart = dc.geoChoroplethChart("#us-chart");
  var totalDonationsND = dc.numberDisplay("#total-donations-nd");

  totalDonationsND
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d){return d; })
    .group(total)
    .formatNumber(d3.format(".3s"));

  usChart.width(width_map).height(height_map)
    .dimension(stateDim)
    .group(totalAmountByState)
    .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
    .colorDomain([0, max_state])
    .overlayGeoJson(geo_map["features"], geo_type, function (d) {
        return d.properties.name;
    })
    .projection(projection)
    .title(function (p) {
        return "State: " + p["key"]
                + "\n"
                + "Total: " + Math.round(p["value"]) + " $";
    })

    dc.renderAll();

};


function updateData() {
  console.log("test")
}

/* Private function */
function getGeoType() {
  return d3.select('#geo_selection input[type="radio"]:checked').property("value");
}

function getWidth() {
  return $("#map_container").width();
}
