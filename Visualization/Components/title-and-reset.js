var title_and_reset_svg

function build_title_and_reset() {
    title_and_reset_svg = d3.select("#title_and_reset");
    var svg_width = parseInt(title_and_reset_svg.style("width").slice(0, -2));
    var svg_height = parseInt(title_and_reset_svg.style("height").slice(0, -2));

    const radius = 0.40 * svg_height;
    const imageSide = 0.40 * svg_height;

    title_and_reset_svg.append("text")
        .classed("text_center text_title", true)
        .attr("dominant-baseline", "middle")
        .attr("x", "40%")
        .attr("y", "25%")
        .text("The Evolution of Mobile Phones:");
    title_and_reset_svg.append("text")
        .classed("text_center text_title", true)
        .attr("dominant-baseline", "middle")
        .attr("x", "40%")
        .attr("y", "75%")
        .text("Brands and Specs");

    var resetButton = title_and_reset_svg.append("g")
        .classed("button inactive", true)
        .attr("id", "resetButton")
        .attr("transform", "translate(" + 0.90 * svg_width + "," + 0.5 * svg_height + ")");
    resetButton.append("circle")
        .classed("backdropCircle", true)
        .attr("r", 1.25 * radius)
        .attr("cx", 0)
        .attr("cy", 0);
    resetButton.append("circle")
        .classed("buttonCircle", true)
        .attr("r", radius)
        .attr("cx", 0)
        .attr("cy", 0);
    resetButton.append("image")
        .classed("buttonImage", true)
        .attr("x", 0 - imageSide / 2)
        .attr("y", 0 - imageSide / 2)
        .attr("width", imageSide)
        .attr("height", imageSide)
        .attr("xlink:href", "Resources/reset.png");

    resetButton.on("click", function(event, datum) {
        if (! changesToReset()) return;
        dispatch.call("reset_visualization", this);

        var element = d3.select(this);
        element.classed("hover", true);
        element.select(".buttonImage").attr("xlink:href", "Resources/reset.png");
    })
    .on("mouseenter", function(event, datum) {
        if (! changesToReset()) return;
        var element = d3.select(this);
        element.classed("hover", true);
        element.select(".buttonImage").attr("xlink:href", "Resources/reset-white.png");
    })
    .on("mouseleave", function(event, datum) {
        var element = d3.select(this);
        element.classed("hover", false);
        element.select(".buttonImage").attr("xlink:href", "Resources/reset.png");
    });
}

function changesToReset() {
    
    return !(zoomLevel == 1
        && selected_brands.includes("Apple") && selected_brands.includes("Xiaomi") && selected_brands.length == 2
        && axesParallelCoordinates.filter(elem => elem['filter'] != undefined).length == 0
        && start_date.getTime() == min_date.getTime() && end_date.getTime() == max_date.getTime()
        && selectedAxis == undefined
        && selected_period_months == PERIODS_AVAILABLE[2])
}

function updateResetButton() {
    title_and_reset_svg.select(".button").classed("inactive", !changesToReset());
}