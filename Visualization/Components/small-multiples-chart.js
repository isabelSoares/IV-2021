var small_multiples_svg
var xScaleSmallMultiples
var yScaleSmallMultiples
var timeSmallMultiplesScale
var numberModelsSmallMultiplesScale
var multiplesAxes
var dataset_multiples

function build_small_multiples(){
    small_multiples_svg = d3.select("#small_multiples_line_chart");
    var svg_width = parseInt(small_multiples_svg.style("width").slice(0, -2));
    var svg_height = parseInt(small_multiples_svg.style("height").slice(0, -2));

    const margins = {top: 35, right: 35, bottom: 15, left: 35}
    const subMargins = {top: 10, right: 15, bottom: 20, left: 15}
    const columns = 3
    const rows = 2

    multiplesAxes = [
        {Name: "Bluetooth", attribute: "Bluetooth"},
        {Name: "Fingerprint", attribute: "sensor_fingerprint"},
        {Name: "Radio", attribute: "Radio"},
        {Name: "Audio Jack", attribute: "Audio_jack"},
        {Name: "GPS", attribute: "GPS"},
        {Name: "Removable Battery", attribute: "battery_removable"}
    ]

    treatdatasetMultiples();

    small_multiples_svg.append("text")
        .attr("x", "50%")
        .attr("y", "10%")
        .attr("class", "text_module_title text_center")
        .text("The Number Of Models By Spec");

    var space = svg_width - margins.left - margins.right
    var stepX = space / columns
    var range = []
    for (var i = 0; i < columns; i ++) range.push(margins.left + i * stepX);
    xScaleSmallMultiples = d3.scaleOrdinal()
        .domain(multiplesAxes.map(datum => datum['Name']))
        .range(range);
    
    timeSmallMultiplesScale = d3.scaleUtc()
        .domain([start_date, end_date])
        .range([0, stepX - subMargins.left - subMargins.right]);
    
    timeSmallMultiplesAxis = d3.axisBottom()
        .scale(timeSmallMultiplesScale)
        .tickValues([start_date, end_date]);

    var space = svg_height - margins.top - margins.bottom
    var stepY = space / rows
    var range = []
    for (var i = 0; i < rows; i ++) range.push(margins.top + (i + 1) * stepY);
    yScaleSmallMultiples = d3.scaleOrdinal()
        .domain(multiplesAxes.map(datum => datum['Name']))
        .range(range);

    numberModelsSmallMultiplesScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, - (stepY - subMargins.top - subMargins.bottom)]);

    numberModelsSmallMultiplesAxis = d3.axisLeft()
        .scale(numberModelsSmallMultiplesScale)
        .tickValues([0, 20]);

    var smallMultiplesGroups = small_multiples_svg.selectAll("g.multiple")
        .data(multiplesAxes).enter()
        .append("g").classed("multiple", true);

    smallMultiplesGroups.append("g")
        .attr("transform", "translate(" + subMargins.left + "," + (- subMargins.bottom) + ")")
        .attr("class", "xaxis")
        .attr("id", (datum, index) => "xaxis_" + index)
        .call(timeSmallMultiplesAxis);

    smallMultiplesGroups.append("g")
        .attr("transform", "translate(" + subMargins.left + "," + (- subMargins.bottom) + ")")
        .attr("class", "yaxis")
        .attr("id", (datum, index) => "yaxis_" + index)
        .call(numberModelsSmallMultiplesAxis);

    smallMultiplesGroups.append("text")
        .attr("class", "text_module_title text_center")
        .attr("x", stepX / 2)
        .attr("y", - stepY * 0.90)
        .text(datum => datum['Name'])

    /*
    var groupPaths = smallMultiplesGroups.append("g").attr("class", "line_chart_paths");
    brands_list.forEach(function(brand, index) {
        groupPaths.append("path")
            .datum(dataset_multiples.filter(elem => elem['Brand'] == brand))
            .attr("id", "path_line_" + index)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => {console.log(new Date(datum['year'], 0, 1)); timeSmallMultiplesScale(new Date(datum['year'], 0, 1))})
                .y(datum => 0));
    });
    */

    smallMultiplesGroups.attr("transform", datum => "translate(" + (xScaleSmallMultiples(datum['Name'])) +
        ", " + (yScaleSmallMultiples(datum['Name'])) +")")
}

function treatMultiples() {
    multiplesAxes.forEach(function(axis) {
        axis['min'] = 0;
        axis['max'] = d3.max(datasetSmallMultiples, datum => Math.round(datum[axis['Name']] * 1.1));

        var scale = d3.scaleLinear()
            .domain([0, axis['max']])
            .range(range);
        axis['scale'] = scale;
    });

    console.log(multiplesAxes);
}

function treatdatasetMultiples() {
    dataset_multiples = []
    dataset_models.forEach(function(dataline) {
        var item = dataset_multiples.find(elem => elem['Brand'] == dataline['Brand'] && elem['year'] == dataline['year']);

        if (item == undefined) {
            item = {'Brand': dataline['Brand'], 'year': dataline['year']}
            multiplesAxes.forEach(axis => item[axis['Name']] = 0);
            dataset_multiples.push(item);
        }

        multiplesAxes.forEach(axis => item[axis['Name']] += dataline[axis['attribute']]);
    });

    console.log("Small Multiples: ", dataset_multiples);
}