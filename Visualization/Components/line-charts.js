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

    line_chart_1_svg = d3.select("svg#line_chart1").attr("class", "line_chart");
    line_chart_2_svg = d3.select("svg#line_chart2").attr("class", "line_chart");

    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));

    xscale = d3.scaleUtc()
        .domain([start_date, end_date])
        .range([PADDING, svg_width - PADDING]);

    xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickSizeOuter(0);

    build_line_chart_1();
    build_line_chart_2();
}

function build_line_chart_1(){
    const PADDING = 50;

    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));

    hscale_models = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['# Models'];
            }),
        ])
        .range([svg_height - PADDING, PADDING]);
    
    line_chart_1_svg.on("mousemove", (event, datum) => dispatch.call("hover_line_chart", this, event, 1))
        .on("mouseout", (event, datum) => dispatch.call("hover_remove_line_chart", this))
        .on("click", (event, datum) => dispatch.call("clickBrand", this));

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
    }) 

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
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Models Developed");
        
    line_chart_1_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - PADDING) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_1")
        .call(xaxis);
    
      // text label for the x axis
    line_chart_1_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - PADDING / 3) + ")"
        )
        .attr("class", "label")
        .text("Year"); 
    
    line_chart_1_svg.append("circle")
        .attr("class", "hover-circle")
        .attr("r", 5)
        .style("stroke", "black")
        .style("fill", "red")
        .style("stroke-width", "1px")
        .style("opacity", "0");
}

function build_line_chart_2(){
    const PADDING = 50;
    
    var svg_width = parseInt(line_chart_2_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_2_svg.style("height").slice(0, -2));

    hscale_sales = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['Sales'];
            }),
        ])
        .range([svg_height - PADDING, PADDING]);

    line_chart_2_svg.on("mousemove", (event, datum) => dispatch.call("hover_line_chart", this, event, 2))
        .on("mouseout", (event, datum) => dispatch.call("hover_remove_line_chart", this))
        .on("click", (event, datum) => dispatch.call("clickBrand", this));

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
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Sales");
        
    line_chart_2_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - PADDING) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .attr("id", "xaxis_2")
        .call(xaxis);
    
      // text label for the x axis
    line_chart_2_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - PADDING / 3) + ")"
        )
        .attr("class", "label")
        .text("Year");    
        
    line_chart_2_svg.append("circle")
        .attr("class", "hover-circle")
        .attr("r", 5)
        .style("stroke", "black")
        .style("fill", "red")
        .style("stroke-width", "1px")
        .style("opacity", "0");
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
    y_models = getClosestPointCircle(path.node(), x, 30);;
    path = line_chart_2_svg.selectAll(".line_chart_paths")
        .select("#path_line_2_" + index);
    y_sales = getClosestPointCircle(path.node(), x, 30);

    line_chart_1_svg.selectAll(".hover-circle")
        .attr("cx", x)
        .attr("cy", y_models)
        .style("opacity", 1);

    line_chart_2_svg.selectAll(".hover-circle")
        .attr("cx", x)
        .attr("cy", y_sales)
        .style("opacity", 1);
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