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
var maxZoom = 100
var maxAreaPhoneGlyph

const proportionHeightPhone = 1.8
const minSaturationGlyphs = 0.3
const maxSaturationGlyphs = 1
const maxZoomLevelMinimum = 1.5
const maxZoomLevelMaxArea = 8000

function build_glyph_chart() {
    glyph_chart_svg = d3.select("#glyph_chart");
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));
    
    glyph_chart_svg_zoomable = glyph_chart_svg.append("g")
        .attr("id", "zoomable_section")
        .attr("class", "zoomable");
    
    const margins = {top: 35, right: 100, bottom: 15, left: 100}

    treatDatasetGlyph();
    var numberModelsByBrand = d3.rollup(dataset_glyph, value => value.length, datum => datum['Brand']);

    yScaleGlyph = d3.scaleBand()
        .domain(selected_brands)
        .range([margins.top, svg_height - margins.bottom]);
    var stepY = yScaleGlyph.bandwidth();

    var maxModels = Math.max(...numberModelsByBrand.values());
    
    maxAreaPhoneGlyph = computeMaxArea(svg_width, svg_height, margins, maxModels, selected_brands.length);
    xScaleGlyph = d3.scalePoint()
        .domain(Array.from({length: Math.max(...numberModelsByBrand.values())}, (x, i) => i))
        .range([margins.left, svg_width - margins.right]);

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    sizeScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([0.02 * maxAreaPhoneGlyph, 0.50 * maxAreaPhoneGlyph]);
    sizeHoverScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([1, 0]);

    var minimums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    saturationScaleGlyphs = d3.scaleLinear()
        .domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([minSaturationGlyphs, maxSaturationGlyphs]);

    var modelsByBrand = d3.group(dataset_glyph, datum => datum['Brand']);
    modelsByBrand = new Map([...modelsByBrand.entries()].sort(function(a, b) {
        const indexA = selected_brands.findIndex(elem => elem == a[0]);
        const indexB = selected_brands.findIndex(elem => elem == b[0]);
        // console.log("Index A: ", indexA);
        // console.log("Index B: ", indexB);

        return indexA - indexB;
    }));

    var phones = glyph_chart_svg_zoomable.append("g").attr("id", "allPhones");

    // console.log("Models By Brand: ", modelsByBrand);

    var brandsLines = phones.selectAll("g.phoneByBrand")
        .data(modelsByBrand, datum => datum[0]).enter()
        .append("g").classed("phoneByBrand", true)
        .attr("id", datum => datum[0])
        .attr("transform", function(datum) {
            // console.log("Translation: ", datum[0], (yScaleGlyph(datum[0]) + stepY / 2));
            return "translate(0," + (yScaleGlyph(datum[0]) + stepY / 2) + ")";
        })

    brandsLines.selectAll("g.mock_phone")
        .data(datum => datum[1], datum => datum['Model']).enter()
        .append(datum => createMockPhone(sizeScaleGlyphs(datum['battery_amps']), getColorGlyph(datum)))
        .attr("transform", (datum, index) => "translate(" + xScaleGlyph(index) + ",0)");

    maxZoom = (maxZoomLevelMinimum - 1) + maxZoomLevelMaxArea / maxAreaPhoneGlyph;
    zoomGlyphs = d3.zoom()
        .scaleExtent([1, maxZoom])
        .translateExtent([[0, 0], [svg_width, svg_height]])
        .on("zoom", e => {
            zoomLevel = e.transform.k;
            glyph_chart_svg.select("text#zoomLevel").text(Math.round(zoomLevel * 100) / 100 + "x");
            glyph_chart_svg.selectAll(".zoom_buttons .button").classed("inactive", datum => !datum['hover_if']())
            glyph_chart_svg_zoomable.attr("transform", (transform = e.transform));

            updateResetButton();
        });

    glyph_chart_svg.call(zoomGlyphs);
    glyph_chart_svg.append(() => createButtonsZoom());
    glyph_chart_svg.append(() => createButtonHelp());
    createTooltipGlyphChart();

    glyph_chart_svg.append("text")
        .classed("text_left bold", true)
        .attr("id", "zoomLevel")
        .attr("dominant-baseline", "middle")
        .attr("x", 0.91 * svg_width)
        .attr("y", 0.15 * svg_height)
        .text(Math.round(zoomLevel * 100) / 100 + "x")
}

function createMockPhone(size, color = 'darkgrey', colorComponent = 'white', interactive = true) {
    // console.log("Size: ", size);
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

    const phoneInfoFontSizeConstant = 0.0033;

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


    if (! interactive) return phone.node();
    phone.on("mouseenter", function(event, datum) {
        var element = d3.select(event.target);
        element.raise();
        d3.select(element.node().parentNode).raise();

        var currentTransformation = element.attr("transform");
        
        const showing_attributes = [
            {Name: 'Date Announced', image: 'Resources/year.png', attribute: datum['Date'].getFullYear(), units: undefined},
            {Name: 'Battery', image: 'Resources/battery.png', attribute: datum['battery_amps'], units: "Amps/h"},
            {Name: 'Internal Memory', image: 'Resources/internal-memory.png', attribute: datum['im_MB'], units:"MB"}
        ]

        showing_attributes.forEach(function(elem) {
            if (elem['attribute'] == null) {
                elem['attribute'] = "No Data";
                elem['units'] = undefined;
            } 
        })

        var infoElement = element.append("g")
            .classed("phoneInfo", true);

        infoElement.append("text").classed("modelTitle text_center bold", true)
            .attr("x", 0)
            .attr("y", - 0.30 * height)
            .text(datum['Model'].replace("_", ""))
            .append("title")
            .text("Model");

        var infoElements = infoElement.selectAll("g.infoLine").data(showing_attributes).enter()
            .append("g").classed("infoLine", true)
            .attr("transform", (datum, index) => "translate(0," + (index - Math.floor(showing_attributes.length / 2)) * 0.20 * height + ")");
        infoElements.append("title")
            .text(datum => datum['Name']);

        const imageSide = 0.25 * width 
        infoElements.append("image")
            .attr("x", - 0.25 * width - imageSide / 2)
            .attr("y", - imageSide / 2)
            .attr("width", imageSide)
            .attr("height", imageSide)
            .attr("xlink:href", datum => datum['image']);
        
        infoElements.append("text")
            .classed("text_left", true)
            .attr("dominant-baseline", "middle")
            .attr("x", 0.35 * width)
            .attr("y", datum => (datum['units'] == undefined) ? 0 : - 0.03 * height)
            .text(datum => datum['attribute'])
        infoElements.append("text")
            .classed("text_left", true)
            .attr("dominant-baseline", "middle")
            .attr("x", 0.35 * width)
            .attr("y", + 0.03 * height)
            .text(datum => datum['units']);

        var currentTranslate = currentTransformation.split(" ").find(elem => elem.includes("translate"));
        var size = sizeScaleGlyphs(datum['battery_amps']);
        var scaleFactor = 1.75 * Math.sqrt(maxAreaPhoneGlyph / size);
        element.attr("transform", currentTranslate + " scale(" + scaleFactor + ")");
        element.selectAll("text").attr("font-size", (phoneInfoFontSizeConstant * Math.sqrt(size)) + "em");
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
    
    if (selectedAxis != undefined)
        dataset_glyph = dataset_glyph.filter(elem => elem[selectedAxis['attribute']] == 1);

    // console.log("Dataset Glyph: ", dataset_glyph);
}

function getColorGlyph(datum) {
    if (datum['im_MB'] == null) return undefined;

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
    maxAreaPhoneGlyph = computeMaxArea(svg_width, svg_height, margins, maxModels, selected_brands.length)
    xScaleGlyph.domain(Array.from({length: Math.max(...numberModelsByBrand.values())}, (x, i) => i));

    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    sizeScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())])
        .range([0.02 * maxAreaPhoneGlyph, 0.50 * maxAreaPhoneGlyph]);
    sizeHoverScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())])

    var minimums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    saturationScaleGlyphs.domain([Math.min(...minimums.values()), Math.max(...maximums.values())]);

    var modelsByBrand = d3.group(dataset_glyph, datum => datum['Brand']);
    modelsByBrand = new Map([...modelsByBrand.entries()].sort(function(a, b) {
        const indexA = selected_brands.findIndex(elem => elem == a[0]);
        const indexB = selected_brands.findIndex(elem => elem == b[0]);
        // console.log("Index A: ", indexA);
        // console.log("Index B: ", indexB);

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
            // console.log("Translation: ", datum[0], (yScaleGlyph(datum[0]) + stepY / 2));
            return "translate(0," + (yScaleGlyph(datum[0]) + stepY / 2) + ")";
        });

    // Remove and do them all ver again because of size Scale FIX
    brandsLines.selectAll("g.mock_phone").remove();
    brandsLines.selectAll("g.mock_phone")
        .data(datum => datum[1], datum => datum['Model']).enter()
        .append(datum => createMockPhone(sizeScaleGlyphs(datum['battery_amps']), getColorGlyph(datum)))
        .attr("transform", (datum, index) => "translate(" + xScaleGlyph(index) + ",0)");

    maxZoom = (maxZoomLevelMinimum - 1) + maxZoomLevelMaxArea / maxAreaPhoneGlyph;
    resetZoom();
    zoomGlyphs = d3.zoom()
        .scaleExtent([1, maxZoom])
        .translateExtent([[0, 0], [svg_width, svg_height]])
        .on("zoom", e => {
            zoomLevel = e.transform.k;
            glyph_chart_svg.select("text#zoomLevel").text(Math.round(zoomLevel * 100) / 100 + "x");
            glyph_chart_svg.selectAll(".zoom_buttons .button").classed("inactive", datum => !datum['hover_if']())
            glyph_chart_svg_zoomable.attr("transform", (transform = e.transform));

            updateResetButton();
        });
    glyph_chart_svg.call(zoomGlyphs);
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
    const buttonsInfo = [
        {x: + 0, Name: "Zoom In", link: "Resources/zoom-in.png", link_hover: "Resources/zoom-in-white.png", action: zoomInAction, hover_if: () => zoomLevel != maxZoom},
        {x: + 0.04 * svg_width, Name: "Zoom Out", link: "Resources/zoom-out.png", link_hover: "Resources/zoom-out-white.png", action: zoomOutAction, hover_if: () => zoomLevel != 1},
        //{x: + 0.04 * svg_width, Name: "Back To Normal", link: "Resources/expand.png", link_hover: "Resources/expand-white.png", action: resetZoom, hover_if: () => zoomLevel != 1},
    ]

    var buttonsGroup = d3.create("svg:g")
        .classed("zoom_buttons", true)
        .attr("transform", "translate(" + (0.935 * svg_width) + "," + (0.15 * svg_height) + ")");

    var buttons = buttonsGroup.selectAll("g.buttons")
        .data(buttonsInfo).enter()
        .append("g").classed("button", true)
        .classed("inactive", datum => !datum['hover_if']())
        .on("click", function(event, datum) {
            if (!datum['hover_if']()) return;
            datum['action']();

            var element = d3.select(this);
            if (!datum['hover_if']()) {
                element.classed("hover", false);
                element.select(".buttonImage").attr("xlink:href", datum['link']);
            }
        })
        .on("mouseenter", function(event, datum) {
            if (! datum['hover_if']()) return;
            var element = d3.select(this);
            element.classed("hover", true);
            element.select(".buttonImage").attr("xlink:href", datum['link_hover']);
        })
        .on("mouseleave", function(event, datum) {
            var element = d3.select(this);
            element.classed("hover", false);
            element.select(".buttonImage").attr("xlink:href", datum['link']);
        });

    buttons.append("circle")
        .classed("buttonCircle", true)
        .attr("r", radius)
        .attr("cx", datum => datum['x'])
        .attr("cy", 0);

    buttons.append("image")
        .classed("buttonImage", true)
        .attr("x", datum => datum['x'] - imageSide / 2)
        .attr("y", 0 - imageSide / 2)
        .attr("width", imageSide)
        .attr("height", imageSide)
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
}

function createButtonHelp() {
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));
    const radius = 0.08 * svg_height;
    const imageSide = 0.1 * svg_height;

    var buttonsGroup = d3.create("svg:g")
        .classed("help", true)
        .attr("transform", "translate(" + ((0.935 + 0.04) * svg_width) + "," + (0.85 * svg_height) + ")");

    var button = buttonsGroup.append("g").classed("button", true)
        .on("mouseenter", function(event) {
            d3.select("#tooltip_glyph_chart").classed("hidden", false);
            updateGlyphChartTooltip();

            var element = d3.select(event.target);
            element.classed("hover", true);
            element.select(".buttonImage").attr("xlink:href", "Resources/information-white.png");
        })
        .on("mouseleave", function(event) {
            d3.select("#tooltip_glyph_chart").classed("hidden", true);
            var element = d3.select(event.target);
            element.classed("hover", false);
            element.select(".buttonImage").attr("xlink:href", "Resources/information.png");
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
        .attr("xlink:href", "Resources/information.png");

    return buttonsGroup.node();
}

function createTooltipGlyphChart() {
    var svg_width = parseInt(glyph_chart_svg.style("width").slice(0, -2));
    var svg_height = parseInt(glyph_chart_svg.style("height").slice(0, -2));
    const width_tooltip = 0.50 * svg_width;
    const height_tooltip = 0.75 * svg_height;
    const imageSide = 0.1 * svg_height;
    const margins = {top: 0.3 * height_tooltip, right: 0.05 * width_tooltip, bottom: 0.3 * height_tooltip, left: 0.05 * width_tooltip };
    const stepY = 0.2 * svg_height;
    
    var selectedColor = d3.color(brands_colors[Math.floor(Math.random() * brands_colors.length)]['Color']);

    // INTERNAL MEMORY
    const lineHeight = 0.03 * height_tooltip;
    const lineWidth = 0.35 * width_tooltip;

    var startColor = d3.hsl(selectedColor);
    startColor.s = minSaturationGlyphs;
    var endColor = d3.hsl(selectedColor);
    endColor.s = maxSaturationGlyphs;
    var defs = glyph_chart_svg.append("defs");
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linearGradientGlyphs")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    linearGradient.append("stop")
        .attr("id", "startColor")
        .attr("offset", 0)
        .attr("stop-color", startColor);
    linearGradient.append("stop")
        .attr("id", "endColor")
        .attr("offset", 1)
        .attr("stop-color", endColor);
    
    var minimums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    var internalMemoryElement = d3.create("svg:g")
        .attr("id", "internal_memory_info")
        .attr("transform", "translate(" + (0.8 * width_tooltip) + "," + (0.05 * height_tooltip) + ")");
    internalMemoryElement.append("text")
        .classed("text_right minimum", true)
        .attr("x", - lineWidth / 2)
        .attr("y", lineHeight)
        .text(Math.min(...minimums.values()) + " MB");
    internalMemoryElement.append("text")
        .classed("text_left maximum", true)
        .attr("x", lineWidth / 2)
        .attr("y", lineHeight)
        .text(Math.max(...maximums.values()) + " MB");
    internalMemoryElement.append("rect")
        .attr("x", - lineWidth / 2)
        .attr("y", - 2 * lineHeight)
        .attr("width", lineWidth)
        .attr("height", lineHeight)
        .style("fill", "url(#linearGradientGlyphs)");


    // BATTERY AMPS
    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var batteryElement = d3.create("svg:g")
        .attr("id", "battery_amps_info")
        .attr("transform", "translate(" + (0.8 * width_tooltip) + "," + (0.05 * height_tooltip) + ")");
    batteryElement.append("text")
        .classed("text_right minimum", true)
        .attr("x", - lineWidth / 2)
        .attr("y", 0.1 * svg_height)
        .text(Math.min(...minimums.values()) + " Amps/h");
    
    // Placeholder Value
    var size = 1000;
    var width_phone = Math.sqrt(size / proportionHeightPhone);
    var height_phone = proportionHeightPhone * width_phone;
    batteryElement.append(() => createMockPhone(size, selectedColor, undefined, false))
        .attr("transform", "translate(" + (- 0.38 * lineWidth + width_phone) + ",0)");
    batteryElement.append("text")
        .classed("text_left maximum", true)
        .attr("x", lineWidth / 2)
        .attr("y", 0.1 * svg_height)
        .text(Math.max(...maximums.values()) + " Amps/h");
    // Placeholder Value
    var size = 2000;
    var width_phone = Math.sqrt(size / proportionHeightPhone);
    var height_phone = proportionHeightPhone * width_phone;
    batteryElement.append(() => createMockPhone(size, selectedColor, undefined, false))
        .attr("transform", "translate(" + (0.38 * lineWidth) + "," + (- height_phone / 2) + ")");

    const linesInfo = [
        {attribute: "Announced Year", encoded: "horizontal positioning", image: "Resources/year.png", element: undefined},
        {attribute: "Battery", encoded: "size", image: "Resources/battery.png", element: batteryElement.node()},
        {attribute: "Internal Memory", encoded: "color saturation", image: "Resources/internal-memory.png", element: internalMemoryElement.node()},
    ]

    var buttonHelp = glyph_chart_svg.select(".help");
    var left = buttonHelp.node().getBoundingClientRect().x;
    var top = buttonHelp.node().getBoundingClientRect().y;

    var mockInformation = {'Date': new Date(0, 0, 1), 'Models': 0};
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip hidden")
        .attr("id", "tooltip_glyph_chart")
        .style("top", top - height_tooltip + 0.05 * svg_height).style("left", left - width_tooltip - 0.05 * width_tooltip)
        .append("svg").datum(mockInformation)
        .attr("width", width_tooltip)
        .attr("height", height_tooltip);

    tooltip.append("text")
        .attr("x", "50%")
        .attr("y", "10%")
        .attr("class", "text_module_title text_center")
        .text("Help - Modules By Brand");

    var lines = tooltip.selectAll("g.tooltip_line")
        .data(linesInfo).enter()
        .append("g").classed("tooltip_line", true)
        .attr("transform", (datum, index) => "translate(0," + (margins.top + (index * stepY)) + ")");
    lines.append("image")
        .attr("x", - imageSide / 2 + margins.left)
        .attr("y", - imageSide / 2)
        .attr("width", imageSide)
        .attr("height", imageSide)
        .attr("xlink:href", datum => datum['image']);
    var textLines = lines.append("text")
        .classed("text_right", true)
        .attr("x", margins.left + 0.05 * width_tooltip)
        .attr("dominant-baseline", "middle");
    textLines.append("tspan")
        .attr("y", 0)
        .attr("font-weight", "bold")
        .text(datum => datum['attribute']);
    textLines.append("tspan")
        .attr("y", 0)
        .text(" encoded through ");
    textLines.append("tspan")
        .attr("font-weight", "bold")
        .attr("y", 0)
        .text(datum => datum['encoded']);
    lines.each(function(datum, index) {
        if (datum['element'] == undefined) return;
        d3.select(this).append(() => datum['element']).classed("tooltip_element");
    });
}

function updateGlyphChartTooltip() {
    var tooltip = d3.select("#tooltip_glyph_chart");

    // INTERNAL MEMORY
    var minimums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.min(values, datum => datum['im_MB']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph.filter(elem => elem['im_MB'] != null), values => d3.max(values, datum => datum['im_MB']), datum => datum['Brand']);
    var internalMemoryElement = tooltip.select("#internal_memory_info");
    internalMemoryElement.select(".minimum").text(Math.min(...minimums.values()) + " MB");
    internalMemoryElement.select(".maximum").text(Math.max(...maximums.values()) + " MB");

    // BATTERY AMPS
    var minimums = d3.rollup(dataset_glyph, values => d3.min(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var maximums = d3.rollup(dataset_glyph, values => d3.max(values, datum => datum['battery_amps']), datum => datum['Brand']);
    var batteryElement = tooltip.select("#battery_amps_info");
    batteryElement.select(".minimum").text(Math.min(...minimums.values()) + " Amps/h");
    batteryElement.select(".maximum").text(Math.max(...maximums.values()) + " Amps/h");
}