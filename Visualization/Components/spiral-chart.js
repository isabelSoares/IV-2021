var spiral_chart_svg
var selected_period_months = 12
var spiral_color_scale

const PERIODS_AVAILABLE = [
    {"display": "1 Sem", "months": 6},
    {"display": "1 Year", "months": 12},
    {"display": "2 Years", "months": 24},
    {"display": "3 Years", "months": 36},
    {"display": "4 Years", "months": 48},
]

function build_spiral_chart() {
    spiral_chart_svg = d3.select("svg#spiral_chart");
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));

    const margin = { "top": 0, "bottom": 20, "left": 20, "right": 20 }
    const chartRadius = svg_height / 2 - margin.bottom

    var dataset_brands_year = dataset_brands.map((a) => ([parseInt(a['Year']), parseInt(a['# Models'])]));

    var dataset_brands_filtered_year = {};
    dataset_brands_year.forEach( function(datum) {
        if (datum[0] in dataset_brands_filtered_year) dataset_brands_filtered_year[datum[0]] += datum[1];
        else dataset_brands_filtered_year[datum[0]] = 0;
    });

    var dataset_spiral_chart = [];
    for (let key in dataset_brands_filtered_year)
        dataset_spiral_chart.push({"Year": key, "Models": dataset_brands_filtered_year[key]});

    addColorScale(d3.extent(dataset_spiral_chart, datum => datum["Models"]), d3.rgb(153, 204, 255), d3.rgb(0, 76, 153));

    //set the options for the sprial heatmap
    let heatmap = spiralHeatmap()
        .radius(chartRadius)
        .holeRadiusProportion(0)
        .arcsPerCoil(4)
        .coilPadding(0.05)
        .arcLabel("month")
        .coilLabel("year")

    const g = spiral_chart_svg.append("g")
        .attr("transform", "translate(" + 
            (svg_width / 2) + "," + 
            (svg_height / 2 - margin.bottom + margin.top) + ")");

    g.datum(dataset_spiral_chart)
        .call(heatmap);

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
        .attr("x", svg_width - (svg_width / 10 + WIDTH / 2))
        .attr("y", svg_height * 2 / 5 - HEIGHT / 3)
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("fill", "url(#linearGradient)");

    scale_g.append("text")
        .attr("x",  svg_width - (svg_width / 20 + WIDTH + 15))
        .attr("y", HEIGHT / 3 + 180)
        .text(datum[0]);
    scale_g.append("text")
        .attr("x", svg_width - (svg_width / 20 + WIDTH + 20))
        .attr("y", HEIGHT / 2 - 10)
        .text(datum[1]);
}

function addPeriodSelection() {
    const LINE_WIDTH = 300;

    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    var range = d3.range(0, 1, 1 / (PERIODS_AVAILABLE.length - 1)).concat(1).map(elem => elem * LINE_WIDTH);

    // console.log(range);
    // console.log(PERIODS_AVAILABLE.map(elem => elem.months));

    period_scale = d3.scaleLinear()
        .range(range)
        .domain(PERIODS_AVAILABLE.map(elem => elem.months));

    period_axis = d3.axisBottom()
        .tickPadding(15)
        .tickValues(PERIODS_AVAILABLE.map(elem => elem.months))
        .tickFormat(datum => PERIODS_AVAILABLE.find(elem => elem.months == datum).display)
        .scale(period_scale);
    
    spiral_chart_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (svg_height - 40) + ")")
        .call(period_axis);

    spiral_chart_svg.append("circle")
        .attr("cx", period_scale(selected_period_months))
        .attr("cy", 0)
        .attr("r", 7)
        .attr("fill", "blue")
        .attr("id", "period_circle")
        .attr("class", "circle_selector")
        .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (svg_height - 40) + ")");

    prepare_event_period_selection();
}

function prepare_event_period_selection() {
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const LINE_WIDTH = 300;

    function dragged(event, datum) {
        var new_x = event.x - (svg_width - LINE_WIDTH) / 2;
        if (new_x < 0) new_x = 0;
        else if (new_x > LINE_WIDTH) new_x = LINE_WIDTH;

        var new_period_months = period_scale.invert(new_x);
        var closest_period_monts = PERIODS_AVAILABLE.reduce(function(prev, curr) {
            if ((Math.abs(curr.months - new_period_months) < Math.abs(prev.months - new_period_months))) return curr;
            else return prev;
        }).months;

        d3.select(this)
            .attr("cx", period_scale(closest_period_monts))
            .attr("transform", "translate(" + (svg_width - LINE_WIDTH) / 2 + "," + (svg_height - 40) + ")");
        
        selected_period_months = closest_period_monts;
        // console.log("New Selected Period Months: ", selected_period_months);
    }

    spiral_chart_svg.selectAll("circle")
        .call(d3.drag()
            .on("drag", dragged));
}