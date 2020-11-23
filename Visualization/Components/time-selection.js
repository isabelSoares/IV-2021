var min_date
var max_date
var time_scale
var time_axis
var time_selection_svg

const LINE_WIDTH = 1150;

function build_time_selection_svg() {
    const LINE_WIDTH = 1150;
    
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

    time_scale = d3.scaleUtc()
        .range([0, LINE_WIDTH])
        .domain([min_date, max_date]);

    time_axis = d3.axisBottom()
        .scale(time_scale);
    
    time_selection_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")")
        .call(time_axis);
    
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(start_date)))
        .attr("fill", "red")
        .attr("id", "start_triangle")
        .attr("class", "triangle_selector")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")");
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(end_date)))
        .attr("fill", "red")
        .attr("id", "end_triangle")
        .attr("class", "triangle_selector")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")");
    
    prepare_event_time_selection();
}

function getPointsTriangle(center) {
    var points = [[center, 0], [center - 10, -12], [center + 10, -12]]
    var points_string = points.map(elem => elem.join(",")).join(" ");
    return points_string;
}

function prepare_event_time_selection() {
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));
    const LINE_WIDTH = 1150;

    function dragged(event, datum) {
        var new_x = event.x - (svg_width - LINE_WIDTH) / 2;
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
            .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")");
        
        if (this.id == "start_triangle") start_date = date;
        else if (this.id == "end_triangle") end_date = date;
        // console.log("Start: ", start_year);
        // console.log("End: ", end_year);
    }

    time_selection_svg.selectAll("polygon")
        .call(d3.drag()
            .on("drag", dragged));
}