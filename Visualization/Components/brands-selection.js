const MAX_BRANDS_SELECTED = 4;

var brand_selection_form
var brands_selection_svgs = {}

var brands_colors = [
    { "Color": "red", "Brand": undefined },
    { "Color": "yellow", "Brand": undefined },
    { "Color": "green", "Brand": undefined },
    { "Color": "orange", "Brand": undefined }
]

function build_brand_selection_form() {
    var top = d3.select("svg#brands_selection_top");
    var selected = d3.select("svg#selected_brands_svg");
    var unselected = d3.select("svg#unselected_brands_svg");
    
    var svg_width = parseInt(unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width * 0.6;
    const HEIGHT_BOX = 25;

    brands_selection_svgs = {
        "top": top,
        "selected": selected,
        "unselected": unselected
    }

    top.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Select Brands");
    
    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    var selected_g = selected.append("g").attr("id", "selected_brands");
    selected_g.selectAll("g")
        .data(selected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")  
                    .on("click", unselect_brand);
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", datum => getColorBrand(datum))
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text(datum => datum)
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");

    var unselected_g = unselected.append("g").attr("id", "unselected_brands");
    unselected_g.selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .on("click", select_brand);
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", "white")
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text(datum => datum);
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");
}

function select_brand(event, datum) {
    if (selected_brands.length >= MAX_BRANDS_SELECTED) return;
    selected_brands.push(datum);
    addBrandColor(datum);
    brandUpdateColor();

    var svg_width = parseInt(brands_selection_svgs.unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width * 0.6;
    const HEIGHT_BOX = 25;

    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    brands_selection_svgs.selected.select("#selected_brands")
        .selectAll("g")
        .data(selected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .on("click", unselect_brand);
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", datum => getColorBrand(datum))
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text(datum => datum)
                
                return g;
            } ,
            exit => exit.remove()
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");
        
    brands_selection_svgs.unselected.select("#unselected_brands")
        .selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(exit => exit.remove())
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");
}

function unselect_brand(event, datum) {
    const index = selected_brands.indexOf(datum);
    selected_brands.splice(index, 1);
    removeColorBrand(datum);
    brandUpdateColor();

    var svg_width = parseInt(brands_selection_svgs.unselected.style("width").slice(0, -2));
    const WIDTH_BOX = svg_width * 0.6;
    const HEIGHT_BOX = 25;
    
    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem));
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * HEIGHT_BOX);

    brands_selection_svgs.selected.select("#selected_brands")
        .selectAll("g")
        .data(selected_brands, datum => datum)
        .join(exit => exit.remove())
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");

    brands_selection_svgs.unselected.select("#unselected_brands")
        .selectAll("g")
        .data(unselected_brands, datum => datum)
        .join(
            function(enter) {
                let g = enter.append("g")
                    .on("click", select_brand);
                
                g.append("rect")
                    .attr("width", WIDTH_BOX)
                    .attr("height", HEIGHT_BOX)
                    .attr("fill", "white")
                    .style("stroke", "black")
                    .style("stroke-width", 1);
                
                g.append("text")
                    .attr("x", WIDTH_BOX / 2)
                    .attr("y", HEIGHT_BOX / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .text(datum => datum)
                
                return g;
            }
        )
        .attr("transform", (datum, index) => "translate(" + (svg_width - WIDTH_BOX) / 2 + "," + index * 25 + ")");
}

function addBrandColor(brand) {
    var available = brands_colors.filter(elem => elem['Brand'] == undefined);
    var color = available[Math.floor(Math.random() * available.length)]['Color'];

    brands_colors.find(elem => elem['Color'] == color)['Brand'] = brand;
}

function getColorBrand(brand) {
    return brands_colors.find(elem => elem['Brand'] == brand)['Color'];
}

function removeColorBrand(brand) {
    brands_colors.find(elem => elem['Brand'] == brand)['Brand'] = undefined;
}