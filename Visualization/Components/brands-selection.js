function build_brand_selection_form() {
    function update(object) {
        var target = object.target;
        // console.log(target.value);
        if (target.checked) selected_brands.push(target.value);
        else selected_brands = selected_brands.filter(elem => elem != target.value)

        // console.log(selected_brands);
    }

    var top = d3.select("svg#brands_selection_top");
    var selected = d3.select("svg#selected_brands_svg");
    var unselected = d3.select("svg#unselected_brands_svg");

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
    
    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem))
    selected.attr("height", selected_brands.length * 25);
    unselected.attr("height", unselected_brands.length * 25);

    selected.append("g")
        .selectAll("text")
        .data(selected_brands, datum => datum)
        .join(
            enter => enter.append("text")
                .attr("x", "50%")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(datum => datum)
                .on("click", unselect_brand),
            exit => exit.remove()
        )  
        .attr("y", (datum, index) => 12.5 + index * 25);

    unselected.append("g")
        .selectAll("text")
        .data(unselected_brands, datum => datum)
        .join(
            enter => enter.append("text")
                .attr("x", "50%")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(datum => datum)
                .on("click", select_brand),
            exit => exit.remove()
        )
        .attr("y", (datum, index) => 12.5 + index * 25);
}

function select_brand(event, datum) {
    if (selected_brands.length >= MAX_BRANDS_SELECTED) return;
    selected_brands.push(datum);

    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem))
    brands_selection_svgs.selected.attr("height", selected_brands.length * 25);
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * 25);

    brands_selection_svgs.selected.select("g")
        .selectAll("text")
        .data(selected_brands, datum => datum)
        .join(
            enter => enter.append("text")
                .attr("x", "50%")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(datum => datum)
                .on("click", unselect_brand),
            exit => exit.remove()
        )  
        .attr("y", (datum, index) => 12.5 + index * 25);
    
    brands_selection_svgs.unselected.select("g")
        .selectAll("text")
        .data(unselected_brands, datum => datum)
        .join( exit => exit.remove() )
        .attr("y", (datum, index) => 12.5 + index * 25);
}

function unselect_brand(event, datum) {
    const index = selected_brands.indexOf(datum);
    selected_brands.splice(index, 1);

    var unselected_brands = brands_list.filter(elem => !selected_brands.includes(elem))
    brands_selection_svgs.selected.attr("height", selected_brands.length * 25);
    brands_selection_svgs.unselected.attr("height", unselected_brands.length * 25);

    brands_selection_svgs.selected.select("g")
        .selectAll("text")
        .data(selected_brands, datum => datum)
        .join( exit => exit.remove() )  
        .attr("y", (datum, index) => 12.5 + index * 25);

        brands_selection_svgs.unselected.select("g")
        .selectAll("text")
        .data(unselected_brands, datum => datum)
        .join(
            enter => enter.append("text")
                .attr("x", "50%")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(datum => datum)
                .on("click", select_brand)
        )
        .attr("y", (datum, index) => 12.5 + index * 25);
}