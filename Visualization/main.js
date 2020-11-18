var dragHandler = d3.drag()

var fulldataset_models
var dataset_models
var fulldataset_brands
var dataset_brands
var brands_list
var selected_brands = []

var time_selection_svg
var min_year
var max_year
var start_year = 2000
var end_year = 2015
var time_scale

var brand_selection_form

const DatasetDir = "../Datasets/"

function init() {
    d3.dsv(";", DatasetDir + "Brands_Parsed.csv").then(function (data) {
        fulldataset_brands = data;
        dataset_brands = fulldataset_brands;
        brands_list = dataset_brands.map(elem => elem['Brand'])
            .filter((value, index, self) => self.indexOf(value) === index);
        
        d3.dsv(";", DatasetDir + "Models_Parsed.csv").then(function (data) {
            data.forEach(element => {
                element['year'] = parseInt(element['year'])
            });

            fulldataset_models = data;
            dataset_models = fulldataset_models;

            // console.log("Brands: ", fulldataset_brands);
            // console.log("Models: ", fulldataset_models);

            build_time_selection_svg();
            build_brand_selection_form();
            
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
    
    min_year = d3.min(dataset_models.filter(elem => elem['year'] != "null"), datum => datum['year']);
    max_year = d3.max(dataset_models.filter(elem => elem['year'] != "null"), datum => datum['year']);
    // console.log(min_year)
    // console.log(max_year)

    var domain_time = []
    for (var i = min_year; i <= max_year; i++)
        domain_time.push(i);
    // console.log("Domain_time: ", domain_time);

    const line_width = 1150;
    time_scale = d3.scaleLinear()
        .range([0, line_width])
        .domain([min_year, max_year]);
    
    // console.log(time_scale(max_year));
    // console.log(time_scale(min_year));
    // console.log(time_scale((max_year + min_year) / 2));

    var time_axis = d3.axisBottom()
        .scale(time_scale);
    
    time_selection_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")")
        .call(time_axis);
    
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(start_year)))
        .attr("fill", "red")
        .attr("id", "start_triangle")
        .attr("class", "triangle_selector")
        .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")");
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(end_year)))
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
        var year = Math.round(time_scale.invert(new_x));
        if (year < min_year) year = min_year;
        if (year > max_year) year = max_year;
        if (this.id == "end_triangle" && year <= start_year) year = start_year + 1;
        if (this.id == "start_triangle" && year >= end_year) year = end_year - 1;
        new_x = time_scale(year);

        d3.select(this)
            .attr("points", getPointsTriangle(new_x))
            .attr("transform", "translate(" + (svg_width - line_width) / 2 + "," + (17) + ")");
        
        if (this.id == "start_triangle") start_year = year;
        else if (this.id == "end_triangle") end_year = year;
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