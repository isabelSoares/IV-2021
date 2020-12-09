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

    const tickWidth = 50;
    const tickHeight = 20;
    var group_tick = group_axis.append("g").classed("value_tick hidden", true)
        .attr("transform", datum => "translate(" + (xPositionScaleParallelCoordinates(datum['Name']) - tickWidth - 5) +
             "," + 100 + ")");
    group_tick.append("rect")
        .attr("fill", "white")
        .attr("width", tickWidth)
        .attr("height", tickHeight);
    group_tick.append("text")
        .classed("text_axis_ticks text_left", true)
        .attr("x", tickWidth - 5)
        .attr("y", tickHeight / 2)
        .attr("font_weight", "bold")
        .attr("dominant-baseline", "middle")
        .text(0);
    
    var group_paths = parallel_coordinates_svg.append("g").attr("class", "line_chart_paths");
    group_paths.selectAll("path.line_chart_path")
        .data(datasetParallelCoordinates).enter()
        .append("path").attr("class", "line_chart_path")
        .attr("id", datum => "path_line_" + brands_list.findIndex(elem => elem == datum['Brand']))
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("d", datum => createPathParallelCoordinates(datum));

    parallel_coordinates_svg.on("mousemove", (event, datum) => hover_brand_parallel_line_chart(event))
        .on("mouseout", (event, datum) => hover_remove_brand_parallel_line_chart())
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

function hover_brand_parallel_line_chart(event){
    var newCloseToBrand
    var path = getClosestPathParallelLineChart(event, 50);

    if (path != undefined) {
        const index = parseInt(d3.select(path).attr("id").split("_")[2]);
        newCloseToBrand = brands_list[index];
    } else newCloseToBrand = undefined

    if (closeToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_remove_brand", this, closeToBrand)
    }

    if (newCloseToBrand != undefined && newCloseToBrand != closeToBrand) {
        dispatch.call("hover_brand", this, event, undefined, newCloseToBrand);
    }

    closeToBrand = newCloseToBrand;   
}

function hover_remove_brand_parallel_line_chart() {
    dispatch.call("hover_remove_brand", this, closeToBrand)
    closeToBrand = undefined;
}

function showAxisValue(brand) {
    const tickWidth = 50;
    const tickHeight = 20;
    var information = datasetParallelCoordinates.find(elem => elem['Brand'] == brand);
    if (information == undefined) hideAxisValue();

    var ticks = parallel_coordinates_svg.selectAll("g.value_tick")
        .attr("transform", datum => "translate(" + (xPositionScaleParallelCoordinates(datum['Name']) - tickWidth - 5) +
             "," + datum['scale'](information[datum['Name']]) + ")");

    ticks.classed("hidden", false).raise();
    ticks.select("text")
        .text(datum => Math.round(information[datum['Name']]));
}

function hideAxisValue() {
    var ticks = parallel_coordinates_svg.selectAll("g.value_tick")
        .classed("hidden", true);
}