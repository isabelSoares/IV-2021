var line_chart_1_svg
var line_chart_2_svg

var xscaleData
var xscale
var xscaleDataFiltered
var xaxis

var hscale_models
var yaxis_models
var hscale_sales
var yaxis_sales

function build_line_charts() {
    line_chart_1_svg = d3.select("svg#line_chart1").classed("line_chart", true);
    line_chart_2_svg = d3.select("svg#line_chart2").classed("line_chart", true);

    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));
    const margins = {top: 0.12 * svg_height, right: 0.06 * svg_width, bottom: 0.15 * svg_height, left: 0.11 * svg_width};

    xscale = d3.scaleUtc()
        .domain([start_date, end_date])
        .range([margins.left, svg_width - margins.right]);

    xaxis = d3.axisBottom()
        .scale(xscale)
        .tickSizeOuter(0)
        .tickValues(computeTimeAxisTicksLineChart())
        .tickFormat(d3.timeFormat("%Y"));

    build_line_chart_1();
    build_line_chart_2();
    createTooltipLineChart();
}

function build_line_chart_1(){
    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));
    const margins = {top: 0.12 * svg_height, right: 0.06 * svg_width, bottom: 0.15 * svg_height, left: 0.11 * svg_width};

    createSpiralHoverRegion(line_chart_1_svg);

    hscale_models = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['# Models'];
            }),
        ])
        .range([svg_height - margins.bottom, margins.top]);

    var g = line_chart_1_svg.append("g").attr("class", "hover-region line_chart_paths");
    g.append("rect")
        .classed("hover-region hidden", true)
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", svg_width - margins.left - margins.right)
        .attr("height", svg_height - margins.top - margins.bottom);
    brands_list.forEach(function(brand, index) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("id", "path_line_1_" + index)
            .classed("brand_line", true)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_models(datum['# Models'])))
    });

    createHoverCircle(g);
    g.on("mousemove", (event, datum) => hover_brand_line_chart(event, 1))
        .on("mouseout", (event, datum) => hover_remove_brand_line_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    treatdatasetMultiples();
    var g = line_chart_1_svg.append("g").attr("class", "line_chart_dotted_paths");
    brands_list.forEach(function(brand, index) {
        var invisible = !selected_brands.includes(brand) || selectedAxis == undefined;
        g.append("path")
            .datum(function() {
                var hasAxisSelected = (selectedAxis != undefined)
                var value = []
                if (selected_brands.includes(brand) && hasAxisSelected)
                    value = treatDatasetPath(brand, selectedAxis);

                //console.log("Value: ", value);
                return value;
            }, datum => datum['Brand'])
            .attr("id", "path_line_1_temp_" + index)
            .attr("class", "brand_line dotted")
            .classed("selected", selected_brands.includes(brand))
            .classed("hidden", invisible)
            .attr("stroke", invisible ? "none" : getColorBrand(brand))
            .attr("d", d3.line()
                .x(datum => xscale(new Date(datum['year'], 0, 1)))
                .y(datum => hscale_models(datum['value'])))
    });

    yaxis_models = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale_models) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    var axis = line_chart_1_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + margins.left + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .attr("id", "yaxis_1")
        .call(yaxis_models);
    axis.selectAll(".tick").selectAll("text")
        .attr("class", "text_axis_ticks text_left");

    line_chart_1_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0.01 * svg_width)
        .attr("x", - svg_height / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("class", "text_axis_title")
        .text("Models Developed");
        
    var axis = line_chart_1_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - margins.bottom) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_1")
        .call(xaxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks");
    
      // text label for the x axis
    line_chart_1_svg.append("text")
        .attr("transform", "translate(" +  (margins.left + (svg_width - margins.left - margins.right) / 2) + " ," + (svg_height - 0.2 * margins.bottom) + ")")
        .attr("class", "text_axis_title")
        .text("Year"); 
    
    createLegend(line_chart_1_svg);
}

function build_line_chart_2(){
    var svg_width = parseInt(line_chart_2_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_2_svg.style("height").slice(0, -2));
    const margins = {top: 0.12 * svg_height, right: 0.06 * svg_width, bottom: 0.15 * svg_height, left: 0.11 * svg_width};

    createSpiralHoverRegion(line_chart_2_svg);

    hscale_sales = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['Sales'];
            }),
        ])
        .range([svg_height - margins.bottom, margins.top]);

    var g = line_chart_2_svg.append("g").attr("class", "hover-region line_chart_paths");
    g.append("rect")
        .classed("hover-region hidden", true)
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", svg_width - margins.left - margins.right)
        .attr("height", svg_height - margins.top - margins.bottom);
    brands_list.forEach(function(brand, index) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("id", "path_line_2_" + index)
            .classed("brand_line", true)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_sales(datum['Sales'])))
    })

    createHoverCircle(g);
    g.on("mousemove", (event, datum) => hover_brand_line_chart(event, 2))
        .on("mouseout", (event, datum) => hover_remove_brand_line_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    yaxis_sales = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale_sales) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    var axis = line_chart_2_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + margins.left + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .attr("id", "yaxis_2")
        .call(yaxis_sales);
    axis.selectAll(".tick").selectAll("text")
        .attr("class", "text_axis_ticks text_left");

    line_chart_2_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - svg_height / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("class", "text_axis_title")
        .text("Sales");
        
    var axis = line_chart_2_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - margins.bottom) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_2")
        .call(xaxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks");
    
      // text label for the x axis
    line_chart_2_svg.append("text")
        .attr("transform", "translate(" +  (margins.left + (svg_width - margins.left - margins.right) / 2) + " ," + (svg_height - 0.2 * margins.bottom) + ")")
        .attr("class", "text_axis_title")
        .text("Year");
}

function computeTimeAxisTicksLineChart() {
    var startYear = start_date.getFullYear();
    var endYear = end_date.getFullYear();
    var tickValues = []

    for (var year = startYear; year <= endYear; year += 1) {
        if (endYear - startYear <= 12) tickValues.push(new Date(year, 0, 1));
        else if (startYear % 2 == endYear % 2 && year % 2 == startYear % 2) tickValues.push(new Date(year, 0, 1));
        else if (startYear % 2 != endYear % 2) {
            if (year < Math.floor((endYear + startYear) / 2) && year % 2 == startYear % 2)
                tickValues.push(new Date(year, 0, 1));
            else if (year > Math.ceil((endYear + startYear) / 2) && year % 2 == endYear % 2)
                tickValues.push(new Date(year, 0, 1));
        }
    }

    return tickValues;
}

function createHoverCircle(element) {
    element.append("circle")
        .attr("class", "hover_circle hidden")
        .attr("r", 5);
}

function createLegend(element) {
    var svg_width = parseInt(element.style("width").slice(0, -2));
    var svg_height = parseInt(element.style("height").slice(0, -2));
    const SPACING = 0.03 * svg_width;
    const LINE_WIDTH = 0.07 * svg_width;

    var legend = element.append("g").classed("legend hidden", true);
    legend.attr("transform", "translate(" + (0.95 * svg_width) + "," + (0.02 * svg_height) + ")");

    var line = legend.append("g");
    line.attr("transform", "translate(0," + (0.05 * svg_height) + ")");
    var text = line.append("text")
        .classed("text_legend text_left", true)
        .attr("dominant-baseline", "middle")
        .text("Total");
    var textWidth = text.node().getComputedTextLength();
    line.append("path")
        .classed("brand_line", true)
        .attr("d", d3.line()([[- textWidth - SPACING, 0], [- textWidth - SPACING - LINE_WIDTH, 0]]));


    var line = legend.append("g").attr("id", "selectedAxis").datum(selectedAxis);
    line.attr("transform", "translate(0," + (0.10 * svg_height) + ")");
    var text = line.append("text")
        .classed("text_legend text_left", true)
        .attr("dominant-baseline", "middle")
        .text(datum => "With " + ((datum == undefined) ? "" : datum['Name']));
    var textWidth = text.node().getComputedTextLength();
    line.append("path")
        .classed("brand_line dotted", true)
        .attr("d", d3.line()([[- textWidth - SPACING, 0], [- textWidth - SPACING - LINE_WIDTH, 0]]));
}

function showLegend() {
    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));

    const SPACING = 0.03 * svg_width;
    const LINE_WIDTH = 0.07 * svg_width;

    var legend = line_chart_1_svg.select(".legend").classed("hidden", false);
    var text = legend.select("#selectedAxis").datum(selectedAxis)
        .select("text").text(datum => "With " + datum['Name']);
    var textWidth = text.node().getComputedTextLength();
    legend.select("#selectedAxis").select("path")
        .attr("d", d3.line()([[- textWidth - SPACING, 0], [- textWidth - SPACING - LINE_WIDTH, 0]]));
}

function hideLegend() {
    legend = line_chart_1_svg.select(".legend").classed("hidden", true);
}

function createSpiralHoverRegion(element) {
    var svg_width = parseInt(element.style("width").slice(0, -2));
    var svg_height = parseInt(element.style("height").slice(0, -2));
    const margins = {top: 0.12 * svg_height, right: 0.06 * svg_width, bottom: 0.15 * svg_height, left: 0.11 * svg_width};

    var g = element.append("g").attr("id", "time_interval_lines");
    g.append("rect")
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", 250)
        .attr("height", svg_height - margins.top - margins.bottom)
        .attr("class", "time_interval_rectangle hidden");
}

function createTooltipLineChart() {
    var mockInformation = {'Brand': 'Not Hovering', 'Models': 0, 'Sales': 0};
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip hidden")
        .attr("id", "tooltip_line_chart")
        .datum(mockInformation);
        
    tooltip.append("p").attr('id', 'TooltipBrandInfo').html(datum => "<b>Brand:</b> " + datum['Brand']);
    tooltip.append("p").attr('id', 'TooltipModelsInfo').html(datum => "<b>Number of Models:</b> " + datum['Models']);
    tooltip.append("p").attr('id', 'TooltipSalesInfo').html(datum => "<b>Sales:</b> " + Math.round((datum['Sales']) / 1000) / 1000 + " M");
    tooltip.append("p").attr('id', 'TooltipYearInfo').html(datum => "<b>Year:</b> " + datum['Year']);
}

function updateLineCharts() {
    // console.log("New dataset brands: ", dataset_brands);
    // console.log("New dataset models: ", dataset_models);

    xscale.domain([start_date, end_date]);
    xaxis = d3.axisBottom()
        .scale(xscale)
        .tickSizeOuter(0)
        .tickValues(computeTimeAxisTicksLineChart())
        .tickFormat(d3.timeFormat("%Y"));
    
    var axis = d3.selectAll(".line_chart").select(".xaxis")
        .call(xaxis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks");

    // -------------------- UPDATE LINE CHART 1 --------------------
    hscale_models.domain([0, d3.max(dataset_brands, datum => datum['# Models'])]);
    var axis = line_chart_1_svg.select(".yaxis")
        .call(d3.axisLeft(hscale_models));
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks text_left");

    brands_list.forEach(function(brand, index) {
        line_chart_1_svg.selectAll(".line_chart_paths")
            .select("#path_line_1_" + index)
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_models(datum['# Models'])))
    });

    // -------------------- UPDATE LINE CHART 2 --------------------
    hscale_sales.domain([0, d3.max(dataset_brands, datum => datum['Sales'])]);
    var axis = line_chart_2_svg.select(".yaxis")
        .call(d3.axisLeft(hscale_sales)
            .tickFormat(d3.format(".2s"))
            .tickSizeOuter(0));
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks text_left");

    brands_list.forEach(function(brand, index) {
        line_chart_2_svg.selectAll(".line_chart_paths")
            .select("#path_line_2_" + index)
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_sales(datum['Sales'])));
    });
}

function brandUpdateColor(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);

    var line = line_chart_1_svg.selectAll(".line_chart_paths")
        .select("#path_line_1_" + index)
    line.classed("selected", selected);
    line.attr("stroke", (selected) ? getColorBrand(brand) : "darkgrey");
    
    var line = line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
    line.classed("selected", selected);
    line.attr("stroke", (selected) ? getColorBrand(brand) : "darkgrey");

    if (selected) {
        line_chart_1_svg.selectAll(".line_chart_paths")
            .select("#path_line_1_" + index).raise();
        line_chart_2_svg.selectAll(".line_chart_paths")
            .select("#path_line_2_" + index).raise();
    }
}

function highlight_line(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);

    line_chart_1_svg.selectAll(".line_chart_paths")
        .select("#path_line_1_" + index)
        .classed("hover", true)
        .raise();
        
    line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
        .classed("hover", true)
        .raise();  
}

function getChoices(indexOfBrand) {
    var choices = [
        { path: line_chart_1_svg.selectAll(".line_chart_paths").select("#path_line_1_" + indexOfBrand), 
            circle: line_chart_1_svg.selectAll(".hover_circle"),
            attribute: 'Models',
            scaleX: xscale,
            scaleY: hscale_models
        },
        { path: line_chart_2_svg.selectAll(".line_chart_paths").select("#path_line_2_" + indexOfBrand), 
            circle: line_chart_2_svg.selectAll(".hover_circle"),
            attribute: 'Sales',
            scaleX: xscale,
            scaleY: hscale_sales
        }
    ]

    multiplesAxes.forEach(function(axis) {
        var new_multiple_choice = { path: small_multiples_svg.selectAll(".line_chart_paths#paths_" + axis['attribute']).select("#path_line_" + indexOfBrand), 
            circle: small_multiples_svg.selectAll(".line_chart_paths#paths_" + axis['attribute']).selectAll(".hover_circle"),
            attribute: axis['Name'],
            scaleX: timeSmallMultiplesScale,
            scaleY: numberModelsSmallMultiplesScale
        }

        choices.push(new_multiple_choice);
    })

    return choices
}

function show_circle_hover(event, line_chart, brand, information) {
    const index = brands_list.findIndex(elem => elem == brand);

    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    var choices = getChoices(index);
    var currentParams = choices[line_chart - 1];
    var pos = getClosestPointCircle(currentParams.path.node(), x, y, 125);

    currentParams.circle.classed("hidden", false)
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .raise();

    information['Date'] = currentParams.scaleX.invert(pos.x);
    information[currentParams.attribute] = currentParams.scaleY.invert(pos.y);

    return currentParams.scaleX.invert(pos.x);
}

function show_circle_from_date(line_chart, brand, information) {
    const index = brands_list.findIndex(elem => elem == brand);
    var choices = getChoices(index);
    var date = information['Date'];

    choices.forEach(function(choice, index) {
        if (line_chart - 1 == index) return;

        var x = choice.scaleX(date);

        var closest_y = getClosestToX(choice.path.node(), x, 100);
        var value;
        if (closest_y == undefined) return;
        value = choice.scaleY.invert(closest_y);

        information[choice.attribute] = value;

        choice.circle.classed("hidden", false)
            .attr("cx", x)
            .attr("cy", closest_y)
            .raise();
    })
}

function show_tooltip_line_chart(line_chart, information) {
    var element
    if (line_chart == 1) element = line_chart_1_svg;
    else if (line_chart == 2) element = line_chart_2_svg;
    else element = line_chart_1_svg;

    var svg_height = parseInt(element.style("height").slice(0, -2));
    var svg_width = parseInt(element.style("width").slice(0, -2));
    const distanceTooltip = 0.15 * svg_width;
    const margins = {top: 0.12 * svg_height, right: 0.06 * svg_width, bottom: 0.15 * svg_height, left: 0.11 * svg_width};

    var circle = element.select(".hover_circle")
    var pos = {x: parseFloat(circle.attr("cx")), y: parseFloat(circle.attr("cy"))}
    var top = element.node().getBoundingClientRect().y;

    var tooltip = d3.select("div#tooltip_line_chart")
        .datum(information);
    
    tooltip.select('#TooltipBrandInfo').html(datum => "<b>Brand:</b> " + datum['Brand']);
    tooltip.select('#TooltipModelsInfo').html(datum => "<b>Number of Models:</b> " + Math.round(datum['Models']));
    tooltip.select('#TooltipSalesInfo').html(datum => "<b>Sales:</b> " + Math.round((datum['Sales']) / 1000) / 1000 + " M");
    tooltip.select('#TooltipYearInfo').html(datum => "<b>Year:</b> " + datum['Date'].getFullYear());

    const box_width = parseFloat(tooltip.style("width").slice(0, -2));
    const box_height = parseFloat(tooltip.style("height").slice(0, -2));
    var new_y = pos.y + top - box_height / 2;
    var new_x = pos.x - distanceTooltip - box_width;
    if (new_x < margins.left) new_x = pos.x + distanceTooltip;

    tooltip.style("top", new_y).style("left", new_x);
    tooltip.classed("hidden", false);
}

function show_region_interval_line_chart(startTime, endTime) {
    // console.log(startTime, endTime);
    var startX = xscale(startTime);
    var endX = xscale(endTime);

    d3.selectAll("rect.time_interval_rectangle")
        .attr("x", startX)
        .attr("width", endX - startX)
        .classed("hidden", false);
}

function getClosestToX(path, x, steps) {
    var pathLength = path.getTotalLength();
    if (pathLength == 0) return undefined;

    var min = 0;
    var max = 1;
    var pos;

    for (var i = 0; i < steps; i++) {
        pos = path.getPointAtLength(pathLength * ((min + max) / 2));
        if (pos.x < x) min = (min + max) / 2
        else max = (min + max) / 2
    }

    return pos.y;
}

function getClosestPointCircle(path, x, y, steps) {
    var pathLength = path.getTotalLength();
    var min_distance = undefined;
    var min_pos = undefined;

    if (d3.select(path).attr("d") == null) return undefined;

    for (var i = 0; i < steps; i++) {
        pos = path.getPointAtLength(pathLength * i / steps);
        var deltaX = x - pos.x;
        var deltaY = y - pos.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (min_distance == undefined || min_distance >= distance) {
            min_distance = distance;
            min_pos = pos;
        }
    }

    return min_pos;
}

function getClosestPath(event, line_chart, max_distance = 100) {
    var paths;
    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    if (line_chart == 1)
        paths = line_chart_1_svg.selectAll(".line_chart_paths").selectAll("path");
    else if (line_chart == 2)
        paths = line_chart_2_svg.selectAll(".line_chart_paths").selectAll("path");
    
    var min_path = undefined;
    var min_distance = undefined;
    paths.each(function(datum, index) {
        var distance = getDistanceToPath(this, x, y, 20)
        if ((min_distance == undefined || min_distance >= distance) && distance <= max_distance && distance != undefined) {
            min_distance = distance;
            min_path = this;
        }
    });

    // console.log("Min Distance: ", min_distance);
    return min_path;
}
    
function getDistanceToPath(path, x, y, steps) {
    var pathLength = path.getTotalLength();
    var min_distance = undefined;
    if (d3.select(path).attr("d") == null) return undefined;

    for (var i = 0; i < steps; i++) {
        pos = path.getPointAtLength(pathLength * i / steps);
        var deltaX = x - pos.x;
        var deltaY = y - pos.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (min_distance == undefined || min_distance >= distance)
            min_distance = distance;
    }

    return min_distance;
}

function remove_highlight_line(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);

    line_chart_1_svg.selectAll(".line_chart_paths")
        .select("#path_line_1_" + index)
        .classed("hover", false);
       
    line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
        .classed("hover", false);
}

function remove_circle() {
    d3.selectAll(".hover_circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .classed("hidden", true);
}

function remove_tooltip_line_chart() {
    var tooltip = d3.select("div#tooltip_line_chart");
    
    tooltip.classed("hidden", true);
}

function remove_region_line_chart() {
    var regions = d3.selectAll("rect.time_interval_rectangle");

    regions.classed("hidden", true);
}

function hover_brand_line_chart(event, line_chart) {
    var newCloseToBrand
    var path = getClosestPath(event, line_chart, 100);

    if (path != undefined) {
        const index = parseInt(d3.select(path).attr("id").split("_")[3]);
        newCloseToBrand = brands_list[index];
    } else newCloseToBrand = undefined

    if (closeToBrand != undefined || newCloseToBrand != closeToBrand) {
        dispatch.call("hover_remove_brand", this, closeToBrand)
    }

    if (newCloseToBrand != undefined) {
        dispatch.call("hover_brand", this, event, line_chart, newCloseToBrand);
    }

    closeToBrand = newCloseToBrand; 
}

function hover_remove_brand_line_chart() {
    dispatch.call("hover_remove_brand", this, closeToBrand)
    closeToBrand = undefined;
}

function updateLinesSmallMultiples() {
    treatdatasetMultiples();
    brands_list.forEach(function(brand, index) {
        var invisible = !selected_brands.includes(brand) || selectedAxis == undefined;
        line_chart_1_svg.selectAll(".line_chart_dotted_paths")
            .select("#path_line_1_temp_" + index)
            .datum(function() {
                var hasAxisSelected = (selectedAxis != undefined)
                var value = []
                if (selected_brands.includes(brand) && hasAxisSelected)
                    value = treatDatasetPath(brand, selectedAxis);
                    
                //console.log("Value: ", value);
                return value;
            }, datum => datum['Brand'])
            .classed("selected", selected_brands.includes(brand))
            .classed("hidden", invisible)
            .attr("stroke", invisible ? "none" : getColorBrand(brand))
            .attr("d", d3.line()
                .x(datum => xscale(new Date(datum['year'], 0, 1)))
                .y(datum => hscale_models(datum['value'])))
    });

}

function filterBrandsLineChart(line_chart) {
    var element
    if (line_chart == 1) element = line_chart_1_svg
    if (line_chart == 2) element = line_chart_2_svg

    var paths = element.selectAll(".line_chart_paths").selectAll("path.brand_line");
    var unselectedBrands = brands_list.filter(brand => !selected_brands.includes(brand));
    var unfilteredBrands = brands_list.filter(brand => !filteredBrands.includes(brand));

    // UPDATE NOT FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (filteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem != undefined && elem.length != 0 && elem[0]['Brand'] == brand);
        path.classed("filtered", true).raise();
    });

    // UPDATE FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (unfilteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem != undefined && elem.length != 0 && elem[0]['Brand'] == brand);
        path.classed("filtered", false).raise();
    });

    // UPDATE SELECTED BRANDS
    selected_brands.forEach(function(brand) {
        var path = paths.filter(elem => elem != undefined && elem.length != 0 && elem[0]['Brand'] == brand);
        path.classed("filtered", false).raise();
    });
}