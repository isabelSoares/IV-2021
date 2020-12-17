var min_date
var max_date
var time_scale
var time_axis
var time_selection_svg

function build_time_selection_svg() {
    time_selection_svg = d3.select("svg#time_selection");
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));

    const LINE_WIDTH = svg_width * 0.95;
    // console.log(time_selection_svg);
    
    var min_date_models = d3.min(fulldataset_models.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var max_date_models = d3.max(fulldataset_models.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var min_date_brands = d3.min(fulldataset_brands.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var max_date_brands = d3.max(fulldataset_brands.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    min_date = new Date(Math.min(min_date_brands, min_date_models));
    max_date = new Date(Math.min(max_date_brands, max_date_models));

    max_date = new Date(max_date.getFullYear(), 0 , 1);

    // console.log("Min Available Date: ", min_date);
    // console.log("Max Available Date: ", max_date);

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
        .attr("id", "start_triangle")
        .attr("class", "triangle_selector draggable")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")");
    time_selection_svg.append("polygon")
        .attr("points", getPointsTriangle(time_scale(end_date)))
        .attr("id", "end_triangle")
        .attr("class", "triangle_selector draggable")
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
    const LINE_WIDTH = svg_width * 0.95;

    function dragged(event, datum) {
        var new_x = event.x - (svg_width - LINE_WIDTH) / 2;
        var temp_date = time_scale.invert(new_x);
        var date = new Date(temp_date.getFullYear(), Math.round(temp_date.getMonth() / 12) * 12 , 1);

        var closest_start_date = (new Date(start_date)).setFullYear(start_date.getFullYear() + 2);
        var closest_end_date = (new Date(end_date)).setFullYear(end_date.getFullYear() - 2);
        if (date < min_date) date = new Date(min_date);
        if (date > max_date) date = new Date(max_date);
        if (this.id == "end_triangle" && date <= closest_start_date) date = new Date(closest_start_date);
        if (this.id == "start_triangle" && date >= closest_end_date ) date = new Date(closest_end_date);
        new_x = time_scale(date);

        d3.select(this)
            .attr("points", getPointsTriangle(new_x))
            .classed("hover", true)
            .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (17) + ")");
        
        if (this.id == "start_triangle") start_date = new Date(date);
        else if (this.id == "end_triangle") end_date = new Date(date);
        // console.log("Start: ", start_year);
        // console.log("End: ", end_year);
    }

    time_selection_svg.selectAll("polygon")
        .call(d3.drag()
            .on("drag", dragged)
            .on("end", function(event, datum) {
                d3.select(this).classed("hover", false);
                dispatch.call("changed_time_period", this);
            }));
}

function resetTimeSelection() {
    var start_triangle = time_selection_svg.select("#start_triangle");
    var end_triangle = time_selection_svg.select("#end_triangle");
    var new_x
    
    new_x = time_scale(min_date);
    start_triangle.transition().duration(1000)
        .attr("points", getPointsTriangle(new_x));
    start_date = new Date(min_date);
    
    new_x = time_scale(max_date);
    end_triangle.transition().duration(1000)
        .attr("points", getPointsTriangle(new_x));
    end_date = new Date(max_date);
}