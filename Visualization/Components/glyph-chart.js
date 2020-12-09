var glyph_chart_svg

function build_glyph_chart() {
    glyph_chart_svg = d3.select("#glyph_chart");
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));

    glyph_chart_svg.append(() => createMockPhone(2000, undefined))
        .attr("transform", "translate(" + (svg_width / 2) + "," + (svg_height / 2) + ")");
}

function createMockPhone(size, color = 'grey', colorComponent = 'white') {
    const screenRatio = 0.60
    const sizeCamera = 0.006
    const sizeWidthSpeaker = 0.4
    const sizeHeightSpeaker = 0.01
    const sizeWidthButton = 0.3
    const sizeHeightButton = 0.05

    const proportionHeightPhone = 1.8
    const phoneSymbol = createSymbol(proportionHeightPhone, 0.75);  
    const screenSymbol = createSymbol(1.5, 0.90);  
    const width = Math.sqrt(size / proportionHeightPhone);
    const height = proportionHeightPhone * width;

    var phone = d3.create("svg:g").classed("mock_phone", true);

    phone.append("path")
        .attr("d", d3.symbol().type(phoneSymbol).size(size))
        .attr("fill", "black");
    phone.append("path")
        .attr("d", d3.symbol().type(screenSymbol).size(size * screenRatio))
        .attr("fill", color);
    phone.append("path")
        .attr("d", d3.symbol().type(d3.symbolCircle).size(size * sizeCamera))
        .attr("fill", colorComponent)
        .attr("transform", "translate(" + 0.7 * width / 2 + "," + (- 0.85 * height / 2) + ")");

    phone.append("rect")
        .attr("width", width * sizeWidthSpeaker)
        .attr("height", height * sizeHeightSpeaker)
        .attr("x", - width * sizeWidthSpeaker / 2)
        .attr("y", - 0.85 * height / 2 - height * sizeHeightSpeaker / 2)
        .attr("fill", colorComponent);
    phone.append("rect")
        .attr("width", width * sizeWidthButton)
        .attr("height", height * sizeHeightButton)
        .attr("x", - width * sizeWidthButton / 2)
        .attr("y", 0.85 * height / 2 - height * sizeHeightButton / 2)
        .attr("fill", colorComponent);

    return phone.node();

}

function createSymbol(proportionHeight, curveFactor) {
    var customSymbol = { 
        draw: function(context, size){
            let width = Math.sqrt(size / proportionHeight);
            let height = proportionHeight * width;

            console.log("Width: ", width);
            console.log("Height: ", height);

            context.moveTo(- curveFactor * width / 2, - height / 2);
            context.lineTo( curveFactor * width / 2, - height / 2);
            context.quadraticCurveTo( width / 2, - height / 2, width / 2, - curveFactor * height / 2);
            context.lineTo( width / 2, curveFactor * height / 2);
            context.quadraticCurveTo( width / 2, height / 2, curveFactor * width / 2, height / 2);
            context.lineTo(- curveFactor * width / 2, height / 2);
            context.quadraticCurveTo( - width / 2, height / 2, - width / 2, curveFactor * height / 2);
            context.lineTo(- width / 2, - curveFactor * height / 2);
            context.quadraticCurveTo( - width / 2, - height / 2, - curveFactor * width / 2, - height / 2);
            context.closePath();
        }
    }

    return customSymbol
}