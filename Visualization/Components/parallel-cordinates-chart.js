var parallel_coordinates_svg
var datasetParallelCoordinates
var xPositionScaleParallelCoordinates
var axesParallelCoordinates = [
    {Name: "Battery Amps/h", round: 0, attribute: ["battery_amps"], dragging: false, filter: null, brush: undefined},
    {Name: "Internal Memory MB", round: 0, attribute: ["im_MB"], dragging: false, filter: null, brush: undefined},
    {Name: "RAM MB", round: 1, attribute: ["ram_MB"], dragging: false, filter: null, brush: undefined},
    {Name: "Camera MP", round: 1, attribute: ["primary_camera_MP"], dragging: false, filter: null, brush: undefined},
    {Name: "Number of Sensors/ Model", round: 2, attribute: ["sensor_accelerometer","sensor_fingerprint","sensor_heart_rate","sensor_iris_scanner","sensor_proximity","sensor_temperature"], dragging: false, filter: null, brush: undefined},
    {Name: "Aspect Ratio", round: 2, attribute: ["aspect_ratio"], dragging: false, filter: null, brush: undefined},
    {Name: "Screen/Body Ratio", round: 2, attribute: ["screen_body_ratio"], dragging: false, filter: null, brush: undefined},
]

var filteredBrands = []

function build_parallel_coordinates_chart() {
    parallel_coordinates_svg = d3.select("#parallel_coordinates_chart");
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));

    const margins = {top: 0.16 * svg_height, right: 0.05 * svg_width, bottom: 0.12 * svg_height, left: 0.05 * svg_width}
    
    parallel_coordinates_svg.append("text")
        .attr("x", "50%")
        .attr("y", "7%")
        .attr("class", "text_module_title text_center")
        .text("Mean Values By Brand");

    xPositionScaleParallelCoordinates = d3.scalePoint()
        .domain(axesParallelCoordinates.map(elem => elem['Name']))
        .range([margins.left, svg_width - margins.right]);
    
    datasetParallelCoordinates = treatParallelCoordinatesDataset();
    treatAxesParallel([svg_height - margins.bottom, margins.top]);

    var group_axes = parallel_coordinates_svg.append("g");
    var group_axis = group_axes.selectAll("g.axis")
        .data(axesParallelCoordinates, datum => datum['Name']).enter()
        .append("g").classed("axis", true)
        .attr("transform", datum => "translate(" + xPositionScaleParallelCoordinates(datum['Name']) + ",0)");

    group_axis.append("path")
        .attr("d", function() {
            var line_coords = [[0, margins.top], [0, svg_height - margins.bottom]]
            return d3.line()(line_coords);
        });
    group_axis.append("text")
        .classed("text_axis_title draggable bold_on_hover", true)
        .attr("x", 0)
        .attr("y", svg_height - margins.bottom * 0.25)
        .text(datum => datum['Name']);
    group_axis.append("text")
        .classed("text_axis_ticks text_center", true)
        .attr("id", "axis_tick_max")
        .attr("x", 0)
        .attr("y", margins.top * 0.80)
        .text(datum => datum['max'].toFixed(datum['round']));
    group_axis.append("text")
        .classed("text_axis_ticks text_center", true)
        .attr("id", "axis_tick_min")
        .style("dominant-baseline", "hanging")
        .attr("x", 0)
        .attr("y", svg_height - margins.bottom * 0.90)
        .text(datum => datum['min']);

    const brushWidth = 0.03 * svg_width;
    group_axis.append("text")
        .classed("text_axis_ticks text_left bold", true)
        .classed("hidden", datum => datum['filter'] == undefined)
        .attr("id", "axis_tick_min_region")
        .attr("dominant-baseline", "middle")
        .attr("x", - brushWidth / 2 - 5)
        .attr("y", datum => datum['filter'] == undefined ? margins.top : datum['filter'][1] - 0.03 * svg_height)
        .text(datum => datum['filter'] == undefined ? 0 : datum['scale'].invert(datum['filter'][1]).toFixed(datum['round']));
    group_axis.append("text")
        .classed("text_axis_ticks text_left bold", true)
        .classed("hidden", datum => datum['filter'] == undefined)
        .attr("id", "axis_tick_max_region")
        .attr("dominant-baseline", "middle")
        .attr("x", - brushWidth / 2 - 5)
        .attr("y", datum => datum['filter'] == undefined ? margins.top : datum['filter'][0] + 0.03 * svg_height)
        .text(datum => datum['filter'] == undefined ? 0 : datum['scale'].invert(datum['filter'][0]).toFixed(datum['round']));

    // DEAL WITH DRAGGING
    group_axis.call(d3.drag()
        .on("start", function(event, datum) {
            if (! d3.select(event.sourceEvent.target).classed("draggable")) return;
            var draggedAxis = d3.select(this);
            draggedAxis.select(".bold_on_hover").classed("bold", true);
            
            var itemAxes = axesParallelCoordinates.find(elem => elem == datum);
            itemAxes['dragging'] = true;
            this.__origin__ = xPositionScaleParallelCoordinates(itemAxes['Name']);
        })
        .on("drag", function(event, datum) {
            if (! datum['dragging']) return;
            var draggedAxis = d3.select(this);
            
            this.__origin__ += event.dx;
            if (this.__origin__ <= 0.99 * margins.left) this.__origin__ = 0.99 * margins.left;
            if (this.__origin__ >= svg_width - 0.99 * margins.right) this.__origin__ = svg_width - 0.99 * margins.right;
            axesParallelCoordinates.sort((a, b) => positionAxis(a, this.__origin__) - positionAxis(b, this.__origin__));
            xPositionScaleParallelCoordinates.domain(axesParallelCoordinates.map(elem => elem['Name']));
            group_axis.attr("transform", datum => "translate(" + (positionAxis(datum, this.__origin__)) + ",0)");
        })
        .on("end", function(event, datum) {
            if (! datum['dragging']) return;
            var draggedAxis = d3.select(this);
            draggedAxis.select(".bold_on_hover").classed("bold", false);

            var itemAxes = axesParallelCoordinates.find(elem => elem == datum);
            itemAxes['dragging'] = false;

            
            axesParallelCoordinates.sort((a, b) => positionAxis(a) - positionAxis(b));
            xPositionScaleParallelCoordinates.domain(axesParallelCoordinates.map(elem => elem['Name']));
            group_axis.attr("transform", datum => "translate(" + (positionAxis(datum)) + ",0)");

            delete this.__origin__;
            updateParallelLineChart();
        }));

    // DEAL WITH BRUSHING
    group_axis.append("g").classed("brush", true)
        .each(function(datum) {
            var brush = d3.brushY()
                .extent( [ [- brushWidth / 2, margins.top], [brushWidth / 2, svg_height - margins.bottom] ] )
                .on("start brush end", function(event, datum) {
                    
                    datum['filter'] = event.selection;
                    

                    changedBrushingParallelLineChart();
                });

            d3.select(this).call(brush);
            datum['brush'] = brush;
        });
        

    const tickWidth = 50;
    const tickHeight = 20;
    var group_tick = group_axis.append("g").classed("value_tick hidden", true)
        .attr("transform", datum => "translate(" + (- tickWidth - 5) +
             "," + 100 + ")");
    group_tick.append("rect")
        .attr("width", tickWidth)
        .attr("height", tickHeight)
        .attr("rx", 5)
        .attr("ry", 5);
    group_tick.append("text")
        .classed("text_axis_ticks text_left", true)
        .attr("x", tickWidth - 5)
        .attr("y", tickHeight / 2)
        .attr("font_weight", "bold")
        .attr("dominant-baseline", "middle")
        .text(0);
    
    var group_paths = parallel_coordinates_svg.append("g").attr("class", "line_chart_paths");
    group_paths.append("rect")
        .classed("hover-region hidden", true)
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", svg_width - margins.left - margins.right)
        .attr("height", svg_height - margins.top - margins.bottom);
    group_paths.selectAll("path.brand_line")
        .data(datasetParallelCoordinates, datum => datum['Brand']).enter()
        .append("path").attr("class", "brand_line")
        .attr("id", datum => "path_line_" + brands_list.findIndex(elem => elem == datum['Brand']))
        .attr("d", datum => createPathParallelCoordinates(datum));

    parallel_coordinates_svg.select(".line_chart_paths")
        .on("mousemove", (event, datum) => hover_brand_parallel_line_chart(event))
        .on("mouseout", (event, datum) => hover_remove_brand_parallel_line_chart())
        .on("click", (event, datum) => dispatch.call("clickBrandLine", this));

    group_axes.raise();

    // parallel_coordinates_svg.append(() => createButtonRemoveBrushes())
}

function positionAxis(datum, positionDragged = undefined) {
    if (datum['dragging']) return positionDragged;
    return xPositionScaleParallelCoordinates(datum['Name']);
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
    return treated;
}

function treatAxesParallel(range) {
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));
    const brushWidth = 0.03 * svg_width;

    axesParallelCoordinates.forEach(function(axis) {
        // Keep Brush Selection even if scale changes
        if (axis['filter'] != undefined) {
            var value_filter = [];
            axis['filter'].forEach(value => value_filter.push(axis['scale'].invert(value)));
        }

        axis['min'] = 0;
        axis['max'] = Math.ceil(d3.max(datasetParallelCoordinates, datum => datum[axis['Name']]));

        var scale = d3.scaleLinear()
            .domain([0, axis['max']])
            .range(range);
        axis['scale'] = scale;

        // Update Brush Selection even if scale changes
        if (axis['filter'] != undefined) {
            if (value_filter[0] > axis['max']) value_filter[0] = axis['max'];
            if (value_filter[1] < axis['min']) value_filter[1] = axis['min'];

            var filter = [];
            value_filter.forEach(value => filter.push(axis['scale'](value)));
            parallel_coordinates_svg.selectAll("g.axis").filter(datum => datum['Name'] == axis['Name'])
                .select(".brush")
                .each(function() {
                    var element = d3.select(this).transition().duration(2000);
                    if (filter[0] != filter[1] && filter[0] < filter[1]) element.call(axis['brush'].move, [filter[0], filter[1]]);
                    else element.call(axis['brush'].clear);
                });
        }
    });
}

function createPathParallelCoordinates(datum) {
    var coords = axesParallelCoordinates.map(function(axis) {
        return [xPositionScaleParallelCoordinates(axis['Name']), axis['scale'](datum[axis['Name']])]
    });

    return d3.line()(coords);
}

function brandUpdateColorParallelCoordinates(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    const selected = selected_brands.includes(brand);
    
    var line = parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index);
    line.classed("selected", selected);
    line.attr("stroke", (selected) ? getColorBrand(brand) : "darkgrey");

    if (selected) {
        line_chart_1_svg.selectAll(".line_chart_paths")
            .select("#path_line_" + index).raise();
    }
}

function highlight_lineParallelCoordinates(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
        
    parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index)
        .classed("hover", true)
        .raise();   
}

function remove_highlight_lineParallelCoordinateaChart(brand) {
    const index = brands_list.findIndex(elem => elem == brand);
    
    parallel_coordinates_svg.selectAll(".line_chart_paths")
        .select("#path_line_" + index)
        .classed("hover", false);   
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
    return min_path;
}

function updateParallelLineChart() {
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));
    const margins = {top: 0.16 * svg_height, right: 0.05 * svg_width, bottom: 0.12 * svg_height, left: 0.05 * svg_width};
    datasetParallelCoordinates = treatParallelCoordinatesDataset();
    treatAxesParallel([svg_height - margins.bottom, margins.top]);

    parallel_coordinates_svg.selectAll("g.axis")
        .data(axesParallelCoordinates, datum => datum['Name']);
    
    parallel_coordinates_svg.selectAll("g.axis")
        .selectAll("#axis_tick_max")
        .transition("Update Time Axis Line Chart").duration(500)
        .style("opacity", 0)
        .on("end", function() {
            d3.select(this).text(datum => datum['max'].toFixed(datum['round']))
                .transition("Update Time Axis Line Chart").duration(500)
                .style("opacity", 1);
        });

    var paths = parallel_coordinates_svg.select(".line_chart_paths").selectAll("path.brand_line")
        .data(datasetParallelCoordinates, datum => datum['Brand']);
    paths.exit().remove();
    paths.enter().append("path").attr("class", "brand_line")
        .attr("id", datum => "path_line_" + brands_list.findIndex(elem => elem == datum['Brand']))
        .each(function() {
            var path = d3.select(this).attr("d", datum => createPathParallelCoordinates(datum))
                .classed("selected", datum => selected_brands.includes(datum['Brand']))
                .each(function(datum) {
                    if (! selected_brands.includes(datum['Brand'])) return;
                    d3.select(this).attr("stroke", getColorBrand(datum['Brand']))
                });
            var pathLength = path.node().getTotalLength();

            path.attr("stroke-dashoffset", pathLength)
                .attr("stroke-dasharray", pathLength)
                .transition("Update Path Parallel Coordinates Create").duration(2000)
                .attr("stroke-dashoffset", 0);
            })

    paths.each(function() {
        var path = d3.select(this);
        path.attr("stroke-dashoffset", null).attr("stroke-dasharray", null);
        path.transition("Update Path Parallel Coordinates Remove").duration(1000)
            .attr("d", datum => createPathParallelCoordinates(datum));
        var pathLength = path.node().getTotalLength();
        
    });
    
    changedBrushingParallelLineChart();
}

function changedBrushingParallelLineChart() {
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));
    const margins = {top: 0.16 * svg_height, right: 0.05 * svg_width, bottom: 0.12 * svg_height, left: 0.05 * svg_width};

    filteredBrands = []

    // UPDATE BRUSH AXIS
    const brushWidth = 0.03 * svg_width;
    const range = svg_height - margins.top - margins.bottom;
    parallel_coordinates_svg.selectAll("#axis_tick_min_region")
        .classed("hidden", datum => datum['filter'] == undefined)
        .attr("y", datum => datum['filter'] == undefined ? margins.top : datum['filter'][1])
        .text(datum => datum['filter'] == undefined ? 0 : datum['scale'].invert(datum['filter'][1]).toFixed(datum['round']));
    parallel_coordinates_svg.selectAll("#axis_tick_max_region")
        .classed("hidden", datum => datum['filter'] == undefined)
        .classed("text_left", datum => datum['filter'] == undefined || datum['filter'][1] - datum['filter'][0] > 0.15 * range)
        .classed("text_right", datum => !(datum['filter'] == undefined || datum['filter'][1] - datum['filter'][0] > 0.15 * range))
        .attr("x", function(datum) {
            if (datum['filter'] == undefined) return 0;
            if (datum['filter'][1] - datum['filter'][0] > 0.15 * range)
                return - brushWidth / 2 - 5;
            else return brushWidth / 2 + 5;
        })
        .attr("y", datum => datum['filter'] == undefined ? margins.top : datum['filter'][0])
        .text(datum => datum['filter'] == undefined ? 0 : datum['scale'].invert(datum['filter'][0]).toFixed(datum['round']));

    parallel_coordinates_svg.selectAll("path.brand_line")
        .each(function(datum, index) {
            var isSelected = true;
            axesParallelCoordinates.forEach(function(axis) {
                if (axis['filter'] == null) return;
                var filter = axis['filter'];
                var value = axis['scale'](datum[axis['Name']]);
                var insideRegion = value >= filter[0] && value <= filter[1];
                isSelected = isSelected && insideRegion;
            });

            if (isSelected) filteredBrands.push(datum['Brand']);

        });

    var regionsToRemove = false;
    axesParallelCoordinates.forEach(axis => { if (axis['filter'] != null) regionsToRemove = true; })
    parallel_coordinates_svg.select(".removeBrushes .button").classed("inactive", !regionsToRemove);

    dispatch.call("filtered_brand", this);
}

function filterBrandsParallelCoordinates() {
    var paths = parallel_coordinates_svg.selectAll("path.brand_line");
    var unselectedBrands = brands_list.filter(brand => !selected_brands.includes(brand));
    var unfilteredBrands = brands_list.filter(brand => !filteredBrands.includes(brand));

    // UPDATE NOT FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (filteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem['Brand'] == brand);
        path.classed("filtered", true).raise();
    });
    
    // UPDATE FILTERED AND NOT SELECTED BRANDS
    unselectedBrands.forEach(function(brand) {
        if (unfilteredBrands.includes(brand)) return;
        var path = paths.filter(elem => elem['Brand'] == brand);
        path.classed("filtered", false).raise();
    });

    // UPDATE SELECTED BRANDS
    selected_brands.forEach(function(brand) {
        var path = paths.filter(elem => elem['Brand'] == brand);
        path.classed("filtered", false).raise();
    });
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
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    const tickHeight = 20;
    var information = datasetParallelCoordinates.find(elem => elem['Brand'] == brand);
    if (information == undefined) { hideAxisValue(); return };

    var ticks = parallel_coordinates_svg.selectAll("g.value_tick");
    
    ticks.classed("hidden", false);
    ticks.select("text")
        .text(datum => (Math.round(information[datum['Name']] * Math.pow(10, datum['round'])) / Math.pow(10, datum['round'])).toFixed(datum['round']));

    ticks.each(function() {
        var tick = d3.select(this);
        var rect = tick.select("rect");
        var text = tick.select("text");
        var text_width = text.node().getComputedTextLength();
        const rect_width = text_width + 0.012 * svg_width;

        text.attr("x", rect_width - 5);
        rect.attr("width", rect_width);
        tick.attr("transform", datum => "translate(" + (- rect_width - 5) +
            "," + moveYParallelLineChartTooltip(information, datum, datum['scale'](information[datum['Name']])) + ")");
    })
}

function moveYParallelLineChartTooltip(infomation, datum, value) {
    const tickWidth = 50;
    const tickHeight = 20;
    const variance = 15;

    const range = datum['scale'].range()
    const threshold = Math.abs(range[0] - range[1]) / 2;

    if (value > threshold) return value - tickHeight - variance
    else return value + variance
}

function hideAxisValue() {
    var ticks = parallel_coordinates_svg.selectAll("g.value_tick")
        .classed("hidden", true);
}

function createButtonRemoveBrushes() {
    var svg_width = parseInt(parallel_coordinates_svg.style("width").slice(0, -2));
    var svg_height = parseInt(parallel_coordinates_svg.style("height").slice(0, -2));
    const radius = 0.07 * svg_height;
    const imageSide = 0.08 * svg_height;

    var buttonsGroup = d3.create("svg:g")
        .classed("removeBrushes", true)
        .attr("transform", "translate(" + ((0.935 + 0.04) * svg_width) + "," + (0.10 * svg_height) + ")");

    var button = buttonsGroup.append("g").classed("button inactive", true)
        .on("mouseenter", function() {
            var regionsToRemove = false;
            axesParallelCoordinates.forEach(axis => { if (axis['filter'] != null) regionsToRemove = true; })
            if (! regionsToRemove) return;

            var element = d3.select(this);
            element.classed("hover", true);
            element.select(".buttonImage").attr("xlink:href", "Resources/delete-white.png");
        })
        .on("mouseleave", function() {
            var element = d3.select(this);
            element.classed("hover", false)
            element.select(".buttonImage").attr("xlink:href", "Resources/delete.png");
        })
        .on("click", function() {
            var regionsToRemove = false;
            axesParallelCoordinates.forEach(axis => { if (axis['filter'] != null) regionsToRemove = true; })
            if (! regionsToRemove) return;

            parallel_coordinates_svg.selectAll(".brush").call(d3.brush().clear);
            axesParallelCoordinates.forEach(axis => axis['filter'] = null);
            changedBrushingParallelLineChart();

            var element = d3.select(this);
            element.classed("hover", false);
            element.select(".buttonImage").attr("xlink:href", "Resources/delete.png");
        });

    button.append("circle")
        .classed("buttonCircle", true)
        .attr("r", radius)
        .attr("cx", 0)
        .attr("cy", 0);

    button.append("image")
        .classed("buttonImage", true)
        .attr("x", - imageSide / 2)
        .attr("y", 0 - imageSide / 2)
        .attr("width", imageSide)
        .attr("height", imageSide)
        .attr("xlink:href", "Resources/delete.png");

    return buttonsGroup.node();
}

function resetBrushes() {
    parallel_coordinates_svg.selectAll(".brush").call(d3.brush().clear);
    axesParallelCoordinates.forEach(axis => axis['filter'] = null);
    changedBrushingParallelLineChart();
}