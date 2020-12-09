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
        .domain([0, 150])
        .range([0, - (stepY - subMargins.top - subMargins.bottom)]);

    numberModelsSmallMultiplesAxis = d3.axisLeft()
        .scale(numberModelsSmallMultiplesScale)
        .tickValues([0, 150]);

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

    var groupPaths = smallMultiplesGroups.append("g").attr("class", "line_chart_paths")
        .attr("id", datum => "paths_" + datum['attribute'])
        .on("mousemove", (event, datum, index) => hover_brand_small_multiples_chart(event, datum))
        .on("mouseout", (event, datum) => hover_brand_remove_small_multiples_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));
    
    brands_list.forEach(function(brand, index) {
        groupPaths.append("path")
            .datum(datum => treatDatasetPath(brand, datum))
            .attr("id", "path_line_" + index)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => timeSmallMultiplesScale(new Date(datum['year'], 0, 1)) + subMargins.left)
                .y(datum => numberModelsSmallMultiplesScale(datum['value']) - subMargins.bottom));
    });

    smallMultiplesGroups.attr("transform", datum => "translate(" + (xScaleSmallMultiples(datum['Name'])) +
        ", " + (yScaleSmallMultiples(datum['Name'])) +")")
}

function treatDatasetPath(brand, axis) {
    var treated = []
    dataset_multiples.filter(elem => elem['Brand'] == brand)
        .forEach(elem => treated.push({Brand: elem['Brand'], year: elem['year'], value: elem[axis['Name']]}));

    //console.log(treated)
    return treated;
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

    //console.log(multiplesAxes);
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

function updateSmallMultiplesChart() {
    var svg_width = parseInt(small_multiples_svg.style("width").slice(0, -2));
    var svg_height = parseInt(small_multiples_svg.style("height").slice(0, -2));
    const margins = {top: 35, right: 35, bottom: 15, left: 35}
    const subMargins = {top: 10, right: 15, bottom: 20, left: 15}

    treatdatasetMultiples();

    timeSmallMultiplesScale.domain([start_date, end_date]);
    small_multiples_svg.selectAll(".xaxis")
        .call(d3.axisBottom(timeSmallMultiplesScale));
    
    /* TODO: UPDATE YAXIS SCALE */
    
    var groupPaths = small_multiples_svg.selectAll("g.multiple").select("g.line_chart_paths");
    brands_list.forEach(function(brand, index) {
        groupPaths.select("path#path_line_" + index)
            .datum(datum => treatDatasetPath(brand, datum))
            .attr("d", d3.line()
                .x(datum => timeSmallMultiplesScale(new Date(datum['year'], 0, 1)) + subMargins.left)
                .y(datum => numberModelsSmallMultiplesScale(datum['value']) - subMargins.bottom));
    });
}

function brandUpdateColorSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    small_multiples_svg.selectAll("#path_line_" + index)
        .transition().duration(1000)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");

    if (selected) {
        small_multiples_svg.selectAll("#path_line_" + index).raise();
    }
}

function highlightSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
        
    small_multiples_svg.selectAll("#path_line_" + index)
        .attr("stroke-width", 3)
        .attr("stroke", (selected) ? getColorBrand(brand) : "black");   
}

function remove_highlight_lineSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    small_multiples_svg.selectAll("#path_line_" + index)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");   
}

function getClosestPathSmallMultiplesChart(event, small_multiple, max_distance = 100) {
    var paths;
    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    paths = small_multiples_svg.select(".line_chart_paths#paths_" + small_multiple['attribute']).selectAll("path");
    
    var min_path = undefined;
    var min_distance = undefined;
    paths.each(function(datum, index) {
        var distance = getDistanceToPath(this, x, y, 20)
        if ((min_distance == undefined || min_distance >= distance) && distance <= max_distance && distance != undefined) {
            min_distance = distance;
            min_path = this;
        }
    });
    return min_path;
}

function hover_brand_small_multiples_chart(event, element){
    var newCloseToBrand
    var path = getClosestPathSmallMultiplesChart(event, element, 50);

    if (path != undefined) {
        const index = parseInt(d3.select(path).attr("id").split("_")[2]);
        newCloseToBrand = brands_list[index];
    } else newCloseToBrand = undefined

    if (closeToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_remove_brand", this, closeToBrand)
    }

    if (newCloseToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_brand", this, event, undefined, newCloseToBrand);
    }

    closeToBrand = newCloseToBrand;
}

function hover_brand_remove_small_multiples_chart() {
    dispatch.call("hover_remove_brand", this, closeToBrand)
    closeToBrand = undefined;
}