var spiral_chart_svg
var selected_period_months = 12

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

    var colour = d3.scaleLinear().range([d3.rgb(153, 204, 255), d3.rgb(0, 76, 153)])

    var date1 = start_date.getFullYear();
    var date2 = end_date.getFullYear();
    var dataset_brands_year = dataset_brands.filter(elem => parseInt(elem['Year']) >= date1)
                                            .filter(elem => parseInt(elem['Year']) <= date2)
                                            .map((a) => ([parseInt(a['Year']), parseInt(a['# Models'])]));

    var dataset_brands_filtered_year = {};
    dataset_brands_year.forEach( function(datum) {
        if (datum[0] in dataset_brands_filtered_year) dataset_brands_filtered_year[datum[0]] += datum[1];
        else dataset_brands_filtered_year[datum[0]] = 0;
    });

    var dataset_spiral_chart = [];
    for (let key in dataset_brands_filtered_year)
        dataset_spiral_chart.push({"Year": key, "Models": dataset_brands_filtered_year[key]});

    // console.log(dataset_brands_filtered_year)
    colour.domain(d3.extent(dataset_spiral_chart, function (d) { return d["Models"]; }));

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
        .style("fill", function (d) { return colour(d["Models"]); })

    addPeriodSelection();
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
        console.log("New Selected Period Months: ", selected_period_months);
    }

    spiral_chart_svg.selectAll("circle")
        .call(d3.drag()
            .on("drag", dragged));
}