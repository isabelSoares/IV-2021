var glyph_chart_svg
var glyph_chart_svg_zoomable
var dataset_glyph
var xScaleGlyph
var yScaleGlyph
var sizeScaleGlyphs
var sizeHoverScaleGlyphs
var saturationScaleGlyphs

var zoomGlyphs
var zoomLevel = 1

const proportionHeightPhone = 1.8

function build_glyph_chart() {
    glyph_chart_svg = d3.select("#glyph_chart");
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));
    
    glyph_chart_svg_zoomable = glyph_chart_svg.append("g")
        .attr("id", "zoomable_section")
        .attr("class", "zoomable");
    
    const margins = {top: 35, right: 100, bottom: 15, left: 100}

    glyph_chart_svg.append("text")
        .attr("x", "50%")
        .attr("y", "10%")
        .attr("class", "text_module_title text_center")
        .text("Models By Brand");

    treatDatasetGlyph();
    var numberModelsByBrand = d3.rollup(dataset_glyph, value => value.length, datum => datum['Brand']);

    yScaleGlyph = d3.scaleBand()
        .domain(selected_brands)
        .range([margins.top, svg_height - margins.bottom]);
    var stepY = yScaleGlyph.bandwidth();

    var maxModels = Math.max(...numberModelsByBrand.values());
    
    const maxArea = computeMaxArea(svg_width, svg_height, margins, maxModels, selected_brands.length);
    //const maxArea = ((svg_width - margins.left - margins.right) * (svg_height - margins.top - margins.bottom)) / (maxModels * selected_brands.length)
    console.log(maxArea);
    xScaleGlyph = d3.scalePoint()
        .domain(Array.from({length: Math.max(...numberModelsByBrand.values())}, (x, i) => i))
        .range([margins.left, svg_width - margins.right]);

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    sizeScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([0.02 * maxArea, 0.50 * maxArea]);
    sizeHoverScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([1, 0]);

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    saturationScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([0.3, 1]);

    var modelsByBrand = d3.group(dataset_glyph, datum => datum['Brand']);
    modelsByBrand = new Map([...modelsByBrand.entries()].sort(function(a, b) {
        const indexA = selected_brands.findIndex(elem => elem == a[0]);
        const indexB = selected_brands.findIndex(elem => elem == b[0]);
        //console.log("Index A: ", indexA);
        //console.log("Index B: ", indexB);

        return indexA - indexB;
    }));

    var phones = glyph_chart_svg_zoomable.append("g").attr("id", "allPhones");

    console.log("Models By Brand: ", modelsByBrand);

    var brandsLines = phones.selectAll("g.phoneByBrand")
        .data(modelsByBrand, datum => datum[0]).enter()
        .append("g").classed("phoneByBrand", true)
        .attr("id", datum => datum[0])
        .attr("transform", function(datum) {
            console.log("Translation: ", datum[0], (yScaleGlyph(datum[0]) + stepY / 2));
            return "translate(0," + (yScaleGlyph(datum[0]) + stepY / 2) + ")";
        })

    brandsLines.selectAll("g.mock_phone")
        .data(datum => datum[1], datum => datum['Model']).enter()
        .append(datum => createMockPhone(sizeScaleGlyphs(datum['battery_amps']), getColorGlyph(datum)))
        .attr("transform", (datum, index) => "translate(" + xScaleGlyph(index) + ",0)");

    zoomGlyphs = d3.zoom()
        .scaleExtent([1, 100])
        .translateExtent([[0, 0], [svg_width, svg_height]])
        .on("zoom", e => {
            glyph_chart_svg_zoomable.attr("transform", (transform = e.transform));
        });

    glyph_chart_svg.call(zoomGlyphs);
    glyph_chart_svg.append(() => createButtonsZoom());
}

function createMockPhone(size, color = 'darkgrey', colorComponent = 'white') {
    //console.log("Size: ", size);
    const screenRatio = 0.60
    const sizeCamera = 0.006
    const sizeWidthSpeaker = 0.4
    const sizeHeightSpeaker = 0.01
    const sizeWidthButton = 0.3
    const sizeHeightButton = 0.05

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


    phone.on("mouseenter", function(event, datum) {
        var element = d3.select(event.target);
        var currentTransformation = element.attr("transform");
        
        const showing_attributes = [
            {Name: 'Date Announced', image: 'Resources/year.png', attribute: datum['Date'].getFullYear(), units: undefined},
            {Name: 'Battery', image: 'Resources/battery.png', attribute: datum['battery_amps'], units: "Amps/h"},
            {Name: 'Internal Memory', image: 'Resources/internal-memory.png', attribute: datum['im_MB'], units:"MB"}
        ]

        var infoElement = element.append("g")
            .classed("phoneInfo", true)
            .selectAll("g.infoLine").data(showing_attributes).enter()
            .append("g").classed("infoLine", true)
            .attr("transform", (datum, index) => "translate(0," + (index - Math.floor(showing_attributes.length / 2)) * 0.20 * height + ")");
        infoElement.append("title")
            .text(datum => datum['Name']);

        const imageSide = 0.25 * width 
        infoElement.append("image")
            .attr("x", - 0.25 * width - imageSide / 2)
            .attr("y", - imageSide / 2)
            .attr("width", imageSide)
            .attr("height", imageSide)
            .attr("xlink:href", datum => datum['image']);
        
        infoElement.append("text")
            .classed("text_left", true)
            .attr("dominant-baseline", "middle")
            .attr("x", 0.35 * width)
            .attr("y", datum => (datum['units'] == undefined) ? 0 : - 0.03 * height)
            .text(datum => datum['attribute'])
        infoElement.append("text")
            .classed("text_left", true)
            .attr("dominant-baseline", "middle")
            .attr("x", 0.35 * width)
            .attr("y", + 0.03 * height)
            .text(datum => datum['units']);

        var currentTranslate = currentTransformation.split(" ").find(elem => elem.includes("translate"));
        element.attr("transform", currentTranslate + " scale(" + 3 + ")");
    });
    phone.on("mouseleave", function(event, datum) {
        var element = d3.select(event.target);
        var currentTransformation = element.attr("transform");
        element.select(".phoneInfo").remove();

        var currentTranslate = currentTransformation.split(" ").find(elem => elem.includes("translate"));
        element.attr("transform", currentTranslate);
    });

    return phone.node();

}

function createSymbol(proportionHeight, curveFactor) {
    var customSymbol = { 
        draw: function(context, size){
            let width = Math.sqrt(size / proportionHeight);
            let height = proportionHeight * width;

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

function treatDatasetGlyph() {
    // TODO: Not the way to deal with nulls on battery amps
    dataset_glyph = dataset_models.filter(elem => selected_brands.includes(elem['Brand']) && elem['battery_amps'] != null)

    console.log("Dataset Glyph: ", dataset_glyph);
}

function getColorGlyph(datum) {
    var color = d3.hsl(getColorBrand(datum['Brand']));
    color.s = saturationScaleGlyphs(datum['im_MB']);

    return color;
}

function updateGlyphChart() {
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));

    const margins = {top: 35, right: 100, bottom: 15, left: 100}

    treatDatasetGlyph();
    var numberModelsByBrand = d3.rollup(dataset_glyph, value => value.length, datum => datum['Brand']);

    yScaleGlyph.domain(selected_brands);
    var stepY = yScaleGlyph.bandwidth();

    var maxModels = Math.max(...numberModelsByBrand.values());
    const maxArea = computeMaxArea(svg_width, svg_height, margins, maxModels, selected_brands.length)
    xScaleGlyph.domain(Array.from({length: Math.max(...numberModelsByBrand.values())}, (x, i) => i));

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    sizeScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([0.02 * maxArea, 0.50 * maxArea]);
    sizeHoverScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())])

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    saturationScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())]);

    var modelsByBrand = d3.group(dataset_glyph, datum => datum['Brand']);
    modelsByBrand = new Map([...modelsByBrand.entries()].sort(function(a, b) {
        const indexA = selected_brands.findIndex(elem => elem == a[0]);
        const indexB = selected_brands.findIndex(elem => elem == b[0]);
        //console.log("Index A: ", indexA);
        //console.log("Index B: ", indexB);

        return indexA - indexB;
    }));

    var phones = glyph_chart_svg_zoomable.select("g#allPhones");

    var brandsLines = phones.selectAll("g.phoneByBrand")
        .data(modelsByBrand, datum => datum[0]);
            
    brandsLines.enter()
        .append("g").classed("phoneByBrand", true)
        .attr("id", datum => datum[0])
        .selectAll("g.mock_phone")
        .data(datum => datum[1], datum => datum['Model'])
        .append(datum => createMockPhone(datum['battery_amps'], getColorGlyph(datum)));
    brandsLines.exit().remove();

    brandsLines = phones.selectAll("g.phoneByBrand")
    brandsLines.attr("transform", function(datum) {
            console.log("Translation: ", datum[0], (yScaleGlyph(datum[0]) + stepY / 2));
            return "translate(0," + (yScaleGlyph(datum[0]) + stepY / 2) + ")";
        });

    // Remove and do them all ver again because of size Scale FIX
    brandsLines.selectAll("g.mock_phone").remove();
    brandsLines.selectAll("g.mock_phone")
        .data(datum => datum[1], datum => datum['Model']).enter()
        .append(datum => createMockPhone(sizeScaleGlyphs(datum['battery_amps']), getColorGlyph(datum)))
        .attr("transform", (datum, index) => "translate(" + xScaleGlyph(index) + ",0)");
}

function computeMaxArea(width, height, margins, max_models, number_brands) {
    var maxWidth = (width - margins.left - margins.right) / max_models;
    var maxHeight = (height - margins.top - margins.bottom) / number_brands;

    var accurateMaxHeight = Math.min(maxWidth * proportionHeightPhone, maxHeight);
    var accurateMaxWidth = accurateMaxHeight / proportionHeightPhone;

    return accurateMaxWidth * accurateMaxHeight;
}

function createButtonsZoom() {
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));
    const radius = 0.08 * svg_height;
    const imageSide = 0.08 * svg_height;
    const colorButton = d3.color("darkgrey")
    const colorHovered = d3.rgb(0, 76, 153)
    const buttonsInfo = [
        {x: - 0.04 * svg_width, y: 0, r: radius, color: colorButton, Name: "Zoom In", link: "Resources/zoom-in.png", link_hover: "Resources/zoom-in-white.png", action: zoomInAction},
        {x: + 0, y: 0, r: radius, color: colorButton, Name: "Zoom Out", link: "Resources/zoom-out.png", link_hover: "Resources/zoom-out-white.png", action: zoomOutAction},
        {x: + 0.04 * svg_width, y: 0, r: radius, color: colorButton, Name: "Back To Normal", link: "Resources/expand.png", link_hover: "Resources/expand-white.png", action: resetZoom},
    ]

    var buttonsGroup = d3.create("svg:g")
        .classed("zoom_buttons", true)
        .attr("transform", "translate(" + (0.935 * svg_width) + "," + (0.15 * svg_height) + ")");

    var buttons = buttonsGroup.selectAll("g.buttons")
        .data(buttonsInfo).enter()
        .append("g").classed("button", true)
        .on("click", (event, datum) => datum['action']())
        .on("mouseenter", function(event, datum) {
            var element = d3.select(event.target);
            element.select(".buttonCircle").attr("fill", colorHovered);
            element.select(".buttonImage").attr("xlink:href", datum['link_hover']);
        })
        .on("mouseleave", function(event, datum) {
            var element = d3.select(event.target);
            element.select(".buttonCircle").attr("fill", colorButton);
            element.select(".buttonImage").attr("xlink:href", datum['link']);
        });

    buttons.append("circle")
        .classed("buttonCircle", true)
        .attr("r", datum => datum['r'])
        .attr("fill", "darkgrey")
        .attr("cx", datum => datum['x'])
        .attr("cy", datum => datum['y']);

    buttons.append("image")
        .classed("buttonImage", true)
        .attr("x", datum => datum['x'] - imageSide / 2)
        .attr("y", datum => datum['y'] - imageSide / 2)
        .attr("width", datum => imageSide)
        .attr("height", datum => imageSide)
        .attr("xlink:href", datum => datum['link']);

    return buttonsGroup.node();
}

function zoomInAction() {
    zoomGlyphs.scaleBy(glyph_chart_svg.transition().duration(750), 2);
}
function zoomOutAction() {
    zoomGlyphs.scaleBy(glyph_chart_svg.transition().duration(750), 0.5);
}
function resetZoom() {
    glyph_chart_svg.transition().duration(750).call(zoomGlyphs.transform, d3.zoomIdentity.scale(1));
    zoomLevel = 1;
}