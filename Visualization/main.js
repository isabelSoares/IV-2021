var fulldataset_models
var dataset_models
var fulldataset_brands

var dataset_brands
var brands_list
var selected_brands = []

var start_date = new Date(1992, 0, 1)
var end_date = new Date(2019, 0, 1)

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