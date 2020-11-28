const PERIODS_AVAILABLE = [
    {"display": "1 Sem", "months": 6, "div": 6, "by": "month"},
    {"display": "1 Year", "months": 12, "div": 12, "by": "month"},
    {"display": "2 Years", "months": 24, "div": 8, "by": "quarter"},
    {"display": "3 Years", "months": 36, "div": 12, "by": "quarter"},
    {"display": "4 Years", "months": 48, "div": 8, "by": "semester"},
]
var spiral_chart_svg
var selected_period_months = PERIODS_AVAILABLE[1]
var spiral_color_scale
var spiral_heatmap
var dataset_spiral_chart

function build_spiral_chart() {
    spiral_chart_svg = d3.select("svg#spiral_chart");
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));

    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const chartRadius = svg_height / 2 - margin.bottom;

    dataset_spiral_chart = treatDataset();
    addColorScale(d3.extent(dataset_spiral_chart, datum => datum["Models"]), d3.rgb(153, 204, 255), d3.rgb(0, 76, 153));

    //set the options for the sprial heatmap
    spiral_heatmap = spiralHeatmap()
        .radius(chartRadius)
        .holeRadiusProportion(0)
        .arcsPerCoil(selected_period_months['div'])
        .coilPadding(0.05)
        .arcLabel("Month")
        .coilLabel("Year")

    const g = spiral_chart_svg.append("g")
        .attr("id", "spiral_group")
        .attr("transform", "translate(" + 
            (svg_width / 2) + "," + 
            (svg_height / 2 - margin.bottom + margin.top) + ")");

    g.datum(dataset_spiral_chart)
        .call(spiral_heatmap);

    g.selectAll(".arc").selectAll("path")
        .style("fill", function (d) { return spiral_color_scale(d["Models"]); })

    const BOX_HEIGHT = svg_height / 10;
    spiral_chart_svg.append("text")
            .attr("x", svg_width * 2 / 3)
            .attr("y", BOX_HEIGHT / 2 -  10 )
            .attr("text-anchor", "right")
            .attr("dominant-baseline", "middle")
            .attr("dy", ".35em")
            .text("Number of Models")

    addPeriodSelection();
}

function treatDataset() {
    var groupBy = selected_period_months['by'];

    var filteredDataset = [];
    if (selected_brands.length == 0) filteredDataset = dataset_models;
    else filteredDataset = dataset_models.filter(elem => selected_brands.includes(elem['Brand']));

    var finalDataset = []
    for (var year = start_date.getFullYear(); year <= end_date.getFullYear(); year ++) {
        var step;
        if (groupBy == 'month') step = 1;
        else if (groupBy == 'quarter') step = 3;
        else if (groupBy == 'semester') step = 6;

        for (var month = 0; month < 12; month += step)
            finalDataset.push({'Date': new Date(year, month, 1), 'Models': 0});
            // finalDataset.push({'Date': new Date(year, month, 1), 'Year': year, 'Month': month, 'Models': 0});
    }
    
    filteredDataset.forEach(function(elem) {
        var month = undefined;
        var year = elem['Date'].getFullYear();
        
        if (groupBy == 'month') month = elem['Date'].getMonth();
        else if (groupBy == 'quarter') month = Math.floor(elem['Date'].getMonth() / 3) * 3;
        else if (groupBy == 'semester') month = Math.floor(elem['Date'].getMonth() / 6) * 6;
        
        var date = new Date(year, month, 1)
        var item = finalDataset.find(elem2 => elem2['Date'].getTime() == date.getTime());
        var push_elem = {'Date': date, 'Models': 1};

        if (item == undefined) console.log("Something went wrong!")
        else item['Models'] += 1;
    })

    var sortedFinalDataset = finalDataset.sort((a, b) => a['Date'] - b['Date'])

    for (var i = sortedFinalDataset.length - 1; i >= 0; i--) {
        if (sortedFinalDataset[i]['Models'] == 0) sortedFinalDataset.pop();
        else break;
    }

    console.log(sortedFinalDataset);
    return sortedFinalDataset;
}

function addColorScale(datum ,startColor, endColor) {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const WIDTH = svg_width / 40
    const HEIGHT = svg_height * 0.50

    spiral_color_scale = d3.scaleLinear().range([startColor, endColor]);
    spiral_color_scale.domain(datum);

    var defs = spiral_chart_svg.append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr("id", "linearGradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");
    
    linearGradient.append("stop")
        .attr("offset", 0)
        .attr("stop-color", startColor);
    linearGradient.append("stop")
        .attr("offset", 1)
        .attr("stop-color", endColor);

    var scale_g = spiral_chart_svg.append("g");

    scale_g.append("rect")
        .attr("x", svg_width - (svg_width / 10 + WIDTH))
        .attr("y", svg_height * 2 / 5 - HEIGHT / 3)
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("fill", "url(#linearGradient)");

    scale_g.append("text")
        .attr("class", "spiral_scale_number")
        .attr("id", "bottom_spiral_scale")
        .attr("x", svg_width - (svg_width / 10 + WIDTH / 2))
        .attr("y", svg_height * 2 / 5 + HEIGHT * 2 / 3 + svg_height * 0.06)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(datum[0]);
    scale_g.append("text")
        .attr("class", "spiral_scale_number")
        .attr("id", "top_spiral_scale")
        .attr("x", svg_width - (svg_width / 10 + WIDTH / 2))
        .attr("y", svg_height * 2 / 5 - HEIGHT / 3 - svg_height * 0.06)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(datum[1]);
}

function addPeriodSelection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));

    const LINE_WIDTH = svg_width * 0.75;
    const step = LINE_WIDTH / (PERIODS_AVAILABLE.length - 1);

    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));

    var axis = spiral_chart_svg.append("g").attr("class", "axis");
    axis.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()([[0 - 5, 0], [LINE_WIDTH + 5, 0]]))
    
    PERIODS_AVAILABLE.forEach(function(elem, index) {
        var tick = axis.append("g");
        tick.append("circle")
            .attr("class", "circle_point_axis")
            .attr("cx", step * index)
            .attr("cy", 0)
            .attr("r", 4)
            .attr("fill", "blue");
        tick.append("text")
            .attr("class", "text_point_axis")
            .attr("x", step * index)
            .attr("y", svg_height / 15)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(elem['display']);

    });
    axis.attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + svg_height * 0.90 + ")");

    axis.append("circle")
        .attr("cx", PERIODS_AVAILABLE.findIndex(elem => elem == selected_period_months) * step)
        .attr("cy", 0)
        .attr("r", 8)
        .attr("fill", "blue")
        .attr("id", "period_circle")
        .attr("class", "circle_selector");

    prepare_event_period_selection();
}

function prepare_event_period_selection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    const LINE_WIDTH = svg_width * 0.75;

    function dragged(event, datum) {
        var new_x = event.x;
        const step = LINE_WIDTH / (PERIODS_AVAILABLE.length - 1);
        
        const index = Math.round(new_x / step);
        if (index > PERIODS_AVAILABLE.length - 1) index = PERIODS_AVAILABLE.length - 1;
        else if (index < 0) index = 0;

        d3.select(this).attr("cx", index * step);
        selected_period_months = PERIODS_AVAILABLE[index];
        // console.log("New Selected Period Months: ", selected_period_months);
    }

    spiral_chart_svg.selectAll("circle")
        .call(d3.drag()
            .on("drag", dragged)
            .on("end", updateSpiralChart));
}

function updateSpiralChart() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const chartRadius = svg_height / 2 - margin.bottom;

    dataset_spiral_chart = treatDataset();
    var domain = d3.extent(dataset_spiral_chart, datum => datum["Models"]);
    spiral_color_scale.domain(domain);

    spiral_chart_svg.select("#bottom_spiral_scale").text(domain[0]);
    spiral_chart_svg.select("#top_spiral_scale").text(domain[1]);

    spiral_chart_svg.select("g#spiral_group").remove();

    spiral_heatmap = spiralHeatmap()
        .radius(chartRadius)
        .holeRadiusProportion(0)
        .arcsPerCoil(selected_period_months['div'])
        .coilPadding(0.05)
        .arcLabel("Month")
        .coilLabel("Year")

    const g = spiral_chart_svg.append("g")
        .attr("id", "spiral_group")
        .attr("transform", "translate(" + 
            (svg_width / 2) + "," + 
            (svg_height / 2 - margin.bottom + margin.top) + ")");

    g.datum(dataset_spiral_chart)
        .call(spiral_heatmap);

    g.selectAll(".arc").selectAll("path")
        .style("fill", function (d) { return spiral_color_scale(d["Models"]); })
}