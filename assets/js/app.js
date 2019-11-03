//set  dimensions
var svgWidth = 960;
var svgHeight = 660;

//set  borders
var chartMargin = {
    top: 30,
    right: 30,
    bottom: 150,
    left: 100
};

//calculate chart height and width
var width = svgWidth - chartMargin.right - chartMargin.left;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

//append a div classed chart to the scatter element
var chart = d3.select("#scatter")
    .append("div")
    .classed("chart", true);

//append an svg element to the chart with appropriate height and width

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//append an svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);


//Parameters
var poverty = "poverty";
var healthcare = "healthcare";

//function used for updating x-scale var upon clicking on axis label
function xScale(censusData, poverty) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[poverty]) * 0.8,
        d3.max(censusData, d => d[poverty]) * 1.2])
        .range([0, width]);

    return xLinearScale;
}

//function used for updating y-scale var upon clicking on axis label
function yScale(censusData, healthcare) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[healthcare]) * 0.8,
        d3.max(censusData, d => d[healthcare]) * 1.2])
        .range([height, 0]);

    return yLinearScale;
}

//function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function used for updating circles group with a transition to new circles
//for change in x axis or y axis
function renderCircles(circlesGroup, newXScale, poverty, newYScale, healthcare) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[poverty]))
        .attr("cy", data => newYScale(data[healthcare]));

    return circlesGroup;
}

//function used for updating state labels with a transition to new
function renderText(textGroup, newXScale, poverty, newYScale, healthcare) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[poverty]))
        .attr("y", d => newYScale(d[healthcare]));

    return textGroup;
}
//function to stylize x-axis values for tooltips
function styleX(value, poverty) {

    //stylize based on variable chosen
    //poverty percentage
    if (poverty === 'poverty') {
        return `${value}%`;
    }
    //household income in dollars
    else if (poverty === 'income') {
        return `$${value}`;
    }
    //age (number)
    else {
        return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(poverty, healthcare, circlesGroup) {

    //select x label
    //poverty percentage
    if (poverty === 'poverty') {
        var xLabel = "Poverty:";
    }
    //household income in dollars
    else if (poverty === 'income') {
        var xLabel = "Median Income:";
    }
    //age (number)
    else {
        var xLabel = "Age:";
    }

    //select y label
    //percentage lacking healthcare
    if (healthcare === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    //percentage obese
    else if (healthcare === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking percentage
    else {
        var yLabel = "Smokers:"
    }

    //create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[poverty], poverty)}<br>${yLabel} ${d[healthcare]}%`);
        });

    circlesGroup.call(toolTip);

    //add events
    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

//retrieve csv data and execute everything below
d3.csv("./assets/data/data.csv").then(function (censusData) {

    console.log(censusData);

    //parse data
    censusData.forEach(function (data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create first linear scales
    var xLinearScale = xScale(censusData, poverty);
    var yLinearScale = yScale(censusData, healthcare);

    //create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[poverty]))
        .attr("cy", d => yLinearScale(d[healthcare]))
        .attr("r", 12)
        .attr("opacity", ".5");

    //append initial text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[poverty]))
        .attr("y", d => yLinearScale(d[healthcare]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function (d) { return d.abbr });

    //create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + chartMargin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

    //create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - chartMargin.left / 4}, ${(height / 2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obese (%)");

    //updateToolTip function with data
    var circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

    //x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            //get value of selection
            var value = d3.select(this).attr("value");

            //check if value is same as current axis
            if (value != poverty) {

                //replace chosenXAxis with value
                poverty = value;

                //update x scale for new data
                xLinearScale = xScale(censusData, poverty);

                //update x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);

                //update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, poverty, yLinearScale, healthcare);

                //update text with new x values
                textGroup = renderText(textGroup, xLinearScale, poverty, yLinearScale, healthcare);

                //update tooltips with new info
                circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

                //change classes to change bold text
                if (poverty === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                }
                else if (poverty === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                }
                else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    //y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            //get value of selection
            var value = d3.select(this).attr("value");

            //check if value is same as current axis
            if (value != healthcare) {

                //replace chosenYAxis with value
                healthcare = value;

                //update y scale for new data
                yLinearScale = yScale(censusData, healthcare);

                //update x axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);

                //update circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, poverty, yLinearScale, healthcare);

                //update text with new y values
                textGroup = renderText(textGroup, xLinearScale, poverty, yLinearScale, healthcare)

                //update tooltips with new info
                circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

                //change classes to change bold text
                if (healthcare === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                }
                else if (healthcare === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                }
                else {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                }
            }
        });




});

