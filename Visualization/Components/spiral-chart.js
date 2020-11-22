function build_spiral_chart() {
    spiral_chart_svg = d3.select("svg#spiral_chart");
    var svg_width = parseInt(spiral_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(spiral_chart_svg.style("height").slice(0, -2));
    const chartRadius = svg_height / 2
    const margin = { "top": 40, "bottom": 40, "left": 40, "right": 40 }

    let dateParse = d3.timeParse("%d/%m/%Y")
    let yearFormat = d3.timeFormat("%Y")
    let monthFormat = d3.timeFormat("%b")

    //Colour scale
    var colour = d3.scaleLinear().range([d3.rgb(153, 204, 255), d3.rgb(0, 76, 153)])

    //Load the data, nest, sort and draw charts

    //ENSURE THE DATA IS SORTED CORRECTLY, IN THIS CASE BY YEAR AND MONTH
    //THE SPIRAL WILL START IN THE MIDDLE AND WORK OUTWARDS

    var date1 = start_date.getFullYear();
    var date2 = end_date.getFullYear();
    var dataset_brands_year = dataset_brands.filter(elem => parseInt(elem['Year']) >= date1)
                                            .filter(elem => parseInt(elem['Year']) <= date2)
                                            .map((a) => ([parseInt(a['Year']), parseInt(a['# Models'])]));

    var dataset_brands_filtered_year = {};
    dataset_brands_year.forEach(function(datum) {
        if (datum[0] in dataset_brands_filtered_year) {
            dataset_brands_filtered_year[datum[0]] += datum[1];
        }
        else
            dataset_brands_filtered_year[datum[0]] = 0;
    });

    var dataset_spiral_chart = [];
    for (let key in dataset_brands_filtered_year)
        dataset_spiral_chart.push({"Year": key, "Models": dataset_brands_filtered_year[key]});

    console.log(dataset_brands_filtered_year)
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
        .attr("transform", "translate("
        + (svg_width /2)
        + ","
        + (svg_height / 2) + ")");

    g.datum(dataset_spiral_chart)
        .call(heatmap);

    g.selectAll(".arc").selectAll("path")
        .style("fill", function (d) { return colour(d["Models"]); })

    function convertTextToNumbers(d) {
        d.value = +d.value;
        d.date = dateParse(d.date);
        d.year = yearFormat(d.date);
        d.month = monthFormat(d.date);
        return d;
    };
}