// Wait for the window to load
window.onload = function() {
    // Set up the SVG dimensions
    var width = 500;
    var height = 300;
    var margin = { top: 20, right: 30, bottom: 40, left: 40 };

    // Create the SVG container
    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load the data from the CSV file
    d3.csv("data.csv").then(function(data) {
        // Parse the data
        data.forEach(function(d) {
            d.wombats = +d.wombats;
        });

        // Set up the x scale
        var x = d3.scaleBand()
                  .domain(data.map(function(d, i) { return i; }))
                  .range([0, width])
                  .padding(0.1);

        // Set up the y scale
        var y = d3.scaleLinear()
                  .domain([0, d3.max(data, function(d) { return d.wombats; })])
                  .nice()
                  .range([height, 0]);

        // Add the bars
        svg.selectAll(".bar")
           .data(data)
           .enter()
           .append("rect")
           .attr("class", "bar")
           .attr("x", function(d, i) { return x(i); })
           .attr("y", function(d) { return y(d.wombats); })
           .attr("width", x.bandwidth())
           .attr("height", function(d) { return height - y(d.wombats); })
           .attr("fill", function(d) {
               return d.wombats > 10 ? "red" : "green"; // Conditional fill color
           });

        // Add the x Axis
        svg.append("g")
           .attr("class", "x-axis")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x).tickFormat(function(d, i) { return i + 1; }));

        // Add the y Axis
        svg.append("g")
           .attr("class", "y-axis")
           .call(d3.axisLeft(y));
    });
};
