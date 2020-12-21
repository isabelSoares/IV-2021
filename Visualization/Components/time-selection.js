var min_date
var max_date
var time_scale
var time_axis
var time_selection_svg

var begin_selection = {start: undefined, end: undefined}

function build_time_selection_svg() {
    time_selection_svg = d3.select("svg#time_selection");
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));
    var svg_height = parseInt(time_selection_svg.style("height").slice(0, -2));

    const LINE_WIDTH = svg_width * 0.95;
    
    var min_date_models = d3.min(fulldataset_models.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var max_date_models = d3.max(fulldataset_models.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var min_date_brands = d3.min(fulldataset_brands.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    var max_date_brands = d3.max(fulldataset_brands.filter(elem => elem['Date'] != undefined), datum => datum['Date']);
    min_date = new Date(Math.min(min_date_brands, min_date_models));
    max_date = new Date(Math.min(max_date_brands, max_date_models));

    max_date = new Date(max_date.getFullYear(), 0 , 1);

    time_scale = d3.scaleUtc()
        .range([0, LINE_WIDTH])
        .domain([min_date, max_date]);

    time_axis = d3.axisBottom()
        .scale(time_scale)
        .tickSizeOuter(0)
        .tickValues(computeTimeAxisTicksTimeSelection())
        .tickFormat(d3.timeFormat("%Y"));
    
    var axis = time_selection_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (svg_height * 5 / 12) + ")")
        .call(time_axis);
    axis.selectAll(".tick").selectAll("text").attr("class", "text_axis_ticks lim_height");
    
    var selectors = time_selection_svg.append("g")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (svg_height * 5 / 12) + ")");
    
    selectors.append("path")
        .attr("class", "path_selector grabbable")
        .attr("d", d3.line()([getPointsConnection(time_scale(start_date)), getPointsConnection(time_scale(end_date))]));
    selectors.append("polygon")
        .attr("points", getPointsTriangle(time_scale(start_date)))
        .attr("id", "start_triangle")
        .attr("class", "triangle_selector draggable");
    selectors.append("polygon")
        .attr("points", getPointsTriangle(time_scale(end_date)))
        .attr("id", "end_triangle")
        .attr("class", "triangle_selector draggable");
    
    prepare_event_time_selection();
}

function getPointsTriangle(center) {
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));
    var svg_height = parseInt(time_selection_svg.style("height").slice(0, -2));

    var points = [[center, 0], [center - 0.007 * svg_width, - 0.30 * svg_height], [center + 0.007 * svg_width, - 0.30 * svg_height]]
    var points_string = points.map(elem => elem.join(",")).join(" ");
    return points_string;
}

function getPointsConnection(center) {
    var svg_height = parseInt(time_selection_svg.style("height").slice(0, -2));

    return [center, - 0.25 * svg_height]
}

function prepare_event_time_selection() {
    var svg_width = parseInt(time_selection_svg.style("width").slice(0, -2));
    const LINE_WIDTH = svg_width * 0.95;

    function dragged(event, datum) {
        var new_x = event.x - (svg_width - LINE_WIDTH) / 2;
        var temp_date = time_scale.invert(new_x);
        var date = new Date(temp_date.getFullYear(), 12 , 1);

        var closest_start_date = (new Date(start_date)).setFullYear(start_date.getFullYear() + 2);
        var closest_end_date = (new Date(end_date)).setFullYear(end_date.getFullYear() - 2);
        if (date < min_date) date = new Date(min_date);
        if (date > max_date) date = new Date(max_date);
        if (this.id == "end_triangle" && date <= closest_start_date) date = new Date(closest_start_date);
        if (this.id == "start_triangle" && date >= closest_end_date ) date = new Date(closest_end_date);
        new_x = time_scale(date);

        d3.select(this)
            .attr("points", getPointsTriangle(new_x))
            .classed("hover", true);
            
        if (this.id == "start_triangle") start_date = new Date(date);
        else if (this.id == "end_triangle") end_date = new Date(date);

        time_selection_svg.select(".path_selector")
            .attr("d", d3.line()([getPointsConnection(time_scale(start_date)), getPointsConnection(time_scale(end_date))]));
    }

    function grabbed(event, datum) {
        this.__origin_start__ += event.dx;
        this.__origin_end__ += event.dx;

        var new_start_date = time_scale.invert(this.__origin_start__);
        new_start_date = new Date(new_start_date.getFullYear(), Math.round(new_start_date.getMonth() / 12) * 12 , 1);
        var new_end_date = time_scale.invert(this.__origin_end__);
        new_end_date = new Date(new_end_date.getFullYear(), Math.round(new_end_date.getMonth() / 12) * 12 , 1);
        
        if (new_start_date < min_date || new_end_date > max_date) {
            this.__origin_start__ -= event.dx;
            this.__origin_end__ -= event.dx;

            new_start_date = time_scale.invert(this.__origin_start__);
            new_start_date = new Date(new_start_date.getFullYear(), Math.round(new_start_date.getMonth() / 12) * 12 , 1);
            new_end_date = time_scale.invert(this.__origin_end__);
            new_end_date = new Date(new_end_date.getFullYear(), Math.round(new_end_date.getMonth() / 12) * 12 , 1);
        }
        
        this.__current_start__ = time_scale(new_start_date);
        this.__current_end__ = time_scale(new_end_date);

        d3.select("#start_triangle").attr("points", getPointsTriangle(this.__current_start__));
        d3.select("#end_triangle").attr("points", getPointsTriangle(this.__current_end__));
        d3.select(this)
            .attr("d", d3.line()([getPointsConnection(this.__current_start__, "start_triangle"), getPointsConnection(this.__current_end__, "end_triangle")]));

        start_date = new Date(new_start_date);
        end_date = new Date(new_end_date);
    }

    time_selection_svg.selectAll(".triangle_selector")
        .call(d3.drag()
            .on("start", function(event, datum) { begin_selection = {start: new Date(start_date), end: new Date(end_date)} })
            .on("drag", dragged)
            .on("end", function(event, datum) {
                d3.select(this).classed("hover", false);

                if (begin_selection.start.getTime() != start_date.getTime() || begin_selection.end.getTime() != end_date.getTime())
                    dispatch.call("changed_time_period", this);
                begin_selection = {start: undefined, end: undefined};
            }));
    time_selection_svg.select(".path_selector")
        .call(d3.drag()
            .on("start", function(event, datum) {
                begin_selection = {start: start_date, end: end_date}

                this.__origin_start__ = time_scale(start_date);
                this.__origin_end__ = time_scale(end_date);
                this.__current_start__ = time_scale(start_date);
                this.__current_end__ = time_scale(end_date);
                d3.selectAll(".triangle_selector").classed("hover", true);
                d3.select(this).classed("grabbing", true);
            })
            .on("drag", grabbed)
            .on("end", function(event, datum) {
                delete this.__origin_start__;
                delete this.__origin_end__;
                delete this.__current_start__;
                delete this.__current_end__;

                d3.selectAll(".triangle_selector").classed("hover", false);
                d3.select(this).classed("grabbing", false);

                if (begin_selection.start.getTime() != start_date.getTime() || begin_selection.end.getTime() != end_date.getTime())
                    dispatch.call("changed_time_period", this);
                begin_selection = {start: undefined, end: undefined};
            }));
}

function resetTimeSelection() {
    var start_triangle = time_selection_svg.select("#start_triangle");
    var end_triangle = time_selection_svg.select("#end_triangle");
    var new_x
    
    new_x = time_scale(min_date);
    start_triangle.transition("Reset Start Triangle Selector").duration(1000)
        .attr("points", getPointsTriangle(new_x));
    start_date = new Date(min_date);
    
    new_x = time_scale(max_date);
    end_triangle.transition("Reset End Triangle Selector").duration(1000)
        .attr("points", getPointsTriangle(new_x));
    end_date = new Date(max_date);

    var path_selector = time_selection_svg.select(".path_selector");
    path_selector.transition("Reset Path Selector").duration(1000)
        .attr("d", d3.line()([getPointsConnection(time_scale(start_date)), getPointsConnection(time_scale(end_date))]));
}

function computeTimeAxisTicksTimeSelection() {
    var startYear = start_date.getFullYear();
    var endYear = end_date.getFullYear();
    var tickValues = []

    for (var year = startYear; year <= endYear; year += 1) {
        tickValues.push(new Date(year, 0, 1));
    }

    return tickValues;
}