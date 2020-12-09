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
    const PADDING = 50;

    line_chart_1_svg = d3.select("svg#line_chart1").classed("line_chart", true);
    line_chart_2_svg = d3.select("svg#line_chart2").classed("line_chart", true);

    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));

    xscale = d3.scaleUtc()
        .domain([start_date, end_date])
        .range([PADDING, svg_width - PADDING]);

    xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickSizeOuter(0);

    build_line_chart_1();
    build_line_chart_2();
    createTooltipLineChart();
}

function build_line_chart_1(){
    const PADDING = 50;

    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));
    createSpiralHoverRegion(line_chart_1_svg);

    hscale_models = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['# Models'];
            }),
        ])
        .range([svg_height - PADDING, PADDING]);
    
    line_chart_1_svg.on("mousemove", (event, datum) => hover_brand_line_chart(event, 1))
        .on("mouseout", (event, datum) => hover_remove_brand_line_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    var g = line_chart_1_svg.append("g").attr("class", "line_chart_paths");
    brands_list.forEach(function(brand, index) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("id", "path_line_1_" + index)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_models(datum['# Models'])))
    });

    yaxis_models = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale_models) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_1_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + PADDING + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .attr("id", "yaxis_1")
        .call(yaxis_models);

    line_chart_1_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - svg_height / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("class", "text_axis_title")
        .text("Models Developed");
        
    line_chart_1_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - PADDING) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_1")
        .call(xaxis);
    
      // text label for the x axis
    line_chart_1_svg.append("text")
        .attr("transform", "translate(" + svg_width / 2 + " ," + (svg_height - PADDING / 3) + ")")
        .attr("class", "text_axis_title")
        .text("Year"); 
    
    createHoverCircle(line_chart_1_svg);
}

function build_line_chart_2(){
    const PADDING = 50;
    
    var svg_width = parseInt(line_chart_2_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_2_svg.style("height").slice(0, -2));
    createSpiralHoverRegion(line_chart_2_svg);

    hscale_sales = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['Sales'];
            }),
        ])
        .range([svg_height - PADDING, PADDING]);

    line_chart_2_svg.on("mousemove", (event, datum) => hover_brand_line_chart(event, 2))
        .on("mouseout", (event, datum) => hover_remove_brand_line_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    var g = line_chart_2_svg.append("g").attr("class", "line_chart_paths");
    brands_list.forEach(function(brand, index) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("id", "path_line_2_" + index)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Date']))
                .y(datum => hscale_sales(datum['Sales'])))
    }) 

    yaxis_sales = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale_sales) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_2_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + PADDING + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .attr("id", "yaxis_2")
        .call(yaxis_sales);

    line_chart_2_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - svg_height / 2)
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("class", "text_axis_title")
        .text("Sales");
        
    line_chart_2_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - PADDING) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_2")
        .call(xaxis);
    
      // text label for the x axis
    line_chart_2_svg.append("text")
        .attr("transform", "translate(" + svg_width / 2 + " ," + (svg_height - PADDING / 3) + ")")
        .attr("class", "text_axis_title")
        .text("Year");
        
    createHoverCircle(line_chart_2_svg);
}

function createHoverCircle(element) {
    element.append("circle")
        .attr("class", "hover-circle")
        .attr("r", 5)
        .style("stroke", "black")
        .style("fill", d3.rgb(0, 76, 153))
        .style("stroke-width", "1px")
        .style("opacity", "0");
}

function createSpiralHoverRegion(element) {
    const PADDING = 50;
    
    var svg_width = parseInt(element.style("width").slice(0, -2));
    var svg_height = parseInt(element.style("height").slice(0, -2));

    var g = element.append("g").attr("id", "time_interval_lines");
    g.append("rect")
        .attr("x", PADDING)
        .attr("y", PADDING)
        .attr("width", 250)
        .attr("height", svg_height - 2 * PADDING)
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
    d3.selectAll(".line_chart").select(".xaxis")
        .call(d3.axisBottom(xscale));

    // -------------------- UPDATE LINE CHART 1 --------------------
    hscale_models.domain([0, d3.max(dataset_brands, datum => datum['# Models'])]);
    line_chart_1_svg.select(".yaxis")
        .call(d3.axisLeft(hscale_models));

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
    line_chart_2_svg.select(".yaxis")
        .call(d3.axisLeft(hscale_sales)
            .tickFormat(d3.format(".2s"))
            .tickSizeOuter(0));

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

    line_chart_1_svg.selectAll(".line_chart_paths")
        .select("#path_line_1_" + index)
        .transition().duration(1000)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");
    
    line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
        .transition().duration(1000)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");

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
        .attr("stroke-width", 3)
        .attr("stroke", (selected) ? getColorBrand(brand) : "black");
        
    line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
        .attr("stroke-width", 3)
        .attr("stroke", (selected) ? getColorBrand(brand) : "black");   
}

function show_circle(event, line_chart, brand) {
    const index = brands_list.findIndex(elem => elem == brand);

    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    var path;
    var y_models, y_sales;
    
    path = line_chart_1_svg.selectAll(".line_chart_paths")
        .select("#path_line_1_" + index);
    y_models = getClosestPointCircle(path.node(), x, 300);
    path = line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index);
    y_sales = getClosestPointCircle(path.node(), x, 300);

    line_chart_1_svg.selectAll(".hover-circle")
        .attr("cx", x)
        .attr("cy", y_models)
        .style("opacity", 1);

    line_chart_2_svg.selectAll(".hover-circle")
        .attr("cx", x)
        .attr("cy", y_sales)
        .style("opacity", 1);

    return {'Brand': brand, 'Models': hscale_models.invert(y_models), 'Sales': hscale_sales.invert(y_sales), 'Date': xscale.invert(x)};
}

function show_tooltip_line_chart(event, line_chart, information) {
    const PADDING = 50;
    const distanceTooltip = parseInt(line_chart_1_svg.style("width").slice(0, -2)) / 3;

    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    if (line_chart == 1) var top = line_chart_1_svg.node().getBoundingClientRect().y;
    if (line_chart == 2) var top = line_chart_2_svg.node().getBoundingClientRect().y;

    var tooltip = d3.select("div#tooltip_line_chart")
        .datum(information);
    
    tooltip.select('#TooltipBrandInfo').html(datum => "<b>Brand:</b> " + datum['Brand']);
    tooltip.select('#TooltipModelsInfo').html(datum => "<b>Number of Models:</b> " + Math.round(datum['Models']));
    tooltip.select('#TooltipSalesInfo').html(datum => "<b>Sales:</b> " + Math.round((datum['Sales']) / 1000) / 1000 + " M");
    tooltip.select('#TooltipYearInfo').html(datum => "<b>Year:</b> " + datum['Date'].getFullYear());

    const box_width = parseFloat(tooltip.style("width").slice(0, -2));
    const box_height = parseFloat(tooltip.style("height").slice(0, -2));
    var new_y = y + top - box_height / 2;
    var new_x = x - distanceTooltip;
    if (new_x < PADDING) new_x = x + distanceTooltip - box_width;

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

function getClosestPointCircle(path, x, nSteps) {
    var pathLength = path.getTotalLength();
    var min = 0;
    var max = 1;
    var pos;

    for (var i = 0; i < nSteps; i++) {
        pos = path.getPointAtLength(pathLength * ((min + max) / 2));
        if (pos.x < x) min = (min + max) / 2
        else max = (min + max) / 2
    }

    return pos.y;
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
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");
       
    line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");  
}

function remove_circle() {
    line_chart_1_svg.selectAll(".hover-circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .style("opacity", 0);

    line_chart_2_svg.selectAll(".hover-circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .style("opacity", 0);
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
    var path = getClosestPath(event, line_chart, 50);

    if (path != undefined) {
        const index = parseInt(d3.select(path).attr("id").split("_")[3]);
        newCloseToBrand = brands_list[index];
    } else newCloseToBrand = undefined

    if (closeToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_remove_brand", this, closeToBrand)
    }

    if (newCloseToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_brand", this, event, line_chart, newCloseToBrand);
    }

    closeToBrand = newCloseToBrand; 
}

function hover_remove_brand_line_chart() {
    dispatch.call("hover_remove_brand", this, closeToBrand)
    closeToBrand = undefined;
}