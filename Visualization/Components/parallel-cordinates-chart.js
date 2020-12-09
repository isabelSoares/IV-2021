var parallel_coordinates_svg
var datasetParallelCoordinates
var axesParallelCoordinates
var xPositionScaleParallelCoordinates

function build_parallel_coordinates_chart() {
    parallel_coordinates_svg = d3.select("#parallel_coordinates_chart");
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));

    const margins = {top: 50, right: 70, bottom: 35, left: 70}
    
    axesParallelCoordinates = [
        {Name: "Battery Amps/h", attribute: ["battery_amps"]},
        {Name: "Internal Memory MB", attribute: ["im_MB"]},
        {Name: "RAM MB", attribute: ["ram_MB"]},
        {Name: "Camera MP", attribute: ["primary_camera_MP"]},
        {Name: "Number of Sensors/ Model", attribute: ["sensor_accelerometer","sensor_fingerprint","sensor_heart_rate","sensor_iris_scanner","sensor_proximity","sensor_temperature"]},
        {Name: "Aspect Ratio", attribute: ["aspect_ratio"]},
        {Name: "Screen/Body Ratio", attribute: ["screen_body_ratio"]},
    ]
    
    parallel_coordinates_svg.append("text")
        .attr("x", "50%")
        .attr("y", "10%")
        .attr("class", "text_module_title text_center")
        .text("Mean Value By Brand");

    datasetParallelCoordinates = treatParallelCoordinatesDataset();
    treatAxesParallel([svg_height - margins.bottom, margins.top]);

    xPositionScaleParallelCoordinates = d3.scalePoint()
        .domain(axesParallelCoordinates.map(elem => elem['Name']))
        .range([margins.left, svg_width - margins.right])

    var group_axes = parallel_coordinates_svg.append("g");
    var group_axis = group_axes.selectAll("g.axis")
        .data(axesParallelCoordinates).enter()
        .append("g").classed("axis", true);

    group_axis.append("path")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("d", function(datum) {
            var line_coords = [[xPositionScaleParallelCoordinates(datum['Name']), margins.top], [xPositionScaleParallelCoordinates(datum['Name']), svg_height - margins.bottom]]
            return d3.line()(line_coords);
        });
    group_axis.append("text")
        .classed("text_axis_title", true)
        .attr("x", datum => xPositionScaleParallelCoordinates(datum['Name']))
        .attr("y", svg_height - margins.bottom * 0.50)
        .text(datum => datum['Name']);
    group_axis.append("text")
        .classed("text_axis_ticks text_left", true)
        .attr("id", "axis_tick_max")
        .attr("x", datum => xPositionScaleParallelCoordinates(datum['Name']) - 5)
        .attr("y", margins.top)
        .text(datum => datum['max']);
    group_axis.append("text")
        .classed("text_axis_ticks text_left", true)
        .attr("x", datum => xPositionScaleParallelCoordinates(datum['Name']) - 5)
        .attr("y", svg_height - margins.bottom)
        .text(datum => datum['min']);
    
    var group_paths = parallel_coordinates_svg.append("g").attr("class", "line_chart_paths");
    group_paths.selectAll("path.line_chart_path")
        .data(datasetParallelCoordinates).enter()
        .append("path").attr("class", "line_chart_path")
        .attr("id", datum => "path_line_" + brands_list.findIndex(elem => elem == datum['Brand']))
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("d", datum => createPathParallelCoordinates(datum));

    parallel_coordinates_svg.on("mousemove", (event, datum) => dispatch.call("hover_parallel_line_chart", this, event))
        .on("mouseout", (event, datum) => dispatch.call("hover_remove_parallel_line_chart", this))
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));
}

function treatParallelCoordinatesDataset() {
    var treated = []
    dataset_models.forEach(function(dataline) {
        var item = treated.find(elem => elem['Brand'] == dataline['Brand']);
        if (item == undefined) {
            item = {Brand: dataline['Brand']};
            axesParallelCoordinates.forEach(axis => item[axis['Name']] = {value: 0, total: 0})
            treated.push(item);
        }

        axesParallelCoordinates.forEach(function(axis) {
            var count = 0;
            var all_nulls = true;
            axis['attribute'].forEach(function(column) {
                if (dataline[column] != null) {
                    count += dataline[column];
                    all_nulls = false;
                }
            })

            if (!all_nulls) {
                item[axis['Name']].value += count;
                item[axis['Name']].total += 1;
            }
        });
    });

    treated.forEach(function(dataline) {
        axesParallelCoordinates.forEach(function(axis) {
            if (dataline[axis['Name']].total != 0) dataline[axis['Name']].value /= dataline[axis['Name']].total; 
            dataline[axis['Name']] = dataline[axis['Name']].value;
        });
    });

    //console.log(treated)
    return treated;
}

function treatAxesParallel(range) {
    axesParallelCoordinates.forEach(function(axis) {
        axis['min'] = 0;
        axis['max'] = d3.max(datasetParallelCoordinates, datum => Math.round(datum[axis['Name']] * 1.1));

        var scale = d3.scaleLinear()
            .domain([0, axis['max']])
            .range(range);
        axis['scale'] = scale;
    });

    //console.log(axesParallelCoordinates);
}

function createPathParallelCoordinates(datum) {
    var coords = axesParallelCoordinates.map(function(axis) {
        return [xPositionScaleParallelCoordinates(axis['Name']), axis['scale'](datum[axis['Name']])]
    });

    //console.log(coords);
    return d3.line()(coords);
}

function brandUpdateColorParallelCoordinates(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index)
        .transition().duration(1000)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");

    if (selected) {
        line_chart_1_svg.selectAll(".line_chart_paths")
            .select("#path_line_" + index).raise();
    }
}

function highlight_lineParallelCoordinates(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
        
    parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index)
        .attr("stroke-width", 3)
        .attr("stroke", (selected) ? getColorBrand(brand) : "black");   
}

function remove_highlight_lineParallelCoordinateaChart(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index)
        .attr("stroke-width", (selected) ? 2 : 1)
        .attr("stroke", (selected) ? getColorBrand(brand) : "grey");   
}

function getClosestPathParallelLineChart(event, max_distance = 100) {
    var paths;
    var coordinates = d3.pointer(event);
    var x = coordinates[0];
    var y = coordinates[1];

    paths = parallel_coordinates_svg.selectAll(".line_chart_paths").selectAll("path");
    
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

function updateParallelLineChart() {
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));
    const margins = {top: 50, right: 70, bottom: 35, left: 70}

    datasetParallelCoordinates = treatParallelCoordinatesDataset();
    treatAxesParallel([svg_height - margins.bottom, margins.top]);

    parallel_coordinates_svg.selectAll("g.axis")
        .data(axesParallelCoordinates);

    parallel_coordinates_svg.selectAll("g.axis")
        .selectAll("#axis_tick_max")
        .text(datum => datum['max']);

    parallel_coordinates_svg.selectAll("path.line_chart_path")
        .data(datasetParallelCoordinates)
        .attr("d", datum => createPathParallelCoordinates(datum));
}