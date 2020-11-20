var dragHandler = d3.drag()
var fulldataset_models
var dataset_models
var fulldataset_brands
var dataset_brands
var brands_list
var selected_brands = []

var time_selection_svg

var min_date
var max_date
var start_date = new Date(2000, 0, 1)
var end_date = new Date(2015, 0, 1)
var time_scale

var brand_selection_form
var line_chart_1_svg

const DatasetDir = "../Datasets/"

function init() {
    d3.dsv(";", DatasetDir + "Brands_Parsed.csv").then(function (data) {
        data.forEach(function(elem) {
            if (elem['Year'] == 'null') elem['Year'] = null;
            else elem['Year'] = parseInt(elem['Year'])

            elem['# Models'] = parseInt(elem['# Models'])
            
            if (elem['Sales'] == 'null') elem['Sales'] = 0;
            else elem['Sales'] = parseInt(elem['Sales'])
        });

        fulldataset_brands = data;
        dataset_brands = fulldataset_brands;
        brands_list = dataset_brands.map(elem => elem['Brand'])
            .filter((value, index, self) => self.indexOf(value) === index);
        
        d3.dsv(";", DatasetDir + "Models_Parsed.csv").then(function (data) {
            data.forEach(element => {
                if (element['year'] == 'null') element['year'] = null;
                else element['year'] = parseInt(element['year'])
                if (element['quarter'] == 'null') element['quarter'] = null;
                else element['quarter'] = parseInt(element['quarter'])
                if (element['month_id'] == 'null') element['month_id'] = null;
                else element['month_id'] = parseInt(element['month_id'])
            });

            fulldataset_models = data;
            dataset_models = fulldataset_models;

            // console.log("Brands: ", fulldataset_brands);
            // console.log("Models: ", fulldataset_models);

            build_time_selection_svg();
            build_brand_selection_form();
            build_line_chart_1();
            build_line_chart_2();
            
        });
    });
}

function build_time_selection_svg() {
    time_selection_svg = d3.select("svg#time_selection");
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));

    // console.log(time_selection_svg);

    time_selection_svg.append("text")
        .attr("class", "selection_text")
        .text("Time Range")
        .attr("y", "50%")
        .attr("x", "1%");
    
    var min_year = d3.min(dataset_models.filter(elem => elem['year']), datum => datum['year']);
    var min_quarter = d3.min(dataset_brands.filter(elem => elem['year'] == min_year), datum => datum['quarter']);
    var min_month;
    if (min_quarter == undefined) {
        min_quarter = 1;
        min_month = 0;
    } else {
        min_month = d3.min(dataset_brands.filter(elem => elem['year'] == min_year && elem['quarter'] == min_quarter), datum => datum['month']);
        if (min_month == undefined) min_month = min_quarter * 4;
        else min_month = min_month - 1;
    }
    //console.log("Min Date: ", min_year, min_quarter, min_month);
    min_date = new Date(min_year, min_quarter, min_month);

    var max_year = d3.max(dataset_models.filter(elem => elem['year']), datum => datum['year']);
    var max_quarter = d3.max(dataset_brands.filter(elem => elem['year'] == max_year), datum => datum['quarter']);
    var max_month;
    if (max_quarter == undefined) {
        max_quarter = 1;
        max_month = 0;
    } else {
        max_month = d3.max(dataset_brands.filter(elem => elem['year'] == max_year && elem['quarter'] == max_quarter), datum => datum['month']);
        if (max_month == undefined) max_month = max_quarter * 4;
        else min_month = min_month - 1;
    }
    //console.log("Max Date: ", max_year, max_quarter, max_month);
    max_date = new Date(max_year, max_quarter, max_month);

    const line_width = 1150;
    time_scale = d3.scaleUtc()
        .range([0, line_width])
        .domain([min_date, max_date]);

    var time_axis = d3.axisBottom()
        .scale(time_scale);
    
    time_selection_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")")
        .call(time_axis);
    
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(start_date)))
        .attr("fill", "red")
        .attr("id", "start_triangle")
        .attr("class", "triangle_selector")
        .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")");
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(end_date)))
        .attr("fill", "red")
        .attr("id", "end_triangle")
        .attr("class", "triangle_selector")
        .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")");
    
    prepare_event_time_selection();
}

function getPointsTriangle(center) {
    var points = [[center, 0], [center - 10, -12], [center + 10, -12]]
    var points_string = points.map(elem => elem.join(",")).join(" ");
    return points_string;
}

function prepare_event_time_selection() {
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));
    const line_width = 1150;

    function dragged(event, datum) {
        var new_x = event.x - (svg_width - line_width) / 2;
        var date = time_scale.invert(new_x);
        var date = new Date(date.getFullYear(), date.getMonth(), 1);

        var closest_start_date = (new Date(start_date)).setFullYear(start_date.getFullYear() + 1);
        var closest_end_date = (new Date(end_date)).setFullYear(end_date.getFullYear() - 1);
        if (date < min_date) date = min_date;
        if (date > max_date) date = max_date;
        if (this.id == "end_triangle" && date <= closest_start_date) date = new Date(closest_start_date);
        if (this.id == "start_triangle" && date >= closest_end_date ) date = new Date(closest_end_date);
        new_x = time_scale(date);

        d3.select(this)
            .attr("points", getPointsTriangle(new_x))
            .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")");
        
        if (this.id == "start_triangle") start_date = date;
        else if (this.id == "end_triangle") end_date = date;
        // console.log("Start: ", start_year);
        // console.log("End: ", end_year);
    }

    time_selection_svg.selectAll("polygon")
        .call(d3.drag()
            .on("drag", dragged));
}

function build_brand_selection_form() {
    function update(object) {
        var target = object.target;
        // console.log(target.value);
        if (target.checked) selected_brands.push(target.value);
        else selected_brands = selected_brands.filter(elem => elem != target.value)

        // console.log(selected_brands);
    }

    brand_selection_form = d3.select("div#brands_selection")
        .append("div")
        .attr("class", "form_div")
        .append("form");
    // console.log(brands_list)

    var divs = brand_selection_form.selectAll("p")
        .data(brands_list)
        .join("div")
        .attr("class", "brand_box");
        
    divs.append("input")
        .attr("type", "checkbox")
        .attr("class", "brand_checkbox")
        .attr("id", datum => datum)
        .attr("value", datum => datum)
        .on("change", update);
    divs.append("label")
        .attr("for", datum => datum)
        .attr("class", "brand_label")
        .text(datum => datum);
            
}

function build_line_chart_1(){
    line_chart_1_svg = d3.select("svg#line_chart1");
    var svg_width = parseInt(line_chart_1_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_1_svg.style("height").slice(0, -2));
    var padding = 50;
    var xscaleData = dataset_brands.map((a) => a['Year'])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a,b) => a - b);

    var xscale = d3.scalePoint()
        .domain(xscaleData)
        .range([padding, svg_width - padding]);

    var hscale = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['# Models'];
            }),
        ])
        .range([svg_height - padding, padding]);

    var g = line_chart_1_svg.append("g")
    brands_list.forEach(function(brand) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Year']))
                .y(datum => hscale(datum['# Models'])))
    }) 

    var yaxis = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_1_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + padding + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .call(yaxis);

    line_chart_1_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Models Developed");
    
    var xscaleDataFiltered = xscaleData.filter(function (d, i) {
        if (i % 5 == 0) return d;
    });
    
    var xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickValues(xscaleDataFiltered)
        .tickSizeOuter(0);
        
    line_chart_1_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);
    
      // text label for the x axis
    line_chart_1_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Year");                
}

function build_line_chart_2(){
    line_chart_2_svg = d3.select("svg#line_chart2");
    var svg_width = parseInt(line_chart_2_svg.style("width").slice(0, -2));
    var svg_height = parseInt(line_chart_2_svg.style("height").slice(0, -2));
    var padding = 50;
    var xscaleData = dataset_brands.map((a) => a['Year'])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a,b) => a - b);

    var xscale = d3.scalePoint()
        .domain(xscaleData)
        .range([padding, svg_width - padding]);

    var hscale = d3.scaleLinear()
        .domain([0, d3.max(dataset_brands, function (d) {
            return d['Sales'];
            }),
        ])
        .range([svg_height - padding, padding]);

    var g = line_chart_2_svg.append("g")
    brands_list.forEach(function(brand) {
        g.append("path")
            .datum(dataset_brands.filter(elem => elem['Brand'] == brand))
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .x(datum => xscale(datum['Year']))
                .y(datum => hscale(datum['Sales'])))
    }) 

    var yaxis = d3.axisLeft() // we are creating a d3 axis
        .scale(hscale) // fit to our scale
        .tickFormat(d3.format(".2s")) // format of each year
        .tickSizeOuter(0);

    line_chart_2_svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(" + padding + ",0)")
        .attr("class", "yaxis") // we are giving it a css style
        .call(yaxis);

    line_chart_2_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - svg_height / 2)
        .attr("dy", "1em")
        .attr("class", "label")
        .text("Sales");
    
    var xscaleDataFiltered = xscaleData.filter(function (d, i) {
        if (i % 5 == 0) return d;
    });
    
    var xaxis = d3.axisBottom() // we are creating a d3 axis
        .scale(xscale) // we are adding our padding
        .tickValues(xscaleDataFiltered)
        .tickSizeOuter(0);
        
    line_chart_2_svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform", "translate(0," + (svg_height - padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
        .call(xaxis);
    
      // text label for the x axis
    line_chart_2_svg.append("text")
        .attr(
          "transform",
          "translate(" + svg_width / 2 + " ," + (svg_height - padding / 3) + ")"
        )
        .attr("class", "label")
        .text("Year");                
}
