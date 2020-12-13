var fulldataset_models
var dataset_models
var fulldataset_brands

var dispatch = d3.dispatch("clickBrandLine",
    "changed_time_period", "changed_spiral_period",
    "selectBrand", "unselectBrand",
    "hover_brand", "hover_remove_brand",
    "hover_spiral_chart", "hover_remove_spiral_chart");

var dataset_brands
var brands_list
var closeToBrand = undefined
var selected_brands = ["OnePlus", "Mitac"]

var start_date = new Date(1992, 0, 1)
var end_date = new Date(2017, 0, 1)

const DatasetDir = "../Datasets/"

function init() {
    d3.dsv(";", DatasetDir + "Brands_Parsed.csv").then(function (data) {
        data.forEach(function(element) {
            if (element['Year'] == 'null') element['Year'] = null;
            else element['Year'] = parseInt(element['Year'])

            element['# Models'] = parseInt(element['# Models'])
            
            if (element['Sales'] == 'null') element['Sales'] = 0;
            else element['Sales'] = parseInt(element['Sales'])

            computeDateBrands(element);
        });

        fulldataset_brands = data;
        brands_list = fulldataset_brands.map(elem => elem['Brand'])
            .filter((value, index, self) => self.indexOf(value) === index);
        
        d3.dsv(";", DatasetDir + "Models_Parsed.csv").then(function (data) {
            data.forEach(element => {
                if (element['year'] == 'null') element['year'] = null;
                else element['year'] = parseInt(element['year'])
                if (element['quarter'] == 'null') element['quarter'] = null;
                else element['quarter'] = parseInt(element['quarter'])
                if (element['month_id'] == 'null') element['month_id'] = null;
                else element['month_id'] = parseInt(element['month_id'])
                
                if (element['battery_amps'] == 'null') element['battery_amps'] = null;
                else element['battery_amps'] = parseFloat(element['battery_amps']);
                if (element['im_MB'] == 'null') element['im_MB'] = null;
                else element['im_MB'] = parseFloat(element['im_MB']);
                if (element['ram_MB'] == 'null') element['ram_MB'] = null;
                else element['ram_MB'] = parseFloat(element['ram_MB']);
                if (element['primary_camera_MP'] == 'null') element['primary_camera_MP'] = null;
                else element['primary_camera_MP'] = parseFloat(element['primary_camera_MP']);
                if (element['aspect_ratio'] == 'null') element['aspect_ratio'] = null;
                else element['aspect_ratio'] = parseFloat(element['aspect_ratio']);
                if (element['screen_body_ratio'] == 'null') element['screen_body_ratio'] = null;
                else element['screen_body_ratio'] = parseFloat(element['screen_body_ratio']);
                
                if (element['sensor_accelerometer'] == 'Y') element['sensor_accelerometer'] = 1;
                else element['sensor_accelerometer'] = 0;
                if (element['sensor_fingerprint'] == 'Y') element['sensor_fingerprint'] = 1;
                else element['sensor_fingerprint'] = 0;
                if (element['sensor_heart_rate'] == 'Y') element['sensor_heart_rate'] = 1;
                else element['sensor_heart_rate'] = 0;
                if (element['sensor_iris_scanner'] == 'Y') element['sensor_iris_scanner'] = 1;
                else element['sensor_iris_scanner'] = 0;
                if (element['sensor_proximity'] == 'Y') element['sensor_proximity'] = 1;
                else element['sensor_proximity'] = 0;
                if (element['sensor_temperature'] == 'Y') element['sensor_temperature'] = 1;
                else element['sensor_temperature'] = 0;
                
                if (element['Bluetooth'] == 'Y') element['Bluetooth'] = 1;
                else element['Bluetooth'] = 0;
                if (element['Audio_jack'] == 'Y') element['Audio_jack'] = 1;
                else element['Audio_jack'] = 0;
                if (element['GPS'] == 'Y') element['GPS'] = 1;
                else element['GPS'] = 0;
                if (element['Radio'] == 'Y') element['Radio'] = 1;
                else element['Radio'] = 0;
                if (element['battery_removable'] == 'Y') element['battery_removable'] = 1;
                else element['battery_removable'] = 0;
                
                computeDateModel(element);
            });

            fulldataset_models = data;
            dataset_models = fulldataset_models;

            console.log("Brands: ", fulldataset_brands);
            console.log("Models: ", fulldataset_models);

            filterDatasets();

            // console.log("Start Date: ", start_date);
            // console.log("End Date: ", end_date);

            build_time_selection_svg();
            build_brand_selection_form();
            build_line_charts();
            build_spiral_chart();
            build_parallel_coordinates_chart();
            build_small_multiples();
            build_glyph_chart();
            
            prepareEvents();
            
        });
    });
}

function filterDatasets() {
    dataset_brands = fulldataset_brands.filter(function(elem) {
        return (elem['Date'] >= start_date &&
            elem['Date'] <= end_date) 
    });

    dataset_models = fulldataset_models.filter(function(elem) {
        return (elem['Date'] >= start_date &&
            elem['Date'] <= end_date) 
    });
}

function computeDateBrands(element) {
    var year = element['Year'];
    if (year == null) element['Date'] = undefined;
    else element['Date'] = new Date(year, 0, 1);
}

function computeDateModel(element) {
    var year = element['year'];
    var quarter = element['quarter'];
    var month = element['month_id'];

    if (month == undefined && quarter == undefined) month = 1;
    if (month == undefined && quarter != undefined) month = (quarter - 1) * 4;

    if (year == null) element['Date'] = undefined;
    else element['Date'] = new Date(year, month - 1, 1);
}

function prepareEvents() {
    /* --------------- CHANGED TIME PERIOD ------------------ */
    dispatch.on("changed_time_period", function() {
        filterDatasets();
        updateLineCharts();
        updateParallelLineChart();
        updateSpiralChart();
        updateSmallMultiplesChart();
        updateGlyphChart();
    });

    /* --------------- CHANGED SPIRAL PERIOD ------------------ */
    dispatch.on("changed_spiral_period", function() {
        updateSpiralChart();
    });

    /* --------------- CLICKED LINE OF BRAND ------------------ */
    dispatch.on("clickBrandLine", function() {
        if (closeToBrand == undefined) return;

        if (selected_brands.includes(closeToBrand)) {
            const index = selected_brands.indexOf(closeToBrand);
            selected_brands.splice(index, 1);
            removeColorBrand(closeToBrand);
            brandUpdateColor(closeToBrand);
            brandUpdateColorParallelCoordinates(closeToBrand);
            brandUpdateColorSmallMultiples(closeToBrand);

            update_brand_selection_unselected_brand();
            updateSpiralChart();
            updateGlyphChart();
        } else {
            if (selected_brands.length >= MAX_BRANDS_SELECTED) return;

            selected_brands.push(closeToBrand);
            addBrandColor(closeToBrand);
            brandUpdateColor(closeToBrand);
            brandUpdateColorParallelCoordinates(closeToBrand);
            brandUpdateColorSmallMultiples(closeToBrand);

            update_brand_selection_selected_brand();
            updateSpiralChart();
            updateGlyphChart();
        }
    });

    /* --------------- SELECTION OF BRAND ------------------ */
    dispatch.on("selectBrand", function(brand) {
        if (selected_brands.length >= MAX_BRANDS_SELECTED) return;
        selected_brands.push(brand);
        addBrandColor(brand);
        brandUpdateColor(brand);
        brandUpdateColorParallelCoordinates(brand);
        brandUpdateColorSmallMultiples(brand);

        update_brand_selection_selected_brand();
        updateSpiralChart();
        updateGlyphChart();
    });

    /* --------------- UNSELECTION OF BRAND ------------------ */
    dispatch.on("unselectBrand", function(brand) {
        const index = selected_brands.indexOf(brand);
        selected_brands.splice(index, 1);
        removeColorBrand(brand);
        brandUpdateColor(brand);
        brandUpdateColorParallelCoordinates(brand);
        brandUpdateColorSmallMultiples(brand);

        update_brand_selection_unselected_brand();
        updateSpiralChart();
        updateGlyphChart();
    });

    /* --------------- HOVER POINT OF BRAND ------------------ */
    dispatch.on("hover_brand", function(event, line_chart, brand) {
        highlight_line(brand);
        highlight_lineParallelCoordinates(brand);
        highlightSmallMultiples(brand);
        showAxisValue(brand);
        
        if (line_chart != undefined) {
            var information = show_circle(event, line_chart, brand);
            show_tooltip_line_chart(event, line_chart, information);
        }
    });
    
    dispatch.on("hover_remove_brand", function(brand) {
        remove_highlight_line(brand);
        remove_highlight_lineParallelCoordinateaChart(brand);
        remove_highlight_lineSmallMultiples(brand);
        hideAxisValue();

        remove_circle();
        remove_tooltip_line_chart();
    });

    /* ------------- HOVER SPIRAL CHART ------------------- */
    dispatch.on("hover_spiral_chart", function(event, datum) {
        var target = d3.select(event.target);
        target.style("stroke", "black")
            .style("stroke-width", 2);

        show_tooltip_spiral_chart(event, datum);
        
        var startRegionDate = new Date(datum['Date']);
        var endRegionDate = new Date(datum['Date']);

        if (selected_period_months['by'] == 'month')
            endRegionDate = new Date(endRegionDate.setMonth(endRegionDate.getMonth() + 1));
        else if (selected_period_months['by'] == 'quarter')
            endRegionDate = new Date(endRegionDate.setMonth(endRegionDate.getMonth() + 3));
        else if (selected_period_months['by'] == 'semester')
            endRegionDate = new Date(endRegionDate.setMonth(endRegionDate.getMonth() + 6));

        show_region_interval_line_chart(startRegionDate, endRegionDate);
    });

    dispatch.on("hover_remove_spiral_chart", function(event, datum) {
        var target = d3.select(event.target);
        target.style("stroke", "none")
            .style("stroke-width", 0);

        remove_tooltip_spiral_chart();
        remove_region_line_chart();
    });
}
