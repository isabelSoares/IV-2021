var small_multiples_svg
var xScaleSmallMultiples
var yScaleSmallMultiples
var timeSmallMultiplesScale
var numberModelsSmallMultiplesScale
var dataset_multiples

var selectedAxis = undefined
var multiplesAxes = [
    {Name: "Bluetooth", attribute: "Bluetooth"},
    {Name: "Fingerprint", attribute: "sensor_fingerprint"},
    {Name: "Radio", attribute: "Radio"},
    {Name: "Audio Jack", attribute: "Audio_jack"},
    {Name: "GPS", attribute: "GPS"},
    {Name: "Removable Battery", attribute: "battery_removable"}
]

function build_small_multiples() {
    small_multiples_svg = d3.select("#small_multiples_line_chart");
    var svg_width = parseInt(small_multiples_svg.style("width").slice(0, -2));
    var svg_height = parseInt(small_multiples_svg.style("height").slice(0, -2));

    const margins = {top: 0.12 * svg_height, right: 0.03 * svg_width, bottom: 0.06 * svg_height, left: 0.04 * svg_width}
    const subMargins = {top: 0.04 * svg_height, right: 0.015 * svg_width, bottom: 0.06 * svg_height, left: 0.015 * svg_width}
    const columns = 3
    const rows = 2

    treatdatasetMultiples();

    small_multiples_svg.append("text")
        .attr("x", "50%")
        .attr("y", "7%")
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
        .range([subMargins.left, stepX - subMargins.right - subMargins.left]);
    
    timeSmallMultiplesAxis = d3.axisBottom()
        .scale(timeSmallMultiplesScale)
        .tickValues([start_date, end_date])
        .tickFormat(d3.timeFormat("%Y"));

    var space = svg_height - margins.top - margins.bottom
    var stepY = space / rows
    var range = []
    for (var i = 0; i < rows; i ++) range.push(margins.top + (i + 1) * stepY);
    yScaleSmallMultiples = d3.scaleOrdinal()
        .domain(multiplesAxes.map(datum => datum['Name']))
        .range(range);

    var max = 0
    dataset_multiples.forEach(function(data) {
        multiplesAxes.forEach(function(axis) {
            if (max < data[axis['attribute']])
                max = data[axis['attribute']];
        })
    })
    max = Math.ceil(max / 10) * 10;
    numberModelsSmallMultiplesScale = d3.scaleLinear()
        .domain([0, max])
        .range([- subMargins.bottom, - (stepY - subMargins.top) + subMargins.bottom]);
    numberModelsSmallMultiplesAxis = d3.axisLeft()
        .scale(numberModelsSmallMultiplesScale)
        .tickValues([0, max]);

    var smallMultiplesGroups = small_multiples_svg.selectAll("g.multiple")
        .data(multiplesAxes).enter()
        .append("g").classed("multiple", true);

    const tickWidth = 50;
    const tickHeight = 20;
    var group_tick = smallMultiplesGroups.append("g").classed("value_tick hidden", true);
    group_tick.append("rect")
        .attr("width", tickWidth)
        .attr("height", tickHeight)
        .attr("x", - tickWidth / 2)
        .attr("y", - tickHeight / 2)
        .attr("rx", 5)
        .attr("ry", 5);
    group_tick.append("text")
        .classed("text_axis_ticks text_center", true)
        .attr("x", 0)
        .attr("y", 0)
        .attr("font_weight", "bold")
        .attr("dominant-baseline", "middle")
        .text(0);

    var axis = smallMultiplesGroups.append("g")
        .attr("transform", "translate(0," + (- subMargins.bottom) + ")")
        .attr("class", "xaxis")
        .attr("id", (datum, index) => "xaxis_" + index)
        .call(timeSmallMultiplesAxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks");

    var axis = smallMultiplesGroups.append("g")
        .attr("transform", "translate(" + subMargins.left + ",0)")
        .attr("class", "yaxis")
        .attr("id", (datum, index) => "yaxis_" + index)
        .call(numberModelsSmallMultiplesAxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks text_left");

    smallMultiplesGroups.append("text")
        .attr("class", "text_axis_title text_center")
        .attr("x", stepX / 2)
        .attr("y", - stepY * 0.90)
        .text(datum => datum['Name'])
        .on("mouseenter", (event, datum) => d3.select(event.target).classed("bold_on_hover", true))
        .on("click", (event, datum) => dispatch.call("clicked_attribute", this, datum));

    var groupPaths = smallMultiplesGroups.append("g").attr("class", "line_chart_paths")
        .attr("id", datum => "paths_" + datum['attribute'])
        .on("mousemove", (event, datum) => hover_brand_small_multiples_chart(event, datum))
        .on("mouseout", (event, datum) => hover_brand_remove_small_multiples_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    createHoverCircleSmallMultiples(groupPaths);
    groupPaths.append("rect")
        .classed("hover-region hidden", true)
        .attr("x", subMargins.left)
        .attr("y", - subMargins.bottom - (stepY - subMargins.top - subMargins.bottom))
        .attr("width", stepX - subMargins.left - subMargins.right)
        .attr("height", stepY - subMargins.top - subMargins.bottom);
    
    brands_list.forEach(function(brand, index) {
        groupPaths.append("path")
            .datum(datum => treatDatasetPath(brand, datum))
            .attr("id", "path_line_" + index)
            .classed("brand_line", true)
            .attr("d", d3.line()
                .x(datum => timeSmallMultiplesScale(new Date(datum['year'], 0, 1)))
                .y(datum => numberModelsSmallMultiplesScale(datum['value'])));
    });

    smallMultiplesGroups.attr("transform", datum => "translate(" + (xScaleSmallMultiples(datum['Name'])) +
        ", " + (yScaleSmallMultiples(datum['Name'])) +")")
}

function treatDatasetPath(brand, axis) {
    var treated = []
    dataset_multiples.filter(elem => elem['Brand'] == brand)
        .forEach(elem => treated.push({Brand: elem['Brand'], year: elem['year'], value: elem[axis['Name']]}));

    // console.log(treated)
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

    // console.log(multiplesAxes);
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

    // console.log("Small Multiples: ", dataset_multiples);
}

function updateSmallMultiplesChart() {
    treatdatasetMultiples();

    var max = 0
    dataset_multiples.forEach(function(data) {
        multiplesAxes.forEach(function(axis) {
            if (max < data[axis['attribute']])
                max = data[axis['attribute']];
        })
    })
    max = Math.ceil(max / 10) * 10;
    numberModelsSmallMultiplesScale.domain([0, max]);
    numberModelsSmallMultiplesAxis = d3.axisLeft()
        .scale(numberModelsSmallMultiplesScale)
        .tickValues([0, max]);
    var axis = small_multiples_svg.selectAll(".yaxis")
        .call(numberModelsSmallMultiplesAxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks text_left");

    timeSmallMultiplesScale.domain([start_date, end_date]);
    timeSmallMultiplesAxis = d3.axisBottom()
        .scale(timeSmallMultiplesScale)
        .tickValues([start_date, end_date])
        .tickFormat(d3.timeFormat("%Y"));
    var axis = small_multiples_svg.selectAll(".xaxis")
        .call(timeSmallMultiplesAxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks");
    
    /* TODO: UPDATE YAXIS SCALE */
    
    var groupPaths = small_multiples_svg.selectAll("g.multiple").select("g.line_chart_paths");
    brands_list.forEach(function(brand, index) {
        groupPaths.select("path#path_line_" + index)
            .datum(datum => treatDatasetPath(brand, datum))
            .attr("d", d3.line()
                .x(datum => timeSmallMultiplesScale(new Date(datum['year'], 0, 1)))
                .y(datum => numberModelsSmallMultiplesScale(datum['value'])));
    });
}

function brandUpdateColorSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    var line = small_multiples_svg.selectAll("#path_line_" + index);
    line.classed("selected", selected);
    line.attr("stroke", (selected) ? getColorBrand(brand) : "darkgrey");

    if (selected) {
        small_multiples_svg.selectAll("#path_line_" + index).raise();
    }
}

function highlightSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
        
    small_multiples_svg.selectAll("#path_line_" + index)
        .classed("hover", true)
        .raise(); 
}

function remove_highlight_lineSmallMultiples(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    
    small_multiples_svg.selectAll("#path_line_" + index)
        .classed("hover", false);   
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
    var small_multiple = multiplesAxes.findIndex(elem => elem == element);
    var newCloseToBrand
    var path = getClosestPathSmallMultiplesChart(event, element, 50);

    if (path != undefined) {
        const index = parseInt(d3.select(path).attr("id").split("_")[2]);
        newCloseToBrand = brands_list[index];
    } else newCloseToBrand = undefined

    if (closeToBrand != undefined || newCloseToBrand != closeToBrand) {
        dispatch.call("hover_remove_brand", this, closeToBrand)
    }

    if (newCloseToBrand != undefined) {
        dispatch.call("hover_brand", this, event, small_multiple + 3, newCloseToBrand);
    }

    closeToBrand = newCloseToBrand;
}

function hover_brand_remove_small_multiples_chart() {
    dispatch.call("hover_remove_brand", this, closeToBrand)
    closeToBrand = undefined;
}

function selectAttribute(information) {
    var element = small_multiples_svg.selectAll("g.multiple")
        .filter(datum => datum == information)
        .classed("selected", true);

    selectedAxis = information;
}

function unselectAttribute() {
    var element = small_multiples_svg.selectAll("g.multiple")
        .filter(datum => datum == selectedAxis)
        .classed("selected", false);

    selectedAxis = undefined;
}

function showValues(information) {
    const svg_width = parseInt(small_multiples_svg.style("width").slice(0, -2))
    const distanceTooltip = 0.025 * svg_width;

    var ticks = small_multiples_svg.selectAll("g.value_tick");
    ticks.classed("hidden", false);

    ticks.selectAll("text").text(datum => Math.round(information[datum['Name']]));
    small_multiples_svg.selectAll(".multiple").each(function() {
        var multiple = d3.select(this);
        const box_multiple = multiple.node().getBBox();

        var circle = multiple.select(".hover_circle");
        var tick = multiple.select("g.value_tick");
        var text = tick.select("text");
        var text_width = text.node().getComputedTextLength();
        const rect_width = text_width + 0.015 * svg_width;
        
        tick.select("rect")
            .attr("width", rect_width)
            .attr("x", - rect_width / 2);

        var pos = {x: parseFloat(circle.attr("cx")), y: parseFloat(circle.attr("cy"))}
        
        const box = tick.node().getBBox();
        var new_y = pos.y - distanceTooltip;
        var new_x = pos.x - distanceTooltip;
        if (new_x < box_multiple.width / 2) new_x = pos.x + distanceTooltip;

        tick.attr("transform", "translate(" + new_x + "," + new_y + ")");
        tick.raise();
    });
}

function hideValues() {
    var ticks = small_multiples_svg.selectAll("g.value_tick")
        .classed("hidden", true);
}

function createHoverCircleSmallMultiples(element) {
    element.append("circle")
        .attr("class", "hover_circle hidden")
        .attr("r", 4);
}

function filterBrandsSmallMultiples() {
    var paths = small_multiples_svg.selectAll("path.brand_line");
    var unselectedBrands = brands_list.filter(brand => !selected_brands.includes(brand));
    var unfilteredBrands = brands_list.filter(brand => !filteredBrands.includes(brand));

    // UPDATE NOT FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (filteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem != undefined && elem[0] != undefined && elem[0]['Brand'] == brand);
        path.classed("filtered", true).raise();
    });
    
    // UPDATE FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (unfilteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem != undefined && elem[0] != undefined && elem[0]['Brand'] == brand);
        path.classed("filtered", false).raise();
    });

    // UPDATE SELECTED BRANDS
    selected_brands.forEach(function(brand) {
        var path = paths.filter(elem => elem != undefined && elem[0] != undefined && elem[0]['Brand'] == brand);
        path.classed("filtered", false).raise();
    });
}